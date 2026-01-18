"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBotStatus = useBotStatus;
exports.useLogs = useLogs;
exports.useBotLogin = useBotLogin;
exports.useVerifyCode = useVerifyCode;
exports.useVerifyPassword = useVerifyPassword;
exports.useUpdateSettings = useUpdateSettings;
exports.useStartBot = useStartBot;
exports.useStopBot = useStopBot;
const react_query_1 = require("@tanstack/react-query");
const routes_1 = require("@shared/routes");
const use_toast_1 = require("@/hooks/use-toast");
// Parse helper
function parseResponse(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        console.error("[Zod] Validation failed:", result.error);
        throw new Error("Invalid API response");
    }
    return result.data;
}
// === QUERIES ===
function useBotStatus() {
    return (0, react_query_1.useQuery)({
        queryKey: [routes_1.api.bot.getStatus.path],
        queryFn: async () => {
            const res = await fetch(routes_1.api.bot.getStatus.path, { credentials: "include" });
            if (res.status === 401)
                throw new Error("Unauthorized");
            if (!res.ok)
                throw new Error("Failed to fetch status");
            return parseResponse(routes_1.api.bot.getStatus.responses[200], await res.json());
        },
        refetchInterval: 5000, // Poll every 5s for status updates
    });
}
function useLogs() {
    return (0, react_query_1.useQuery)({
        queryKey: [routes_1.api.logs.list.path],
        queryFn: async () => {
            const res = await fetch(routes_1.api.logs.list.path, { credentials: "include" });
            if (res.status === 401)
                throw new Error("Unauthorized");
            if (!res.ok)
                throw new Error("Failed to fetch logs");
            return parseResponse(routes_1.api.logs.list.responses[200], await res.json());
        },
        refetchInterval: 10000, // Refresh logs every 10s
    });
}
// === MUTATIONS ===
function useBotLogin() {
    return (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await fetch(routes_1.api.bot.login.path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Login failed");
            }
            return await res.json();
        },
    });
}
function useVerifyCode() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await fetch(routes_1.api.bot.verifyCode.path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Verification failed");
            }
            return await res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [routes_1.api.bot.getStatus.path] }),
    });
}
function useVerifyPassword() {
    const queryClient = (0, react_query_1.useQueryClient)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await fetch(routes_1.api.bot.verifyPassword.path, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Password verification failed");
            }
            return await res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: [routes_1.api.bot.getStatus.path] }),
    });
}
function useUpdateSettings() {
    const queryClient = (0, react_query_1.useQueryClient)();
    const { toast } = (0, use_toast_1.useToast)();
    return (0, react_query_1.useMutation)({
        mutationFn: async (data) => {
            const res = await fetch(routes_1.api.bot.updateSettings.path, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Update failed");
            }
            return parseResponse(routes_1.api.bot.updateSettings.responses[200], await res.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [routes_1.api.bot.getStatus.path] });
            toast({ title: "Settings Updated", description: "Your bot configuration has been saved." });
        },
        onError: (err) => {
            toast({ title: "Update Failed", description: err.message, variant: "destructive" });
        }
    });
}
function useStartBot() {
    const queryClient = (0, react_query_1.useQueryClient)();
    const { toast } = (0, use_toast_1.useToast)();
    return (0, react_query_1.useMutation)({
        mutationFn: async () => {
            const res = await fetch(routes_1.api.bot.start.path, { method: "POST", credentials: "include" });
            if (!res.ok)
                throw new Error("Failed to start bot");
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [routes_1.api.bot.getStatus.path] });
            toast({ title: "Bot Started", description: "The userbot is now running." });
        },
        onError: () => {
            toast({ title: "Error", description: "Could not start the bot.", variant: "destructive" });
        }
    });
}
function useStopBot() {
    const queryClient = (0, react_query_1.useQueryClient)();
    const { toast } = (0, use_toast_1.useToast)();
    return (0, react_query_1.useMutation)({
        mutationFn: async () => {
            const res = await fetch(routes_1.api.bot.stop.path, { method: "POST", credentials: "include" });
            if (!res.ok)
                throw new Error("Failed to stop bot");
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [routes_1.api.bot.getStatus.path] });
            toast({ title: "Bot Stopped", description: "The userbot has been stopped." });
        },
    });
}
