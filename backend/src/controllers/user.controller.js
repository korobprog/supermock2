"use strict";
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
exports.checkUserBlockStatus = exports.unblockUser = exports.blockUser = exports.deleteInterest = exports.updateInterest = exports.createInterest = exports.getInterests = exports.removeAvatar = exports.uploadAvatar = exports.updateProfile = exports.getCurrentUser = exports.login = exports.register = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const points_controller_1 = require("./points.controller");
// Register new user
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, firstName, lastName, specialization, interestId } = req.body;
        // Check if user exists
        const existingUser = yield database_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new errors_1.BadRequestError('Email already registered');
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create user and profile
        const user = yield database_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                profile: {
                    create: {
                        firstName,
                        lastName,
                        specialization,
                        interestId,
                    },
                },
            },
            include: {
                profile: {
                    include: {
                        interest: true,
                    },
                },
            },
        });
        // Начисляем 1 балл новому пользователю
        try {
            yield (0, points_controller_1.addPointsToUser)(user.id, 1, 'Приветственный бонус за регистрацию');
            console.log(`✅ Начислен 1 балл пользователю ${user.email} за регистрацию`);
        }
        catch (pointsError) {
            console.error('❌ Ошибка при начислении баллов новому пользователю:', pointsError);
            // Не прерываем процесс регистрации, если не удалось начислить баллы
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, env_1.default.JWT_SECRET, { expiresIn: env_1.default.JWT_EXPIRES_IN });
        res.status(201).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    profile: user.profile,
                },
                token,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
// Login user
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user
        const user = yield database_1.prisma.user.findUnique({
            where: { email },
            include: {
                profile: {
                    include: {
                        interest: true,
                    },
                },
            },
        });
        if (!user) {
            throw new errors_1.BadRequestError('Invalid credentials');
        }
        // Check password
        const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new errors_1.BadRequestError('Invalid credentials');
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, env_1.default.JWT_SECRET, { expiresIn: env_1.default.JWT_EXPIRES_IN });
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    profile: user.profile,
                },
                token,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
// Get current user
const getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield database_1.prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                profile: {
                    include: {
                        interest: true,
                    },
                },
            },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    profile: user.profile,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getCurrentUser = getCurrentUser;
// Update user profile
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, specialization, bio, interestId } = req.body;
        const updatedProfile = yield database_1.prisma.profile.update({
            where: { userId: req.user.id },
            data: {
                firstName,
                lastName,
                specialization,
                bio,
                interestId,
            },
            include: {
                interest: true,
            },
        });
        res.json({
            status: 'success',
            data: {
                profile: updatedProfile,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProfile = updateProfile;
// Upload avatar
const uploadAvatar = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('🔍 [AVATAR DEBUG] Upload avatar controller called');
        console.log('🔍 [AVATAR DEBUG] User ID:', (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        console.log('🔍 [AVATAR DEBUG] Processed file info:', req.processedFile
            ? {
                filename: req.processedFile.filename,
                originalname: req.processedFile.originalname,
                mimetype: req.processedFile.mimetype,
                size: req.processedFile.size,
                path: req.processedFile.path,
            }
            : 'No processed file');
        if (!req.processedFile) {
            console.log('❌ [AVATAR DEBUG] No processed file in request');
            throw new errors_1.BadRequestError('Файл не был обработан');
        }
        // Получаем путь к файлу относительно папки uploads
        const avatarPath = `/uploads/avatars/${req.processedFile.filename}`;
        console.log('🔍 [AVATAR DEBUG] Avatar path:', avatarPath);
        // Обновляем профиль пользователя с новым аватаром
        console.log('🔍 [AVATAR DEBUG] Updating profile in database...');
        const updatedProfile = yield database_1.prisma.profile.update({
            where: { userId: req.user.id },
            data: {
                avatar: avatarPath,
            },
            include: {
                interest: true,
            },
        });
        console.log('✅ [AVATAR DEBUG] Profile updated successfully');
        res.json({
            status: 'success',
            data: {
                profile: updatedProfile,
                avatarUrl: avatarPath,
            },
            message: 'Аватар успешно загружен и обработан',
        });
    }
    catch (error) {
        console.log('❌ [AVATAR DEBUG] Error in uploadAvatar:', error);
        next(error);
    }
});
exports.uploadAvatar = uploadAvatar;
// Remove avatar
const removeAvatar = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log('🔍 [AVATAR DEBUG] Remove avatar controller called');
        console.log('🔍 [AVATAR DEBUG] User ID:', (_a = req.user) === null || _a === void 0 ? void 0 : _a.id);
        // Получаем текущий профиль пользователя
        const currentProfile = yield database_1.prisma.profile.findUnique({
            where: { userId: req.user.id },
        });
        if (!currentProfile) {
            throw new errors_1.NotFoundError('Profile not found');
        }
        // Если у пользователя есть аватар, удаляем файл
        if (currentProfile.avatar) {
            const avatarPath = path_1.default.join(process.cwd(), 'uploads', currentProfile.avatar.replace('/uploads/', ''));
            console.log('🔍 [AVATAR DEBUG] Attempting to delete file:', avatarPath);
            // Проверяем, существует ли файл, и удаляем его
            if (fs_1.default.existsSync(avatarPath)) {
                try {
                    fs_1.default.unlinkSync(avatarPath);
                    console.log('✅ [AVATAR DEBUG] Avatar file deleted successfully');
                }
                catch (error) {
                    console.error('❌ [AVATAR DEBUG] Error deleting avatar file:', error);
                    // Продолжаем выполнение, даже если не удалось удалить файл
                }
            }
            else {
                console.log('⚠️ [AVATAR DEBUG] Avatar file not found on disk');
            }
        }
        // Обновляем профиль, убирая аватар
        const updatedProfile = yield database_1.prisma.profile.update({
            where: { userId: req.user.id },
            data: {
                avatar: null,
            },
            include: {
                interest: true,
            },
        });
        console.log('✅ [AVATAR DEBUG] Profile updated, avatar removed');
        res.json({
            status: 'success',
            data: {
                profile: updatedProfile,
            },
            message: 'Аватар успешно удален',
        });
    }
    catch (error) {
        console.log('❌ [AVATAR DEBUG] Error in removeAvatar:', error);
        next(error);
    }
});
exports.removeAvatar = removeAvatar;
// Get all interests
const getInterests = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const interests = yield database_1.prisma.interest.findMany({
            orderBy: {
                name: 'asc',
            },
        });
        res.json({
            status: 'success',
            data: {
                interests,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getInterests = getInterests;
// Create new interest (admin only)
const createInterest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, category } = req.body;
        // Check if interest with this name already exists
        const existingInterest = yield database_1.prisma.interest.findUnique({
            where: { name },
        });
        if (existingInterest) {
            throw new errors_1.BadRequestError('Interest with this name already exists');
        }
        const interest = yield database_1.prisma.interest.create({
            data: {
                name,
                category,
            },
        });
        res.status(201).json({
            status: 'success',
            data: {
                interest,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createInterest = createInterest;
// Update interest (admin only)
const updateInterest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, category } = req.body;
        // Check if interest exists
        const existingInterest = yield database_1.prisma.interest.findUnique({
            where: { id },
        });
        if (!existingInterest) {
            throw new errors_1.NotFoundError('Interest not found');
        }
        // Check if another interest with this name already exists (if name is being updated)
        if (name && name !== existingInterest.name) {
            const duplicateInterest = yield database_1.prisma.interest.findUnique({
                where: { name },
            });
            if (duplicateInterest) {
                throw new errors_1.BadRequestError('Interest with this name already exists');
            }
        }
        const updatedInterest = yield database_1.prisma.interest.update({
            where: { id },
            data: Object.assign(Object.assign({}, (name && { name })), (category && { category })),
        });
        res.json({
            status: 'success',
            data: {
                interest: updatedInterest,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateInterest = updateInterest;
// Delete interest (admin only)
const deleteInterest = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // Check if interest exists
        const existingInterest = yield database_1.prisma.interest.findUnique({
            where: { id },
        });
        if (!existingInterest) {
            throw new errors_1.NotFoundError('Interest not found');
        }
        // Check if any profiles are using this interest
        const profilesUsingInterest = yield database_1.prisma.profile.findMany({
            where: { interestId: id },
        });
        if (profilesUsingInterest.length > 0) {
            throw new errors_1.BadRequestError('Cannot delete interest that is being used by user profiles');
        }
        yield database_1.prisma.interest.delete({
            where: { id },
        });
        res.json({
            status: 'success',
            message: 'Interest deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteInterest = deleteInterest;
// Block user (admin only)
const blockUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const { reason, endDate, isPermanent } = req.body;
        // Check if user exists
        const user = yield database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Check if user is already blocked
        const existingBlock = yield database_1.prisma.userBlock.findFirst({
            where: {
                userId,
                isActive: true,
            },
        });
        if (existingBlock) {
            throw new errors_1.BadRequestError('User is already blocked');
        }
        // Create user block
        const userBlock = yield database_1.prisma.userBlock.create({
            data: {
                userId,
                reason,
                endDate: endDate ? new Date(endDate) : null,
                isPermanent: isPermanent || false,
                isActive: true,
            },
        });
        res.status(201).json({
            status: 'success',
            data: {
                userBlock,
            },
            message: 'User blocked successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.blockUser = blockUser;
// Unblock user (admin only)
const unblockUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Check if user exists
        const user = yield database_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Find active block
        const activeBlock = yield database_1.prisma.userBlock.findFirst({
            where: {
                userId,
                isActive: true,
            },
        });
        if (!activeBlock) {
            throw new errors_1.BadRequestError('User is not currently blocked');
        }
        // Deactivate the block
        const updatedBlock = yield database_1.prisma.userBlock.update({
            where: { id: activeBlock.id },
            data: {
                isActive: false,
                updatedAt: new Date(),
            },
        });
        res.json({
            status: 'success',
            data: {
                userBlock: updatedBlock,
            },
            message: 'User unblocked successfully',
        });
    }
    catch (error) {
        next(error);
    }
});
exports.unblockUser = unblockUser;
// Check user block status (admin only)
const checkUserBlockStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        // Check if user exists
        const user = yield database_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
            },
        });
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        // Find active block
        const activeBlock = yield database_1.prisma.userBlock.findFirst({
            where: {
                userId,
                isActive: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Check if block has expired
        let isBlocked = false;
        if (activeBlock) {
            if (activeBlock.isPermanent) {
                isBlocked = true;
            }
            else if (activeBlock.endDate) {
                isBlocked = new Date() < activeBlock.endDate;
                // If block has expired, deactivate it
                if (!isBlocked) {
                    yield database_1.prisma.userBlock.update({
                        where: { id: activeBlock.id },
                        data: { isActive: false },
                    });
                }
            }
            else {
                isBlocked = true;
            }
        }
        res.json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    profile: user.profile,
                },
                isBlocked,
                blockInfo: isBlocked ? activeBlock : null,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.checkUserBlockStatus = checkUserBlockStatus;
