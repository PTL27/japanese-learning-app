import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, 
  Send, 
  Plus, 
  Users, 
  Search, 
  MoreHorizontal,
  Phone,
  Video,
  Paperclip,
  Smile,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import Dialog from './common/Dialog';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, isConnected, joinConversation, leaveConversation, sendMessage, markMessagesAsRead, startTyping, stopTyping, isUserOnline } = useSocket();
  
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [friends, setFriends] = useState([]);
  const [dialog, setDialog] = useState({ isOpen: false, type: 'info', title: '', message: '', onConfirm: null });
  
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetchConversations();
    fetchFriends();
  }, []);

  useEffect(() => {
    if (socket && isConnected) {
      // Listen for new messages
      const handleNewMessage = (message) => {
        console.log('📨 New message received:', message);
        console.log('📨 Current selectedConversation:', selectedConversation?.id);
        console.log('📨 Current messages count:', messages.length);
        
        // Add to messages if it's for current conversation
        if (selectedConversation && message.conversation_id === selectedConversation.id) {
          setMessages(prev => {
            // Remove any optimistic message from current user with similar content
            const filteredMessages = message.sender_id === user.id 
              ? prev.filter(msg => 
                  !(msg.is_optimistic && msg.message_text === message.message_text)
                ) 
              : prev;
            
            // Check if this message already exists (prevent duplicates)
            const messageExists = filteredMessages.some(msg => msg.id === message.id);
            if (messageExists) {
              return filteredMessages;
            }
            
            return [...filteredMessages, message];
          });
          
          scrollToBottom();
          
          // Mark as read automatically if user is viewing the conversation and it's not their own message
          if (message.sender_id !== user.id) {
            markMessagesAsRead(message.conversation_id, [message.id]);
          }
        }
        
        // Update conversation's last message
        setConversations(prev => 
          prev.map(conv => 
            conv.id === message.conversation_id
              ? { 
                  ...conv, 
                  last_message: message,
                  unread_count: conv.id === selectedConversation?.id ? 0 : conv.unread_count + 1
                }
              : conv
          )
        );
      };

      // Listen for typing indicators
      const handleTypingStart = ({ conversationId, userId, userName }) => {
        if (selectedConversation && conversationId === selectedConversation.id && userId !== user.id) {
          setTypingUsers(prev => new Set([...prev, { userId, userName }]));
        }
      };

      const handleTypingStop = ({ conversationId, userId }) => {
        if (selectedConversation && conversationId === selectedConversation.id) {
          setTypingUsers(prev => {
            const updated = new Set([...prev].filter(u => u.userId !== userId));
            return updated;
          });
        }
      };

      // Listen for read receipts
      const handleMessagesRead = ({ conversationId, messageIds, readBy }) => {
        if (selectedConversation && conversationId === selectedConversation.id) {
          setMessages(prev => 
            prev.map(msg => 
              messageIds.includes(msg.id) 
                ? { 
                    ...msg, 
                    read_by: [...(msg.read_by || []), { user_id: readBy, read_at: new Date().toISOString() }]
                  }
                : msg
            )
          );
        }
      };

      // Add event listeners
      socket.on('new_message', handleNewMessage);
      socket.on('user_typing_start', handleTypingStart);
      socket.on('user_typing_stop', handleTypingStop);
      socket.on('messages_read', handleMessagesRead);

      // Cleanup function
      return () => {
        if (socket) {
          socket.off('new_message', handleNewMessage);
          socket.off('user_typing_start', handleTypingStart);
          socket.off('user_typing_stop', handleTypingStop);
          socket.off('messages_read', handleMessagesRead);
        }
      };
    }
  }, [socket, isConnected, selectedConversation, user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji picker and more options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
      if (showMoreOptions && !event.target.closest('.more-options-container')) {
        setShowMoreOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker, showMoreOptions]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('http://localhost:5001/api/chat/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('http://localhost:5001/api/friends', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setFriends(data.data);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch(`http://localhost:5001/api/chat/conversations/${conversationId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        
        // Mark all messages as read
        const unreadMessages = data.data.filter(msg => 
          msg.sender_id !== user.id && 
          !msg.read_by?.some(r => r.user_id === user.id)
        );
        
        if (unreadMessages.length > 0) {
          markMessagesAsRead(conversationId, unreadMessages.map(m => m.id));
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const selectConversation = async (conversation) => {
    // Leave previous conversation
    if (selectedConversation) {
      leaveConversation(selectedConversation.id);
    }
    
    setSelectedConversation(conversation);
    setMessages([]);
    setTypingUsers(new Set());
    
    // Join new conversation
    joinConversation(conversation.id);
    
    // Fetch messages
    await fetchMessages(conversation.id);
    
    // Mark conversation notifications as read
    try {
      const token = localStorage.getItem('jwt_token');
      await fetch(`http://localhost:5001/api/notifications/conversation/${conversation.id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error marking conversation notifications as read:', error);
    }
    
    // Update unread count
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unread_count: 0 }
          : conv
      )
    );
  };

  const handleSendMessage = async () => {
    console.log('🚀 handleSendMessage called:', { newMessage: newMessage.trim(), selectedConversation: selectedConversation?.id, sendingMessage });
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;
    
    setSendingMessage(true);
    const messageText = newMessage.trim();
    setNewMessage('');
    
    // Stop typing indicator
    stopTyping(selectedConversation.id);
    
    // Optimistically add message to UI for instant feedback
    const optimisticMessage = {
      id: Date.now(), // Temporary ID
      conversation_id: selectedConversation.id,
      sender_id: user.id,
      sender_name: user.name,
      message_text: messageText,
      message_type: 'text',
      created_at: new Date().toISOString(),
      is_optimistic: true // Flag to identify optimistic messages
    };
    
    console.log('📝 Adding optimistic message:', optimisticMessage);
    setMessages(prev => {
      console.log('📝 Previous messages count:', prev.length);
      const newMessages = [...prev, optimisticMessage];
      console.log('📝 New messages count:', newMessages.length);
      return newMessages;
    });
    scrollToBottom();
    
    try {
      // Try Socket.io first for real-time delivery
      if (socket && isConnected) {
        console.log('📤 Sending message via Socket.io:', messageText);
        sendMessage(selectedConversation.id, messageText);
        
        // Set timeout to remove optimistic message if no response in 10 seconds
        setTimeout(() => {
          setMessages(prev => {
            const hasRealMessage = prev.some(msg => 
              msg.conversation_id === optimisticMessage.conversation_id &&
              msg.message_text === optimisticMessage.message_text &&
              msg.sender_id === optimisticMessage.sender_id &&
              !msg.is_optimistic
            );
            
            if (!hasRealMessage) {
              console.warn('⏰ Removing stale optimistic message after 10s timeout');
              return prev.filter(msg => msg.id !== optimisticMessage.id);
            }
            return prev;
          });
        }, 10000);
      } else {
        // Fallback to HTTP API if Socket.io is not available
        console.log('🔄 Socket.io not available, using HTTP API fallback. Socket:', !!socket, 'Connected:', isConnected);
        const token = localStorage.getItem('jwt_token');
        const response = await fetch(`http://localhost:5001/api/chat/conversations/${selectedConversation.id}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messageText })
        });
        
        const data = await response.json();
        if (!data.success) {
          throw new Error(data.message);
        }
        
        // Replace optimistic message with real message from HTTP response
        setMessages(prev => 
          prev.map(msg => 
            msg.id === optimisticMessage.id ? { ...data.data, sender_name: user.name } : msg
          )
        );
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể gửi tin nhắn',
        onConfirm: null
      });
      
      // Restore message text on error
      setNewMessage(messageText);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (selectedConversation) {
      // Send typing indicator
      startTyping(selectedConversation.id);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedConversation.id);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewConversation = async (friendId) => {
    try {
      const token = localStorage.getItem('jwt_token');
      const response = await fetch('http://localhost:5001/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participantIds: [friendId],
          type: 'direct'
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Add to conversations list if it's new
        const existingConv = conversations.find(c => c.id === data.data.id);
        if (!existingConv) {
          setConversations(prev => [data.data, ...prev]);
        }
        
        // Select the conversation
        selectConversation(data.data);
        setShowNewConversationModal(false);
        
        setDialog({
          isOpen: true,
          type: 'success',
          title: 'Thành công',
          message: data.message || 'Cuộc trò chuyện đã được tạo',
          onConfirm: null
        });
      } else {
        setDialog({
          isOpen: true,
          type: 'error',
          title: 'Lỗi',
          message: data.message,
          onConfirm: null
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      setDialog({
        isOpen: true,
        type: 'error',
        title: 'Lỗi',
        message: 'Không thể tạo cuộc trò chuyện',
        onConfirm: null
      });
    }
  };

  const formatTime = (dateString) => {
    // Convert UTC time to GMT+7 (Vietnam time)
    const date = new Date(dateString);
    const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    
    return vietnamTime.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString) => {
    // Convert UTC time to GMT+7 (Vietnam time)
    const date = new Date(dateString);
    const vietnamDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    
    const today = new Date();
    const vietnamToday = new Date(today.getTime() + (7 * 60 * 60 * 1000));
    
    const yesterday = new Date(vietnamToday);
    yesterday.setDate(yesterday.getDate() - 1);

    if (vietnamDate.toDateString() === vietnamToday.toDateString()) {
      return 'Hôm nay';
    } else if (vietnamDate.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return vietnamDate.toLocaleDateString('vi-VN');
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
                <p className="text-sm text-gray-600">
                  {isConnected ? '🟢 Đã kết nối' : '🔴 Đang kết nối...'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNewConversationModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Cuộc trò chuyện mới</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)] py-4">
          {/* Conversations List */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Cuộc trò chuyện</h2>
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-sm text-gray-600">{conversations.length} cuộc trò chuyện</p>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có cuộc trò chuyện nào</p>
                  <p className="text-gray-400 text-sm mt-1">Bắt đầu trò chuyện với bạn bè!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations
                    .filter(conversation => {
                      if (!searchQuery) return true;
                      const otherParticipant = conversation.participants?.find(p => p.id !== user.id);
                      return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             conversation.last_message?.toLowerCase().includes(searchQuery.toLowerCase());
                    })
                    .map(conversation => {
                    const otherParticipant = conversation.participants?.find(p => p.id !== user.id);
                    const isSelected = selectedConversation?.id === conversation.id;
                    
                    return (
                      <div
                        key={conversation.id}
                        onClick={() => selectConversation(conversation)}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-all ${
                          isSelected ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                              {otherParticipant?.name.charAt(0).toUpperCase() || 'G'}
                            </div>
                            {conversation.participants?.some(p => p.id !== user.id && isUserOnline(p.id)) && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900 truncate">
                                {conversation.name || otherParticipant?.name || 'Cuộc trò chuyện'}
                              </p>
                              {conversation.unread_count > 0 && (
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                                  {conversation.unread_count}
                                </span>
                              )}
                            </div>
                            
                            {conversation.last_message && (
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-sm text-gray-600 truncate">
                                  {conversation.last_message.sender_id === user.id && 'Bạn: '}
                                  {conversation.last_message.message_text}
                                </p>
                                <p className="text-xs text-gray-400 ml-2">
                                  {formatTime(conversation.last_message.created_at)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {selectedConversation.participants?.find(p => p.id !== user.id)?.name.charAt(0).toUpperCase()}
                      </div>
                      {selectedConversation.participants?.some(p => p.id !== user.id && isUserOnline(p.id)) && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.name || 
                         selectedConversation.participants?.find(p => p.id !== user.id)?.name || 
                         'Cuộc trò chuyện'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedConversation.participants?.some(p => p.id !== user.id && isUserOnline(p.id)) 
                          ? '🟢 Đang online' 
                          : 'Không online'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Call features temporarily hidden - will be implemented later */}
                    {/* 
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Tính năng sắp ra mắt">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Tính năng sắp ra mắt">
                      <Video className="w-5 h-5" />
                    </button>
                    */}
                    <div className="relative more-options-container">
                      <button 
                        onClick={() => setShowMoreOptions(!showMoreOptions)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {showMoreOptions && (
                        <div className="absolute top-10 right-0 bg-white shadow-lg border border-gray-200 rounded-lg py-2 w-56 z-20">
                          <button
                            onClick={() => {
                              setShowMessageSearch(true);
                              setShowMoreOptions(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center space-x-3"
                          >
                            <Search className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">Tìm kiếm tin nhắn</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Message Search */}
                {showMessageSearch && (
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => {
                          setShowMessageSearch(false);
                          setMessageSearchQuery('');
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={messageSearchQuery}
                          onChange={(e) => setMessageSearchQuery(e.target.value)}
                          placeholder="Tìm kiếm tin nhắn..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-96 bg-gray-50">
                  {messages
                    .filter(message => 
                      !messageSearchQuery || 
                      message.message_text.toLowerCase().includes(messageSearchQuery.toLowerCase()) ||
                      message.sender_name.toLowerCase().includes(messageSearchQuery.toLowerCase())
                    )
                    .map((message, index) => {
                    const isOwnMessage = message.sender_id === user.id;
                    const showDate = index === 0 || 
                      new Date(message.created_at).toDateString() !== new Date(messages[index - 1].created_at).toDateString();
                    
                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="text-center my-4">
                            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        )}
                        
                        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isOwnMessage 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            {!isOwnMessage && (
                              <p className="text-xs text-gray-600 mb-1">{message.sender_name}</p>
                            )}
                            <p className="text-sm">{message.message_text}</p>
                            <div className={`flex items-center justify-between mt-1 ${
                              isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <p className="text-xs">
                                {formatTime(message.created_at)}
                              </p>
                              {isOwnMessage && (
                                <div className="flex items-center space-x-1">
                                  {message.is_optimistic ? (
                                    <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
                                  ) : message.read_by && message.read_by.length > 0 ? (
                                    <span className="text-xs">✓✓</span>
                                  ) : (
                                    <span className="text-xs">✓</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Typing Indicators */}
                  {Array.from(typingUsers).length > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => console.log('📎 File attachment clicked')}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      disabled={sendingMessage}
                    >
                      <Paperclip className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <input
                        ref={messageInputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        disabled={sendingMessage}
                      />
                    </div>
                    
                    <div className="relative emoji-picker-container">
                      <button 
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        disabled={sendingMessage}
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      
                      {showEmojiPicker && (
                        <div className="absolute bottom-12 right-0 bg-white shadow-lg border border-gray-200 rounded-lg p-4 grid grid-cols-8 gap-2 w-64 z-10">
                          {['😊', '😂', '🥰', '😍', '🤔', '👍', '👎', '❤️', '🎉', '🔥', '💯', '😅', '😭', '🤗', '😘', '🙄', '😴', '🤩', '😎', '🤪', '🥳', '🤝', '👋', '🙏'].map(emoji => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setNewMessage(prev => prev + emoji);
                                setShowEmojiPicker(false);
                              }}
                              className="text-xl hover:bg-gray-100 rounded p-1 transition-colors"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
                    >
                      {sendingMessage ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-xl font-medium text-gray-500">Chọn cuộc trò chuyện</p>
                  <p className="text-gray-400">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowNewConversationModal(false)}></div>
            
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                      Tạo cuộc trò chuyện mới
                    </h3>
                    
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm bạn bè..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {filteredFriends.length === 0 ? (
                        <div className="text-center py-4">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">Không tìm thấy bạn bè</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredFriends.map(friend => (
                            <div
                              key={friend.id}
                              onClick={() => createNewConversation(friend.id)}
                              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                            >
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                {friend.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{friend.name}</p>
                                <p className="text-sm text-gray-600">{friend.email}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  onClick={() => setShowNewConversationModal(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog Component */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        showCancel={dialog.type === 'confirm'}
      />
    </div>
  );
};

export default ChatPage;