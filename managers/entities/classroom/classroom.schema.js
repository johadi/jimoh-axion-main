module.exports = {
    createClassroom: [
        { model: 'objectId', path: 'schoolId', required: true, customError: 'schoolId must be a valid ObjectId' },
        { model: 'string', path: 'name', required: true },
        { model: 'number', path: 'capacity', required: true },
        { model: 'resources', required: false },
    ],

    updateClassroom: [
        { model: 'objectId', path: 'classroomId', required: true, customError:'classroomId must be a valid ObjectId' },
        { model: 'objectId', path: 'schoolId', required: true, customError:'schoolId must be a valid ObjectId' },
        { model: 'string', path: 'name', required: false },
        { model: 'number', path: 'capacity', required: false },
        { model: 'resources', required: false },
    ],

    getClassroomById: [
        { model: 'objectId', path: 'classroomId', required: true, customError:'classroomId must be a valid ObjectId' },
        { model: 'objectId', path: 'schoolId', required: true, customError:'schoolId must be a valid ObjectId' },
    ],

    deleteClassroom: [
        { model: 'objectId', path: 'classroomId', required: true, customError:'classroomId must be a valid ObjectId' },
        { model: 'objectId', path: 'schoolId', required: true, customError:'schoolId must be a valid ObjectId' },
    ],

    getClassrooms: [
        { model: 'objectId', path: 'schoolId', required: true, customError:'schoolId must be a valid ObjectId' },
        { model: 'numberString', path: 'limit', required: false },
        { model: 'numberString', path: 'page', required: false },
        { model: 'string', path: 'search', required: false },
    ],

    addResources: [
        { model: 'objectId', path: 'classroomId', required: true, customError:'classroomId must be a valid ObjectId' },
        { model: 'objectId', path: 'schoolId', required: true, customError:'schoolId must be a valid ObjectId' },
        { model: 'resources', required: true, length: { min: 1 } },
    ],

    removeResources: [
        { model: 'objectId', path: 'classroomId', required: true, customError:'classroomId must be a valid ObjectId' },
        { model: 'objectId', path: 'schoolId', required: true, customError:'schoolId must be a valid ObjectId' },
        { model: 'resources', required: true, length: { min: 1 } },
    ],

    replaceResources: [
        { model: 'objectId', path: 'classroomId', required: true, customError:'classroomId must be a valid ObjectId' },
        { model: 'objectId', path: 'schoolId', required: true, customError:'schoolId must be a valid ObjectId' },
        { model: 'resources', required: true },
    ],
};
