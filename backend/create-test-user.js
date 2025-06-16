const axios = require('axios');

async function createTestUser() {
  try {
    console.log('👤 [TEST] Creating test user...');

    const response = await axios.post(
      'http://localhost:3000/api/v1/users/register',
      {
        email: 'test@example.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User',
        specialization: 'Developer',
      }
    );

    console.log('✅ [TEST] Test user created successfully!');
    console.log('📋 [TEST] Response:', response.data);
  } catch (error) {
    console.log('❌ [TEST] Error creating test user:');
    if (error.response) {
      console.log('📋 [TEST] Status:', error.response.status);
      console.log('📋 [TEST] Data:', error.response.data);
    } else {
      console.log('📋 [TEST] Error message:', error.message);
    }
  }
}

createTestUser();
