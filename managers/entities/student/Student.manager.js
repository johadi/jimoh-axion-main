module.exports = class Student {

    constructor({utils, cache, config, cortex, managers, validators, mongomodels }={}){
        this.config              = config;
        this.cortex              = cortex;
        this.validators          = validators; 
        this.mongomodels         = mongomodels;
        this.httpExposed         = [
            'enrollStudent',
            'get=getStudents', 
            'get=getStudentById', 
            'patch=updateStudent', 
            'delete=deleteStudent',
            'patch=transferStudent',
            'patch=updateEnrollmentStatus',
            'get=getTransferHistory'
        ];
    }

         // API Documentation: docs/api/student.api.docs.js -> enrollStudent
    async enrollStudent({ __token, __admin, __query, firstName, lastName, dateOfBirth, classroomId }){
        const schoolId = __admin.schoolId;
        const targetClassroomId = __query.classroomId || classroomId;
        const student = { schoolId, firstName, lastName, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined, classroomId: targetClassroomId };

        try {
            const validationResult = await this.validators.student.enrollStudent(student);

            if (validationResult) return { errors: validationResult };

            const school = await this.mongomodels.school.findById(schoolId);
            if (!school) {
                return {
                    error: 'School not found',
                    httpStatusCode: 404
                };
            }

            // If classroomId is provided, verify it belongs to the same school
            if (targetClassroomId) {
                const classroom = await this.mongomodels.classroom.findOne({
                    _id: targetClassroomId,
                    schoolId
                });

                if (!classroom) {
                    return {
                        error: 'Classroom not found or does not belong to your school',
                        httpStatusCode: 404
                    };
                }
            }

            // Check if student already exists (same name, school, and DOB)
            const existingStudent = await this.mongomodels.student.findOne({
                schoolId,
                firstName: firstName.toLowerCase(),
                lastName: lastName.toLowerCase(),
                dateOfBirth: dateOfBirth
            });

            if (existingStudent) {
                return {
                    error: 'Student with the same name and date of birth already exists in this school',
                    httpStatusCode: 409
                };
            }

            const newStudent = new this.mongomodels.student({
                schoolId,
                firstName,
                lastName,
                dateOfBirth,
                classroomId: targetClassroomId,
                enrollmentStatus: 'enrolled'
            });

            const savedStudent = await newStudent.save();

            await savedStudent.populate([
                { path: 'schoolId', select: 'name address' },
                { path: 'classroomId', select: 'name capacity' }
            ]);

            return {
                student: savedStudent,
                message: 'Student enrolled successfully',
                httpStatusCode: 201
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/student.api.docs.js -> getStudents
    async getStudents({ __token, __admin, __query }){
        let page = __query.page;
        let limit = __query.limit;
        const search = __query.search;
        const enrollmentStatus = __query.enrollmentStatus;
        const classroomId = __query.classroomId;
        const schoolId = __admin.schoolId;

        try {
            const validationResult = await this.validators.student.getStudents({
                schoolId, classroomId, enrollmentStatus, search, page, limit
            });

            if (validationResult) return { errors: validationResult };

            page = page ? Number(page) : 1;
            limit = limit ? Number(limit) : 10;
            const query = { schoolId };

            // Filter by enrollment status
            if (enrollmentStatus) {
                query.enrollmentStatus = enrollmentStatus;
            }

            // Filter by classroom
            if (classroomId) {
                // Verify classroom belongs to admin's school
                const classroom = await this.mongomodels.classroom.findOne({
                    _id: classroomId,
                    schoolId: schoolId
                });

                if (!classroom) {
                    return {
                        error: 'Classroom not found or access denied',
                        httpStatusCode: 404
                    };
                }
                query.classroomId = classroomId;
            }

            if (search) {
                query.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } }
                ];
            }

            const skip = (page - 1) * limit;

            const students = await this.mongomodels.student
                .find(query)
                .populate([
                    { path: 'schoolId', select: 'name address' },
                    { path: 'classroomId', select: 'name capacity' }
                ])
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await this.mongomodels.student.countDocuments(query);

            // Get enrollment statistics
            const enrollmentStats = await this.mongomodels.student.aggregate([
                { $match: { schoolId: schoolId } },
                { $group: { _id: '$enrollmentStatus', count: { $sum: 1 } } }
            ]);

            return {
                students,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                },
                enrollmentStats,
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/student.api.docs.js -> getStudentById
    async getStudentById({ __token, __admin, __query }){
        try {
            const studentId = __query.studentId;
            const schoolId = __admin.schoolId;

            const validationResult = await this.validators.student.getStudentById({ 
                studentId, schoolId
            });

            if (validationResult) return { errors: validationResult };

            const student = await this.mongomodels.student
                .findOne({ _id: studentId, schoolId })
                .populate([
                    { path: 'schoolId', select: 'name address' },
                    { path: 'classroomId', select: 'name capacity resources' },
                    { 
                        path: 'transferHistory.fromClassroomId', 
                        select: 'name' 
                    },
                    { 
                        path: 'transferHistory.toClassroomId', 
                        select: 'name' 
                    }
                ]);

            if (!student) {
                return {
                    error: 'Student not found or access denied',
                    httpStatusCode: 404
                };
            }

            return {
                student,
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/student.api.docs.js -> updateStudent
    async updateStudent({ __token, __admin, __query, studentId, firstName, lastName, dateOfBirth }){
        const updateData = { firstName, lastName, dateOfBirth };
        const targetStudentId = __query.studentId || studentId;
        const schoolId = __admin.schoolId;

        Object.keys(updateData).forEach(key => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        if (firstName) {
            updateData.firstName = firstName.toLowerCase();
        }
        if (lastName) {
            updateData.lastName = lastName.toLowerCase();
        }

        if (dateOfBirth) {
            updateData.dateOfBirth = new Date(dateOfBirth);
        }

        try {
            const validationResult = await this.validators.student.updateStudent({
                ...updateData,
                schoolId,
                studentId: targetStudentId,
            });

            if (validationResult) return { errors: validationResult };

            const student = await this.mongomodels.student.findOne({
                _id: targetStudentId,
                schoolId
            });

            if (!student) {
                return {
                    error: 'Student not found or access denied',
                    httpStatusCode: 404
                };
            }

            // Check for duplicate if critical info is being updated
            if ((firstName && firstName.toLowerCase() !== student.firstName) || 
                (lastName && lastName.toLowerCase() !== student.lastName) ||
                !this._datesEqual(dateOfBirth, student.dateOfBirth)) {

                const existingStudent = await this.mongomodels.student.findOne({
                    schoolId,
                    firstName: updateData.firstName || student.firstName,
                    lastName: updateData.lastName || student.lastName,
                    dateOfBirth: updateData.dateOfBirth || student.dateOfBirth,
                    _id: { $ne: targetStudentId }
                });

                if (existingStudent) {
                    return {
                        error: 'Student with the same name and date of birth already exists in this school',
                        httpStatusCode: 409
                    };
                }
            }

            const updatedStudent = await this.mongomodels.student.findByIdAndUpdate(
                targetStudentId,
                updateData,
                { new: true, runValidators: true }
            ).populate([
                { path: 'schoolId', select: 'name address' },
                { path: 'classroomId', select: 'name capacity' }
            ]);

            return {
                student: updatedStudent,
                message: 'Student profile updated successfully',
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/student.api.docs.js -> deleteStudent
    async deleteStudent({ __token, __admin, __query, studentId }){
        const targetStudentId = __query.studentId || studentId;
        const schoolId = __admin.schoolId;

        try {
            const validationResult = await this.validators.student.deleteStudent({
                schoolId,
                studentId: targetStudentId 
            });

            if (validationResult) return { errors: validationResult };

            const student = await this.mongomodels.student.findOne({
                _id: targetStudentId,
                schoolId
            });

            if (!student) {
                return {
                    error: 'Student not found or access denied',
                    httpStatusCode: 404
                };
            }

            const deletedStudent = await this.mongomodels.student.findByIdAndDelete(targetStudentId);

            return {
                student: deletedStudent,
                message: 'Student deleted successfully',
                httpStatusCode: 200
            };


        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/student.api.docs.js -> transferStudent
    async transferStudent({ __token, __admin, __query, studentId, classroomId }){
        const targetStudentId = __query.studentId || studentId;
        const targetClassroomId = __query.classroomId || classroomId;
        const schoolId = __admin.schoolId;

        try {
            const validationResult = await this.validators.student.transferStudent({
                schoolId,
                classroomId: targetClassroomId,
                studentId: targetStudentId,
            });

            if (validationResult) return { errors: validationResult };

            const student = await this.mongomodels.student.findOne({
                _id: targetStudentId,
                schoolId
            });

            if (!student) {
                return {
                    error: 'Student not found or access denied',
                    httpStatusCode: 404
                };
            }

            if (student.enrollmentStatus === 'graduated') {
                return {
                    error: 'Graduated students cannot be transferred',
                    httpStatusCode: 400
                };
            }

            // Verify new classroom exists and belongs to the same school
            const newClassroom = await this.mongomodels.classroom.findOne({
                _id: targetClassroomId,
                schoolId: schoolId
            });

            if (!newClassroom) {
                return {
                    error: 'Classroom not found or does not belong to your school',
                    httpStatusCode: 404
                };
            }

            // Check if already in the same classroom
            if (student.classroomId && student.classroomId.toString() === targetClassroomId) {
                return {
                    error: 'Student is already in this classroom',
                    httpStatusCode: 400
                };
            }

            const transferRecord = {
                fromClassroomId: student.classroomId,
                toClassroomId: targetClassroomId,
                transferredAt: new Date()
            };

            const updateData = {
                classroomId: targetClassroomId,
                $push: { transferHistory: transferRecord }
            }

            // set student enrollmentStatus to transferred if already belongs to a classroom and transferring to another classroom
            if (student.classroomId && student.enrollmentStatus === 'enrolled') {
                updateData.enrollmentStatus = 'transferred';
            }

            // Update student with new classroom and add transfer history
            const updatedStudent = await this.mongomodels.student.findByIdAndUpdate(
                targetStudentId,
                updateData,
                { new: true, runValidators: true }
            ).populate([
                { path: 'schoolId', select: 'name address' },
                { path: 'classroomId', select: 'name capacity' },
                { path: 'transferHistory.fromClassroomId', select: 'name' },
                { path: 'transferHistory.toClassroomId', select: 'name' }
            ]);

            return {
                student: updatedStudent,
                transfer: transferRecord,
                message: 'Student transferred successfully',
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/student.api.docs.js -> updateEnrollmentStatus
    async updateEnrollmentStatus({ __token, __admin, __query, studentId, enrollmentStatus }){
        const targetStudentId = __query.studentId || studentId;
        const schoolId = __admin.schoolId;

        try {
            const validationResult = await this.validators.student.updateEnrollmentStatus({
                schoolId,
                enrollmentStatus,
                studentId: targetStudentId,
            });

            if (validationResult) return { errors: validationResult };

            const student = await this.mongomodels.student.findOne({
                _id: targetStudentId,
                schoolId
            });

            if (!student) {
                return {
                    error: 'Student not found or access denied',
                    httpStatusCode: 404
                };
            }

            // If changing to graduated, remove from classroom
            const updateData = { enrollmentStatus };
            if (enrollmentStatus === 'graduated') {
                updateData.classroomId = null;
            }

            const updatedStudent = await this.mongomodels.student.findByIdAndUpdate(
                targetStudentId,
                updateData,
                { new: true, runValidators: true }
            ).populate([
                { path: 'schoolId', select: 'name address' },
            ]);

            return {
                student: updatedStudent,
                message: `Enrollment status updated to ${enrollmentStatus}`,
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    // API Documentation: docs/api/student.api.docs.js -> getTransferHistory
    async getTransferHistory({ __token, __admin, __query }){
        const studentId = __query.studentId;
        const schoolId = __admin.schoolId;

        try {
            const validationResult = await this.validators.student.getTransferHistory({
                studentId,
                schoolId
            });

            if (validationResult) return { errors: validationResult };

            const student = await this.mongomodels.student
                .findOne({ _id: studentId, schoolId })
                .populate([
                    { path: 'transferHistory.fromClassroomId', select: 'name capacity' },
                    { path: 'transferHistory.toClassroomId', select: 'name capacity' }
                ])
                .select('firstName lastName transferHistory enrollmentStatus');

            if (!student) {
                return {
                    error: 'Student not found or access denied',
                    httpStatusCode: 404
                };
            }

            return {
                student: {
                    _id: student._id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    enrollmentStatus: student.enrollmentStatus
                },
                transferHistory: student.transferHistory,
                httpStatusCode: 200
            };

        } catch (error) {
            return {
                error: error.message,
                httpStatusCode: 500
            };
        }
    }

    _datesEqual(date1, date2) {
        if (!date1 && !date2) return true;
        if (!date1 || !date2) return false;
        return new Date(date1).getTime() === new Date(date2).getTime();
    }

}