const emojis = require('../../public/emojis.data.json');

module.exports = {
    id: {
        path: "id",
        type: "string",
        length: { min: 1, max: 50 },
    },
    username: {
        path: 'username',
        type: 'string',
        length: {min: 3, max: 20},
        custom: 'username',
    },
    password: {
        path: 'password',
        type: 'string',
        length: {min: 8, max: 100},
    },
    title: {
        path: 'title',
        type: 'string',
        length: {min: 3, max: 300}
    },
    label: {
        path: 'label',
        type: 'string',
        length: {min: 3, max: 100}
    },
    shortDesc: {
        path: 'desc',
        type: 'string',
        length: {min:3, max: 300}
    },
    longDesc: {
        path: 'desc',
        type: 'string',
        length: {min:3, max: 2000}
    },
    url: {
        path: 'url',
        type: 'string',
        length: {min: 9, max: 300},
    },
    emoji: {
        path: 'emoji',
        type: 'Array',
        items: {
            type: 'string',
            length: {min: 1, max: 10},
            oneOf: emojis.value,
        }
    },
    price: {
        path: 'price',
        type: 'number',
    },
    avatar: {
        path: 'avatar',
        type: 'string',
        length: {min: 8, max: 100},
    },
    text: {
        type: 'String',
        length: {min: 3, max:15},
    },
    longText: {
        type: 'String',
        length: {min: 3, max:250},
    },
    paragraph: {
        type: 'String',
        length: {min: 3, max:10000},
    },
    phone: {
        type: 'String',
        length: 13,
    },
    email: {
        type: 'String',
        path: 'email',
        regex: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
    number: {
        type: 'number',
    },
    arrayOfStrings: {
        type: 'Array',
        items: {
            type: 'String',
            length: { min: 3, max: 100}
        }
    },
    obj: {
        type: 'object',
    },
    bool: {
        type: 'boolean',
    },
    string: {
        type: 'string',
    },

    date: {
        type: 'date',
    },

    role: {
        path: 'role',
        type: 'string',
        oneOf: ['superadmin', 'admin'],
    },

    objectId: {
        type: 'string',
        custom: 'objectId',
        customError:'id must be a valid objectId'
    },

    numberString: {
        custom: 'numberString',
    },

    resources: {
        type: 'array',
        path: 'resources',
        items: {
            type: 'string',
        }
    },
    schoolIds: {
        path: 'schoolIds',
        type: 'array',
        items: {
            type: 'string',
            custom: 'objectId',
        },
    },
    enrollmentStatus: {
        path: 'enrollmentStatus',
        type: 'string',
        oneOf: ['enrolled', 'transferred', 'graduated']
    },
}