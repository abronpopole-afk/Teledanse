import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { 
  botConfigs, transferLogs, 
  type BotConfig, type InsertBotConfig,
  type TransferLog, type InsertTransferLog
} from "@shared/schema";
import { authStorage, type IAuthStorage } from "./replit_integrations/auth/storage";

export interface IStorage extends IAuthStorage {
  // Bot Config
  getBotConfig(userId: string): Promise<BotConfig | undefined>;
  upsertBotConfig(config: InsertBotConfig & { userId: string }): Promise<BotConfig>;
  updateBotConfigSession(userId: string, sessionString: string): Promise<BotConfig>;
  updateBotConfigActive(userId: string, isActive: boolean): Promise<BotConfig>;
  
  // Logs
  createTransferLog(log: InsertTransferLog): Promise<TransferLog>;
  getTransferLogs(userId: string): Promise<TransferLog[]>;
}

export class DatabaseStorage implements IStorage {
  // --- Auth Storage Delegate ---
  async getUser(id: string) {
    return authStorage.getUser(id);
  }
  async upsertUser(user: any) {
    return authStorage.upsertUser(user);
  }

  // --- Bot Config ---
  async getBotConfig(userId: string): Promise<BotConfig | undefined> {
    const [config] = await db.select().from(botConfigs).where(eq(botConfigs.userId, userId));
    return config;
  }

  async upsertBotConfig(config: InsertBotConfig & { userId: string }): Promise<BotConfig> {
    // Check if exists
    const existing = await this.getBotConfig(config.userId);
    
    if (existing) {
      const [updated] = await db.update(botConfigs)
        .set({ ...config, lastActive: new Date() })
        .where(eq(botConfigs.userId, config.userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(botConfigs)
        .values({ ...config, isActive: false })
        .returning();
      return created;
    }
  }

  async updateBotConfigSession(userId: string, sessionString: string): Promise<BotConfig> {
    const [updated] = await db.update(botConfigs)
      .set({ sessionString })
      .where(eq(botConfigs.userId, userId))
      .returning();
    return updated;
  }

  async updateBotConfigActive(userId: string, isActive: boolean): Promise<BotConfig> {
    const [updated] = await db.update(botConfigs)
      .set({ isActive, lastActive: new Date() })
      .where(eq(botConfigs.userId, userId))
      .returning();
    return updated;
  }

  // --- Logs ---
  async createTransferLog(log: InsertTransferLog): Promise<TransferLog> {
    const [created] = await db.insert(transferLogs).values(log).returning();
    return created;
  }

  async getTransferLogs(userId: string): Promise<TransferLog[]> {
    // Join logs with config to filter by user
    // Simple approach: get config id first
    const config = await this.getBotConfig(userId);
    if (!config) return [];

    return await db.select()
      .from(transferLogs)
      .where(eq(transferLogs.configId, config.id))
      .orderBy(desc(transferLogs.transferredAt));
  }
}

export const storage = new DatabaseStorage();
