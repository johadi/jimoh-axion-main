
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('../config/index.config.js');
const ManagersLoader = require('../loaders/ManagersLoader');

async function createTestApp() {
    try {
        // Connect to MongoDB first
        console.log('Connecting to MongoDB:', config.dotEnv.MONGO_URI);
        await mongoose.connect(config.dotEnv.MONGO_URI);
        console.log('MongoDB connected successfully');

        // Initialize cache properly
        const cacheFactory = require('../cache/cache.dbh.js');
        const cache = cacheFactory({
            prefix: config.dotEnv.CACHE_PREFIX || 'test',
            url: config.dotEnv.CACHE_REDIS || 'redis://127.0.0.1:6379'
        });

        // Wait for Redis initialization
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock other services safely
        let cortex, oyster, aeon;

        try {
            const Cortex = require('ion-cortex');
            cortex = new Cortex({
                prefix: config.dotEnv.CORTEX_PREFIX || 'test',
                url: config.dotEnv.CORTEX_REDIS || 'redis://127.0.0.1:6379',
                type: config.dotEnv.CORTEX_TYPE || 'test'
            });
        } catch (e) {
            console.log('Could not initialize cortex, using mock:', e.message);
            cortex = {
                sub: () => {},
                pub: () => {},
                get: () => Promise.resolve(null),
                set: () => Promise.resolve(true)
            };
        }

        try {
            const oyster_db = require('oyster-db');
            oyster = new oyster_db({
                prefix: config.dotEnv.OYSTER_PREFIX || 'test',
                url: config.dotEnv.OYSTER_REDIS || 'redis://127.0.0.1:6379'
            });
        } catch (e) {
            console.log('Could not initialize oyster, using mock:', e.message);
            oyster = {
                get: () => Promise.resolve(null),
                set: () => Promise.resolve(true),
                del: () => Promise.resolve(true)
            };
        }

        try {
            const aeon_machine = require('aeon-machine');
            aeon = new aeon_machine({
                cortex,
                config,
                url: config.dotEnv.CACHE_REDIS || 'redis://127.0.0.1:6379'
            });
        } catch (e) {
            console.log('Could not initialize aeon, using mock:', e.message);
            aeon = {
                get: () => Promise.resolve(null),
                set: () => Promise.resolve(true)
            };
        }

        const managersLoader = new ManagersLoader({
            config,
            cache,
            cortex,
            oyster,
            aeon
        });

        const managers = managersLoader.load();

        // Attach mongomodels from loader to managers for test usage
        managers.mongomodels = managersLoader.mongomodels;

        // Verify managers loaded correctly
        if (!managers || !managers.mongomodels) {
            throw new Error('Managers or mongomodels not loaded properly');
        }

        // Create Express app
        const app = express();
        app.use(cors({origin: '*'}));
        app.use(express.json());
        app.use(express.urlencoded({ extended: true}));
        app.use('/static', express.static('public'));
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).send('Something broke!');
        });

        // Set up API routes
        app.all('/api/:moduleName/:fnName', managers.userApi.mw);

        return { app, managers };

    } catch (error) {
        console.error('Error creating test app:', error);
        console.error('Stack:', error.stack);
        throw error;
    }
}

// Create test environment with only admin and superadmin users
async function createTestEnvironment(managers) {
    const testEnv = {
        schools: [],
        users: {},
        credentials: {}
    };

    try {
        console.log('Creating test users and schools...');

        const bcrypt = require('bcrypt');

        // 1. Create superadmin user first (has access to all schools)
        const superadminData = {
            username: 'testsuperadmin',
            email: 'superadmin@test.com',
            password: 'superadmin123',
            role: 'superadmin',
            schoolIds: [] // Superadmin has access to all schools
        };

        const superadmin = new managers.mongomodels.user({
            username: superadminData.username,
            email: superadminData.email,
            password: await bcrypt.hash(superadminData.password, 10),
            role: superadminData.role,
            schoolIds: superadminData.schoolIds
        });

        testEnv.users.superadmin = await superadmin.save();
        testEnv.credentials.superadmin = {
            username: superadminData.username,
            password: superadminData.password
        };

        // 2. Create test schools directly using mongoose models with createdBy set to superadmin
        const school1 = new managers.mongomodels.school({
            name: 'Test High School',
            address: '123 Education Ave',
            capacity: 1000,
            createdBy: testEnv.users.superadmin._id,
        });

        const school2 = new managers.mongomodels.school({
            name: 'Test Elementary School',
            address: '456 Learning St',
            capacity: 500,
            createdBy: testEnv.users.superadmin._id,
        });

        testEnv.schools = await Promise.all([
            school1.save(),
            school2.save()
        ]);

        console.log('Test schools created:', testEnv.schools.map(s => ({ id: s._id, name: s.name })));

        // 3. Create admin user (has access to specific schools)
        const adminData = {
            username: 'testadmin',
            email: 'admin@test.com',
            password: 'admin123',
            role: 'admin',
            schoolIds: [testEnv.schools[0]._id] // Admin for first school
        };

        const admin = new managers.mongomodels.user({
            username: adminData.username,
            email: adminData.email,
            password: await bcrypt.hash(adminData.password, 10),
            role: adminData.role,
            schoolIds: adminData.schoolIds
        });

        testEnv.users.admin = await admin.save();
        testEnv.credentials.admin = {
            username: adminData.username,
            password: adminData.password
        };

        // 4. Create second admin user (for different school)
        const admin2Data = {
            username: 'testadmin2',
            email: 'admin2@test.com',
            password: 'admin123',
            role: 'admin',
            schoolIds: [testEnv.schools[1]._id] // Admin for second school
        };

        const admin2 = new managers.mongomodels.user({
            username: admin2Data.username,
            email: admin2Data.email,
            password: await bcrypt.hash(admin2Data.password, 10),
            role: admin2Data.role,
            schoolIds: admin2Data.schoolIds
        });

        testEnv.users.admin2 = await admin2.save();
        testEnv.credentials.admin2 = {
            username: admin2Data.username,
            password: admin2Data.password
        };

        console.log('Test users created:', {
            superadmin: testEnv.users.superadmin._id,
            admin: testEnv.users.admin._id,
            admin2: testEnv.users.admin2._id
        });

        return testEnv;

    } catch (error) {
        console.error('Error creating test environment:', error);
        console.error('Stack:', error.stack);
        throw error;
    }
}

async function getAuthTokens(app, credentials) {
    const request = require('supertest');

    try {
        // 1. Login to get longToken
        const loginResponse = await request(app)
            .post('/api/user/login')
            .send(credentials);

        if (loginResponse.status !== 200) {
            console.error('Login failed for:', credentials.username);
            console.error('Response:', loginResponse.body);
            throw new Error(`Login failed: ${JSON.stringify(loginResponse.body)}`);
        }

        const { longToken, user } = loginResponse.body?.data || {};

        if (!longToken) {
            console.error('Login did not return longToken for:', credentials.username);
            console.error('Full response:', loginResponse.body);
            throw new Error('Missing longToken in login response');
        }

        // 2. Exchange longToken for shortToken
        const tokenResponse = await request(app)
            .post('/api/token/v1_createShortToken')
            .set('token', longToken)
            .set('user-agent', 'test-agent');

        if (tokenResponse.status !== 200) {
            console.error('Token exchange failed for:', credentials.username);
            console.error('Response:', tokenResponse.body);
            throw new Error(`Token exchange failed: ${JSON.stringify(tokenResponse.body)}`);
        }

        const { shortToken } = tokenResponse.body?.data || {};

        if (!shortToken) {
            console.error('Short token not returned for:', credentials.username);
            console.error('Full response:', tokenResponse.body);
            throw new Error('Missing shortToken in token exchange response');
        }

        return {
            longToken,
            shortToken,
            user
        };

    } catch (error) {
        console.error('Error getting auth tokens for:', credentials.username);
        console.error('Error:', error.message);
        throw error;
    }
}

async function setupAllUserTokens(app, testEnv) {
    const tokens = {};

    try {
        // Get tokens for superadmin
        tokens.superadmin = await getAuthTokens(app, testEnv.credentials.superadmin);
        console.log('Superadmin tokens obtained');

        // Get tokens for admin
        tokens.admin = await getAuthTokens(app, testEnv.credentials.admin);
        console.log('Admin tokens obtained');

        // Get tokens for admin2
        tokens.admin2 = await getAuthTokens(app, testEnv.credentials.admin2);
        console.log('Admin2 tokens obtained');

        return tokens;

    } catch (error) {
        console.error('Error setting up user tokens:', error);
        throw error;
    }
}

async function cleanupTestEnvironment(managers, testEnv) {
    try {
        console.log('Cleaning up test environment...');

        if (!testEnv) return;

        // Clean up in reverse order due to dependencies

        // 1. Clean up any test data created during tests
        if (testEnv.schools && testEnv.schools.length > 0) {
            await managers.mongomodels.student.deleteMany({
                schoolId: { $in: testEnv.schools.map(s => s._id) }
            });

            await managers.mongomodels.classroom.deleteMany({
                schoolId: { $in: testEnv.schools.map(s => s._id) }
            });
        }

        // 2. Clean up users
        if (testEnv.users && Object.keys(testEnv.users).length > 0) {
            await managers.mongomodels.user.deleteMany({
                _id: { $in: Object.values(testEnv.users).map(u => u._id) }
            });
        }

        // 3. Clean up schools
        if (testEnv.schools && testEnv.schools.length > 0) {
            await managers.mongomodels.school.deleteMany({
                _id: { $in: testEnv.schools.map(s => s._id) }
            });
        }

        console.log('Test environment cleanup completed');

    } catch (error) {
        console.error('Error cleaning up test environment:', error);
    }
}

async function closeTestApp() {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error closing test app:', error);
    }
}

module.exports = {
    createTestApp,
    createTestEnvironment,
    setupAllUserTokens,
    getAuthTokens,
    cleanupTestEnvironment,
    closeTestApp
};