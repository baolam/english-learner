'use client';

import { Library, LayoutDashboard, Calendar, Settings } from 'lucide-react';
import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen">
      <div className="p-4 flex items-center gap-2 border-b border-slate-700 text-white">
        <span className="font-bold text-xl">English Learner</span>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-2">
          <li>
            <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link href="/library" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition">
              <Library size={20} />
              <span>Library</span>
            </Link>
          </li>
          <li>
            <Link href="/schedules" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-800 hover:text-white transition">
              <Calendar size={20} />
              <span>Schedules</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md hover:bg-slate-800 hover:text-white transition">
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
