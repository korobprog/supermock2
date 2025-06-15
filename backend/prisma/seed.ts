import { PrismaClient, Role, InterestCategory } from '@prisma/client';
import bcrypt from 'bcrypt';
import env from '../src/config/env';

const prisma = new PrismaClient();

async function main() {
  // Create interests
  const interests = [
    // Программирование
    { name: 'Frontend Developer', category: InterestCategory.PROGRAMMING },
    { name: 'Java Developer', category: InterestCategory.PROGRAMMING },
    { name: 'Android Developer', category: InterestCategory.PROGRAMMING },
    { name: 'Golang Developer', category: InterestCategory.PROGRAMMING },
    { name: 'C# Developer', category: InterestCategory.PROGRAMMING },
    { name: 'C/C++ Developer', category: InterestCategory.PROGRAMMING },
    { name: 'PHP Developer', category: InterestCategory.PROGRAMMING },
    { name: 'Unity Developer', category: InterestCategory.PROGRAMMING },
    { name: 'Node.js Developer', category: InterestCategory.PROGRAMMING },
    { name: '1С Developer', category: InterestCategory.PROGRAMMING },
    { name: 'Data Engineer', category: InterestCategory.PROGRAMMING },
    { name: 'iOS Developer', category: InterestCategory.PROGRAMMING },
    { name: 'DevOps', category: InterestCategory.PROGRAMMING },
    { name: 'Flutter Developer', category: InterestCategory.PROGRAMMING },
    { name: 'Python Developer', category: InterestCategory.PROGRAMMING },

    // Тестирование
    { name: 'QA Тестировщик', category: InterestCategory.TESTING },
    { name: 'QA Automation', category: InterestCategory.TESTING },

    // Аналитика и Data Science
    {
      name: 'Data Scientist',
      category: InterestCategory.ANALYTICS_DATA_SCIENCE,
    },
    {
      name: 'System Analyst',
      category: InterestCategory.ANALYTICS_DATA_SCIENCE,
    },
    { name: 'Data Analyst', category: InterestCategory.ANALYTICS_DATA_SCIENCE },
    {
      name: 'Business Analyst',
      category: InterestCategory.ANALYTICS_DATA_SCIENCE,
    },
    {
      name: 'Product Analyst',
      category: InterestCategory.ANALYTICS_DATA_SCIENCE,
    },

    // Управление
    { name: 'IT Project Manager', category: InterestCategory.MANAGEMENT },
    { name: 'IT Product Manager', category: InterestCategory.MANAGEMENT },
  ];

  for (const interest of interests) {
    await prisma.interest.upsert({
      where: { name: interest.name },
      update: {},
      create: interest,
    });
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', env.PASSWORD_SALT_ROUNDS);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mockinterview.com' },
    update: {},
    create: {
      email: 'admin@mockinterview.com',
      password: adminPassword,
      role: Role.ADMIN,
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
  const interviewerPassword = await bcrypt.hash(
    'interviewer123',
    env.PASSWORD_SALT_ROUNDS
  );
  const interviewer = await prisma.user.upsert({
    where: { email: 'interviewer@mockinterview.com' },
    update: {},
    create: {
      email: 'interviewer@mockinterview.com',
      password: interviewerPassword,
      role: Role.INTERVIEWER,
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
  const candidatePassword = await bcrypt.hash(
    'candidate123',
    env.PASSWORD_SALT_ROUNDS
  );
  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@mockinterview.com' },
    update: {},
    create: {
      email: 'candidate@mockinterview.com',
      password: candidatePassword,
      role: Role.USER,
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
  const interviews = await Promise.all([
    prisma.interview.create({
      data: {
        title: 'Frontend Development Interview',
        description: 'Technical interview focusing on React and TypeScript',
        specialization: 'Frontend Development',
        interviewerId: interviewer.id,
        scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        duration: 60, // 60 minutes
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
      },
    }),
  ]);

  console.log('✅ Database seeded successfully');
  console.log('Created users:', { admin, interviewer, candidate });
  console.log('Created interviews:', interviews);
  console.log('Created interests:', interests.length);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
