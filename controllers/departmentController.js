const Department = require('../models/Department');

const generateSlug = (name) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    const formatted = departments.map(d => ({
      id: d._id,
      name: d.name,
      slug: d.slug,
      description: d.description,
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
      slug: dept.slug,
      description: dept.description,
      isActive: dept.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDepartmentBySlug = async (req, res) => {
  try {
    const dept = await Department.findOne({ slug: req.params.slug });
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json({
      id: dept._id,
      name: dept.name,
      slug: dept.slug,
      description: dept.description,
      isActive: dept.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const slug = generateSlug(name);
    const dept = new Department({ name, slug, description, isActive });
    await dept.save();
    res.status(201).json({ id: dept._id, name: dept.name, slug: dept.slug, description: dept.description, isActive: dept.isActive });
  } catch (error) {
    res.status(400).json({ message: 'Error creating department', error: error.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const updateData = { description, isActive };
    if (name) {
      updateData.name = name;
      updateData.slug = generateSlug(name);
    }
    const dept = await Department.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json({ id: dept._id, name: dept.name, slug: dept.slug, description: dept.description, isActive: dept.isActive });
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
