const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const { client } = require("../config/redis");

let authLimiterInstance;
const authLimiter = (req, res, next) => {
    if (!authLimiterInstance) {
        authLimiterInstance = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 20,
            standardHeaders: true,
            legacyHeaders: false,
            message: {
                success: false,
                message: "Too many attempts. Please try again after 15 minutes.",
            },
            store: new RedisStore({
                sendCommand: (...args) => client.sendCommand(args),
                prefix: "rl:auth:"
            })
        });
    }
    return authLimiterInstance(req, res, next);
};

let generalLimiterInstance;
const generalLimiter = (req, res, next) => {
    if (!generalLimiterInstance) {
        generalLimiterInstance = rateLimit({
            windowMs: 15 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
            message: {
                success: false,
                message: "Too many requests. Please slow down.",
            },
            store: new RedisStore({
                sendCommand: (...args) => client.sendCommand(args),
                prefix: "rl:general:"
            })
        });
    }
    return generalLimiterInstance(req, res, next);
};

module.exports = { authLimiter, generalLimiter };
