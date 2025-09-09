const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('phone').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, phone } = req.body;
    const updates = {};
    const values = [];
    let paramCount = 0;

    if (firstName !== undefined) {
      paramCount++;
      updates.first_name = firstName;
      values.push(firstName);
    }

    if (lastName !== undefined) {
      paramCount++;
      updates.last_name = lastName;
      values.push(lastName);
    }

    if (phone !== undefined) {
      paramCount++;
      updates.phone = phone;
      values.push(phone);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(req.user.id);
    const updateFields = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const query = `UPDATE users SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount + 1} RETURNING id, email, first_name, last_name, phone, role, created_at`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newPasswordHash, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Get order count
    const orderCountResult = await pool.query(
      'SELECT COUNT(*) as order_count FROM orders WHERE user_id = $1',
      [req.user.id]
    );

    // Get total spent
    const totalSpentResult = await pool.query(
      'SELECT COALESCE(SUM(total_amount), 0) as total_spent FROM orders WHERE user_id = $1 AND status != $2',
      [req.user.id, 'cancelled']
    );

    // Get cart item count
    const cartCountResult = await pool.query(
      'SELECT COUNT(*) as cart_count FROM cart WHERE user_id = $1',
      [req.user.id]
    );

    res.json({
      orderCount: parseInt(orderCountResult.rows[0].order_count),
      totalSpent: parseFloat(totalSpentResult.rows[0].total_spent),
      cartItemCount: parseInt(cartCountResult.rows[0].cart_count)
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;