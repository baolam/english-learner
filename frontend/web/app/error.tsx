'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Đã có lỗi xảy ra!</h2>
      <p className="text-slate-600 mb-4 text-sm max-w-md">{error?.message || 'Có sự cố khi tải trang này.'}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
      >
        Thử lại
      </button>
    </div>
  );
}
