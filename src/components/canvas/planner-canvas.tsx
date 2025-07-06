
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

  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) setContainerRect(containerRef.current.getBoundingClientRect());
    };
    updateRect();
    const resizeObserver = new ResizeObserver(updateRect);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  
  useEffect(() => {
    if (containerRect && bgImage) {
      const hRatio = containerRect.width / bgImage.width;
      const vRatio = containerRect.height / bgImage.height;
      const scale = Math.min(hRatio, vRatio);
      const offsetX = (containerRect.width - bgImage.width * scale) / 2;
      const offsetY = (containerRect.height - bgImage.height * scale) / 2;
      setImageTransform({ scale, offsetX, offsetY });
    } else if (containerRect) {
      setImageTransform({ scale: 1, offsetX: 0, offsetY: 0 });
    }
  }, [bgImage, containerRect]);

  const getRelativeCoords = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!containerRect) return null;
    return {
      x: (e.clientX - containerRect.left) / containerRect.width,
      y: (e.clientY - containerRect.top) / containerRect.height,
    };
  }, [containerRect]);

  const canvasToImageCoords = useCallback((canvasPos: { x: number, y: number }) => {
    const { scale, offsetX, offsetY } = imageTransform;
    if (!containerRect) return { x: 0, y: 0 };
    const imageWidth = (bgImage?.width ?? containerRect.width) * scale;
    const imageHeight = (bgImage?.height ?? containerRect.height) * scale;
    const imgX = (canvasPos.x * containerRect.width - offsetX) / imageWidth;
    const imgY = (canvasPos.y * containerRect.height - offsetY) / imageHeight;
    return { x: imgX, y: imgY };
  }, [containerRect, imageTransform, bgImage]);

  const imageToCanvasCoords = useCallback((imagePos: { x: number, y: number }) => {
    const { scale, offsetX, offsetY } = imageTransform;
    if (!containerRect) return { x: 0, y: 0 };
    const imageWidth = (bgImage?.width ?? containerRect.width) * scale;
    const imageHeight = (bgImage?.height ?? containerRect.height) * scale;
    const canvasX = (imagePos.x * imageWidth) + offsetX;
    const canvasY = (imagePos.y * imageHeight) + offsetY;
    return { x: canvasX, y: canvasY };
  }, [containerRect, imageTransform, bgImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !containerRect) return;

    const computedStyle = getComputedStyle(canvasRef.current!);
    const accentHsl = computedStyle.getPropertyValue('--accent').trim() || '221 83% 53%';
    
    const draw = () => {
        ctx.clearRect(0, 0, containerRect.width, containerRect.height);

        if (bgImage) {
            ctx.drawImage(bgImage, imageTransform.offsetX, imageTransform.offsetY, bgImage.width * imageTransform.scale, bgImage.height * imageTransform.scale);
        }
        
        if (floor.connections) {
            floor.connections.forEach(conn => {
                const fromDevice = floor.devices.find(d => d.id === conn.fromDeviceId);
                const toDevice = floor.devices.find(d => d.id === conn.toDeviceId);
                if (!fromDevice || !toDevice) return;

                const path = new Path2D();
                let pointsToDraw: Point[];

                // If an AI path exists, use it. Otherwise, create a direct line.
                if (conn.path && conn.path.length >= 2) {
                    pointsToDraw = conn.path;
                } else {
                    const startPoint: Point = { x: fromDevice.x, y: fromDevice.y };
                    const endPoint: Point = { x: toDevice.x, y: toDevice.y };
                    pointsToDraw = [startPoint, endPoint];
                }

                if (pointsToDraw.length < 2) return;

                const canvasPoints = pointsToDraw.map(p => imageToCanvasCoords(p));
                
                path.moveTo(canvasPoints[0].x, canvasPoints[0].y);
                for (let i = 1; i < canvasPoints.length; i++) {
                    path.lineTo(canvasPoints[i].x, canvasPoints[i].y);
                }

                // Render the path on the canvas with a single, thin, animated line
                ctx.lineCap = 'round';
                ctx.strokeStyle = `hsl(${accentHsl})`;
                ctx.lineWidth = 1; 
                ctx.setLineDash([4, 4]); 
                ctx.lineDashOffset = -lineDashOffset.current;
                ctx.stroke(path);
            });
        }
        
        ctx.setLineDash([]);
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
  }, [floor, containerRect, bgImage, imageTransform, imageToCanvasCoords]);

  const handleDevicePointerDown = (e: React.PointerEvent, device: AnyDevice) => {
    e.stopPropagation();
    onDeviceClick(device);
    if (!cablingMode.enabled) {
      setDraggingDevice(device);
      const canvasPos = getRelativeCoords(e);
      if (canvasPos) {
        const imagePos = canvasToImageCoords(canvasPos);
        dragOffset.current = { x: device.x - imagePos.x, y: device.y - imagePos.y };
      }
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const canvasPos = getRelativeCoords(e);
    if (!canvasPos) return;

    if (draggingDevice) {
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
      
      <div className="absolute inset-0">
           <div style={{
                position: 'absolute',
                left: `${imageTransform.offsetX}px`,
                top: `${imageTransform.offsetY}px`,
                width: `${(bgImage?.width ?? containerRect?.width ?? 0) * imageTransform.scale}px`,
                height: `${(bgImage?.height ?? containerRect?.height ?? 0) * imageTransform.scale}px`,
            }}>
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
    </div>
  );
}
