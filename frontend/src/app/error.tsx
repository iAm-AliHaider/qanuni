"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 max-w-md text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <p className="text-lg font-bold text-slate-900 mb-2">Something went wrong</p>
        <p className="text-xs text-slate-500 mb-4 break-all">{error.message}</p>
        <div className="flex gap-2 justify-center">
          <button onClick={reset} className="px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-semibold">Try Again</button>
          <button onClick={() => { localStorage.removeItem("qanuni_user"); window.location.reload(); }} className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 text-sm font-semibold">Clear & Reload</button>
        </div>
      </div>
    </div>
  );
}
