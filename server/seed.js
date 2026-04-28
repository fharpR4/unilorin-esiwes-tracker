require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Institution = require('./models/Institution');

const seed = async () => {
  await connectDB();

  // Clear existing seed data (dev only — never run on production)
  if (process.env.NODE_ENV === 'production') {
    console.error('ABORT: Do not run seed script on production.');
    process.exit(1);
  }

  console.log('Starting database seed...');

  // Remove existing default institution if it exists
  await Institution.deleteOne({ acronym: 'UNILORIN' });

  const unilorin = await Institution.create({
    name: 'University of Ilorin',
    acronym: 'UNILORIN',
    type: 'university',
    address: {
      city: 'Ilorin',
      state: 'Kwara',
      country: 'Nigeria',
    },
    logoUrl: '/assets/unilorin-logo.svg',
    isActive: true,
  });

  console.log(`Institution created: ${unilorin.name} (${unilorin._id})`);

  // Remove existing seed users
  await User.deleteMany({
    email: {
      $in: [
        'admin@unilorin.edu.ng',
        'coordinator@unilorin.edu.ng',
        'supervisor@esiwes.test',
        'student@esiwes.test',
      ],
    },
  });

  const admin = await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@unilorin.edu.ng',
    password: 'Admin123!',
    role: 'admin',
    isActive: true,
  });

  const coordinator = await User.create({
    firstName: 'Coordinator',
    lastName: 'UniIlorin',
    email: 'coordinator@unilorin.edu.ng',
    password: 'Coord123!',
    role: 'coordinator',
    institution: unilorin._id,
    isActive: true,
  });

  const supervisor = await User.create({
    firstName: 'Jane',
    lastName: 'Supervisor',
    email: 'supervisor@esiwes.test',
    password: 'Super123!',
    role: 'supervisor',
    isActive: true,
  });

  const student = await User.create({
    firstName: 'John',
    lastName: 'Student',
    email: 'student@esiwes.test',
    password: 'Stud123!',
    role: 'student',
    institution: unilorin._id,
    matricNumber: 'ENG/2021/001',
    courseOfStudy: 'Computer Engineering',
    department: 'Electrical and Computer Engineering',
    level: '400',
    isActive: true,
  });

  console.log('');
  console.log('Seed complete! Created accounts:');
  console.log('');
  console.log('  Role        | Email                          | Password');
  console.log('  ------------|--------------------------------|----------');
  console.log(`  admin       | ${admin.email}          | Admin123!`);
  console.log(`  coordinator | ${coordinator.email}    | Coord123!`);
  console.log(`  supervisor  | ${supervisor.email}   | Super123!`);
  console.log(`  student     | ${student.email}     | Stud123!`);
  console.log('');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});