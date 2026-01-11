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
    }, 3000); // Auto-remove after 3 seconds

    return () => clearTimeout(timer); // Cleanup the timer
  }, [toast.id, removeToast]);

  return (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative flex items-center justify-between
        min-w-[340px] max-w-md px-5 py-4 my-2
        rounded-lg shadow-xl backdrop-blur-md
        pointer-events-auto
        ${toast.type === 'success' && 'bg-gradient-to-r from-green-100 to-green-50 text-green-800'}
        ${toast.type === 'error' && 'bg-gradient-to-r from-red-100 to-red-50 text-red-800'}
        ${toast.type === 'info' && 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800'}
        ${toast.type === 'warning' && 'bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-800'}
      `}
    >
      <div className="flex items-center">
        {toast.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
        {toast.type === 'error' && <XCircle className="h-5 w-5 mr-2" />}
        {toast.type === 'info' && <Info className="h-5 w-5 mr-2" />}
        {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 mr-2" />}
        <span>{toast.message}</span>
      </div>
      <button onClick={() => removeToast(toast.id)} className="ml-4 text-gray-500 hover:text-gray-700">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};

export default ToastItem;
