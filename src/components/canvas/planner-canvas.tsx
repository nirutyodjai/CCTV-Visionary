
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Floor, AnyDevice, ArchitecturalElement, Point } from '@/lib/types';
import { DeviceRenderer } from './device-renderer';
import { ArchitecturalElementRenderer } from './architectural-element-renderer';

interface ImageTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

interface PlannerCanvasProps {
  floor: Floor;
  cablingMode: { enabled: boolean; fromDeviceId: string | null };
  onDeviceClick: (device: AnyDevice) => void;
  onArchElementClick: (element: ArchitecturalElement) => void;
  onCanvasClick: () => void;
  onDeviceMove: (deviceId: string, pos: { x: number; y: number }) => void;
}

export function PlannerCanvas({
  floor,
  cablingMode,
  onDeviceClick,
  onArchElementClick,
  onCanvasClick,
  onDeviceMove,
}: PlannerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const lineDashOffset = useRef(0);
  
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [imageTransform, setImageTransform] = useState<ImageTransform>({ scale: 1, offsetX: 0, offsetY: 0 });

  const [draggingDevice, setDraggingDevice] = useState<AnyDevice | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load background image
  useEffect(() => {
    if (floor.floorPlanUrl) {
      const img = new Image();
      img.src = floor.floorPlanUrl;
      img.onload = () => setBgImage(img);
      img.onerror = () => setBgImage(null);
    } else {
      setBgImage(null);
    }
  }, [floor.floorPlanUrl]);

  // Update container size on resize
  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) setContainerRect(containerRef.current.getBoundingClientRect());
    };
    updateRect();
    const resizeObserver = new ResizeObserver(updateRect);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  
  // Calculate image transform to fit container
  useEffect(() => {
    if (containerRect && bgImage) {
      const hRatio = containerRect.width / bgImage.width;
      const vRatio = containerRect.height / bgImage.height;
      const scale = Math.min(hRatio, vRatio);
      const offsetX = (containerRect.width - bgImage.width * scale) / 2;
      const offsetY = (containerRect.height - bgImage.height * scale) / 2;
      setImageTransform({ scale, offsetX, offsetY });
    } else if (containerRect) {
      // No image, fill container
      setImageTransform({ scale: 1, offsetX: 0, offsetY: 0 });
    }
  }, [bgImage, containerRect]);

  // Coordinate conversion: from canvas space to image space (for drag calculations)
  const canvasToImageCoords = useCallback((canvasPos: { x: number, y: number }) => {
    const { scale, offsetX, offsetY } = imageTransform;
    if (!containerRect) return { x: 0, y: 0 };
    
    const imageWidth = (bgImage?.width ?? containerRect.width) * scale;
    const imageHeight = (bgImage?.height ?? containerRect.height) * scale;

    const canvasPixelX = canvasPos.x * containerRect.width;
    const canvasPixelY = canvasPos.y * containerRect.height;
    
    const imgX = (canvasPixelX - offsetX) / imageWidth;
    const imgY = (canvasPixelY - offsetY) / imageHeight;
    
    return { x: imgX, y: imgY };
  }, [containerRect, imageTransform, bgImage]);

  // Main drawing logic on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !containerRect) return;

    const accentHsl = getComputedStyle(canvasRef.current!).getPropertyValue('--accent').trim() || '221 83% 53%';
    
    const draw = () => {
        ctx.clearRect(0, 0, containerRect.width, containerRect.height);

        // Apply the same transform to the canvas as the device layer
        ctx.save();
        ctx.translate(imageTransform.offsetX, imageTransform.offsetY);
        ctx.scale(imageTransform.scale, imageTransform.scale);

        const virtualWidth = bgImage?.width ?? containerRect.width;
        const virtualHeight = bgImage?.height ?? containerRect.height;

        if (bgImage) {
            ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height);
        }
        
        if (floor.connections) {
            floor.connections.forEach(conn => {
                const fromDevice = floor.devices.find(d => d.id === conn.fromDeviceId);
                const toDevice = floor.devices.find(d => d.id === conn.toDeviceId);
                if (!fromDevice || !toDevice) return;

                const path = new Path2D();
                
                const pointsToDraw = conn.path && conn.path.length >= 2
                    ? conn.path
                    : [{ x: fromDevice.x, y: fromDevice.y }, { x: toDevice.x, y: toDevice.y }];

                if (pointsToDraw.length < 2) return;

                const virtualPoints = pointsToDraw.map(p => ({
                    x: p.x * virtualWidth,
                    y: p.y * virtualHeight,
                }));
                
                path.moveTo(virtualPoints[0].x, virtualPoints[0].y);
                for (let i = 1; i < virtualPoints.length; i++) {
                    path.lineTo(virtualPoints[i].x, virtualPoints[i].y);
                }

                ctx.strokeStyle = `hsl(${accentHsl})`;
                ctx.lineWidth = 1 / imageTransform.scale; 
                ctx.setLineDash([4 / imageTransform.scale, 4 / imageTransform.scale]);
                ctx.lineDashOffset = -lineDashOffset.current;
                ctx.stroke(path);
            });
        }
        
        ctx.restore();
    }

    const animate = () => {
        lineDashOffset.current += 0.1;
        draw();
        animationFrameId.current = requestAnimationFrame(animate);
    };
    animationFrameId.current = requestAnimationFrame(animate);
    
    return () => {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [floor, containerRect, bgImage, imageTransform]);

  const getRelativeCanvasCoords = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!containerRect) return null;
    return {
      x: (e.clientX - containerRect.left) / containerRect.width,
      y: (e.clientY - containerRect.top) / containerRect.height,
    };
  }, [containerRect]);

  const handleDevicePointerDown = (e: React.PointerEvent, device: AnyDevice) => {
    e.stopPropagation();
    onDeviceClick(device);
    if (!cablingMode.enabled) {
      setDraggingDevice(device);
      const canvasPos = getRelativeCanvasCoords(e);
      if (canvasPos) {
        const imagePos = canvasToImageCoords(canvasPos);
        dragOffset.current = { x: device.x - imagePos.x, y: device.y - imagePos.y };
      }
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingDevice) {
        const canvasPos = getRelativeCanvasCoords(e);
        if (!canvasPos) return;
        const imagePos = canvasToImageCoords(canvasPos);
        const finalPos = {
            x: Math.max(0, Math.min(1, imagePos.x + dragOffset.current.x)),
            y: Math.max(0, Math.min(1, imagePos.y + dragOffset.current.y)),
        }
        onDeviceMove(draggingDevice.id, finalPos);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingDevice) {
      setDraggingDevice(null);
    }
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };
  
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if(e.target === e.currentTarget) onCanvasClick();
  }

  // The style for the device/element layer, which is transformed to match the canvas drawing
  const elementLayerStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${imageTransform.offsetX}px`,
      top: `${imageTransform.offsetY}px`,
      width: `${(bgImage?.width ?? containerRect?.width ?? 0) * imageTransform.scale}px`,
      height: `${(bgImage?.height ?? containerRect?.height ?? 0) * imageTransform.scale}px`,
      // This layer itself shouldn't capture pointer events, but its children (the devices) should.
      pointerEvents: 'none', 
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-muted/20 overflow-hidden touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerDown={handleCanvasPointerDown}
      style={{ 
        cursor: draggingDevice ? 'grabbing' : (cablingMode.enabled ? 'crosshair' : 'default') 
      }}
    >
      <canvas
        ref={canvasRef}
        width={containerRect?.width || 0}
        height={containerRect?.height || 0}
        className="absolute inset-0"
      />
      
      {/* This div contains all visual elements and is transformed to match the canvas's transformed drawing context. */}
      <div style={elementLayerStyle}>
            {floor.architecturalElements.map(element => (
              <ArchitecturalElementRenderer
                key={element.id}
                element={element}
              />
            ))}
            {floor.devices.map(device => (
              <DeviceRenderer
                key={device.id}
                device={device}
                onDevicePointerDown={handleDevicePointerDown}
              />
            ))}
      </div>
    </div>
  );
}
