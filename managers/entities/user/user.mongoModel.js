const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ['superadmin', 'admin'],
        required: true,
    },

    schoolIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        index: true,
    }],

    lastPasswordReset: {
        type: Date,
        required: false,
    },

    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
