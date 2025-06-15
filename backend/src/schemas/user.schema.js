"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// Register schema
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z
            .string()
            .min(6, 'Password must be at least 6 characters')
            .max(50, 'Password must not exceed 50 characters'),
        firstName: zod_1.z.string().min(2, 'First name must be at least 2 characters'),
        lastName: zod_1.z.string().min(2, 'Last name must be at least 2 characters'),
        specialization: zod_1.z
            .string()
            .min(2, 'Specialization must be at least 2 characters'),
        interestId: zod_1.z.string().uuid('Invalid interest ID').optional(),
    }),
});
// Login schema
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
// Update profile schema
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z
            .string()
            .min(2, 'First name must be at least 2 characters')
            .optional(),
        lastName: zod_1.z
            .string()
            .min(2, 'Last name must be at least 2 characters')
            .optional(),
        specialization: zod_1.z
            .string()
            .min(2, 'Specialization must be at least 2 characters')
            .optional(),
        bio: zod_1.z.string().max(500, 'Bio must not exceed 500 characters').optional(),
        interestId: zod_1.z.string().uuid('Invalid interest ID').optional(),
    }),
});
