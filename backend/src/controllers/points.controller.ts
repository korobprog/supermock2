import { Request, Response } from 'express';
import { prisma } from '../config/database';

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
export const getUserPointsBalance = async (req: Request, res: Response) => {
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
    console.error('Error fetching user points balance:', error);
    res.status(500).json({ error: 'Failed to fetch points balance' });
  }
};

// Получение истории транзакций с баллами
export const getUserPointsTransactions = async (
  req: Request,
  res: Response
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
    console.error('Error fetching user points transactions:', error);
    res.status(500).json({ error: 'Failed to fetch points transactions' });
  }
};
