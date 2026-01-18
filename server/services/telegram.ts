import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { NewMessage } from "telegram/events";
import { storage } from "../storage";
import { BotConfig } from "@shared/schema";
import fs from "fs";
import path from "path";

// A global map to hold active clients in memory.
// Key: userId, Value: TelegramClient
const clients: Map<string, TelegramClient> = new Map();

export class TelegramService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getClient(config?: BotConfig): Promise<TelegramClient> {
    if (clients.has(this.userId)) {
      const client = clients.get(this.userId)!;
      if (client.connected) return client;
    }

    if (!config) {
      config = (await storage.getBotConfig(this.userId))!;
    }
    
    if (!config) {
      throw new Error("No configuration found for user");
    }

    const session = new StringSession(config.sessionString || "");
    const client = new TelegramClient(session, config.apiId, config.apiHash, {
      connectionRetries: 5,
    });
    
    clients.set(this.userId, client);
    return client;
  }

  async start(): Promise<void> {
    const config = await storage.getBotConfig(this.userId);
    if (!config || !config.sessionString) {
      throw new Error("Bot not configured or authenticated");
    }

    const client = await this.getClient(config);
    await client.connect();
    
    // Register event handler
    client.removeEventHandler(undefined, new NewMessage({})); // Clear existing
    
    // Ensure we listen to the source bot
    client.addEventHandler(async (event: any) => {
      await this.handleNewMessage(event, config);
    }, new NewMessage({ fromUsers: [config.sourceBotUsername] })); // Filter by source bot

    await storage.updateBotConfigActive(this.userId, true);
    console.log(`Bot started for user ${this.userId}`);
  }

  async stop(): Promise<void> {
    const client = clients.get(this.userId);
    if (client) {
      await client.disconnect();
      clients.delete(this.userId);
    }
    await storage.updateBotConfigActive(this.userId, false);
    console.log(`Bot stopped for user ${this.userId}`);
  }

  // --- Auth Flow ---

  async sendCode(apiId: number, apiHash: string, phoneNumber: string): Promise<string> {
    // Save config first (incomplete, without session)
    // We need apiId/Hash stored to recreate client next step
    // But we don't have a session string yet.
    
    const session = new StringSession("");
    const client = new TelegramClient(session, apiId, apiHash, {
      connectionRetries: 5,
    });
    
    await client.connect();
    
    try {
        const result = await client.sendCode({
            apiId,
            apiHash,
            phoneNumber,
        }, false); // Force SMS if needed or just handle regular flow
        
        // Save temporary client or params? 
        // We need to keep the client instance connected to verify code
        clients.set(this.userId, client);
        
        // Save partial config to DB so we can resume/update later
        // We'll update the session string after full login
        await storage.upsertBotConfig({
            userId: this.userId,
            apiId,
            apiHash,
            phoneNumber,
            sourceBotUsername: "", // placeholders
            targetChannelId: "",
            isActive: false,
        });

        return result.phoneCodeHash;
    } catch (e) {
        console.error("Send code error:", e);
        throw e;
    }
  }

  async signIn(phoneNumber: string, phoneCodeHash: string, code: string): Promise<void> {
    let client = clients.get(this.userId);
    if (!client) {
        // Recover from DB if server restarted? 
        // For the login flow to work, we usually need the same client instance or at least same session context.
        // If client is missing, we might fail. 
        // Re-creating client might work if we had the hash, but sendCode initiated a session.
        const config = await storage.getBotConfig(this.userId);
        if (config) {
             const session = new StringSession("");
             client = new TelegramClient(session, config.apiId, config.apiHash, {});
             await client.connect();
             clients.set(this.userId, client);
        } else {
             throw new Error("Session expired or client not found. Please try logging in again.");
        }
    }

    try {
        await client.invoke(
            new (client as any).api.auth.SignIn({
                phoneNumber,
                phoneCodeHash,
                phoneCode: code,
            })
        );
        
        // Save session
        const sessionString = (client.session as StringSession).save();
        await storage.updateBotConfigSession(this.userId, sessionString);
        
    } catch (e: any) {
        if (e.errorMessage === "SESSION_PASSWORD_NEEDED") {
            throw new Error("PASSWORD_NEEDED");
        }
        throw e;
    }
  }

  async signInPassword(password: string): Promise<void> {
      const client = clients.get(this.userId);
      if (!client) throw new Error("Client not found");

      await client.signInWithPassword({
          password: password,
          onError: (err) => { throw err; },
      } as any);

      const sessionString = (client.session as StringSession).save();
      await storage.updateBotConfigSession(this.userId, sessionString);
  }


  // --- Message Handling ---

  private async handleNewMessage(event: any, config: BotConfig) {
    const message = event.message;
    
    if (!message.media || message.media.className !== 'MessageMediaDocument') {
        return;
    }

    const document = message.media.document;
    if (document.mimeType !== "application/pdf") {
        return;
    }
    
    // It's a PDF!
    const fileName = document.attributes.find((a: any) => a.className === 'DocumentAttributeFilename')?.fileName || "unknown.pdf";
    console.log(`[+] PDF Detected: ${fileName}`);

    try {
        // Forward or Send File?
        // User asked to "transfer automatically"
        // Downloading and Re-uploading is safer to strip forward tags if desired, 
        // or just forward. The prompt says: "transfert automatiquement le PDF... logguer chaque transfert".
        // Code sample showed: download -> send_file -> remove.
        
        const buffer = await event.message.downloadMedia();
        
        // Target channel can be username or ID.
        // If it starts with @, it's username.
        await clients.get(this.userId)?.sendFile(config.targetChannelId, {
            file: buffer,
            caption: `PDF transféré automatiquement : ${fileName}`
        });

        await storage.createTransferLog({
            configId: config.id,
            fileName: fileName,
            status: "success",
            message: "Transferred successfully"
        });
        
    } catch (e: any) {
        console.error("Transfer failed", e);
        await storage.createTransferLog({
            configId: config.id,
            fileName: fileName,
            status: "failed",
            message: e.message || String(e)
        });
    }
  }
}
