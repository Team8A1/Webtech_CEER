const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
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
    usn: {
      type: String,
      trim: true,
      uppercase: true,
    },
    batch: {
      type: String,
      trim: true,
    },
    division: {
      type: String,
      uppercase: true,
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
    role: {
      type: String,
      // FIX #7: enum guard prevents invalid roles from silently corrupting ProtectedRoute checks
      enum: ['student', 'faculty', 'labIncharge', 'admin'],
      default: 'student',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      default: false,
    },
    passwordVersion: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
    },
    problemStatement: {
      type: String,
    },
    guideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Faculty',
    },
  },
  {
    timestamps: true,
  }
);

// FIX #8: Enforce required student fields (usn & division) at the model level
// (batch intentionally excluded per product decision)
userSchema.pre('save', async function (next) {
  if (this.role === 'student') {
    if (!this.usn) return next(new Error('USN is required for student accounts'));
    if (!this.division) return next(new Error('Division is required for student accounts'));
  }

  // FIX #9: Hash password — use next() so Mongoose pre-save errors propagate correctly
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

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
