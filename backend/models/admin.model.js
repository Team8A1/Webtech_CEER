const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // FIX: use bcrypt (native C++) not bcryptjs

const adminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /@kletech\.ac\.in$/.test(v);
            },
            message: props => `${props.value} is not a valid @kletech.ac.in email address!`
        }
    },
    password: {
        type: String,
        required: true,
        select: false  // FIX: never return password in queries by default
    },
    role: {
        type: String,
        enum: ['admin'],   // FIX: enforce valid values
        default: 'admin',
        immutable: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    passwordVersion: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
adminSchema.pre('save', async function (next) {  // FIX: accept next() parameter
    if (!this.isModified('password')) return next();
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
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
