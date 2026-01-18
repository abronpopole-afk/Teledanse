import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Check, Shield, Smartphone, Key } from "lucide-react";
import { useBotLogin, useVerifyCode, useVerifyPassword } from "@/hooks/use-bot";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Schemas
const step1Schema = z.object({
  apiId: z.coerce.number().min(1, "API ID is required"),
  apiHash: z.string().min(1, "API Hash is required"),
  phoneNumber: z.string().min(5, "Phone number is required"),
});

const step2Schema = z.object({
  code: z.string().min(1, "Verification code is required"),
});

const step3Schema = z.object({
  password: z.string().min(1, "Password is required"),
});

export function SetupWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { toast } = useToast();
  
  const loginMutation = useBotLogin();
  const verifyCodeMutation = useVerifyCode();
  const verifyPasswordMutation = useVerifyPassword();

  // Forms
  const form1 = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: { apiId: undefined, apiHash: "", phoneNumber: "" }
  });

  const form2 = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema),
    defaultValues: { code: "" }
  });

  const form3 = useForm<z.infer<typeof step3Schema>>({
    resolver: zodResolver(step3Schema),
    defaultValues: { password: "" }
  });

  // Handlers
  const onStep1Submit = (data: z.infer<typeof step1Schema>) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Code Sent", description: "Check your Telegram app for the code." });
        setStep(2);
      },
      onError: (err) => {
        toast({ title: "Connection Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  const onStep2Submit = (data: z.infer<typeof step2Schema>) => {
    verifyCodeMutation.mutate(data, {
      onSuccess: (res) => {
        if (res.success) {
          toast({ title: "Authenticated!", description: "Bot connected successfully." });
        } else {
          // If success is false but no error, likely needs password
          setStep(3);
        }
      },
      onError: (err) => {
        if (err.message.includes("password")) {
          setStep(3);
        } else {
          toast({ title: "Verification Failed", description: err.message, variant: "destructive" });
        }
      }
    });
  };

  const onStep3Submit = (data: z.infer<typeof step3Schema>) => {
    verifyPasswordMutation.mutate(data, {
      onSuccess: () => {
        toast({ title: "Authenticated!", description: "2FA Verified successfully." });
      },
      onError: (err) => {
        toast({ title: "2FA Failed", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8 text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-white">Connect Telegram</h2>
        <p className="text-muted-foreground">Follow the steps to authenticate your userbot.</p>
      </div>

      <Card className="glass-panel p-6 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">API Credentials</h3>
                  <p className="text-xs text-muted-foreground">From my.telegram.org</p>
                </div>
              </div>

              <Form {...form1}>
                <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-4">
                  <FormField
                    control={form1.control}
                    name="apiId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API ID</FormLabel>
                        <FormControl>
                          <Input placeholder="12345678" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form1.control}
                    name="apiHash"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Hash</FormLabel>
                        <FormControl>
                          <Input placeholder="xxxxxxxxxxxxxxxx" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form1.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Send Code"}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Verification Code</h3>
                  <p className="text-xs text-muted-foreground">Check your Telegram messages</p>
                </div>
              </div>

              <Form {...form2}>
                <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-4">
                  <FormField
                    control={form2.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="12345" 
                            {...field} 
                            className="bg-background/50 text-center text-2xl tracking-widest font-mono"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                    disabled={verifyCodeMutation.isPending}
                  >
                    {verifyCodeMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Verify Code"}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
               <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Two-Step Verification</h3>
                  <p className="text-xs text-muted-foreground">Enter your cloud password</p>
                </div>
              </div>

              <Form {...form3}>
                <form onSubmit={form3.handleSubmit(onStep3Submit)} className="space-y-4">
                  <FormField
                    control={form3.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password"
                            placeholder="••••••••" 
                            {...field} 
                            className="bg-background/50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white"
                    disabled={verifyPasswordMutation.isPending}
                  >
                    {verifyPasswordMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Verify Password"}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
