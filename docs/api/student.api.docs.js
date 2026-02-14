/**
 * Student API Documentation
 * This file contains all Swagger documentation for Student endpoints
 */

module.exports = {
  enrollStudent: {
    /**
     * @swagger
     * /api/student/enrollStudent:
     *   post:
     *     summary: Enroll a new student in a school
     *     description: |
     *       Enrolls a new student in the admin's school. The admin must have access to the specified school.
     *       If a classroomId is provided, the classroom must belong to the same school.
     *       Students are identified by firstName, lastName, and dateOfBirth combination to prevent duplicates.
     *     tags: [Students]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: classroomId
     *         required: false
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: Optional classroom ID to assign the student to
     *         example: "64f1c8e8f1a2a3c4d5e6f789"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/EnrollStudent'
     *     responses:
     *       201:
     *         description: Student enrolled successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/EnrollStudentResponse'
     *       400:
     *         description: Bad request - validation errors
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       404:
     *         description: School or classroom not found
     *       409:
     *         description: Student already exists
     *       500:
     *         description: Internal server error
     */
  },

  getStudents: {
    /**
     * @swagger
     * /api/student/getStudents:
     *   get:
     *     summary: Get list of students
     *     description: |
     *       Retrieve a paginated list of students for the admin's school with optional filtering 
     *       by enrollment status, classroom, and search functionality.
     *     tags: [Students]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         required: false
     *         schema:
     *           type: integer
     *           minimum: 1
     *           default: 1
     *         description: Page number for pagination
     *         example: 1
     *       - in: query
     *         name: limit
     *         required: false
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 10
     *         description: Number of students per page
     *         example: 10
     *       - in: query
     *         name: search
     *         required: false
     *         schema:
     *           type: string
     *         description: Search term for student names (first name or last name)
     *         example: "John"
     *       - in: query
     *         name: enrollmentStatus
     *         required: false
     *         schema:
     *           type: string
     *           enum: [enrolled, transferred, graduated, suspended]
     *         description: Filter by enrollment status
     *         example: "enrolled"
     *       - in: query
     *         name: classroomId
     *         required: false
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: Filter by classroom ID (must belong to admin's school)
     *         example: "64f1c8e8f1a2a3c4d5e6f789"
     *     responses:
     *       200:
     *         description: Students retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: integer
     *                   example: 200
     *                 data:
     *                   type: object
     *                   properties:
     *                     students:
     *                       type: array
     *                       items:
     *                         $ref: '#/components/schemas/StudentWithPopulatedFields'
     *                     pagination:
     *                       $ref: '#/components/schemas/PaginationInfo'
     *                     enrollmentStats:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           _id:
     *                             type: string
     *                             example: "enrolled"
     *                           count:
     *                             type: integer
     *                             example: 20
     *       400:
     *         description: Bad request - validation errors
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Classroom not found (when filtering by classroomId)
     *       500:
     *         description: Internal server error
     */
  },

  getStudentById: {
    /**
     * @swagger
     * /api/student/getStudentById:
     *   get:
     *     summary: Get student by ID
     *     description: |
     *       Retrieve detailed information about a specific student, including populated school 
     *       and classroom information, and transfer history.
     *     tags: [Students]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: studentId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the student to retrieve
     *         example: "64f1c8e8f1a2a3c4d5e6f123"
     *     responses:
     *       200:
     *         description: Student retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: integer
     *                   example: 200
     *                 data:
     *                   type: object
     *                   properties:
     *                     student:
     *                       allOf:
     *                         - $ref: '#/components/schemas/StudentWithPopulatedFields'
     *                         - type: object
     *                           properties:
     *                             classroomId:
     *                               type: object
     *                               properties:
     *                                 _id:
     *                                   type: string
     *                                   example: "64f1c8e8f1a2a3c4d5e6f789"
     *                                 name:
     *                                   type: string
     *                                   example: "Grade 10-A"
     *                                 capacity:
     *                                   type: integer
     *                                   example: 30
     *                                 resources:
     *                                   type: array
     *                                   items:
     *                                     type: string
     *                             transferHistory:
     *                               type: array
     *                               items:
     *                                 type: object
     *                                 properties:
     *                                   fromClassroomId:
     *                                     type: object
     *                                     properties:
     *                                       _id:
     *                                         type: string
     *                                       name:
     *                                         type: string
     *                                   toClassroomId:
     *                                     type: object
     *                                     properties:
     *                                       _id:
     *                                         type: string
     *                                       name:
     *                                         type: string
     *                                   transferredAt:
     *                                     type: string
     *                                     format: date-time
     *       400:
     *         description: Bad request - validation errors
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Student not found or access denied
     *       500:
     *         description: Internal server error
     */
  },

  updateStudent: {
    /**
     * @swagger
     * /api/student/updateStudent:
     *   patch:
     *     summary: Update student information
     *     description: |
     *       Update a student's basic information (firstName, lastName, dateOfBirth).
     *       Prevents duplicate students based on name and date of birth combination.
     *     tags: [Students]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: studentId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the student to update
     *         example: "64f1c8e8f1a2a3c4d5e6f123"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               firstName:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 100
     *                 description: Student's first name
     *                 example: "John"
     *               lastName:
     *                 type: string
     *                 minLength: 1
     *                 maxLength: 100
     *                 description: Student's last name
     *                 example: "Doe"
     *               dateOfBirth:
     *                 type: string
     *                 format: date
     *                 description: Student's date of birth
     *                 example: "2010-05-15"
     *     responses:
     *       200:
     *         description: Student updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: integer
     *                   example: 200
     *                 data:
     *                   type: object
     *                   properties:
     *                     student:
     *                       $ref: '#/components/schemas/StudentWithPopulatedFields'
     *                     message:
     *                       type: string
     *                       example: "Student profile updated successfully"
     *       400:
     *         description: Bad request - validation errors
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Student not found or access denied
     *       409:
     *         description: Student with same name and date of birth already exists
     *       500:
     *         description: Internal server error
     */
  },

  deleteStudent: {
    /**
     * @swagger
     * /api/student/deleteStudent:
     *   delete:
     *     summary: Delete a student
     *     description: |
     *       Permanently delete a student from the system. This action cannot be undone.
     *       Only students belonging to admin's school can be deleted.
     *     tags: [Students]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: studentId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the student to delete
     *         example: "64f1c8e8f1a2a3c4d5e6f123"
     *     responses:
     *       200:
     *         description: Student deleted successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: integer
     *                   example: 200
     *                 data:
     *                   type: object
     *                   properties:
     *                     student:
     *                       $ref: '#/components/schemas/StudentWithPopulatedFields'
     *                     message:
     *                       type: string
     *                       example: "Student deleted successfully"
     *       400:
     *         description: Bad request - validation errors
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Student not found or access denied
     *       500:
     *         description: Internal server error
     */
  },

  transferStudent: {
    /**
     * @swagger
     * /api/student/transferStudent:
     *   patch:
     *     summary: Transfer student to a different classroom
     *     description: |
     *       Transfer a student from one classroom to another within the same school.
     *       Creates a transfer history record and updates enrollment status if applicable.
     *       Graduated students cannot be transferred.
     *     tags: [Students]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: studentId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the student to transfer
     *         example: "64f1c8e8f1a2a3c4d5e6f123"
     *       - in: query
     *         name: classroomId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the destination classroom
     *         example: "64f1c8e8f1a2a3c4d5e6f789"
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               classroomId:
     *                 type: string
     *                 pattern: "^[0-9a-fA-F]{24}$"
     *                 description: Alternative way to pass classroom ID via body
     *                 example: "64f1c8e8f1a2a3c4d5e6f789"
     *     responses:
     *       200:
     *         description: Student transferred successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: integer
     *                   example: 200
     *                 data:
     *                   type: object
     *                   properties:
     *                     student:
     *                       allOf:
     *                         - $ref: '#/components/schemas/StudentWithPopulatedFields'
     *                         - type: object
     *                           properties:
     *                             transferHistory:
     *                               type: array
     *                               items:
     *                                 type: object
     *                                 properties:
     *                                   fromClassroomId:
     *                                     type: object
     *                                     properties:
     *                                       _id:
     *                                         type: string
     *                                       name:
     *                                         type: string
     *                                   toClassroomId:
     *                                     type: object
     *                                     properties:
     *                                       _id:
     *                                         type: string
     *                                       name:
     *                                         type: string
     *                                   transferredAt:
     *                                     type: string
     *                                     format: date-time
     *                     transfer:
     *                       type: object
     *                       properties:
     *                         fromClassroomId:
     *                           type: string
     *                           nullable: true
     *                         toClassroomId:
     *                           type: string
     *                         transferredAt:
     *                           type: string
     *                           format: date-time
     *                     message:
     *                       type: string
     *                       example: "Student transferred successfully"
     *       400:
     *         description: Bad request - graduated students cannot be transferred or student already in classroom
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Student or classroom not found
     *       500:
     *         description: Internal server error
     */
  },

  updateEnrollmentStatus: {
    /**
     * @swagger
     * /api/student/updateEnrollmentStatus:
     *   patch:
     *     summary: Update student enrollment status
     *     description: |
     *       Update a student's enrollment status. When status is changed to 'graduated',
     *       the student is automatically removed from their current classroom.
     *     tags: [Students]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: studentId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the student to update
     *         example: "64f1c8e8f1a2a3c4d5e6f123"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - enrollmentStatus
     *             properties:
     *               enrollmentStatus:
     *                 type: string
     *                 enum: [enrolled, transferred, graduated, suspended]
     *                 description: New enrollment status for the student
     *                 example: "graduated"
     *     responses:
     *       200:
     *         description: Enrollment status updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: integer
     *                   example: 200
     *                 data:
     *                   type: object
     *                   properties:
     *                     student:
     *                       type: object
     *                       properties:
     *                         _id:
     *                           type: string
     *                         firstName:
     *                           type: string
     *                         lastName:
     *                           type: string
     *                         enrollmentStatus:
     *                           type: string
     *                         schoolId:
     *                           type: object
     *                           properties:
     *                             _id:
     *                               type: string
     *                             name:
     *                               type: string
     *                             address:
     *                               type: string
     *                         classroomId:
     *                           type: string
     *                           nullable: true
     *                           description: "Null if status is graduated"
     *                     message:
     *                       type: string
     *                       example: "Enrollment status updated to graduated"
     *       400:
     *         description: Bad request - validation errors
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Student not found or access denied
     *       500:
     *         description: Internal server error
     */
  },

  getTransferHistory: {
    /**
     * @swagger
     * /api/student/getTransferHistory:
     *   get:
     *     summary: Get student transfer history
     *     description: |
     *       Retrieve the complete transfer history for a specific student,
     *       showing all classroom transfers with populated classroom information.
     *     tags: [Students]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: query
     *         name: studentId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the student whose transfer history to retrieve
     *         example: "64f1c8e8f1a2a3c4d5e6f123"
     *     responses:
     *       200:
     *         description: Transfer history retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: integer
     *                   example: 200
     *                 data:
     *                   type: object
     *                   properties:
     *                     student:
     *                       type: object
     *                       properties:
     *                         _id:
     *                           type: string
     *                           example: "64f1c8e8f1a2a3c4d5e6f123"
     *                         firstName:
     *                           type: string
     *                           example: "John"
     *                         lastName:
     *                           type: string
     *                           example: "Doe"
     *                         enrollmentStatus:
     *                           type: string
     *                           example: "transferred"
     *                     transferHistory:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           fromClassroomId:
     *                             type: object
     *                             nullable: true
     *                             properties:
     *                               _id:
     *                                 type: string
     *                                 example: "64f1c8e8f1a2a3c4d5e6f780"
     *                               name:
     *                                 type: string
     *                                 example: "Grade 9-A"
     *                               capacity:
     *                                 type: integer
     *                                 example: 25
     *                           toClassroomId:
     *                             type: object
     *                             properties:
     *                               _id:
     *                                 type: string
     *                                 example: "64f1c8e8f1a2a3c4d5e6f789"
     *                               name:
     *                                 type: string
     *                                 example: "Grade 10-A"
     *                               capacity:
     *                                 type: integer
     *                                 example: 30
     *                           transferredAt:
     *                             type: string
     *                             format: date-time
     *                             example: "2024-01-15T10:30:00.000Z"
     *       400:
     *         description: Bad request - validation errors
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden
     *       404:
     *         description: Student not found or access denied
     *       500:
     *         description: Internal server error
     */
  }
};
