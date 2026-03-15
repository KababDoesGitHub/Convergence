const express = require('express');
const authMiddleware = require('../middleware/auth');
const { getDb } = require('../models/database');
const router = express.Router();

// Create a new channel room (admin/team-lead only)
router.post('/', authMiddleware, async (req, res) => {
  const { name, description } = req.body;

  if (!name) return res.status(400).json({ error: 'Room name required' });

  const role_level = req.user.role_level || 10;
  if (role_level < 40) {
    return res.status(403).json({ error: 'Insufficient permissions to create rooms' });
  }

  try {
    const db = await getDb();
    
    const result = await db.run(`
      INSERT INTO rooms (room_name, description, created_by) VALUES (?, ?, ?)
    `, [name, description || '', req.user.id]);

    const room = await db.get('SELECT * FROM rooms WHERE room_id = ?', result.lastID);
    
    // Add creator to room_members automatically
    await db.run('INSERT INTO room_members (room_id, user_id, member_role, can_post, can_invite) VALUES (?, ?, ?, ?, ?)',
      [result.lastID, req.user.id, 'owner', 1, 1]);

    res.status(201).json({ id: room.room_id, name: room.room_name, description: room.description });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Room already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Create or find a DM room
router.post('/dm', authMiddleware, async (req, res) => {
  const { recipientId } = req.body;
  if (!recipientId) return res.status(400).json({ error: 'Recipient ID required' });

  try {
    const db = await getDb();
    const currentUserId = Number(req.user.id);
    const recId = Number(recipientId);

    // Get recipient's full name
    const recipient = await db.get('SELECT user_id, full_name, username FROM users WHERE user_id = ?', [recId]);
    const recipientName = recipient ? (recipient.full_name || recipient.username) : `User ${recId}`;

    // Sort IDs to always generate the same room name for the two users
    const [id1, id2] = [currentUserId, recId].sort((a, b) => a - b);
    const roomName = `DM-${id1}-${id2}`;

    // Check if room already exists
    let room = await db.get('SELECT * FROM rooms WHERE room_name = ?', [roomName]);

    if (!room) {
      // Create new DM room
      const result = await db.run(`
        INSERT INTO rooms (room_name, room_type, description, created_by) VALUES (?, 'direct', ?, ?)
      `, [roomName, 'Direct Message', currentUserId]);
      
      room = await db.get('SELECT * FROM rooms WHERE room_id = ?', result.lastID);

      // Add both users to room_members
      await db.run('INSERT INTO room_members (room_id, user_id, member_role, can_post, can_invite) VALUES (?, ?, ?, ?, ?)',
        [room.room_id, currentUserId, 'member', 1, 1]);
      if (currentUserId !== recId) {
        await db.run('INSERT INTO room_members (room_id, user_id, member_role, can_post, can_invite) VALUES (?, ?, ?, ?, ?)',
          [room.room_id, recId, 'member', 1, 1]);
      }
    }

    res.status(200).json({ id: room.room_id, name: room.room_name, recipientName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get rooms for current user
router.get('/my', authMiddleware, async (req, res) => {
  const role_level = req.user.role_level || 10;

  try {
    const db = await getDb();
    let rooms;
    
    if (role_level < 50) { // Not an admin
      rooms = await db.all(`
        SELECT r.room_id as id, r.room_name as name, r.description, rm.member_role as my_role
        FROM rooms r
        JOIN room_members rm ON r.room_id = rm.room_id
        WHERE rm.user_id = ? AND r.is_active = 1
      `, [req.user.id]);
    } else {
      rooms = await db.all('SELECT room_id as id, room_name as name, description FROM rooms WHERE is_active = 1');
    }
    
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get room members
router.get('/:id/members', authMiddleware, async (req, res) => {
  const role_level = req.user.role_level || 10;

  if (role_level < 40) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  try {
    const db = await getDb();
    const members = await db.all(`
      SELECT u.user_id as id, u.username, u.full_name as name, rm.joined_at, rm.member_role
      FROM room_members rm
      JOIN users u ON rm.user_id = u.user_id
      WHERE rm.room_id = ?
    `, [req.params.id]);

    res.json(members);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a member to a room (admin only)
router.post('/:id/members', authMiddleware, async (req, res) => {
  const role_level = req.user.role_level || 10;
  if (role_level < 50) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  try {
    const db = await getDb();

    // Check if already a member
    const existing = await db.get('SELECT * FROM room_members WHERE room_id = ? AND user_id = ?', [req.params.id, userId]);
    if (existing) return res.status(409).json({ error: 'User is already a member' });

    await db.run('INSERT INTO room_members (room_id, user_id, member_role, can_post, can_invite) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, userId, 'member', 1, 0]);

    // Notify via socket
    if (req.io) {
      req.io.to(req.params.id.toString()).emit('member_added', { roomId: parseInt(req.params.id), userId });
    }

    res.status(201).json({ message: 'Member added successfully' });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Kick (remove) a member from a room (admin only)
router.delete('/:id/members/:userId', authMiddleware, async (req, res) => {
  const role_level = req.user.role_level || 10;

  if (role_level < 50) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  try {
    const db = await getDb();
    const removedMember = await db.get(`
      SELECT * FROM room_members WHERE room_id = ? AND user_id = ?
    `, [req.params.id, req.params.userId]);

    if (removedMember) {
      await db.run('DELETE FROM room_members WHERE room_id = ? AND user_id = ?', 
        [req.params.id, req.params.userId]);

      if (req.io) {
        req.io.to(req.params.id.toString()).emit('member_kicked', { roomId: parseInt(req.params.id), userId: parseInt(req.params.userId) });
      }

      res.json({ message: 'Member removed successfully' });
    } else {
      res.status(404).json({ error: 'Member not found' });
    }
  } catch(err) {
     res.status(500).json({ error: err.message });
  }
});

// Update a room (admin can rename, change description)
router.put('/:id', authMiddleware, async (req, res) => {
  const role_level = req.user.role_level || 10;
  if (role_level < 50) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }

  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Room name required' });

  try {
    const db = await getDb();
    const room = await db.get('SELECT * FROM rooms WHERE room_id = ?', [req.params.id]);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    await db.run('UPDATE rooms SET room_name = ?, description = ? WHERE room_id = ?',
      [name, description || room.description, req.params.id]);

    const updatedRoom = await db.get('SELECT room_id as id, room_name as name, description FROM rooms WHERE room_id = ?', [req.params.id]);
    
    if (req.io) {
      req.io.emit('room_updated', updatedRoom);
    }

    res.json(updatedRoom);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Room name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete a room (soft-delete — marks is_active = 0)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const room = await db.get('SELECT * FROM rooms WHERE room_id = ?', [req.params.id]);

    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Allow deletion if creator OR admin (role_level >= 50)
    const role_level = req.user.role_level || 10;
    if (room.created_by !== req.user.id && role_level < 50) {
      return res.status(403).json({ error: 'Only the room creator can delete this room' });
    }

    await db.run('UPDATE rooms SET is_active = 0 WHERE room_id = ?', [req.params.id]);

    if (req.io) {
      req.io.emit('room_deleted', { roomId: parseInt(req.params.id) });
    }

    res.json({ message: 'Room deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all rooms
router.get('/', authMiddleware, async (req, res) => {
  try {
    const db = await getDb();
    const rooms = await db.all('SELECT room_id as id, room_name as name, description FROM rooms WHERE is_active = 1 ORDER BY created_at DESC');
    res.json(rooms);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;