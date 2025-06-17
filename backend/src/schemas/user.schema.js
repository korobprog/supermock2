"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminNotificationSchema = exports.checkUserBlockSchema = exports.unblockUserSchema = exports.blockUserSchema = exports.deleteInterestSchema = exports.updateInterestSchema = exports.createInterestSchema = exports.updateProfileSchema = exports.loginSchema = exports.registerSchema = void 0;
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
// Create interest schema
exports.createInterestSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Interest name must be at least 2 characters'),
        category: zod_1.z.enum(['PROGRAMMING', 'TESTING', 'ANALYTICS_DATA_SCIENCE', 'MANAGEMENT'], {
            errorMap: () => ({ message: 'Invalid category' }),
        }),
    }),
});
// Update interest schema
exports.updateInterestSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z
            .string()
            .min(2, 'Interest name must be at least 2 characters')
            .optional(),
        category: zod_1.z
            .enum(['PROGRAMMING', 'TESTING', 'ANALYTICS_DATA_SCIENCE', 'MANAGEMENT'], {
            errorMap: () => ({ message: 'Invalid category' }),
        })
            .optional(),
    }),
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid interest ID'),
    }),
});
// Delete interest schema
exports.deleteInterestSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().uuid('Invalid interest ID'),
    }),
});
// Block user schema
exports.blockUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        reason: zod_1.z.string().min(5, 'Reason must be at least 5 characters'),
        endDate: zod_1.z.string().datetime('Invalid end date format').optional(),
        isPermanent: zod_1.z.boolean().default(false),
    }),
    params: zod_1.z.object({
        userId: zod_1.z.string().uuid('Invalid user ID'),
    }),
});
// Unblock user schema
exports.unblockUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().uuid('Invalid user ID'),
    }),
});
// Check user block status schema
exports.checkUserBlockSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.string().uuid('Invalid user ID'),
    }),
});
// Send admin notification schema
exports.sendAdminNotificationSchema = zod_1.z.object({
    body: zod_1.z.object({
        message: zod_1.z.string().min(5, 'Message must be at least 5 characters'),
    }),
    params: zod_1.z.object({
        userId: zod_1.z.string().uuid('Invalid user ID'),
    }),
});
