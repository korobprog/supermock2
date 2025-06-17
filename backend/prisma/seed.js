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
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = __importDefault(require("../src/config/env"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        // Create interests
        const interests = [
            // Программирование
            { name: 'Frontend Developer', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'Java Developer', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'Android Developer', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'Golang Developer', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'C# Developer', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'C/C++ Developer', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'PHP Developer', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'Unity Developer', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'Node.js Developer', category: client_1.InterestCategory.PROGRAMMING },
            { name: '1С Developer', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'Data Engineer', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'iOS Developer', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'DevOps', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'Flutter Developer', category: client_1.InterestCategory.PROGRAMMING },
            { name: 'Python Developer', category: client_1.InterestCategory.PROGRAMMING },
            // Тестирование
            { name: 'QA Тестировщик', category: client_1.InterestCategory.TESTING },
            { name: 'QA Automation', category: client_1.InterestCategory.TESTING },
            // Аналитика и Data Science
            {
                name: 'Data Scientist',
                category: client_1.InterestCategory.ANALYTICS_DATA_SCIENCE,
            },
            {
                name: 'System Analyst',
                category: client_1.InterestCategory.ANALYTICS_DATA_SCIENCE,
            },
            { name: 'Data Analyst', category: client_1.InterestCategory.ANALYTICS_DATA_SCIENCE },
            {
                name: 'Business Analyst',
                category: client_1.InterestCategory.ANALYTICS_DATA_SCIENCE,
            },
            {
                name: 'Product Analyst',
                category: client_1.InterestCategory.ANALYTICS_DATA_SCIENCE,
            },
            // Управление
            { name: 'IT Project Manager', category: client_1.InterestCategory.MANAGEMENT },
            { name: 'IT Product Manager', category: client_1.InterestCategory.MANAGEMENT },
        ];
        for (const interest of interests) {
            yield prisma.interest.upsert({
                where: { name: interest.name },
                update: {},
                create: interest,
            });
        }
        // Create admin user
        const adminPassword = yield bcrypt_1.default.hash('admin123', env_1.default.PASSWORD_SALT_ROUNDS);
        const admin = yield prisma.user.upsert({
            where: { email: 'admin@mockinterview.com' },
            update: {},
            create: {
                email: 'admin@mockinterview.com',
                password: adminPassword,
                role: client_1.Role.ADMIN,
                profile: {
                    create: {
                        firstName: 'Admin',
                        lastName: 'User',
                        specialization: 'System Administration',
                        bio: 'System administrator for the Mock Interview platform',
                    },
                },
            },
        });
        // Create test interviewer
        const interviewerPassword = yield bcrypt_1.default.hash('interviewer123', env_1.default.PASSWORD_SALT_ROUNDS);
        const interviewer = yield prisma.user.upsert({
            where: { email: 'interviewer@mockinterview.com' },
            update: {},
            create: {
                email: 'interviewer@mockinterview.com',
                password: interviewerPassword,
                role: client_1.Role.INTERVIEWER,
                profile: {
                    create: {
                        firstName: 'Test',
                        lastName: 'Interviewer',
                        specialization: 'Software Engineering',
                        bio: 'Experienced interviewer with 5+ years of technical interviewing experience',
                    },
                },
            },
        });
        // Create test candidate
        const candidatePassword = yield bcrypt_1.default.hash('candidate123', env_1.default.PASSWORD_SALT_ROUNDS);
        const candidate = yield prisma.user.upsert({
            where: { email: 'candidate@mockinterview.com' },
            update: {},
            create: {
                email: 'candidate@mockinterview.com',
                password: candidatePassword,
                role: client_1.Role.USER,
                profile: {
                    create: {
                        firstName: 'Test',
                        lastName: 'Candidate',
                        specialization: 'Software Development',
                        bio: 'Looking to improve my interview skills',
                    },
                },
            },
        });
        // Create initial interviews
        const interviews = yield Promise.all([
            prisma.interview.create({
                data: {
                    title: 'Frontend Development Interview',
                    description: 'Technical interview focusing on React and TypeScript',
                    specialization: 'Frontend Development',
                    interviewerId: interviewer.id,
                    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                    duration: 60, // 60 minutes
                    videoLink: 'https://meet.google.com/frontend-interview',
                },
            }),
            prisma.interview.create({
                data: {
                    title: 'Backend Development Interview',
                    description: 'Technical interview focusing on Node.js and databases',
                    specialization: 'Backend Development',
                    interviewerId: interviewer.id,
                    scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
                    duration: 90, // 90 minutes
                    videoLink: 'https://meet.google.com/backend-interview',
                },
            }),
        ]);
        console.log('✅ Database seeded successfully');
        console.log('Created users:', { admin, interviewer, candidate });
        console.log('Created interviews:', interviews);
        console.log('Created interests:', interests.length);
    });
}
main()
    .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
