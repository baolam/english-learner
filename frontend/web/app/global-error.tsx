'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 flex flex-col items-center justify-center min-h-screen p-6 text-center font-sans">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Sự cố hệ thống</h2>
        <p className="text-slate-600 mb-4 text-sm">{error?.message || 'Đã xảy ra lỗi hệ thống.'}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Tải lại trang
        </button>
      </body>
    </html>
  );
}
