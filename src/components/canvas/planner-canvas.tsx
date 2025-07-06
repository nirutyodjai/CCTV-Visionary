
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
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

  // **THE FIX: Re-introducing the missing helper function**
  const getRelativeCoords = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!containerRect) return null;
    // This gives the pointer position as a percentage of the container div (0 to 1)
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

    const draw = (time: number) => {
        ctx.clearRect(0, 0, containerRect.width, containerRect.height);

        if (bgImage) {
            ctx.drawImage(bgImage, imageTransform.offsetX, imageTransform.offsetY, bgImage.width * imageTransform.scale, bgImage.height * imageTransform.scale);
        }
        
        if(floor.connections) {
            const pulsingOpacity = 0.3 + (Math.sin(time / 500) + 1) / 4; 
            floor.connections.forEach(conn => {
                const fromDevice = floor.devices.find(d => d.id === conn.fromDeviceId);
                const toDevice = floor.devices.find(d => d.id === conn.toDeviceId);
                if (!fromDevice || !toDevice) return;

                const start = imageToCanvasCoords({ x: fromDevice.x, y: fromDevice.y });
                
                const path = new Path2D();
                path.moveTo(start.x, start.y);

                const isAiPath = conn.path && conn.path.length >= 2;
                if (isAiPath) {
                    conn.path!.slice(1).forEach(p => {
                        const absP = imageToCanvasCoords(p);
                        if(absP) path.lineTo(absP.x, absP.y)
                    });
                } else {
                    const end = imageToCanvasCoords({ x: toDevice.x, y: toDevice.y });
                    if(end) path.lineTo(end.x, end.y);
                }

                ctx.lineCap = 'round';
                ctx.strokeStyle = `hsla(${accentHsl}, ${pulsingOpacity})`;
                ctx.lineWidth = isAiPath ? 7 : 5;
                ctx.setLineDash([]);
                ctx.stroke(path);

                ctx.strokeStyle = `hsl(${accentHsl})`;
                ctx.lineWidth = isAiPath ? 2.5 : 1.5;
                ctx.setLineDash(isAiPath ? [8, 8] : [4, 6]);
                ctx.lineDashOffset = -lineDashOffset.current;
                ctx.stroke(path);
            });
        }
        ctx.setLineDash([]);
    }

    const animate = (time: number) => {
        lineDashOffset.current += 0.25;
        draw(time);
        animationFrameId.current = requestAnimationFrame(animate);
    };
    animationFrameId.current = requestAnimationFrame(animate);
    return () => {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [floor, containerRect, bgImage, imageTransform, imageToCanvasCoords]);

  const handleDevicePointerDown = (e: React.PointerEvent, device: AnyDevice) => {
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
    if (draggingDevice) {
      const canvasPos = getRelativeCoords(e);
      if (canvasPos) {
        const imagePos = canvasToImageCoords(canvasPos);
        const finalPos = {
            x: Math.max(0, Math.min(1, imagePos.x + dragOffset.current.x)),
            y: Math.max(0, Math.min(1, imagePos.y + dragOffset.current.y)),
        }
        onDeviceMove(draggingDevice.id, finalPos);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingDevice) {
      setDraggingDevice(null);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
      }
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
      style={{ cursor: draggingDevice ? 'grabbing' : (cablingMode.enabled ? 'crosshair' : 'default') }}
    >
      <canvas
        ref={canvasRef}
        width={containerRect?.width || 0}
        height={containerRect?.height || 0}
        className="absolute inset-0 pointer-events-none"
      />
      
      <div className="absolute inset-0 pointer-events-none">
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
