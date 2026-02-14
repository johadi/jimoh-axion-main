/**
 * Student Swagger Schemas
 * This file contains all Swagger schema definitions for Student-related endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EnrollStudent:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Student's first name
 *           example: "John"
 *         lastName:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Student's last name
 *           example: "Doe"
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Student's date of birth (optional)
 *           example: "2010-05-15"
 *         classroomId:
 *           type: string
 *           pattern: "^[0-9a-fA-F]{24}$"
 *           description: Optional classroom ID to assign student to (must belong to the same school)
 *           example: "64f1c8e8f1a2a3c4d5e6f789"
 *     EnrollStudentResponse:
 *       type: object
 *       properties:
 *         ok:
 *           type: boolean
 *           example: true
 *         code:
 *           type: integer
 *           example: 201
 *         data:
 *           type: object
 *           properties:
 *             student:
 *               $ref: '#/components/schemas/StudentWithPopulatedFields'
 *             message:
 *               type: string
 *               example: "Student enrolled successfully"
 *     StudentWithPopulatedFields:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f1c8e8f1a2a3c4d5e6f123"
 *         firstName:
 *           type: string
 *           example: "John"
 *         lastName:
 *           type: string
 *           example: "Doe"
 *         dateOfBirth:
 *           type: string
 *           format: date-time
 *           example: "2010-05-15T00:00:00.000Z"
 *         enrollmentStatus:
 *           type: string
 *           enum: [enrolled, transferred, graduated, suspended]
 *           example: "enrolled"
 *         schoolId:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f1c8e8f1a2a3b1c2d3e456"
 *             name:
 *               type: string
 *               example: "Washington High School"
 *             address:
 *               type: string
 *               example: "123 Education Ave, City, State"
 *         classroomId:
 *           type: object
 *           nullable: true
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f1c8e8f1a2a3c4d5e6f789"
 *             name:
 *               type: string
 *               example: "Grade 10-A"
 *             capacity:
 *               type: integer
 *               example: 30
 *         transferHistory:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 */
