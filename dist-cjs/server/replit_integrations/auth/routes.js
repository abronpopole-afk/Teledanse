"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuthRoutes = registerAuthRoutes;
const storage_1 = require("./storage");
const replitAuth_1 = require("./replitAuth");
// Register auth-specific routes
function registerAuthRoutes(app) {
    // Get current authenticated user
    app.get("/api/auth/user", replitAuth_1.isAuthenticated, async (req, res) => {
        try {
            const userId = req.user.claims.sub;
            const user = await storage_1.authStorage.getUser(userId);
            res.json(user);
        }
        catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ message: "Failed to fetch user" });
        }
    });
}
