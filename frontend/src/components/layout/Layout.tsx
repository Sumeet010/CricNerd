import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode; // For the "+ Create" button
}

export function Layout({ children, title, subtitle, action }: LayoutProps) {
  return (
    <div className="flex h-screen bg-[#151515] overflow-hidden font-sans">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.03] bg-no-repeat bg-center bg-contain mix-blend-screen"
          style={{ backgroundImage: "url('/Gemini_Generated_Image_b7i1ocb7i1ocb7i1-removebg-preview 2.png')" }}
        />

        {/* Top Header Bar */}
        <header className="px-8 py-6 border-b border-zinc-800 relative z-10 flex items-center justify-between">
          <div>
            {subtitle && <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-1">{subtitle}</p>}
            <h2 className="text-3xl font-bold text-white">{title}</h2>
          </div>
          {action && (
            <div>{action}</div>
          )}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8 relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
