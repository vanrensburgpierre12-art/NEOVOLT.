const pool = require('../config/database');

const testConnection = async () => {
  let retries = 10;
  let delay = 2000; // Start with 2 seconds
  
  while (retries > 0) {
    try {
      console.log(`Testing database connection... (${11 - retries}/10)`);
      console.log('DATABASE_URL:', process.env.DATABASE_URL);
      
      const client = await pool.connect();
      console.log('✅ Database connection successful!');
      
      // Test a simple query
      const result = await client.query('SELECT NOW() as current_time');
      console.log('✅ Query test successful:', result.rows[0]);
      
      client.release();
      console.log('✅ Connection test completed successfully');
      return; // Success, exit the function
    } catch (error) {
      retries--;
      console.error(`❌ Database connection failed (${11 - retries}/10):`);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error detail:', error.detail);
      console.error('Error hint:', error.hint);
      
      if (retries > 0) {
        console.log(`Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 1.5, 10000); // Increase delay up to 10 seconds max
      } else {
        console.error('❌ All connection attempts failed');
        process.exit(1);
      }
    }
  }
};

testConnection();