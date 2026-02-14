module.exports = class School {

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.httpExposed         = ['createSchool', 'get=getSchools', 'get=getSchoolById', 'patch=updateSchool', 'delete=deleteSchool'];
    }

    // API Documentation: docs/api/school.api.docs.js -> createSchool
    async createSchool({ __token, __superadmin, name, address, capacity }){
        const school = { name, address, capacity };

        try {
            const validationResult = await this.validators.school.createSchool(school);

            if (validationResult) return { errors: validationResult };

            const existingSchool = await this.mongomodels.school.findOne({ name: name });

            if (existingSchool) {
                return {
                    error: 'School with this name already exists',
                    httpStatusCode: 409
                };
            }

            const newSchool = new this.mongomodels.school({
                name,
                address,
                capacity: capacity || 0,
                createdBy: __superadmin.token.userId
            });

            const savedSchool = await newSchool.save();

            await savedSchool.populate('createdBy', 'username email');

            return {
                school: savedSchool,
                httpStatusCode: 201
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/school.api.docs.js -> getSchools
    async getSchools({ __token, __superadmin, __query }){
        let page = __query.page;
        let limit = __query.limit;
        const search = __query.search;

        try {
            const validationResult = await this.validators.school.getSchools({ search, page, limit });

            if (validationResult) return { errors: validationResult };

            page = page ? Number(page) : 1;
            limit = limit ? Number(limit) : 10;
            const query = {};

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { address: { $regex: search, $options: 'i' } }
                ];
            }
            console.log('search', search, 'page', page, 'limit', limit, 'query', query, '__query', __query);

            const skip = (page - 1) * limit;

            const schools = await this.mongomodels.school
                .find(query)
                .populate('createdBy', 'username email')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await this.mongomodels.school.countDocuments(query);

            return {
                schools,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/school.api.docs.js -> getSchoolById
    async getSchoolById({ __token, __superadmin, __query, schoolId: schoolIdInput }){
        try {
            const schoolId = __query.schoolId || schoolIdInput;
            const validationResult = await this
                .validators.school.getSchoolById({ schoolId });

            if (validationResult) return { errors: validationResult };

            const school = await this.mongomodels.school
                .findById(schoolId)
                .populate('createdBy', 'username email');

            if (!school) {
                return {
                    error: 'School not found',
                    httpStatusCode: 404
                };
            }

            return {
                school,
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/school.api.docs.js -> updateSchool
    async updateSchool({ __token, __superadmin, __query, schoolId: schoolIdInput, name, address, capacity }){
        const updateData = { name, address, capacity };
        const schoolId = __query.schoolId || schoolIdInput;

        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        try {
            const validationResult = await this.validators.school.updateSchool({ schoolId, ...updateData });

            if (validationResult) return { errors: validationResult };

            const school = await this.mongomodels.school.findById(schoolId);

            if (!school) {
                return {
                    error: 'School not found',
                    httpStatusCode: 404
                };
            }

            // Check if name already exists
            if (name && name.toLowerCase() !== school.name) {
                const existingSchool = await this.mongomodels.school.findOne({
                    name: name.toLowerCase(),
                });

                if (existingSchool) {
                    return {
                        error: 'School with this name already exists',
                        httpStatusCode: 409
                    };
                }
            }

            const updatedSchool = await this.mongomodels.school.findByIdAndUpdate(
                schoolId,
                updateData,
                { new: true, runValidators: true }
            ).populate('createdBy', 'username email');

            return {
                school: updatedSchool,
                message: 'School updated successfully',
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/school.api.docs.js -> deleteSchool
    async deleteSchool({ __token, __superadmin, __query, schoolId: schoolIdInput }){
        const schoolId = __query.schoolId || schoolIdInput;

        try {
            const validationResult = await this.validators.school.deleteSchool({ schoolId });

            if (validationResult) return { errors: validationResult };

            const school = await this.mongomodels.school.findById(schoolId);

            if (!school) {
                return {
                    error: 'School not found',
                    httpStatusCode: 404
                };
            }

            const cleanupResults = {};

            // Remove school from users' schoolIds arrays
            const userUpdateResult = await this.mongomodels.user.updateMany(
                { schoolIds: schoolId },
                { $pull: { schoolIds: schoolId } }
            );
            cleanupResults.usersUnassigned = userUpdateResult.modifiedCount;

            // Remove school association from students
            const studentUpdateResult = await this.mongomodels.student.updateMany(
                { schoolId: schoolId },
                { $unset: { schoolId: 1 } }
            );
            cleanupResults.studentsUnassigned = studentUpdateResult.modifiedCount;

            await this.mongomodels.school.findByIdAndDelete(schoolId);

            return {
                message: 'School deleted successfully',
                cleanup: {
                    usersUnassigned: cleanupResults.usersUnassigned,
                    studentsUnassigned: cleanupResults.studentsUnassigned
                },
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