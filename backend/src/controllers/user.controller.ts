import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import env from '../config/env';
import fs from 'fs';
import path from 'path';
import { addPointsToUser } from './points.controller';

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

    // Начисляем 1 балл новому пользователю
    try {
      await addPointsToUser(user.id, 1, 'Приветственный бонус за регистрацию');
      console.log(
        `✅ Начислен 1 балл пользователю ${user.email} за регистрацию`
      );
    } catch (pointsError) {
      console.error(
        '❌ Ошибка при начислении баллов новому пользователю:',
        pointsError
      );
      // Не прерываем процесс регистрации, если не удалось начислить баллы
    }

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
  } catch (error) {
    next(error);
  }
};

// Upload avatar
export const uploadAvatar = async (
  req: Request & { file?: any; processedFile?: any },
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔍 [AVATAR DEBUG] Upload avatar controller called');
    console.log('🔍 [AVATAR DEBUG] User ID:', req.user?.id);
    console.log(
      '🔍 [AVATAR DEBUG] Processed file info:',
      req.processedFile
        ? {
            filename: req.processedFile.filename,
            originalname: req.processedFile.originalname,
            mimetype: req.processedFile.mimetype,
            size: req.processedFile.size,
            path: req.processedFile.path,
          }
        : 'No processed file'
    );

    if (!req.processedFile) {
      console.log('❌ [AVATAR DEBUG] No processed file in request');
      throw new BadRequestError('Файл не был обработан');
    }

    // Получаем путь к файлу относительно папки uploads
    const avatarPath = `/uploads/avatars/${req.processedFile.filename}`;
    console.log('🔍 [AVATAR DEBUG] Avatar path:', avatarPath);

    // Обновляем профиль пользователя с новым аватаром
    console.log('🔍 [AVATAR DEBUG] Updating profile in database...');
    const updatedProfile = await prisma.profile.update({
      where: { userId: req.user!.id },
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
  } catch (error) {
    console.log('❌ [AVATAR DEBUG] Error in uploadAvatar:', error);
    next(error);
  }
};

// Remove avatar
export const removeAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log('🔍 [AVATAR DEBUG] Remove avatar controller called');
    console.log('🔍 [AVATAR DEBUG] User ID:', req.user?.id);

    // Получаем текущий профиль пользователя
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!currentProfile) {
      throw new NotFoundError('Profile not found');
    }

    // Если у пользователя есть аватар, удаляем файл
    if (currentProfile.avatar) {
      const avatarPath = path.join(
        process.cwd(),
        'uploads',
        currentProfile.avatar.replace('/uploads/', '')
      );

      console.log('🔍 [AVATAR DEBUG] Attempting to delete file:', avatarPath);

      // Проверяем, существует ли файл, и удаляем его
      if (fs.existsSync(avatarPath)) {
        try {
          fs.unlinkSync(avatarPath);
          console.log('✅ [AVATAR DEBUG] Avatar file deleted successfully');
        } catch (error) {
          console.error('❌ [AVATAR DEBUG] Error deleting avatar file:', error);
          // Продолжаем выполнение, даже если не удалось удалить файл
        }
      } else {
        console.log('⚠️ [AVATAR DEBUG] Avatar file not found on disk');
      }
    }

    // Обновляем профиль, убирая аватар
    const updatedProfile = await prisma.profile.update({
      where: { userId: req.user!.id },
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
  } catch (error) {
    console.log('❌ [AVATAR DEBUG] Error in removeAvatar:', error);
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

// Block user (admin only)
export const blockUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { reason, endDate, isPermanent } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user is already blocked
    const existingBlock = await prisma.userBlock.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (existingBlock) {
      throw new BadRequestError('User is already blocked');
    }

    // Create user block
    const userBlock = await prisma.userBlock.create({
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
  } catch (error) {
    next(error);
  }
};

// Unblock user (admin only)
export const unblockUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Find active block
    const activeBlock = await prisma.userBlock.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (!activeBlock) {
      throw new BadRequestError('User is not currently blocked');
    }

    // Deactivate the block
    const updatedBlock = await prisma.userBlock.update({
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
  } catch (error) {
    next(error);
  }
};

// Check user block status (admin only)
export const checkUserBlockStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Find active block
    const activeBlock = await prisma.userBlock.findFirst({
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
      } else if (activeBlock.endDate) {
        isBlocked = new Date() < activeBlock.endDate;
        // If block has expired, deactivate it
        if (!isBlocked) {
          await prisma.userBlock.update({
            where: { id: activeBlock.id },
            data: { isActive: false },
          });
        }
      } else {
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
  } catch (error) {
    next(error);
  }
};
