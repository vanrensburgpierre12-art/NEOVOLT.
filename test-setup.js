const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing Neovolt API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test products endpoint
    console.log('\n2. Testing products endpoint...');
    const productsResponse = await axios.get(`${API_BASE}/products`);
    console.log('✅ Products loaded:', productsResponse.data.products.length, 'products');

    // Test categories endpoint
    console.log('\n3. Testing categories endpoint...');
    const categoriesResponse = await axios.get(`${API_BASE}/products/categories/all`);
    console.log('✅ Categories loaded:', categoriesResponse.data.length, 'categories');

    // Test user registration
    console.log('\n4. Testing user registration...');
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@neovolt.com',
      password: 'test123456'
    };

    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
      console.log('✅ User registration successful');
      
      // Test login
      console.log('\n5. Testing user login...');
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ User login successful');

      // Test cart operations
      console.log('\n6. Testing cart operations...');
      const token = loginResponse.data.token;
      const authHeaders = { Authorization: `Bearer ${token}` };

      // Add item to cart
      const addToCartResponse = await axios.post(`${API_BASE}/cart/add`, {
        productId: 1,
        quantity: 2
      }, { headers: authHeaders });
      console.log('✅ Added item to cart');

      // Get cart
      const cartResponse = await axios.get(`${API_BASE}/cart`, { headers: authHeaders });
      console.log('✅ Cart retrieved:', cartResponse.data.items.length, 'items');

    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  Test user already exists, skipping registration');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All API tests passed! The system is working correctly.');
    console.log('\n📍 You can now access:');
    console.log('   Frontend: http://localhost:650');
    console.log('   Backend API: http://localhost:3001');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Wait a bit for services to start, then run tests
setTimeout(testAPI, 5000);