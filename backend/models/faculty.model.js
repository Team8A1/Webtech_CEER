const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const facultySchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w-\.]+@kletech\.ac\.in$/, 'Please provide a valid @kletech.ac.in email'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      trim: true,
    },
    designation: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    role: {
      type: String,
      enum: ['faculty'],  // FIX: enforce valid value
      default: 'faculty',
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    passwordVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

facultySchema.pre('save', async function (next) {  // FIX: accept next() parameter
  if (!this.isModified('password') || !this.password) return next();
  try {
    this.passwordVersion = (this.passwordVersion || 0) + 1;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

facultySchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

const Faculty = mongoose.model('Faculty', facultySchema);

module.exports = Faculty;
