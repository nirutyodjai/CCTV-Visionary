
import { useEffect, useRef } from 'react';

type GestureType = 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down' | 'tap' | 'long-press';
type GestureHandler = (e: TouchEvent) => void;

export const useTouchGestures = (handlers: Partial<Record<GestureType, GestureHandler>>) => {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          time: Date.now(),
        };

        if (handlers['long-press']) {
            longPressTimeout.current = setTimeout(() => {
                if (handlers['long-press']) {
                    handlers['long-press'](e);
                }
                touchStart.current = null;
            }, 500);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
        }
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
        }

      if (touchStart.current && e.changedTouches.length === 1) {
        const touchEnd = {
          x: e.changedTouches[0].clientX,
          y: e.changedTouches[0].clientY,
        };

        const dx = touchEnd.x - touchStart.current.x;
        const dy = touchEnd.y - touchStart.current.y;
        const dt = Date.now() - touchStart.current.time;

        if (dt < 250) {
          if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
            if (handlers.tap) handlers.tap(e);
          } else if (Math.abs(dx) > 30 && Math.abs(dy) < 30) {
            if (dx > 0 && handlers['swipe-right']) handlers['swipe-right'](e);
            else if (handlers['swipe-left']) handlers['swipe-left'](e);
          } else if (Math.abs(dy) > 30 && Math.abs(dx) < 30) {
            if (dy > 0 && handlers['swipe-down']) handlers['swipe-down'](e);
            else if (handlers['swipe-up']) handlers['swipe-up'](e);
          }
        }
      }
    };

    const target = window;
    target.addEventListener('touchstart', handleTouchStart);
    target.addEventListener('touchmove', handleTouchMove);
    target.addEventListener('touchend', handleTouchEnd);

    return () => {
      target.removeEventListener('touchstart', handleTouchStart);
      target.removeEventListener('touchmove', handleTouchMove);
      target.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlers]);
};
