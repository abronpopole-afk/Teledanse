"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Dashboard;
const use_bot_1 = require("@/hooks/use-bot");
const setup_wizard_1 = require("@/components/setup-wizard");
const status_badge_1 = require("@/components/ui/status-badge");
const settings_dialog_1 = require("@/components/settings-dialog");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const lucide_react_1 = require("lucide-react");
const date_fns_1 = require("date-fns");
const utils_1 = require("@/lib/utils");
const use_auth_1 = require("@/hooks/use-auth");
function Dashboard() {
    var _a, _b;
    const { data: botStatus, isLoading: isStatusLoading } = (0, use_bot_1.useBotStatus)();
    const { data: logs, isLoading: isLogsLoading } = (0, use_bot_1.useLogs)();
    const { logout, user } = (0, use_auth_1.useAuth)();
    const startBot = (0, use_bot_1.useStartBot)();
    const stopBot = (0, use_bot_1.useStopBot)();
    if (isStatusLoading) {
        return (<div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <lucide_react_1.Loader2 className="w-8 h-8 animate-spin text-emerald-500"/>
          <p>Chargement du statut du bot...</p>
        </div>
      </div>);
    }
    // If status is "requires_auth" (or authenticating), show wizard
    if ((botStatus === null || botStatus === void 0 ? void 0 : botStatus.status) === "requires_auth" || (botStatus === null || botStatus === void 0 ? void 0 : botStatus.status) === "authenticating") {
        return (<div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2"/>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2"/>
        
        <div className="absolute top-4 right-4 z-10">
          <button_1.Button variant="ghost" onClick={() => logout()} className="text-muted-foreground hover:text-white">
            <lucide_react_1.LogOut className="w-4 h-4 mr-2"/> Déconnexion
          </button_1.Button>
        </div>

        <setup_wizard_1.SetupWizard />
      </div>);
    }
    // Main Dashboard
    return (<div className="min-h-screen bg-background text-foreground font-sans">
      {/* Header */}
      <header className="border-b border-white/5 bg-card/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white font-bold">
              TB
            </div>
            <h1 className="text-lg font-display font-semibold tracking-tight">Gestionnaire TeleBot</h1>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                <lucide_react_1.User className="w-4 h-4 text-muted-foreground"/>
                <span className="text-sm font-medium">{(user === null || user === void 0 ? void 0 : user.firstName) || (user === null || user === void 0 ? void 0 : user.email)}</span>
             </div>
             <button_1.Button variant="ghost" size="sm" onClick={() => logout()} className="text-muted-foreground hover:text-white hover:bg-white/5">
               <lucide_react_1.LogOut className="w-4 h-4"/>
             </button_1.Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Status & Config Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Status Card */}
          <card_1.Card className="glass-panel p-6 col-span-1 md:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <lucide_react_1.RefreshCw className="w-32 h-32 rotate-12"/>
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">Bot Status</h2>
                <div className="flex items-center gap-3">
                  <status_badge_1.StatusBadge status={(botStatus === null || botStatus === void 0 ? void 0 : botStatus.status) || "stopped"} className="text-sm py-1.5 px-4"/>
                  {(botStatus === null || botStatus === void 0 ? void 0 : botStatus.status) === "running" && (<span className="text-xs text-muted-foreground animate-pulse">Monitoring messages...</span>)}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                {(botStatus === null || botStatus === void 0 ? void 0 : botStatus.status) === "running" ? (<button_1.Button variant="destructive" onClick={() => stopBot.mutate()} disabled={stopBot.isPending} className="w-full sm:w-auto shadow-lg shadow-red-500/20">
                    {stopBot.isPending ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.Power className="w-4 h-4 mr-2"/>}
                    Arrêter le Bot
                  </button_1.Button>) : (<button_1.Button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border-t border-white/10" onClick={() => startBot.mutate()} disabled={startBot.isPending}>
                     {startBot.isPending ? <lucide_react_1.Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <lucide_react_1.Power className="w-4 h-4 mr-2"/>}
                    Démarrer le Bot
                  </button_1.Button>)}
              </div>
            </div>
          </card_1.Card>

          {/* Config Card */}
          <card_1.Card className="glass-panel p-6 flex flex-col justify-between">
            <div className="space-y-4">
               <div className="flex items-start justify-between">
                 <h2 className="text-lg font-semibold text-white">Configuration</h2>
                 <settings_dialog_1.SettingsDialog config={(botStatus === null || botStatus === void 0 ? void 0 : botStatus.config) || null}/>
               </div>
               
               <div className="space-y-4 pt-2">
                 <div className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-1">
                   <p className="text-xs text-muted-foreground uppercase tracking-wider">Source</p>
                   <p className="text-sm font-mono text-emerald-400 truncate">
                     {((_a = botStatus === null || botStatus === void 0 ? void 0 : botStatus.config) === null || _a === void 0 ? void 0 : _a.sourceBotUsername) || <span className="text-muted-foreground italic">Non défini</span>}
                   </p>
                 </div>
                 
                 <div className="flex justify-center text-muted-foreground">
                   <lucide_react_1.ArrowRight className="w-4 h-4 rotate-90"/>
                 </div>

                 <div className="p-3 rounded-lg bg-black/20 border border-white/5 space-y-1">
                   <p className="text-xs text-muted-foreground uppercase tracking-wider">Destination</p>
                   <p className="text-sm font-mono text-blue-400 truncate">
                     {((_b = botStatus === null || botStatus === void 0 ? void 0 : botStatus.config) === null || _b === void 0 ? void 0 : _b.targetChannelId) || <span className="text-muted-foreground italic">Non défini</span>}
                   </p>
                 </div>
               </div>
            </div>
          </card_1.Card>
        </div>

        {/* Logs Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Activité de Transfert</h2>
            <div className="text-xs text-muted-foreground">
              Actualisation auto toutes les 10s
            </div>
          </div>

          <card_1.Card className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 font-semibold text-muted-foreground w-1/2">Nom du Fichier</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Statut</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground">Heure</th>
                    <th className="px-6 py-4 font-semibold text-muted-foreground text-right">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLogsLoading ? (<tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                        <lucide_react_1.Loader2 className="w-6 h-6 animate-spin mx-auto mb-2"/>
                        Chargement des logs...
                      </td>
                    </tr>) : (logs === null || logs === void 0 ? void 0 : logs.length) === 0 ? (<tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        <lucide_react_1.FileText className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                        <p>Aucun transfert pour le moment.</p>
                      </td>
                    </tr>) : (logs === null || logs === void 0 ? void 0 : logs.map((log) => (<tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs md:text-sm truncate max-w-xs text-white">
                          {log.fileName}
                        </td>
                        <td className="px-6 py-4">
                          <span className={(0, utils_1.cn)("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border", log.status === 'success'
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20")}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                          {log.transferredAt && (0, date_fns_1.format)(new Date(log.transferredAt), "MMM d, HH:mm:ss")}
                        </td>
                         <td className="px-6 py-4 text-right text-muted-foreground text-xs max-w-[200px] truncate" title={log.message || ""}>
                          {log.message || "-"}
                        </td>
                      </tr>)))}
                </tbody>
              </table>
            </div>
          </card_1.Card>
        </div>
      </main>
    </div>);
}
