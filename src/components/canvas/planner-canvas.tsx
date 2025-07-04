
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Floor, AnyDevice, Connection, ArchitecturalElement, Point, CablingMode, ArchitecturalElementType } from '@/lib/types';

// Constants
const ICON_SIZE = 32;

// Props definition
interface PlannerCanvasProps {
  floor: Floor;
  selectedDevice: AnyDevice | null;
  onSelectDevice: (device: AnyDevice | null) => void;
  onUpdateDevice: (device: AnyDevice) => void;
  onCanvasClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  cablingMode: CablingMode;
  onSetCablingMode: (mode: CablingMode) => void;
  onAddConnection: (connection: Connection) => void;
  selectedArchTool: ArchitecturalElementType | null;
  drawingState: { isDrawing: boolean; startPoint: Point | null };
  onSetDrawingState: (state: { isDrawing: boolean; startPoint: Point | null }) => void;
  onAddArchElement: (element: ArchitecturalElement) => void;
  onUpdateFloorPlanRect: (rect: any) => void;
}

export function PlannerCanvas({
  floor,
  selectedDevice,
  cablingMode,
  onCanvasClick,
}: PlannerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [floorPlanImage, setFloorPlanImage] = useState<HTMLImageElement | null>(null);
  const [floorPlanRect, setFloorPlanRect] = useState<DOMRect | null>(null);

  // Load floor plan image
  useEffect(() => {
    if (floor.floorPlanUrl) {
      const img = new Image();
      img.src = floor.floorPlanUrl;
      img.onload = () => setFloorPlanImage(img);
    } else {
      setFloorPlanImage(null);
    }
  }, [floor.floorPlanUrl]);

  const getAbsoluteCoords = useCallback((device: { x: number; y: number }, planRect: DOMRect): Point | null => {
    if (!planRect) return null;
    return {
      x: planRect.x + device.x * planRect.width,
      y: planRect.y + device.y * planRect.height,
    };
  }, []);

  const drawDevice = useCallback((ctx: CanvasRenderingContext2D, device: AnyDevice, planRect: DOMRect) => {
    const coords = getAbsoluteCoords(device, planRect);
    if (!coords) return;
    const { x, y } = coords;

    const isSelected = selectedDevice?.id === device.id;
    const isCablingStart = cablingMode.enabled && cablingMode.fromDeviceId === device.id;

    ctx.save();

    if (isCablingStart) {
      const pulseRadius = (ICON_SIZE / 2 + 5) * (1 + Math.sin(Date.now() / 300) * 0.1);
      ctx.fillStyle = 'hsla(var(--destructive), 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isSelected) {
      ctx.fillStyle = 'hsla(var(--accent), 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, ICON_SIZE / 2 + 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.beginPath();
    ctx.arc(x, y, ICON_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${ICON_SIZE / 2}px sans-serif`;
    ctx.fillText(device.type?.substring(0, 2).toUpperCase() || '?', x, y);

    ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = '12px Sarabun';
    ctx.fillText(device.label, x, y + ICON_SIZE / 2 + 12);

    ctx.restore();
  }, [getAbsoluteCoords, selectedDevice, cablingMode]);
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !floorPlanRect) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (floorPlanImage) {
      ctx.drawImage(floorPlanImage, floorPlanRect.x, floorPlanRect.y, floorPlanRect.width, floorPlanRect.height);
    } else {
      ctx.fillStyle = 'hsl(var(--card))';
      ctx.fillRect(floorPlanRect.x, floorPlanRect.y, floorPlanRect.width, floorPlanRect.height);
      ctx.strokeStyle = 'hsl(var(--border))';
      ctx.strokeRect(floorPlanRect.x, floorPlanRect.y, floorPlanRect.width, floorPlanRect.height);
    }
    
    floor.devices?.forEach(d => drawDevice(ctx, d, floorPlanRect));
  }, [floor.devices, floorPlanImage, floorPlanRect, drawDevice]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!container || !canvas) return;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && canvasRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        const size = Math.min(width, height) * 0.9;
        setFloorPlanRect(new DOMRect((width - size) / 2, (height - size) / 2, size, size));
      }
    });
    resizeObserver.observe(container);

    let animationFrameId: number;
    const render = () => {
      draw();
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();
    
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [draw]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-muted/20"
      onClick={onCanvasClick}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
