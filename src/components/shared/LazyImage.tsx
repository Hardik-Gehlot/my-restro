// ============================================
// Lazy Image Loading Component
// ============================================
'use client';
import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';

interface LazyImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Lazy loading image component with intersection observer
 * Only loads images when they're about to enter the viewport
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f3f4f6" width="400" height="300"/%3E%3C/svg%3E',
  className = '',
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading the actual image
            const img = new Image();
            img.src = src;
            
            img.onload = () => {
              setImageSrc(src);
              setIsLoading(false);
              onLoad?.();
            };
            
            img.onerror = () => {
              setHasError(true);
              setIsLoading(false);
              onError?.();
            };
            
            // Stop observing once we've started loading
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01
      }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoading ? 'animate-pulse' : ''} ${hasError ? 'opacity-50' : ''}`}
      {...props}
    />
  );
};

/**
 * Simple lazy image with blur-up effect
 */
export const BlurImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className="relative overflow-hidden">
      <LazyImage
        src={src}
        alt={alt}
        className={`${className} transition-all duration-300 ${
          isLoaded ? 'blur-0 scale-100' : 'blur-sm scale-105'
        }`}
        onLoad={() => setIsLoaded(true)}
        {...props}
      />
    </div>
  );
};
