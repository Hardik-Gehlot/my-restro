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
      case 'success': return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'error': return <XCircle className="h-5 w-5 text-rose-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      default: return <Info className="h-5 w-5 text-cyan-400" />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success': return 'border-emerald-500/30';
      case 'error': return 'border-rose-500/30';
      case 'warning': return 'border-amber-500/30';
      default: return 'border-cyan-500/30';
    }
  };

  const getShadowColor = () => {
    switch (toast.type) {
      case 'success': return 'shadow-emerald-900/20';
      case 'error': return 'shadow-rose-900/20';
      case 'warning': return 'shadow-amber-900/20';
      default: return 'shadow-cyan-900/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
      className={`relative flex items-center justify-between
        min-w-[320px] max-w-md px-5 py-4 my-2
        bg-slate-900/80 backdrop-blur-xl border ${getBorderColor()}
        rounded-2xl shadow-2xl ${getShadowColor()}
        pointer-events-auto group
      `}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800 rounded-xl">
            {getIcon()}
        </div>
        <span className="text-sm font-medium text-slate-200">{toast.message}</span>
      </div>
      <button 
        onClick={() => removeToast(toast.id)} 
        className="p-1 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      
      {/* Animated Progress Bar */}
      <motion.div 
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }}
        className={`absolute bottom-0 left-0 h-[2px] rounded-full
            ${toast.type === 'success' && 'bg-emerald-500'}
            ${toast.type === 'error' && 'bg-rose-500'}
            ${toast.type === 'warning' && 'bg-amber-500'}
            ${toast.type === 'info' && 'bg-cyan-500'}
        `}
      />
    </motion.div>
  );
};

export default ToastItem;
