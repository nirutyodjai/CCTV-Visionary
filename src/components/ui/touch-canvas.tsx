
import React, { useRef, useEffect } from 'react';

interface Point {
    x: number;
    y: number;
}

interface TouchCanvasProps {
  children: React.ReactNode;
  onTap?: (point: Point) => void;
  onDoubleTap?: (point: Point) => void;
  className?: string;
}

export const TouchCanvas: React.FC<TouchCanvasProps> = ({ children, onTap, onDoubleTap, className }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const handlePointerDown = (e: PointerEvent) => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTap.current;

      if (timeSinceLastTap < 300) { // Double tap
        if (onDoubleTap) {
          onDoubleTap({ x: e.clientX, y: e.clientY });
        }
        lastTap.current = 0; // Reset tap
      } else { // Single tap
        if (onTap) {
          onTap({ x: e.clientX, y: e.clientY });
        }
        lastTap.current = now;
      }
    };
    
    el.addEventListener('pointerdown', handlePointerDown);

    return () => {
      el.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [onTap, onDoubleTap]);

  return (
    <div ref={canvasRef} className={className}>
      {children}
    </div>
  );
};
