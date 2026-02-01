'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastItemProps {
  toast: ToastMessage;
  removeToast: (id: string) => void;
}

const ToastItem = ({ toast, removeToast }: ToastItemProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000); 

    return () => clearTimeout(timer); 
  }, [toast.id, removeToast]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-rose-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      default: return <Info className="h-4 w-4 text-cyan-500" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'border-emerald-500/50';
      case 'error': return 'border-rose-500/50';
      case 'warning': return 'border-amber-500/50';
      default: return 'border-cyan-500/50';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
      className={`relative flex items-center justify-between
        min-w-[300px] max-w-md px-5 py-4 my-2
        bg-white/70 backdrop-blur-xl
        rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        border-2 ${getBorderColor()}
        pointer-events-auto group transition-all
      `}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center p-2 rounded-xl bg-white/50 shadow-sm">
            {getIcon()}
        </div>
        <span className="text-sm font-bold text-slate-900 tracking-tight">{toast.message}</span>
      </div>
      <button 
        onClick={() => removeToast(toast.id)} 
        className="p-1.5 hover:bg-black/5 text-slate-400 hover:text-slate-900 rounded-full transition-colors ml-4"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export default ToastItem;
