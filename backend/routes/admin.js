const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users
    const userCountResult = await pool.query('SELECT COUNT(*) as user_count FROM users WHERE role = $1', ['customer']);
    const userCount = parseInt(userCountResult.rows[0].user_count);

    // Get total products
    const productCountResult = await pool.query('SELECT COUNT(*) as product_count FROM products WHERE is_active = true');
    const productCount = parseInt(productCountResult.rows[0].product_count);

    // Get total orders
    const orderCountResult = await pool.query('SELECT COUNT(*) as order_count FROM orders');
    const orderCount = parseInt(orderCountResult.rows[0].order_count);

    // Get total revenue
    const revenueResult = await pool.query(
      'SELECT COALESCE(SUM(total_amount), 0) as total_revenue FROM orders WHERE status != $1',
      ['cancelled']
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].total_revenue);

    // Get recent orders
    const recentOrdersResult = await pool.query(`
      SELECT o.*, u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    // Get low stock products
    const lowStockResult = await pool.query(
      'SELECT id, name, stock_quantity FROM products WHERE stock_quantity < 10 AND is_active = true ORDER BY stock_quantity ASC LIMIT 5'
    );

    // Get order status distribution
    const statusDistributionResult = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `);

    res.json({
      stats: {
        userCount,
        productCount,
        orderCount,
        totalRevenue
      },
      recentOrders: recentOrdersResult.rows,
      lowStockProducts: lowStockResult.rows,
      orderStatusDistribution: statusDistributionResult.rows
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE role = $1';
    const queryParams = ['customer'];
    let paramCount = 1;

    if (search) {
      paramCount++;
      query += ` AND (email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM users WHERE role = $1';
    const countParams = ['customer'];
    let countParamCount = 1;

    if (search) {
      countParamCount++;
      countQuery += ` AND (email ILIKE $${countParamCount} OR first_name ILIKE $${countParamCount} OR last_name ILIKE $${countParamCount})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user details
router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user info
    const userResult = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user orders
    const ordersResult = await pool.query(`
      SELECT o.*, COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 10
    `, [userId]);

    res.json({
      user: userResult.rows[0],
      recentOrders: ordersResult.rows
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category
router.post('/categories', async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const result = await pool.query(
      'INSERT INTO categories (name, description, image_url) VALUES ($1, $2, $3) RETURNING *',
      [name, description, imageUrl]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category
router.put('/categories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, imageUrl } = req.body;

    const result = await pool.query(
      'UPDATE categories SET name = $1, description = $2, image_url = $3 WHERE id = $4 RETURNING *',
      [name, description, imageUrl, categoryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category
router.delete('/categories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Check if category has products
    const productCountResult = await pool.query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1 AND is_active = true',
      [categoryId]
    );

    if (parseInt(productCountResult.rows[0].count) > 0) {
      return res.status(400).json({ message: 'Cannot delete category with active products' });
    }

    const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [categoryId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;