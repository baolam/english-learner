'use client';

import { Sidebar } from './Sidebar';
import { RightPanel } from './RightPanel';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {children}
      </main>
      <RightPanel />
    </div>
  );
}
