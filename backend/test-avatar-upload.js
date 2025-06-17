const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testAvatarUpload() {
  try {
    console.log('🧪 [TEST] Starting avatar upload test...');

    // Сначала логинимся, чтобы получить токен
    console.log('🔐 [TEST] Logging in...');
    const loginResponse = await axios.post(
      'http://localhost:3000/api/v1/users/login',
      {
        email: 'test@example.com',
        password: 'test123',
      }
    );

    const token = loginResponse.data.data.token;
    console.log('✅ [TEST] Login successful, token received');

    // Проверяем, существует ли тестовый файл
    const testImagePath = path.join(__dirname, 'test-avatar.png');
    if (!fs.existsSync(testImagePath)) {
      console.log('❌ [TEST] Test image not found at:', testImagePath);
      return;
    }

    // Создаем FormData для загрузки файла
    const form = new FormData();
    form.append('avatar', fs.createReadStream(testImagePath));

    console.log('📤 [TEST] Uploading avatar...');
    console.log('📤 [TEST] URL: http://localhost:3000/api/v1/users/avatar');
    console.log('📤 [TEST] Headers:', {
      Authorization: `Bearer ${token}`,
      ...form.getHeaders(),
    });

    // Отправляем запрос на загрузку аватарки
    const uploadResponse = await axios.post(
      'http://localhost:3000/api/v1/users/avatar',
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          ...form.getHeaders(),
        },
      }
    );

    console.log('✅ [TEST] Avatar upload successful!');
    console.log('📋 [TEST] Response:', uploadResponse.data);
  } catch (error) {
    console.log('❌ [TEST] Error during avatar upload test:');
    if (error.response) {
      console.log('📋 [TEST] Status:', error.response.status);
      console.log('📋 [TEST] Data:', error.response.data);
      console.log('📋 [TEST] Headers:', error.response.headers);
    } else {
      console.log('📋 [TEST] Error message:', error.message);
    }
  }
}

testAvatarUpload();
