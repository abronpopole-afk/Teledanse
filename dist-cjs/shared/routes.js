"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.errorSchemas = void 0;
exports.buildUrl = buildUrl;
const zod_1 = require("zod");
exports.errorSchemas = {
    validation: zod_1.z.object({
        message: zod_1.z.string(),
        field: zod_1.z.string().optional(),
    }),
    notFound: zod_1.z.object({
        message: zod_1.z.string(),
    }),
    internal: zod_1.z.object({
        message: zod_1.z.string(),
    }),
    unauthorized: zod_1.z.object({
        message: zod_1.z.string(),
    })
};
exports.api = {
    bot: {
        getStatus: {
            method: 'GET',
            path: '/api/bot/status',
            responses: {
                200: zod_1.z.object({
                    status: zod_1.z.enum(["running", "stopped", "authenticating", "requires_auth"]),
                    config: zod_1.z.custom().nullable()
                }),
                401: exports.errorSchemas.unauthorized
            }
        },
        login: {
            method: 'POST',
            path: '/api/bot/login',
            input: zod_1.z.object({
                apiId: zod_1.z.coerce.number(),
                apiHash: zod_1.z.string(),
                phoneNumber: zod_1.z.string()
            }),
            responses: {
                200: zod_1.z.object({ message: zod_1.z.string() }), // Code sent
                400: exports.errorSchemas.validation,
                401: exports.errorSchemas.unauthorized
            }
        },
        verifyCode: {
            method: 'POST',
            path: '/api/bot/verify',
            input: zod_1.z.object({
                code: zod_1.z.string()
            }),
            responses: {
                200: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                400: exports.errorSchemas.validation,
                401: exports.errorSchemas.unauthorized
            }
        },
        verifyPassword: {
            method: 'POST',
            path: '/api/bot/password',
            input: zod_1.z.object({
                password: zod_1.z.string()
            }),
            responses: {
                200: zod_1.z.object({ message: zod_1.z.string(), success: zod_1.z.boolean() }),
                400: exports.errorSchemas.validation,
                401: exports.errorSchemas.unauthorized
            }
        },
        updateSettings: {
            method: 'PATCH',
            path: '/api/bot/settings',
            input: zod_1.z.object({
                sourceBotUsername: zod_1.z.string(),
                targetChannelId: zod_1.z.string()
            }),
            responses: {
                200: zod_1.z.custom(),
                400: exports.errorSchemas.validation,
                401: exports.errorSchemas.unauthorized
            }
        },
        start: {
            method: 'POST',
            path: '/api/bot/start',
            responses: {
                200: zod_1.z.object({ status: zod_1.z.literal("running") }),
                400: exports.errorSchemas.validation,
                401: exports.errorSchemas.unauthorized
            }
        },
        stop: {
            method: 'POST',
            path: '/api/bot/stop',
            responses: {
                200: zod_1.z.object({ status: zod_1.z.literal("stopped") }),
                401: exports.errorSchemas.unauthorized
            }
        }
    },
    logs: {
        list: {
            method: 'GET',
            path: '/api/logs',
            responses: {
                200: zod_1.z.array(zod_1.z.custom()),
                401: exports.errorSchemas.unauthorized
            }
        }
    }
};
function buildUrl(path, params) {
    let url = path;
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (url.includes(`:${key}`)) {
                url = url.replace(`:${key}`, String(value));
            }
        });
    }
    return url;
}
