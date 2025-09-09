const express = require('express');
const paypal = require('paypal-rest-sdk');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure PayPal
paypal.configure({
  mode: process.env.NODE_ENV === 'production' ? 'live' : 'sandbox',
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_CLIENT_SECRET
});

// Create PayPal payment
router.post('/paypal/create', authenticateToken, async (req, res) => {
  try {
    const { orderId, returnUrl, cancelUrl } = req.body;

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

    // Get order items
    const itemsResult = await pool.query(`
      SELECT oi.*, p.name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);

    const items = itemsResult.rows.map(item => ({
      name: item.name,
      sku: `PRODUCT-${item.product_id}`,
      price: parseFloat(item.price).toFixed(2),
      currency: 'USD',
      quantity: item.quantity
    }));

    const payment = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal'
      },
      redirect_urls: {
        return_url: returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
        cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`
      },
      transactions: [{
        item_list: {
          items: items
        },
        amount: {
          currency: 'USD',
          total: order.total_amount.toFixed(2)
        },
        description: `Order ${order.order_number} - Neovolt Electronics`
      }]
    };

    paypal.payment.create(payment, (error, payment) => {
      if (error) {
        console.error('PayPal payment creation error:', error);
        return res.status(500).json({ message: 'Payment creation failed' });
      } else {
        // Store payment ID in order
        pool.query(
          'UPDATE orders SET payment_id = $1 WHERE id = $2',
          [payment.id, orderId]
        );

        res.json({
          paymentId: payment.id,
          approvalUrl: payment.links.find(link => link.rel === 'approval_url').href
        });
      }
    });
  } catch (error) {
    console.error('Create PayPal payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Execute PayPal payment
router.post('/paypal/execute', authenticateToken, async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    const execute_payment = {
      payer_id: payerId
    };

    paypal.payment.execute(paymentId, execute_payment, async (error, payment) => {
      if (error) {
        console.error('PayPal payment execution error:', error);
        return res.status(500).json({ message: 'Payment execution failed' });
      } else {
        // Update order payment status
        await pool.query(
          'UPDATE orders SET payment_status = $1, status = $2 WHERE id = $3',
          ['completed', 'processing', orderId]
        );

        res.json({
          message: 'Payment completed successfully',
          payment: {
            id: payment.id,
            state: payment.state,
            amount: payment.transactions[0].amount
          }
        });
      }
    });
  } catch (error) {
    console.error('Execute PayPal payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment status
router.get('/status/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await pool.query(
      'SELECT payment_status, payment_id FROM orders WHERE id = $1 AND user_id = $2',
      [orderId, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = result.rows[0];

    if (order.payment_id) {
      paypal.payment.get(order.payment_id, (error, payment) => {
        if (error) {
          console.error('Get PayPal payment error:', error);
          return res.status(500).json({ message: 'Failed to get payment details' });
        } else {
          res.json({
            paymentStatus: order.payment_status,
            paymentId: order.payment_id,
            paypalPayment: {
              id: payment.id,
              state: payment.state,
              amount: payment.transactions[0].amount
            }
          });
        }
      });
    } else {
      res.json({
        paymentStatus: order.payment_status,
        paymentId: order.payment_id
      });
    }
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;