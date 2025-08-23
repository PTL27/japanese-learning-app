const express = require('express');
const router = express.Router();
const { getQuery, allQuery, runQuery } = require('../database/database');
const { authenticateToken } = require('../middleware/auth');

// Get all friends for a user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const friends = await allQuery(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.japanese_level,
        u.created_at as joined_date,
        f.created_at as friendship_date,
        f.status
      FROM friendships f
      INNER JOIN users u ON (
        CASE 
          WHEN f.requester_id = ? THEN f.addressee_id 
          ELSE f.requester_id 
        END = u.id
      )
      WHERE (f.requester_id = ? OR f.addressee_id = ?) 
        AND f.status = 'accepted'
      ORDER BY f.created_at DESC
    `, [userId, userId, userId]);
    
    res.json({
      success: true,
      data: friends,
      count: friends.length
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friends'
    });
  }
});

// Search for users to add as friends
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    const userId = req.user.id;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }
    
    const searchTerm = `%${query.trim()}%`;
    
    // Search users by name or email, exclude current user and existing friends/requests
    const users = await allQuery(`
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        u.japanese_level,
        u.created_at as joined_date,
        CASE 
          WHEN f.status IS NOT NULL THEN f.status
          ELSE NULL
        END as friendship_status,
        CASE 
          WHEN f.requester_id = ? THEN 'sent'
          WHEN f.addressee_id = ? THEN 'received'
          ELSE NULL
        END as request_direction
      FROM users u
      LEFT JOIN friendships f ON (
        (f.requester_id = ? AND f.addressee_id = u.id) OR
        (f.addressee_id = ? AND f.requester_id = u.id)
      )
      WHERE u.id != ? 
        AND (u.name LIKE ? OR u.email LIKE ?)
      ORDER BY 
        CASE 
          WHEN u.name LIKE ? THEN 1 
          ELSE 2 
        END,
        u.name ASC
      LIMIT ?
    `, [userId, userId, userId, userId, userId, searchTerm, searchTerm, searchTerm, limit]);
    
    res.json({
      success: true,
      data: users,
      query: query.trim()
    });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users'
    });
  }
});

// Send friend request
router.post('/request', authenticateToken, async (req, res) => {
  try {
    const { userId: targetUserId } = req.body;
    const requesterId = req.user.id;
    
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    if (targetUserId === requesterId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send friend request to yourself'
      });
    }
    
    // Check if target user exists
    const targetUser = await getQuery('SELECT id, name FROM users WHERE id = ?', [targetUserId]);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if friendship already exists
    const existingFriendship = await getQuery(`
      SELECT id, status, requester_id, addressee_id 
      FROM friendships 
      WHERE (requester_id = ? AND addressee_id = ?) 
         OR (requester_id = ? AND addressee_id = ?)
    `, [requesterId, targetUserId, targetUserId, requesterId]);
    
    if (existingFriendship) {
      if (existingFriendship.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'You are already friends with this user'
        });
      }
      if (existingFriendship.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Friend request already exists'
        });
      }
      if (existingFriendship.status === 'blocked') {
        return res.status(400).json({
          success: false,
          message: 'Cannot send friend request to this user'
        });
      }
    }
    
    // Create friend request
    await runQuery(`
      INSERT INTO friendships (requester_id, addressee_id, status)
      VALUES (?, ?, 'pending')
    `, [requesterId, targetUserId]);
    
    res.json({
      success: true,
      message: `Friend request sent to ${targetUser.name}`,
      data: {
        target_user: targetUser,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send friend request'
    });
  }
});

// Get pending friend requests (received)
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const requests = await allQuery(`
      SELECT 
        f.id as request_id,
        u.id as user_id,
        u.name,
        u.email,
        u.japanese_level,
        f.created_at as request_date
      FROM friendships f
      INNER JOIN users u ON f.requester_id = u.id
      WHERE f.addressee_id = ? AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friend requests'
    });
  }
});

// Respond to friend request (accept/decline)
router.post('/respond', authenticateToken, async (req, res) => {
  try {
    const { requestId, action } = req.body;
    const userId = req.user.id;
    
    if (!requestId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Request ID and action are required'
      });
    }
    
    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "accept" or "decline"'
      });
    }
    
    // Check if request exists and belongs to current user
    const request = await getQuery(`
      SELECT f.id, f.requester_id, u.name as requester_name
      FROM friendships f
      INNER JOIN users u ON f.requester_id = u.id
      WHERE f.id = ? AND f.addressee_id = ? AND f.status = 'pending'
    `, [requestId, userId]);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Friend request not found'
      });
    }
    
    const newStatus = action === 'accept' ? 'accepted' : 'declined';
    
    // Update request status
    await runQuery(`
      UPDATE friendships 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [newStatus, requestId]);
    
    const message = action === 'accept' 
      ? `You are now friends with ${request.requester_name}`
      : `Friend request from ${request.requester_name} declined`;
    
    res.json({
      success: true,
      message: message,
      data: {
        request_id: requestId,
        action: action,
        status: newStatus
      }
    });
  } catch (error) {
    console.error('Error responding to friend request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to friend request'
    });
  }
});

// Remove friend
router.delete('/:friendId', authenticateToken, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;
    
    // Check if friendship exists
    const friendship = await getQuery(`
      SELECT f.id, u.name as friend_name
      FROM friendships f
      INNER JOIN users u ON (
        CASE 
          WHEN f.requester_id = ? THEN f.addressee_id 
          ELSE f.requester_id 
        END = u.id
      )
      WHERE (f.requester_id = ? OR f.addressee_id = ?) 
        AND (
          (f.requester_id = ? AND f.addressee_id = ?) OR
          (f.addressee_id = ? AND f.requester_id = ?)
        )
        AND f.status = 'accepted'
    `, [userId, userId, userId, userId, friendId, userId, friendId]);
    
    if (!friendship) {
      return res.status(404).json({
        success: false,
        message: 'Friendship not found'
      });
    }
    
    // Delete friendship
    await runQuery(`
      DELETE FROM friendships 
      WHERE (requester_id = ? AND addressee_id = ?) 
         OR (requester_id = ? AND addressee_id = ?)
    `, [userId, friendId, friendId, userId]);
    
    res.json({
      success: true,
      message: `Removed ${friendship.friend_name} from your friends list`
    });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove friend'
    });
  }
});

// Get friend statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await getQuery(`
      SELECT 
        COUNT(CASE WHEN f.status = 'accepted' THEN 1 END) as friends_count,
        COUNT(CASE WHEN f.status = 'pending' AND f.addressee_id = ? THEN 1 END) as pending_requests,
        COUNT(CASE WHEN f.status = 'pending' AND f.requester_id = ? THEN 1 END) as sent_requests
      FROM friendships f
      WHERE (f.requester_id = ? OR f.addressee_id = ?)
    `, [userId, userId, userId, userId]);
    
    res.json({
      success: true,
      data: stats || {
        friends_count: 0,
        pending_requests: 0,
        sent_requests: 0
      }
    });
  } catch (error) {
    console.error('Error fetching friend stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch friend statistics'
    });
  }
});

module.exports = router;