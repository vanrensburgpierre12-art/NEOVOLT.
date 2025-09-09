const express = require('express');
const whatsapp = require('../services/whatsapp');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verified = whatsapp.verifyWebhook(mode, token, challenge);
  
  if (verified) {
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
});

// Webhook for incoming messages
router.post('/webhook', (req, res) => {
  try {
    const messageData = whatsapp.processWebhook(req.body);
    
    if (messageData) {
      console.log('Received WhatsApp message:', messageData);
      
      // Store message in database
      pool.query(
        'INSERT INTO whatsapp_messages (from_number, message_id, message_type, content, sender_name, timestamp) VALUES ($1, $2, $3, $4, $5, $6)',
        [messageData.from, messageData.messageId, messageData.type, messageData.text, messageData.name, new Date(messageData.timestamp * 1000)]
      ).catch(err => console.error('Error storing WhatsApp message:', err));

      // Auto-reply to common queries
      if (messageData.text) {
        const text = messageData.text.toLowerCase();
        
        if (text.includes('order') || text.includes('tracking')) {
          whatsapp.sendTextMessage(messageData.from, 
            'To check your order status, please visit our website and log in to your account. You can also reply with your order number for assistance.'
          );
        } else if (text.includes('support') || text.includes('help')) {
          whatsapp.sendTextMessage(messageData.from, 
            'Our customer support team is here to help! Please describe your issue and we\'ll get back to you shortly.'
          );
        } else if (text.includes('stop')) {
          // Handle unsubscribe
          pool.query(
            'UPDATE users SET whatsapp_opt_in = false WHERE phone = $1',
            [messageData.from]
          ).catch(err => console.error('Error updating WhatsApp opt-in:', err));
          
          whatsapp.sendTextMessage(messageData.from, 
            'You have been unsubscribed from WhatsApp notifications. Reply START to resubscribe.'
          );
        } else if (text.includes('start')) {
          // Handle subscribe
          pool.query(
            'UPDATE users SET whatsapp_opt_in = true WHERE phone = $1',
            [messageData.from]
          ).catch(err => console.error('Error updating WhatsApp opt-in:', err));
          
          whatsapp.sendTextMessage(messageData.from, 
            'Welcome! You are now subscribed to WhatsApp notifications from Neovolt Electronics.'
          );
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

// Send message to customer (Admin only)
router.post('/send-message', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ message: 'Phone number and message are required' });
    }

    const result = await whatsapp.sendTextMessage(phoneNumber, message);

    res.json({
      success: true,
      message: 'Message sent successfully',
      result: result
    });
  } catch (error) {
    console.error('Send WhatsApp message error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to send message' 
    });
  }
});

// Send order notification
router.post('/send-order-notification', authenticateToken, async (req, res) => {
  try {
    const { orderId, notificationType } = req.body;

    // Get order details
    const orderResult = await pool.query(`
      SELECT o.*, u.phone, u.whatsapp_opt_in
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1
    `, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    if (!order.phone || !order.whatsapp_opt_in) {
      return res.status(400).json({ message: 'Customer has not opted in for WhatsApp notifications' });
    }

    let result;
    switch (notificationType) {
      case 'confirmation':
        result = await whatsapp.sendOrderConfirmation(order.phone, order);
        break;
      case 'shipping':
        result = await whatsapp.sendShippingNotification(order.phone, order, order.tracking_number);
        break;
      case 'delivery':
        result = await whatsapp.sendDeliveryConfirmation(order.phone, order);
        break;
      case 'payment_reminder':
        result = await whatsapp.sendPaymentReminder(order.phone, order);
        break;
      default:
        return res.status(400).json({ message: 'Invalid notification type' });
    }

    res.json({
      success: true,
      message: 'Notification sent successfully',
      result: result
    });
  } catch (error) {
    console.error('Send order notification error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to send notification' 
    });
  }
});

// Send newsletter (Admin only)
router.post('/send-newsletter', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { newsletterId } = req.body;

    // Get newsletter details
    const newsletterResult = await pool.query(
      'SELECT * FROM newsletters WHERE id = $1',
      [newsletterId]
    );

    if (newsletterResult.rows.length === 0) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }

    const newsletter = newsletterResult.rows[0];

    // Get users who opted in for WhatsApp
    const usersResult = await pool.query(
      'SELECT phone FROM users WHERE whatsapp_opt_in = true AND phone IS NOT NULL'
    );

    const phoneNumbers = usersResult.rows.map(row => row.phone);

    if (phoneNumbers.length === 0) {
      return res.status(400).json({ message: 'No users opted in for WhatsApp notifications' });
    }

    const results = await whatsapp.sendNewsletterMessage(phoneNumbers, newsletter);

    // Update newsletter status
    await pool.query(
      'UPDATE newsletters SET status = $1, sent_at = $2 WHERE id = $3',
      ['sent', new Date(), newsletterId]
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
      message: error.message || 'Failed to send newsletter' 
    });
  }
});

// Get WhatsApp messages (Admin only)
router.get('/messages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT * FROM whatsapp_messages 
      ORDER BY timestamp DESC 
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    const countResult = await pool.query('SELECT COUNT(*) FROM whatsapp_messages');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      messages: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get WhatsApp messages error:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
});

// Get WhatsApp opt-in statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN whatsapp_opt_in = true THEN 1 END) as opted_in_users,
        COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as users_with_phone
      FROM users
    `);

    const messageStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN message_type = 'text' THEN 1 END) as text_messages,
        COUNT(CASE WHEN timestamp > NOW() - INTERVAL '24 hours' THEN 1 END) as messages_today
      FROM whatsapp_messages
    `);

    res.json({
      userStats: statsResult.rows[0],
      messageStats: messageStatsResult.rows[0]
    });
  } catch (error) {
    console.error('Get WhatsApp stats error:', error);
    res.status(500).json({ message: 'Failed to get statistics' });
  }
});

module.exports = router;