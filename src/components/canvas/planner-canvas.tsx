
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Floor, AnyDevice, Connection, ArchitecturalElement, Point, CablingMode, ArchitecturalElementType, CameraDevice } from '@/lib/types';
import { useSelection } from '@/contexts/SelectionContext';

const ICON_SIZE = 28;

interface PlannerCanvasProps {
  floor: Floor;
  onUpdateDevice: (device: AnyDevice) => void;
  cablingMode: CablingMode;
  onSetCablingMode: (mode: CablingMode) => void;
  onAddConnection: (connection: Connection) => void;
  selectedArchTool: ArchitecturalElementType | null;
  drawingState: { isDrawing: boolean; startPoint: Point | null };
  onSetDrawingState: (state: { isDrawing: boolean; startPoint: Point | null }) => void;
  onAddArchElement: (element: ArchitecturalElement) => void;
  onUpdateArchElement: (element: ArchitecturalElement) => void;
  floorPlanRect: DOMRect | null;
  onUpdateFloorPlanRect: (rect: DOMRect) => void;
}

export function PlannerCanvas({
  floor, onUpdateDevice, cablingMode, onSetCablingMode, onAddConnection, floorPlanRect, onUpdateFloorPlanRect
}: PlannerCanvasProps) {
  const { selectedItem, setSelectedItem } = useSelection();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingDevice, setDraggingDevice] = useState<AnyDevice | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // This effect calculates the floor plan's position and size on the canvas
  useEffect(() => {
    // If a rect is already calculated and passed in, don't do anything.
    if (floorPlanRect) return;

    const container = containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    if (width > 0 && height > 0) {
      // No floor plan image, use the full container as the rect with padding
      const padding = 40;
      onUpdateFloorPlanRect(new DOMRect(padding, padding, width - padding * 2, height - padding * 2));
    }
  }, [floorPlanRect, onUpdateFloorPlanRect]);

  const getAbsoluteCoords = useCallback((relPoint: Point): Point | null => {
    if (!floorPlanRect) return null;
    return {
      x: floorPlanRect.x + relPoint.x * floorPlanRect.width,
      y: floorPlanRect.y + relPoint.y * floorPlanRect.height,
    };
  }, [floorPlanRect]);
  
  const getRelativeCoords = useCallback((absPoint: Point): Point | null => {
    if (!floorPlanRect) return null;
    return {
      x: Math.max(0, Math.min(1, (absPoint.x - floorPlanRect.x) / floorPlanRect.width)),
      y: Math.max(0, Math.min(1, (absPoint.y - floorPlanRect.y) / floorPlanRect.height)),
    };
  }, [floorPlanRect]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !floorPlanRect) return; // Guard clause
    
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    ctx.clearRect(0, 0, width, height);

    // Draw floor plan rect border
    ctx.strokeStyle = `hsl(var(--border))`;
    ctx.strokeRect(floorPlanRect.x, floorPlanRect.y, floorPlanRect.width, floorPlanRect.height);

    // Draw connections
    floor.connections?.forEach(conn => {
        const fromDevice = floor.devices.find(d => d.id === conn.fromDeviceId);
        const toDevice = floor.devices.find(d => d.id === conn.toDeviceId);
        if (!fromDevice || !toDevice) return;
        const start = getAbsoluteCoords(fromDevice);
        const end = getAbsoluteCoords(toDevice);
        if (!start || !end) return;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.strokeStyle = `hsla(var(--accent-hsl), 0.5)`;
        ctx.lineWidth = 2;
        ctx.stroke();
    });
    
    // Draw devices
    floor.devices?.forEach(device => {
        const coords = getAbsoluteCoords(device);
        if (!coords) return;
        
        ctx.fillStyle = device.id === selectedItem?.id ? 'hsl(var(--primary))' : 'hsl(var(--foreground))';
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, ICON_SIZE / 2, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = 'hsl(var(--background))';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(device.type.substring(0,2).toUpperCase(), coords.x, coords.y);

        ctx.fillStyle = 'hsl(var(--foreground))';
        ctx.font = '11px sans-serif';
        ctx.fillText(device.label, coords.x, coords.y + ICON_SIZE / 2 + 10);
    });
  }, [floor, getAbsoluteCoords, selectedItem, floorPlanRect]);

  useEffect(() => {
    requestAnimationFrame(draw);
  }, [draw]);

  // Event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!floorPlanRect || e.button !== 0) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    const clickedDevice = [...floor.devices].reverse().find(d => {
        const coords = getAbsoluteCoords(d);
        if (!coords) return false;
        return Math.sqrt((mousePos.x - coords.x)**2 + (mousePos.y - coords.y)**2) < ICON_SIZE / 2;
    });

    if (clickedDevice) {
        setSelectedItem(clickedDevice);
        setDraggingDevice(clickedDevice);
        const deviceCoords = getAbsoluteCoords(clickedDevice)!;
        setDragOffset({ x: mousePos.x - deviceCoords.x, y: mousePos.y - deviceCoords.y });
    } else {
        setSelectedItem(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingDevice) {
        const rect = canvasRef.current!.getBoundingClientRect();
        const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        const newAbsPos = { x: mousePos.x - dragOffset.x, y: mousePos.y - dragOffset.y };
        const newRelPos = getRelativeCoords(newAbsPos);
        if (newRelPos) {
            onUpdateDevice({ ...draggingDevice, ...newRelPos });
        }
    }
  };

  const handleMouseUp = () => {
    setDraggingDevice(null);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-muted/20"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
