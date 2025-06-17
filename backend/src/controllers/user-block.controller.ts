import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

// Блокировка пользователя
export const blockUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId, reason, isPermanent, endDate } = req.body;

    if (!userId || !reason) {
      throw new BadRequestError(
        'ID пользователя и причина блокировки обязательны'
      );
    }

    if (!isPermanent && !endDate) {
      throw new BadRequestError(
        'Для временной блокировки необходимо указать дату окончания'
      );
    }

    if (isPermanent && endDate) {
      throw new BadRequestError(
        'Для постоянной блокировки не нужно указывать дату окончания'
      );
    }

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    // Проверяем, нет ли уже активной блокировки
    const existingActiveBlock = await prisma.userBlock.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (existingActiveBlock) {
      throw new BadRequestError('У пользователя уже есть активная блокировка');
    }

    // Создаем блокировку
    const userBlock = await prisma.userBlock.create({
      data: {
        userId,
        reason,
        isPermanent: isPermanent || false,
        endDate: isPermanent ? null : new Date(endDate),
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        block: {
          id: userBlock.id,
          userId: userBlock.userId,
          reason: userBlock.reason,
          isPermanent: userBlock.isPermanent,
          startDate: userBlock.startDate.toISOString(),
          endDate: userBlock.endDate?.toISOString() || null,
          isActive: userBlock.isActive,
          createdAt: userBlock.createdAt.toISOString(),
        },
        user: {
          id: user.id,
          email: user.email,
          profile: user.profile,
        },
      },
      message: 'Пользователь успешно заблокирован',
    });
  } catch (error) {
    next(error);
  }
};

// Разблокировка пользователя
export const unblockUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Находим блокировку
    const userBlock = await prisma.userBlock.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!userBlock) {
      throw new NotFoundError('Блокировка не найдена');
    }

    if (!userBlock.isActive) {
      throw new BadRequestError('Блокировка уже неактивна');
    }

    // Деактивируем блокировку
    const updatedBlock = await prisma.userBlock.update({
      where: { id },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    res.json({
      status: 'success',
      data: {
        block: {
          id: updatedBlock.id,
          userId: updatedBlock.userId,
          reason: updatedBlock.reason,
          isPermanent: updatedBlock.isPermanent,
          startDate: updatedBlock.startDate.toISOString(),
          endDate: updatedBlock.endDate?.toISOString() || null,
          isActive: updatedBlock.isActive,
          updatedAt: updatedBlock.updatedAt.toISOString(),
        },
        user: {
          id: userBlock.user.id,
          email: userBlock.user.email,
          profile: userBlock.user.profile,
        },
      },
      message: 'Пользователь успешно разблокирован',
    });
  } catch (error) {
    next(error);
  }
};

// Получение истории блокировок пользователя
export const getUserBlocks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [userBlocks, totalCount] = await Promise.all([
      prisma.userBlock.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.userBlock.count({
        where: { userId },
      }),
    ]);

    const formattedBlocks = userBlocks.map((block) => ({
      id: block.id,
      reason: block.reason,
      isPermanent: block.isPermanent,
      startDate: block.startDate.toISOString(),
      endDate: block.endDate?.toISOString() || null,
      isActive: block.isActive,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
    }));

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          profile: user.profile,
        },
        blocks: formattedBlocks,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Получение всех активных блокировок
export const getAllActiveBlocks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [activeBlocks, totalCount] = await Promise.all([
      prisma.userBlock.findMany({
        where: {
          isActive: true,
          OR: [
            { isPermanent: true },
            {
              isPermanent: false,
              endDate: {
                gt: new Date(),
              },
            },
          ],
        },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.userBlock.count({
        where: {
          isActive: true,
          OR: [
            { isPermanent: true },
            {
              isPermanent: false,
              endDate: {
                gt: new Date(),
              },
            },
          ],
        },
      }),
    ]);

    const formattedBlocks = activeBlocks.map((block) => ({
      id: block.id,
      userId: block.userId,
      reason: block.reason,
      isPermanent: block.isPermanent,
      startDate: block.startDate.toISOString(),
      endDate: block.endDate?.toISOString() || null,
      isActive: block.isActive,
      createdAt: block.createdAt.toISOString(),
      updatedAt: block.updatedAt.toISOString(),
      user: {
        id: block.user.id,
        email: block.user.email,
        profile: block.user.profile,
      },
    }));

    res.json({
      status: 'success',
      data: {
        blocks: formattedBlocks,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          totalPages: Math.ceil(totalCount / Number(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Проверка активной блокировки пользователя (вспомогательная функция)
export const checkUserBlock = async (userId: string) => {
  const activeBlock = await prisma.userBlock.findFirst({
    where: {
      userId,
      isActive: true,
      OR: [
        { isPermanent: true },
        {
          isPermanent: false,
          endDate: {
            gt: new Date(),
          },
        },
      ],
    },
  });

  return activeBlock;
};
