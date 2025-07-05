'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Floor, AnyDevice, ArchitecturalElement } from '@/lib/types';
import { DeviceRenderer } from './device-renderer';

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
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  const [draggingDevice, setDraggingDevice] = useState<AnyDevice | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update container rect on resize
  useEffect(() => {
    const updateRect = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect());
      }
    };
    updateRect();
    const resizeObserver = new ResizeObserver(updateRect);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  const getRelativeCoords = useCallback((e: React.PointerEvent) => {
    if (!containerRect) return null;
    return {
      x: (e.clientX - containerRect.left) / containerRect.width,
      y: (e.clientY - containerRect.top) / containerRect.height,
    };
  }, [containerRect]);

  const getAbsoluteCoords = useCallback((relativePos: { x: number; y: number }) => {
    if (!containerRect) return null;
    return {
      x: relativePos.x * containerRect.width,
      y: relativePos.y * containerRect.height,
    };
  }, [containerRect]);

    const drawConnections = useCallback((ctx: CanvasRenderingContext2D) => {
        if (!floor.connections) return;
        floor.connections.forEach(conn => {
            const fromDevice = floor.devices.find(d => d.id === conn.fromDeviceId);
            const toDevice = floor.devices.find(d => d.id === conn.toDeviceId);
            if (!fromDevice || !toDevice) return;

            ctx.beginPath();
            
            if (!conn.path || conn.path.length < 2) {
                // Fallback to a straight line
                const start = getAbsoluteCoords({ x: fromDevice.x, y: fromDevice.y });
                const end = getAbsoluteCoords({ x: toDevice.x, y: toDevice.y });
                if (start && end) {
                    ctx.moveTo(start.x, start.y);
                    ctx.lineTo(end.x, end.y);
                    ctx.strokeStyle = 'hsl(var(--accent) / 0.5)';
                    ctx.setLineDash([5, 5]);
                    ctx.lineWidth = 1.5;
                }
            } else {
                // Draw the AI-generated path
                const startPoint = getAbsoluteCoords(conn.path[0]);
                if (!startPoint) return;
                ctx.moveTo(startPoint.x, startPoint.y);

                for (let i = 1; i < conn.path.length; i++) {
                    const point = getAbsoluteCoords(conn.path[i]);
                    if (point) ctx.lineTo(point.x, point.y);
                }
                ctx.strokeStyle = 'hsl(var(--accent))';
                ctx.setLineDash([]);
                ctx.lineWidth = 2;
            }
            
            ctx.stroke();
            ctx.setLineDash([]); // Reset for next loop
        });
    }, [floor.connections, floor.devices, getAbsoluteCoords]);


  // Main drawing logic
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !containerRect) return;

    ctx.clearRect(0, 0, containerRect.width, containerRect.height);

    if (floor.floorPlanUrl) {
      const img = new Image();
      img.src = floor.floorPlanUrl;
      img.onload = () => {
        const hRatio = containerRect.width / img.width;
        const vRatio = containerRect.height / img.height;
        const ratio = Math.min(hRatio, vRatio);
        const centerShiftX = (containerRect.width - img.width * ratio) / 2;
        const centerShiftY = (containerRect.height - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
        drawConnections(ctx);
      };
      img.onerror = () => {
          drawConnections(ctx); // Draw connections even if image fails
      }
    } else {
        drawConnections(ctx);
    }
  }, [floor.floorPlanUrl, floor.connections, containerRect, drawConnections]);


  const handleDeviceDown = (e: React.PointerEvent, device: AnyDevice) => {
    e.stopPropagation();
    onDeviceClick(device);

    if (!cablingMode.enabled) {
      setDraggingDevice(device);
      const relativePos = getRelativeCoords(e);
      if (relativePos) {
        dragOffset.current = {
          x: device.x - relativePos.x,
          y: device.y - relativePos.y,
        };
      }
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingDevice) {
      const newPos = getRelativeCoords(e);
      if (newPos) {
        const finalPos = {
            x: Math.max(0, Math.min(1, newPos.x + dragOffset.current.x)),
            y: Math.max(0, Math.min(1, newPos.y + dragOffset.current.y)),
        }
        onDeviceMove(draggingDevice.id, finalPos);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingDevice) {
      setDraggingDevice(null);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleCanvasClick = (e: React.PointerEvent) => {
    if(e.target === e.currentTarget){
        onCanvasClick();
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-card overflow-hidden touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerDown={handleCanvasClick}
      style={{ cursor: cablingMode.enabled ? 'crosshair' : 'default' }}
    >
      <canvas
        ref={canvasRef}
        width={containerRect?.width || 0}
        height={containerRect?.height || 0}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 pointer-events-none">
        {floor.devices.map(device => (
          <DeviceRenderer
            key={device.id}
            device={device}
            onDeviceDown={handleDeviceDown}
            containerRect={containerRect}
          />
        ))}
      </div>
    </div>
  );
}
