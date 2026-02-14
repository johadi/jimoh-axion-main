module.exports = ({ managers }) => {
    return ({ req, res, next, results }) => {
        const token = results.__token;

        if (!token) {
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'Unauthorized'});
        }

        const schoolId = req.query?.schoolId || req.body?.schoolId;

        if (!schoolId) {
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'Unauthorized: schoolId is required for admin access'});
        }

        if (token.role === 'superadmin') {
            return next({ schoolId, token });
        }

        if (token.role !== 'admin') {
            return managers.responseDispatcher.dispatch(res, {ok: false, code:403, errors: 'Forbidden: resource access denied'});
        }


        if (!token.schoolIds.includes(schoolId)) {
            return managers.responseDispatcher.dispatch(res, {ok: false, code:403, errors: 'Forbidden: school access denied'});
        }

        console.log('admin access granted', { schoolId, token })
        next({ schoolId, token });
    };
};
