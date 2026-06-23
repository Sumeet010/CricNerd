import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  User, 
  ShieldAlert, 
  Trophy, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiError } from "@/services/api";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useAuth } from "@/hooks/useAuth";


const registerSchema = z.object({
  username: z
    .string()
    .min(2, { message: "Username must be at least 2 characters" })
    .trim(),
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain a number" })
    .regex(/[^A-Za-z0-9]/, { message: "Must contain special character" }),
  role: z.enum(["PLAYER", "ORGANIZER"]),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "PLAYER",
    },
  });

  const password = form.watch("password") || "";

  const passwordRules = [
    { label: "At least 8 characters", test: (val: string) => val.length >= 8 },
    { label: "One uppercase letter", test: (val: string) => /[A-Z]/.test(val) },
    { label: "One lowercase letter", test: (val: string) => /[a-z]/.test(val) },
    { label: "One number", test: (val: string) => /[0-9]/.test(val) },
    { label: "One special character", test: (val: string) => /[^A-Za-z0-9]/.test(val) },
  ];

  const allRulesSatisfied = passwordRules.every((rule) => rule.test(password));

  async function onSubmit(values: RegisterFormValues) {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Backend expects role as an array of string (e.g. ["PLAYER"] or ["ORGANIZER"])
      await register({
        username: values.username,
        email: values.email,
        password: values.password,
        role: [values.role],
      });
      
      setIsSuccess(true);
      // Wait for 2 seconds to show success checkmark, then redirect
      const redirectUrl = searchParams.get("redirect") || "/";
      setTimeout(() => {
        navigate(redirectUrl);
      }, 2000);
    } catch (err: any) {
      console.error("Registration error:", err);
      if (err instanceof ApiError && err.zodErrors) {
        Object.entries(err.zodErrors).forEach(([field, message]) => {
          if (field === "username" || field === "name") {
            form.setError("username", { type: "server", message });
          } else {
            form.setError(field as any, { type: "server", message });
          }
        });
      } else {
        setErrorMsg(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (isSuccess) {
    return (
      <AuthLayout maxWidthClassName="max-w-md">
        <Card className="w-full bg-[#151518] border-zinc-800 text-center p-8 animate-fade-in">
          <CardContent className="pt-6 flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-[#fcf8e3] mb-4 stroke-[1.5]" />
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Cricnerd!</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Your account has been created successfully. Redirecting you to the dashboard...
            </p>
            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
              <div className="bg-[#fcf8e3] h-full w-full animate-[loading-bar_2s_ease-out-in]" style={{ transformOrigin: 'left' }} />
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout maxWidthClassName="max-w-lg">
      <Card className="w-full bg-[#151518] border border-zinc-800 shadow-xl overflow-hidden">
        <CardHeader className="space-y-1 pt-8">
          <CardTitle className="text-2xl text-white font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription className="text-zinc-400 text-xs">
            Join the platform to track players, manage matches, and run tournaments
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300 font-medium text-xs">Username / Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Virat Kohli"
                        {...field}
                        className="bg-[#1e1e22] border-zinc-800 text-white placeholder-zinc-600 focus-visible:border-zinc-700 focus-visible:ring-zinc-800"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300 font-medium text-xs">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@example.com"
                        {...field}
                        className="bg-[#1e1e22] border-zinc-800 text-white placeholder-zinc-600 focus-visible:border-zinc-700 focus-visible:ring-zinc-800"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-zinc-300 font-medium text-xs">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          className="bg-[#1e1e22] border-zinc-800 text-white placeholder-zinc-600 focus-visible:border-zinc-700 focus-visible:ring-zinc-800 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    
                    {/* Password requirements checklist */}
                    <div className="mt-2.5 p-3 bg-[#131316] border border-zinc-800/60 rounded-lg space-y-2">
                      <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        Password Requirements
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5">
                        {passwordRules.map((rule, idx) => {
                          const isSatisfied = rule.test(password);
                          return (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                              {isSatisfied ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10 shrink-0" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border border-zinc-700 shrink-0" />
                              )}
                              <span className={isSatisfied ? "text-zinc-300 transition-colors" : "text-zinc-500 transition-colors"}>
                                {rule.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              {/* Selection for Role (PLAYER vs ORGANIZER) */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-zinc-300 font-medium text-xs">Register As</FormLabel>
                    <div className="grid grid-cols-2 gap-4">
                      {/* PLAYER CARD */}
                      <button
                        type="button"
                        onClick={() => field.onChange("PLAYER")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                          field.value === "PLAYER"
                            ? "bg-[#1e1e22] border-[#fcf8e3] text-white"
                            : "bg-[#1e1e22]/50 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                        }`}
                      >
                        <User className={`w-6 h-6 mb-2 ${field.value === "PLAYER" ? "text-[#fcf8e3]" : "text-zinc-500"}`} />
                        <span className="text-sm font-semibold block mb-0.5">Player</span>
                        <span className="text-[10px] text-zinc-500 max-w-[150px]">Track stats, join teams & play matches</span>
                      </button>

                      {/* ORGANIZER CARD */}
                      <button
                        type="button"
                        onClick={() => field.onChange("ORGANIZER")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all cursor-pointer ${
                          field.value === "ORGANIZER"
                            ? "bg-[#1e1e22] border-[#fcf8e3] text-white"
                            : "bg-[#1e1e22]/50 border-zinc-800 hover:border-zinc-700 text-zinc-400"
                        }`}
                      >
                        <Trophy className={`w-6 h-6 mb-2 ${field.value === "ORGANIZER" ? "text-[#fcf8e3]" : "text-zinc-500"}`} />
                        <span className="text-sm font-semibold block mb-0.5">Organizer</span>
                        <span className="text-[10px] text-zinc-500 max-w-[150px]">Host tournaments & manage squads</span>
                      </button>
                    </div>
                    <FormMessage className="text-red-400 text-xs" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 bg-[#fcf8e3] text-black hover:bg-[#f5eea5] transition-colors font-semibold py-2.5 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Sign Up
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 border-t border-zinc-800/50 pt-5 pb-6 text-center text-xs">
          <p className="text-zinc-500">
            Already have an account?{" "}
            <Link
              to={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
              className="text-white font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
