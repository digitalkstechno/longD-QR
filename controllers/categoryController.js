const Category = require('../models/Category');
const { uploadToExternalService, updateFileOnExternalService, deleteFileFromExternalService } = require('../utils/externalUpload');

exports.getCategories = async (req, res) => {
  try {
    const { departmentId } = req.query;
    const query = departmentId ? { departmentId } : {};
    const categories = await Category.find(query).populate('departmentId');
    const formatted = categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      departmentId: cat.departmentId,
      isActive: cat.isActive,
      imageUrl: cat.imageUrl
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id).populate('departmentId');
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json({
      id: cat._id,
      name: cat.name,
      departmentId: cat.departmentId,
      isActive: cat.isActive,
      imageUrl: cat.imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, departmentId } = req.body;
    let imageUrl;
    if (req.file) {
      imageUrl = await uploadToExternalService(req.file, 'categories');
    }
    const cat = new Category({ name, departmentId, isActive: true, imageUrl });
    await cat.save();
    await cat.populate('departmentId');
    res.status(201).json({ id: cat._id, name: cat.name, departmentId: cat.departmentId, isActive: cat.isActive, imageUrl: cat.imageUrl });
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, departmentId } = req.body;
    const existing = await Category.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Category not found' });

    let imageUrl = existing.imageUrl;
    if (req.file) {
      if (imageUrl) {
        imageUrl = await updateFileOnExternalService(imageUrl, req.file);
      } else {
        imageUrl = await uploadToExternalService(req.file, 'categories');
      }
    }

    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      { name, departmentId, imageUrl },
      { new: true }
    ).populate('departmentId');
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json({ id: cat._id, name: cat.name, departmentId: cat.departmentId, isActive: cat.isActive, imageUrl: cat.imageUrl });
  } catch (error) {
    res.status(400).json({ message: 'Error updating category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Category not found' });
    if (existing.imageUrl) {
      await deleteFileFromExternalService(existing.imageUrl);
    }
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting category' });
  }
};
