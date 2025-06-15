import { z } from 'zod';

// Register schema
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(50, 'Password must not exceed 50 characters'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    specialization: z
      .string()
      .min(2, 'Specialization must be at least 2 characters'),
    interestId: z.string().uuid('Invalid interest ID').optional(),
  }),
});

// Login schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Update profile schema
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z
      .string()
      .min(2, 'First name must be at least 2 characters')
      .optional(),
    lastName: z
      .string()
      .min(2, 'Last name must be at least 2 characters')
      .optional(),
    specialization: z
      .string()
      .min(2, 'Specialization must be at least 2 characters')
      .optional(),
    bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
    interestId: z.string().uuid('Invalid interest ID').optional(),
  }),
});

// Create interest schema
export const createInterestSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Interest name must be at least 2 characters'),
    category: z.enum(
      ['PROGRAMMING', 'TESTING', 'ANALYTICS_DATA_SCIENCE', 'MANAGEMENT'],
      {
        errorMap: () => ({ message: 'Invalid category' }),
      }
    ),
  }),
});

// Update interest schema
export const updateInterestSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Interest name must be at least 2 characters')
      .optional(),
    category: z
      .enum(
        ['PROGRAMMING', 'TESTING', 'ANALYTICS_DATA_SCIENCE', 'MANAGEMENT'],
        {
          errorMap: () => ({ message: 'Invalid category' }),
        }
      )
      .optional(),
  }),
  params: z.object({
    id: z.string().uuid('Invalid interest ID'),
  }),
});

// Delete interest schema
export const deleteInterestSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid interest ID'),
  }),
});
