import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";
import { users } from "./models/auth";

// === TABLE DEFINITIONS ===

export const botConfigs = pgTable("bot_configs", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  apiId: integer("api_id").notNull(),
  apiHash: text("api_hash").notNull(),
  phoneNumber: text("phone_number").notNull(),
  sessionString: text("session_string"), // Store the session string here
  sourceBotUsername: text("source_bot_username").notNull(),
  targetChannelId: text("target_channel_id").notNull(),
  isActive: boolean("is_active").default(false),
  lastActive: timestamp("last_active"),
});

export const transferLogs = pgTable("transfer_logs", {
  id: serial("id").primaryKey(),
  configId: integer("config_id").notNull().references(() => botConfigs.id),
  fileName: text("file_name").notNull(),
  status: text("status").notNull(), // 'success', 'failed'
  message: text("message"), // Error message or details
  transferredAt: timestamp("transferred_at").defaultNow(),
});

// === RELATIONS ===

export const botConfigsRelations = relations(botConfigs, ({ one, many }) => ({
  user: one(users, {
    fields: [botConfigs.userId],
    references: [users.id],
  }),
  logs: many(transferLogs),
}));

export const transferLogsRelations = relations(transferLogs, ({ one }) => ({
  config: one(botConfigs, {
    fields: [transferLogs.configId],
    references: [botConfigs.id],
  }),
}));

// === SCHEMAS ===

export const insertBotConfigSchema = createInsertSchema(botConfigs).omit({ 
  id: true, 
  userId: true, 
  lastActive: true,
  sessionString: true // We don't set this directly via API usually, but via login flow
});

export const insertTransferLogSchema = createInsertSchema(transferLogs).omit({ 
  id: true, 
  transferredAt: true 
});

// === TYPES ===

export type BotConfig = typeof botConfigs.$inferSelect;
export type InsertBotConfig = z.infer<typeof insertBotConfigSchema>;
export type TransferLog = typeof transferLogs.$inferSelect;
export type InsertTransferLog = z.infer<typeof insertTransferLogSchema>;

// === API TYPES ===

export type BotStatus = "running" | "stopped" | "authenticating" | "requires_auth";

export interface BotStatusResponse {
  status: BotStatus;
  config: BotConfig | null;
}

export interface LoginRequest {
  apiId: number;
  apiHash: string;
  phoneNumber: string;
}

export interface VerifyCodeRequest {
  code: string;
  phoneCodeHash?: string; // Sometimes needed by GramJS
}

export interface VerifyPasswordRequest {
  password: string;
}

export interface UpdateConfigSettingsRequest {
  sourceBotUsername: string;
  targetChannelId: string;
}
