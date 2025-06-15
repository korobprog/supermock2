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
exports.getInterests = exports.updateProfile = exports.getCurrentUser = exports.login = exports.register = void 0;
const database_1 = require("../config/database");
const errors_1 = require("../utils/errors");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = __importDefault(require("../config/env"));
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
