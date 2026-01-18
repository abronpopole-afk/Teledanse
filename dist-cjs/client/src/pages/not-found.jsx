"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NotFound;
const card_1 = require("@/components/ui/card");
const lucide_react_1 = require("lucide-react");
const wouter_1 = require("wouter");
function NotFound() {
    return (<div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <card_1.Card className="w-full max-w-md mx-auto glass-panel border-white/5">
        <card_1.CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <lucide_react_1.AlertCircle className="h-8 w-8 text-red-500"/>
            <h1 className="text-2xl font-bold text-white">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            The page you requested was not found.
          </p>

          <div className="mt-8">
            <wouter_1.Link href="/" className="text-emerald-400 hover:text-emerald-300 hover:underline underline-offset-4 text-sm font-medium">
              Return to Dashboard
            </wouter_1.Link>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
