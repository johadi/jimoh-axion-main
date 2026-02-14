const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true,
    },

    name: {
        type: String,
        required: true,
        lowercase: true,
    },

    capacity: {
        type: Number,
        required: true,
        min: 1,
    },

    resources: {
        type: [String],
        default: [],
    },
}, { timestamps: true });

module.exports = mongoose.model('Classroom', classroomSchema);
