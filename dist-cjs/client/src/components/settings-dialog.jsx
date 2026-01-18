"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsDialog = SettingsDialog;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const lucide_react_1 = require("lucide-react");
const dialog_1 = require("@/components/ui/dialog");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const form_1 = require("@/components/ui/form");
const use_bot_1 = require("@/hooks/use-bot");
const settingsSchema = zod_2.z.object({
    sourceBotUsername: zod_2.z.string().min(2, "Username is required").regex(/^@/, "Must start with @"),
    targetChannelId: zod_2.z.string().min(2, "Channel ID/Username is required"),
});
function SettingsDialog({ config }) {
    const [open, setOpen] = (0, react_1.useState)(false);
    const updateSettings = (0, use_bot_1.useUpdateSettings)();
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(settingsSchema),
        defaultValues: {
            sourceBotUsername: (config === null || config === void 0 ? void 0 : config.sourceBotUsername) || "",
            targetChannelId: (config === null || config === void 0 ? void 0 : config.targetChannelId) || "",
        }
    });
    // Reset form when config loads
    (0, react_1.useEffect)(() => {
        if (config) {
            form.reset({
                sourceBotUsername: config.sourceBotUsername,
                targetChannelId: config.targetChannelId,
            });
        }
    }, [config, form]);
    const onSubmit = (data) => {
        updateSettings.mutate(data, {
            onSuccess: () => setOpen(false)
        });
    };
    return (<dialog_1.Dialog open={open} onOpenChange={setOpen}>
      <dialog_1.DialogTrigger asChild>
        <button_1.Button variant="outline" size="sm" className="gap-2 border-white/10 hover:bg-white/5">
          <lucide_react_1.Settings2 className="w-4 h-4"/>
          Configurer
        </button_1.Button>
      </dialog_1.DialogTrigger>
      <dialog_1.DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10 text-white">
        <dialog_1.DialogHeader>
          <dialog_1.DialogTitle>Configuration du Bot</dialog_1.DialogTitle>
          <dialog_1.DialogDescription>
            Définissez le bot source à écouter et le canal cible pour transférer les fichiers.
          </dialog_1.DialogDescription>
        </dialog_1.DialogHeader>

        <form_1.Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <form_1.FormField control={form.control} name="sourceBotUsername" render={({ field }) => (<form_1.FormItem>
                  <form_1.FormLabel>Nom d'utilisateur du Bot Source</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input placeholder="@pdfbot" {...field} className="bg-background/50 border-white/10"/>
                  </form_1.FormControl>
                  <p className="text-xs text-muted-foreground">Le bot dont vous souhaitez télécharger les fichiers.</p>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>
            
            <form_1.FormField control={form.control} name="targetChannelId" render={({ field }) => (<form_1.FormItem>
                  <form_1.FormLabel>Canal de Destination</form_1.FormLabel>
                  <form_1.FormControl>
                    <input_1.Input placeholder="@mon_canal_archive" {...field} className="bg-background/50 border-white/10"/>
                  </form_1.FormControl>
                  <p className="text-xs text-muted-foreground">Le canal ou chat où les fichiers seront transférés.</p>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>

            <div className="flex justify-end gap-3">
              <button_1.Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annuler</button_1.Button>
              <button_1.Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2" disabled={updateSettings.isPending}>
                {updateSettings.isPending ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin"/> : <lucide_react_1.Save className="w-4 h-4"/>}
                Enregistrer
              </button_1.Button>
            </div>
          </form>
        </form_1.Form>
      </dialog_1.DialogContent>
    </dialog_1.Dialog>);
}
