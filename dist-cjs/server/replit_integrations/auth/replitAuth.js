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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
exports.getSession = getSession;
exports.setupAuth = setupAuth;
const client = __importStar(require("openid-client"));
const express_session_1 = __importDefault(require("express-session"));
const memoizee_1 = __importDefault(require("memoizee"));
const getOidcConfig = (0, memoizee_1.default)(async () => {
    var _a;
    return await client.discovery(new URL((_a = process.env.ISSUER_URL) !== null && _a !== void 0 ? _a : "https://replit.com/oidc"), process.env.REPL_ID);
}, { maxAge: 3600 * 1000 });
function getSession() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    return (0, express_session_1.default)({
        secret: process.env.SESSION_SECRET || "default_secret",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // Set to true if using HTTPS
            maxAge: sessionTtl,
        },
    });
}
async function setupAuth(app) {
    app.set("trust proxy", 1);
    app.use(getSession());
    // No passport initialization or session needed for a simple "no-auth" setup
}
const isAuthenticated = async (req, res, next) => {
    // Mock authentication: always provide a default user if not present
    if (!req.user) {
        req.user = {
            claims: {
                sub: "default-user-id"
            }
        };
    }
    return next();
};
exports.isAuthenticated = isAuthenticated;
