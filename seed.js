
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { seedAdmin } = require('./controllers/authController');

// Import models
const Department = require('./models/Department');
const Category = require('./models/Category');
const CategoryAssignment = require('./models/CategoryAssignment');
const CategorySupervisor = require('./models/CategorySupervisor');
const CategorySLA = require('./models/CategorySLA');
const User = require('./models/User');
const Role = require('./models/Role');

const seed = async () => {
  await connectDB();

  try {
    // Drop entire database to clear all old data and indexes
    await mongoose.connection.db.dropDatabase();
    console.log('🗑️  Database dropped successfully!');
    
    // Re-seed admin role and user
    await seedAdmin();

    // --- Create Departments ---
    const departments = await Department.create([
      { name: 'Room Service', slug: 'room', description: 'Room service and amenities', isActive: true },
      { name: 'Restaurant', slug: 'restaurant', description: 'Restaurant and dining', isActive: true },
      { name: 'Reception', slug: 'reception', description: 'Front desk and check-in/check-out', isActive: true },
      { name: 'Housekeeping', slug: 'housekeeping', description: 'Room cleaning and maintenance', isActive: true }
    ]);

    // --- Create Categories ---
    const categories = await Category.create([
      { name: 'AC Issue', departmentId: departments[0]._id, isActive: true },
      { name: 'WiFi Issue', departmentId: departments[0]._id, isActive: true },
      { name: 'TV Issue', departmentId: departments[0]._id, isActive: true },
      { name: 'Food Complaint', departmentId: departments[1]._id, isActive: true },
      { name: 'Order Delay', departmentId: departments[1]._id, isActive: true },
      { name: 'Check-In Support', departmentId: departments[2]._id, isActive: true },
      { name: 'Taxi Request', departmentId: departments[2]._id, isActive: true }
    ]);

    // --- Get admin role and users ---
    const adminRole = await Role.findOne({ name: 'Admin' });
    const staffRole = await Role.findOne({ name: 'Staff' });

    let staffUser = await User.findOne({ email: 'staff@hotel.com' });
    if (!staffUser) {
      staffUser = await User.create({
        name: 'Staff User',
        email: 'staff@hotel.com',
        password: 'staff123',
        role: staffRole._id,
        isActive: true
      });
    }

    let supervisorUser = await User.findOne({ email: 'supervisor@hotel.com' });
    if (!supervisorUser) {
      supervisorUser = await User.create({
        name: 'Supervisor User',
        email: 'supervisor@hotel.com',
        password: 'supervisor123',
        role: adminRole._id,
        isActive: true
      });
    }

    // --- Category Assignments ---
    await CategoryAssignment.create([
      { categoryId: categories[0]._id, staffId: staffUser._id },
      { categoryId: categories[1]._id, staffId: staffUser._id },
      { categoryId: categories[2]._id, staffId: staffUser._id },
      { categoryId: categories[3]._id, staffId: staffUser._id }
    ]);

    // --- Category Supervisors ---
    await CategorySupervisor.create([
      { categoryId: categories[0]._id, supervisorId: supervisorUser._id },
      { categoryId: categories[1]._id, supervisorId: supervisorUser._id }
    ]);

    // --- Category SLAs ---
    await CategorySLA.create([
      { categoryId: categories[0]._id, resolutionTime: 30, timeUnit: 'Minutes' },
      { categoryId: categories[1]._id, resolutionTime: 15, timeUnit: 'Minutes' },
      { categoryId: categories[2]._id, resolutionTime: 20, timeUnit: 'Minutes' },
      { categoryId: categories[3]._id, resolutionTime: 10, timeUnit: 'Minutes' },
      { categoryId: categories[4]._id, resolutionTime: 15, timeUnit: 'Minutes' },
      { categoryId: categories[5]._id, resolutionTime: 10, timeUnit: 'Minutes' },
      { categoryId: categories[6]._id, resolutionTime: 5, timeUnit: 'Minutes' }
    ]);

    console.log('✅ Seed data successfully created!');
    console.log('Test URLs:');
    console.log('- /submit-query?room');
    console.log('- /submit-query?restaurant');
    console.log('- /submit-query?reception');
    console.log('Admin login: admin@example.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seed();
