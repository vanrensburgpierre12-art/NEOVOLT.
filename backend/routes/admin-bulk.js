const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Apply admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Bulk update products
router.post('/bulk-update/products', [
  body('action').isIn(['status', 'category', 'price', 'stock', 'delete']),
  body('item_ids').isArray({ min: 1 }),
  body('data').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, item_ids, data } = req.body;
    const results = [];

    for (const itemId of item_ids) {
      try {
        let result;
        
        switch (action) {
          case 'status':
            result = await updateProductStatus(itemId, data.status);
            break;
          case 'category':
            result = await updateProductCategory(itemId, data.category_id);
            break;
          case 'price':
            result = await updateProductPrice(itemId, data);
            break;
          case 'stock':
            result = await updateProductStock(itemId, data);
            break;
          case 'delete':
            result = await deleteProduct(itemId);
            break;
          default:
            throw new Error('Invalid action');
        }
        
        results.push({ id: itemId, success: true, result });
      } catch (error) {
        results.push({ id: itemId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Bulk update completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: item_ids.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Bulk update products error:', error);
    res.status(500).json({ 
      message: 'Failed to perform bulk update',
      error: error.message 
    });
  }
});

// Bulk update orders
router.post('/bulk-update/orders', [
  body('action').isIn(['order_status', 'shipping_status', 'delete']),
  body('item_ids').isArray({ min: 1 }),
  body('data').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, item_ids, data } = req.body;
    const results = [];

    for (const itemId of item_ids) {
      try {
        let result;
        
        switch (action) {
          case 'order_status':
            result = await updateOrderStatus(itemId, data.status);
            break;
          case 'shipping_status':
            result = await updateShippingStatus(itemId, data.status);
            break;
          case 'delete':
            result = await deleteOrder(itemId);
            break;
          default:
            throw new Error('Invalid action');
        }
        
        results.push({ id: itemId, success: true, result });
      } catch (error) {
        results.push({ id: itemId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Bulk update completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: item_ids.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Bulk update orders error:', error);
    res.status(500).json({ 
      message: 'Failed to perform bulk update',
      error: error.message 
    });
  }
});

// Bulk update users
router.post('/bulk-update/users', [
  body('action').isIn(['user_role', 'user_status', 'delete']),
  body('item_ids').isArray({ min: 1 }),
  body('data').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { action, item_ids, data } = req.body;
    const results = [];

    for (const itemId of item_ids) {
      try {
        let result;
        
        switch (action) {
          case 'user_role':
            result = await updateUserRole(itemId, data.role);
            break;
          case 'user_status':
            result = await updateUserStatus(itemId, data.status);
            break;
          case 'delete':
            result = await deleteUser(itemId);
            break;
          default:
            throw new Error('Invalid action');
        }
        
        results.push({ id: itemId, success: true, result });
      } catch (error) {
        results.push({ id: itemId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Bulk update completed: ${successCount} successful, ${failureCount} failed`,
      results,
      summary: {
        total: item_ids.length,
        successful: successCount,
        failed: failureCount
      }
    });

  } catch (error) {
    console.error('Bulk update users error:', error);
    res.status(500).json({ 
      message: 'Failed to perform bulk update',
      error: error.message 
    });
  }
});

// Bulk export
router.post('/bulk-export/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { item_ids } = req.body;

    if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
      return res.status(400).json({ message: 'Item IDs are required' });
    }

    let csvData;
    
    switch (type) {
      case 'products':
        csvData = await exportProducts(item_ids);
        break;
      case 'orders':
        csvData = await exportOrders(item_ids);
        break;
      case 'users':
        csvData = await exportUsers(item_ids);
        break;
      default:
        return res.status(400).json({ message: 'Invalid export type' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${type}_export_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvData);

  } catch (error) {
    console.error('Bulk export error:', error);
    res.status(500).json({ 
      message: 'Failed to export data',
      error: error.message 
    });
  }
});

// Helper functions for product updates
async function updateProductStatus(productId, status) {
  const result = await pool.query(
    'UPDATE products SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, is_active',
    [status === 'active', productId]
  );
  return result.rows[0];
}

async function updateProductCategory(productId, categoryId) {
  const result = await pool.query(
    'UPDATE products SET category_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, category_id',
    [categoryId, productId]
  );
  return result.rows[0];
}

async function updateProductPrice(productId, data) {
  const { price_type, price_value, price_unit } = data;
  
  // Get current price
  const currentResult = await pool.query('SELECT price FROM products WHERE id = $1', [productId]);
  if (currentResult.rows.length === 0) {
    throw new Error('Product not found');
  }
  
  let newPrice = currentResult.rows[0].price;
  
  if (price_type === 'set') {
    newPrice = parseFloat(price_value);
  } else if (price_type === 'increase') {
    if (price_unit === 'percentage') {
      newPrice = newPrice * (1 + parseFloat(price_value) / 100);
    } else {
      newPrice = newPrice + parseFloat(price_value);
    }
  } else if (price_type === 'decrease') {
    if (price_unit === 'percentage') {
      newPrice = newPrice * (1 - parseFloat(price_value) / 100);
    } else {
      newPrice = newPrice - parseFloat(price_value);
    }
  }
  
  const result = await pool.query(
    'UPDATE products SET price = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, price',
    [newPrice, productId]
  );
  return result.rows[0];
}

async function updateProductStock(productId, data) {
  const { stock_type, stock_value } = data;
  
  // Get current stock
  const currentResult = await pool.query('SELECT stock_quantity FROM products WHERE id = $1', [productId]);
  if (currentResult.rows.length === 0) {
    throw new Error('Product not found');
  }
  
  let newStock = currentResult.rows[0].stock_quantity;
  
  if (stock_type === 'set') {
    newStock = parseInt(stock_value);
  } else if (stock_type === 'add') {
    newStock = newStock + parseInt(stock_value);
  } else if (stock_type === 'subtract') {
    newStock = newStock - parseInt(stock_value);
  }
  
  const result = await pool.query(
    'UPDATE products SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, stock_quantity',
    [newStock, productId]
  );
  return result.rows[0];
}

async function deleteProduct(productId) {
  const result = await pool.query(
    'UPDATE products SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name',
    [productId]
  );
  return result.rows[0];
}

// Helper functions for order updates
async function updateOrderStatus(orderId, status) {
  const result = await pool.query(
    'UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, order_number, status',
    [status, orderId]
  );
  return result.rows[0];
}

async function updateShippingStatus(orderId, status) {
  const result = await pool.query(
    'UPDATE orders SET shipping_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, order_number, shipping_status',
    [status, orderId]
  );
  return result.rows[0];
}

async function deleteOrder(orderId) {
  const result = await pool.query(
    'UPDATE orders SET is_deleted = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, order_number',
    [orderId]
  );
  return result.rows[0];
}

// Helper functions for user updates
async function updateUserRole(userId, role) {
  const result = await pool.query(
    'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, role',
    [role, userId]
  );
  return result.rows[0];
}

async function updateUserStatus(userId, status) {
  const result = await pool.query(
    'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, is_active',
    [status === 'active', userId]
  );
  return result.rows[0];
}

async function deleteUser(userId) {
  const result = await pool.query(
    'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email',
    [userId]
  );
  return result.rows[0];
}

// Export functions
async function exportProducts(productIds) {
  const placeholders = productIds.map((_, index) => `$${index + 1}`).join(',');
  
  const query = `
    SELECT 
      p.id,
      p.name,
      p.description,
      p.price,
      p.stock_quantity,
      p.is_active,
      c.name as category_name,
      p.created_at,
      p.updated_at
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id IN (${placeholders})
    ORDER BY p.name
  `;
  
  const result = await pool.query(query, productIds);
  
  // Convert to CSV
  const headers = ['ID', 'Name', 'Description', 'Price', 'Stock', 'Active', 'Category', 'Created', 'Updated'];
  const csvRows = [headers.join(',')];
  
  result.rows.forEach(row => {
    const values = [
      row.id,
      `"${row.name}"`,
      `"${row.description}"`,
      row.price,
      row.stock_quantity,
      row.is_active ? 'Yes' : 'No',
      `"${row.category_name || ''}"`,
      row.created_at,
      row.updated_at
    ];
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

async function exportOrders(orderIds) {
  const placeholders = orderIds.map((_, index) => `$${index + 1}`).join(',');
  
  const query = `
    SELECT 
      o.id,
      o.order_number,
      o.status,
      o.shipping_status,
      o.total_amount,
      o.first_name,
      o.last_name,
      o.email,
      o.created_at,
      o.updated_at
    FROM orders o
    WHERE o.id IN (${placeholders})
    ORDER BY o.created_at DESC
  `;
  
  const result = await pool.query(query, orderIds);
  
  // Convert to CSV
  const headers = ['ID', 'Order Number', 'Status', 'Shipping Status', 'Total', 'Customer Name', 'Email', 'Created', 'Updated'];
  const csvRows = [headers.join(',')];
  
  result.rows.forEach(row => {
    const values = [
      row.id,
      `"${row.order_number}"`,
      `"${row.status}"`,
      `"${row.shipping_status}"`,
      row.total_amount,
      `"${row.first_name} ${row.last_name}"`,
      `"${row.email}"`,
      row.created_at,
      row.updated_at
    ];
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

async function exportUsers(userIds) {
  const placeholders = userIds.map((_, index) => `$${index + 1}`).join(',');
  
  const query = `
    SELECT 
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.role,
      u.is_active,
      u.created_at,
      u.updated_at
    FROM users u
    WHERE u.id IN (${placeholders})
    ORDER BY u.created_at DESC
  `;
  
  const result = await pool.query(query, userIds);
  
  // Convert to CSV
  const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Role', 'Active', 'Created', 'Updated'];
  const csvRows = [headers.join(',')];
  
  result.rows.forEach(row => {
    const values = [
      row.id,
      `"${row.email}"`,
      `"${row.first_name}"`,
      `"${row.last_name}"`,
      `"${row.role}"`,
      row.is_active ? 'Yes' : 'No',
      row.created_at,
      row.updated_at
    ];
    csvRows.push(values.join(','));
  });
  
  return csvRows.join('\n');
}

module.exports = router;