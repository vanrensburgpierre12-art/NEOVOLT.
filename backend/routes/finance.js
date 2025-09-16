const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const taxCalculator = require('../utils/taxCalculator');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Get financial dashboard overview
router.get('/dashboard', async (req, res) => {
  try {
    const { period = 'current_month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'current_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'current_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Get orders in period
    const ordersResult = await pool.query(`
      SELECT o.*, oi.product_id, oi.quantity, oi.price, p.cost_price, p.name as product_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.created_at >= $1 AND o.created_at <= $2
      AND o.status != 'cancelled'
    `, [startDate, endDate]);

    // Group orders by order_id
    const ordersMap = new Map();
    ordersResult.rows.forEach(row => {
      if (!ordersMap.has(row.id)) {
        ordersMap.set(row.id, {
          id: row.id,
          order_number: row.order_number,
          created_at: row.created_at,
          status: row.status,
          total_amount: row.total_amount,
          items: []
        });
      }
      ordersMap.get(row.id).items.push({
        product_id: row.product_id,
        product_name: row.product_name,
        quantity: row.quantity,
        price: parseFloat(row.price),
        cost_price: parseFloat(row.cost_price || 0)
      });
    });

    const orders = Array.from(ordersMap.values());

    // Calculate financial metrics
    let totalRevenue = 0;
    let totalCost = 0;
    let totalVAT = 0;
    let orderCount = 0;

    orders.forEach(order => {
      const totals = taxCalculator.calculateOrderTotals(order.items, 0, 0);
      totalRevenue += totals.subtotal;
      totalCost += totals.costBreakdown.totalCost;
      totalVAT += totals.vatBreakdown.totalVAT;
      orderCount++;
    });

    const grossProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Get top selling products
    const topProductsResult = await pool.query(`
      SELECT p.id, p.name, SUM(oi.quantity) as total_sold, 
             SUM(oi.quantity * oi.price) as total_revenue,
             SUM(oi.quantity * COALESCE(p.cost_price, 0)) as total_cost
      FROM products p
      JOIN order_items oi ON p.id = oi.product_id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at >= $1 AND o.created_at <= $2
      AND o.status != 'cancelled'
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 10
    `, [startDate, endDate]);

    // Get monthly revenue trend
    const monthlyTrendResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', o.created_at) as month,
        SUM(o.total_amount) as revenue,
        COUNT(*) as order_count
      FROM orders o
      WHERE o.created_at >= $1 AND o.created_at <= $2
      AND o.status != 'cancelled'
      GROUP BY DATE_TRUNC('month', o.created_at)
      ORDER BY month
    `, [startDate, endDate]);

    res.json({
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        label: period
      },
      summary: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        grossProfit: Math.round(grossProfit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        totalVAT: Math.round(totalVAT * 100) / 100,
        orderCount,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100
      },
      topProducts: topProductsResult.rows.map(row => ({
        id: row.id,
        name: row.name,
        totalSold: parseInt(row.total_sold),
        totalRevenue: parseFloat(row.total_revenue),
        totalCost: parseFloat(row.total_cost),
        profit: parseFloat(row.total_revenue) - parseFloat(row.total_cost)
      })),
      monthlyTrend: monthlyTrendResult.rows.map(row => ({
        month: row.month.toISOString().split('T')[0],
        revenue: parseFloat(row.revenue),
        orderCount: parseInt(row.order_count)
      }))
    });

  } catch (error) {
    console.error('Financial dashboard error:', error);
    res.status(500).json({ message: 'Failed to load financial dashboard' });
  }
});

// Get profit margin analysis
router.get('/profit-analysis', async (req, res) => {
  try {
    const { productId, categoryId } = req.query;
    
    let query = `
      SELECT p.id, p.name, p.price, p.cost_price, p.profit_margin,
             c.name as category_name,
             SUM(oi.quantity) as total_sold,
             SUM(oi.quantity * oi.price) as total_revenue,
             SUM(oi.quantity * COALESCE(p.cost_price, 0)) as total_cost
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id AND o.status != 'cancelled'
      WHERE p.is_active = true
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (productId) {
      paramCount++;
      query += ` AND p.id = $${paramCount}`;
      params.push(productId);
    }
    
    if (categoryId) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      params.push(categoryId);
    }
    
    query += `
      GROUP BY p.id, p.name, p.price, p.cost_price, p.profit_margin, c.name
      ORDER BY p.name
    `;

    const result = await pool.query(query, params);
    
    const products = result.rows.map(row => {
      const actualMargin = row.total_revenue > 0 ? 
        ((row.total_revenue - row.total_cost) / row.total_revenue) * 100 : 0;
      
      return {
        id: row.id,
        name: row.name,
        category: row.category_name,
        sellingPrice: parseFloat(row.price),
        costPrice: parseFloat(row.cost_price || 0),
        targetMargin: parseFloat(row.profit_margin || 0),
        actualMargin: Math.round(actualMargin * 100) / 100,
        totalSold: parseInt(row.total_sold || 0),
        totalRevenue: parseFloat(row.total_revenue || 0),
        totalCost: parseFloat(row.total_cost || 0),
        profit: parseFloat(row.total_revenue || 0) - parseFloat(row.total_cost || 0)
      };
    });

    res.json({ products });

  } catch (error) {
    console.error('Profit analysis error:', error);
    res.status(500).json({ message: 'Failed to load profit analysis' });
  }
});

// Update product cost and margin
router.put('/product/:id/cost', async (req, res) => {
  try {
    const { id } = req.params;
    const { costPrice, targetMargin, supplier, sku, weight, dimensions } = req.body;

    const result = await pool.query(`
      UPDATE products 
      SET cost_price = $1, profit_margin = $2, supplier = $3, sku = $4, weight = $5, dimensions = $6
      WHERE id = $7
      RETURNING *
    `, [costPrice, targetMargin, supplier, sku, weight, JSON.stringify(dimensions), id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ 
      message: 'Product cost updated successfully',
      product: result.rows[0]
    });

  } catch (error) {
    console.error('Update product cost error:', error);
    res.status(500).json({ message: 'Failed to update product cost' });
  }
});

// Generate tax report
router.get('/tax-report', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = new Date(startDate || new Date().getFullYear(), 0, 1);
    const end = new Date(endDate || new Date());

    const ordersResult = await pool.query(`
      SELECT o.*, oi.product_id, oi.quantity, oi.price, p.cost_price
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.created_at >= $1 AND o.created_at <= $2
      AND o.status != 'cancelled'
    `, [start, end]);

    // Group by order
    const ordersMap = new Map();
    ordersResult.rows.forEach(row => {
      if (!ordersMap.has(row.id)) {
        ordersMap.set(row.id, {
          id: row.id,
          order_number: row.order_number,
          created_at: row.created_at,
          items: []
        });
      }
      ordersMap.get(row.id).items.push({
        quantity: row.quantity,
        price: parseFloat(row.price),
        cost_price: parseFloat(row.cost_price || 0)
      });
    });

    const orders = Array.from(ordersMap.values());
    const taxSummary = taxCalculator.calculateMonthlyTaxSummary(orders);

    res.json({
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      },
      summary: taxSummary,
      orders: orders.map(order => ({
        orderNumber: order.order_number,
        date: order.created_at,
        totals: taxCalculator.calculateOrderTotals(order.items, 0, 0)
      }))
    });

  } catch (error) {
    console.error('Tax report error:', error);
    res.status(500).json({ message: 'Failed to generate tax report' });
  }
});

// Get company settings
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT setting_key, setting_value 
      FROM company_settings
    `);

    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json(settings);

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Failed to load settings' });
  }
});

// Update company settings
router.put('/settings', async (req, res) => {
  try {
    const { settings } = req.body;

    for (const [key, value] of Object.entries(settings)) {
      await pool.query(`
        INSERT INTO company_settings (setting_key, setting_value)
        VALUES ($1, $2)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = $2, updated_at = CURRENT_TIMESTAMP
      `, [key, JSON.stringify(value)]);
    }

    res.json({ message: 'Settings updated successfully' });

  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

module.exports = router;