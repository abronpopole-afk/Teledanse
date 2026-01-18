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
          Configurer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle>Configuration du Bot</DialogTitle>
          <DialogDescription>
            Définissez le bot source à écouter et le canal cible pour transférer les fichiers.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="sourceBotUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d'utilisateur du Bot Source</FormLabel>
                  <FormControl>
                    <Input placeholder="@pdfbot" {...field} className="bg-background/50 border-white/10" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Le bot dont vous souhaitez télécharger les fichiers.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="targetChannelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canal de Destination</FormLabel>
                  <FormControl>
                    <Input placeholder="@mon_canal_archive" {...field} className="bg-background/50 border-white/10" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">Le canal ou chat où les fichiers seront transférés.</p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                disabled={updateSettings.isPending}
              >
                {updateSettings.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Enregistrer
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
