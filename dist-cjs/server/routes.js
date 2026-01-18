"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
const storage_1 = require("./storage");
const routes_1 = require("@shared/routes");
const auth_1 = require("./replit_integrations/auth");
const auth_2 = require("./replit_integrations/auth");
const telegram_1 = require("./services/telegram");
async function registerRoutes(httpServer, app) {
    // Setup Auth
    await (0, auth_2.setupAuth)(app);
    (0, auth_1.registerAuthRoutes)(app);
    // Helper to get service for user
    const getTelegramService = (userId) => new telegram_1.TelegramService(userId);
    // === BOT STATUS ===
    app.get(routes_1.api.bot.getStatus.path, auth_2.isAuthenticated, async (req, res) => {
        const userId = req.user.claims.sub;
        const config = await storage_1.storage.getBotConfig(userId);
        let status = "requires_auth";
        if (config === null || config === void 0 ? void 0 : config.sessionString) {
            status = config.isActive ? "running" : "stopped";
        }
        else if (config) {
            status = "authenticating"; // Has config but no session? maybe in middle of login
        }
        res.json({ status, config });
    });
    // === LOGIN FLOW ===
    app.post(routes_1.api.bot.login.path, auth_2.isAuthenticated, async (req, res) => {
        const userId = req.user.claims.sub;
        try {
            const input = routes_1.api.bot.login.input.parse(req.body);
            const service = getTelegramService(userId);
            const phoneCodeHash = await service.sendCode(input.apiId, input.apiHash, input.phoneNumber);
            console.log("Saving to session:", { phoneCodeHash, phoneNumber: input.phoneNumber });
            req.session.phoneCodeHash = phoneCodeHash;
            req.session.phoneNumber = input.phoneNumber;
            // Force session save to ensure data is available in the next request
            await new Promise((resolve, reject) => {
                req.session.save((err) => {
                    if (err) {
                        console.error("Session save error:", err);
                        reject(err);
                    }
                    else {
                        console.log("Session saved successfully");
                        resolve(true);
                    }
                });
            });
            res.json({ message: "Code sent" });
        }
        catch (e) {
            console.error("Login route error:", e);
            res.status(400).json({ message: e.message || "Failed to send code" });
        }
    });
    app.post(routes_1.api.bot.verifyCode.path, auth_2.isAuthenticated, async (req, res) => {
        const userId = req.user.claims.sub;
        try {
            const input = routes_1.api.bot.verifyCode.input.parse(req.body);
            const service = getTelegramService(userId);
            console.log("Verifying code. Session content:", {
                phoneCodeHash: req.session.phoneCodeHash,
                phoneNumber: req.session.phoneNumber
            });
            const phoneCodeHash = req.session.phoneCodeHash;
            const phoneNumber = req.session.phoneNumber;
            if (!phoneCodeHash || !phoneNumber) {
                return res.status(400).json({ message: "Session expirée ou données manquantes. Veuillez recommencer la connexion." });
            }
            await service.signIn(phoneNumber, phoneCodeHash, input.code);
            res.json({ message: "Authenticated successfully", success: true });
        }
        catch (e) {
            console.error("Verification error:", e);
            if (e.message === "PASSWORD_NEEDED") {
                return res.status(200).json({ message: "2FA Password Required", success: false });
            }
            res.status(400).json({ message: e.message || "La vérification a échoué" });
        }
    });
    app.post(routes_1.api.bot.verifyPassword.path, auth_2.isAuthenticated, async (req, res) => {
        const userId = req.user.claims.sub;
        try {
            const input = routes_1.api.bot.verifyPassword.input.parse(req.body);
            const service = getTelegramService(userId);
            await service.signInPassword(input.password);
            res.json({ message: "Authenticated successfully", success: true });
        }
        catch (e) {
            res.status(400).json({ message: e.message || "Password failed" });
        }
    });
    // === SETTINGS ===
    app.patch(routes_1.api.bot.updateSettings.path, auth_2.isAuthenticated, async (req, res) => {
        const userId = req.user.claims.sub;
        try {
            const input = routes_1.api.bot.updateSettings.input.parse(req.body);
            const config = await storage_1.storage.getBotConfig(userId);
            if (!config)
                return res.status(404).json({ message: "Config not found" });
            const updated = await storage_1.storage.upsertBotConfig({
                ...config,
                sourceBotUsername: input.sourceBotUsername,
                targetChannelId: input.targetChannelId
            });
            res.json(updated);
        }
        catch (e) {
            res.status(400).json({ message: e.message });
        }
    });
    // === CONTROL ===
    app.post(routes_1.api.bot.start.path, auth_2.isAuthenticated, async (req, res) => {
        const userId = req.user.claims.sub;
        try {
            const service = getTelegramService(userId);
            await service.start();
            res.json({ status: "running" });
        }
        catch (e) {
            res.status(400).json({ message: e.message });
        }
    });
    app.post(routes_1.api.bot.stop.path, auth_2.isAuthenticated, async (req, res) => {
        const userId = req.user.claims.sub;
        try {
            const service = getTelegramService(userId);
            await service.stop();
            res.json({ status: "stopped" });
        }
        catch (e) {
            res.status(500).json({ message: e.message });
        }
    });
    // === LOGS ===
    app.get(routes_1.api.logs.list.path, auth_2.isAuthenticated, async (req, res) => {
        const userId = req.user.claims.sub;
        const logs = await storage_1.storage.getTransferLogs(userId);
        res.json(logs);
    });
    return httpServer;
}
