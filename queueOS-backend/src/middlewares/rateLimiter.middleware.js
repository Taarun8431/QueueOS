const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const { client } = require("../config/redis");

// Instances must be created at module load time, not inside a request handler.
// express-rate-limit v7+ enforces this with ERR_ERL_CREATED_IN_REQUEST_HANDLER.
// The Redis client is imported by reference — sendCommand is called lazily per
// request, so the client does not need to be connected at module load time.

const sendCommand = async (...args) => {
    try {
        if (!client.isOpen) {
            await client.connect();
        }
        return await client.sendCommand(args);
    } catch (err) {
        // passOnStoreError will let request proceed if Redis is temporarily unreachable
        throw err;
    }
};

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    passOnStoreError: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many attempts. Please try again after 15 minutes.",
    },
    store: new RedisStore({
        sendCommand,
        prefix: "rl:auth:"
    })
});

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 2000,
    passOnStoreError: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please slow down.",
    },
    store: new RedisStore({
        sendCommand,
        prefix: "rl:general:"
    })
});

module.exports = { authLimiter, generalLimiter };
