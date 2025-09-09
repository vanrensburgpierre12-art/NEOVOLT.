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

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
};

createTables();