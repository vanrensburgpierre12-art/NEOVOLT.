const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, p.name, p.price, p.image_url, p.stock_quantity
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1 AND p.is_active = true
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    const cartItems = result.rows.map(item => ({
      id: item.id,
      productId: item.product_id,
      name: item.name,
      price: parseFloat(item.price),
      imageUrl: item.image_url,
      quantity: item.quantity,
      stockQuantity: item.stock_quantity,
      subtotal: parseFloat(item.price) * item.quantity
    }));

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.json({
      items: cartItems,
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', authenticateToken, [
  body('productId').isInt(),
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;

    // Check if product exists and is active
    const productResult = await pool.query(
      'SELECT id, stock_quantity FROM products WHERE id = $1 AND is_active = true',
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productResult.rows[0];

    if (product.stock_quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    // Check if item already exists in cart
    const existingItem = await pool.query(
      'SELECT id, quantity FROM cart WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    if (existingItem.rows.length > 0) {
      // Update existing item
      const newQuantity = existingItem.rows[0].quantity + quantity;
      
      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({ message: 'Insufficient stock' });
      }

      await pool.query(
        'UPDATE cart SET quantity = $1 WHERE id = $2',
        [newQuantity, existingItem.rows[0].id]
      );
    } else {
      // Add new item
      await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [req.user.id, productId, quantity]
      );
    }

    res.json({ message: 'Item added to cart successfully' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cart item quantity
router.put('/update/:itemId', authenticateToken, [
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { itemId } = req.params;
    const { quantity } = req.body;

    // Check if item belongs to user
    const itemResult = await pool.query(
      'SELECT c.*, p.stock_quantity FROM cart c JOIN products p ON c.product_id = p.id WHERE c.id = $1 AND c.user_id = $2',
      [itemId, req.user.id]
    );

    if (itemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const item = itemResult.rows[0];

    if (item.stock_quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }

    await pool.query(
      'UPDATE cart SET quantity = $1 WHERE id = $2',
      [quantity, itemId]
    );

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;

    const result = await pool.query(
      'DELETE FROM cart WHERE id = $1 AND user_id = $2 RETURNING *',
      [itemId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;