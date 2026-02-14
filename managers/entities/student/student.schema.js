module.exports = {
    enrollStudent: [
        { model: 'objectId', path: 'schoolId', required: true, customError:'schoolId must be a valid ObjectId' },
        { model: 'string', path: 'firstName', required: true },
        { model: 'string', path: 'lastName', required: true },
        { model: 'date', path: 'dateOfBirth', required: true },
        { model: 'objectId', path: 'classroomId', required: false, customError: 'classroomId must be a valid ObjectId' },
    ],

    getStudents: [
        { model: 'objectId', path: 'schoolId', required: true, customError:' schoolId must be a valid ObjectId' },
        { model: 'objectId', path: 'classroomId', required: false, customError: 'classroomId must be a valid ObjectId' },

        { model: 'numberString', path: 'limit', required: false },
        { model: 'numberString', path: 'page', required: false },
        { model: 'string', path: 'search', required: false },
        { model: 'enrollmentStatus', required: false },
    ],

    updateStudent: [
        { model: 'objectId', path: 'studentId', required: true, customError: 'studentId must be a valid ObjectId' },
        { model: 'objectId', path: 'schoolId', required: true, customError: 'schoolId must be a valid ObjectId' },
        { model: 'string', path: 'firstName', required: false },
        { model: 'string', path: 'lastName', required: false },
        { model: 'date', path: 'dateOfBirth', required: false },
    ],

    getStudentById: [
        { model: 'objectId', path: 'studentId', required: true, customError: 'studentId must be a valid ObjectId' },
        { model: 'objectId', path: 'schoolId', required: true, customError: 'schoolId must be a valid ObjectId' },
    ],

    deleteStudent: [
        { model: 'objectId', path: 'schoolId', required: true, customError: 'schoolId must be a valid ObjectId' },
        { model: 'objectId', path: 'studentId', required: true, customError: 'studentId must be a valid ObjectId' },
    ],

    transferStudent: [
        { model: 'objectId', path: 'schoolId', required: true, customError: 'schoolId must be a valid ObjectId' },
        { model: 'objectId', path: 'studentId', required: true, customError: 'studentId must be a valid ObjectId' },
        { model: 'objectId', path: 'classroomId', required: true, customError: 'classroomId must be a valid ObjectId' },
    ],

    updateEnrollmentStatus: [
        { model: 'objectId', path: 'schoolId', required: true, customError: 'schoolId must be a valid ObjectId' },
        { model: 'objectId', path: 'studentId', required: true, customError: 'studentId must be a valid ObjectId' },
        { model: 'enrollmentStatus', required: true },
    ],

    getTransferHistory: [
        { model: 'objectId', path: 'schoolId', required: true, customError: 'schoolId must be a valid ObjectId' },
        { model: 'objectId', path: 'studentId', required: true, customError: 'studentId must be a valid ObjectId' },
    ],
};
