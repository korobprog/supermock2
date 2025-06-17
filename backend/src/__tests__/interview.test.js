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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const client_1 = require("@prisma/client");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_routes_1 = __importDefault(require("../routes/user.routes"));
const interview_routes_1 = __importDefault(require("../routes/interview.routes"));
const notification_routes_1 = __importDefault(require("../routes/notification.routes"));
const errors_1 = require("../utils/errors");
const prisma = new client_1.PrismaClient();
// Создаем тестовое приложение
const createTestApp = () => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // API Routes
    app.use('/api/users', user_routes_1.default);
    app.use('/api/interviews', interview_routes_1.default);
    app.use('/api/notifications', notification_routes_1.default);
    app.use(errors_1.errorHandler);
    return app;
};
// Мок данные для тестов
const mockInterviewer = {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'interviewer@example.com',
    password: 'hashedpassword123',
};
const mockParticipant = {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'participant@example.com',
    password: 'hashedpassword123',
};
// Генерация JWT токена для тестов
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'test-secret', {
        expiresIn: '1h',
    });
};
describe('Interview API Tests', () => {
    let app;
    let interviewerToken;
    let participantToken;
    let createdInterviewId;
    beforeAll(() => {
        app = createTestApp();
    });
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Создаем тестовых пользователей
        yield prisma.user.create({
            data: Object.assign(Object.assign({}, mockInterviewer), { profile: {
                    create: {
                        firstName: 'Interviewer',
                        lastName: 'User',
                        specialization: 'PROGRAMMING',
                        bio: 'Test interviewer bio',
                    },
                } }),
        });
        yield prisma.user.create({
            data: Object.assign(Object.assign({}, mockParticipant), { profile: {
                    create: {
                        firstName: 'Participant',
                        lastName: 'User',
                        specialization: 'PROGRAMMING',
                        bio: 'Test participant bio',
                    },
                } }),
        });
        // Генерируем токены
        interviewerToken = generateToken(mockInterviewer.id);
        participantToken = generateToken(mockParticipant.id);
    }));
    describe('GET /interviews', () => {
        it('должен возвращать список интервью для авторизованного пользователя', () => __awaiter(void 0, void 0, void 0, function* () {
            // Создаем тестовое интервью
            const interview = yield prisma.interview.create({
                data: {
                    title: 'Test Interview',
                    description: 'Test Description',
                    specialization: 'PROGRAMMING',
                    interviewerId: mockInterviewer.id,
                    participantId: mockParticipant.id,
                    scheduledAt: new Date(),
                    duration: 60,
                },
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/interviews')
                .set('Authorization', `Bearer ${interviewerToken}`)
                .expect(200);
            expect(response.body.interviews).toHaveLength(1);
            expect(response.body.interviews[0].title).toBe('Test Interview');
            expect(response.body.interviews[0].id).toBe(interview.id);
        }));
        it('должен фильтровать интервью по статусу', () => __awaiter(void 0, void 0, void 0, function* () {
            yield prisma.interview.createMany({
                data: [
                    {
                        title: 'Scheduled Interview',
                        description: 'Test Description',
                        specialization: 'PROGRAMMING',
                        interviewerId: mockInterviewer.id,
                        status: 'SCHEDULED',
                        scheduledAt: new Date(),
                        duration: 60,
                    },
                    {
                        title: 'Completed Interview',
                        description: 'Test Description',
                        specialization: 'PROGRAMMING',
                        interviewerId: mockInterviewer.id,
                        status: 'COMPLETED',
                        scheduledAt: new Date(),
                        duration: 60,
                    },
                ],
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/interviews?status=SCHEDULED')
                .set('Authorization', `Bearer ${interviewerToken}`)
                .expect(200);
            expect(response.body.interviews).toHaveLength(1);
            expect(response.body.interviews[0].status).toBe('SCHEDULED');
        }));
        it('должен возвращать 401 для неавторизованного пользователя', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app).get('/api/interviews').expect(401);
        }));
    });
    describe('POST /interviews', () => {
        it('должен создавать новое интервью с валидными данными', () => __awaiter(void 0, void 0, void 0, function* () {
            const interviewData = {
                title: 'New Interview',
                description: 'New Interview Description',
                specialization: 'PROGRAMMING',
                scheduledAt: new Date().toISOString(),
                duration: 90,
            };
            const response = yield (0, supertest_1.default)(app)
                .post('/api/interviews')
                .set('Authorization', `Bearer ${interviewerToken}`)
                .send(interviewData)
                .expect(201);
            expect(response.body.title).toBe(interviewData.title);
            expect(response.body.description).toBe(interviewData.description);
            expect(response.body.interviewerId).toBe(mockInterviewer.id);
            createdInterviewId = response.body.id;
            // Проверяем, что интервью создано в базе данных
            const dbInterview = yield prisma.interview.findUnique({
                where: { id: response.body.id },
            });
            expect(dbInterview).toBeTruthy();
        }));
        it('должен возвращать ошибку валидации для невалидных данных', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = {
                title: 'AB', // Слишком короткое название
                description: 'Short', // Слишком короткое описание
                duration: 5, // Слишком короткая продолжительность
            };
            yield (0, supertest_1.default)(app)
                .post('/api/interviews')
                .set('Authorization', `Bearer ${interviewerToken}`)
                .send(invalidData)
                .expect(400);
        }));
    });
    describe('GET /interviews/:id', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const interview = yield prisma.interview.create({
                data: {
                    title: 'Test Interview',
                    description: 'Test Description',
                    specialization: 'PROGRAMMING',
                    interviewerId: mockInterviewer.id,
                    participantId: mockParticipant.id,
                    scheduledAt: new Date(),
                    duration: 60,
                },
            });
            createdInterviewId = interview.id;
        }));
        it('должен возвращать интервью по ID для интервьюера', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/interviews/${createdInterviewId}`)
                .set('Authorization', `Bearer ${interviewerToken}`)
                .expect(200);
            expect(response.body.id).toBe(createdInterviewId);
            expect(response.body.title).toBe('Test Interview');
            expect(response.body.interviewer).toBeTruthy();
            expect(response.body.participant).toBeTruthy();
        }));
        it('должен возвращать интервью по ID для участника', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/interviews/${createdInterviewId}`)
                .set('Authorization', `Bearer ${participantToken}`)
                .expect(200);
            expect(response.body.id).toBe(createdInterviewId);
        }));
        it('должен возвращать 404 для несуществующего интервью', () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
            yield (0, supertest_1.default)(app)
                .get(`/api/interviews/${nonExistentId}`)
                .set('Authorization', `Bearer ${interviewerToken}`)
                .expect(404);
        }));
    });
    describe('PATCH /interviews/:id', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const interview = yield prisma.interview.create({
                data: {
                    title: 'Test Interview',
                    description: 'Test Description',
                    specialization: 'PROGRAMMING',
                    interviewerId: mockInterviewer.id,
                    scheduledAt: new Date(),
                    duration: 60,
                },
            });
            createdInterviewId = interview.id;
        }));
        it('должен обновлять интервью для интервьюера', () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                title: 'Updated Interview',
                status: 'IN_PROGRESS',
                participantId: mockParticipant.id,
            };
            const response = yield (0, supertest_1.default)(app)
                .patch(`/api/interviews/${createdInterviewId}`)
                .set('Authorization', `Bearer ${interviewerToken}`)
                .send(updateData)
                .expect(200);
            expect(response.body.title).toBe('Updated Interview');
            expect(response.body.status).toBe('IN_PROGRESS');
            expect(response.body.participantId).toBe(mockParticipant.id);
        }));
        it('должен запрещать обновление для участника', () => __awaiter(void 0, void 0, void 0, function* () {
            const updateData = {
                title: 'Updated Interview',
            };
            yield (0, supertest_1.default)(app)
                .patch(`/api/interviews/${createdInterviewId}`)
                .set('Authorization', `Bearer ${participantToken}`)
                .send(updateData)
                .expect(404);
        }));
    });
    describe('DELETE /interviews/:id', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const interview = yield prisma.interview.create({
                data: {
                    title: 'Test Interview',
                    description: 'Test Description',
                    specialization: 'PROGRAMMING',
                    interviewerId: mockInterviewer.id,
                    scheduledAt: new Date(),
                    duration: 60,
                },
            });
            createdInterviewId = interview.id;
        }));
        it('должен удалять интервью для интервьюера', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .delete(`/api/interviews/${createdInterviewId}`)
                .set('Authorization', `Bearer ${interviewerToken}`)
                .expect(200);
            // Проверяем, что интервью удалено из базы данных
            const deletedInterview = yield prisma.interview.findUnique({
                where: { id: createdInterviewId },
            });
            expect(deletedInterview).toBeNull();
        }));
        it('должен запрещать удаление для участника', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, supertest_1.default)(app)
                .delete(`/api/interviews/${createdInterviewId}`)
                .set('Authorization', `Bearer ${participantToken}`)
                .expect(404);
        }));
    });
    describe('POST /interviews/:id/questions', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const interview = yield prisma.interview.create({
                data: {
                    title: 'Test Interview',
                    description: 'Test Description',
                    specialization: 'PROGRAMMING',
                    interviewerId: mockInterviewer.id,
                    scheduledAt: new Date(),
                    duration: 60,
                },
            });
            createdInterviewId = interview.id;
        }));
        it('должен создавать вопрос для интервью', () => __awaiter(void 0, void 0, void 0, function* () {
            const questionData = {
                content: 'What is your experience with JavaScript?',
                order: 1,
            };
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/interviews/${createdInterviewId}/questions`)
                .set('Authorization', `Bearer ${interviewerToken}`)
                .send(questionData)
                .expect(201);
            expect(response.body.content).toBe(questionData.content);
            expect(response.body.order).toBe(questionData.order);
            expect(response.body.interviewId).toBe(createdInterviewId);
        }));
        it('должен возвращать ошибку валидации для невалидных данных', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = {
                content: 'Hi?', // Слишком короткий вопрос
                order: 0, // Неверный порядок
            };
            yield (0, supertest_1.default)(app)
                .post(`/api/interviews/${createdInterviewId}/questions`)
                .set('Authorization', `Bearer ${interviewerToken}`)
                .send(invalidData)
                .expect(400);
        }));
    });
    describe('POST /interviews/:id/scores', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const interview = yield prisma.interview.create({
                data: {
                    title: 'Test Interview',
                    description: 'Test Description',
                    specialization: 'PROGRAMMING',
                    interviewerId: mockInterviewer.id,
                    scheduledAt: new Date(),
                    duration: 60,
                },
            });
            createdInterviewId = interview.id;
        }));
        it('должен создавать оценку для интервью', () => __awaiter(void 0, void 0, void 0, function* () {
            const scoreData = {
                criteriaName: 'Technical Skills',
                score: 8,
                comment: 'Good technical knowledge',
            };
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/interviews/${createdInterviewId}/scores`)
                .set('Authorization', `Bearer ${interviewerToken}`)
                .send(scoreData)
                .expect(201);
            expect(response.body.criteriaName).toBe(scoreData.criteriaName);
            expect(response.body.score).toBe(scoreData.score);
            expect(response.body.comment).toBe(scoreData.comment);
        }));
        it('должен возвращать ошибку для оценки вне диапазона', () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = {
                criteriaName: 'Technical Skills',
                score: 15, // Оценка больше 10
            };
            yield (0, supertest_1.default)(app)
                .post(`/api/interviews/${createdInterviewId}/scores`)
                .set('Authorization', `Bearer ${interviewerToken}`)
                .send(invalidData)
                .expect(400);
        }));
    });
    describe('POST /interviews/:id/result', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const interview = yield prisma.interview.create({
                data: {
                    title: 'Test Interview',
                    description: 'Test Description',
                    specialization: 'PROGRAMMING',
                    interviewerId: mockInterviewer.id,
                    scheduledAt: new Date(),
                    duration: 60,
                },
            });
            createdInterviewId = interview.id;
        }));
        it('должен создавать результат интервью', () => __awaiter(void 0, void 0, void 0, function* () {
            const resultData = {
                totalScore: 85,
                decision: 'HIRE',
                summary: 'Excellent candidate with strong technical skills',
            };
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/interviews/${createdInterviewId}/result`)
                .set('Authorization', `Bearer ${interviewerToken}`)
                .send(resultData)
                .expect(201);
            expect(response.body.totalScore).toBe(resultData.totalScore);
            expect(response.body.decision).toBe(resultData.decision);
            expect(response.body.summary).toBe(resultData.summary);
        }));
        it('должен обновлять существующий результат', () => __awaiter(void 0, void 0, void 0, function* () {
            // Создаем первый результат
            yield (0, supertest_1.default)(app)
                .post(`/api/interviews/${createdInterviewId}/result`)
                .set('Authorization', `Bearer ${interviewerToken}`)
                .send({
                totalScore: 70,
                decision: 'CONSIDER',
                summary: 'Initial assessment',
            });
            // Обновляем результат
            const updatedData = {
                totalScore: 90,
                decision: 'HIRE',
                summary: 'Updated assessment - strong candidate',
            };
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/interviews/${createdInterviewId}/result`)
                .set('Authorization', `Bearer ${interviewerToken}`)
                .send(updatedData)
                .expect(201);
            expect(response.body.totalScore).toBe(updatedData.totalScore);
            expect(response.body.decision).toBe(updatedData.decision);
        }));
    });
    describe('GET /interviews/:id/scores', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            const interview = yield prisma.interview.create({
                data: {
                    title: 'Test Interview',
                    description: 'Test Description',
                    specialization: 'PROGRAMMING',
                    interviewerId: mockInterviewer.id,
                    participantId: mockParticipant.id,
                    scheduledAt: new Date(),
                    duration: 60,
                },
            });
            createdInterviewId = interview.id;
            // Создаем тестовые оценки
            yield prisma.interviewScore.createMany({
                data: [
                    {
                        interviewId: createdInterviewId,
                        criteriaName: 'Technical Skills',
                        score: 8,
                        comment: 'Good technical knowledge',
                    },
                    {
                        interviewId: createdInterviewId,
                        criteriaName: 'Communication',
                        score: 9,
                        comment: 'Excellent communication',
                    },
                ],
            });
        }));
        it('должен возвращать оценки интервью', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .get(`/api/interviews/${createdInterviewId}/scores`)
                .set('Authorization', `Bearer ${interviewerToken}`)
                .expect(200);
            expect(response.body.interviewId).toBe(createdInterviewId);
            expect(response.body.categories).toHaveLength(2);
            expect(response.body.totalScore).toBe(9); // Среднее от 8 и 9
        }));
    });
});
