const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

async function testAvatarUpload() {
  try {
    console.log('🔍 Тестирование загрузки аватарки...');

    // Проверяем, что тестовое изображение существует
    const imagePath = path.join(__dirname, 'test-avatar.png');
    if (!fs.existsSync(imagePath)) {
      console.log('❌ Тестовое изображение не найдено:', imagePath);
      return;
    }

    // Создаем FormData
    const form = new FormData();
    form.append('avatar', fs.createReadStream(imagePath));

    console.log('📤 Отправляем запрос на загрузку аватарки...');
    console.log('🔗 URL:', 'http://localhost:3000/api/v1/users/avatar');

    // Отправляем запрос
    const response = await axios.post(
      'http://localhost:3000/api/v1/users/avatar',
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijc1Nzc4MGE3LTk1ZWYtNGJkZi1hNjg3LTY4MGY1ZGMwMTYzZCIsImVtYWlsIjoia29yb2Jwcm9nQGdtYWlsLmNvbSIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc1MDAxMTU4MSwiZXhwIjoxNzUwMDk3OTgxfQ.eK-A_tKhFTMrT6n8oyVvcEqSzZ5o9Dx2kjJhudHiHcA',
        },
        timeout: 10000,
      }
    );

    console.log('✅ Успешный ответ!');
    console.log('📊 Статус:', response.status);
    console.log('📄 Данные:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Ошибка при загрузке аватарки:');

    if (error.response) {
      console.log('📊 Статус ошибки:', error.response.status);
      console.log(
        '📄 Данные ошибки:',
        JSON.stringify(error.response.data, null, 2)
      );
      console.log('🔍 Заголовки ответа:', error.response.headers);
    } else if (error.request) {
      console.log('📡 Запрос был отправлен, но ответ не получен');
      console.log('🔍 Детали запроса:', error.request);
    } else {
      console.log('⚠️ Ошибка настройки запроса:', error.message);
    }

    console.log('🔍 Полная ошибка:', error);
  }
}

// Запускаем тест
testAvatarUpload();
