const express = require('express');
const courierGuy = require('../services/courierguy');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get shipping rates
router.post('/rates', authenticateToken, async (req, res) => {
  try {
    const { origin, destination, weight, dimensions } = req.body;

    if (!origin || !destination || !weight) {
      return res.status(400).json({ 
        message: 'Origin, destination, and weight are required' 
      });
    }

    const rates = await courierGuy.getShippingRates(origin, destination, weight, dimensions);
    
    res.json({
      success: true,
      rates: rates
    });
  } catch (error) {
    console.error('Get shipping rates error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to get shipping rates' 
    });
  }
});

// Create shipment
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Get order details
    const orderResult = await pool.query(`
      SELECT o.*, u.first_name, u.last_name, u.email, u.phone
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
      SELECT oi.*, p.name, p.weight, p.dimensions
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `, [orderId]);

    const items = itemsResult.rows.map(item => ({
      description: item.name,
      quantity: item.quantity,
      weight: item.weight || 0.5, // Default weight if not specified
      value: parseFloat(item.price) * item.quantity
    }));

    // Calculate total weight
    const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);

    // Prepare shipment data
    const shipmentData = {
      order_number: order.order_number,
      customer: {
        name: `${order.first_name} ${order.last_name}`,
        email: order.email,
        phone: order.phone || ''
      },
      pickup_address: {
        name: 'Neovolt Electronics',
        address: process.env.COMPANY_ADDRESS || '123 Business Street',
        city: process.env.COMPANY_CITY || 'Cape Town',
        postal_code: process.env.COMPANY_POSTAL_CODE || '8000',
        country: 'ZA',
        phone: process.env.COMPANY_PHONE || '+27123456789'
      },
      delivery_address: {
        name: order.shipping_address.name,
        address: order.shipping_address.address,
        city: order.shipping_address.city,
        postal_code: order.shipping_address.postal_code,
        country: order.shipping_address.country || 'ZA',
        phone: order.shipping_address.phone || ''
      },
      items: items,
      service_type: req.body.service_type || 'standard',
      special_instructions: req.body.special_instructions || ''
    };

    const shipment = await courierGuy.createShipment(shipmentData);

    // Update order with tracking information
    await pool.query(
      'UPDATE orders SET tracking_number = $1, shipping_status = $2 WHERE id = $3',
      [shipment.tracking_number, 'shipped', orderId]
    );

    res.json({
      success: true,
      shipment: {
        tracking_number: shipment.tracking_number,
        status: shipment.status,
        estimated_delivery: shipment.estimated_delivery
      }
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create shipment' 
    });
  }
});

// Track shipment
router.get('/track/:trackingNumber', authenticateToken, async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const trackingData = await courierGuy.trackShipment(trackingNumber);

    res.json({
      success: true,
      tracking: trackingData
    });
  } catch (error) {
    console.error('Track shipment error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to track shipment' 
    });
  }
});

// Get delivery status
router.get('/status/:trackingNumber', authenticateToken, async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const status = await courierGuy.getDeliveryStatus(trackingNumber);

    res.json({
      success: true,
      status: status
    });
  } catch (error) {
    console.error('Get delivery status error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to get delivery status' 
    });
  }
});

// Cancel shipment
router.post('/cancel/:trackingNumber', authenticateToken, async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const { reason } = req.body;

    const result = await courierGuy.cancelShipment(trackingNumber, reason);

    // Update order status
    await pool.query(
      'UPDATE orders SET shipping_status = $1 WHERE tracking_number = $2',
      ['cancelled', trackingNumber]
    );

    res.json({
      success: true,
      message: 'Shipment cancelled successfully',
      result: result
    });
  } catch (error) {
    console.error('Cancel shipment error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to cancel shipment' 
    });
  }
});

// Get available services
router.get('/services', authenticateToken, async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ 
        message: 'Origin and destination are required' 
      });
    }

    const services = await courierGuy.getAvailableServices(origin, destination);

    res.json({
      success: true,
      services: services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to get available services' 
    });
  }
});

// Get delivery estimate
router.get('/estimate', authenticateToken, async (req, res) => {
  try {
    const { origin, destination, service_type } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ 
        message: 'Origin and destination are required' 
      });
    }

    const estimate = await courierGuy.getEstimatedDelivery(origin, destination, service_type);

    res.json({
      success: true,
      estimate: estimate
    });
  } catch (error) {
    console.error('Get delivery estimate error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to get delivery estimate' 
    });
  }
});

module.exports = router;