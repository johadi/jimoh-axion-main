const request = require('supertest');
const { expect } = require('chai');
const {
    createTestApp,
    createTestEnvironment,
    setupAllUserTokens,
    cleanupTestEnvironment,
    closeTestApp
} = require('./setup');

describe('Classroom Endpoints', () => {
    const helpers = {};
    let app;
    let managers;
    let testEnv;
    let tokens; // { superadmin, admin, admin2 }

    const ua = 'test-agent';

    helpers.createClassroom = async ({ token, schoolId, name, capacity = 30, resources }) => {
        const res = await request(app)
            .post('/api/classroom/createClassroom')
            .set('user-agent', ua)
            .set('token', token)
            .send({ schoolId, name, capacity, resources });
        return res;
    };

    helpers.getClassrooms = async ({ token, schoolId, page=1, limit=10, search }) => {
        const res = await request(app)
            .get('/api/classroom/getClassrooms')
            .set('user-agent', ua)
            .set('token', token)
            .query({ schoolId, page, limit, search });
        return res;
    };

    helpers.getClassroomById = async ({ token, schoolId, classroomId }) => {
        const res = await request(app)
            .get('/api/classroom/getClassroomById')
            .set('user-agent', ua)
            .set('token', token)
            .query({ schoolId, classroomId });
        return res;
    };

    helpers.updateClassroom = async ({ token, schoolId, classroomId, name, capacity }) => {
        const res = await request(app)
            .patch('/api/classroom/updateClassroom')
            .set('user-agent', ua)
            .set('token', token)
            .send({ schoolId, classroomId, name, capacity });
        return res;
    };

    helpers.deleteClassroom = async ({ token, schoolId, classroomId }) => {
        const res = await request(app)
            .delete('/api/classroom/deleteClassroom')
            .set('user-agent', ua)
            .set('token', token)
            .send({ schoolId, classroomId });
        return res;
    };

    helpers.addResources = async ({ token, schoolId, classroomId, resources }) => {
        const res = await request(app)
            .post('/api/classroom/addResources')
            .set('user-agent', ua)
            .set('token', token)
            .send({ schoolId, classroomId, resources });
        return res;
    };

    helpers.removeResources = async ({ token, schoolId, classroomId, resources }) => {
        const res = await request(app)
            .delete('/api/classroom/removeResources')
            .set('user-agent', ua)
            .set('token', token)
            .send({ schoolId, classroomId, resources });
        return res;
    };

    helpers.replaceResources = async ({ token, schoolId, classroomId, resources }) => {
        const res = await request(app)
            .put('/api/classroom/replaceResources')
            .set('user-agent', ua)
            .set('token', token)
            .send({ schoolId, classroomId, resources });
        return res;
    };

    // Enroll student via API to a classroom (for studentCount / delete cleanup)
    helpers.enrollStudent = async ({ token, schoolId, classroomId, firstName, lastName, dateOfBirth }) => {
        const res = await request(app)
            .post('/api/student/enrollStudent')
            .set('user-agent', ua)
            .set('token', token)
            .send({ schoolId, classroomId, firstName, lastName, dateOfBirth });
        return res;
    };

    let classrooms = {};

    before(async function () {
        this.timeout(40000);
        const testApp = await createTestApp();
        app = testApp.app;
        managers = testApp.managers;
        testEnv = await createTestEnvironment(managers);
        tokens = await setupAllUserTokens(app, testEnv);

        // Seed classrooms
        const s1 = testEnv.schools[0]._id.toString();
        const s2 = testEnv.schools[1]._id.toString();

        const c1a = await helpers.createClassroom({ token: tokens.admin.shortToken, schoolId: s1, name: `Room A ${Date.now()}`, capacity: 25 });
        expect(c1a.status).to.equal(201);
        const c1b = await helpers.createClassroom({ token: tokens.admin.shortToken, schoolId: s1, name: `Room B ${Date.now()}`, capacity: 35 });
        expect(c1b.status).to.equal(201);
        const c2a = await helpers.createClassroom({ token: tokens.superadmin.shortToken, schoolId: s2, name: `Room C ${Date.now()}`, capacity: 20 });
        expect(c2a.status).to.equal(201);

        classrooms = {
            s1: { a: c1a.body.data.classroom, b: c1b.body.data.classroom },
            s2: { a: c2a.body.data.classroom }
        };

        // Add a couple students to s1.a for studentCount testing
        const dobBase = '2012-01-0';
        const e1 = await helpers.enrollStudent({ token: tokens.admin.shortToken, schoolId: s1, classroomId: classrooms.s1.a._id, firstName: 'Stud', lastName: 'One', dateOfBirth: `${dobBase}1` });
        const e2 = await helpers.enrollStudent({ token: tokens.admin.shortToken, schoolId: s1, classroomId: classrooms.s1.a._id, firstName: 'Stud', lastName: 'Two', dateOfBirth: `${dobBase}2` });
        expect(e1.status).to.be.oneOf([200,201]);
        expect(e2.status).to.be.oneOf([200,201]);
    });

    after(async function () {
        this.timeout(15000);
        if (testEnv) await cleanupTestEnvironment(managers, testEnv);
        await closeTestApp();
    });

    describe('POST /api/classroom/createClassroom', () => {
        it('should create a classroom for admin in their school and reject duplicates/missing fields', async function () {
            this.timeout(15000);
            const schoolId = testEnv.schools[0]._id.toString();
            const name = `Sci Lab ${Date.now()}`;

            const ok = await helpers.createClassroom({ token: tokens.admin.shortToken, schoolId, name, capacity: 28 });
            expect(ok.status).to.equal(201);
            expect(ok.body.ok).to.equal(true);
            expect(ok.body.data.classroom).to.include({ name: name.toLowerCase(), capacity: 28 });

            // duplicate in same school -> 409
            const dup = await helpers.createClassroom({ token: tokens.admin.shortToken, schoolId, name, capacity: 28 });
            expect(dup.status).to.equal(409);

            // missing capacity -> 400
            const miss = await request(app)
                .post('/api/classroom/createClassroom')
                .set('user-agent', ua)
                .set('token', tokens.admin.shortToken)
                .send({ schoolId, name: `NoCap ${Date.now()}` });
            expect(miss.status).to.equal(400);

            // admin tries other school -> 403
            const otherSchoolId = testEnv.schools[1]._id.toString();
            const forb = await helpers.createClassroom({ token: tokens.admin.shortToken, schoolId: otherSchoolId, name: `X ${Date.now()}`, capacity: 20 });
            expect(forb.status).to.equal(403);
        });
    });

    describe('GET /api/classroom/getClassrooms', () => {
        it('should list with pagination and support search by name/resources; admin forbidden for other school', async function () {
            this.timeout(20000);
            const s1 = testEnv.schools[0]._id.toString();

            // Add identifiable resources to one classroom
            const addRes = await helpers.addResources({ token: tokens.admin.shortToken, schoolId: s1, classroomId: classrooms.s1.a._id, resources: ['Projector', 'Whiteboard', 'projector'] });
            expect(addRes.status).to.equal(200);
            expect(addRes.body.data.classroom.resources).to.include('projector');

            // Pagination
            const list = await helpers.getClassrooms({ token: tokens.admin.shortToken, schoolId: s1, page: 1, limit: 2 });
            expect(list.status).to.equal(200);
            expect(list.body.data).to.have.property('classrooms');
            expect(list.body.data).to.have.property('pagination');

            // Search by name fragment (use part of seeded name)
            const fragment = classrooms.s1.a.name.split(' ')[0].slice(0, 3).toLowerCase();
            const searchByName = await helpers.getClassrooms({ token: tokens.admin.shortToken, schoolId: s1, page: 1, limit: 10, search: fragment });
            expect(searchByName.status).to.equal(200);
            expect(searchByName.body.data.pagination.total).to.be.at.least(1);

            // Search by resource
            const searchRes = await helpers.getClassrooms({ token: tokens.admin.shortToken, schoolId: s1, page: 1, limit: 10, search: 'proj' });
            expect(searchRes.status).to.equal(200);
            expect(searchRes.body.data.pagination.total).to.be.at.least(1);

            // Admin forbidden for other school
            const forb = await helpers.getClassrooms({ token: tokens.admin.shortToken, schoolId: testEnv.schools[1]._id.toString(), page: 1, limit: 10 });
            expect(forb.status).to.equal(403);
        });
    });

    describe('GET /api/classroom/getClassroomById', () => {
        it('should fetch classroom by id and include studentCount; admin forbidden for other school', async function () {
            this.timeout(15000);
            const s1 = testEnv.schools[0]._id.toString();
            const cid = classrooms.s1.a._id;

            const ok = await helpers.getClassroomById({ token: tokens.admin.shortToken, schoolId: s1, classroomId: cid });
            expect(ok.status).to.equal(200);
            expect(ok.body.data.classroom).to.have.property('_id', cid);
            expect(ok.body.data.classroom).to.have.property('studentCount').that.is.at.least(2);

            // other school -> 403 (middleware)
            const forb = await helpers.getClassroomById({ token: tokens.admin.shortToken, schoolId: testEnv.schools[1]._id.toString(), classroomId: classrooms.s2.a._id });
            expect(forb.status).to.equal(403);
        });
    });

    describe('PATCH /api/classroom/updateClassroom', () => {
        it('should update name/capacity, lowercase name, and reject duplicates', async function () {
            this.timeout(20000);
            const s1 = testEnv.schools[0]._id.toString();
            const cidA = classrooms.s1.a._id;
            const cidB = classrooms.s1.b._id;

            const unique = `Renamed ${Date.now()}`;
            const up = await helpers.updateClassroom({ token: tokens.admin.shortToken, schoolId: s1, classroomId: cidA, name: unique, capacity: 45 });
            expect(up.status).to.equal(200);
            expect(up.body.data.classroom).to.include({ name: unique.toLowerCase(), capacity: 45 });

            // duplicate to B's name -> 409
            const dupName = classrooms.s1.b.name; // already lowercased in DB
            const dup = await helpers.updateClassroom({ token: tokens.admin.shortToken, schoolId: s1, classroomId: cidA, name: dupName });
            expect(dup.status).to.equal(409);
        });
    });

    describe('Resources management', () => {
        it('should add, remove, and replace resources with sanitization; reject empty add payload', async function () {
            this.timeout(20000);
            const s1 = testEnv.schools[0]._id.toString();
            const cid = classrooms.s1.b._id;

            // add mixed resources (dedupe + lowercase)
            const add = await helpers.addResources({ token: tokens.admin.shortToken, schoolId: s1, classroomId: cid, resources: ['Desk', 'desk', '  Board  ', ''] });
            expect(add.status).to.equal(200);
            expect(add.body.data.addedResources).to.deep.equal(['desk', 'board']);
            expect(add.body.data.classroom.resources).to.include('desk');

            // remove one
            const rem = await helpers.removeResources({ token: tokens.admin.shortToken, schoolId: s1, classroomId: cid, resources: ['DESK'] });
            expect(rem.status).to.equal(200);
            expect(rem.body.data.removedResources).to.deep.equal(['desk']);
            expect(rem.body.data.classroom.resources).to.not.include('desk');

            // replace with new set (allow empty -> clears all after sanitization)
            const rep = await helpers.replaceResources({ token: tokens.admin.shortToken, schoolId: s1, classroomId: cid, resources: ['Projector', 'marker'] });
            expect(rep.status).to.equal(200);
            expect(rep.body.data.newResources).to.deep.equal(['projector', 'marker']);

            const repClear = await helpers.replaceResources({ token: tokens.admin.shortToken, schoolId: s1, classroomId: cid, resources: ['   ', ''] });
            // after sanitization becomes empty array and is allowed
            expect(repClear.status).to.equal(200);
            expect(repClear.body.data.newResources).to.deep.equal([]);

            // add with empty array -> 400 (validator length min 1)
            const badAdd = await helpers.addResources({ token: tokens.admin.shortToken, schoolId: s1, classroomId: cid, resources: [] });
            expect(badAdd.status).to.equal(400);
        });
    });

    describe('DELETE /api/classroom/deleteClassroom', () => {
        it('should delete classroom and unassign students; forbid admin on other school; not-found/invalid cases', async function () {
            this.timeout(25000);
            const s1 = testEnv.schools[0]._id.toString();

            // create temp classroom and enroll two students
            const temp = await helpers.createClassroom({ token: tokens.admin.shortToken, schoolId: s1, name: `Temp ${Date.now()}`, capacity: 22 });
            expect(temp.status).to.equal(201);
            const cid = temp.body.data.classroom._id;

            await helpers.enrollStudent({ token: tokens.admin.shortToken, schoolId: s1, classroomId: cid, firstName: 'Tmp', lastName: 'One', dateOfBirth: '2011-05-01' });
            await helpers.enrollStudent({ token: tokens.admin.shortToken, schoolId: s1, classroomId: cid, firstName: 'Tmp', lastName: 'Two', dateOfBirth: '2011-05-02' });

            const del = await helpers.deleteClassroom({ token: tokens.admin.shortToken, schoolId: s1, classroomId: cid });
            expect(del.status).to.equal(200);
            expect(del.body.data.cleanup).to.have.property('studentsUnassigned').that.is.at.least(2);

            // subsequent fetch -> 404 (but middleware forbids if wrong school)
            const after = await helpers.getClassroomById({ token: tokens.admin.shortToken, schoolId: s1, classroomId: cid });
            expect(after.status).to.equal(404);

            // admin other school forbidden
            const forb = await helpers.deleteClassroom({ token: tokens.admin.shortToken, schoolId: testEnv.schools[1]._id.toString(), classroomId: classrooms.s2.a._id });
            expect(forb.status).to.equal(403);

            // invalid classroomId format -> 400
            const bad = await helpers.deleteClassroom({ token: tokens.admin.shortToken, schoolId: s1, classroomId: 'not-an-id' });
            expect(bad.status).to.equal(400);
        });
    });
});
