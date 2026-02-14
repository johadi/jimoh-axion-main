module.exports = ({ managers }) =>{
    return ({req, res, next})=>{
        const token = req.headers.token || req.query.token || req.body.token;

        if(!token) {
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'Reset password token not provided'});
        }
        let decoded = null;
        try {
            decoded = managers.token.verifyResetPasswordToken({ token });
            if (!decoded || decoded.purpose !== 'reset_password') {
                return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'Invalid or expired reset password token'});
            }
        } catch(err){
            return managers.responseDispatcher.dispatch(res, {ok: false, code:401, errors: 'Invalid or expired reset password token'});
        }

        next(decoded);
    }
}