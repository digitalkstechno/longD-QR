const mongoose = require('mongoose');
const Role = require('./models/Role');
const { seedAdmin } = require('./controllers/authController');
require('dotenv').config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/query-tracker');
    console.log('Connected to DB');
    await Role.deleteMany({});
    console.log('Roles cleared');
    const User = require('./models/User');
    await User.deleteMany({});
    console.log('Users cleared');
    await seedAdmin();
    console.log('Done');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
