const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

exports.seedAdmin = async () => {
  try {
    let adminRole = await Role.findOne({ name: 'Admin' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'Admin',
        permissions: {
          dashboard: { view: true, create: true, edit: true, delete: true },
          query: { view: true, create: true, edit: true, delete: true },
          users: { view: true, create: true, edit: true, delete: true },
          departments: { view: true, create: true, edit: true, delete: true },
          sla: { view: true, create: true, edit: true, delete: true },
          escalations: { view: true, create: true, edit: true, delete: true },
          reports: { view: true, create: true, edit: true, delete: true },
          settings: { view: true, create: true, edit: true, delete: true }
        },
        isSystem: true
      });
      console.log('Default Admin role created');
    }

    let staffRole = await Role.findOne({ name: 'Staff' });
    if (!staffRole) {
      staffRole = await Role.create({
        name: 'Staff',
        permissions: {
          dashboard: { view: true, create: false, edit: false, delete: false },
          query: { view: true, create: true, edit: true, delete: false },
          users: { view: false, create: false, edit: false, delete: false },
          departments: { view: false, create: false, edit: false, delete: false },
          sla: { view: false, create: false, edit: false, delete: false },
          escalations: { view: false, create: false, edit: false, delete: false },
          reports: { view: false, create: false, edit: false, delete: false },
          settings: { view: false, create: false, edit: false, delete: false }
        },
        isSystem: true
      });
      console.log('Default Staff role created');
    }

    const adminExists = await User.findOne({ email: 'admin@example.com' });
    if (!adminExists) {
      await User.create({
        name: 'Super Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: adminRole._id
      });
      console.log('Default Admin user created');
    } else {
      adminExists.role = adminRole._id;
      await adminExists.save();
      console.log('Default Admin role updated to match new Matrix role');
    }
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email }).populate('role');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    // Check if active removed as per user request
    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'supersecretjwtkey2026',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Now an object containing name and permissions
        departmentId: user.departmentId
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};