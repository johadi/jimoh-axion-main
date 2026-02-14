const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true,
    },

    classroomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
        default: null,
    },

    firstName: {
        type: String,
        required: true,
        lowercase: true,
    },
    lastName: {
        type: String,
        required: true,
        lowercase: true,
    },

    dateOfBirth: {
        type: Date,
        required: true,
    },

    enrollmentStatus: {
        type: String,
        enum: ['enrolled', 'transferred', 'graduated'],
        default: 'enrolled',
    },

    transferHistory: [{
        fromClassroomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
        toClassroomId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
        transferredAt:   { type: Date, default: Date.now },
    }],
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
