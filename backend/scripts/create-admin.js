const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const createAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@neovolt.com']);
    
    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user with secure password
    const adminPassword = process.env.ADMIN_PASSWORD || 'NeovoltAdmin2024!Secure';
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role) 
      VALUES ($1, $2, $3, $4, $5)
    `, ['admin@neovolt.com', passwordHash, 'Admin', 'User', 'admin']);

    console.log('Admin user created successfully:');
    console.log('Email: admin@neovolt.com');
    console.log('Password: Check environment variable ADMIN_PASSWORD or use default');
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error; // Re-throw to ensure the process exits with error code
  }
  // Don't close the pool here as it's shared with the main application
};

createAdminUser();