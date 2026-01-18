"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("@shared/schema");
const storage_1 = require("./replit_integrations/auth/storage");
class DatabaseStorage {
    // --- Auth Storage Delegate ---
    async getUser(id) {
        return storage_1.authStorage.getUser(id);
    }
    async upsertUser(user) {
        return storage_1.authStorage.upsertUser(user);
    }
    // --- Bot Config ---
    async getBotConfig(userId) {
        const [config] = await db_1.db.select().from(schema_1.botConfigs).where((0, drizzle_orm_1.eq)(schema_1.botConfigs.userId, userId));
        return config;
    }
    async upsertBotConfig(config) {
        // Check if exists
        const existing = await this.getBotConfig(config.userId);
        if (existing) {
            const [updated] = await db_1.db.update(schema_1.botConfigs)
                .set({ ...config, lastActive: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.botConfigs.userId, config.userId))
                .returning();
            return updated;
        }
        else {
            const [created] = await db_1.db.insert(schema_1.botConfigs)
                .values({ ...config, isActive: false })
                .returning();
            return created;
        }
    }
    async updateBotConfigSession(userId, sessionString) {
        const [updated] = await db_1.db.update(schema_1.botConfigs)
            .set({ sessionString })
            .where((0, drizzle_orm_1.eq)(schema_1.botConfigs.userId, userId))
            .returning();
        return updated;
    }
    async updateBotConfigActive(userId, isActive) {
        const [updated] = await db_1.db.update(schema_1.botConfigs)
            .set({ isActive, lastActive: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.botConfigs.userId, userId))
            .returning();
        return updated;
    }
    // --- Logs ---
    async createTransferLog(log) {
        const [created] = await db_1.db.insert(schema_1.transferLogs).values(log).returning();
        return created;
    }
    async getTransferLogs(userId) {
        // Join logs with config to filter by user
        // Simple approach: get config id first
        const config = await this.getBotConfig(userId);
        if (!config)
            return [];
        return await db_1.db.select()
            .from(schema_1.transferLogs)
            .where((0, drizzle_orm_1.eq)(schema_1.transferLogs.configId, config.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.transferLogs.transferredAt));
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
