const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { getQuery, runQuery, allQuery } = require('../database/database');

class SocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> Set of socketIds
    this.userSockets = new Map(); // socketId -> userId
    this.userConversations = new Map(); // userId -> Set of conversationIds (to prevent duplicate joins)
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          'http://localhost:3000',
          'http://localhost:3001', 
          'http://localhost:3002',
          process.env.FRONTEND_URL
        ].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    console.log('✅ Socket.io server initialized');
  }

  setupMiddleware() {
    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        console.log('🔍 Socket connection attempt from:', socket.handshake.address);
        console.log('🔍 Socket handshake headers:', JSON.stringify(socket.handshake.headers, null, 2));
        console.log('🔍 Socket handshake auth:', JSON.stringify(socket.handshake.auth, null, 2));
        console.log('🔍 Socket handshake query:', JSON.stringify(socket.handshake.query, null, 2));
        
        const token = socket.handshake.auth.token || 
                     socket.handshake.query.token ||
                     socket.handshake.headers.authorization?.replace('Bearer ', '');
        console.log('🔐 Socket auth attempt:', { 
          hasToken: !!token, 
          tokenPreview: token ? token.substring(0, 20) + '...' : 'none',
          socketId: socket.id,
          authKeys: Object.keys(socket.handshake.auth),
          queryKeys: Object.keys(socket.handshake.query),
          headerKeys: Object.keys(socket.handshake.headers)
        });
        
        if (!token) {
          console.log('❌ Socket auth failed: No token provided');
          console.log('🔍 Available auth methods:', {
            'auth.token': socket.handshake.auth.token,
            'headers.authorization': socket.handshake.headers.authorization,
            'query.token': socket.handshake.query.token
          });
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
        
        // Handle both old and new token formats
        const userId = decoded.id || decoded.userId;
        console.log('🔍 JWT decoded successfully:', { 
          id: decoded.id, 
          userId: decoded.userId, 
          name: decoded.name, 
          email: decoded.email,
          finalUserId: userId
        });
        
        const user = await getQuery('SELECT id, name, email FROM users WHERE id = ?', [userId]);
        console.log('🔍 Database query result:', user ? 'User found' : 'User NOT found');
        
        if (!user) {
          console.log('❌ Socket auth failed: User not found for ID:', userId);
          console.log('💡 This usually means the JWT token is valid but the user was deleted from database');
          console.log('💡 User should log in again to get a fresh token');
          return next(new Error('Authentication error: User not found'));
        }

        socket.userId = user.id;
        socket.user = user;
        console.log('✅ Socket auth success:', user.name, `(${user.id})`);
        next();
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`✅ User connected: ${socket.user.name} (${socket.user.id}) - Socket: ${socket.id}`);
      
      // Add user to connected users map
      if (!this.connectedUsers.has(socket.userId)) {
        this.connectedUsers.set(socket.userId, new Set());
      }
      this.connectedUsers.get(socket.userId).add(socket.id);
      this.userSockets.set(socket.id, socket.userId);

      // Join user to their personal room
      socket.join(`user_${socket.userId}`);

      // Load user's conversations and join their rooms
      this.joinUserConversations(socket);

      // Emit user online status to friends
      this.emitUserStatusToFriends(socket.userId, 'online');

      // Handle chat events
      this.handleChatEvents(socket);

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log(`❌ User disconnected: ${socket.user.name} (${socket.user.id}) - Socket: ${socket.id}`);
        
        // Remove from connected users
        if (this.connectedUsers.has(socket.userId)) {
          this.connectedUsers.get(socket.userId).delete(socket.id);
          if (this.connectedUsers.get(socket.userId).size === 0) {
            this.connectedUsers.delete(socket.userId);
            // Clear conversation tracking when user completely disconnects
            this.userConversations.delete(socket.userId);
            // User is completely offline
            this.emitUserStatusToFriends(socket.userId, 'offline');
          }
        }
        this.userSockets.delete(socket.id);
      });
    });
  }

  async joinUserConversations(socket) {
    try {
      const conversations = await allQuery(`
        SELECT c.id, c.type, c.name
        FROM conversations c
        INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
        WHERE cp.user_id = ? AND cp.is_active = 1
      `, [socket.userId]);

      // Track which conversations this user has joined to prevent duplicates
      if (!this.userConversations.has(socket.userId)) {
        this.userConversations.set(socket.userId, new Set());
      }
      const userConvs = this.userConversations.get(socket.userId);

      conversations.forEach(conv => {
        const roomName = `conversation_${conv.id}`;
        
        // Only join if not already joined
        if (!userConvs.has(conv.id)) {
          socket.join(roomName);
          userConvs.add(conv.id);
          console.log(`📱 User ${socket.userId} joined conversation ${conv.id}`);
        } else {
          console.log(`⚠️ User ${socket.userId} already in conversation ${conv.id}, skipping join`);
        }
      });

      console.log(`📱 User ${socket.userId} joined ${conversations.length} conversation rooms`);
    } catch (error) {
      console.error('Error joining user conversations:', error);
    }
  }

  async emitUserStatusToFriends(userId, status) {
    try {
      const friends = await allQuery(`
        SELECT DISTINCT 
          CASE 
            WHEN f.requester_id = ? THEN f.addressee_id 
            ELSE f.requester_id 
          END as friend_id
        FROM friendships f
        WHERE (f.requester_id = ? OR f.addressee_id = ?) 
          AND f.status = 'accepted'
      `, [userId, userId, userId]);

      friends.forEach(friend => {
        this.io.to(`user_${friend.friend_id}`).emit('friend_status_change', {
          userId: userId,
          status: status,
          timestamp: new Date().toISOString()
        });
      });
    } catch (error) {
      console.error('Error emitting user status to friends:', error);
    }
  }

  handleChatEvents(socket) {
    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, messageText, replyToMessageId } = data;
        
        // Verify user is participant in conversation
        const participant = await getQuery(`
          SELECT id FROM conversation_participants 
          WHERE conversation_id = ? AND user_id = ? AND is_active = 1
        `, [conversationId, socket.userId]);

        if (!participant) {
          socket.emit('error', { message: 'You are not a participant in this conversation' });
          return;
        }

        // Insert message
        const result = await runQuery(`
          INSERT INTO messages (conversation_id, sender_id, message_text, reply_to_message_id)
          VALUES (?, ?, ?, ?)
        `, [conversationId, socket.userId, messageText, replyToMessageId || null]);

        // Update conversation last_message_at
        await runQuery(`
          UPDATE conversations 
          SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [conversationId]);

        // Get full message data with sender info
        const message = await getQuery(`
          SELECT 
            m.id,
            m.conversation_id,
            m.sender_id,
            m.message_text,
            m.message_type,
            m.reply_to_message_id,
            m.created_at,
            u.name as sender_name,
            u.email as sender_email
          FROM messages m
          INNER JOIN users u ON m.sender_id = u.id
          WHERE m.id = ?
        `, [result.id]);

        // Get conversation participants for notifications
        const participants = await allQuery(`
          SELECT cp.user_id, u.name 
          FROM conversation_participants cp
          INNER JOIN users u ON cp.user_id = u.id
          WHERE cp.conversation_id = ? AND cp.is_active = 1 AND cp.user_id != ?
        `, [conversationId, socket.userId]);

        // Create notifications for other participants
        const notificationService = require('./notificationService');
        for (const participant of participants) {
          try {
            await notificationService.notifyNewMessage(
              participant.user_id,
              socket.userId,
              socket.user.name,
              conversationId,
              messageText
            );
          } catch (notifError) {
            console.error(`Failed to send notification to user ${participant.user_id}:`, notifError);
          }
        }

        // Emit to all participants in the conversation
        const roomName = `conversation_${conversationId}`;
        console.log(`📡 Emitting new_message to room: ${roomName}`);
        console.log(`📊 Room members:`, this.io.sockets.adapter.rooms.get(roomName)?.size || 0);
        
        this.io.to(roomName).emit('new_message', {
          ...message,
          timestamp: new Date().toISOString()
        });

        console.log(`💬 Message sent in conversation ${conversationId} by user ${socket.userId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Join conversation
    socket.on('join_conversation', async (data) => {
      try {
        const { conversationId } = data;
        
        // Verify user is participant
        const participant = await getQuery(`
          SELECT id FROM conversation_participants 
          WHERE conversation_id = ? AND user_id = ? AND is_active = 1
        `, [conversationId, socket.userId]);

        if (participant) {
          socket.join(`conversation_${conversationId}`);
          socket.emit('conversation_joined', { conversationId });
          console.log(`📱 User ${socket.userId} joined conversation ${conversationId}`);
        } else {
          socket.emit('error', { message: 'Access denied to conversation' });
        }
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Leave conversation
    socket.on('leave_conversation', (data) => {
      const { conversationId } = data;
      socket.leave(`conversation_${conversationId}`);
      socket.emit('conversation_left', { conversationId });
      console.log(`📱 User ${socket.userId} left conversation ${conversationId}`);
    });

    // Mark messages as read
    socket.on('mark_messages_read', async (data) => {
      try {
        const { conversationId, messageIds } = data;
        
        // Verify user is participant
        const participant = await getQuery(`
          SELECT id FROM conversation_participants 
          WHERE conversation_id = ? AND user_id = ? AND is_active = 1
        `, [conversationId, socket.userId]);

        if (!participant) {
          socket.emit('error', { message: 'Access denied to conversation' });
          return;
        }

        // Mark messages as read
        for (const messageId of messageIds) {
          await runQuery(`
            INSERT OR IGNORE INTO message_read_status (message_id, user_id, read_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
          `, [messageId, socket.userId]);
        }

        // Update last_read_at for participant
        await runQuery(`
          UPDATE conversation_participants 
          SET last_read_at = CURRENT_TIMESTAMP
          WHERE conversation_id = ? AND user_id = ?
        `, [conversationId, socket.userId]);

        // Emit read status to conversation participants
        this.io.to(`conversation_${conversationId}`).emit('messages_read', {
          conversationId,
          messageIds,
          readBy: socket.userId,
          timestamp: new Date().toISOString()
        });

        console.log(`📖 User ${socket.userId} marked ${messageIds.length} messages as read`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing_start', {
        conversationId,
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('typing_stop', (data) => {
      const { conversationId } = data;
      socket.to(`conversation_${conversationId}`).emit('user_typing_stop', {
        conversationId,
        userId: socket.userId
      });
    });
  }

  // Helper method to emit to specific user
  emitToUser(userId, event, data) {
    const roomName = `user_${userId}`;
    const roomSize = this.io.sockets.adapter.rooms.get(roomName)?.size || 0;
    console.log(`📡 Emitting '${event}' to user ${userId} (${roomSize} connections in room)`);
    this.io.to(roomName).emit(event, data);
  }

  // Helper method to emit to conversation
  emitToConversation(conversationId, event, data) {
    this.io.to(`conversation_${conversationId}`).emit(event, data);
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  // Check if user is online
  isUserOnline(userId) {
    return this.connectedUsers.has(userId);
  }

  // Get connected users info (for debugging)
  getConnectedUsersInfo() {
    const info = {};
    this.connectedUsers.forEach((socketIds, userId) => {
      info[userId] = {
        socketCount: socketIds.size,
        sockets: Array.from(socketIds)
      };
    });
    return info;
  }
}

module.exports = new SocketService();