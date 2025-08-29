const express = require('express');
const router = express.Router();
const { getQuery, allQuery, runQuery } = require('../database/database');
const { authenticateToken } = require('../middleware/auth');
const socketService = require('../services/socketService');
const notificationService = require('../services/notificationService');

// Get user's conversations
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const conversations = await allQuery(`
      SELECT DISTINCT
        c.id,
        c.type,
        c.name,
        c.created_by,
        c.created_at,
        c.updated_at,
        c.last_message_at,
        (
          SELECT COUNT(*) 
          FROM messages m 
          WHERE m.conversation_id = c.id 
            AND m.created_at > cp.last_read_at
            AND m.sender_id != ?
        ) as unread_count,
        (
          SELECT JSON_GROUP_ARRAY(
            JSON_OBJECT(
              'id', u.id,
              'name', u.name,
              'email', u.email,
              'is_online', CASE WHEN u.id = ? THEN 0 ELSE 0 END
            )
          )
          FROM conversation_participants cp2
          INNER JOIN users u ON cp2.user_id = u.id
          WHERE cp2.conversation_id = c.id AND cp2.is_active = 1
        ) as participants,
        (
          SELECT JSON_OBJECT(
            'id', m.id,
            'message_text', m.message_text,
            'message_type', m.message_type,
            'sender_id', m.sender_id,
            'sender_name', u.name,
            'created_at', m.created_at
          )
          FROM messages m
          INNER JOIN users u ON m.sender_id = u.id
          WHERE m.conversation_id = c.id
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as last_message
      FROM conversations c
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = ? AND cp.is_active = 1
      ORDER BY c.last_message_at DESC
      LIMIT ? OFFSET ?
    `, [userId, userId, userId, limit, offset]);
    
    // Parse JSON fields and add online status
    const processedConversations = conversations.map(conv => ({
      ...conv,
      participants: JSON.parse(conv.participants || '[]').map(p => ({
        ...p,
        is_online: p.id === userId ? false : socketService.isUserOnline(p.id)
      })),
      last_message: conv.last_message ? JSON.parse(conv.last_message) : null
    }));
    
    res.json({
      success: true,
      data: processedConversations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: processedConversations.length
      }
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Create or get conversation with friend
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const { participantIds, type = 'direct', name } = req.body;
    const userId = req.user.id;
    
    if (!participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({
        success: false,
        message: 'participantIds is required and must be an array'
      });
    }
    
    // Add current user to participants if not included
    const allParticipants = [...new Set([userId, ...participantIds])];
    
    if (type === 'direct' && allParticipants.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'Direct conversations must have exactly 2 participants'
      });
    }
    
    // For direct conversations, check if conversation already exists
    if (type === 'direct') {
      const existingConversation = await getQuery(`
        SELECT c.id, c.type, c.name, c.created_at, c.updated_at
        FROM conversations c
        WHERE c.type = 'direct' AND c.id IN (
          SELECT cp1.conversation_id
          FROM conversation_participants cp1
          WHERE cp1.user_id = ? AND cp1.is_active = 1
          INTERSECT
          SELECT cp2.conversation_id
          FROM conversation_participants cp2
          WHERE cp2.user_id = ? AND cp2.is_active = 1
        )
        AND c.id IN (
          SELECT conversation_id
          FROM conversation_participants
          WHERE is_active = 1
          GROUP BY conversation_id
          HAVING COUNT(*) = 2
        )
      `, [allParticipants[0], allParticipants[1]]);
      
      if (existingConversation) {
        return res.json({
          success: true,
          data: existingConversation,
          message: 'Existing conversation found'
        });
      }
    }
    
    // Verify all participants are friends with current user (except for group chats)
    if (type === 'direct') {
      const friendCheck = await getQuery(`
        SELECT COUNT(*) as count
        FROM friendships f
        WHERE ((f.requester_id = ? AND f.addressee_id = ?) OR 
               (f.requester_id = ? AND f.addressee_id = ?))
          AND f.status = 'accepted'
      `, [userId, participantIds[0], participantIds[0], userId]);
      
      if (friendCheck.count === 0) {
        return res.status(403).json({
          success: false,
          message: 'You can only start conversations with friends'
        });
      }
    }
    
    // Create new conversation
    const conversationResult = await runQuery(`
      INSERT INTO conversations (type, name, created_by)
      VALUES (?, ?, ?)
    `, [type, name, userId]);
    
    const conversationId = conversationResult.id;
    console.log('📝 Created conversation with ID:', conversationId, 'Result:', conversationResult);
    
    if (!conversationId) {
      console.error('❌ Failed to get conversation ID from insert result');
      return res.status(500).json({
        success: false,
        message: 'Failed to create conversation - no ID returned'
      });
    }
    
    // Add all participants
    for (const participantId of allParticipants) {
      console.log('👤 Adding participant:', participantId, 'to conversation:', conversationId);
      await runQuery(`
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (?, ?)
      `, [conversationId, participantId]);
    }
    
    // Get full conversation data
    const conversation = await getQuery(`
      SELECT 
        c.id,
        c.type,
        c.name,
        c.created_by,
        c.created_at,
        c.updated_at,
        JSON_GROUP_ARRAY(
          JSON_OBJECT(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'is_online', 0
          )
        ) as participants
      FROM conversations c
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
      INNER JOIN users u ON cp.user_id = u.id
      WHERE c.id = ? AND cp.is_active = 1
      GROUP BY c.id
    `, [conversationId]);
    
    // Parse participants and add online status
    conversation.participants = JSON.parse(conversation.participants || '[]').map(p => ({
      ...p,
      is_online: socketService.isUserOnline(p.id)
    }));
    
    // Emit new conversation to all participants
    allParticipants.forEach(participantId => {
      socketService.emitToUser(participantId, 'new_conversation', conversation);
    });
    
    res.json({
      success: true,
      data: conversation,
      message: 'Conversation created successfully'
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
});

// Get messages for a conversation
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;
    
    // Verify user is participant in conversation
    const participant = await getQuery(`
      SELECT id FROM conversation_participants 
      WHERE conversation_id = ? AND user_id = ? AND is_active = 1
    `, [conversationId, userId]);
    
    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }
    
    // Get messages
    const messages = await allQuery(`
      SELECT 
        m.id,
        m.conversation_id,
        m.sender_id,
        m.message_text,
        m.message_type,
        m.reply_to_message_id,
        m.is_edited,
        m.is_deleted,
        m.created_at,
        m.updated_at,
        u.name as sender_name,
        u.email as sender_email,
        (
          SELECT JSON_GROUP_ARRAY(
            JSON_OBJECT(
              'user_id', mrs.user_id,
              'user_name', u2.name,
              'read_at', mrs.read_at
            )
          )
          FROM message_read_status mrs
          INNER JOIN users u2 ON mrs.user_id = u2.id
          WHERE mrs.message_id = m.id
        ) as read_by,
        CASE 
          WHEN m.reply_to_message_id IS NOT NULL THEN
            JSON_OBJECT(
              'id', rm.id,
              'message_text', rm.message_text,
              'sender_name', ru.name,
              'created_at', rm.created_at
            )
          ELSE NULL
        END as reply_to_message
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      LEFT JOIN messages rm ON m.reply_to_message_id = rm.id
      LEFT JOIN users ru ON rm.sender_id = ru.id
      WHERE m.conversation_id = ? AND m.is_deleted = 0
      ORDER BY m.created_at DESC
      LIMIT ? OFFSET ?
    `, [conversationId, limit, offset]);
    
    // Process messages
    const processedMessages = messages.map(msg => ({
      ...msg,
      read_by: msg.read_by ? JSON.parse(msg.read_by) : [],
      reply_to_message: msg.reply_to_message ? JSON.parse(msg.reply_to_message) : null
    })).reverse(); // Reverse to show oldest first
    
    res.json({
      success: true,
      data: processedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        has_more: messages.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send message (HTTP endpoint - also handled by Socket.io)
router.post('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageText, messageType = 'text', replyToMessageId } = req.body;
    const userId = req.user.id;
    
    if (!messageText || messageText.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }
    
    // Verify user is participant in conversation
    const participant = await getQuery(`
      SELECT id FROM conversation_participants 
      WHERE conversation_id = ? AND user_id = ? AND is_active = 1
    `, [conversationId, userId]);
    
    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }
    
    // Insert message
    const result = await runQuery(`
      INSERT INTO messages (conversation_id, sender_id, message_text, message_type, reply_to_message_id)
      VALUES (?, ?, ?, ?, ?)
    `, [conversationId, userId, messageText.trim(), messageType, replyToMessageId || null]);
    
    // Update conversation last_message_at
    await runQuery(`
      UPDATE conversations 
      SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [conversationId]);
    
    // Get full message data
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
    `, [conversationId, userId]);

    // Create notifications for other participants
    for (const participant of participants) {
      try {
        await notificationService.notifyNewMessage(
          participant.user_id,
          userId,
          req.user.name,
          conversationId,
          messageText
        );
      } catch (notifError) {
        console.error(`Failed to send notification to user ${participant.user_id}:`, notifError);
      }
    }

    // Emit via Socket.io to all conversation participants
    socketService.emitToConversation(`conversation_${conversationId}`, 'new_message', {
      ...message,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: message,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Mark messages as read
router.put('/conversations/:conversationId/read', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { messageIds } = req.body;
    const userId = req.user.id;
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({
        success: false,
        message: 'messageIds is required and must be an array'
      });
    }
    
    // Verify user is participant in conversation
    const participant = await getQuery(`
      SELECT id FROM conversation_participants 
      WHERE conversation_id = ? AND user_id = ? AND is_active = 1
    `, [conversationId, userId]);
    
    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }
    
    // Mark messages as read
    for (const messageId of messageIds) {
      await runQuery(`
        INSERT OR IGNORE INTO message_read_status (message_id, user_id, read_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `, [messageId, userId]);
    }
    
    // Update participant's last_read_at
    await runQuery(`
      UPDATE conversation_participants 
      SET last_read_at = CURRENT_TIMESTAMP
      WHERE conversation_id = ? AND user_id = ?
    `, [conversationId, userId]);
    
    // Emit via Socket.io
    socketService.emitToConversation(`conversation_${conversationId}`, 'messages_read', {
      conversationId,
      messageIds,
      readBy: userId,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

// Get conversation details
router.get('/conversations/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Verify user is participant in conversation
    const participant = await getQuery(`
      SELECT id FROM conversation_participants 
      WHERE conversation_id = ? AND user_id = ? AND is_active = 1
    `, [conversationId, userId]);
    
    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this conversation'
      });
    }
    
    // Get conversation details with participants
    const conversation = await getQuery(`
      SELECT 
        c.id,
        c.type,
        c.name,
        c.created_by,
        c.created_at,
        c.updated_at,
        c.last_message_at,
        JSON_GROUP_ARRAY(
          JSON_OBJECT(
            'id', u.id,
            'name', u.name,
            'email', u.email,
            'joined_at', cp.joined_at,
            'last_read_at', cp.last_read_at,
            'is_online', 0
          )
        ) as participants
      FROM conversations c
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
      INNER JOIN users u ON cp.user_id = u.id
      WHERE c.id = ? AND cp.is_active = 1
      GROUP BY c.id
    `, [conversationId]);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found'
      });
    }
    
    // Parse participants and add online status
    conversation.participants = JSON.parse(conversation.participants).map(p => ({
      ...p,
      is_online: socketService.isUserOnline(p.id)
    }));
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversation'
    });
  }
});

// Health check for chat API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Chat API is working',
    timestamp: new Date().toISOString()
  });
});

// Test conversation creation (development only)
if (process.env.NODE_ENV === 'development') {
  router.post('/test-conversation', async (req, res) => {
    try {
      console.log('🧪 Testing conversation creation...');
      const userId = 7; // Use Luc Phan's ID
      const friendId = 3; // Use Phan Tue Minh's ID
      
      // Create new conversation
      const conversationResult = await runQuery(`
        INSERT INTO conversations (type, name, created_by)
        VALUES (?, ?, ?)
      `, ['direct', null, userId]);
      
      console.log('🔍 Full conversation result:', JSON.stringify(conversationResult, null, 2));
      const conversationId = conversationResult.id;
      console.log('📝 Created test conversation with ID:', conversationId);
      
      if (!conversationId) {
        console.error('❌ Failed to get conversation ID');
        console.error('❌ Available fields in result:', Object.keys(conversationResult || {}));
        return res.status(500).json({
          success: false,
          message: 'Failed to create conversation - no ID returned',
          debug: conversationResult
        });
      }
      
      // Add participants
      await runQuery(`
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (?, ?)
      `, [conversationId, userId]);
      
      await runQuery(`
        INSERT INTO conversation_participants (conversation_id, user_id)
        VALUES (?, ?)
      `, [conversationId, friendId]);
      
      console.log('👤 Added participants to conversation');
      
      res.json({
        success: true,
        message: 'Test conversation created successfully',
        conversationId: conversationId
      });
      
    } catch (error) {
      console.error('Error in test conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Test failed: ' + error.message
      });
    }
  });
}

// Get online users (friends)
router.get('/online-friends', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const friends = await allQuery(`
      SELECT DISTINCT
        CASE 
          WHEN f.requester_id = ? THEN f.addressee_id 
          ELSE f.requester_id 
        END as friend_id,
        u.name,
        u.email
      FROM friendships f
      INNER JOIN users u ON (
        CASE 
          WHEN f.requester_id = ? THEN f.addressee_id 
          ELSE f.requester_id 
        END = u.id
      )
      WHERE (f.requester_id = ? OR f.addressee_id = ?) 
        AND f.status = 'accepted'
    `, [userId, userId, userId, userId]);
    
    const onlineFriends = friends
      .map(friend => ({
        ...friend,
        id: friend.friend_id,
        is_online: socketService.isUserOnline(friend.friend_id)
      }))
      .filter(friend => friend.is_online);
    
    res.json({
      success: true,
      data: onlineFriends,
      total_friends: friends.length,
      online_count: onlineFriends.length
    });
  } catch (error) {
    console.error('Error fetching online friends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch online friends'
    });
  }
});

module.exports = router;