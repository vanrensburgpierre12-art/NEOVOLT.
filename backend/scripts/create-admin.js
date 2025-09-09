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

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role) 
      VALUES ($1, $2, $3, $4, $5)
    `, ['admin@neovolt.com', passwordHash, 'Admin', 'User', 'admin']);

    console.log('Admin user created successfully:');
    console.log('Email: admin@neovolt.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
};

createAdminUser();