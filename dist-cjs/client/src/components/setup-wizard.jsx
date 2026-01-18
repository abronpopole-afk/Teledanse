"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupWizard = SetupWizard;
const react_1 = require("react");
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const zod_2 = require("zod");
const framer_motion_1 = require("framer-motion");
const lucide_react_1 = require("lucide-react");
const use_bot_1 = require("@/hooks/use-bot");
const input_1 = require("@/components/ui/input");
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const form_1 = require("@/components/ui/form");
const use_toast_1 = require("@/hooks/use-toast");
// Schemas
const step1Schema = zod_2.z.object({
    apiId: zod_2.z.coerce.number().min(1, "API ID is required"),
    apiHash: zod_2.z.string().min(1, "API Hash is required"),
    phoneNumber: zod_2.z.string().min(5, "Phone number is required"),
});
const step2Schema = zod_2.z.object({
    code: zod_2.z.string().min(1, "Verification code is required"),
});
const step3Schema = zod_2.z.object({
    password: zod_2.z.string().min(1, "Password is required"),
});
function SetupWizard() {
    const [step, setStep] = (0, react_1.useState)(1);
    const { toast } = (0, use_toast_1.useToast)();
    const loginMutation = (0, use_bot_1.useBotLogin)();
    const verifyCodeMutation = (0, use_bot_1.useVerifyCode)();
    const verifyPasswordMutation = (0, use_bot_1.useVerifyPassword)();
    // Forms
    const form1 = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(step1Schema),
        defaultValues: { apiId: 0, apiHash: "", phoneNumber: "" }
    });
    const form2 = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(step2Schema),
        defaultValues: { code: "" }
    });
    const form3 = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(step3Schema),
        defaultValues: { password: "" }
    });
    // Handlers
    const onStep1Submit = (data) => {
        loginMutation.mutate(data, {
            onSuccess: () => {
                toast({ title: "Code Envoyé", description: "Vérifiez votre application Telegram pour le code." });
                setStep(2);
            },
            onError: (err) => {
                toast({ title: "Échec de la connexion", description: err.message, variant: "destructive" });
            }
        });
    };
    const onStep2Submit = (data) => {
        verifyCodeMutation.mutate(data, {
            onSuccess: (res) => {
                if (res.success) {
                    toast({ title: "Authentifié !", description: "Bot connecté avec succès." });
                }
                else {
                    // If success is false but no error, likely needs password
                    setStep(3);
                }
            },
            onError: (err) => {
                if (err.message.includes("password")) {
                    setStep(3);
                }
                else {
                    toast({ title: "Échec de la vérification", description: err.message, variant: "destructive" });
                }
            }
        });
    };
    const onStep3Submit = (data) => {
        verifyPasswordMutation.mutate(data, {
            onSuccess: () => {
                toast({ title: "Authentifié !", description: "Vérification 2FA réussie." });
            },
            onError: (err) => {
                toast({ title: "Échec 2FA", description: err.message, variant: "destructive" });
            }
        });
    };
    return (<div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-white">Connexion à Telegram</h2>
        <p className="text-muted-foreground">Suivez les étapes pour authentifier votre userbot.</p>
      </div>

      <card_1.Card className="glass-panel p-6 overflow-hidden relative">
        <framer_motion_1.AnimatePresence mode="wait">
          {step === 1 && (<framer_motion_1.motion.div key="step1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <lucide_react_1.Smartphone className="w-5 h-5"/>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Identifiants API</h3>
                  <p className="text-xs text-muted-foreground">Depuis my.telegram.org</p>
                </div>
              </div>

              <form_1.Form {...form1}>
                <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-4">
                  <form_1.FormField control={form1.control} name="apiId" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>API ID</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="12345678" {...field} className="bg-background/50"/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  <form_1.FormField control={form1.control} name="apiHash" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>API Hash</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="xxxxxxxxxxxxxxxx" {...field} className="bg-background/50"/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  <form_1.FormField control={form1.control} name="phoneNumber" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Numéro de téléphone</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="+1234567890" {...field} className="bg-background/50"/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  <button_1.Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin mr-2"/> : "Envoyer le Code"}
                  </button_1.Button>
                </form>
              </form_1.Form>
            </framer_motion_1.motion.div>)}

          {step === 2 && (<framer_motion_1.motion.div key="step2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <lucide_react_1.Shield className="w-5 h-5"/>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Code de Vérification</h3>
                  <p className="text-xs text-muted-foreground">Vérifiez vos messages Telegram</p>
                </div>
              </div>

              <form_1.Form {...form2}>
                <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-4">
                  <form_1.FormField control={form2.control} name="code" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Code</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input placeholder="12345" {...field} className="bg-background/50 text-center text-2xl tracking-widest font-mono"/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  <button_1.Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white" disabled={verifyCodeMutation.isPending}>
                    {verifyCodeMutation.isPending ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin mr-2"/> : "Vérifier le Code"}
                  </button_1.Button>
                </form>
              </form_1.Form>
            </framer_motion_1.motion.div>)}

          {step === 3 && (<framer_motion_1.motion.div key="step3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} transition={{ duration: 0.3 }}>
               <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <lucide_react_1.Key className="w-5 h-5"/>
                </div>
                <div>
                  <h3 className="font-semibold text-white">Validation en deux étapes</h3>
                  <p className="text-xs text-muted-foreground">Entrez votre mot de passe cloud</p>
                </div>
              </div>

              <form_1.Form {...form3}>
                <form onSubmit={form3.handleSubmit(onStep3Submit)} className="space-y-4">
                  <form_1.FormField control={form3.control} name="password" render={({ field }) => (<form_1.FormItem>
                        <form_1.FormLabel>Mot de passe</form_1.FormLabel>
                        <form_1.FormControl>
                          <input_1.Input type="password" placeholder="••••••••" {...field} className="bg-background/50"/>
                        </form_1.FormControl>
                        <form_1.FormMessage />
                      </form_1.FormItem>)}/>
                  <button_1.Button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white" disabled={verifyPasswordMutation.isPending}>
                    {verifyPasswordMutation.isPending ? <lucide_react_1.Loader2 className="w-4 h-4 animate-spin mr-2"/> : "Vérifier le Mot de passe"}
                  </button_1.Button>
                </form>
              </form_1.Form>
            </framer_motion_1.motion.div>)}
        </framer_motion_1.AnimatePresence>
      </card_1.Card>
    </div>);
}
