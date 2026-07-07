import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { ToastItem } from '@/types';

const ICON_MAP: Record<ToastItem['type'], React.ReactNode> = {
  success: <CheckCircle size={16} className="text-green-400" />,
  error: <AlertCircle size={16} className="text-red-400" />,
  info: <Info size={16} className="text-[#00d4ff]" />,
  warning: <AlertTriangle size={16} className="text-yellow-400" />,
};

const BG_MAP: Record<ToastItem['type'], string> = {
  success: 'border-green-400/20 bg-green-400/5',
  error: 'border-red-400/20 bg-red-400/5',
  info: 'border-[#00d4ff]/20 bg-[#00d4ff]/5',
  warning: 'border-yellow-400/20 bg-yellow-400/5',
};

function ToastEntry({ toast }: { toast: ToastItem }) {
  const removeToast = useStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration ?? 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border backdrop-blur-md shadow-lg animate-toast-enter ${BG_MAP[toast.type]}`}
      style={{ minWidth: 200, maxWidth: 360 }}
    >
      <span className="shrink-0">{ICON_MAP[toast.type]}</span>
      <span className="text-xs text-white/80 flex-1">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-white/30 hover:text-white/60 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastEntry toast={toast} />
        </div>
      ))}
    </div>
  );
}