
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Floor, AnyDevice, Point, Connection, ArchitecturalElement, ArchitecturalElementType } from '@/lib/types';
import { useSelection } from '@/contexts/SelectionContext';
import { DeviceRenderer } from './device-renderer';

interface PlannerCanvasProps {
  floor: Floor;
  onUpdateDevice: (device: AnyDevice) => void;
  floorPlanImage: HTMLImageElement | null;
}

export function PlannerCanvas({
  floor,
  onUpdateDevice,
  floorPlanImage,
}: PlannerCanvasProps) {
  const { setSelectedItem } = useSelection();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [draggingDevice, setDraggingDevice] = useState<AnyDevice | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

  const getRelativeCoords = useCallback((absPoint: Point): Point | null => {
    if (!containerRect) return null;
    const parentRect = containerRef.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (absPoint.x - parentRect.left) / containerRect.width)),
      y: Math.max(0, Math.min(1, (absPoint.y - parentRect.top) / containerRect.height)),
    };
  }, [containerRect]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const container = containerRef.current;

    if (!ctx || !canvas || !container) return;

    const { width, height } = container.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    if (floorPlanImage) {
      const canvasAspect = width / height;
      const imageAspect = floorPlanImage.width / floorPlanImage.height;
      let drawWidth, drawHeight, x, y;

      if (canvasAspect > imageAspect) {
        drawHeight = height;
        drawWidth = drawHeight * imageAspect;
        x = (width - drawWidth) / 2;
        y = 0;
      } else {
        drawWidth = width;
        drawHeight = drawWidth / imageAspect;
        x = 0;
        y = (height - drawHeight) / 2;
      }
      ctx.drawImage(floorPlanImage, x, y, drawWidth, drawHeight);
    } else {
      ctx.strokeStyle = `hsl(var(--border))`;
      ctx.strokeRect(0, 0, width, height);
    }

    // Draw connections
    floor.connections?.forEach(conn => {
      const fromDevice = floor.devices.find(d => d.id === conn.fromDeviceId);
      const toDevice = floor.devices.find(d => d.id === conn.toDeviceId);
      if (!fromDevice || !toDevice) return;

      const start = {
        x: fromDevice.x * width,
        y: fromDevice.y * height
      };
      const end = {
        x: toDevice.x * width,
        y: toDevice.y * height
      };

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = `hsl(var(--accent))`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [floor.connections, floor.devices, floorPlanImage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setContainerRect(entry.contentRect);
        draw();
      }
    });

    resizeObserver.observe(container);
    setContainerRect(container.getBoundingClientRect());
    draw();

    return () => resizeObserver.disconnect();
  }, [draw]);

  const handleDeviceDown = (e: React.PointerEvent, device: AnyDevice) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    (e.target as HTMLElement).style.cursor = 'grabbing';

    setSelectedItem(device);
    setDraggingDevice(device);

    const deviceAbsX = device.x * containerRect!.width;
    const deviceAbsY = device.y * containerRect!.height;
    
    const parentRect = containerRef.current!.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - parentRect.left - deviceAbsX,
      y: e.clientY - parentRect.top - deviceAbsY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (draggingDevice && containerRect) {
      e.preventDefault();

      const newAbsPos = {
        x: e.clientX,
        y: e.clientY,
      };

      const newRelPos = getRelativeCoords(newAbsPos);

      if (newRelPos) {
        onUpdateDevice({ ...draggingDevice, x: newRelPos.x, y: newRelPos.y });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingDevice) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      (e.target as HTMLElement).style.cursor = 'grab';
      setDraggingDevice(null);
    }
  };

  const handleContainerDown = (e: React.PointerEvent) => {
    if (e.target === containerRef.current || e.target === canvasRef.current) {
      setSelectedItem(null);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-card overflow-hidden"
      onPointerDown={handleContainerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 z-10 pointer-events-none">
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
