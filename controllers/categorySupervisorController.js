const CategorySupervisor = require('../models/CategorySupervisor');

exports.getCategorySupervisors = async (req, res) => {
  try {
    const supervisors = await CategorySupervisor.find()
      .populate('categoryId')
      .populate('supervisorId');
    const formatted = supervisors.map(s => ({
      id: s._id,
      categoryId: s.categoryId,
      supervisorId: s.supervisorId
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategorySupervisorByCategoryId = async (req, res) => {
  try {
    const supervisor = await CategorySupervisor.findOne({ categoryId: req.params.categoryId })
      .populate('categoryId')
      .populate('supervisorId');
    if (!supervisor) return res.status(404).json({ message: 'Supervisor assignment not found' });
    res.json({
      id: supervisor._id,
      categoryId: supervisor.categoryId,
      supervisorId: supervisor.supervisorId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCategorySupervisor = async (req, res) => {
  try {
    const { categoryId, supervisorId } = req.body;
    let supervisor = await CategorySupervisor.findOne({ categoryId });
    if (supervisor) {
      supervisor.supervisorId = supervisorId;
    } else {
      supervisor = new CategorySupervisor({ categoryId, supervisorId });
    }
    await supervisor.save();
    await supervisor.populate('categoryId');
    await supervisor.populate('supervisorId');
    res.status(201).json({ 
      id: supervisor._id, 
      categoryId: supervisor.categoryId, 
      supervisorId: supervisor.supervisorId 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating category supervisor', error: error.message });
  }
};

exports.deleteCategorySupervisor = async (req, res) => {
  try {
    await CategorySupervisor.findOneAndDelete({ categoryId: req.params.categoryId });
    res.json({ message: 'Category supervisor deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting category supervisor' });
  }
};
