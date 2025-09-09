const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neovolt:neovolt123@localhost:5432/neovolt'
});

async function addReviewsTable() {
  try {
    console.log('Creating reviews table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        title VARCHAR(255) NOT NULL,
        comment TEXT,
        is_verified BOOLEAN DEFAULT false,
        is_approved BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    console.log('Creating indexes for reviews table...');
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
    `);
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
    `);

    console.log('Reviews table created successfully!');
    
    // Add product rating columns
    console.log('Adding rating columns to products table...');
    
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
      ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0
    `);

    console.log('Product rating columns added successfully!');
    
  } catch (error) {
    console.error('Error creating reviews table:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  addReviewsTable()
    .then(() => {
      console.log('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addReviewsTable;