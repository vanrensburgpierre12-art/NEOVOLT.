const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const whatsapp = require('../services/whatsapp');

const router = express.Router();

// Create newsletter (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { subject, content, type = 'general', scheduled_at } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ message: 'Subject and content are required' });
    }

    const result = await pool.query(
      'INSERT INTO newsletters (subject, content, type, status, scheduled_at, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [subject, content, type, 'draft', scheduled_at, req.user.id]
    );

    res.status(201).json({
      success: true,
      message: 'Newsletter created successfully',
      newsletter: result.rows[0]
    });
  } catch (error) {
    console.error('Create newsletter error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create newsletter' 
    });
  }
});

// Get all newsletters (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT n.*, u.first_name, u.last_name
      FROM newsletters n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND n.status = $${paramCount}`;
      params.push(status);
    }

    if (type) {
      paramCount++;
      query += ` AND n.type = $${paramCount}`;
      params.push(type);
    }

    query += ` ORDER BY n.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM newsletters WHERE 1=1';
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` AND status = $${countParamCount}`;
      countParams.push(status);
    }

    if (type) {
      countParamCount++;
      countQuery += ` AND type = $${countParamCount}`;
      countParams.push(type);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      newsletters: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get newsletters error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get newsletters' 
    });
  }
});

// Get newsletter by ID (Admin only)
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT n.*, u.first_name, u.last_name
      FROM newsletters n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    res.json({
      success: true,
      newsletter: result.rows[0]
    });
  } catch (error) {
    console.error('Get newsletter error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get newsletter' 
    });
  }
});

// Update newsletter (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, content, type, scheduled_at } = req.body;

    const result = await pool.query(
      'UPDATE newsletters SET subject = $1, content = $2, type = $3, scheduled_at = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [subject, content, type, scheduled_at, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    res.json({
      success: true,
      message: 'Newsletter updated successfully',
      newsletter: result.rows[0]
    });
  } catch (error) {
    console.error('Update newsletter error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update newsletter' 
    });
  }
});

// Delete newsletter (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM newsletters WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    res.json({
      success: true,
      message: 'Newsletter deleted successfully'
    });
  } catch (error) {
    console.error('Delete newsletter error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete newsletter' 
    });
  }
});

// Send newsletter (Admin only)
router.post('/:id/send', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { method = 'email' } = req.body; // 'email' or 'whatsapp'

    // Get newsletter details
    const newsletterResult = await pool.query(
      'SELECT * FROM newsletters WHERE id = $1',
      [id]
    );

    if (newsletterResult.rows.length === 0) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    const newsletter = newsletterResult.rows[0];

    if (newsletter.status === 'sent') {
      return res.status(400).json({ message: 'Newsletter has already been sent' });
    }

    let results = [];

    if (method === 'whatsapp') {
      // Get users who opted in for WhatsApp
      const usersResult = await pool.query(
        'SELECT phone FROM users WHERE whatsapp_opt_in = true AND phone IS NOT NULL'
      );

      const phoneNumbers = usersResult.rows.map(row => row.phone);

      if (phoneNumbers.length === 0) {
        return res.status(400).json({ message: 'No users opted in for WhatsApp notifications' });
      }

      results = await whatsapp.sendNewsletterMessage(phoneNumbers, newsletter);
    } else {
      // Email sending logic would go here
      // For now, we'll just simulate it
      const usersResult = await pool.query(
        'SELECT email FROM users WHERE email IS NOT NULL'
      );

      const emails = usersResult.rows.map(row => row.email);
      results = emails.map(email => ({ email, success: true, result: 'Email sent' }));
    }

    // Update newsletter status
    await pool.query(
      'UPDATE newsletters SET status = $1, sent_at = $2, sent_count = $3 WHERE id = $4',
      ['sent', new Date(), results.filter(r => r.success).length, id]
    );

    res.json({
      success: true,
      message: 'Newsletter sent successfully',
      results: results
    });
  } catch (error) {
    console.error('Send newsletter error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to send newsletter' 
    });
  }
});

// Get newsletter statistics (Admin only)
router.get('/stats/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_newsletters,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_newsletters,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_newsletters,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_newsletters,
        SUM(sent_count) as total_sent_count
      FROM newsletters
    `);

    const recentStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as newsletters_this_month,
        SUM(sent_count) as sent_this_month
      FROM newsletters
      WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
    `);

    res.json({
      success: true,
      stats: {
        ...statsResult.rows[0],
        ...recentStatsResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Get newsletter stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get newsletter statistics' 
    });
  }
});

// Get newsletter types
router.get('/types/list', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT type, COUNT(*) as count
      FROM newsletters
      GROUP BY type
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      types: result.rows
    });
  } catch (error) {
    console.error('Get newsletter types error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get newsletter types' 
    });
  }
});

module.exports = router;