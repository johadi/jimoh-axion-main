const bcrypt = require('bcrypt');

module.exports = class User {

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.tokenManager        = managers.token;
        this.usersCollection     = "users";
        this.httpExposed         = [
            'createUser',
            'login',
            'requestPasswordReset',
            'resetPassword',
            'patch=assignSchoolsToUser',
            'patch=updateUserRole'
        ];
    }

    // API Documentation: docs/api/user.api.docs.js -> createUser
    async createUser({ __token, __superadmin, username, email, password, role, schoolIds = [] }){
        const user = { username, email, password, role, schoolIds };

        try {
            const validationResult = await this.validators.user.createUser(user);
            
            if (validationResult) return { errors: validationResult };

            const existingUser = await this.mongomodels.user.findOne({
                $or: [
                    {email: email},
                    {username: username}
                ]
            });

            if (existingUser) {
                return {
                    error: 'User with this email or username already exists',
                    httpStatusCode: 409
                };
            }

            // Check if provided schools exist
            if (schoolIds && schoolIds.length > 0) {
                const schools = await this.mongomodels.school.find({
                    _id: {$in: schoolIds}
                });

                if (schools.length !== schoolIds.length) {
                    return {
                        error: 'One or more school IDs are invalid',
                        httpStatusCode: 400
                    };
                }
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const newUser = new this.mongomodels.user({
                username,
                email,
                role,
                schoolIds,
                password: hashedPassword,
            });

            const savedUser = await newUser.save();

            const userResponse = savedUser.toObject();
            delete userResponse.password;

            return {
                user: userResponse,
                httpStatusCode: 201
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/user.api.docs.js -> login
    async login({ username, password }) {
        try {
            const validationResult = await this.validators.user.login({username, password});

            if (validationResult) return {errors: validationResult};

            const user = await this.mongomodels.user.findOne({username});

            if (!user) {
                return {
                    error: 'Invalid username or password',
                    httpStatusCode: 401
                };
            }

            const isValidPassword = await bcrypt.compare(password, user.password);

            if (!isValidPassword) {
                return {
                    error: 'Invalid username or password',
                    httpStatusCode: 401
                };
            }

            const userObject = user.toObject();
            delete userObject.password;

            const longToken = this.tokenManager.genLongToken({
                userId: user._id,
                userKey: user._id.toString(),
                role: user.role,
                schoolIds: user.schoolIds
            });


            return {
                user: userObject,
                longToken,
                message: 'Use longToken to generate shortToken to access protected routes',
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/user.api.docs.js -> requestPasswordReset
    async requestPasswordReset({ email }) {
        try {
            const validationResult = await this.validators.user.requestPasswordReset({ email });

            if (validationResult) return { errors: validationResult };

            const user = await this.mongomodels.user.findOne({ email });

            if (!user) {
                return {
                    error: 'The email does not match any account in our records.',
                    httpStatusCode: 404
                };
            }

            const resetToken = this.tokenManager.genResetPasswordToken({
                userId: user._id.toString(),
                email: user.email
            });

            return {
                message: 'Password reset token sent to your email.',
                resetToken, // Will send this via email if I have time to add email feature
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/user.api.docs.js -> resetPassword
    async resetPassword({ __resetPasswordToken, password }) {
        try {
            const validationResult = await this.validators.user.resetPassword({ password });

            if (validationResult) return { errors: validationResult };

            const user = await this.mongomodels.user.findById(__resetPasswordToken.userId);

            if (!user) {
                return {
                    error: 'User not found',
                    httpStatusCode: 404
                };
            }

            if (user.email !== __resetPasswordToken.email) {
                return {
                    error: 'Invalid reset token',
                    httpStatusCode: 400
                };
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            user.password = hashedPassword;
            user.lastPasswordReset = new Date();
            await user.save();

            const userResponse = user.toObject();
            delete userResponse.password;

            return {
                message: 'Password reset successfully',
                user: userResponse,
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }
    
    // API Documentation: docs/api/user.api.docs.js -> assignSchoolsToUser
    async assignSchoolsToUser({ __token, __superadmin, userId, schoolIds }) {
        try {
            const validationResult = await this.validators.user.assignSchoolsToUser({ userId, schoolIds });

            if (validationResult) return { errors: validationResult };

            // Check if user exists
            const user = await this.mongomodels.user.findById(userId);

            if (!user) {
                return {
                    error: 'User not found',
                    httpStatusCode: 404
                };
            }

            // Check if provided schools exist
            if (schoolIds && schoolIds.length > 0) {
                const schools = await this.mongomodels.school.find({
                    _id: { $in: schoolIds }
                });

                if (schools.length !== schoolIds.length) {
                    return {
                        error: 'One or more school IDs are invalid',
                        httpStatusCode: 400
                    };
                }
            }

            // Filter out schools that are already assigned to the user
            const existingSchoolIds = (user.schoolIds || []).map(id => id.toString());
            const newSchoolIds = schoolIds.filter(id => !existingSchoolIds.includes(id.toString()));

            if (newSchoolIds.length === 0) {
                return {
                    error: 'All provided schools are already assigned to this user',
                    httpStatusCode: 400
                };
            }

            // Append new school IDs to existing ones
            user.schoolIds = [...user.schoolIds, ...newSchoolIds];
            const updatedUser = await user.save();

            const userResponse = updatedUser.toObject();
            delete userResponse.password;

            return {
                user: userResponse,
                message: `${newSchoolIds.length} school(s) added to user successfully`,
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/user.api.docs.js -> updateUserRole
    async updateUserRole({ __token, __superadmin, userId, role }) {
        try {
            const validationResult = await this.validators.user.updateUserRole({ userId, role });

            if (validationResult) return { errors: validationResult };

            // Check if user exists
            const user = await this.mongomodels.user.findById(userId);

            if (!user) {
                return {
                    error: 'User not found',
                    httpStatusCode: 404
                };
            }

            // Prevent superadmin from changing their own role
            if (user._id.toString() === __superadmin.token.userId) {
                return {
                    error: 'Cannot change your own role',
                    httpStatusCode: 400
                };
            }

            user.role = role;
            const updatedUser = await user.save();

            const userResponse = updatedUser.toObject();
            delete userResponse.password;

            return {
                user: userResponse,
                message: 'User role updated successfully',
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

}
