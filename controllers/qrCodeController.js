const QRCode = require('../models/QRCode');

exports.getQRCodes = async (req, res) => {
  try {
    const qrCodes = await QRCode.find().populate('departmentId');
    const formatted = qrCodes.map(qr => ({
      id: qr._id,
      name: qr.name,
      departmentId: qr.departmentId,
      qrCodeImage: qr.qrCodeImage,
      qrPath: qr.qrPath,
      location: qr.location,
      isActive: qr.isActive
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQRCodeById = async (req, res) => {
  try {
    const qr = await QRCode.findById(req.params.id).populate('departmentId');
    if (!qr) return res.status(404).json({ message: 'QR Code not found' });
    res.json({
      id: qr._id,
      name: qr.name,
      departmentId: qr.departmentId,
      qrCodeImage: qr.qrCodeImage,
      qrPath: qr.qrPath,
      location: qr.location,
      isActive: qr.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getQRCodeByPath = async (req, res) => {
  try {
    const qr = await QRCode.findOne({ qrPath: req.params.path }).populate('departmentId');
    if (!qr) return res.status(404).json({ message: 'QR Code not found' });
    res.json({
      id: qr._id,
      name: qr.name,
      departmentId: qr.departmentId,
      qrCodeImage: qr.qrCodeImage,
      qrPath: qr.qrPath,
      location: qr.location,
      isActive: qr.isActive
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createQRCode = async (req, res) => {
  try {
    const { name, departmentId, qrCodeImage, qrPath, location, isActive } = req.body;
    const qr = new QRCode({ name, departmentId, qrCodeImage, qrPath, location, isActive });
    await qr.save();
    await qr.populate('departmentId');
    res.status(201).json({ 
      id: qr._id, 
      name: qr.name, 
      departmentId: qr.departmentId, 
      qrCodeImage: qr.qrCodeImage, 
      qrPath: qr.qrPath, 
      location: qr.location,
      isActive: qr.isActive 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error creating QR Code', error: error.message });
  }
};

exports.updateQRCode = async (req, res) => {
  try {
    const { name, departmentId, qrCodeImage, qrPath, location, isActive } = req.body;
    const qr = await QRCode.findByIdAndUpdate(
      req.params.id, 
      { name, departmentId, qrCodeImage, qrPath, location, isActive }, 
      { new: true }
    ).populate('departmentId');
    if (!qr) return res.status(404).json({ message: 'QR Code not found' });
    res.json({ 
      id: qr._id, 
      name: qr.name, 
      departmentId: qr.departmentId, 
      qrCodeImage: qr.qrCodeImage, 
      qrPath: qr.qrPath, 
      location: qr.location,
      isActive: qr.isActive 
    });
  } catch (error) {
    res.status(400).json({ message: 'Error updating QR Code' });
  }
};

exports.deleteQRCode = async (req, res) => {
  try {
    await QRCode.findByIdAndDelete(req.params.id);
    res.json({ message: 'QR Code deleted' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting QR Code' });
  }
};
