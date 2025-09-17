const pool = require('../config/database');

const createTables = async () => {
  try {
    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Categories table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        image_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock_quantity INTEGER DEFAULT 0,
        category_id INTEGER REFERENCES categories(id),
        image_url VARCHAR(500),
        specifications JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cart table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);

    // Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        order_number VARCHAR(50) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
        total_amount DECIMAL(10,2) NOT NULL,
        shipping_address JSONB NOT NULL,
        payment_method VARCHAR(50),
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_id VARCHAR(255),
        tracking_number VARCHAR(255),
        shipping_status VARCHAR(20) DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'shipped', 'in_transit', 'delivered', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Order items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default categories
    await pool.query(`
      INSERT INTO categories (name, description) VALUES 
      ('Dutch Connectors', 'High-quality Dutch electrical connectors and plugs'),
      ('Wall Sockets', 'Dutch wall sockets and outlets'),
      ('Cables', 'Electrical cables and wiring'),
      ('Tools', 'Electrical tools and equipment')
      ON CONFLICT DO NOTHING
    `);

    // Insert sample products
    await pool.query(`
      INSERT INTO products (name, description, price, stock_quantity, category_id, specifications) VALUES 
      ('DT Series Plug', 'High-quality Dutch Type F plug with grounding pin', 12.99, 100, 1, '{"type": "Type F", "voltage": "230V", "current": "16A", "material": "Fire-resistant plastic"}'),
      ('DT Series Socket', 'Dutch wall socket with Type F outlets', 18.99, 50, 2, '{"type": "Type F", "outlets": 2, "voltage": "230V", "current": "16A"}'),
      ('Premium Power Cable', 'Heavy-duty power cable for industrial use', 25.99, 75, 3, '{"length": "5m", "gauge": "2.5mm²", "voltage": "300V", "material": "Copper"}'),
      ('Electrical Tester', 'Digital multimeter for electrical testing', 45.99, 30, 4, '{"display": "LCD", "measurements": "Voltage, Current, Resistance", "safety": "CAT III 600V"}')
      ON CONFLICT DO NOTHING
    `);

    // Add tracking columns to existing orders table if they don't exist
    try {
      await pool.query(`
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(255),
        ADD COLUMN IF NOT EXISTS shipping_status VARCHAR(20) DEFAULT 'pending' CHECK (shipping_status IN ('pending', 'shipped', 'in_transit', 'delivered', 'cancelled'))
      `);
      console.log('Added tracking columns to orders table');
    } catch (error) {
      console.log('Tracking columns may already exist:', error.message);
    }

    // Add WhatsApp opt-in column to users table
    try {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
      `);
      console.log('Added WhatsApp columns to users table');
    } catch (error) {
      console.log('WhatsApp columns may already exist:', error.message);
    }

    // Create newsletters table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletters (
        id SERIAL PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'general' CHECK (type IN ('general', 'promotional', 'announcement', 'product_update')),
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'cancelled')),
        scheduled_at TIMESTAMP,
        sent_at TIMESTAMP,
        sent_count INTEGER DEFAULT 0,
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create WhatsApp messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS whatsapp_messages (
        id SERIAL PRIMARY KEY,
        from_number VARCHAR(20) NOT NULL,
        message_id VARCHAR(255) UNIQUE NOT NULL,
        message_type VARCHAR(50) NOT NULL,
        content TEXT,
        sender_name VARCHAR(255),
        timestamp TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create reviews table
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

    // Create indexes for reviews table
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

    // Add product rating columns
    try {
      await pool.query(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0
      `);
      console.log('Added rating columns to products table');
    } catch (error) {
      console.log('Rating columns may already exist:', error.message);
    }

    // Add cost tracking columns to products
    try {
      await pool.query(`
        ALTER TABLE products 
        ADD COLUMN IF NOT EXISTS cost_price DECIMAL(10,2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS profit_margin DECIMAL(5,2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS supplier VARCHAR(255),
        ADD COLUMN IF NOT EXISTS sku VARCHAR(100),
        ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2),
        ADD COLUMN IF NOT EXISTS dimensions JSONB
      `);
      console.log('Added cost tracking columns to products table');
    } catch (error) {
      console.log('Cost tracking columns may already exist:', error.message);
    }

    // Add shipping cost columns to orders
    try {
      await pool.query(`
        ALTER TABLE orders 
        ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10,2) DEFAULT 0.00,
        ADD COLUMN IF NOT EXISTS shipping_method VARCHAR(50),
        ADD COLUMN IF NOT EXISTS shipping_service VARCHAR(50),
        ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP,
        ADD COLUMN IF NOT EXISTS shipping_address JSONB,
        ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100),
        ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20),
        ADD COLUMN IF NOT EXISTS shipping_country VARCHAR(50)
      `);
      console.log('Added shipping cost columns to orders table');
    } catch (error) {
      console.log('Shipping cost columns may already exist:', error.message);
    }

    // Create financial reports table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS financial_reports (
        id SERIAL PRIMARY KEY,
        report_type VARCHAR(50) NOT NULL,
        period VARCHAR(10) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create company settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(100) UNIQUE NOT NULL,
        setting_value JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert default company settings
    await pool.query(`
      INSERT INTO company_settings (setting_key, setting_value) VALUES 
      ('company_info', '{"name": "Neovolt", "vatNumber": "VAT123456789", "address": "Cape Town, South Africa", "contact": {"phone": "+27-XX-XXX-XXXX", "email": "info@neovolt.com"}}'),
      ('tax_settings', '{"vatRate": 0.15, "currency": "ZAR", "taxInclusive": true}'),
      ('pricing_settings', '{"defaultMargin": 30, "bulkDiscounts": [{"minQty": 10, "discount": 5}, {"minQty": 50, "discount": 10}]}')
      ON CONFLICT (setting_key) DO NOTHING
    `);

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error; // Re-throw to ensure the process exits with error code
  }
  // Don't close the pool here as it's shared with the main application
};

createTables();