const request = require('supertest');
const { expect } = require('chai');
const {
    createTestApp,
    createTestEnvironment,
    setupAllUserTokens,
    cleanupTestEnvironment,
    closeTestApp
} = require('./setup');

describe('School Endpoints', () => {
    const helpers = {};
    let app;
    let managers;
    let testEnv;
    let tokens;

    helpers.createSchool = async ({ token, name, address, capacity }) => {
        const res = await request(app)
            .post('/api/school/createSchool')
            .set('user-agent', 'test-agent')
            .set('token', token)
            .send({ name, address, capacity });
        return res;
    };

    before(async function() {
        this.timeout(30000);
        const testApp = await createTestApp();
        app = testApp.app;
        managers = testApp.managers;

        testEnv = await createTestEnvironment(managers);
        tokens = await setupAllUserTokens(app, testEnv);
    });

    after(async function() {
        this.timeout(10000);
        if (testEnv) {
            await cleanupTestEnvironment(managers, testEnv);
        }
        await closeTestApp();
    });

    describe('POST /api/school/createSchool', () => {
        it('should allow superadmin to create a school and reject duplicates', async function() {
            this.timeout(15000);
            const uniqueName = `My Unique School ${Date.now()}`;

            const r1 = await helpers.createSchool({
                token: tokens.superadmin.shortToken,
                name: uniqueName,
                address: '10 Test Road',
                capacity: 750,
            });
            expect(r1.status).to.equal(201);
            expect(r1.body.ok).to.equal(true);
            expect(r1.body.data.school).to.have.property('name', uniqueName.toLowerCase());
            expect(r1.body.data.school).to.have.nested.property('createdBy.username');

            const r2 = await helpers.createSchool({
                token: tokens.superadmin.shortToken,
                name: uniqueName, // duplicate by name (lowercased unique)
                address: '11 Test Road',
                capacity: 500,
            });
            expect(r2.status).to.equal(409);
            expect(r2.body.ok).to.equal(false);
        });

        it('should forbid admin from creating a school', async function() {
            this.timeout(10000);
            const res = await helpers.createSchool({
                token: tokens.admin.shortToken,
                name: `Admin Try ${Date.now()}`,
                address: 'Nope',
                capacity: 100,
            });
            expect(res.status).to.equal(403);
            expect(res.body.ok).to.equal(false);
        });
    });

    describe('GET /api/school/getSchools', () => {
        it('should paginate and search schools for superadmin; admin forbidden', async function() {
            this.timeout(20000);

            // Seed a few schools for search
            const seeds = ['Alpha Campus', 'Beta Campus', 'Gamma Institute'];
            for (const n of seeds) {
                const r = await helpers.createSchool({ token: tokens.superadmin.shortToken, name: `${n} ${Date.now()}`, address: 'Addr', capacity: 100 });
                expect(r.status).to.equal(201);
            }

            // Superadmin search
            const rs = await request(app)
                .get('/api/school/getSchools')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .query({ page: 1, limit: 2, search: 'campus' });
            expect(rs.status).to.equal(200);
            expect(rs.body.ok).to.equal(true);
            expect(rs.body.data).to.have.property('schools');
            expect(rs.body.data).to.have.property('pagination');
            expect(rs.body.data.pagination).to.have.property('total').that.is.at.least(1);

            // Admin forbidden
            const rf = await request(app)
                .get('/api/school/getSchools')
                .set('user-agent', 'test-agent')
                .set('token', tokens.admin.shortToken)
                .query({ page: 1, limit: 10 });
            expect(rf.status).to.equal(403);
            expect(rf.body.ok).to.equal(false);
        });
    });

    describe('GET /api/school/getSchoolById', () => {
        it('should fetch a school by id (superadmin) and handle invalid/not-found; admin forbidden', async function() {
            this.timeout(20000);

            const make = await helpers.createSchool({
                token: tokens.superadmin.shortToken,
                name: `Fetchable ${Date.now()}`,
                address: 'FindMe',
                capacity: 300,
            });
            expect(make.status).to.equal(201);
            const schoolId = make.body.data.school._id;

            const ok = await request(app)
                .get('/api/school/getSchoolById')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .query({ schoolId });
            expect(ok.status).to.equal(200);
            expect(ok.body.ok).to.equal(true);
            expect(ok.body.data.school).to.have.property('_id', schoolId);

            // invalid id format
            const badId = await request(app)
                .get('/api/school/getSchoolById')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .query({ schoolId: 'not-an-id' });
            expect(badId.status).to.equal(400);

            // not found
            const mongoose = require('mongoose');
            const fakeId = new mongoose.Types.ObjectId().toString();
            const nf = await request(app)
                .get('/api/school/getSchoolById')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .query({ schoolId: fakeId });
            expect(nf.status).to.equal(404);

            // admin forbidden
            const forb = await request(app)
                .get('/api/school/getSchoolById')
                .set('user-agent', 'test-agent')
                .set('token', tokens.admin.shortToken)
                .query({ schoolId });
            expect(forb.status).to.equal(403);
        });
    });

    describe('PATCH /api/school/updateSchool', () => {
        it('should update school details; reject duplicate name; handle not found; admin forbidden', async function() {
            this.timeout(25000);

            // Create two schools
            const s1 = await helpers.createSchool({ token: tokens.superadmin.shortToken, name: `UpOne ${Date.now()}`, address: 'A', capacity: 100 });
            const s2 = await helpers.createSchool({ token: tokens.superadmin.shortToken, name: `UpTwo ${Date.now()}`, address: 'B', capacity: 200 });
            expect(s1.status).to.equal(201);
            expect(s2.status).to.equal(201);
            const schoolId = s1.body.data.school._id;
            const s2name = s2.body.data.school.name; // already lowercase in db

            // happy update
            const uniqueNewName = `New Name MIX ${Date.now()}`;
            const up = await request(app)
                .patch('/api/school/updateSchool')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .send({ schoolId, name: uniqueNewName, address: 'New Address', capacity: 555 });
            expect(up.status).to.equal(200);
            expect(up.body.ok).to.equal(true);
            expect(up.body.data.school).to.include({ address: 'New Address', capacity: 555 });
            expect(up.body.data.school.name).to.equal(uniqueNewName.toLowerCase());

            // duplicate name
            const dup = await request(app)
                .patch('/api/school/updateSchool')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .send({ schoolId, name: s2name });
            expect(dup.status).to.equal(409);

            // not found
            const mongoose = require('mongoose');
            const fakeId = new mongoose.Types.ObjectId().toString();
            const nf = await request(app)
                .patch('/api/school/updateSchool')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .send({ schoolId: fakeId, name: 'whatever' });
            expect(nf.status).to.equal(404);

            // admin forbidden
            const forb = await request(app)
                .patch('/api/school/updateSchool')
                .set('user-agent', 'test-agent')
                .set('token', tokens.admin.shortToken)
                .send({ schoolId, name: 'x' });
            expect(forb.status).to.equal(403);
        });
    });

    describe('DELETE /api/school/deleteSchool', () => {
        it('should delete school successfully and return cleanup stats; handle forbidden and not found', async function() {
            this.timeout(20000);

            const s = await helpers.createSchool({ token: tokens.superadmin.shortToken, name: `Delete Me ${Date.now()}`, address: 'Gone', capacity: 10 });
            expect(s.status).to.equal(201);
            const schoolId = s.body.data.school._id;

            const del = await request(app)
                .delete('/api/school/deleteSchool')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .send({ schoolId });
            expect(del.status).to.equal(200);
            expect(del.body.ok).to.equal(true);
            expect(del.body.data).to.have.property('cleanup');

            const after = await request(app)
                .get('/api/school/getSchoolById')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .query({ schoolId });
            expect(after.status).to.equal(404);

            // admin forbidden
            const forb = await request(app)
                .delete('/api/school/deleteSchool')
                .set('user-agent', 'test-agent')
                .set('token', tokens.admin.shortToken)
                .send({ schoolId });
            expect(forb.status).to.equal(403);

            // not found
            const mongoose = require('mongoose');
            const fakeId = new mongoose.Types.ObjectId().toString();
            const nf = await request(app)
                .delete('/api/school/deleteSchool')
                .set('user-agent', 'test-agent')
                .set('token', tokens.superadmin.shortToken)
                .send({ schoolId: fakeId });
            expect(nf.status).to.equal(404);
        });
    });
});
