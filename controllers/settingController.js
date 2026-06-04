const ResolutionTime = require('../models/ResolutionTime');

exports.getResolutionTimes = async (req, res) => {
  try {
    const times = await ResolutionTime.find().sort({ createdAt: -1 });
    const formatted = times.map(t => ({
      id: t._id,
      timeValue: t.timeValue,
      label: t.label,
      isActive: t.isActive,
      createdAt: t.createdAt
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching resolution times', error: error.message });
  }
};

exports.createResolutionTime = async (req, res) => {
  try {
    const { timeValue, label, isActive } = req.body;
    
    // Check if duplicate label or timeValue exists
    const existing = await ResolutionTime.findOne({ $or: [{ label }, { timeValue }] });
    if (existing) {
      return res.status(400).json({ message: 'A resolution time with this label or value already exists' });
    }

    const newTime = new ResolutionTime({
      timeValue,
      label,
      isActive: isActive !== undefined ? isActive : true
    });

    await newTime.save();
    res.status(201).json({
      id: newTime._id,
      timeValue: newTime.timeValue,
      label: newTime.label,
      isActive: newTime.isActive
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating resolution time', error: error.message });
  }
};

exports.updateResolutionTime = async (req, res) => {
  try {
    const { timeValue, label, isActive } = req.body;
    const time = await ResolutionTime.findById(req.params.id);
    if (!time) return res.status(404).json({ message: 'Resolution time not found' });

    if (timeValue !== undefined) time.timeValue = timeValue;
    if (label !== undefined) time.label = label;
    if (isActive !== undefined) time.isActive = isActive;

    await time.save();
    res.json({
      id: time._id,
      timeValue: time.timeValue,
      label: time.label,
      isActive: time.isActive
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating resolution time', error: error.message });
  }
};

exports.deleteResolutionTime = async (req, res) => {
  try {
    const time = await ResolutionTime.findById(req.params.id);
    if (!time) return res.status(404).json({ message: 'Resolution time not found' });

    await time.remove();
    res.json({ message: 'Resolution time deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting resolution time', error: error.message });
  }
};
