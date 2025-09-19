const express = require('express');
const courierGuyService = require('../services/courierguy');
const { authenticateToken } = require('../middleware/auth');
const { pool } = require('../config/database');

const router = express.Router();

// Calculate shipping rates
router.post('/calculate', async (req, res) => {
  try {
    const { destination, packageDetails } = req.body;

    // Validate required fields
    if (!destination || !packageDetails) {
      return res.status(400).json({ message: 'Destination and package details are required' });
    }

    if (!destination.country || !destination.postalCode || !destination.city) {
      return res.status(400).json({ message: 'Country, postal code, and city are required' });
    }

    if (!packageDetails.weight || packageDetails.weight <= 0) {
      return res.status(400).json({ message: 'Valid weight is required' });
    }

    // Set default dimensions if not provided
    const dimensions = {
      length: packageDetails.dimensions?.length || 30,
      width: packageDetails.dimensions?.width || 20,
      height: packageDetails.dimensions?.height || 10
    };

    // Our warehouse location (fixed)
    const origin = {
      address: '123 Industrial Street',
      city: 'Frankfurt',
      postal_code: '60311',
      country: 'DE'
    };

    let shippingOptions = [];

    // Check if destination is South Africa
    if (destination.country === 'ZA') {
      // South Africa specific pricing
      if (packageDetails.weight <= 1) {
        shippingOptions = [
          {
            id: 'standard',
            name: 'Standard Delivery (Under 1KG)',
            price: 150, // R150
            deliveryTime: '5-7 business days',
            tracking: true,
            insurance: true,
            specialNotes: 'R150 for items under 1KG'
          }
        ];
      } else {
        // Over 1KG requires custom quote
        shippingOptions = [
          {
            id: 'custom',
            name: 'Custom Quote Required',
            price: 'Quote',
            deliveryTime: '5-7 business days',
            tracking: true,
            insurance: true,
            specialNotes: 'Items over 1KG require custom quote. Contact us for pricing.'
          }
        ];
      }
    } else {
      // Standard calculation for other countries
      try {
        // Get shipping rates from CourierGuy
        const rates = await courierGuyService.getShippingRates(
          origin,
          destination,
          packageDetails.weight,
          dimensions
        );

        // Format response with different service options
        shippingOptions = [
          {
            id: 'standard',
            name: 'Standard Delivery',
            price: rates.standard?.price || 15.99,
            deliveryTime: '5-7 business days',
            tracking: true,
            insurance: true,
            specialNotes: 'Most economical option'
          },
          {
            id: 'express',
            name: 'Express Delivery',
            price: rates.express?.price || 25.99,
            deliveryTime: '2-3 business days',
            tracking: true,
            insurance: true,
            specialNotes: 'Faster delivery for urgent orders'
          },
          {
            id: 'overnight',
            name: 'Overnight Delivery',
            price: rates.overnight?.price || 45.99,
            deliveryTime: '1 business day',
            tracking: true,
            insurance: true,
            specialNotes: 'Next business day delivery'
          }
        ];
      } catch (courierError) {
        console.error('CourierGuy error:', courierError);
        // Fallback to basic rates
        const baseRate = getBaseRate(destination.country);
        shippingOptions = [
          {
            id: 'standard',
            name: 'Standard Delivery',
            price: baseRate,
            deliveryTime: '5-7 business days',
            tracking: true,
            insurance: true,
            specialNotes: 'Most economical option'
          },
          {
            id: 'express',
            name: 'Express Delivery',
            price: Math.round(baseRate * 1.5 * 100) / 100,
            deliveryTime: '2-3 business days',
            tracking: true,
            insurance: true,
            specialNotes: 'Faster delivery for urgent orders'
          },
          {
            id: 'overnight',
            name: 'Overnight Delivery',
            price: Math.round(baseRate * 2.5 * 100) / 100,
            deliveryTime: '1 business day',
            tracking: true,
            insurance: true,
            specialNotes: 'Next business day delivery'
          }
        ];
      }
    }

    res.json({
      success: true,
      options: shippingOptions,
      origin,
      destination,
      packageDetails: {
        ...packageDetails,
        dimensions
      }
    });

  } catch (error) {
    console.error('Shipping calculation error:', error);
    res.status(500).json({ 
      message: 'Failed to calculate shipping rates',
      error: error.message 
    });
  }
});

// Get available shipping services
router.get('/services', async (req, res) => {
  try {
    const { origin, destination } = req.query;

    if (!origin || !destination) {
      return res.status(400).json({ message: 'Origin and destination are required' });
    }

    const services = await courierGuyService.getAvailableServices(origin, destination);

    res.json({
      success: true,
      services: services.services || []
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ 
      message: 'Failed to get available services',
      error: error.message 
    });
  }
});

// Track shipment
router.get('/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    if (!trackingNumber) {
      return res.status(400).json({ message: 'Tracking number is required' });
    }

    const trackingData = await courierGuyService.trackShipment(trackingNumber);

    res.json({
      success: true,
      tracking: trackingData
    });

  } catch (error) {
    console.error('Tracking error:', error);
    res.status(500).json({ 
      message: 'Failed to track shipment',
      error: error.message 
    });
  }
});

// Create shipment (for orders)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { orderId, shippingOption, trackingData } = req.body;

    if (!orderId || !shippingOption) {
      return res.status(400).json({ message: 'Order ID and shipping option are required' });
    }

    // Get order details from database
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Prepare shipment data
    const shipmentData = {
      order_number: order.order_number,
      customer: {
        name: `${order.first_name} ${order.last_name}`,
        email: order.email,
        phone: order.phone
      },
      pickup: {
        name: 'Neovolt Electronics',
        address: '123 Industrial Street',
        city: 'Frankfurt',
        postal_code: '60311',
        country: 'DE',
        phone: '+49 69 12345678'
      },
      delivery: {
        name: `${order.first_name} ${order.last_name}`,
        address: order.shipping_address,
        city: order.shipping_city,
        postal_code: order.shipping_postal_code,
        country: order.shipping_country,
        phone: order.phone
      },
      items: order.items || [],
      service_type: shippingOption.id,
      special_instructions: order.special_instructions || ''
    };

    // Create shipment with CourierGuy
    const shipment = await courierGuyService.createShipment(shipmentData);

    // Update order with tracking information
    await pool.query(
      'UPDATE orders SET tracking_number = $1, shipping_status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [shipment.tracking_number, 'shipped', orderId]
    );

    res.json({
      success: true,
      shipment: {
        trackingNumber: shipment.tracking_number,
        status: shipment.status,
        estimatedDelivery: shipment.estimated_delivery
      }
    });

  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({ 
      message: 'Failed to create shipment',
      error: error.message 
    });
  }
});

// Get shipping zones and rates
router.get('/zones', async (req, res) => {
  try {
    const zones = [
      {
        name: 'Germany',
        code: 'DE',
        countries: ['DE'],
        rates: {
          standard: 5.99,
          express: 12.99,
          overnight: 24.99
        }
      },
      {
        name: 'EU Zone',
        code: 'EU',
        countries: ['NL', 'BE', 'FR', 'AT', 'IT', 'ES', 'PT'],
        rates: {
          standard: 12.99,
          express: 19.99,
          overnight: 34.99
        }
      },
      {
        name: 'UK & Ireland',
        code: 'UK',
        countries: ['GB', 'IE'],
        rates: {
          standard: 15.99,
          express: 24.99,
          overnight: 39.99
        }
      },
      {
        name: 'North America',
        code: 'NA',
        countries: ['US', 'CA'],
        rates: {
          standard: 25.99,
          express: 39.99,
          overnight: 59.99
        }
      },
      {
        name: 'Rest of World',
        code: 'ROW',
        countries: ['AU', 'ZA', 'JP', 'KR'],
        rates: {
          standard: 35.99,
          express: 49.99,
          overnight: 79.99
        }
      }
    ];

    res.json({
      success: true,
      zones
    });

  } catch (error) {
    console.error('Get zones error:', error);
    res.status(500).json({ 
      message: 'Failed to get shipping zones',
      error: error.message 
    });
  }
});

// Calculate shipping cost for cart
router.post('/cart-cost', async (req, res) => {
  try {
    const { items, destination, deliveryMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    if (!destination) {
      return res.status(400).json({ message: 'Destination is required' });
    }

    // Handle pickup option
    if (deliveryMethod === 'pickup') {
      return res.json({
        success: true,
        cost: {
          standard: 0,
          express: 0,
          overnight: 0
        },
        deliveryMethod: 'pickup',
        pickupInfo: {
          address: 'Neovolt Electronics, 123 Industrial Street, Frankfurt, 60311, Germany',
          hours: 'Mon-Fri: 9:00-17:00, Sat: 9:00-13:00',
          contact: '+49 69 12345678'
        }
      });
    }

    // Calculate total weight and dimensions
    let totalWeight = 0;
    let maxLength = 0, maxWidth = 0, totalHeight = 0;

    for (const item of items) {
      const itemWeight = (item.weight || 0.5) * item.quantity;
      totalWeight += itemWeight;

      const itemLength = item.length || 20;
      const itemWidth = item.width || 15;
      const itemHeight = item.height || 5;

      maxLength = Math.max(maxLength, itemLength);
      maxWidth = Math.max(maxWidth, itemWidth);
      totalHeight += itemHeight * item.quantity;
    }

    let cost = {};

    // Check if destination is South Africa
    if (destination.country === 'ZA') {
      if (totalWeight <= 1) {
        cost = {
          standard: 150, // R150 for under 1KG
          express: 'Custom Quote',
          overnight: 'Custom Quote'
        };
      } else {
        cost = {
          standard: 'Custom Quote',
          express: 'Custom Quote',
          overnight: 'Custom Quote'
        };
      }
    } else {
      // Calculate shipping cost based on weight and destination for other countries
      const baseRate = getBaseRate(destination.country);
      const weightMultiplier = Math.ceil(totalWeight / 1); // €1 per kg
      const shippingCost = baseRate + (weightMultiplier - 1) * 2;

      cost = {
        standard: Math.round(shippingCost * 100) / 100,
        express: Math.round(shippingCost * 1.5 * 100) / 100,
        overnight: Math.round(shippingCost * 2.5 * 100) / 100
      };
    }

    res.json({
      success: true,
      cost: cost,
      weight: totalWeight,
      dimensions: {
        length: maxLength,
        width: maxWidth,
        height: totalHeight
      },
      deliveryMethod: deliveryMethod || 'shipping'
    });

  } catch (error) {
    console.error('Cart shipping cost error:', error);
    res.status(500).json({ 
      message: 'Failed to calculate shipping cost',
      error: error.message 
    });
  }
});

// Handle pickup orders
router.post('/pickup', authenticateToken, async (req, res) => {
  try {
    const { orderId, pickupDetails } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Get order details from database
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orderResult.rows[0];

    // Update order with pickup information
    await pool.query(
      'UPDATE orders SET shipping_status = $1, pickup_details = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['ready_for_pickup', JSON.stringify(pickupDetails || {}), orderId]
    );

    res.json({
      success: true,
      message: 'Order marked as ready for pickup',
      pickupInfo: {
        orderNumber: order.order_number,
        pickupAddress: 'Neovolt Electronics, 123 Industrial Street, Frankfurt, 60311, Germany',
        pickupHours: 'Mon-Fri: 9:00-17:00, Sat: 9:00-13:00',
        contact: '+49 69 12345678',
        instructions: 'Please bring a valid ID and your order confirmation'
      }
    });

  } catch (error) {
    console.error('Pickup order error:', error);
    res.status(500).json({ 
      message: 'Failed to process pickup order',
      error: error.message 
    });
  }
});

// Helper function to get base rate by country
function getBaseRate(countryCode) {
  const rates = {
    'DE': 5.99,
    'NL': 8.99,
    'BE': 8.99,
    'FR': 9.99,
    'AT': 9.99,
    'IT': 11.99,
    'ES': 12.99,
    'PT': 12.99,
    'GB': 14.99,
    'IE': 14.99,
    'US': 24.99,
    'CA': 24.99,
    'AU': 34.99,
    'ZA': 29.99
  };

  return rates[countryCode] || 19.99; // Default rate for other countries
}

module.exports = router;