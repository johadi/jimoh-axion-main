const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const { ipKeyGenerator } = rateLimit;

module.exports = ({ cache, config, responseDispatcher }) => {

    // Disable rate limit for tests
    if (config.dotEnv.ENV === 'test') {
        return (req, res, next) => next();
    }

    const redisClient = cache.redisClient;

    return rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 100,

        standardHeaders: true,
        legacyHeaders: false,

        store: new RedisStore({
            sendCommand: (...args) => redisClient.call(...args),
        }),

        keyGenerator: (req) => ipKeyGenerator(req),

        handler: (req, res) => {
            return responseDispatcher.dispatch(res, {ok: false, code: 429, errors: 'Too many requests, please try again later'});
        },
    });
};
