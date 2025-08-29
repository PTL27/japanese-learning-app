import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  console.log('🚀 SocketProvider rendering...');
  
  const { user } = useAuth();
  console.log('📋 SocketProvider - useAuth result:', { 
    user: user ? `${user.name} (${user.id})` : 'null',
    hasUser: !!user 
  });
  
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const isInitializing = useRef(false);
  const socketRef = useRef(null); // Keep reference to prevent multiple connections
  const currentUserId = useRef(null); // Track current user ID

  useEffect(() => {
    console.log('👤 SocketContext useEffect triggered. User:', user ? `${user.name} (${user.id})` : 'null');
    
    // Prevent multiple simultaneous initializations
    if (isInitializing.current) {
      console.log('⏳ Socket initialization already in progress, skipping...');
      return;
    }
    
    // Check if we already have a valid connection for this same user
    if (user && currentUserId.current === user.id && socketRef.current && socketRef.current.connected) {
      console.log('🔄 Socket already connected for same user, reusing existing connection');
      if (socket !== socketRef.current) {
        setSocket(socketRef.current);
        setIsConnected(true);
      }
      return;
    }
    
    // Cleanup any existing socket first
    if (socketRef.current) {
      console.log('🧹 Cleaning up existing socket connection');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setOnlineUsers(new Map());
    }
    
    if (user) {
      isInitializing.current = true;
      currentUserId.current = user.id; // Track current user ID
      
      // Initialize socket connection
      const token = localStorage.getItem('jwt_token');
      console.log('🔐 Initializing Socket.io with token:', token ? token.substring(0, 20) + '...' : 'none');
      
      if (!token) {
        console.warn('⚠️ No JWT token found, cannot initialize socket');
        return;
      }

      // Test token validity first
      console.log('🧪 Testing JWT token validity...');
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);
        const isExpired = payload.exp < now;
        console.log('🔍 Token payload:', {
          userId: payload.id,
          username: payload.name,
          exp: new Date(payload.exp * 1000).toISOString(),
          isExpired: isExpired,
          timeToExpiry: payload.exp - now
        });
        
        if (isExpired) {
          console.error('❌ JWT token has expired! Need to re-authenticate');
          return;
        }
      } catch (tokenError) {
        console.error('❌ Invalid JWT token format:', tokenError);
        return;
      }

      console.log('🔗 Creating Socket.io connection to http://localhost:5001');
      console.log('🔗 Connection options:', {
        url: 'http://localhost:5001',
        auth: { token: token ? token.substring(0, 20) + '...' : 'none' },
        autoConnect: true,
        transports: ['websocket', 'polling'],
        forceNew: true
      });
      
      const newSocket = io('http://localhost:5001', {
        auth: { token },
        query: { token }, // Send token in query as fallback
        autoConnect: true,
        transports: ['polling'], // Use only polling for now
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 3,
        timeout: 15000,
        forceNew: false, // Don't force new connection if one exists
        upgrade: false // Disable upgrade to websocket for now
      });

      console.log('✅ Socket.io instance created:', {
        id: newSocket.id,
        connected: newSocket.connected,
        connecting: newSocket.connecting
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ Socket connected successfully! ID:', newSocket.id);
        console.log('🔗 Socket connection details:', {
          id: newSocket.id,
          connected: newSocket.connected,
          transport: newSocket.io.engine.transport.name
        });
        setIsConnected(true);
        isInitializing.current = false; // Mark initialization complete
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('🔌 Socket connection error:', error.message);
        console.error('🔌 Error type:', error.type);
        console.error('🔌 Error code:', error.code);
        console.error('🔌 Full error details:', error);
        console.error('🔌 Auth token being used:', token ? token.substring(0, 20) + '...' : 'none');
        setIsConnected(false);
        isInitializing.current = false; // Mark initialization failed
      });

      // Add more debug events
      newSocket.on('connecting', () => {
        console.log('🔄 Socket attempting to connect...');
      });

      newSocket.io.on('error', (error) => {
        console.error('🚨 Socket.io engine error:', error);
      });

      // Friend status updates
      newSocket.on('friend_status_change', ({ userId, status, timestamp }) => {
        console.log(`👤 Friend ${userId} is now ${status}`);
        setOnlineUsers(prev => {
          const updated = new Map(prev);
          if (status === 'online') {
            updated.set(userId, { status, timestamp });
          } else {
            updated.delete(userId);
          }
          return updated;
        });
      });

      // Error handling
      newSocket.on('error', (error) => {
        console.error('🚨 Socket error:', error);
      });

      setSocket(newSocket);
      socketRef.current = newSocket;

      // Cleanup on unmount
      return () => {
        console.log('🧹 Cleaning up socket connection');
        isInitializing.current = false;
        if (newSocket) {
          newSocket.disconnect();
        }
        if (socketRef.current === newSocket) {
          socketRef.current = null;
        }
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Map());
      };
    } else {
      console.log('👤 No user found, skipping Socket.io initialization');
      isInitializing.current = false;
      currentUserId.current = null;
      
      // Clean up when no user
      if (socketRef.current) {
        console.log('🧹 Cleaning up socket - no user');
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Map());
      }
    }
  }, [user]); // Remove socket from dependency to prevent infinite loop

  // Helper functions
  const emitEvent = (eventName, data) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    } else {
      console.warn('⚠️ Socket not connected, cannot emit:', eventName);
    }
  };

  const joinConversation = (conversationId) => {
    emitEvent('join_conversation', { conversationId });
  };

  const leaveConversation = (conversationId) => {
    emitEvent('leave_conversation', { conversationId });
  };

  const sendMessage = (conversationId, messageText, replyToMessageId = null) => {
    emitEvent('send_message', {
      conversationId,
      messageText,
      replyToMessageId
    });
  };

  const markMessagesAsRead = async (conversationId, messageIds) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:5001/api/chat/conversations/${conversationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageIds })
      });
      
      if (!response.ok) {
        console.error('Failed to mark messages as read');
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const startTyping = (conversationId) => {
    emitEvent('typing_start', { conversationId });
  };

  const stopTyping = (conversationId) => {
    emitEvent('typing_stop', { conversationId });
  };

  const isUserOnline = (userId) => {
    const isOnline = onlineUsers.has(userId);
    console.log(`🔍 isUserOnline(${userId}):`, isOnline, 'OnlineUsers size:', onlineUsers.size);
    
    // Temporary fallback: return true if Socket.io is connected (for testing)
    if (!isOnline && isConnected) {
      console.log(`🔄 Fallback: treating user ${userId} as online (Socket.io connected)`);
      return true;
    }
    
    return isOnline;
  };

  const getOnlineUsersCount = () => {
    return onlineUsers.size;
  };

  // Debug helper - globally accessible
  window.debugSocket = () => {
    console.log('🔍 Socket Debug Info:');
    console.log('- User:', user);
    console.log('- Socket:', socket);
    console.log('- Connected:', isConnected);
    console.log('- JWT Token:', localStorage.getItem('jwt_token') ? 'Present' : 'Missing');
    console.log('- Online Users:', onlineUsers);
    console.log('- Online Users Size:', onlineUsers.size);
    if (socket) {
      console.log('- Socket ID:', socket.id);
      console.log('- Socket connected:', socket.connected);
      console.log('- Socket connecting:', socket.connecting);
      console.log('- Socket transport:', socket.io?.engine?.transport?.name);
    }
  };

  // Manual connection test helper - globally accessible
  window.testSocketConnection = () => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('❌ No JWT token found in localStorage');
      return;
    }
    
    console.log('🧪 Testing manual Socket.io connection...');
    console.log('🔗 Token:', token.substring(0, 20) + '...');
    
    const testSocket = io('http://localhost:5001', {
      auth: { token },
      autoConnect: true,
      transports: ['websocket', 'polling'],
      reconnection: false, // Disable for cleaner testing
      timeout: 10000
    });

    testSocket.on('connect', () => {
      console.log('✅ Test connection successful! ID:', testSocket.id);
      testSocket.disconnect();
    });

    testSocket.on('connect_error', (error) => {
      console.error('❌ Test connection failed:', error.message);
      console.error('Full error:', error);
    });

    setTimeout(() => {
      if (!testSocket.connected) {
        console.log('⏰ Test connection timeout');
        testSocket.disconnect();
      }
    }, 10000);
  };

  const value = {
    socket,
    isConnected,
    onlineUsers: Array.from(onlineUsers.entries()).map(([userId, data]) => ({
      userId,
      ...data
    })),
    
    // Helper functions
    emitEvent,
    joinConversation,
    leaveConversation,
    sendMessage,
    markMessagesAsRead,
    startTyping,
    stopTyping,
    isUserOnline,
    getOnlineUsersCount,

    // Direct socket event listeners (for components)
    on: (eventName, callback) => {
      if (socket) {
        socket.on(eventName, callback);
        return () => socket.off(eventName, callback);
      }
      return () => {}; // Return empty function if no socket
    },

    off: (eventName, callback) => {
      if (socket) {
        socket.off(eventName, callback);
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;