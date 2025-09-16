const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get product recommendations
router.get('/products', async (req, res) => {
  try {
    const { 
      type = 'similar', 
      product_id, 
      category_id, 
      user_id, 
      limit = 6 
    } = req.query;

    let recommendations = [];

    switch (type) {
      case 'similar':
        recommendations = await getSimilarProducts(product_id, category_id, limit);
        break;
      case 'popular':
        recommendations = await getPopularProducts(category_id, limit);
        break;
      case 'trending':
        recommendations = await getTrendingProducts(category_id, limit);
        break;
      case 'frequently_bought':
        recommendations = await getFrequentlyBoughtProducts(category_id, limit);
        break;
      case 'recently_viewed':
        recommendations = await getRecentlyViewedProducts(user_id, limit);
        break;
      case 'personalized':
        recommendations = await getPersonalizedRecommendations(user_id, limit);
        break;
      default:
        recommendations = await getPopularProducts(category_id, limit);
    }

    res.json({
      success: true,
      recommendations: recommendations.map(product => ({
        ...product,
        recommendation_type: type,
        recommendation_score: product.score || 0.8
      }))
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ 
      message: 'Failed to get recommendations',
      error: error.message 
    });
  }
});

// Get similar products based on category and specifications
async function getSimilarProducts(productId, categoryId, limit) {
  try {
    let query = `
      SELECT DISTINCT p.*, c.name as category_name,
        CASE 
          WHEN p.category_id = $1 THEN 0.9
          ELSE 0.7
        END as score
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true AND p.id != $2
    `;
    
    const params = [categoryId, productId];
    let paramCount = 2;

    if (categoryId) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      params.push(categoryId);
    }

    // Add specification matching
    query += `
      ORDER BY 
        CASE WHEN p.category_id = $1 THEN 1 ELSE 2 END,
        p.average_rating DESC,
        p.created_at DESC
      LIMIT $${paramCount + 1}
    `;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;

  } catch (error) {
    console.error('Get similar products error:', error);
    return [];
  }
}

// Get popular products based on sales and views
async function getPopularProducts(categoryId, limit) {
  try {
    let query = `
      SELECT p.*, c.name as category_name,
        COALESCE(popularity_score, 0) as score
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN (
        SELECT 
          product_id,
          (COUNT(*) * 0.7 + AVG(rating) * 0.3) as popularity_score
        FROM reviews
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY product_id
      ) r ON p.id = r.product_id
      WHERE p.is_active = true
    `;
    
    const params = [];
    let paramCount = 0;

    if (categoryId) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      params.push(categoryId);
    }

    query += `
      ORDER BY 
        COALESCE(popularity_score, 0) DESC,
        p.average_rating DESC,
        p.created_at DESC
      LIMIT $${paramCount + 1}
    `;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;

  } catch (error) {
    console.error('Get popular products error:', error);
    return [];
  }
}

// Get trending products based on recent activity
async function getTrendingProducts(categoryId, limit) {
  try {
    let query = `
      SELECT p.*, c.name as category_name,
        COALESCE(trending_score, 0) as score
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN (
        SELECT 
          product_id,
          (COUNT(*) * 0.5 + AVG(rating) * 0.5) as trending_score
        FROM reviews
        WHERE created_at >= NOW() - INTERVAL '7 days'
        GROUP BY product_id
      ) r ON p.id = r.product_id
      WHERE p.is_active = true
    `;
    
    const params = [];
    let paramCount = 0;

    if (categoryId) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      params.push(categoryId);
    }

    query += `
      ORDER BY 
        COALESCE(trending_score, 0) DESC,
        p.created_at DESC
      LIMIT $${paramCount + 1}
    `;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;

  } catch (error) {
    console.error('Get trending products error:', error);
    return [];
  }
}

// Get frequently bought together products
async function getFrequentlyBoughtProducts(categoryId, limit) {
  try {
    let query = `
      SELECT p.*, c.name as category_name,
        COALESCE(fbt_score, 0) as score
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN (
        SELECT 
          p2.id as product_id,
          COUNT(*) as fbt_score
        FROM order_items oi1
        JOIN order_items oi2 ON oi1.order_id = oi2.order_id
        JOIN products p2 ON oi2.product_id = p2.id
        WHERE oi1.product_id != oi2.product_id
        GROUP BY p2.id
      ) fbt ON p.id = fbt.product_id
      WHERE p.is_active = true
    `;
    
    const params = [];
    let paramCount = 0;

    if (categoryId) {
      paramCount++;
      query += ` AND p.category_id = $${paramCount}`;
      params.push(categoryId);
    }

    query += `
      ORDER BY 
        COALESCE(fbt_score, 0) DESC,
        p.average_rating DESC
      LIMIT $${paramCount + 1}
    `;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;

  } catch (error) {
    console.error('Get frequently bought products error:', error);
    return [];
  }
}

// Get recently viewed products for a user
async function getRecentlyViewedProducts(userId, limit) {
  try {
    if (!userId) {
      return [];
    }

    const query = `
      SELECT p.*, c.name as category_name,
        rv.viewed_at,
        0.8 as score
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      JOIN recently_viewed rv ON p.id = rv.product_id
      WHERE p.is_active = true AND rv.user_id = $1
      ORDER BY rv.viewed_at DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);
    return result.rows;

  } catch (error) {
    console.error('Get recently viewed products error:', error);
    return [];
  }
}

// Get personalized recommendations based on user behavior
async function getPersonalizedRecommendations(userId, limit) {
  try {
    if (!userId) {
      return await getPopularProducts(null, limit);
    }

    // Get user's purchase history and preferences
    const userQuery = `
      SELECT 
        p.category_id,
        p.price_range,
        AVG(p.price) as avg_price,
        COUNT(*) as purchase_count
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = $1
      GROUP BY p.category_id, p.price_range
      ORDER BY purchase_count DESC
    `;

    const userResult = await pool.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      return await getPopularProducts(null, limit);
    }

    const userPreferences = userResult.rows[0];
    const preferredCategory = userPreferences.category_id;
    const avgPrice = userPreferences.avg_price;

    // Get recommendations based on user preferences
    const recQuery = `
      SELECT p.*, c.name as category_name,
        CASE 
          WHEN p.category_id = $1 THEN 0.9
          WHEN p.price BETWEEN $2 * 0.7 AND $2 * 1.3 THEN 0.8
          ELSE 0.6
        END as score
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
      ORDER BY score DESC, p.average_rating DESC
      LIMIT $3
    `;

    const result = await pool.query(recQuery, [preferredCategory, avgPrice, limit]);
    return result.rows;

  } catch (error) {
    console.error('Get personalized recommendations error:', error);
    return await getPopularProducts(null, limit);
  }
}

// Track product view for recommendations
router.post('/track-view', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Insert or update recently viewed
    await pool.query(`
      INSERT INTO recently_viewed (user_id, product_id, viewed_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET viewed_at = NOW()
    `, [userId, productId]);

    res.json({ success: true });

  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({ 
      message: 'Failed to track view',
      error: error.message 
    });
  }
});

// Get recommendation analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { type, period = '30' } = req.query;

    const analyticsQuery = `
      SELECT 
        recommendation_type,
        COUNT(*) as total_recommendations,
        AVG(click_rate) as avg_click_rate,
        AVG(conversion_rate) as avg_conversion_rate
      FROM recommendation_analytics
      WHERE created_at >= NOW() - INTERVAL '${parseInt(period)} days'
      ${type ? 'AND recommendation_type = $1' : ''}
      GROUP BY recommendation_type
      ORDER BY total_recommendations DESC
    `;

    const params = type ? [type] : [];
    const result = await pool.query(analyticsQuery, params);

    res.json({
      success: true,
      analytics: result.rows
    });

  } catch (error) {
    console.error('Get recommendation analytics error:', error);
    res.status(500).json({ 
      message: 'Failed to get analytics',
      error: error.message 
    });
  }
});

// Update recommendation feedback
router.post('/feedback', authenticateToken, async (req, res) => {
  try {
    const { productId, recommendationType, feedback, rating } = req.body;
    const userId = req.user.id;

    if (!productId || !recommendationType || !feedback) {
      return res.status(400).json({ message: 'Product ID, recommendation type, and feedback are required' });
    }

    await pool.query(`
      INSERT INTO recommendation_feedback (user_id, product_id, recommendation_type, feedback, rating, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (user_id, product_id, recommendation_type)
      DO UPDATE SET feedback = $4, rating = $5, updated_at = NOW()
    `, [userId, productId, recommendationType, feedback, rating || null]);

    res.json({ success: true });

  } catch (error) {
    console.error('Update feedback error:', error);
    res.status(500).json({ 
      message: 'Failed to update feedback',
      error: error.message 
    });
  }
});

module.exports = router;