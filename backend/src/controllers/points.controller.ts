import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { BadRequestError, NotFoundError } from '../utils/errors';

// Функция для начисления баллов пользователю
export const addPointsToUser = async (
  userId: string,
  amount: number,
  description: string
) => {
  try {
    const pointsTransaction = await prisma.pointsTransaction.create({
      data: {
        userId,
        amount,
        type: 'EARNED',
        description,
      },
    });
    return pointsTransaction;
  } catch (error) {
    console.error('Error adding points to user:', error);
    throw error;
  }
};

// Получение текущего баланса баллов пользователя
export const getUserPointsBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pointsTransactions = await prisma.pointsTransaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    const currentBalance = pointsTransactions.reduce((sum, transaction) => {
      return transaction.type === 'EARNED'
        ? sum + transaction.amount
        : sum - transaction.amount;
    }, 0);

    res.json({ balance: currentBalance });
  } catch (error) {
    next(error);
  }
};

// Функция для вычитания баллов у пользователя
export const subtractPointsFromUser = async (
  userId: string,
  amount: number,
  description: string
) => {
  try {
    const pointsTransaction = await prisma.pointsTransaction.create({
      data: {
        userId,
        amount,
        type: 'SPENT',
        description,
      },
    });
    return pointsTransaction;
  } catch (error) {
    console.error('Error subtracting points from user:', error);
    throw error;
  }
};

// Добавление баллов пользователю администратором
export const addPointsByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      throw new BadRequestError(
        'Количество баллов должно быть положительным числом'
      );
    }

    if (!description || description.trim().length === 0) {
      throw new BadRequestError('Описание транзакции обязательно');
    }

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    const transaction = await addPointsToUser(
      userId,
      amount,
      `[Администратор] ${description}`
    );

    res.status(201).json({
      status: 'success',
      data: {
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          createdAt: transaction.createdAt.toISOString(),
        },
      },
      message: 'Баллы успешно добавлены пользователю',
    });
  } catch (error) {
    next(error);
  }
};

// Вычитание баллов у пользователя администратором
export const subtractPointsByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      throw new BadRequestError(
        'Количество баллов должно быть положительным числом'
      );
    }

    if (!description || description.trim().length === 0) {
      throw new BadRequestError('Описание транзакции обязательно');
    }

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    const transaction = await subtractPointsFromUser(
      userId,
      amount,
      `[Администратор] ${description}`
    );

    res.status(201).json({
      status: 'success',
      data: {
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          createdAt: transaction.createdAt.toISOString(),
        },
      },
      message: 'Баллы успешно вычтены у пользователя',
    });
  } catch (error) {
    next(error);
  }
};

// Получение баланса баллов пользователя администратором
export const getUserPointsBalanceByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

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

    const pointsTransactions = await prisma.pointsTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const currentBalance = pointsTransactions.reduce((sum, transaction) => {
      return transaction.type === 'EARNED'
        ? sum + transaction.amount
        : sum - transaction.amount;
    }, 0);

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          profile: user.profile,
        },
        balance: currentBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Получение истории транзакций пользователя администратором
export const getUserPointsTransactionsByAdmin = async (
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

    const [pointsTransactions, totalCount] = await Promise.all([
      prisma.pointsTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.pointsTransaction.count({
        where: { userId },
      }),
    ]);

    const formattedTransactions = pointsTransactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
    }));

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          profile: user.profile,
        },
        transactions: formattedTransactions,
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

// Редактирование баллов пользователя администратором
export const editUserPointsByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { newBalance, description } = req.body;

    if (typeof newBalance !== 'number') {
      throw new BadRequestError('Новый баланс должен быть числом');
    }

    if (!description || description.trim().length === 0) {
      throw new BadRequestError('Описание изменения обязательно');
    }

    // Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    // Получаем текущий баланс
    const pointsTransactions = await prisma.pointsTransaction.findMany({
      where: { userId },
    });

    const currentBalance = pointsTransactions.reduce((sum, transaction) => {
      return transaction.type === 'EARNED'
        ? sum + transaction.amount
        : sum - transaction.amount;
    }, 0);

    // Вычисляем разность
    const difference = newBalance - currentBalance;

    if (difference === 0) {
      return res.json({
        status: 'success',
        message: 'Баланс пользователя уже соответствует указанному значению',
        data: {
          currentBalance,
          newBalance,
        },
      });
    }

    // Создаем транзакцию для корректировки баланса
    const transaction = await prisma.pointsTransaction.create({
      data: {
        userId,
        amount: Math.abs(difference),
        type: difference > 0 ? 'EARNED' : 'SPENT',
        description: `[Администратор] Корректировка баланса: ${description}`,
      },
    });

    res.json({
      status: 'success',
      data: {
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          createdAt: transaction.createdAt.toISOString(),
        },
        previousBalance: currentBalance,
        newBalance,
        difference,
      },
      message: 'Баланс пользователя успешно изменен',
    });
  } catch (error) {
    next(error);
  }
};

// Получение истории транзакций с баллами
export const getUserPointsTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pointsTransactions = await prisma.pointsTransaction.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    const formattedTransactions = pointsTransactions.map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
      description: transaction.description,
      createdAt: transaction.createdAt.toISOString(),
    }));

    res.json(formattedTransactions);
  } catch (error) {
    next(error);
  }
};
