const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Конфигурация
const API_BASE_URL = 'http://localhost:3000/api/v1';
const TEST_IMAGE_PATH = path.join(__dirname, 'test-avatar.png');

// Функция для создания тестового изображения, если его нет
function createTestImage() {
  if (!fs.existsSync(TEST_IMAGE_PATH)) {
    console.log('📁 Creating test image...');
    // Создаем простое PNG изображение (1x1 пиксель)
    const pngData = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x0f, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x5c, 0xcd, 0x90, 0x0e, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    fs.writeFileSync(TEST_IMAGE_PATH, pngData);
    console.log('✅ Test image created');
  }
}

// Функция для логина и получения токена
async function login() {
  try {
    console.log('🔐 Attempting to login...');
    const response = await axios.post(`${API_BASE_URL}/users/login`, {
      email: 'test@example.com',
      password: 'test123',
    });

    const token = response.data.data.token;
    console.log('✅ Login successful, token received');
    return token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Функция для загрузки аватара
async function uploadAvatar(token) {
  try {
    console.log('📤 Uploading avatar...');

    // Создаем FormData
    const formData = new FormData();
    const fileStream = fs.createReadStream(TEST_IMAGE_PATH);
    formData.append('avatar', fileStream, {
      filename: 'test-avatar.png',
      contentType: 'image/png',
    });

    console.log('🔍 Making upload request to:', `${API_BASE_URL}/users/avatar`);
    console.log('🔍 Using token:', token ? 'Present' : 'Missing');

    const response = await axios.post(
      `${API_BASE_URL}/users/avatar`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000, // 30 секунд
      }
    );

    console.log('✅ Avatar upload successful!');
    console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('❌ Avatar upload failed:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Data:', error.response?.data);
    console.error('Headers:', error.response?.headers);
    throw error;
  }
}

// Основная функция
async function main() {
  try {
    console.log('🚀 Starting avatar upload test...');
    console.log('🔍 API Base URL:', API_BASE_URL);

    // Создаем тестовое изображение
    createTestImage();

    // Логинимся
    const token = await login();

    // Загружаем аватар
    await uploadAvatar(token);

    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  }
}

// Запускаем тест
main();
