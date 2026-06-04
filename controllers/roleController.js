const Role = require('../models/Role');

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    const formatted = roles.map(r => ({
      id: r._id,
      name: r.name,
      permissions: r.permissions,
      isSystem: r.isSystem
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const r = await Role.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Role not found' });
    res.json({
      id: r._id,
      name: r.name,
      permissions: r.permissions,
      isSystem: r.isSystem
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const existing = await Role.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Role already exists' });
    
    const role = await Role.create({ name, permissions });
    res.status(201).json({
      id: role._id,
      name: role.name,
      permissions: role.permissions,
      isSystem: role.isSystem
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    if (role.isSystem && name && name !== role.name) {
      return res.status(403).json({ message: 'Cannot change the name of a system role' });
    }

    if (!role.isSystem && name) {
      role.name = name;
    }
    if (permissions) {
      role.permissions = { ...role.permissions, ...permissions };
    }
    await role.save();

    res.json({
      id: role._id,
      name: role.name,
      permissions: role.permissions,
      isSystem: role.isSystem
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    if (role.isSystem) return res.status(403).json({ message: 'Cannot delete system role' });
    
    await role.remove();
    res.json({ message: 'Role deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
