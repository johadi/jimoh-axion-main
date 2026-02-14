const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');
const config = require('../config/index.config');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Axion School Management API',
            version: '1.0.0',
            description: 'Documentation for school management API',
            contact: {
                name: 'API Support',
                email: 'jimoh.hadi@gmail.com',
            },
        },
        servers: [
            {
                url: (() => {
                    const baseUrl = config.dotEnv.API_BASE_URL;
                    if (!baseUrl) {
                        return 'http://localhost:5111';
                    }
                    // If baseUrl doesn't start with http:// or https://, add http://
                    if (!baseUrl.match(/^https?:\/\//)) {
                        return `http://${baseUrl}`;
                    }
                    return baseUrl;
                })(),
                description: 'API Server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'token', // matches Axion token param
                    description: 'Enter your short token (get from /api/token/v1_createShortToken)',
                },
                ResetPasswordAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'resetPasswordToken',
                    description: 'Enter your password reset token',
                },
            },
        },
        security: [{ BearerAuth: [] }],
    },

    // 👇 where swagger-jsdoc will scan for documentation
    apis: [
        // Include modular schema files
        path.join(__dirname, 'schemas/**/*.schema.docs.js'),

        // Include separate API documentation files
        path.join(__dirname, 'api/**/*.api.docs.js'),

        // Fallback: Include manager files that still have inline docs
        path.join(__dirname, '../managers/**/*.manager.js'),
    ],
};

module.exports = swaggerJSDoc(options);
