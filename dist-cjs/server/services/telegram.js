"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const telegram_1 = require("telegram");
const sessions_1 = require("telegram/sessions");
const events_1 = require("telegram/events");
const storage_1 = require("../storage");
// A global map to hold active clients in memory.
// Key: userId, Value: TelegramClient
const clients = new Map();
class TelegramService {
    constructor(userId) {
        this.userId = userId;
    }
    async getClient(config) {
        if (clients.has(this.userId)) {
            const client = clients.get(this.userId);
            if (client.connected)
                return client;
        }
        if (!config) {
            config = (await storage_1.storage.getBotConfig(this.userId));
        }
        if (!config) {
            throw new Error("No configuration found for user");
        }
        const session = new sessions_1.StringSession(config.sessionString || "");
        const client = new telegram_1.TelegramClient(session, config.apiId, config.apiHash, {
            connectionRetries: 5,
        });
        clients.set(this.userId, client);
        return client;
    }
    async start() {
        const config = await storage_1.storage.getBotConfig(this.userId);
        if (!config || !config.sessionString) {
            throw new Error("Bot not configured or authenticated");
        }
        const client = await this.getClient(config);
        await client.connect();
        // Register event handler
        client.removeEventHandler(undefined, new events_1.NewMessage({})); // Clear existing
        // Ensure we listen to the source bot
        client.addEventHandler(async (event) => {
            await this.handleNewMessage(event, config);
        }, new events_1.NewMessage({ fromUsers: [config.sourceBotUsername] })); // Filter by source bot
        await storage_1.storage.updateBotConfigActive(this.userId, true);
        console.log(`Bot started for user ${this.userId}`);
    }
    async stop() {
        const client = clients.get(this.userId);
        if (client) {
            await client.disconnect();
            clients.delete(this.userId);
        }
        await storage_1.storage.updateBotConfigActive(this.userId, false);
        console.log(`Bot stopped for user ${this.userId}`);
    }
    // --- Auth Flow ---
    async sendCode(apiId, apiHash, phoneNumber) {
        const session = new sessions_1.StringSession("");
        const client = new telegram_1.TelegramClient(session, apiId, apiHash, {
            connectionRetries: 5,
        });
        await client.connect();
        try {
            console.log("Calling client.sendCode with:", {
                phoneNumber,
                apiId,
                apiHash
            });
            // Use the simplified signature for sendCode
            const result = await client.sendCode({
                apiId,
                apiHash,
            }, phoneNumber);
            console.log("sendCode result:", result);
            clients.set(this.userId, client);
            await storage_1.storage.upsertBotConfig({
                userId: this.userId,
                apiId,
                apiHash,
                phoneNumber,
                sourceBotUsername: "",
                targetChannelId: "",
                isActive: false,
            });
            return result.phoneCodeHash;
        }
        catch (e) {
            console.error("Send code error:", e);
            throw e;
        }
    }
    async signIn(phoneNumber, phoneCodeHash, code) {
        let client = clients.get(this.userId);
        if (!client) {
            const config = await storage_1.storage.getBotConfig(this.userId);
            if (config) {
                const session = new sessions_1.StringSession("");
                client = new telegram_1.TelegramClient(session, config.apiId, config.apiHash, {});
                await client.connect();
                clients.set(this.userId, client);
            }
            else {
                throw new Error("Session expired or client not found. Please try logging in again.");
            }
        }
        try {
            // Sign in using the MTProto method
            await client.invoke(new telegram_1.Api.auth.SignIn({
                phoneNumber,
                phoneCodeHash,
                phoneCode: code,
            }));
            const sessionString = client.session.save();
            await storage_1.storage.updateBotConfigSession(this.userId, sessionString);
        }
        catch (e) {
            if (e.errorMessage === "SESSION_PASSWORD_NEEDED") {
                throw new Error("PASSWORD_NEEDED");
            }
            throw e;
        }
    }
    async signInPassword(password) {
        const client = clients.get(this.userId);
        if (!client)
            throw new Error("Client not found");
        await client.signInWithPassword({
            password: password,
            onError: (err) => { throw err; },
        });
        const sessionString = client.session.save();
        await storage_1.storage.updateBotConfigSession(this.userId, sessionString);
    }
    // --- Message Handling ---
    async handleNewMessage(event, config) {
        var _a, _b;
        const message = event.message;
        if (!message.media || message.media.className !== 'MessageMediaDocument') {
            return;
        }
        const document = message.media.document;
        if (document.mimeType !== "application/pdf") {
            return;
        }
        // It's a PDF!
        const fileName = ((_a = document.attributes.find((a) => a.className === 'DocumentAttributeFilename')) === null || _a === void 0 ? void 0 : _a.fileName) || "unknown.pdf";
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
            await ((_b = clients.get(this.userId)) === null || _b === void 0 ? void 0 : _b.sendFile(config.targetChannelId, {
                file: buffer,
                caption: `PDF transféré automatiquement : ${fileName}`
            }));
            await storage_1.storage.createTransferLog({
                configId: config.id,
                fileName: fileName,
                status: "success",
                message: "Transferred successfully"
            });
        }
        catch (e) {
            console.error("Transfer failed", e);
            await storage_1.storage.createTransferLog({
                configId: config.id,
                fileName: fileName,
                status: "failed",
                message: e.message || String(e)
            });
        }
    }
}
exports.TelegramService = TelegramService;
