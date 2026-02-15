/**
 * Classroom API Documentation
 * This file contains all Swagger documentation for Classroom endpoints
 */

module.exports = {
  createClassroom: {
    /**
     * @swagger
     * /api/classroom/createClassroom:
     *   post:
     *     summary: Create a new classroom (Admin & SuperAdmin)
     *     description: |
     *       Creates a new classroom within the admin's assigned school.
     *       Classroom names must be unique within the school. Only accessible by Admin & SuperAdmin users.
     *       The classroom is automatically linked to the admin's school.
     *     tags: [Classrooms]
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
     *         description: School ID for admin context. Required for Admin. Can be provided in query or request body.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateClassroom'
     *     responses:
     *       201:
     *         description: Classroom created successfully
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
     *                     classroom:
     *                       $ref: '#/components/schemas/ClassroomWithSchool'
     *       400:
     *         description: Bad request - validation errors
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                   example: ["validation_error"]
     *       401:
     *         description: Unauthorized - invalid or missing token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "unauthorized"
     *       403:
     *         description: Forbidden - only Admin & SuperAdmin can create classrooms
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "forbidden"
     *       404:
     *         description: School not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "not_found"
     *       409:
     *         description: Classroom with this name already exists in this school
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "conflict"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
  },

  getClassrooms: {
    /**
     * @swagger
     * /api/classroom/getClassrooms:
     *   get:
     *     summary: Get all classrooms with pagination and search (Admin & SuperAdmin)
     *     description: |
     *       Retrieves a paginated list of all classrooms in the admin's assigned school.
     *       Search is performed across classroom names and resources. Only accessible by Admin & SuperAdmin users.
     *       Results include pagination information and school details.
     *     tags: [Classrooms]
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
     *         description: School ID for admin context. SuperAdmin can use any schoolId.
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
     *         description: Number of classrooms per page
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *         description: Search term to filter classrooms by name or resources
     *     responses:
     *       200:
     *         description: Classrooms retrieved successfully
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
     *                     classrooms:
     *                       type: array
     *                       items:
     *                         $ref: '#/components/schemas/ClassroomWithSchool'
     *                     pagination:
     *                       $ref: '#/components/schemas/PaginationInfo'
     *       400:
     *         description: Bad request - validation errors
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                   example: ["validation_error"]
     *       401:
     *         description: Unauthorized - invalid or missing token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "unauthorized"
     *       403:
     *         description: Forbidden - only Admin & SuperAdmin can view classrooms
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "forbidden"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
  },

  getClassroomById: {
    /**
     * @swagger
     * /api/classroom/getClassroomById:
     *   get:
     *     summary: Get classroom by ID with student count (Admin & SuperAdmin)
     *     description: |
     *       Retrieves detailed information about a specific classroom by its ID.
     *       Includes school information and current student count. Only accessible by Admin & SuperAdmin users.
     *       Admin can only access classrooms within their assigned school.
     *     tags: [Classrooms]
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
     *         description: School ID for admin context. SuperAdmin can use any schoolId.
     *       - in: query
     *         name: classroomId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the classroom to retrieve
     *         example: "64f1c8e8f1a2a3c4d5e6f789"
     *     responses:
     *       200:
     *         description: Classroom retrieved successfully
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
     *                     classroom:
     *                       $ref: '#/components/schemas/ClassroomWithSchoolAndCount'
     *       400:
     *         description: Bad request - invalid classroom ID format
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                   example: ["validation_error"]
     *       401:
     *         description: Unauthorized - invalid or missing token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "unauthorized"
     *       403:
     *         description: Forbidden - only Admin & SuperAdmin can view classroom details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "forbidden"
     *       404:
     *         description: Classroom not found or access denied
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "not_found"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
  },

  updateClassroom: {
    /**
     * @swagger
     * /api/classroom/updateClassroom:
     *   patch:
     *     summary: Update classroom information (Admin & SuperAdmin)
     *     description: |
     *       Updates an existing classroom's information including name and capacity.
     *       Classroom names must remain unique within the school. Only accessible by Admin & SuperAdmin users.
     *       Only provided fields will be updated (partial updates supported).
     *     tags: [Classrooms]
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
     *         description: School ID for admin context. Required for Admin. Can be provided in query or request body.
     *       - in: query
     *         name: classroomId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the classroom to update
     *         example: "64f1c8e8f1a2a3c4d5e6f789"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateClassroom'
     *     responses:
     *       200:
     *         description: Classroom updated successfully
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
     *                     classroom:
     *                       $ref: '#/components/schemas/ClassroomWithSchool'
     *                     message:
     *                       type: string
     *                       example: "Classroom updated successfully"
     *       400:
     *         description: Bad request - validation errors or invalid classroom ID
     *       401:
     *         description: Unauthorized - invalid or missing token
     *       403:
     *         description: Forbidden - only Admin & SuperAdmin can update classrooms
     *       404:
     *         description: Classroom not found or access denied
     *       409:
     *         description: Classroom with this name already exists in this school
     *       500:
     *         description: Internal server error
     */
  },

  deleteClassroom: {
    /**
     * @swagger
     * /api/classroom/deleteClassroom:
     *   delete:
     *     summary: Delete classroom and cleanup associations (Admin & SuperAdmin)
     *     description: |
     *       Permanently deletes a classroom and performs cleanup:
     *       - Unassigns all students from this classroom
     *       - Deletes the classroom record permanently
     *       Only accessible by Admin & SuperAdmin users. This action cannot be undone.
     *       Admin can only delete classrooms within their assigned school.
     *     tags: [Classrooms]
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
     *         description: School ID for admin context. Required for Admin. Can be provided in query or request body.
     *       - in: query
     *         name: classroomId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the classroom to delete
     *         example: "64f1c8e8f1a2a3c4d5e6f789"
     *     responses:
     *       200:
     *         description: Classroom deleted successfully with cleanup summary
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
     *                       example: "Classroom deleted successfully"
     *                     cleanup:
     *                       type: object
     *                       properties:
     *                         studentsUnassigned:
     *                           type: integer
     *                           description: Number of students unassigned from this classroom
     *                           example: 25
     *       400:
     *         description: Bad request - invalid classroom ID format
     *       401:
     *         description: Unauthorized - invalid or missing token
     *       403:
     *         description: Forbidden - only Admin & SuperAdmin can delete classrooms
     *       404:
     *         description: Classroom not found or access denied
     *       500:
     *         description: Internal server error
     */
  },

  addResources: {
    /**
     * @swagger
     * /api/classroom/addResources:
     *   post:
     *     summary: Add resources to classroom (Admin & SuperAdmin)
     *     description: |
     *       Adds new resources to an existing classroom without affecting existing resources.
     *       Resources are automatically sanitized, deduplicated, and converted to lowercase.
     *       Only accessible by Admin & SuperAdmin users within their assigned school.
     *     tags: [Classrooms]
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
     *         description: School ID for admin context. Required for Admin. Can be provided in query or request body.
     *       - in: query
     *         name: classroomId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the classroom to add resources to
     *         example: "64f1c8e8f1a2a3c4d5e6f789"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ManageResources'
     *     responses:
     *       200:
     *         description: Resources added successfully
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
     *                     classroom:
     *                       $ref: '#/components/schemas/ClassroomWithSchool'
     *                     message:
     *                       type: string
     *                       example: "Added 3 resource(s) successfully"
     *                     addedResources:
     *                       type: array
     *                       items:
     *                         type: string
     *                       example: ["projector", "whiteboard", "computer"]
     *       400:
     *         description: Bad request - validation errors or no valid resources provided
     *       401:
     *         description: Unauthorized - invalid or missing token
     *       403:
     *         description: Forbidden - only Admin & SuperAdmin can manage classroom resources
     *       404:
     *         description: Classroom not found or access denied
     *       500:
     *         description: Internal server error
     */
  },

  removeResources: {
    /**
     * @swagger
     * /api/classroom/removeResources:
     *   delete:
     *     summary: Remove resources from classroom (Admin & SuperAdmin)
     *     description: |
     *       Removes specified resources from an existing classroom.
     *       Resources are automatically sanitized and converted to lowercase for matching.
     *       Only accessible by Admin & SuperAdmin users within their assigned school.
     *     tags: [Classrooms]
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
     *         description: School ID for admin context. Required for Admin. Can be provided in query or request body.
     *       - in: query
     *         name: classroomId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the classroom to remove resources from
     *         example: "64f1c8e8f1a2a3c4d5e6f789"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ManageResources'
     *     responses:
     *       200:
     *         description: Resources removed successfully
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
     *                     classroom:
     *                       $ref: '#/components/schemas/ClassroomWithSchool'
     *                     message:
     *                       type: string
     *                       example: "Resources removed successfully"
     *                     removedResources:
     *                       type: array
     *                       items:
     *                         type: string
     *                       example: ["old_projector", "broken_computer"]
     *       400:
     *         description: Bad request - validation errors
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 errors:
     *                   type: array
     *                   items:
     *                     type: string
     *                   example: ["validation_error"]
     *       401:
     *         description: Unauthorized - invalid or missing token
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "unauthorized"
     *       403:
     *         description: Forbidden - only Admin & SuperAdmin can manage classroom resources
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "forbidden"
     *       404:
     *         description: Classroom not found or access denied
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "not_found"
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 ok:
     *                   type: boolean
     *                   example: false
     *                 message:
     *                   type: string
     *                   example: "Internal server error"
     */
  },

  replaceResources: {
    /**
     * @swagger
     * /api/classroom/replaceResources:
     *   put:
     *     summary: Replace all resources in classroom (Admin & SuperAdmin)
     *     description: |
     *       Completely replaces all existing resources in a classroom with the provided list.
     *       Resources are automatically sanitized, deduplicated, and converted to lowercase.
     *       Providing an empty array will clear all resources from the classroom.
     *       Only accessible by Admin & SuperAdmin users within their assigned school.
     *     tags: [Classrooms]
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
     *         description: School ID for admin context. Required for Admin. Can be provided in query or request body.
     *       - in: query
     *         name: classroomId
     *         required: true
     *         schema:
     *           type: string
     *           pattern: "^[0-9a-fA-F]{24}$"
     *         description: ID of the classroom to replace resources in
     *         example: "64f1c8e8f1a2a3c4d5e6f789"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ManageResources'
     *     responses:
     *       200:
     *         description: Resources replaced successfully
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
     *                     classroom:
     *                       $ref: '#/components/schemas/ClassroomWithSchool'
     *                     message:
     *                       type: string
     *                       example: "Resources replaced successfully"
     *                     newResources:
     *                       type: array
     *                       items:
     *                         type: string
     *                       example: ["new_projector", "smart_board", "laptop_cart"]
     *       400:
     *         description: Bad request - validation errors
     *       401:
     *         description: Unauthorized - invalid or missing token
     *       403:
     *         description: Forbidden - only Admin & SuperAdmin can manage classroom resources
     *       404:
     *         description: Classroom not found or access denied
     *       500:
     *         description: Internal server error
     */
  }
};