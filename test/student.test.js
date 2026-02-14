const request = require('supertest');
const { expect } = require('chai');
const {
    createTestApp,
    createTestEnvironment,
    setupAllUserTokens,
    cleanupTestEnvironment,
    closeTestApp
} = require('./setup');

describe('Student Endpoints', () => {
    // Helpers for this test suite
    const helpers = {};
    let app;
    let managers;
    let testEnv;
    let tokens;
    let classrooms = { school1: {}, school2: {} };

    // Create a classroom via mongoose for a given school
    helpers.createClassroom = async (schoolId, nameSuffix='A') => {
        const Classroom = managers?.mongomodels?.classroom || (managers && managers.mongomodels && managers.mongomodels.classroom);
        if (!Classroom) throw new Error('Classroom model not available');
        const cls = new Classroom({
            schoolId,
            name: `room-${nameSuffix}`,
            capacity: 30,
        });
        return cls.save();
    };

    // Enroll a student via API (uses admin or superadmin token)
    helpers.enroll = async ({ token, schoolId, firstName, lastName, dateOfBirth, classroomId }) => {
        const res = await request(app)
            .post('/api/student/enrollStudent')
            .set('token', token)
            .send({ schoolId, firstName, lastName, dateOfBirth, classroomId });
        return res;
    };

    before(async function() {
        this.timeout(30000);

        try {
            // 1. Create test app and connect to database
            const testApp = await createTestApp();
            app = testApp.app;
            managers = testApp.managers;

            // 2. Create comprehensive test environment
            testEnv = await createTestEnvironment(managers);

            // 3. Get authentication tokens for all user types
            tokens = await setupAllUserTokens(app, testEnv);

            console.log('Test environment fully initialized with schools:',
                testEnv.schools.map(s => ({ id: s._id.toString(), name: s.name })));

            // 4. Seed classrooms for both schools
            classrooms.school1.a = await helpers.createClassroom(testEnv.schools[0]._id, '1A');
            classrooms.school1.b = await helpers.createClassroom(testEnv.schools[0]._id, '1B');
            classrooms.school2.a = await helpers.createClassroom(testEnv.schools[1]._id, '2A');
            classrooms.school2.b = await helpers.createClassroom(testEnv.schools[1]._id, '2B');

            console.log('Seeded classrooms:', {
                s1: { a: classrooms.school1.a._id.toString(), b: classrooms.school1.b._id.toString() },
                s2: { a: classrooms.school2.a._id.toString(), b: classrooms.school2.b._id.toString() },
            });

        } catch (error) {
            console.error('Failed to initialize test environment:', error);
            throw error;
        }
    });

    after(async function() {
        this.timeout(10000);

        // Clean up test environment
        if (testEnv) {
            await cleanupTestEnvironment(managers, testEnv);
        }

        await closeTestApp();
    });

    describe('GET /api/student/getStudents', () => {
        it('should get students for admin user with their assigned school', async function() {
            this.timeout(10000);

            const response = await request(app)
                .get('/api/student/getStudents')
                .set('token', tokens.admin.shortToken)
                .query({
                    page: 1,
                    limit: 10,
                    schoolId: testEnv.schools[0]._id.toString() // Admin's assigned school
                });

            console.log('Admin response:', response.status);
            if (response.status !== 200) {
                console.log('Admin error:', response.body);
            }

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('ok', true);
            expect(response.body.data).to.have.property('students');
            expect(response.body.data).to.have.property('pagination');
        });

        it('should deny access for admin trying to access different school', async function() {
            this.timeout(10000);

            const response = await request(app)
                .get('/api/student/getStudents')
                .set('token', tokens.admin.shortToken)
                .query({
                    page: 1,
                    limit: 10,
                    schoolId: testEnv.schools[1]._id.toString() // Different school
                });

            console.log('Admin access denied response:', response.status, response.body);

            // Should be denied access (admin middleware should check school access)
            expect(response.status).to.equal(403);
            expect(response.body).to.have.property('ok', false);
        });

        it('should allow superadmin to access any school', async function() {
            this.timeout(10000);

            // Test access to first school
            const response1 = await request(app)
                .get('/api/student/getStudents')
                .set('token', tokens.superadmin.shortToken)
                .query({
                    page: 1,
                    limit: 10,
                    schoolId: testEnv.schools[0]._id.toString()
                });

            console.log('Superadmin response school1:', response1.status);
            expect(response1.status).to.equal(200);
            expect(response1.body).to.have.property('ok', true);

            // Test access to second school
            const response2 = await request(app)
                .get('/api/student/getStudents')
                .set('token', tokens.superadmin.shortToken)
                .query({
                    page: 1,
                    limit: 10,
                    schoolId: testEnv.schools[1]._id.toString()
                });

            console.log('Superadmin response school2:', response2.status);
            expect(response2.status).to.equal(200);
            expect(response2.body).to.have.property('ok', true);
        });

        it('should allow admin2 to access their assigned school', async function() {
            this.timeout(10000);

            const response = await request(app)
                .get('/api/student/getStudents')
                .set('token', tokens.admin2.shortToken)
                .query({
                    page: 1,
                    limit: 10,
                    schoolId: testEnv.schools[1]._id.toString() // Admin2's assigned school
                });

            console.log('Admin2 response:', response.status);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('ok', true);
            expect(response.body.data).to.have.property('students');
        });
    });

    describe('POST /api/student/enrollStudent', () => {
        it('should enroll a student in admin school with classroom', async function() {
            this.timeout(10000);
            const dob = '2012-05-10';
            const res = await helpers.enroll({
                token: tokens.admin.shortToken,
                schoolId: testEnv.schools[0]._id.toString(),
                firstName: 'Alice',
                lastName: 'Johnson',
                dateOfBirth: dob,
                classroomId: classrooms.school1.a._id.toString()
            });
            expect(res.status).to.equal(201);
            expect(res.body.ok).to.equal(true);
            expect(res.body.data.student).to.have.property('firstName', 'alice');
            expect(res.body.data.student).to.have.nested.property('classroomId._id');
        });

        it('should prevent duplicate enrollment (same name and DOB in school)', async function() {
            this.timeout(10000);
            const dob = '2011-01-01';
            // First enrollment
            const r1 = await helpers.enroll({
                token: tokens.admin.shortToken,
                schoolId: testEnv.schools[0]._id.toString(),
                firstName: 'Bob',
                lastName: 'Smith',
                dateOfBirth: dob,
                classroomId: classrooms.school1.a._id.toString()
            });
            expect(r1.status).to.equal(201);
            // Duplicate
            const r2 = await helpers.enroll({
                token: tokens.admin.shortToken,
                schoolId: testEnv.schools[0]._id.toString(),
                firstName: 'Bob',
                lastName: 'Smith',
                dateOfBirth: dob,
                classroomId: classrooms.school1.a._id.toString()
            });
            expect(r2.status).to.equal(409);
            expect(r2.body.ok).to.equal(false);
        });

        it('should reject classroom that does not belong to admin school', async function() {
            this.timeout(10000);
            const res = await helpers.enroll({
                token: tokens.admin.shortToken,
                schoolId: testEnv.schools[0]._id.toString(),
                firstName: 'Charlie',
                lastName: 'Brown',
                dateOfBirth: '2013-03-03',
                classroomId: classrooms.school2.a._id.toString() // other school classroom
            });
            expect(res.status).to.equal(404);
            expect(res.body.ok).to.equal(false);
        });
    });

    describe('GET /api/student/getStudents (filters and pagination)', () => {
        it('should filter by search and classroom and support pagination', async function() {
            this.timeout(15000);
            const schoolId = testEnv.schools[0]._id.toString();
            // Seed multiple students
            const seeds = [
                ['Daisy', 'Lee', '2010-02-02', classrooms.school1.a._id.toString()],
                ['Daniel', 'Lewis', '2010-02-03', classrooms.school1.b._id.toString()],
                ['Donna', 'Stone', '2010-02-04', classrooms.school1.a._id.toString()],
            ];
            for (const [fn, ln, dob, cid] of seeds) {
                const r = await helpers.enroll({ token: tokens.admin.shortToken, schoolId, firstName: fn, lastName: ln, dateOfBirth: dob, classroomId: cid });
                expect(r.status).to.be.oneOf([200,201]);
            }

            // Search by name fragment 'da' (should match daisy, daniel, donna)
            const resSearch = await request(app)
                .get('/api/student/getStudents')
                .set('token', tokens.admin.shortToken)
                .query({ page: 1, limit: 2, search: 'da', schoolId });
            expect(resSearch.status).to.equal(200);
            expect(resSearch.body.data.pagination).to.have.property('total').that.is.at.least(2);
            expect(resSearch.body.data.students).to.have.lengthOf(2);

            // Filter by classroom
            const resClass = await request(app)
                .get('/api/student/getStudents')
                .set('token', tokens.admin.shortToken)
                .query({ page: 1, limit: 10, classroomId: classrooms.school1.a._id.toString(), schoolId });
            expect(resClass.status).to.equal(200);
            expect(resClass.body.data.students.every(s => s.classroomId && s.classroomId._id === classrooms.school1.a._id.toString())).to.equal(true);

            // Invalid classroom (other school)
            const resInvalidClass = await request(app)
                .get('/api/student/getStudents')
                .set('token', tokens.admin.shortToken)
                .query({ page: 1, limit: 10, classroomId: classrooms.school2.a._id.toString(), schoolId });
            expect(resInvalidClass.status).to.equal(404);
        });
    });

    describe('GET /api/student/getStudentById', () => {
        it('should get a student by id for admin school and deny cross-school access', async function() {
            this.timeout(15000);
            const s1 = await helpers.enroll({
                token: tokens.admin.shortToken,
                schoolId: testEnv.schools[0]._id.toString(),
                firstName: 'Evan',
                lastName: 'Stone',
                dateOfBirth: '2011-07-07',
                classroomId: classrooms.school1.a._id.toString()
            });
            const studentId1 = s1.body.data.student._id;

            // happy path
            const r1 = await request(app)
                .get('/api/student/getStudentById')
                .set('token', tokens.admin.shortToken)
                .query({ studentId: studentId1, schoolId: testEnv.schools[0]._id.toString() });
            expect(r1.status).to.equal(200);
            expect(r1.body.data.student).to.have.property('_id', studentId1);

            // create student in school2
            const s2 = await helpers.enroll({
                token: tokens.superadmin.shortToken,
                schoolId: testEnv.schools[1]._id.toString(),
                firstName: 'Frank',
                lastName: 'Ocean',
                dateOfBirth: '2012-08-08',
                classroomId: classrooms.school2.a._id.toString()
            });
            const studentId2 = s2.body.data.student._id;

            // admin of school1 tries to fetch student from school2 while providing their own schoolId => 404
            const r2 = await request(app)
                .get('/api/student/getStudentById')
                .set('token', tokens.admin.shortToken)
                .query({ studentId: studentId2, schoolId: testEnv.schools[0]._id.toString() });
            expect(r2.status).to.equal(404);
        });
    });

    describe('PATCH /api/student/updateStudent', () => {
        it('should update names (lowercased) and prevent duplicates', async function() {
            this.timeout(15000);
            const schoolId = testEnv.schools[0]._id.toString();
            // create two students
            const a = await helpers.enroll({ token: tokens.admin.shortToken, schoolId, firstName: 'Grace', lastName: 'Hopper', dateOfBirth: '2010-10-10', classroomId: classrooms.school1.a._id.toString()});
            const b = await helpers.enroll({ token: tokens.admin.shortToken, schoolId, firstName: 'Ada', lastName: 'Lovelace', dateOfBirth: '2010-11-11', classroomId: classrooms.school1.b._id.toString()});

            // update A lastName and case
            const up1 = await request(app)
                .patch('/api/student/updateStudent')
                .set('token', tokens.admin.shortToken)
                .send({ studentId: a.body.data.student._id, schoolId, lastName: 'NEWLast' });
            expect(up1.status).to.equal(200);
            expect(up1.body.data.student.lastName).to.equal('newlast');

            // try to update A to match B exactly (firstName/dateOfBirth/lastName) -> 409
            const up2 = await request(app)
                .patch('/api/student/updateStudent')
                .set('token', tokens.admin.shortToken)
                .send({ studentId: a.body.data.student._id, schoolId, firstName: 'Ada', lastName: 'Lovelace', dateOfBirth: '2010-11-11' });
            expect(up2.status).to.equal(409);
        });
    });

    describe('PATCH /api/student/transferStudent', () => {
        it('should transfer student to new classroom and record history; deny same-classroom and graduated', async function() {
            this.timeout(20000);
            const schoolId = testEnv.schools[0]._id.toString();
            const s = await helpers.enroll({ token: tokens.admin.shortToken, schoolId, firstName: 'Henry', lastName: 'Ford', dateOfBirth: '2010-04-04', classroomId: classrooms.school1.a._id.toString()});
            const studentId = s.body.data.student._id;

            // same-classroom attempt
            const same = await request(app)
                .patch('/api/student/transferStudent')
                .set('token', tokens.admin.shortToken)
                .send({ studentId, classroomId: classrooms.school1.a._id.toString(), schoolId });
            expect(same.status).to.equal(400);

            // transfer to B
            const tr = await request(app)
                .patch('/api/student/transferStudent')
                .set('token', tokens.admin.shortToken)
                .send({ studentId, classroomId: classrooms.school1.b._id.toString(), schoolId });
            expect(tr.status).to.equal(200);
            expect(tr.body.data.student).to.have.nested.property('classroomId._id', classrooms.school1.b._id.toString());
            expect(tr.body.data.student.enrollmentStatus).to.equal('transferred');
            expect(tr.body.data.transfer).to.have.property('fromClassroomId');

            // graduate then try transfer -> 400
            const grad = await request(app)
                .patch('/api/student/updateEnrollmentStatus')
                .set('token', tokens.admin.shortToken)
                .send({ studentId, schoolId, enrollmentStatus: 'graduated' });
            expect(grad.status).to.equal(200);
            const tr2 = await request(app)
                .patch('/api/student/transferStudent')
                .set('token', tokens.admin.shortToken)
                .send({ studentId, classroomId: classrooms.school1.a._id.toString(), schoolId });
            expect(tr2.status).to.equal(400);
        });
    });

    describe('PATCH /api/student/updateEnrollmentStatus', () => {
        it('should set graduated and clear classroom; invalid status should fail', async function() {
            this.timeout(15000);
            const schoolId = testEnv.schools[0]._id.toString();
            const s = await helpers.enroll({ token: tokens.admin.shortToken, schoolId, firstName: 'Ivy', lastName: 'Green', dateOfBirth: '2011-09-09', classroomId: classrooms.school1.a._id.toString()});
            const studentId = s.body.data.student._id;

            const grad = await request(app)
                .patch('/api/student/updateEnrollmentStatus')
                .set('token', tokens.admin.shortToken)
                .send({ studentId, schoolId, enrollmentStatus: 'graduated' });
            expect(grad.status).to.equal(200);
            expect(grad.body.data.student.enrollmentStatus).to.equal('graduated');
            expect(grad.body.data.student.classroomId).to.equal(null);

            const invalid = await request(app)
                .patch('/api/student/updateEnrollmentStatus')
                .set('token', tokens.admin.shortToken)
                .send({ studentId, schoolId, enrollmentStatus: 'invalid_status' });
            expect(invalid.status).to.equal(400);
            expect(invalid.body.ok).to.equal(false);
        });
    });

    describe('GET /api/student/getTransferHistory', () => {
        it('should return transfer history for a student', async function() {
            this.timeout(20000);
            const schoolId = testEnv.schools[0]._id.toString();
            const s = await helpers.enroll({ token: tokens.admin.shortToken, schoolId, firstName: 'Jack', lastName: 'Reacher', dateOfBirth: '2012-12-12', classroomId: classrooms.school1.a._id.toString()});
            const studentId = s.body.data.student._id;
            // perform a transfer
            await request(app)
                .patch('/api/student/transferStudent')
                .set('token', tokens.admin.shortToken)
                .send({ studentId, classroomId: classrooms.school1.b._id.toString(), schoolId });

            const hist = await request(app)
                .get('/api/student/getTransferHistory')
                .set('token', tokens.admin.shortToken)
                .query({ studentId, schoolId });
            expect(hist.status).to.equal(200);
            expect(hist.body.data).to.have.property('transferHistory');
            expect(hist.body.data.transferHistory.length).to.be.greaterThan(0);
        });
    });

    describe('DELETE /api/student/deleteStudent', () => {
        it('should delete a student and subsequent fetch returns 404', async function() {
            this.timeout(15000);
            const schoolId = testEnv.schools[0]._id.toString();
            const s = await helpers.enroll({ token: tokens.admin.shortToken, schoolId, firstName: 'Kyle', lastName: 'Broflovski', dateOfBirth: '2013-01-15', classroomId: classrooms.school1.a._id.toString()});
            const studentId = s.body.data.student._id;

            const del = await request(app)
                .delete('/api/student/deleteStudent')
                .set('token', tokens.admin.shortToken)
                .send({ studentId, schoolId });
            expect(del.status).to.equal(200);

            const fetchAfter = await request(app)
                .get('/api/student/getStudentById')
                .set('token', tokens.admin.shortToken)
                .query({ studentId, schoolId });
            expect(fetchAfter.status).to.equal(404);
        });
    });
});