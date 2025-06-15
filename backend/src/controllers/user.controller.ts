import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import env from '../config/env';

// Register new user
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, firstName, lastName, specialization, interestId } =
      req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestError('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and profile
    const user = await prisma.user.create({
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
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET as string,
      { expiresIn: env.JWT_EXPIRES_IN } as SignOptions
    );

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
  } catch (error) {
    next(error);
  }
};

// Login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
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
      throw new BadRequestError('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestError('Invalid credentials');
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      env.JWT_SECRET as string,
      { expiresIn: env.JWT_EXPIRES_IN } as SignOptions
    );

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
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: {
          include: {
            interest: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
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
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, specialization, bio, interestId } = req.body;

    const updatedProfile = await prisma.profile.update({
      where: { userId: req.user!.id },
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
  } catch (error) {
    next(error);
  }
};

// Get all interests
export const getInterests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const interests = await prisma.interest.findMany({
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
  } catch (error) {
    next(error);
  }
};

// Create new interest (admin only)
export const createInterest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, category } = req.body;

    // Check if interest with this name already exists
    const existingInterest = await prisma.interest.findUnique({
      where: { name },
    });

    if (existingInterest) {
      throw new BadRequestError('Interest with this name already exists');
    }

    const interest = await prisma.interest.create({
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
  } catch (error) {
    next(error);
  }
};

// Update interest (admin only)
export const updateInterest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    // Check if interest exists
    const existingInterest = await prisma.interest.findUnique({
      where: { id },
    });

    if (!existingInterest) {
      throw new NotFoundError('Interest not found');
    }

    // Check if another interest with this name already exists (if name is being updated)
    if (name && name !== existingInterest.name) {
      const duplicateInterest = await prisma.interest.findUnique({
        where: { name },
      });

      if (duplicateInterest) {
        throw new BadRequestError('Interest with this name already exists');
      }
    }

    const updatedInterest = await prisma.interest.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(category && { category }),
      },
    });

    res.json({
      status: 'success',
      data: {
        interest: updatedInterest,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Delete interest (admin only)
export const deleteInterest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Check if interest exists
    const existingInterest = await prisma.interest.findUnique({
      where: { id },
    });

    if (!existingInterest) {
      throw new NotFoundError('Interest not found');
    }

    // Check if any profiles are using this interest
    const profilesUsingInterest = await prisma.profile.findMany({
      where: { interestId: id },
    });

    if (profilesUsingInterest.length > 0) {
      throw new BadRequestError(
        'Cannot delete interest that is being used by user profiles'
      );
    }

    await prisma.interest.delete({
      where: { id },
    });

    res.json({
      status: 'success',
      message: 'Interest deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
