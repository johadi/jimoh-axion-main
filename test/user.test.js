const request = require('supertest');
const { expect } = require('chai');
const {
    createTestApp,
    createTestEnvironment,
    setupAllUserTokens,
    getAuthTokens,
    cleanupTestEnvironment,
    closeTestApp
} = require('./setup');

function randomStr(prefix='u'){ return `${prefix}${Math.random().toString(36).slice(2,8)}`; }

describe('User Endpoints', () => {
    let app;
    let managers;
    let testEnv;
    let tokens; // { superadmin, admin, admin2 }

    before(async function () {
        this.timeout(30000);
        const testApp = await createTestApp();
        app = testApp.app;
        managers = testApp.managers;
        testEnv = await createTestEnvironment(managers);
        tokens = await setupAllUserTokens(app, testEnv);
    });

    after(async function () {
        this.timeout(10000);
        if (testEnv) await cleanupTestEnvironment(managers, testEnv);
        await closeTestApp();
    });

    describe('POST /api/user/login', () => {
        it('should login seeded superadmin and return longToken', async () => {
            const res = await request(app)
                .post('/api/user/login')
                .set('user-agent', 'test-agent')
                .send({ username: testEnv.credentials.superadmin.username, password: testEnv.credentials.superadmin.password });
            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('ok', true);
            expect(res.body.data).to.have.property('longToken').that.is.a('string');
            expect(res.body.data).to.have.property('user');
        });

        it('should reject invalid credentials with 401', async () => {
            const res = await request(app)
                .post('/api/user/login')
                .set('user-agent', 'test-agent')
                .send({ username: 'nope_user', password: 'badpassword123' });
            expect(res.status).to.equal(401);
            expect(res.body.ok).to.equal(false);
        });
    });

    describe('POST /api/user/createUser', () => {
        it('should allow superadmin to create an admin assigned to specific schools', async function () {
            this.timeout(10000);
            const username = randomStr('admin');
            const email = `${username}@test.com`;

            const res = await request(app)
                .post('/api/user/createUser')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .send({
                    username,
                    email,
                    password: 'Password123',
                    role: 'admin',
                    schoolIds: [ testEnv.schools[0]._id.toString() ]
                });

            expect(res.status).to.equal(201);
            expect(res.body.ok).to.equal(true);
            expect(res.body.data.user).to.include({ username });
            expect(res.body.data.user.schoolIds.map(String)).to.include(testEnv.schools[0]._id.toString());
        });

        it('should reject duplicate username or email with 409', async () => {
            const username = randomStr('dupe');
            const email = `${username}@mail.com`;

            const r1 = await request(app)
                .post('/api/user/createUser')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .send({ username, email, password: 'Password123', role: 'admin' });
            expect(r1.status).to.equal(201);

            const r2 = await request(app)
                .post('/api/user/createUser')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .send({ username, email, password: 'Password123', role: 'admin' });
            expect(r2.status).to.equal(409);
            expect(r2.body.ok).to.equal(false);
        });

        it('should fail with 400 when providing invalid schoolIds', async () => {
            const username = randomStr('badSchool');
            const email = `${username}@mail.com`;
            const invalidId = '64b9ed2f2f2f2f2f2f2f2f2f'; // looks like ObjectId but not in DB

            const res = await request(app)
                .post('/api/user/createUser')
                .set('token', tokens.superadmin.shortToken)
                .send({ username, email, password: 'Password123', role: 'admin', schoolIds: [invalidId] });
            expect(res.status).to.equal(400);
            expect(res.body.ok).to.equal(false);
        });

        it('should forbid non-superadmin (admin) from creating users', async () => {
            const username = randomStr('noauth');
            const email = `${username}@mail.com`;
            const res = await request(app)
                .post('/api/user/createUser')
                .set('user-agent', 'test-agent')
                .set('token', tokens.admin.shortToken)
                .send({ username, email, password: 'Password123', role: 'admin' });
            expect(res.status).to.equal(403);
            expect(res.body.ok).to.equal(false);
        });
    });

    describe('POST /api/user/requestPasswordReset and /api/user/resetPassword', () => {
        it('should issue a reset token then allow resetting password and login with new password', async function () {
            this.timeout(15000);
            // Create a fresh user to reset
            const username = randomStr('reset');
            const email = `${username}@mail.com`;
            const originalPassword = 'Original123';

            const createRes = await request(app)
                .post('/api/user/createUser')
                .set('token', tokens.superadmin.shortToken)
                .send({ username, email, password: originalPassword, role: 'admin' });
            expect(createRes.status).to.equal(201);

            // Request reset
            const reqRes = await request(app)
                .post('/api/user/requestPasswordReset')
                .set('user-agent', 'test-agent')
                .send({ email });
            expect(reqRes.status).to.equal(200);
            expect(reqRes.body.data).to.have.property('resetToken');
            const resetToken = reqRes.body.data.resetToken;

            // Reset password using token (token is read from headers/body by __resetPasswordToken.mw)
            const newPassword = 'NewPass1234';
            const resetRes = await request(app)
                .post('/api/user/resetPassword')
                .set('user-agent', 'test-agent')
                .set('token', resetToken)
                .send({ password: newPassword });
            expect(resetRes.status).to.equal(200);
            expect(resetRes.body.ok).to.equal(true);

            // Login should work with new password and fail with old
            const loginNew = await request(app)
                .post('/api/user/login')
                .send({ username, password: newPassword });
            expect(loginNew.status).to.equal(200);
            expect(loginNew.body.data).to.have.property('longToken');

            const loginOld = await request(app)
                .post('/api/user/login')
                .send({ username, password: originalPassword });
            expect(loginOld.status).to.equal(401);
        });

        it('should return 404 for password reset request with unknown email', async () => {
            const res = await request(app)
                .post('/api/user/requestPasswordReset')
                .set('user-agent', 'test-agent')
                .send({ email: `${randomStr('nouser')}@none.com` });
            expect(res.status).to.equal(404);
            expect(res.body.ok).to.equal(false);
        });

        it('should reject reset with invalid/forged token', async () => {
            const res = await request(app)
                .post('/api/user/resetPassword')
                .set('user-agent', 'test-agent')
                .set('token', 'invalid.token.here')
                .send({ password: 'SomeNewPassword1' });
            expect(res.status).to.equal(401);
            expect(res.body.ok).to.equal(false);
        });
    });

    describe('PATCH /api/user/assignSchoolsToUser', () => {
        it('should allow superadmin to add new schoolIds; reject invalid ids and already-assigned', async function () {
            this.timeout(15000);
            const username = randomStr('assign');
            const email = `${username}@mail.com`;

            // create user with first school
            const created = await request(app)
                .post('/api/user/createUser')
                .set('token', tokens.superadmin.shortToken)
                .send({ username, email, password: 'Password123', role: 'admin', schoolIds: [ testEnv.schools[0]._id.toString() ] });
            expect(created.status).to.equal(201);
            const userId = created.body.data.user._id;

            // add second valid school -> 200
            const addOk = await request(app)
                .patch('/api/user/assignSchoolsToUser')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .send({ userId, schoolIds: [ testEnv.schools[1]._id.toString() ] });
            expect(addOk.status).to.equal(200);
            expect(addOk.body.data.user.schoolIds.map(String)).to.include(testEnv.schools[1]._id.toString());

            // try adding same school again -> 400 (already assigned)
            const addAgain = await request(app)
                .patch('/api/user/assignSchoolsToUser')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .send({ userId, schoolIds: [ testEnv.schools[1]._id.toString() ] });
            expect(addAgain.status).to.equal(400);

            // invalid ObjectId (well-formed but not in DB) -> 400
            const invalidId = '64b9ed2f2f2f2f2f2f2f2f2f';
            const addInvalid = await request(app)
                .patch('/api/user/assignSchoolsToUser')
                .set('token', tokens.superadmin.shortToken)
                .send({ userId, schoolIds: [ invalidId ] });
            expect(addInvalid.status).to.equal(400);
        });

        it('should forbid admin from assigning schools', async () => {
            const username = randomStr('assign_forbid');
            const email = `${username}@mail.com`;
            const created = await request(app)
                .post('/api/user/createUser')
                .set('token', tokens.superadmin.shortToken)
                .send({ username, email, password: 'Password123', role: 'admin' });
            const userId = created.body.data.user._id;

            const res = await request(app)
                .patch('/api/user/assignSchoolsToUser')
                .set('token', tokens.admin.shortToken)
                .send({ userId, schoolIds: [ testEnv.schools[0]._id.toString() ] });
            expect(res.status).to.equal(403);
            expect(res.body.ok).to.equal(false);
        });
    });

    describe('PATCH /api/user/updateUserRole', () => {
        it('should allow superadmin to change role; invalid role should fail; cannot change own role', async function () {
            this.timeout(15000);
            const username = randomStr('role');
            const email = `${username}@mail.com`;

            const created = await request(app)
                .post('/api/user/createUser')
                .set('token', tokens.superadmin.shortToken)
                .send({ username, email, password: 'Password123', role: 'admin' });
            expect(created.status).to.equal(201);
            const userId = created.body.data.user._id;

            // change role to superadmin
            const upd = await request(app)
                .patch('/api/user/updateUserRole')
                .set('token', tokens.superadmin.shortToken)
                .send({ userId, role: 'superadmin' });
            expect(upd.status).to.equal(200);
            expect(upd.body.data.user).to.have.property('role', 'superadmin');

            // invalid role
            const bad = await request(app)
                .patch('/api/user/updateUserRole')
                .set('token', tokens.superadmin.shortToken)
                .send({ userId, role: 'teacher' });
            expect(bad.status).to.equal(400);
            expect(bad.body.ok).to.equal(false);

            // cannot change own role
            const me = await request(app)
                .patch('/api/user/updateUserRole')
                .set('token', tokens.superadmin.shortToken)
                .send({ userId: testEnv.users.superadmin._id.toString(), role: 'admin' });
            expect(me.status).to.equal(400);
            expect(me.body.ok).to.equal(false);
        });

        it('should forbid admin from changing roles', async () => {
            const username = randomStr('role_forbid');
            const email = `${username}@mail.com`;
            const created = await request(app)
                .post('/api/user/createUser')
                .set('token', tokens.superadmin.shortToken)
                .send({ username, email, password: 'Password123', role: 'admin' });
            const userId = created.body.data.user._id;

            const res = await request(app)
                .patch('/api/user/updateUserRole')
                .set('token', tokens.admin.shortToken)
                .send({ userId, role: 'superadmin' });
            expect(res.status).to.equal(403);
            expect(res.body.ok).to.equal(false);
        });
    });
});
