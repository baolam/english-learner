'use client';

import { Sidebar } from './Sidebar';
import { MarqueeBanner } from './MarqueeBanner';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {children}
        </main>
      </div>

      {/* Bottom Marquee Slogan */}
      <MarqueeBanner />
    </div>
  );
}
