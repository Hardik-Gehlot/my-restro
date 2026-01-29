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

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
      className={`relative flex items-center justify-between
        min-w-[260px] max-w-md px-4 py-2 my-1
        bg-white/95 backdrop-blur-md
        rounded-none shadow-[0_4px_20px_rgba(0,0,0,0.15)]
        pointer-events-auto group
      `}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center">
            {getIcon()}
        </div>
        <span className="text-[12px] font-bold text-slate-900 tracking-tight leading-none">{toast.message}</span>
      </div>
      <button 
        onClick={() => removeToast(toast.id)} 
        className="p-1 hover:bg-slate-200/50 text-slate-400 hover:text-slate-900 transition-colors ml-4"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
};

export default ToastItem;
