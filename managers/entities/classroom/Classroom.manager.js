module.exports = class Classroom {

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.httpExposed         = [
            'createClassroom',
            'get=getClassrooms',
            'get=getClassroomById',
            'patch=updateClassroom',
            'delete=deleteClassroom',
            'addResources',
            'delete=removeResources',
            'put=replaceResources'

        ];
    }

    // API Documentation: docs/api/classroom.api.docs.js -> createClassroom
    async createClassroom({ __token, __admin, name, capacity, resources = [] }){
        const schoolId = __admin.schoolId;
        const classroom = { schoolId, name, capacity, resources };

        try {
            const validationResult = await this.validators.classroom.createClassroom(classroom);

            if (validationResult) return { errors: validationResult };

            const school = await this.mongomodels.school.findById(schoolId);
            if (!school) {
                return {
                    error: 'School not found',
                    httpStatusCode: 404
                };
            }

            // Check if classroom name already exists in this school
            const existingClassroom = await this.mongomodels.classroom.findOne({ 
                schoolId: schoolId, 
                name: name.toLowerCase() 
            });

            if (existingClassroom) {
                return {
                    error: 'Classroom with this name already exists in this school',
                    httpStatusCode: 409
                };
            }

            const newClassroom = new this.mongomodels.classroom({
                ...classroom,
                name: name.toLowerCase(),
            });

            const savedClassroom = await newClassroom.save();

            await savedClassroom.populate('schoolId', 'name address');

            return {
                classroom: savedClassroom,
                httpStatusCode: 201
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/classroom.api.docs.js -> getClassrooms
    async getClassrooms({ __token, __admin, __query }){
        let page = __query.page;
        let limit = __query.limit;
        const search = __query.search;
        const schoolId = __admin.schoolId;

        try {
            const validationResult = await this.validators.classroom.getClassrooms({ schoolId, search, page, limit });

            if (validationResult) return { errors: validationResult };

            page = page ? Number(page) : 1;
            limit = limit ? Number(limit) : 10;
            const query = { schoolId };

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { resources: { $in: [new RegExp(search, 'i')] } }
                ];
            }

            const skip = (page - 1) * limit;

            const classrooms = await this.mongomodels.classroom
                .find(query)
                .populate('schoolId', 'name address')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await this.mongomodels.classroom.countDocuments(query);

            return {
                classrooms,
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

    // API Documentation: docs/api/classroom.api.docs.js -> getClassroomById
    async getClassroomById({ __token, __admin, __query }){
        try {
            const classroomId = __query.classroomId;
            const schoolId = __admin.schoolId;

            const validationResult = await this.validators.classroom.getClassroomById({ schoolId, classroomId });

            if (validationResult) return { errors: validationResult };

            const classroom = await this.mongomodels.classroom
                .findOne({ _id: classroomId, schoolId })
                .populate('schoolId', 'name address');

            if (!classroom) {
                return {
                    error: 'Classroom not found or access denied',
                    httpStatusCode: 404
                };
            }

            // Get student count in this classroom
            const studentCount = await this.mongomodels.student.countDocuments({
                classroomId
            });

            return {
                classroom: {
                    ...classroom.toObject(),
                    studentCount
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

    // API Documentation: docs/api/classroom.api.docs.js -> updateClassroom
    async updateClassroom({ __token, __admin, __query, classroomId, name, capacity }){
        const updateData = { name, capacity };
        const targetClassroomId = __query.classroomId || classroomId;
        const schoolId = __admin.schoolId;

        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        // Convert name to lowercase if provided
        if (name) {
            updateData.name = name.toLowerCase();
        }

        try {
            const validationResult = await this.validators.classroom.updateClassroom({
                ...updateData,
                schoolId,
                classroomId: targetClassroomId,
            });

            if (validationResult) return { errors: validationResult };

            const classroom = await this.mongomodels.classroom.findOne({ 
                _id: targetClassroomId, 
                schoolId
            });

            if (!classroom) {
                return {
                    error: 'Classroom not found or access denied',
                    httpStatusCode: 404
                };
            }

            // Check if name already exists in this school
            if (name && name.toLowerCase() !== classroom.name) {
                const existingClassroom = await this.mongomodels.classroom.findOne({
                    schoolId,
                    name: name.toLowerCase(),
                    _id: { $ne: targetClassroomId }
                });

                if (existingClassroom) {
                    return {
                        error: 'Classroom with this name already exists in this school',
                        httpStatusCode: 409
                    };
                }
            }

            const updatedClassroom = await this.mongomodels.classroom.findByIdAndUpdate(
                targetClassroomId,
                updateData,
                { new: true, runValidators: true }
            ).populate('schoolId', 'name address');

            return {
                classroom: updatedClassroom,
                message: 'Classroom updated successfully',
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/classroom.api.docs.js -> deleteClassroom
    async deleteClassroom({ __token, __admin, __query, classroomId }){
        const targetClassroomId = __query.classroomId || classroomId;
        const schoolId = __admin.schoolId;

        try {
            const validationResult = await this.validators.classroom.deleteClassroom({ schoolId, classroomId: targetClassroomId });

            if (validationResult) return { errors: validationResult };

            const classroom = await this.mongomodels.classroom.findOne({
                schoolId,
                _id: targetClassroomId,
            });

            if (!classroom) {
                return {
                    error: 'Classroom not found or access denied',
                    httpStatusCode: 404
                };
            }

            const cleanupResults = {};

            // Unassign students from this classroom
            const studentUpdateResult = await this.mongomodels.student.updateMany(
                { classroomId: targetClassroomId },
                { $unset: { classroomId: 1 } }
            );
            cleanupResults.studentsUnassigned = studentUpdateResult.modifiedCount;

            // Delete the classroom
            await this.mongomodels.classroom.findByIdAndDelete(targetClassroomId);

            return {
                message: 'Classroom deleted successfully',
                cleanup: {
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

    // API Documentation: docs/api/classroom.api.docs.js -> addResources
    async addResources({ __token, __admin, __query, classroomId, resources }){
        const targetClassroomId = __query.classroomId || classroomId;
        const schoolId = __admin.schoolId;

        try {
            const validationResult = await this.validators.classroom.addResources({
                schoolId,
                resources,
                classroomId: targetClassroomId,
            });

            if (validationResult) return { errors: validationResult };

            // Sanitize resources
            const sanitizedResources = resources
                .filter(resource => typeof resource === 'string' && resource.trim().length > 0)
                .map(resource => resource.trim().toLowerCase())
                .filter((resource, index, array) => array.indexOf(resource) === index);

            if (sanitizedResources.length === 0) {
                return {
                    error: 'No valid resources provided',
                    httpStatusCode: 400
                };
            }

            const classroom = await this.mongomodels.classroom.findOne({
                _id: targetClassroomId,
                schoolId
            });

            if (!classroom) {
                return {
                    error: 'Classroom not found or access denied',
                    httpStatusCode: 404
                };
            }

            // Add resources without duplicates
            const updatedClassroom = await this.mongomodels.classroom.findByIdAndUpdate(
                targetClassroomId,
                { $addToSet: { resources: { $each: sanitizedResources } } },
                { new: true, runValidators: true }
            ).populate('schoolId', 'name address');

            return {
                classroom: updatedClassroom,
                message: `Added ${sanitizedResources.length} resource(s) successfully`,
                addedResources: sanitizedResources,
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/classroom.api.docs.js -> removeResources
    async removeResources({ __token, __admin, __query, classroomId, resources }){
        const targetClassroomId = __query.classroomId || classroomId;
        const schoolId = __admin.schoolId;

        try {
            const validationResult = await this.validators.classroom.removeResources({
                resources,
                schoolId,
                classroomId: targetClassroomId,
            });

            if (validationResult) return { errors: validationResult };

            const sanitizedResources = resources
                .filter(resource => typeof resource === 'string' && resource.trim().length > 0)
                .map(resource => resource.trim().toLowerCase());

            const classroom = await this.mongomodels.classroom.findOne({
                _id: targetClassroomId,
                schoolId
            });

            if (!classroom) {
                return {
                    error: 'Classroom not found or access denied',
                    httpStatusCode: 404
                };
            }

            const updatedClassroom = await this.mongomodels.classroom.findByIdAndUpdate(
                targetClassroomId,
                { $pullAll: { resources: sanitizedResources } },
                { new: true, runValidators: true }
            ).populate('schoolId', 'name address');

            return {
                classroom: updatedClassroom,
                message: 'Resources removed successfully',
                removedResources: sanitizedResources,
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/classroom.api.docs.js -> replaceResources
    async replaceResources({ __token, __admin, __query, classroomId, resources }){
        const targetClassroomId = __query.classroomId || classroomId;
        const schoolId = __admin.schoolId;

        try {
            const validationResult = await this.validators.classroom.replaceResources({
                resources,
                schoolId,
                classroomId: targetClassroomId,
            });

            if (validationResult) return { errors: validationResult };

            // Sanitize resources (allow empty array for clearing)
            const sanitizedResources = resources
                .filter(resource => typeof resource === 'string' && resource.trim().length > 0)
                .map(resource => resource.trim().toLowerCase())
                .filter((resource, index, array) => array.indexOf(resource) === index);

            const classroom = await this.mongomodels.classroom.findOne({
                _id: targetClassroomId,
                schoolId
            });

            if (!classroom) {
                return {
                    error: 'Classroom not found or access denied',
                    httpStatusCode: 404
                };
            }

            const updatedClassroom = await this.mongomodels.classroom.findByIdAndUpdate(
                targetClassroomId,
                { resources: sanitizedResources },
                { new: true, runValidators: true }
            ).populate('schoolId', 'name address');

            return {
                classroom: updatedClassroom,
                message: 'Resources replaced successfully',
                newResources: sanitizedResources,
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