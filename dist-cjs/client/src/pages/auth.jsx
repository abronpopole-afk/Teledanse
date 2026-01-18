"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AuthPage;
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
function AuthPage() {
    const handleLogin = () => {
        window.location.href = "/api/login";
    };
    return (<div className="min-h-screen w-full flex bg-background">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/40 via-background to-background"/>
           <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent opacity-50"/>
        </div>
        
        <div className="relative z-10 max-w-lg space-y-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-emerald-500/20">
             <lucide_react_1.Lock className="w-8 h-8 text-white"/>
          </div>
          
          <h1 className="text-5xl font-display font-bold text-white tracking-tight leading-tight">
            Automatisez votre <br />
            <span className="text-gradient-primary">flux Telegram</span>
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Gérez en toute sécurité votre bot de transfert de PDF avec un magnifique tableau de bord en temps réel. 
            Surveillez les transferts, configurez les paramètres et gérez l'authentification en toute simplicité.
          </p>

          <div className="flex gap-4 pt-4">
             <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-muted-foreground">
                Logs en temps réel
             </div>
             <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-muted-foreground">
                Auth Sécurisée
             </div>
             <div className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-muted-foreground">
                Basé sur le Cloud
             </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
         <div className="max-w-md w-full space-y-8 text-center">
            <div className="space-y-2">
               <h2 className="text-3xl font-bold tracking-tight text-white">Bienvenue</h2>
               <p className="text-muted-foreground">Connectez-vous pour accéder à votre tableau de bord</p>
            </div>

            <button_1.Button size="lg" className="w-full bg-white text-black hover:bg-white/90 h-12 text-base font-medium shadow-lg shadow-white/5" onClick={handleLogin}>
               Se connecter avec Replit
               <lucide_react_1.ArrowRight className="w-4 h-4 ml-2"/>
            </button_1.Button>

            <p className="text-xs text-muted-foreground">
              En continuant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité.
            </p>
         </div>
      </div>
    </div>);
}
