import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { registerAuthRoutes } from "./replit_integrations/auth";
import { setupAuth, isAuthenticated } from "./replit_integrations/auth";
import { TelegramService } from "./services/telegram";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Helper to get service for user
  const getTelegramService = (userId: string) => new TelegramService(userId);

  // === BOT STATUS ===
  app.get(api.bot.getStatus.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const config = await storage.getBotConfig(userId);
    
    let status = "requires_auth";
    if (config?.sessionString) {
      status = config.isActive ? "running" : "stopped";
    } else if (config) {
        status = "authenticating"; // Has config but no session? maybe in middle of login
    }

    res.json({ status, config });
  });

  // === LOGIN FLOW ===
  app.post(api.bot.login.path, isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    try {
        const input = api.bot.login.input.parse(req.body);
        const service = getTelegramService(userId);
        
        const phoneCodeHash = await service.sendCode(input.apiId, input.apiHash, input.phoneNumber);
        
        // We need to store phoneCodeHash temporarily? 
        // Actually, GramJS sendCode returns it. We need to pass it back to frontend 
        // OR store it in DB. Let's send it back in a cookie or just response? 
        // The API response schema is just { message }.
        // Let's store it in the session or DB? 
        // For simplicity, let's assume the frontend keeps it? No, security.
        // Let's store it in `botConfigs` temporarily? Or just return it if we change schema.
        // Re-reading my schema: `VerifyCodeRequest` has `phoneCodeHash`.
        // So I should return it.
        // I need to update `api.bot.login.responses` to include `phoneCodeHash`?
        // Or store it in DB. DB doesn't have a field for it.
        // I'll update the schema to return it, OR just rely on client to hold it (it's public hash anyway).
        // Wait, I defined `responses: { 200: z.object({ message: z.string() }) }`.
        // I should stick to that and maybe store hash in session? 
        // Actually, `req.session` is available.
        (req.session as any).phoneCodeHash = phoneCodeHash;
        (req.session as any).phoneNumber = input.phoneNumber;

        res.json({ message: "Code sent" });
    } catch (e: any) {
        res.status(400).json({ message: e.message || "Failed to send code" });
    }
  });

  app.post(api.bot.verifyCode.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      try {
          const input = api.bot.verifyCode.input.parse(req.body);
          const service = getTelegramService(userId);
          
          const phoneCodeHash = (req.session as any).phoneCodeHash;
          const phoneNumber = (req.session as any).phoneNumber;

          if (!phoneCodeHash || !phoneNumber) {
              return res.status(400).json({ message: "Session expired, please login again" });
          }

          await service.signIn(phoneNumber, phoneCodeHash, input.code);
          res.json({ message: "Authenticated successfully", success: true });
      } catch (e: any) {
          if (e.message === "PASSWORD_NEEDED") {
               return res.status(200).json({ message: "2FA Password Required", success: false }); 
               // success: false implies next step needed? Or I should use a different status/code.
               // Schema says: { message, success }.
          }
          res.status(400).json({ message: e.message || "Verification failed" });
      }
  });

  app.post(api.bot.verifyPassword.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      try {
          const input = api.bot.verifyPassword.input.parse(req.body);
          const service = getTelegramService(userId);
          
          await service.signInPassword(input.password);
          res.json({ message: "Authenticated successfully", success: true });
      } catch (e: any) {
          res.status(400).json({ message: e.message || "Password failed" });
      }
  });

  // === SETTINGS ===
  app.patch(api.bot.updateSettings.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      try {
          const input = api.bot.updateSettings.input.parse(req.body);
          const config = await storage.getBotConfig(userId);
          if (!config) return res.status(404).json({ message: "Config not found" });

          const updated = await storage.upsertBotConfig({
              ...config,
              sourceBotUsername: input.sourceBotUsername,
              targetChannelId: input.targetChannelId
          });
          res.json(updated);
      } catch (e: any) {
          res.status(400).json({ message: e.message });
      }
  });

  // === CONTROL ===
  app.post(api.bot.start.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      try {
          const service = getTelegramService(userId);
          await service.start();
          res.json({ status: "running" });
      } catch (e: any) {
          res.status(400).json({ message: e.message });
      }
  });

  app.post(api.bot.stop.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      try {
          const service = getTelegramService(userId);
          await service.stop();
          res.json({ status: "stopped" });
      } catch (e: any) {
          res.status(500).json({ message: e.message });
      }
  });

  // === LOGS ===
  app.get(api.logs.list.path, isAuthenticated, async (req: any, res) => {
      const userId = req.user.claims.sub;
      const logs = await storage.getTransferLogs(userId);
      res.json(logs);
  });

  return httpServer;
}
