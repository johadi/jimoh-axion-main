module.exports = ({ managers }) => {
    return ({ res, next, results }) => {
        const token = results.__token;

        if (!token || !token.userId || !token.role) {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 401,
                errors: 'Unauthorized',
            });
        }

        if (token.role !== 'superadmin') {
            return managers.responseDispatcher.dispatch(res, {
                ok: false,
                code: 403,
                errors: 'Forbidden: superadmin access required',
            });
        }

        next({ token });
    };
};
