const CategoryAssignment = require('../models/CategoryAssignment');

exports.getCategoryAssignments = async (req, res) => {
  try {
    const assignments = await CategoryAssignment.find()
      .populate('categoryId')
      .populate('staffId');
    const formatted = assignments.map(a => ({
      id: a._id,
      categoryId: a.categoryId,
      staffId: a.staffId
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategoryAssignmentByCategoryId = async (req, res) => {
  try {
    const assignment = await CategoryAssignment.findOne({ categoryId: req.params.categoryId })
      .populate('categoryId')
      .populate('staffId');
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json({
      id: assignment._id,
      categoryId: assignment.categoryId,
      staffId: assignment.staffId
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCategoryAssignment = async (req, res) => {
  try {
    const { categoryId, staffId } = req.body;
    let assignment = await CategoryAssignment.findOne({ categoryId });
    if (assignment) {
      assignment.staffId = staffId;
    } else {
      assignment = new CategoryAssignment({ categoryId, staffId });
    }
    await assignment.save();
    await assignment.populate('categoryId');
    await assignment.populate('staffId');
    res.status(201).json({ 
      id: assignment._id, 
      categoryId: assignment.categoryId, 
      staffId: assignment.staffId 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating category assignment', error: error.message });
  }
};

exports.deleteCategoryAssignment = async (req, res) => {
  try {
    await CategoryAssignment.findOneAndDelete({ categoryId: req.params.categoryId });
    res.json({ message: 'Category assignment deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting category assignment' });
  }
};
