"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadError = exports.uploadAvatar = void 0;
const multer_1 = __importDefault(require("multer"));
const sharp_1 = __importDefault(require("sharp"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
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
const storage = multer_1.default.memoryStorage();
// Фильтр для проверки типа файла
const fileFilter = (req, file, cb) => {
    console.log('🔍 [UPLOAD DEBUG] File filter called:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        fieldname: file.fieldname,
    });
    // Разрешаем только изображения
    if (file.mimetype.startsWith('image/')) {
        console.log('✅ [UPLOAD DEBUG] File type accepted');
        cb(null, true);
    }
    else {
        console.log('❌ [UPLOAD DEBUG] File type rejected');
        cb(new Error('Только изображения разрешены для загрузки!'), false);
    }
};
// Настройка multer
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB максимум
    },
    fileFilter: fileFilter,
});
// Middleware для обработки загрузки аватара
const uploadAvatar = (req, res, next) => {
    console.log('🔍 [UPLOAD DEBUG] uploadAvatar middleware called');
    console.log('🔍 [UPLOAD DEBUG] Request method:', req.method);
    console.log('🔍 [UPLOAD DEBUG] Request path:', req.path);
    console.log('🔍 [UPLOAD DEBUG] Request URL:', req.url);
    console.log('🔍 [UPLOAD DEBUG] Original URL:', req.originalUrl);
    console.log('🔍 [UPLOAD DEBUG] Content-Type:', req.headers['content-type']);
    const uploadSingle = upload.single('avatar');
    uploadSingle(req, res, (err) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('🔍 [UPLOAD DEBUG] Upload callback called');
        if (err) {
            console.log('❌ [UPLOAD DEBUG] Upload error in middleware:', err);
            console.log('❌ [UPLOAD DEBUG] Error type:', typeof err);
            console.log('❌ [UPLOAD DEBUG] Error constructor:', err.constructor.name);
            return next(err);
        }
        console.log('✅ [UPLOAD DEBUG] Upload middleware completed successfully');
        console.log('🔍 [UPLOAD DEBUG] File after upload:', req.file ? 'Present' : 'Missing');
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
            yield (0, sharp_1.default)(req.file.buffer)
                .resize(300, 300, {
                fit: 'cover',
                position: 'center',
            })
                .webp({ quality: 80 })
                .toFile(filepath);
            console.log('✅ [UPLOAD DEBUG] Image processed and saved successfully');
            // Добавляем информацию о файле в req для использования в контроллере
            req.processedFile = {
                filename: filename,
                path: filepath,
                originalname: req.file.originalname,
                mimetype: 'image/webp',
                size: fs.statSync(filepath).size,
            };
            console.log('🔍 [UPLOAD DEBUG] Processed file info:', req.processedFile);
            next();
        }
        catch (processError) {
            console.log('❌ [UPLOAD DEBUG] Error processing image:', processError);
            next(processError);
        }
    }));
};
exports.uploadAvatar = uploadAvatar;
// Middleware для обработки ошибок загрузки
const handleUploadError = (err, req, res, next) => {
    console.log('🔍 [UPLOAD DEBUG] Upload error handler called');
    if (err instanceof multer_1.default.MulterError) {
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
    console.log('✅ [UPLOAD DEBUG] No upload errors, proceeding to next middleware');
    next();
};
exports.handleUploadError = handleUploadError;
