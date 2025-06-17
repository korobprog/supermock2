import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { prisma } from '../config/database';

export const createTimeSlot = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { startTime, endTime, specialization } = req.body;

    // Проверяем, что пользователь имеет роль интервьюера
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || (user.role !== 'INTERVIEWER' && user.role !== 'ADMIN')) {
      return res.status(403).json({
        error: 'Только интервьюеры могут создавать временные слоты',
      });
    }

    // Проверяем, что временной слот не пересекается с существующими
    const conflictingSlot = await prisma.timeSlot.findFirst({
      where: {
        interviewerId: req.user.id,
        status: { not: 'CANCELLED' },
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } },
            ],
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } },
            ],
          },
          {
            AND: [
              { startTime: { gte: new Date(startTime) } },
              { endTime: { lte: new Date(endTime) } },
            ],
          },
        ],
      },
    });

    if (conflictingSlot) {
      return res.status(400).json({
        error: 'Временной слот пересекается с существующим слотом',
      });
    }

    const timeSlot = await prisma.timeSlot.create({
      data: {
        interviewerId: req.user.id,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        specialization,
        status: 'AVAILABLE',
      },
      include: {
        interviewer: {
          include: {
            profile: true,
          },
        },
      },
    });

    res.status(201).json(timeSlot);
  } catch (error) {
    console.error('Error creating time slot:', error);
    res.status(500).json({ error: 'Failed to create time slot' });
  }
};

export const getTimeSlots = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { specialization, status, startDate, endDate, interviewerId } =
      req.query;

    console.log('🔍 [DEBUG BACKEND] getTimeSlots called with params:', {
      specialization,
      status,
      startDate,
      endDate,
      interviewerId,
      userId: req.user.id,
      userRole: req.user.role,
    });

    // Проверим общее количество слотов в базе
    const totalSlotsCount = await prisma.timeSlot.count();
    console.log(
      '🔍 [DEBUG BACKEND] Общее количество слотов в базе:',
      totalSlotsCount
    );

    // Проверим количество доступных слотов
    const availableSlotsCount = await prisma.timeSlot.count({
      where: { status: 'AVAILABLE' },
    });
    console.log(
      '🔍 [DEBUG BACKEND] Количество доступных слотов:',
      availableSlotsCount
    );

    const whereConditions: any = {};

    // Фильтрация по специализации (точное совпадение)
    if (specialization) {
      whereConditions.specialization = specialization as string;
    }

    // Фильтрация по статусу
    if (status) {
      whereConditions.status = status;
    }
    // Убираем автоматическую фильтрацию по AVAILABLE - пусть фронтенд сам решает что показывать

    // Фильтрация по интервьюеру
    if (interviewerId) {
      whereConditions.interviewerId = interviewerId;
    }

    // Фильтрация по датам
    if (startDate || endDate) {
      whereConditions.startTime = {};
      if (startDate) {
        console.log('🔍 [DEBUG BACKEND] Парсинг startDate:', startDate);
        try {
          const parsedStartDate = new Date(startDate as string);
          console.log(
            '🔍 [DEBUG BACKEND] Распарсенная startDate:',
            parsedStartDate
          );
          whereConditions.startTime.gte = parsedStartDate;
        } catch (error) {
          console.error('🔍 [DEBUG BACKEND] Ошибка парсинга startDate:', error);
        }
      }
      if (endDate) {
        console.log('🔍 [DEBUG BACKEND] Парсинг endDate:', endDate);
        try {
          const parsedEndDate = new Date(endDate as string);
          console.log(
            '🔍 [DEBUG BACKEND] Распарсенная endDate:',
            parsedEndDate
          );
          // Для endDate добавляем 23:59:59 чтобы включить весь день
          parsedEndDate.setHours(23, 59, 59, 999);
          whereConditions.startTime.lte = parsedEndDate;
        } catch (error) {
          console.error('🔍 [DEBUG BACKEND] Ошибка парсинга endDate:', error);
        }
      }
    } else {
      // Если не указана дата, показываем только будущие слоты
      console.log(
        '🔍 [DEBUG BACKEND] Фильтр по дате не указан, показываем только будущие слоты'
      );
      whereConditions.startTime = {
        gte: new Date(), // Только будущие слоты
      };
    }

    // Убираем автоматическую фильтрацию по времени - пусть фронтенд сам решает что показывать
    // Это позволит показывать активные собеседования, даже если они уже начались

    console.log(
      '🔍 [DEBUG] Final whereConditions:',
      JSON.stringify(whereConditions, null, 2)
    );

    const timeSlots = await prisma.timeSlot.findMany({
      where: whereConditions,
      include: {
        interviewer: {
          include: {
            profile: true,
          },
        },
        booking: {
          include: {
            candidate: {
              include: {
                profile: true,
              },
            },
            interview: {
              select: {
                id: true,
                status: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });

    console.log('🔍 [DEBUG] Found timeSlots count:', timeSlots.length);
    console.log(
      '🔍 [DEBUG] TimeSlots with bookings:',
      timeSlots
        .filter((slot) => slot.booking)
        .map((slot) => ({
          id: slot.id,
          status: slot.status,
          startTime: slot.startTime,
          booking: {
            id: slot.booking?.id,
            status: slot.booking?.status,
            interview: slot.booking?.interview,
          },
        }))
    );

    res.json(timeSlots);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    res.status(500).json({ error: 'Failed to fetch time slots' });
  }
};

export const updateTimeSlot = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, specialization, status } = req.body;

    // Проверяем, что временной слот принадлежит пользователю
    const existingSlot = await prisma.timeSlot.findFirst({
      where: {
        id,
        interviewerId: req.user.id,
      },
      include: {
        booking: true,
      },
    });

    if (!existingSlot) {
      return res.status(404).json({
        error: 'Временной слот не найден или доступ запрещен',
      });
    }

    // Проверяем, что слот не забронирован, если пытаемся изменить время
    if ((startTime || endTime) && existingSlot.booking) {
      return res.status(400).json({
        error: 'Нельзя изменить время забронированного слота',
      });
    }

    const updateData: any = {};
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (specialization !== undefined)
      updateData.specialization = specialization;
    if (status !== undefined) updateData.status = status;

    // Если изменяем время, проверяем на пересечения
    if (startTime || endTime) {
      const newStartTime = startTime
        ? new Date(startTime)
        : existingSlot.startTime;
      const newEndTime = endTime ? new Date(endTime) : existingSlot.endTime;

      const conflictingSlot = await prisma.timeSlot.findFirst({
        where: {
          id: { not: id },
          interviewerId: req.user.id,
          status: { not: 'CANCELLED' },
          OR: [
            {
              AND: [
                { startTime: { lte: newStartTime } },
                { endTime: { gt: newStartTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: newEndTime } },
                { endTime: { gte: newEndTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: newStartTime } },
                { endTime: { lte: newEndTime } },
              ],
            },
          ],
        },
      });

      if (conflictingSlot) {
        return res.status(400).json({
          error: 'Временной слот пересекается с существующим слотом',
        });
      }
    }

    const updatedSlot = await prisma.timeSlot.update({
      where: { id },
      data: updateData,
      include: {
        interviewer: {
          include: {
            profile: true,
          },
        },
        booking: {
          include: {
            candidate: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    res.json(updatedSlot);
  } catch (error) {
    console.error('Error updating time slot:', error);
    res.status(500).json({ error: 'Failed to update time slot' });
  }
};

export const deleteTimeSlot = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Проверяем, что временной слот принадлежит пользователю
    const existingSlot = await prisma.timeSlot.findFirst({
      where: {
        id,
        interviewerId: req.user.id,
      },
      include: {
        booking: true,
      },
    });

    if (!existingSlot) {
      return res.status(404).json({
        error: 'Временной слот не найден или доступ запрещен',
      });
    }

    // Проверяем, что слот не забронирован
    if (existingSlot.booking && existingSlot.booking.status !== 'CANCELLED') {
      return res.status(400).json({
        error: 'Нельзя удалить забронированный временной слот',
      });
    }

    await prisma.timeSlot.delete({
      where: { id },
    });

    res.json({ message: 'Временной слот успешно удален' });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    res.status(500).json({ error: 'Failed to delete time slot' });
  }
};

export const getTimeSlotById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const timeSlot = await prisma.timeSlot.findUnique({
      where: { id },
      include: {
        interviewer: {
          include: {
            profile: true,
          },
        },
        booking: {
          include: {
            candidate: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    if (!timeSlot) {
      return res.status(404).json({ error: 'Временной слот не найден' });
    }

    // Проверяем права доступа
    if (
      timeSlot.interviewerId !== req.user.id &&
      timeSlot.booking?.candidateId !== req.user.id
    ) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    res.json(timeSlot);
  } catch (error) {
    console.error('Error fetching time slot:', error);
    res.status(500).json({ error: 'Failed to fetch time slot' });
  }
};
