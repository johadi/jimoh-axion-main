/**
 * School API Documentation
 * This file contains all Swagger documentation for School endpoints
 */

module.exports = {
  createSchool: {
    /**
     * @swagger
     * /api/school/createSchool:
     *   post:
     *     summary: Create a new school (SuperAdmin only)
     *     description: |
     *       Creates a new school with specified name, address, and capacity.
     *       Only accessible by SuperAdmin users. School names must be unique.
     *       The creating user is automatically linked as the school creator.
     *     tags: [Schools]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: header
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Short-lived JWT token. Use the value in the 'token' header
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateSchool'
     *     responses:
     *       201:
     *         description: School created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     school:
     *                       $ref: '#/components/schemas/SchoolWithCreator'
     *       400:
     *         description: Bad request - validation errors
     *       401:
     *         description: Unauthorized - invalid or missing token
     *       403:
     *         description: Forbidden - only SuperAdmin can create schools
     *       409:
     *         description: School with this name already exists
     *       500:
     *         description: Internal server error
     */
  },

  getSchools: {
    /**
     * @swagger
     * /api/school/getSchools:
     *   get:
     *     summary: Get all schools with pagination and search (SuperAdmin only)
     *     description: |
     *       Retrieves a paginated list of all schools in the system with optional search functionality.
     *       Search is performed across school names and addresses. Only accessible by SuperAdmin users.
     *       Results include pagination information and creator details.
     *     tags: [Schools]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: header
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Short-lived JWT token. Use the value in the 'token' header
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           minimum: 1
     *           default: 1
     *         description: Page number for pagination
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 100
     *           default: 10
     *         description: Number of schools per page
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search term to filter schools by name or address
     *     responses:
     *       200:
     *         description: Schools retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     schools:
     *                       type: array
     *                       items:
     *                         $ref: '#/components/schemas/SchoolWithCreator'
     *                     pagination:
     *                       $ref: '#/components/schemas/PaginationInfo'
     *       400:
     *         description: Bad request - validation errors
     *       401:
     *         description: Unauthorized - invalid or missing token
     *       403:
     *         description: Forbidden - only SuperAdmin can view all schools
     *       500:
     *         description: Internal server error
     */
  },

  getSchoolById: {
    /**
     * @swagger
     * /api/school/getSchoolById:
     *   get:
     *     summary: Get school by ID (SuperAdmin only)
     *     description: |
     *       Retrieves detailed information about a specific school by its ID.
     *       Includes creator information and all school details. Only accessible by SuperAdmin users.
     *     tags: [Schools]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: header
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Short-lived JWT token. Use the value in the 'token' header
     *       - in: query
     *         name: schoolId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the school to retrieve
     *         example: "64f1c8e8f1a2a3b1c2d3e456"
     *     responses:
     *       200:
     *         description: School retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     school:
     *                       $ref: '#/components/schemas/SchoolWithCreator'
     *       400:
     *         description: Bad request - invalid school ID format
     *       401:
     *         description: Unauthorized - invalid or missing token
     *       403:
     *         description: Forbidden - only SuperAdmin can view school details
     *       404:
     *         description: School not found
     *       500:
     *         description: Internal server error
     */
  },

  updateSchool: {
    /**
     * @swagger
     * /api/school/updateSchool:
     *   patch:
     *     summary: Update school information (SuperAdmin only)
     *     description: |
     *       Updates an existing school's information including name, address, and capacity.
     *       School names must remain unique. Only accessible by SuperAdmin users.
     *       Only provided fields will be updated (partial updates supported).
     *     tags: [Schools]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: header
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Short-lived JWT token. Use the value in the 'token' header
     *       - in: query
     *         name: schoolId
     *         required: false
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the school to update. Can be provided in query or request body
     *         example: "64f1c8e8f1a2a3b1c2d3e456"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateSchool'
     *     responses:
     *       200:
     *         description: School updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     school:
     *                       $ref: '#/components/schemas/SchoolWithCreator'
     *                     message:
     *                       type: string
     *                       example: "School updated successfully"
     *       400:
     *         description: Bad request - validation errors or invalid school ID
     *       401:
     *         description: Unauthorized - invalid or missing token
     *       403:
     *         description: Forbidden - only SuperAdmin can update schools
     *       404:
     *         description: School not found
     *       409:
     *         description: School with this name already exists
     *       500:
     *         description: Internal server error
     */
  },

  deleteSchool: {
    /**
     * @swagger
     * /api/school/deleteSchool:
     *   delete:
     *     summary: Delete school and cleanup associations (SuperAdmin only)
     *     description: |
     *       Permanently deletes a school and performs comprehensive cleanup:
     *       - Removes school from all users' schoolIds arrays
     *       - Unassigns school from all associated students
     *       - Deletes the school record permanently
     *       Only accessible by SuperAdmin users. This action cannot be undone.
     *     tags: [Schools]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: header
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Short-lived JWT token. Use the value in the 'token' header
     *       - in: query
     *         name: schoolId
     *         required: false
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the school to delete. Can be provided in query or request body
     *         example: "64f1c8e8f1a2a3b1c2d3e456"
     *     responses:
     *       200:
     *         description: School deleted successfully with cleanup summary
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     message:
     *                       type: string
     *                       example: "School deleted successfully"
     *                     cleanup:
     *                       type: object
     *                       properties:
     *                         usersUnassigned:
     *                           type: integer
     *                           description: Number of users unassigned from this school
     *                           example: 5
     *                         studentsUnassigned:
     *                           type: integer
     *                           description: Number of students unassigned from this school
     *                           example: 150
     *       400:
     *         description: Bad request - invalid school ID format
     *       401:
     *         description: Unauthorized - invalid or missing token
     *       403:
     *         description: Forbidden - only SuperAdmin can delete schools
     *       404:
     *         description: School not found
     *       500:
     *         description: Internal server error
     */
  }
};