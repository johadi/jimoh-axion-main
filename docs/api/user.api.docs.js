/**
 * User API Documentation
 * This file contains all Swagger documentation for User endpoints
 */

module.exports = {
  createUser: {
    /**
     * @swagger
     * /api/user/createUser:
     *   post:
     *     summary: Create a new user (SuperAdmin only)
     *     description: |
     *       Creates a new user account with specified role and optional school assignments.
     *       Only accessible by SuperAdmin users. Passwords are automatically hashed.
     *       Users can be assigned to multiple schools during creation.
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: header
     *         name: token
     *         required: false
     *         schema:
     *           type: string
     *         description: Short-lived JWT token. Use the value in the 'token' header
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateUser'
     *     responses:
     *       201:
     *         description: User created successfully
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
     *                     user:
     *                       $ref: '#/components/schemas/UserResponse'
     *       400:
     *         description: Bad request - validation errors or invalid school IDs
     *       401:
     *         description: Unauthorized - invalid or missing token
     *       403:
     *         description: Forbidden - only SuperAdmin can create users
     *       409:
     *         description: User with email or username already exists
     *       500:
     *         description: Internal server error
     */
  },

  login: {
    /**
     * @swagger
     * /api/user/login:
     *   post:
     *     summary: User login
     *     description: |
     *       Authenticate user with username and password. Returns user information 
     *       and a long token that can be used to generate short tokens for API access.
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       200:
     *         description: Login successful
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
     *                     user:
     *                       $ref: '#/components/schemas/UserResponse'
     *                     longToken:
     *                       type: string
     *                       description: Long-lived token for generating short tokens
     *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *                     message:
     *                       type: string
     *                       example: "Use longToken to generate shortToken to access protected routes"
     *       400:
     *         description: Bad request - validation errors
     *       401:
     *         description: Invalid username or password
     *       500:
     *         description: Internal server error
     */
  },

  requestPasswordReset: {
    /**
     * @swagger
     * /api/user/requestPasswordReset:
     *   post:
     *     summary: Request password reset
     *     description: |
     *       Generate a password reset token for a user account. The token should be sent
     *       via email in a production environment. Returns the reset token for development purposes.
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *                 description: Email address of the user requesting password reset
     *                 example: "user@example.com"
     *     responses:
     *       200:
     *         description: Password reset token generated successfully
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
     *                       example: "Password reset token sent to your email."
     *                     resetToken:
     *                       type: string
     *                       description: Password reset token (normally sent via email)
     *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     *       400:
     *         description: Bad request - validation errors
     *       404:
     *         description: Email does not match any account
     *       500:
     *         description: Internal server error
     */
  },

  resetPassword: {
    /**
     * @swagger
     * /api/user/resetPassword:
     *   post:
     *     summary: Reset user password
     *     description: |
     *       Reset user password using a valid reset token. The token must be valid
     *       and not expired.
     *     tags: [Users]
     *     security:
     *       - ResetPasswordAuth: []
     *     parameters:
     *       - in: header
     *         name: token
     *         required: true
     *         schema:
     *           type: string
     *         description: Reset Password JWT token obtained from requestPasswordReset. Can be in the request query or body
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - password
     *             properties:
     *               password:
     *                 type: string
     *                 minLength: 8
     *                 description: New password for the user account
     *                 example: "newSecurePassword123"
     *     responses:
     *       200:
     *         description: Password reset successfully
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
     *                       example: "Password reset successfully"
     *                     user:
     *                       $ref: '#/components/schemas/UserResponse'
     *       400:
     *         description: Bad request - validation errors or invalid reset token
     *       401:
     *         description: Unauthorized - invalid or expired reset token
     *       404:
     *         description: User not found
     *       500:
     *         description: Internal server error
     */
  },

  assignSchoolsToUser: {
    /**
     * @swagger
     * /api/user/assignSchoolsToUser:
     *   patch:
     *     summary: Assign schools to a user (SuperAdmin only)
     *     description: |
     *       Assign one or more schools to an existing user account. Only new schools 
     *       that are not already assigned will be added. All provided school IDs must be valid.
     *       Only accessible by SuperAdmin users.
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: header
     *         name: token
     *         required: false
     *         schema:
     *           type: string
     *         description: Short-lived JWT token. Use the value in the 'token' header
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *               - schoolIds
     *             properties:
     *               userId:
     *                 type: string
     *                 pattern: "^[0-9a-fA-F]{24}$"
     *                 description: ID of the user to assign schools to
     *                 example: "64f1c8e8f1a2a3b1c2d3e456"
     *               schoolIds:
     *                 type: array
     *                 items:
     *                   type: string
     *                   pattern: "^[0-9a-fA-F]{24}$"
     *                 minItems: 1
     *                 description: Array of school IDs to assign to the user
     *                 example: ["64f1c8e8f1a2a3c4d5e6f789", "64f1c8e8f1a2a3c4d5e6f790"]
     *     responses:
     *       200:
     *         description: Schools assigned successfully
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
     *                     user:
     *                       $ref: '#/components/schemas/UserResponse'
     *                     message:
     *                       type: string
     *                       example: "2 school(s) added to user successfully"
     *       400:
     *         description: Bad request - validation errors, invalid school IDs, or schools already assigned
     *       401:
     *         description: Unauthorized - invalid or missing token
     *       403:
     *         description: Forbidden - only SuperAdmin can assign schools
     *       404:
     *         description: User not found
     *       500:
     *         description: Internal server error
     */
  },

  updateUserRole: {
    /**
     * @swagger
     * /api/user/updateUserRole:
     *   patch:
     *     summary: Update user role (SuperAdmin only)
     *     description: |
     *       Update the role of an existing user account. SuperAdmin users cannot change 
     *       their own role. Only accessible by SuperAdmin users.
     *     tags: [Users]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: header
     *         name: token
     *         required: false
     *         schema:
     *           type: string
     *         description: Short-lived JWT token. Use the value in the 'token' header
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - userId
     *               - role
     *             properties:
     *               userId:
     *                 type: string
     *                 pattern: "^[0-9a-fA-F]{24}$"
     *                 description: ID of the user whose role to update
     *                 example: "64f1c8e8f1a2a3b1c2d3e456"
     *               role:
     *                 type: string
     *                 enum: [superadmin, admin, user]
     *                 description: New role for the user
     *                 example: "admin"
     *     responses:
     *       200:
     *         description: User role updated successfully
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
     *                     user:
     *                       $ref: '#/components/schemas/UserResponse'
     *                     message:
     *                       type: string
     *                       example: "User role updated successfully"
     *       400:
     *         description: Bad request - validation errors or cannot change own role
     *       401:
     *         description: Unauthorized - invalid or missing token
     *       403:
     *         description: Forbidden - only SuperAdmin can update user roles
     *       404:
     *         description: User not found
     *       500:
     *         description: Internal server error
     */
  }
};
