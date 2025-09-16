const pool = require('../config/database');

const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL);
    
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query test successful:', result.rows[0]);
    
    client.release();
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Error detail:', error.detail);
    console.error('Error hint:', error.hint);
    process.exit(1);
  }
};

testConnection();