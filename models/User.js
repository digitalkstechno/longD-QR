const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const SECRET_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012';

function encryptPassword(text) {
  if (!text) return text;
  // Standard CryptoJS AES prefix
  if (text.startsWith('U2FsdGVkX1')) return text;
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

function decryptPassword(ciphertext) {
  if (!ciphertext) return ciphertext;
  if (!ciphertext.startsWith('U2FsdGVkX1')) return ciphertext;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (err) {
    return ciphertext;
  }
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    get: decryptPassword,
    set: encryptPassword
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Compare password (decrypted value against candidate)
userSchema.methods.comparePassword = async function(candidatePassword) {
  // Since we use getters, this.password is ALREADY decrypted when accessed!
  return candidatePassword === this.password;
};

module.exports = mongoose.model('User', userSchema);
