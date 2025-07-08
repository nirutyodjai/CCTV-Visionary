'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCcw, Move, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TouchCanvasProps {
  children: React.ReactNode;
  className?: string;
  onPan?: (delta: { x: number; y: number }) => void;
  onZoom?: (scale: number, center: { x: number; y: number }) => void;
  onTap?: (point: { x: number; y: number }) => void;
  onDoubleTap?: (point: { x: number; y: number }) => void;
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
  enablePan?: boolean;
  enableZoom?: boolean;
  enableRotation?: boolean;
}

export function TouchCanvas({ 
  children, 
  className,
  onPan,
  onZoom,
  onTap,
  onDoubleTap,
  minZoom = 0.5,
  maxZoom = 3,
  initialZoom = 1,
  enablePan = true,
  enableZoom = true,
  enableRotation = false
}: TouchCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({
    scale: initialZoom,
    translateX: 0,
    translateY: 0,
    rotation: 0
  });
  const [isInteracting, setIsInteracting] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const { isMobile, touchSupport } = useMobileDetection();

  const handleTouchTap = useCallback((point: { x: number; y: number }) => {
    const now = Date.now();
    const timeDiff = now - lastTapTime;
    
    if (timeDiff < 300) {
      // Double tap
      onDoubleTap?.(point);
    } else {
      // Single tap
      onTap?.(point);
    }
    
    setLastTapTime(now);
  }, [lastTapTime, onTap, onDoubleTap]);

  const handleTouchPan = useCallback((delta: { x: number; y: number }) => {
    if (!enablePan) return;
    
    setTransform(prev => ({
      ...prev,
      translateX: prev.translateX + delta.x,
      translateY: prev.translateY + delta.y
    }));
    
    onPan?.(delta);
  }, [enablePan, onPan]);

  const handleTouchPinch = useCallback((scale: number, center: { x: number; y: number }) => {
    if (!enableZoom) return;
    
    const newScale = Math.max(minZoom, Math.min(maxZoom, transform.scale * scale));
    
    setTransform(prev => ({
      ...prev,
      scale: newScale
    }));
    
    onZoom?.(newScale, center);
  }, [enableZoom, transform.scale, minZoom, maxZoom, onZoom]);

  const gestureState = useTouchGestures(canvasRef.current, {
    onTap: handleTouchTap,
    onPan: handleTouchPan,
    onPinch: handleTouchPinch,
    onTouchStart: () => setIsInteracting(true),
    onTouchEnd: () => setIsInteracting(false)
  }, {
    swipeThreshold: 30,
    tapThreshold: 10,
    pinchThreshold: 0.1,
    preventDefault: true
  });

  const handleZoomIn = () => {
    const newScale = Math.min(maxZoom, transform.scale * 1.2);
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleZoomOut = () => {
    const newScale = Math.max(minZoom, transform.scale / 1.2);
    setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleReset = () => {
    setTransform({
      scale: initialZoom,
      translateX: 0,
      translateY: 0,
      rotation: 0
    });
  };

  const transformStyle = {
    transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
    transformOrigin: 'center',
    transition: isInteracting ? 'none' : 'transform 0.2s ease-out'
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Touch Controls for Mobile */}
      {isMobile && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomIn}
            className="p-2 shadow-lg"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            className="p-2 shadow-lg"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleReset}
            className="p-2 shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Gesture Status Indicator */}
      {isMobile && gestureState.isActive && (
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="secondary" className="shadow-lg">
            {gestureState.gestureType === 'pinch' && <span>🤏 Pinch</span>}
            {gestureState.gestureType === 'pan' && <span><Move className="w-3 h-3 inline mr-1" />Pan</span>}
            {gestureState.gestureType === 'tap' && <span>👆 Tap</span>}
          </Badge>
        </div>
      )}

      {/* Zoom Level Indicator */}
      {isMobile && (
        <div className="absolute bottom-4 left-4 z-10">
          <Badge variant="outline" className="shadow-lg">
            {(transform.scale * 100).toFixed(0)}%
          </Badge>
        </div>
      )}

      {/* Canvas Content */}
      <div
        ref={canvasRef}
        className="w-full h-full touch-none select-none"
        style={{
          cursor: gestureState.isActive ? 'grabbing' : 'grab'
        }}
      >
        <div style={transformStyle}>
          {children}
        </div>
      </div>

      {/* Touch Gesture Help */}
      {isMobile && touchSupport && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 opacity-70"
            onClick={() => {
              // Show touch gesture help
              alert(`Touch Gestures:
• Tap: Select
• Double Tap: Zoom
• Pinch: Zoom in/out
• Pan: Move around
• Long Press: Context menu`);
            }}
          >
            <Hand className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// Hook for canvas transformations
export function useCanvasTransform(initialScale = 1) {
  const [transform, setTransform] = useState({
    scale: initialScale,
    translateX: 0,
    translateY: 0
  });

  const zoomTo = useCallback((scale: number, center?: { x: number; y: number }) => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.1, Math.min(5, scale))
    }));
  }, []);

  const panTo = useCallback((x: number, y: number) => {
    setTransform(prev => ({
      ...prev,
      translateX: x,
      translateY: y
    }));
  }, []);

  const reset = useCallback(() => {
    setTransform({
      scale: initialScale,
      translateX: 0,
      translateY: 0
    });
  }, [initialScale]);

  return {
    transform,
    zoomTo,
    panTo,
    reset,
    transformStyle: {
      transform: `translate(${transform.translateX}px, ${transform.translateY}px) scale(${transform.scale})`,
      transformOrigin: 'center'
    }
  };
}
