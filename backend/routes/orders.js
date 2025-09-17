const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Generate order number
const generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `NV-${timestamp}-${random}`;
};

// Create guest order
router.post('/create-guest', [
  body('guestInfo').isObject(),
  body('shippingAddress').isObject(),
  body('paymentMethod').notEmpty().trim(),
  body('cartItems').isArray(),
  body('shippingOption').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { guestInfo, shippingAddress, paymentMethod, cartItems, shippingOption } = req.body;

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shippingCost = shippingOption ? parseFloat(shippingOption.price) : 0;
    const total = subtotal + shippingCost;

    // Check stock availability
    for (const item of cartItems) {
      const productResult = await pool.query(
        'SELECT stock_quantity FROM products WHERE id = $1 AND is_active = true',
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        return res.status(400).json({ message: `Product ${item.name} is no longer available` });
      }

      if (productResult.rows[0].stock_quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.name}. Available: ${productResult.rows[0].stock_quantity}, Requested: ${item.quantity}` 
        });
      }
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create order
      const orderNumber = generateOrderNumber();
      const orderResult = await client.query(`
        INSERT INTO orders (user_id, order_number, status, total_amount, shipping_address, payment_method, payment_status, 
                           shipping_cost, shipping_method, shipping_service, shipping_city, shipping_postal_code, shipping_country)
        VALUES (NULL, $1, 'pending', $2, $3, $4, 'pending', $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        orderNumber, 
        total, 
        JSON.stringify(shippingAddress), 
        paymentMethod,
        shippingCost,
        shippingOption?.id || null,
        shippingOption?.name || null,
        shippingAddress.city,
        shippingAddress.postalCode,
        shippingAddress.country
      ]);

      const order = orderResult.rows[0];

      // Create order items and update stock
      for (const item of cartItems) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, quantity, price)
          VALUES ($1, $2, $3, $4)
        `, [order.id, item.product_id, item.quantity, item.price]);

        // Update stock
        await client.query(`
          UPDATE products 
          SET stock_quantity = stock_quantity - $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [item.quantity, item.product_id]);
      }

      await client.query('COMMIT');

      res.status(201).json({ 
        message: 'Guest order created successfully',
        order: {
          ...order,
          guestInfo,
          items: cartItems
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create guest order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create order
router.post('/create', authenticateToken, [
  body('shippingAddress').isObject(),
  body('paymentMethod').notEmpty().trim(),
  body('shippingOption').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { shippingAddress, paymentMethod, shippingOption } = req.body;

    // Get cart items
    const cartResult = await pool.query(`
      SELECT c.*, p.name, p.price, p.stock_quantity
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1 AND p.is_active = true
    `, [req.user.id]);

    if (cartResult.rows.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total
    const subtotal = cartResult.rows.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const shippingCost = shippingOption ? parseFloat(shippingOption.price) : 0;
    const total = subtotal + shippingCost;

    // Check stock availability
    for (const item of cartResult.rows) {
      if (item.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.name}. Available: ${item.stock_quantity}, Requested: ${item.quantity}` 
        });
      }
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const orderResult = await pool.query(`
      INSERT INTO orders (user_id, order_number, total_amount, shipping_address, payment_method, 
                         shipping_cost, shipping_method, shipping_service, shipping_city, shipping_postal_code, shipping_country)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *
    `, [
      req.user.id, 
      orderNumber, 
      total, 
      JSON.stringify(shippingAddress), 
      paymentMethod,
      shippingCost,
      shippingOption?.id || null,
      shippingOption?.name || null,
      shippingAddress.city,
      shippingAddress.postalCode,
      shippingAddress.country
    ]);

    const order = orderResult.rows[0];

    // Create order items and update stock
    for (const item of cartResult.rows) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.product_id, item.quantity, item.price]
      );

      // Update stock
      await pool.query(
        'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.created_at
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT o.*, 
             COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, limit, offset]);

    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [req.user.id]);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order details
router.get('/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order
    const orderResult = await pool.query(`
      SELECT o.*, u.first_name, u.last_name, u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = $1 AND (o.user_id = $2 OR $3 = 'admin')
    `, [orderId, req.user.id, req.user.role]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await pool.query(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);

    res.json({
      order: {
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        totalAmount: order.total_amount,
        subtotal: order.total_amount - (order.shipping_cost || 0),
        shippingCost: order.shipping_cost || 0,
        shippingMethod: order.shipping_method,
        shippingService: order.shipping_service,
        shippingAddress: order.shipping_address,
        shippingCity: order.shipping_city,
        shippingPostalCode: order.shipping_postal_code,
        shippingCountry: order.shipping_country,
        paymentMethod: order.payment_method,
        paymentStatus: order.payment_status,
        trackingNumber: order.tracking_number,
        shippingStatus: order.shipping_status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        customer: {
          name: order.first_name && order.last_name ? `${order.first_name} ${order.last_name}` : 'Guest Customer',
          email: order.email
        }
      },
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update order status (Admin only)
router.put('/:orderId/status', authenticateToken, requireAdmin, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    const result = await pool.query(
      'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [status, orderId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (Admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT o.*, u.first_name, u.last_name, u.email,
             COUNT(oi.id) as item_count
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    const queryParams = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` WHERE o.status = $${paramCount}`;
      queryParams.push(status);
    }

    query += ` GROUP BY o.id, u.first_name, u.last_name, u.email ORDER BY o.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM orders o JOIN users u ON o.user_id = u.id';
    const countParams = [];
    let countParamCount = 0;

    if (status) {
      countParamCount++;
      countQuery += ` WHERE o.status = $${countParamCount}`;
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;