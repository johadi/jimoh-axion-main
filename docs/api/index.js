/**
 * API Documentation Index
 * This file aggregates all API documentation from separate files
 * Import this in your main swagger configuration
 */

const studentDocs = require('./student.api.docs');
const schoolDocs = require('./school.api.docs');
const userDocs = require('./user.api.docs');
const classroomDocs = require('./classroom.api.docs');

module.exports = {
  student: studentDocs,
  school: schoolDocs,
  user: userDocs,
  classroom: classroomDocs,
};
