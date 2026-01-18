import { z } from 'zod';
import { insertBotConfigSchema, botConfigs, transferLogs } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  })
};

export const api = {
  bot: {
    getStatus: {
      method: 'GET' as const,
      path: '/api/bot/status',
      responses: {
        200: z.object({
          status: z.enum(["running", "stopped", "authenticating", "requires_auth"]),
          config: z.custom<typeof botConfigs.$inferSelect>().nullable()
        }),
        401: errorSchemas.unauthorized
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/bot/login',
      input: z.object({
        apiId: z.coerce.number(),
        apiHash: z.string(),
        phoneNumber: z.string()
      }),
      responses: {
        200: z.object({ message: z.string() }), // Code sent
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    verifyCode: {
      method: 'POST' as const,
      path: '/api/bot/verify',
      input: z.object({
        code: z.string()
      }),
      responses: {
        200: z.object({ message: z.string(), success: z.boolean() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    verifyPassword: {
      method: 'POST' as const,
      path: '/api/bot/password',
      input: z.object({
        password: z.string()
      }),
      responses: {
        200: z.object({ message: z.string(), success: z.boolean() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    updateSettings: {
      method: 'PATCH' as const,
      path: '/api/bot/settings',
      input: z.object({
        sourceBotUsername: z.string(),
        targetChannelId: z.string()
      }),
      responses: {
        200: z.custom<typeof botConfigs.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    start: {
      method: 'POST' as const,
      path: '/api/bot/start',
      responses: {
        200: z.object({ status: z.literal("running") }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized
      }
    },
    stop: {
      method: 'POST' as const,
      path: '/api/bot/stop',
      responses: {
        200: z.object({ status: z.literal("stopped") }),
        401: errorSchemas.unauthorized
      }
    }
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.custom<typeof transferLogs.$inferSelect>()),
        401: errorSchemas.unauthorized
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
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
