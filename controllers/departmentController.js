const Department = require('../models/Department');

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    const formatted = departments.map(d => ({
      id: d._id,
      name: d.name,
      isActive: d.isActive
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json({
      id: dept._id,
      name: dept.name,
      isActive: dept.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const dept = new Department({ name, isActive });
    await dept.save();
    res.status(201).json({ id: dept._id, name: dept.name, isActive: dept.isActive });
  } catch (error) {
    res.status(400).json({ message: 'Error creating department', error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, isActive } = req.body;
    const dept = await Department.findByIdAndUpdate(
      req.params.id, 
      { name, isActive }, 
      { new: true }
    );
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json({ id: dept._id, name: dept.name, isActive: dept.isActive });
  } catch (error) {
    res.status(400).json({ message: 'Error updating department' });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting department' });
  }
};
