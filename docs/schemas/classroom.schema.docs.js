/**
 * Classroom Swagger Schemas
 * This file contains all Swagger schema definitions for Classroom-related endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateClassroom:
 *       type: object
 *       required:
 *         - name
 *         - capacity
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Name of the classroom (must be unique within the school)
 *           example: "Grade 10-A"
 *         capacity:
 *           type: integer
 *           minimum: 1
 *           description: Maximum student capacity of the classroom
 *           example: 30
 *         resources:
 *           type: array
 *           items:
 *             type: string
 *           description: Optional array of resources available in the classroom
 *           example: ["projector", "whiteboard", "computers"]
 *     UpdateClassroom:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           description: Name of the classroom (must be unique within the school)
 *           example: "Grade 10-A"
 *         capacity:
 *           type: integer
 *           minimum: 1
 *           description: Maximum student capacity of the classroom
 *           example: 30
 *     ManageResources:
 *       type: object
 *       required:
 *         - resources
 *       properties:
 *         resources:
 *           type: array
 *           items:
 *             type: string
 *           minItems: 1
 *           description: Array of resources to add, remove, or replace
 *           example: ["projector", "whiteboard", "computer"]
 *     ClassroomWithSchool:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f1c8e8f1a2a3c4d5e6f789"
 *         name:
 *           type: string
 *           example: "grade 10-a"
 *         capacity:
 *           type: integer
 *           example: 30
 *         resources:
 *           type: array
 *           items:
 *             type: string
 *           example: ["projector", "whiteboard", "computers"]
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
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *     ClassroomWithSchoolAndCount:
 *       allOf:
 *         - $ref: '#/components/schemas/ClassroomWithSchool'
 *         - type: object
 *           properties:
 *             studentCount:
 *               type: integer
 *               description: Current number of students assigned to this classroom
 *               example: 25
 */
