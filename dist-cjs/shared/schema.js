"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTransferLogSchema = exports.insertBotConfigSchema = exports.transferLogsRelations = exports.botConfigsRelations = exports.transferLogs = exports.botConfigs = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_zod_1 = require("drizzle-zod");
// Re-export auth models
__exportStar(require("./models/auth"), exports);
const auth_1 = require("./models/auth");
// === TABLE DEFINITIONS ===
exports.botConfigs = (0, pg_core_1.pgTable)("bot_configs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").notNull().references(() => auth_1.users.id),
    apiId: (0, pg_core_1.integer)("api_id").notNull(),
    apiHash: (0, pg_core_1.text)("api_hash").notNull(),
    phoneNumber: (0, pg_core_1.text)("phone_number").notNull(),
    sessionString: (0, pg_core_1.text)("session_string"), // Store the session string here
    sourceBotUsername: (0, pg_core_1.text)("source_bot_username").notNull(),
    targetChannelId: (0, pg_core_1.text)("target_channel_id").notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(false),
    lastActive: (0, pg_core_1.timestamp)("last_active"),
});
exports.transferLogs = (0, pg_core_1.pgTable)("transfer_logs", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    configId: (0, pg_core_1.integer)("config_id").notNull().references(() => exports.botConfigs.id),
    fileName: (0, pg_core_1.text)("file_name").notNull(),
    status: (0, pg_core_1.text)("status").notNull(), // 'success', 'failed'
    message: (0, pg_core_1.text)("message"), // Error message or details
    transferredAt: (0, pg_core_1.timestamp)("transferred_at").defaultNow(),
});
// === RELATIONS ===
exports.botConfigsRelations = (0, drizzle_orm_1.relations)(exports.botConfigs, ({ one, many }) => ({
    user: one(auth_1.users, {
        fields: [exports.botConfigs.userId],
        references: [auth_1.users.id],
    }),
    logs: many(exports.transferLogs),
}));
exports.transferLogsRelations = (0, drizzle_orm_1.relations)(exports.transferLogs, ({ one }) => ({
    config: one(exports.botConfigs, {
        fields: [exports.transferLogs.configId],
        references: [exports.botConfigs.id],
    }),
}));
// === SCHEMAS ===
exports.insertBotConfigSchema = (0, drizzle_zod_1.createInsertSchema)(exports.botConfigs).omit({
    id: true,
    userId: true,
    lastActive: true,
    sessionString: true // We don't set this directly via API usually, but via login flow
});
exports.insertTransferLogSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transferLogs).omit({
    id: true,
    transferredAt: true
});
