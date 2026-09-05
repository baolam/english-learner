'use client';

import { Library as LibraryIcon, BookOpen } from 'lucide-react';

export default function LibraryPage() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 h-full">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <LibraryIcon className="w-8 h-8 text-blue-600" />
            Library
          </h1>
          <p className="text-slate-500 mt-1">Manage and read your English learning materials and books.</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center p-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
        <BookOpen size={48} className="text-slate-300 mb-4" />
        <p className="text-lg font-medium text-slate-600">Your library is empty</p>
        <p className="text-sm mt-1">Uploaded documents and learning materials will appear here.</p>
      </div>
    </div>
  );
}
