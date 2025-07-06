
'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import type { Floor, AnyDevice, ArchitecturalElement } from '@/lib/types';
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

  // Use integer dimensions for all calculations to prevent sub-pixel layout mismatches
  const { intWidth, intHeight } = useMemo(() => {
    if (!containerRect) return { intWidth: 0, intHeight: 0 };
    return {
      intWidth: Math.floor(containerRect.width),
      intHeight: Math.floor(containerRect.height),
    };
  }, [containerRect]);
  
  // Calculate image transform to fit container
  useEffect(() => {
    if (intWidth > 0 && intHeight > 0 && bgImage) {
      const hRatio = intWidth / bgImage.width;
      const vRatio = intHeight / bgImage.height;
      const scale = Math.min(hRatio, vRatio);
      const offsetX = (intWidth - bgImage.width * scale) / 2;
      const offsetY = (intHeight - bgImage.height * scale) / 2;
      setImageTransform({ scale, offsetX, offsetY });
    } else if (intWidth > 0) {
      // No image, fill container
      setImageTransform({ scale: 1, offsetX: 0, offsetY: 0 });
    }
  }, [bgImage, intWidth, intHeight]); // Depend on integer dimensions
  
  // The virtual space is the original image dimensions, or the container's integer dimensions
  const virtualWidth = bgImage?.width ?? intWidth ?? 0;
  const virtualHeight = bgImage?.height ?? intHeight ?? 0;

  // Main drawing logic on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !virtualWidth || !virtualHeight) return;

    if (canvas.width !== virtualWidth) canvas.width = virtualWidth;
    if (canvas.height !== virtualHeight) canvas.height = virtualHeight;

    const accentHsl = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '215 89% 52%';
    
    const draw = () => {
        ctx.clearRect(0, 0, virtualWidth, virtualHeight);

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
                ctx.lineWidth = 1; // Make line width thin and consistent
                ctx.setLineDash([4, 4]);
                ctx.lineDashOffset = -lineDashOffset.current;
                ctx.stroke(path);
            });
        }
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
  }, [floor, bgImage, virtualWidth, virtualHeight]); // Now only depends on what's needed for drawing

  const getCoordsInVirtualSpace = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!containerRect) return null;
    const { scale, offsetX, offsetY } = imageTransform;

    const viewX = e.clientX - containerRect.left;
    const viewY = e.clientY - containerRect.top;

    const virtualX = (viewX - offsetX) / scale;
    const virtualY = (viewY - offsetY) / scale;

    return { x: virtualX / virtualWidth, y: virtualY / virtualHeight };
  }, [containerRect, imageTransform, virtualWidth, virtualHeight]);

  const handleDevicePointerDown = (e: React.PointerEvent, device: AnyDevice) => {
    e.stopPropagation();
    onDeviceClick(device);
    if (!cablingMode.enabled) {
      setDraggingDevice(device);
      const virtualPos = getCoordsInVirtualSpace(e);
      if (virtualPos) {
        dragOffset.current = { x: device.x - virtualPos.x, y: device.y - virtualPos.y };
      }
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingDevice) {
        const virtualPos = getCoordsInVirtualSpace(e);
        if (!virtualPos) return;
        const finalPos = {
            x: Math.max(0, Math.min(1, virtualPos.x + dragOffset.current.x)),
            y: Math.max(0, Math.min(1, virtualPos.y + dragOffset.current.y)),
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

  // The transform layer uses the calculated transform and dimensions
  const transformLayerStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${imageTransform.offsetX}px`,
      top: `${imageTransform.offsetY}px`,
      width: `${virtualWidth}px`,
      height: `${virtualHeight}px`,
      transform: `scale(${imageTransform.scale})`,
      transformOrigin: 'top left',
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
        {intWidth > 0 && intHeight > 0 && (
            <div style={transformLayerStyle}>
                <canvas
                    ref={canvasRef}
                    width={virtualWidth}
                    height={virtualHeight}
                    className="absolute inset-0"
                />
                
                <div className="absolute inset-0 pointer-events-none">
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
                        virtualWidth={virtualWidth}
                        virtualHeight={virtualHeight}
                    />
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}
