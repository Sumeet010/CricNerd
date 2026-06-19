import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  maxWidthClassName?: string; // e.g. "max-w-md" (Login) or "max-w-lg" (Register)
}

export function AuthLayout({ children, maxWidthClassName = "max-w-md" }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0c0c0e] flex items-center justify-center p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Decorative clean grid lines for background context */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1f23_1px,transparent_1px),linear-gradient(to_bottom,#1f1f23_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-[0.15] pointer-events-none" />

      <div className={`w-full ${maxWidthClassName} flex flex-col gap-6 relative z-10`}>
        {/* Brand header */}
        <div className="flex items-center justify-center gap-1.5">
          <span className="text-3xl font-extrabold text-white tracking-tight">Cricnerd</span>
          <span className="w-2 h-2 rounded-full bg-[#fcf8e3]" />
        </div>
        
        {/* Auth page content */}
        {children}
      </div>
    </div>
  );
}
