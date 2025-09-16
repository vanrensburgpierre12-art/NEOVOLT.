const express = require('express');
const axios = require('axios');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Yoco API configuration
const YOCO_API_URL = process.env.YOCO_API_URL || 'https://api.yoco.com/v1';
const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY;
const YOCO_PUBLIC_KEY = process.env.YOCO_PUBLIC_KEY;

// Create Yoco payment intent
router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { orderId, amount, currency = 'ZAR' } = req.body;

    // Get order details
    const orderResult = await pool.query(`
      SELECT o.*, u.first_name, u.last_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1 AND o.user_id = $2
    `, [orderId, req.user.id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Create payment intent with Yoco
    const paymentIntent = {
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: {
        order_id: orderId,
        order_number: order.order_number,
        customer_email: order.email
      }
    };

    const response = await axios.post(`${YOCO_API_URL}/charges`, paymentIntent, {
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Store payment intent ID in order
    await pool.query(
      'UPDATE orders SET payment_id = $1, payment_method = $2 WHERE id = $3',
      [response.data.id, 'yoco_card', orderId]
    );

    res.json({
      paymentIntentId: response.data.id,
      clientSecret: response.data.client_secret,
      publicKey: YOCO_PUBLIC_KEY,
      amount: amount,
      currency: currency
    });

  } catch (error) {
    console.error('Yoco payment intent creation error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Payment creation failed',
      error: error.response?.data?.message || 'Unknown error'
    });
  }
});

// Confirm Yoco payment
router.post('/confirm-payment', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, orderId } = req.body;

    // Verify payment with Yoco
    const response = await axios.get(`${YOCO_API_URL}/charges/${paymentIntentId}`, {
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`
      }
    });

    const payment = response.data;

    if (payment.status === 'succeeded') {
      // Update order status
      await pool.query(
        'UPDATE orders SET payment_status = $1, status = $2 WHERE id = $3',
        ['completed', 'processing', orderId]
      );

      // Update product stock
      const orderItemsResult = await pool.query(`
        SELECT product_id, quantity 
        FROM order_items 
        WHERE order_id = $1
      `, [orderId]);

      for (const item of orderItemsResult.rows) {
        await pool.query(
          'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        paymentId: payment.id,
        amount: payment.amount / 100, // Convert back from cents
        status: payment.status
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not successful',
        status: payment.status
      });
    }

  } catch (error) {
    console.error('Yoco payment confirmation error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Payment confirmation failed',
      error: error.response?.data?.message || 'Unknown error'
    });
  }
});

// Get Yoco payment status
router.get('/payment-status/:paymentIntentId', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.params;

    const response = await axios.get(`${YOCO_API_URL}/charges/${paymentIntentId}`, {
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`
      }
    });

    res.json({
      status: response.data.status,
      amount: response.data.amount / 100,
      currency: response.data.currency,
      created: response.data.created
    });

  } catch (error) {
    console.error('Yoco payment status error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to get payment status',
      error: error.response?.data?.message || 'Unknown error'
    });
  }
});

// Refund Yoco payment
router.post('/refund', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId, amount, reason } = req.body;

    const refundData = {
      amount: Math.round(amount * 100), // Convert to cents
      reason: reason || 'customer_request'
    };

    const response = await axios.post(`${YOCO_API_URL}/charges/${paymentIntentId}/refunds`, refundData, {
      headers: {
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      refundId: response.data.id,
      amount: response.data.amount / 100,
      status: response.data.status
    });

  } catch (error) {
    console.error('Yoco refund error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Refund failed',
      error: error.response?.data?.message || 'Unknown error'
    });
  }
});

module.exports = router;