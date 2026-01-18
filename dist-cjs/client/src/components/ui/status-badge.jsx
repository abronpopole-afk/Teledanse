"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatusBadge = StatusBadge;
const utils_1 = require("@/lib/utils");
const lucide_react_1 = require("lucide-react");
function StatusBadge({ status, className }) {
    const config = {
        running: {
            label: "Active",
            icon: lucide_react_1.Play,
            classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
            iconClass: "fill-current"
        },
        stopped: {
            label: "Stopped",
            icon: lucide_react_1.Square,
            classes: "bg-red-500/15 text-red-400 border-red-500/20",
            iconClass: "fill-current"
        },
        authenticating: {
            label: "Connecting...",
            icon: lucide_react_1.Loader2,
            classes: "bg-amber-500/15 text-amber-400 border-amber-500/20",
            iconClass: "animate-spin"
        },
        requires_auth: {
            label: "Setup Required",
            icon: lucide_react_1.AlertTriangle,
            classes: "bg-blue-500/15 text-blue-400 border-blue-500/20",
            iconClass: ""
        }
    };
    const { label, icon: Icon, classes, iconClass } = config[status];
    return (<div className={(0, utils_1.cn)("inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border", classes, className)}>
      <Icon className={(0, utils_1.cn)("w-3 h-3", iconClass)}/>
      {label}
    </div>);
}
