import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  ShieldAlert, 
  LogIn, 
  Eye, 
  EyeOff, 
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


const loginSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await login(values);
      
      setIsSuccess(true);
      // Wait for 1.5 seconds to show success checkmark, then redirect
      const redirectUrl = searchParams.get("redirect") || "/";
      setTimeout(() => {
        navigate(redirectUrl);
      }, 1500);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err instanceof ApiError && err.zodErrors) {
        Object.entries(err.zodErrors).forEach(([field, message]) => {
          form.setError(field as any, { type: "server", message });
        });
      } else {
        setErrorMsg(err.message || "Invalid email or password.");
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
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back!</h2>
            <p className="text-zinc-400 text-sm mb-6">
              Logged in successfully. Redirecting you to the dashboard...
            </p>
            <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
              <div className="bg-[#fcf8e3] h-full w-full animate-[loading-bar_1.5s_ease-out-in]" style={{ transformOrigin: 'left' }} />
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout maxWidthClassName="max-w-md">
      <Card className="w-full bg-[#151518] border border-zinc-800 shadow-xl overflow-hidden">
        <CardHeader className="space-y-1 pt-8">
          <CardTitle className="text-2xl text-white font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-zinc-400 text-xs">
            Access your matches and tournament dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <div className="flex justify-between items-center">
                      <FormLabel className="text-zinc-300 font-medium text-xs">Password</FormLabel>
                      <a href="#" className="text-zinc-500 hover:text-white transition-colors text-[10px] hover:underline">
                        Forgot password?
                      </a>
                    </div>
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <LogIn className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2 border-t border-zinc-800/50 pt-5 pb-6 text-center text-xs">
          <p className="text-zinc-500">
            Don't have an account?{" "}
            <Link
              to={`/register${searchParams.toString() ? `?${searchParams.toString()}` : ""}`}
              className="text-white font-medium hover:underline"
            >
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
