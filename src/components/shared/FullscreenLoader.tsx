'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WEBSITE_DETAILS } from '@/lib/common-data';

interface FullscreenLoaderProps {
  isVisible: boolean;
  messages?: string[];
}

const defaultMessages = [
  "Updating your data...",
  "Almost done...",
  "Just a moment...",
];

const FullscreenLoader = ({ isVisible, messages = defaultMessages }: FullscreenLoaderProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const Icon = WEBSITE_DETAILS.icon;

  useEffect(() => {
    if (!isVisible) {
      setCurrentMessageIndex(0);
      setDisplayedText('');
      setIsDeleting(false);
      return;
    }

    const currentMessage = messages[currentMessageIndex];
    
    let timeout: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing effect
      if (displayedText.length < currentMessage.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentMessage.slice(0, displayedText.length + 1));
        }, 50);
      } else {
        // Wait before deleting
        timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 1500);
      }
    } else {
      // Deleting effect
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 30);
      } else {
        // Move to next message
        setIsDeleting(false);
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [isVisible, displayedText, isDeleting, currentMessageIndex, messages]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-md"
        >
          {/* Animated Icon */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="mb-8"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur-xl opacity-40 animate-pulse" />
              
              {/* Icon container */}
              <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-2xl flex items-center justify-center">
                <Icon className="w-10 h-10 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Typewriter Text */}
          <div className="h-8 flex items-center justify-center">
            <span className="text-lg font-medium text-gray-700">
              {displayedText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-0.5 h-5 bg-orange-500 ml-1 align-middle"
              />
            </span>
          </div>

          {/* Loading dots */}
          <div className="flex gap-1.5 mt-6">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [-2, 2, -2],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
                className="w-2 h-2 bg-orange-500 rounded-full"
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullscreenLoader;
