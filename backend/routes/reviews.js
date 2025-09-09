const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get reviews for a product
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT r.*, u.first_name, u.last_name, u.email
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = $1 AND r.is_approved = true
    `;
    const queryParams = [productId];
    let paramCount = 1;

    if (rating) {
      paramCount++;
      query += ` AND r.rating = $${paramCount}`;
      queryParams.push(parseInt(rating));
    }

    query += ` ORDER BY r.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(parseInt(limit), offset);

    const result = await pool.query(query, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM reviews WHERE product_id = $1 AND is_approved = true';
    const countParams = [productId];
    let countParamCount = 1;

    if (rating) {
      countParamCount++;
      countQuery += ` AND rating = $${countParamCount}`;
      countParams.push(parseInt(rating));
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    // Get rating distribution
    const distributionResult = await pool.query(`
      SELECT rating, COUNT(*) as count
      FROM reviews
      WHERE product_id = $1 AND is_approved = true
      GROUP BY rating
      ORDER BY rating DESC
    `, [productId]);

    const ratingDistribution = {};
    for (let i = 1; i <= 5; i++) {
      ratingDistribution[i] = 0;
    }
    distributionResult.rows.forEach(row => {
      ratingDistribution[row.rating] = parseInt(row.count);
    });

    res.json({
      reviews: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      ratingDistribution
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's reviews
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const result = await pool.query(`
      SELECT r.*, p.name as product_name, p.image_url as product_image
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), offset]);

    // Get total count
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM reviews WHERE user_id = $1',
      [req.user.id]
    );
    const total = parseInt(countResult.rows[0].count);

    res.json({
      reviews: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a review
router.post('/', authenticateToken, [
  body('productId').isInt(),
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').notEmpty().trim().isLength({ min: 1, max: 255 }),
  body('comment').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, rating, title, comment } = req.body;

    // Check if user has already reviewed this product
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    // Check if user has purchased this product (for verified reviews)
    const purchaseResult = await pool.query(`
      SELECT oi.id
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status != 'cancelled'
    `, [req.user.id, productId]);

    const isVerified = purchaseResult.rows.length > 0;

    // Create the review
    const result = await pool.query(`
      INSERT INTO reviews (user_id, product_id, rating, title, comment, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.user.id, productId, rating, title, comment, isVerified]);

    // Update product rating statistics
    await updateProductRatings(productId);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a review
router.put('/:reviewId', authenticateToken, [
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('comment').optional().trim().isLength({ max: 1000 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { reviewId } = req.params;
    const { rating, title, comment } = req.body;

    // Check if review exists and belongs to user
    const reviewResult = await pool.query(
      'SELECT * FROM reviews WHERE id = $1 AND user_id = $2',
      [reviewId, req.user.id]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const updates = {};
    const values = [];
    let paramCount = 0;

    if (rating !== undefined) {
      paramCount++;
      updates.rating = rating;
      values.push(rating);
    }

    if (title !== undefined) {
      paramCount++;
      updates.title = title;
      values.push(title);
    }

    if (comment !== undefined) {
      paramCount++;
      updates.comment = comment;
      values.push(comment);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(reviewId);
    const updateFields = Object.keys(updates).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const query = `UPDATE reviews SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount + 1} RETURNING *`;

    const result = await pool.query(query, values);

    // Update product rating statistics
    await updateProductRatings(reviewResult.rows[0].product_id);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a review
router.delete('/:reviewId', authenticateToken, async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Check if review exists and belongs to user
    const reviewResult = await pool.query(
      'SELECT product_id FROM reviews WHERE id = $1 AND user_id = $2',
      [reviewId, req.user.id]
    );

    if (reviewResult.rows.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const productId = reviewResult.rows[0].product_id;

    await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);

    // Update product rating statistics
    await updateProductRatings(productId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update product rating statistics
async function updateProductRatings(productId) {
  try {
    const result = await pool.query(`
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as review_count
      FROM reviews 
      WHERE product_id = $1 AND is_approved = true
    `, [productId]);

    const { average_rating, review_count } = result.rows[0];
    const avgRating = average_rating ? parseFloat(average_rating).toFixed(2) : 0.00;
    const count = parseInt(review_count) || 0;

    await pool.query(
      'UPDATE products SET average_rating = $1, review_count = $2 WHERE id = $3',
      [avgRating, count, productId]
    );
  } catch (error) {
    console.error('Error updating product ratings:', error);
  }
}

module.exports = router;