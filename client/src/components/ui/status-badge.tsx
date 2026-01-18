import { cn } from "@/lib/utils";
import { Circle, Play, Square, Loader2, AlertTriangle } from "lucide-react";
import type { BotStatus } from "@shared/schema";

interface StatusBadgeProps {
  status: BotStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    running: {
      label: "Active",
      icon: Play,
      classes: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
      iconClass: "fill-current"
    },
    stopped: {
      label: "Stopped",
      icon: Square,
      classes: "bg-red-500/15 text-red-400 border-red-500/20",
      iconClass: "fill-current"
    },
    authenticating: {
      label: "Connecting...",
      icon: Loader2,
      classes: "bg-amber-500/15 text-amber-400 border-amber-500/20",
      iconClass: "animate-spin"
    },
    requires_auth: {
      label: "Setup Required",
      icon: AlertTriangle,
      classes: "bg-blue-500/15 text-blue-400 border-blue-500/20",
      iconClass: ""
    }
  };

  const { label, icon: Icon, classes, iconClass } = config[status];

  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border",
      classes,
      className
    )}>
      <Icon className={cn("w-3 h-3", iconClass)} />
      {label}
    </div>
  );
}
