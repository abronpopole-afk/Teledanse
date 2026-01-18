import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type BotStatusResponse, type LoginRequest, type VerifyCodeRequest, type VerifyPasswordRequest, type UpdateConfigSettingsRequest, type TransferLog } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Parse helper
function parseResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error("[Zod] Validation failed:", result.error);
    throw new Error("Invalid API response");
  }
  return result.data;
}

// === QUERIES ===

export function useBotStatus() {
  return useQuery({
    queryKey: [api.bot.getStatus.path],
    queryFn: async () => {
      const res = await fetch(api.bot.getStatus.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch status");
      return parseResponse(api.bot.getStatus.responses[200], await res.json());
    },
    refetchInterval: 5000, // Poll every 5s for status updates
  });
}

export function useLogs() {
  return useQuery({
    queryKey: [api.logs.list.path],
    queryFn: async () => {
      const res = await fetch(api.logs.list.path, { credentials: "include" });
      if (res.status === 401) throw new Error("Unauthorized");
      if (!res.ok) throw new Error("Failed to fetch logs");
      return parseResponse(api.logs.list.responses[200], await res.json());
    },
    refetchInterval: 10000, // Refresh logs every 10s
  });
}

// === MUTATIONS ===

export function useBotLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await fetch(api.bot.login.path, {
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

export function useVerifyCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: VerifyCodeRequest) => {
      const res = await fetch(api.bot.verifyCode.path, {
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.bot.getStatus.path] }),
  });
}

export function useVerifyPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: VerifyPasswordRequest) => {
      const res = await fetch(api.bot.verifyPassword.path, {
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.bot.getStatus.path] }),
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: UpdateConfigSettingsRequest) => {
      const res = await fetch(api.bot.updateSettings.path, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Update failed");
      }
      return parseResponse(api.bot.updateSettings.responses[200], await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bot.getStatus.path] });
      toast({ title: "Settings Updated", description: "Your bot configuration has been saved." });
    },
    onError: (err) => {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    }
  });
}

export function useStartBot() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.bot.start.path, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to start bot");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bot.getStatus.path] });
      toast({ title: "Bot Started", description: "The userbot is now running." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not start the bot.", variant: "destructive" });
    }
  });
}

export function useStopBot() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.bot.stop.path, { method: "POST", credentials: "include" });
      if (!res.ok) throw new Error("Failed to stop bot");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.bot.getStatus.path] });
      toast({ title: "Bot Stopped", description: "The userbot has been stopped." });
    },
  });
}
