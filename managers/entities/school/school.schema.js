module.exports = {
    createSchool: [
        { model: 'string', path: 'name', required: true },
        { model: 'string', path: 'address', required: false },
        { model: 'number', path: 'capacity', required: false },
    ],

    getSchools: [
        { model: 'numberString', path: 'limit', required: false },
        { model: 'numberString', path: 'page', required: false },
        { model: 'string', path: 'search', required: false },
    ],

    updateSchool: [
        {
            model: 'objectId',
            path: 'schoolId',
            required: true,
            customError:'schoolId must be a valid objectId'
        },
        { model: 'string', path: 'name', required: false },
        { model: 'string', path: 'address', required: false },
        { model: 'number', path: 'capacity', required: false },
    ],
    getSchoolById: [
        {
            model: 'objectId',
            path: 'schoolId',
            required: true,
            customError:'schoolId must be a valid objectId'
        },
    ],
    deleteSchool: [
        {
            model: 'objectId',
            path: 'schoolId',
            required: true,
            customError:'schoolId must be a valid objectId'
        },
    ],
};
