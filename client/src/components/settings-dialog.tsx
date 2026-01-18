import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateSettings } from "@/hooks/use-bot";
import type { BotConfig } from "@shared/schema";

const settingsSchema = z.object({
  sourceBotUsername: z.string().min(2, "Username is required").regex(/^@/, "Must start with @"),
  targetChannelId: z.string().min(2, "Channel ID/Username is required"),
});

interface SettingsDialogProps {
  config: BotConfig | null;
}

export function SettingsDialog({ config }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const updateSettings = useUpdateSettings();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      sourceBotUsername: config?.sourceBotUsername || "",
      targetChannelId: config?.targetChannelId || "",
    }
  });

  // Reset form when config loads
  useEffect(() => {
    if (config) {
      form.reset({
        sourceBotUsername: config.sourceBotUsername,
        targetChannelId: config.targetChannelId,
      });
    }
  }, [config, form]);

  const onSubmit = (data: z.infer<typeof settingsSchema>) => {
    updateSettings.mutate(data, {
      onSuccess: () => setOpen(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5">
          <Settings2 className="w-4 h-4" />
          Configure
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Bot Configuration</DialogTitle>
          <DialogDescription>
            Set the source bot to listen to and the target channel to forward files to.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="sourceBotUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Bot Username</FormLabel>
                  <FormControl>
                    <Input placeholder="@pdfbot" {...field} className="bg-background/50 border-white/10" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">The bot you want to download files from.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetChannelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Channel</FormLabel>
                  <FormControl>
                    <Input placeholder="@my_archive_channel" {...field} className="bg-background/50 border-white/10" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">The channel/chat where files will be forwarded.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
