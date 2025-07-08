'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface TouchGestureState {
  isActive: boolean;
  startPoint: { x: number; y: number } | null;
  currentPoint: { x: number; y: number } | null;
  deltaX: number;
  deltaY: number;
  distance: number;
  velocity: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
  gestureType: 'tap' | 'swipe' | 'pinch' | 'pan' | null;
}

export interface TouchGestureHandlers {
  onTap?: (point: { x: number; y: number }) => void;
  onSwipe?: (direction: 'up' | 'down' | 'left' | 'right', velocity: number) => void;
  onPinch?: (scale: number, center: { x: number; y: number }) => void;
  onPan?: (delta: { x: number; y: number }, velocity: number) => void;
  onTouchStart?: (point: { x: number; y: number }) => void;
  onTouchEnd?: () => void;
}

export function useTouchGestures(
  element: HTMLElement | null,
  handlers: TouchGestureHandlers,
  options: {
    swipeThreshold?: number;
    tapThreshold?: number;
    pinchThreshold?: number;
    preventDefault?: boolean;
  } = {}
) {
  const {
    swipeThreshold = 50,
    tapThreshold = 10,
    pinchThreshold = 10,
    preventDefault = true
  } = options;

  const [gestureState, setGestureState] = useState<TouchGestureState>({
    isActive: false,
    startPoint: null,
    currentPoint: null,
    deltaX: 0,
    deltaY: 0,
    distance: 0,
    velocity: 0,
    direction: null,
    gestureType: null
  });

  const touchStartTime = useRef<number>(0);
  const initialDistance = useRef<number>(0);
  const touches = useRef<TouchList | null>(null);

  const calculateDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const calculateVelocity = useCallback((distance: number, time: number) => {
    return time > 0 ? distance / time : 0;
  }, []);

  const getSwipeDirection = useCallback((deltaX: number, deltaY: number) => {
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    touchStartTime.current = Date.now();
    touches.current = e.touches;

    const touch = e.touches[0];
    const startPoint = { x: touch.clientX, y: touch.clientY };

    if (e.touches.length === 2) {
      initialDistance.current = calculateDistance(e.touches[0], e.touches[1]);
    }

    setGestureState({
      isActive: true,
      startPoint,
      currentPoint: startPoint,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      velocity: 0,
      direction: null,
      gestureType: e.touches.length === 2 ? 'pinch' : null
    });

    handlers.onTouchStart?.(startPoint);
  }, [preventDefault, calculateDistance, handlers]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    if (!gestureState.isActive || !gestureState.startPoint) return;

    const touch = e.touches[0];
    const currentPoint = { x: touch.clientX, y: touch.clientY };
    const deltaX = currentPoint.x - gestureState.startPoint.x;
    const deltaY = currentPoint.y - gestureState.startPoint.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const time = Date.now() - touchStartTime.current;
    const velocity = calculateVelocity(distance, time);

    if (e.touches.length === 2 && gestureState.gestureType === 'pinch') {
      const currentDistance = calculateDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance.current;
      const center = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };

      if (Math.abs(scale - 1) > pinchThreshold / 100) {
        handlers.onPinch?.(scale, center);
      }
    } else if (e.touches.length === 1) {
      const gestureType = distance > tapThreshold ? 'pan' : 'tap';
      
      if (gestureType === 'pan') {
        handlers.onPan?.({ x: deltaX, y: deltaY }, velocity);
      }

      setGestureState(prev => ({
        ...prev,
        currentPoint,
        deltaX,
        deltaY,
        distance,
        velocity,
        direction: getSwipeDirection(deltaX, deltaY),
        gestureType
      }));
    }
  }, [gestureState, calculateDistance, calculateVelocity, getSwipeDirection, handlers, tapThreshold, pinchThreshold]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault();
    }

    if (!gestureState.isActive || !gestureState.startPoint) return;

    const time = Date.now() - touchStartTime.current;
    const { distance, deltaX, deltaY, gestureType } = gestureState;

    if (gestureType === 'tap' && distance < tapThreshold) {
      handlers.onTap?.(gestureState.startPoint);
    } else if (distance > swipeThreshold && time < 300) {
      const direction = getSwipeDirection(deltaX, deltaY);
      const velocity = calculateVelocity(distance, time);
      handlers.onSwipe?.(direction, velocity);
    }

    setGestureState({
      isActive: false,
      startPoint: null,
      currentPoint: null,
      deltaX: 0,
      deltaY: 0,
      distance: 0,
      velocity: 0,
      direction: null,
      gestureType: null
    });

    handlers.onTouchEnd?.();
  }, [gestureState, preventDefault, tapThreshold, swipeThreshold, calculateVelocity, getSwipeDirection, handlers]);

  useEffect(() => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return gestureState;
}

// Hook for mobile-specific undo/redo gestures
export function useMobileUndoRedo(
  onUndo: () => void,
  onRedo: () => void,
  enabled: boolean = true
) {
  const [element, setElement] = useState<HTMLElement | null>(null);

  useTouchGestures(element, {
    onSwipe: (direction, velocity) => {
      if (!enabled) return;
      
      // Three-finger swipe left for undo
      if (direction === 'left' && velocity > 0.5) {
        onUndo();
      }
      // Three-finger swipe right for redo
      else if (direction === 'right' && velocity > 0.5) {
        onRedo();
      }
    }
  });

  return setElement;
}
