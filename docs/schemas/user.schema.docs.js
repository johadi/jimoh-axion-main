/**
 * User Swagger Schemas
 * This file contains all Swagger schema definitions for User-related endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUser:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           description: Unique username for the user
 *           example: "johndoe"
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           description: Password for the user account (will be hashed)
 *           example: "securePassword123"
 *         role:
 *           type: string
 *           enum: [superadmin, admin, user]
 *           description: Role assigned to the user
 *           example: "admin"
 *         schoolIds:
 *           type: array
 *           items:
 *             type: string
 *             pattern: "^[0-9a-fA-F]{24}$"
 *           description: Optional array of school IDs to assign to the user
 *           example: ["64f1c8e8f1a2a3c4d5e6f789"]
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: Username for authentication
 *           example: "johndoe"
 *         password:
 *           type: string
 *           description: User password
 *           example: "securePassword123"
 *     UserResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64f1c8e8f1a2a3b1c2d3e456"
 *         username:
 *           type: string
 *           example: "johndoe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         role:
 *           type: string
 *           enum: [superadmin, admin, user]
 *           example: "admin"
 *         schoolIds:
 *           type: array
 *           items:
 *             type: string
 *           example: ["64f1c8e8f1a2a3c4d5e6f789", "64f1c8e8f1a2a3c4d5e6f790"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         lastPasswordReset:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-15T10:30:00.000Z"
 */
