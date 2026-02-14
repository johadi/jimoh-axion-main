

module.exports = {
    createUser: [
        {
            model: 'username',
            required: true,
        },
        {
            model: 'email',
            required: true,
        },
        {
            model: 'password',
            required: true,
        },
        {
            model: 'role',
            required: true,
        },
        {
            model: 'schoolIds',
            required: false,
        },
    ],
    login: [
        { model: 'username', required: true },
        { model: 'password', required: true },
    ],
    requestPasswordReset: [
        {
            model: 'email',
            required: true,
        },
    ],

    resetPassword: [
        {
            model: 'password',
            required: true,
        },
    ],

    assignSchoolsToUser: [
        {
            model: 'objectId',
            path: 'userId',
            required: true,
            customError: 'userId must be a valid ObjectId'
        },
        {
            model: 'schoolIds',
            required: true,
        },
    ],

    updateUserRole: [
        {
            model: 'objectId',
            path: 'userId',
            required: true,
            customError: 'userId must be a valid ObjectId'
        },
        {
            model: 'role',
            required: true,
        },
    ],

}
