/**
 * School Swagger Schemas
 * This file contains all Swagger schema definitions for School-related endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateSchool:
 *       type: object
 *       required:
 *         - name
 *         - address
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: Name of the school (must be unique)
 *           example: "Washington High School"
 *         address:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Physical address of the school
 *           example: "123 Education Avenue, Springfield, State 12345"
 *         capacity:
 *           type: integer
 *           minimum: 0
 *           description: Maximum student capacity of the school
 *           example: 1000
 *     UpdateSchool:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           description: Name of the school (must be unique)
 *           example: "Washington High School"
 *         address:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Physical address of the school
 *           example: "123 Education Avenue, Springfield, State 12345"
 *         capacity:
 *           type: integer
 *           minimum: 0
 *           description: Maximum student capacity of the school
 *           example: 1000
 *     SchoolWithCreator:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f1c8e8f1a2a3b1c2d3e456"
 *         name:
 *           type: string
 *           example: "Washington High School"
 *         address:
 *           type: string
 *           example: "123 Education Avenue, Springfield, State 12345"
 *         capacity:
 *           type: integer
 *           example: 1000
 *         createdBy:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: "64f1c8e8f1a2a3b1c2d3e999"
 *             username:
 *               type: string
 *               example: "superadmin"
 *             email:
 *               type: string
 *               format: email
 *               example: "admin@school.com"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 */
