/**
 * Token API Documentation
 * This file contains all Swagger documentation for Token endpoints
 */

module.exports = {
  v1_createShortToken: {
    /**
     * @swagger
     * /api/token/v1_createShortToken:
     *   post:
     *     summary: Generate short token from long token
     *     description: |
     *       Creates a short-lived authentication token from a valid long token.
     *       Short tokens expire in 1 month
     *       
     *       **Authentication Flow:**
     *       1. User logs in and receives a long token
     *       2. Client calls this endpoint with long token to get short token
     *       3. Short token is used for all subsequent API calls
     *       
     *       **Token Properties:**
     *       - Contains user role and school assignments
     *       - Expires in 1 month
     *     tags: [Authentication]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: header
     *         name: token
     *         required: false
     *         schema:
     *           type: string
     *         description: |
     *           Long-lived JWT token received from login.
     *           This token contains user identity and permissions.
     *         example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyS2V5IjoiNjRmMWM4ZThmMWEyYTNjNGQ1ZTZmNzg5Iiwicm9sZSI6InVzZXIifQ..."
     *     responses:
     *       200:
     *         description: Short token generated successfully
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
     *                     shortToken:
     *                       type: string
     *                       description: |
     *                         Short-lived JWT token for API authentication.
     *                         Contains user ID, session ID, device ID, role, and school assignments.
     *                         Use this token in the 'token' header for subsequent API calls.
     *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NGYxYzhlOGYxYTJhM2M0ZDVlNmY3ODkiLCJzZXNzaW9uSWQiOiJhYmMxMjMiLCJkZXZpY2VJZCI6IjViNzMxMGRjIn0..."
     *       401:
     *         description: Unauthorized - Invalid or expired long token
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
  }
};
