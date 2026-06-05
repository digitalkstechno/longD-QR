const CategorySLA = require('../models/CategorySLA');

exports.getCategorySLAs = async (req, res) => {
  try {
    const slas = await CategorySLA.find().populate('categoryId');
    const formatted = slas.map(s => ({
      id: s._id,
      categoryId: s.categoryId,
      resolutionTime: s.resolutionTime,
      timeUnit: s.timeUnit
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategorySLAByCategoryId = async (req, res) => {
  try {
    const sla = await CategorySLA.findOne({ categoryId: req.params.categoryId }).populate('categoryId');
    if (!sla) return res.status(404).json({ message: 'SLA not found' });
    res.json({
      id: sla._id,
      categoryId: sla.categoryId,
      resolutionTime: sla.resolutionTime,
      timeUnit: sla.timeUnit
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCategorySLA = async (req, res) => {
  try {
    const { categoryId, resolutionTime, timeUnit } = req.body;
    let sla = await CategorySLA.findOne({ categoryId });
    if (sla) {
      sla.resolutionTime = resolutionTime;
      sla.timeUnit = timeUnit;
    } else {
      sla = new CategorySLA({ categoryId, resolutionTime, timeUnit });
    }
    await sla.save();
    await sla.populate('categoryId');
    res.status(201).json({ 
      id: sla._id, 
      categoryId: sla.categoryId, 
      resolutionTime: sla.resolutionTime, 
      timeUnit: sla.timeUnit 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating category SLA', error: error.message });
  }
};

exports.deleteCategorySLA = async (req, res) => {
  try {
    await CategorySLA.findOneAndDelete({ categoryId: req.params.categoryId });
    res.json({ message: 'Category SLA deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting category SLA' });
  }
};
