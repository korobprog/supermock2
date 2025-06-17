import multer from 'multer';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import { Request, Response, NextFunction } from 'express';

// Создаем папки для загрузки файлов при старте сервера
const uploadsDir = path.join(process.cwd(), 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');

if (!fs.existsSync(uploadsDir)) {
  console.log('📁 Creating uploads directory...');
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(avatarsDir)) {
  console.log('📁 Creating avatars directory...');
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Настройка хранения файлов в памяти для обработки через Sharp
const storage = multer.memoryStorage();

// Фильтр для проверки типа файла
const fileFilter = (req: any, file: any, cb: any) => {
  console.log('🔍 [UPLOAD DEBUG] File filter called:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname,
  });

  // Разрешаем только изображения
  if (file.mimetype.startsWith('image/')) {
    console.log('✅ [UPLOAD DEBUG] File type accepted');
    cb(null, true);
  } else {
    console.log('❌ [UPLOAD DEBUG] File type rejected');
    cb(new Error('Только изображения разрешены для загрузки!'), false);
  }
};

// Настройка multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB максимум
  },
  fileFilter: fileFilter,
});

// Middleware для обработки загрузки аватара
export const uploadAvatar = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('🔍 [UPLOAD DEBUG] uploadAvatar middleware called');
  console.log('🔍 [UPLOAD DEBUG] Request method:', req.method);
  console.log('🔍 [UPLOAD DEBUG] Request path:', req.path);
  console.log('🔍 [UPLOAD DEBUG] Request URL:', req.url);
  console.log('🔍 [UPLOAD DEBUG] Original URL:', req.originalUrl);
  console.log('🔍 [UPLOAD DEBUG] Content-Type:', req.headers['content-type']);

  const uploadSingle = upload.single('avatar');

  uploadSingle(req, res, async (err) => {
    console.log('🔍 [UPLOAD DEBUG] Upload callback called');

    if (err) {
      console.log('❌ [UPLOAD DEBUG] Upload error in middleware:', err);
      console.log('❌ [UPLOAD DEBUG] Error type:', typeof err);
      console.log('❌ [UPLOAD DEBUG] Error constructor:', err.constructor.name);
      return next(err);
    }

    console.log('✅ [UPLOAD DEBUG] Upload middleware completed successfully');
    console.log(
      '🔍 [UPLOAD DEBUG] File after upload:',
      req.file ? 'Present' : 'Missing'
    );

    if (!req.file) {
      console.log('❌ [UPLOAD DEBUG] No file in request');
      return next(new Error('Файл не был загружен'));
    }

    try {
      console.log('🔍 [UPLOAD DEBUG] Processing image with Sharp...');

      // Генерируем уникальное имя файла
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = `avatar-${uniqueSuffix}.webp`;
      const filepath = path.join(avatarsDir, filename);

      console.log('🔍 [UPLOAD DEBUG] Generated filename:', filename);
      console.log('🔍 [UPLOAD DEBUG] File path:', filepath);

      // Обрабатываем изображение с помощью Sharp
      await sharp(req.file.buffer)
        .resize(300, 300, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toFile(filepath);

      console.log('✅ [UPLOAD DEBUG] Image processed and saved successfully');

      // Добавляем информацию о файле в req для использования в контроллере
      (req as any).processedFile = {
        filename: filename,
        path: filepath,
        originalname: req.file.originalname,
        mimetype: 'image/webp',
        size: fs.statSync(filepath).size,
      };

      console.log(
        '🔍 [UPLOAD DEBUG] Processed file info:',
        (req as any).processedFile
      );
      next();
    } catch (processError) {
      console.log('❌ [UPLOAD DEBUG] Error processing image:', processError);
      next(processError);
    }
  });
};

// Middleware для обработки ошибок загрузки
export const handleUploadError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('🔍 [UPLOAD DEBUG] Upload error handler called');

  if (err instanceof multer.MulterError) {
    console.log('❌ [UPLOAD DEBUG] Multer error:', err.code, err.message);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        status: 'error',
        message: 'Файл слишком большой. Максимальный размер: 10MB',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        status: 'error',
        message: 'Неожиданное поле файла. Используйте поле "avatar"',
      });
    }
  }

  if (err) {
    console.log('❌ [UPLOAD DEBUG] General upload error:', err.message);
    return res.status(400).json({
      status: 'error',
      message: err.message || 'Ошибка при загрузке файла',
    });
  }

  console.log(
    '✅ [UPLOAD DEBUG] No upload errors, proceeding to next middleware'
  );
  next();
};
