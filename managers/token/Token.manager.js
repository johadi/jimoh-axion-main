const jwt        = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const md5        = require('md5');


module.exports = class TokenManager {

    constructor({config }){
        this.config              = config;
        this.longTokenExpiresIn  = '3y';
        this.shortTokenExpiresIn = '1y';
        this.passwordResetTokenExpiresIn = '1h';

        this.httpExposed         = ['v1_createShortToken'];
    }

    /** 
     * short token are issue from long token 
     * short tokens are issued for 72 hours 
     * short tokens are connected to user-agent
     * short token are used on the soft logout 
     * short tokens are used for account switch 
     * short token represents a device. 
     * long token represents a single user. 
     *  
     * long token contains immutable data and long lived
     * master key must exists on any device to create short tokens
     */
    genLongToken({userId, userKey, role, schoolIds }){
        return jwt.sign(
            { 
                userKey, 
                userId,
                role,
                schoolIds: schoolIds || []
            }, 
            this.config.dotEnv.LONG_TOKEN_SECRET, 
            {expiresIn: this.longTokenExpiresIn
        })
    }

    genShortToken({userId, userKey, sessionId, deviceId, role, schoolIds}){
        return jwt.sign(
            {
                userKey,
                userId,
                sessionId,
                deviceId,
                role,
                schoolIds: schoolIds || []
            },
            this.config.dotEnv.SHORT_TOKEN_SECRET, 
            {expiresIn: this.shortTokenExpiresIn
        })
    }

    genResetPasswordToken({userId, email }){
        return jwt.sign(
            {
                userId,
                email,
                purpose: 'reset_password',
            },
            this.config.dotEnv.RESET_PASSWORD_TOKEN_SECRET,
            {expiresIn: this.passwordResetTokenExpiresIn
            })
    }

    verifyResetPasswordToken({token}){
        return this._verifyToken({token, secret: this.config.dotEnv.RESET_PASSWORD_TOKEN_SECRET,})
    }

    _verifyToken({token, secret}){
        let decoded = null;
        try {
            decoded = jwt.verify(token, secret);
        } catch(err) { console.log('Token error: ', err.message); }
        return decoded;
    }

    verifyLongToken({token}){
        return this._verifyToken({token, secret: this.config.dotEnv.LONG_TOKEN_SECRET,})
    }
    verifyShortToken({token}){
        return this._verifyToken({token, secret: this.config.dotEnv.SHORT_TOKEN_SECRET,})
    }


    /** generate shortId based on a longId */
    v1_createShortToken({__longToken, __device}){

        let decoded = __longToken;
        console.log(decoded);

        let shortToken = this.genShortToken({
            userId: decoded.userId,
            userKey: decoded.userKey,
            sessionId: nanoid(),
            deviceId: md5(__device),
            role: decoded.role,
            schoolIds: decoded.schoolIds
        });

        return { shortToken };
    }
}