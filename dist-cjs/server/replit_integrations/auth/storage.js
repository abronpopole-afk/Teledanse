"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authStorage = void 0;
const auth_1 = require("@shared/models/auth");
const db_1 = require("../../db");
const drizzle_orm_1 = require("drizzle-orm");
class AuthStorage {
    async getUser(id) {
        const [user] = await db_1.db.select().from(auth_1.users).where((0, drizzle_orm_1.eq)(auth_1.users.id, id));
        return user;
    }
    async upsertUser(userData) {
        const [user] = await db_1.db
            .insert(auth_1.users)
            .values(userData)
            .onConflictDoUpdate({
            target: auth_1.users.id,
            set: {
                ...userData,
                updatedAt: new Date(),
            },
        })
            .returning();
        return user;
    }
    async ensureDefaultUser() {
        const defaultId = "default-user-id";
        const existing = await this.getUser(defaultId);
        if (!existing) {
            await this.upsertUser({
                id: defaultId,
                email: "default@example.com",
                firstName: "Default",
                lastName: "User",
                profileImageUrl: "",
            });
        }
    }
}
exports.authStorage = new AuthStorage();
exports.authStorage.ensureDefaultUser().catch(console.error);
