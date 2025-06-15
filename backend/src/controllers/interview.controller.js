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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteInterview = exports.updateInterview = exports.createInterview = exports.getInterviewFeedback = exports.getInterviews = void 0;
const database_1 = require("../config/database");
// Mock data for development
const mockInterviews = [
    {
        id: 1,
        title: 'Frontend Developer Interview',
        date: '2025-06-14T10:00:00Z',
        status: 'completed',
        score: 85,
        interestCategory: 'PROGRAMMING',
    },
    {
        id: 2,
        title: 'React Specialist Interview',
        date: '2025-06-13T14:30:00Z',
        status: 'completed',
        score: 92,
        interestCategory: 'PROGRAMMING',
    },
    {
        id: 3,
        title: 'JavaScript Assessment',
        date: '2025-06-12T09:15:00Z',
        status: 'completed',
        score: 78,
        interestCategory: 'PROGRAMMING',
    },
    {
        id: 4,
        title: 'QA Testing Interview',
        date: '2025-06-11T11:00:00Z',
        status: 'completed',
        score: 88,
        interestCategory: 'TESTING',
    },
    {
        id: 5,
        title: 'Data Analysis Interview',
        date: '2025-06-10T15:00:00Z',
        status: 'completed',
        score: 91,
        interestCategory: 'ANALYTICS_DATA_SCIENCE',
    },
];
const mockFeedback = [
    {
        id: 1,
        interviewId: 1,
        content: 'Отличное понимание React hooks и state management',
        date: '2025-06-14T11:00:00Z',
        rating: 5,
    },
    {
        id: 2,
        interviewId: 2,
        content: 'Хорошие знания TypeScript, но нужно улучшить алгоритмы',
        date: '2025-06-13T15:30:00Z',
        rating: 4,
    },
    {
        id: 3,
        interviewId: 3,
        content: 'Базовые знания JavaScript в порядке, рекомендуется изучить ES6+',
        date: '2025-06-12T10:15:00Z',
        rating: 3,
    },
];
const getInterviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Получаем профиль пользователя с интересом
        const userProfile = yield database_1.prisma.profile.findUnique({
            where: { userId: req.user.id },
            include: {
                interest: true,
            },
        });
        let filteredInterviews = mockInterviews;
        // Фильтруем интервью по интересу пользователя, если интерес указан
        if (userProfile === null || userProfile === void 0 ? void 0 : userProfile.interest) {
            filteredInterviews = mockInterviews.filter((interview) => interview.interestCategory === userProfile.interest.category);
        }
        // В реальном приложении здесь будет запрос к базе данных
        // const interviews = await prisma.interview.findMany({
        //   where: {
        //     userId: req.user.id,
        //     ...(userProfile?.interest && {
        //       specialization: { contains: userProfile.interest.category }
        //     })
        //   },
        //   orderBy: { createdAt: 'desc' }
        // });
        res.json(filteredInterviews);
    }
    catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ error: 'Failed to fetch interviews' });
    }
});
exports.getInterviews = getInterviews;
const getInterviewFeedback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // В реальном приложении здесь будет запрос к базе данных
        // const feedback = await prisma.feedback.findMany({
        //   where: {
        //     interview: { userId: req.user.id }
        //   },
        //   orderBy: { createdAt: 'desc' }
        // });
        res.json(mockFeedback);
    }
    catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback' });
    }
});
exports.getInterviewFeedback = getInterviewFeedback;
const createInterview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, date, description } = req.body;
        console.log('Получены данные для создания интервью:', req.body);
        // В реальном приложении здесь будет создание интервью в базе данных
        const newInterview = {
            id: mockInterviews.length + 1,
            title,
            date: date || new Date().toISOString(),
            status: 'scheduled',
            score: 0, // Начальный балл для нового интервью
            interestCategory: 'PROGRAMMING', // По умолчанию
        };
        // Добавляем новое интервью в массив
        mockInterviews.push(newInterview);
        console.log('Создано новое интервью:', newInterview);
        res.status(201).json(newInterview);
    }
    catch (error) {
        console.error('Error creating interview:', error);
        res.status(500).json({ error: 'Failed to create interview' });
    }
});
exports.createInterview = createInterview;
const updateInterview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { title, date, description } = req.body;
        console.log('Обновление интервью:', id, req.body);
        // Находим интервью по ID
        const interviewIndex = mockInterviews.findIndex((interview) => interview.id === parseInt(id));
        if (interviewIndex === -1) {
            return res.status(404).json({ error: 'Interview not found' });
        }
        // Обновляем интервью
        mockInterviews[interviewIndex] = Object.assign(Object.assign({}, mockInterviews[interviewIndex]), { title, date: date || mockInterviews[interviewIndex].date });
        console.log('Интервью обновлено:', mockInterviews[interviewIndex]);
        res.json(mockInterviews[interviewIndex]);
    }
    catch (error) {
        console.error('Error updating interview:', error);
        res.status(500).json({ error: 'Failed to update interview' });
    }
});
exports.updateInterview = updateInterview;
const deleteInterview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        console.log('Удаление интервью:', id);
        // Находим индекс интервью
        const interviewIndex = mockInterviews.findIndex((interview) => interview.id === parseInt(id));
        if (interviewIndex === -1) {
            return res.status(404).json({ error: 'Interview not found' });
        }
        // Удаляем интервью
        const deletedInterview = mockInterviews.splice(interviewIndex, 1)[0];
        console.log('Интервью удалено:', deletedInterview);
        res.json({ message: 'Interview deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting interview:', error);
        res.status(500).json({ error: 'Failed to delete interview' });
    }
});
exports.deleteInterview = deleteInterview;
