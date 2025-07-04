
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Floor, AnyDevice, Connection, ArchitecturalElement, Point, CablingMode, ArchitecturalElementType } from '@/lib/types';
import { DEVICE_CONFIG } from '@/lib/device-config';
import { useTheme } from 'next-themes';

const ICON_SIZE = 28;
const RESIZE_HANDLE_SIZE = 10;

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
  floorPlanRect: DOMRect | null;
  onUpdateFloorPlanRect: (rect: DOMRect) => void;
}

export function PlannerCanvas({
  floor,
  selectedDevice,
  onSelectDevice,
  onUpdateDevice,
  onCanvasClick,
  cablingMode,
  onSetCablingMode,
  onAddConnection,
  selectedArchTool,
  drawingState,
  onSetDrawingState,
  onAddArchElement,
  floorPlanRect,
  onUpdateFloorPlanRect,
}: PlannerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [floorPlanImage, setFloorPlanImage] = useState<HTMLImageElement | null>(null);
  const [draggingDevice, setDraggingDevice] = useState<AnyDevice | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [resizingHandle, setResizingHandle] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const initializedFloorRef = useRef<string | null>(null);

  // Initialize the floor plan rectangle on mount or floor change
  useEffect(() => {
    if (containerRef.current && (!floorPlanRect || initializedFloorRef.current !== floor.id)) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            const initialWidth = rect.width * 0.9;
            const initialHeight = rect.height * 0.9;
            const initialX = (rect.width - initialWidth) / 2;
            const initialY = (rect.height - initialHeight) / 2;
            onUpdateFloorPlanRect(new DOMRect(initialX, initialY, initialWidth, initialHeight));
            initializedFloorRef.current = floor.id;
        }
    }
  }, [floor.id, floorPlanRect, onUpdateFloorPlanRect]);

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

  const getRelativeCoords = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const getFloorPlanRelativeCoords = (absPoint: Point): Point | null => {
    if (!floorPlanRect) return null;
    return {
      x: (absPoint.x - floorPlanRect.x) / floorPlanRect.width,
      y: (absPoint.y - floorPlanRect.y) / floorPlanRect.height,
    };
  };

  const getAbsoluteCoords = (device: { x: number; y: number }): Point | null => {
    if (!floorPlanRect) return null;
    return {
      x: floorPlanRect.x + device.x * floorPlanRect.width,
      y: floorPlanRect.y + device.y * floorPlanRect.height,
    };
  };

  const drawDevice = useCallback((ctx: CanvasRenderingContext2D, device: AnyDevice) => {
    const coords = getAbsoluteCoords(device);
    if (!coords) return;
    const { x, y } = coords;
    
    const isSelected = selectedDevice?.id === device.id;
    const isCablingStart = cablingMode.enabled && cablingMode.fromDeviceId === device.id;

    ctx.save();
    
    // Pulsing effect for cabling start device
    if (isCablingStart) {
      const pulseRadius = (ICON_SIZE / 2 + 5) * (1 + Math.sin(Date.now() / 300) * 0.1);
      ctx.fillStyle = 'hsla(var(--destructive), 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    // Selection highlight
    if (isSelected) {
      ctx.fillStyle = 'hsla(var(--accent), 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, ICON_SIZE / 2 + 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    const DeviceIcon = DEVICE_CONFIG[device.type]?.icon;
    if (DeviceIcon) {
        // This is a simplification. Drawing SVG components onto a canvas is complex.
        // For a real app, you'd need a robust way to render SVG to canvas.
        // Here, we draw a placeholder circle with initials.
        ctx.fillStyle = isSelected ? 'hsl(var(--accent))' : 'hsl(var(--primary))';
        ctx.beginPath();
        ctx.arc(x, y, ICON_SIZE / 2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'hsl(var(--primary-foreground))';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold ${ICON_SIZE / 2}px sans-serif`;
        const initials = device.type.split('-').map(s => s[0]).join('').toUpperCase();
        ctx.fillText(initials, x, y);
    }
    
    ctx.fillStyle = resolvedTheme === 'dark' ? 'hsl(var(--foreground))' : '#000000';
    ctx.textAlign = 'center';
    ctx.font = '12px Sarabun';
    ctx.fillText(device.label, x, y + ICON_SIZE / 2 + 12);
    
    ctx.restore();
  }, [getAbsoluteCoords, selectedDevice, cablingMode, resolvedTheme]);

  const drawConnections = useCallback((ctx: CanvasRenderingContext2D) => {
    floor.connections?.forEach(conn => {
      const fromDevice = floor.devices.find(d => d.id === conn.fromDeviceId);
      const toDevice = floor.devices.find(d => d.id === conn.toDeviceId);
      if (fromDevice && toDevice) {
        const start = getAbsoluteCoords(fromDevice);
        const end = getAbsoluteCoords(toDevice);
        if (start && end) {
          ctx.beginPath();
          ctx.moveTo(start.x, start.y);
          ctx.lineTo(end.x, end.y);
          ctx.strokeStyle = 'hsl(var(--accent))';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    });
  }, [floor.connections, floor.devices, getAbsoluteCoords]);
  
  const drawArchitecturalElements = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!floorPlanRect) return;

    floor.architecturalElements?.forEach(el => {
      ctx.save();
      const lineBasedTools: ArchitecturalElementType[] = ['wall', 'door', 'window'];
      
      if (lineBasedTools.includes(el.type)) {
          ctx.strokeStyle = 'hsl(var(--foreground) / 0.5)';
          ctx.lineWidth = 3;
          if (el.type === 'door' || el.type === 'window') {
              ctx.setLineDash([5, 5]);
          }
          const startX = floorPlanRect.x + el.start.x * floorPlanRect.width;
          const startY = floorPlanRect.y + el.start.y * floorPlanRect.height;
          const endX = floorPlanRect.x + el.end.x * floorPlanRect.width;
          const endY = floorPlanRect.y + el.end.y * floorPlanRect.height;
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.stroke();
      } else {
          // Point-based elements
          const coords = {
            x: floorPlanRect.x + el.start.x * floorPlanRect.width,
            y: floorPlanRect.y + el.start.y * floorPlanRect.height,
          };
          
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '10px Sarabun';

          if (el.type === 'table') {
              ctx.fillStyle = 'hsl(var(--foreground) / 0.6)';
              const size = 16;
              ctx.fillRect(coords.x - size / 1.5, coords.y - size / 2, size * 1.5, size);
          } else if (el.type === 'chair') {
              ctx.fillStyle = 'hsl(var(--foreground) / 0.6)';
              const size = 16;
              ctx.beginPath();
              ctx.arc(coords.x, coords.y, size / 2, 0, Math.PI * 2);
              ctx.fill();
          } else {
              const rectSize = 30;
              const rectX = coords.x - rectSize / 2;
              const rectY = coords.y - rectSize / 2;

              if (el.type === 'elevator') {
                  ctx.strokeStyle = 'hsl(var(--foreground) / 0.8)';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(rectX, rectY, rectSize, rectSize);
                  // Draw X inside
                  ctx.beginPath();
                  ctx.moveTo(rectX, rectY);
                  ctx.lineTo(rectX + rectSize, rectY + rectSize);
                  ctx.moveTo(rectX + rectSize, rectY);
                  ctx.lineTo(rectX, rectY + rectSize);
                  ctx.stroke();
                  ctx.fillStyle = 'hsl(var(--foreground) / 0.8)';
                  ctx.fillText('L', coords.x, coords.y);
              } else if (el.type === 'fire-escape') {
                  ctx.strokeStyle = 'hsl(var(--destructive))';
                  ctx.fillStyle = 'hsl(var(--destructive) / 0.1)';
                  ctx.lineWidth = 1.5;
                  ctx.fillRect(rectX, rectY, rectSize, rectSize);
                  ctx.strokeRect(rectX, rectY, rectSize, rectSize);
                  ctx.font = 'bold 9px Sarabun';
                  ctx.fillStyle = 'hsl(var(--destructive))';
                  ctx.fillText('FIRE', coords.x, coords.y);
              } else if (el.type === 'shaft') {
                  ctx.strokeStyle = 'hsl(var(--foreground) / 0.5)';
                  ctx.lineWidth = 1;
                  ctx.setLineDash([4, 4]);
                  ctx.strokeRect(rectX, rectY, rectSize, rectSize);
                  ctx.setLineDash([]);
                  ctx.fillStyle = 'hsl(var(--foreground) / 0.8)';
                  ctx.fillText('Shaft', coords.x, coords.y);
              }
          }
      }
      ctx.restore();
    });
  }, [floor.architecturalElements, floorPlanRect]);

  const drawResizeHandles = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!floorPlanRect) return;
    const { x, y, width, height } = floorPlanRect;
    const handles = {
      tl: { x, y },
      tr: { x: x + width, y },
      bl: { x, y: y + height },
      br: { x: x + width, y: y + height },
    };
    ctx.fillStyle = 'hsl(var(--primary))';
    Object.values(handles).forEach(pos => {
      ctx.fillRect(pos.x - RESIZE_HANDLE_SIZE / 2, pos.y - RESIZE_HANDLE_SIZE / 2, RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE);
    });
  }, [floorPlanRect]);
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !containerRef.current) return;
    
    const { width, height } = containerRef.current.getBoundingClientRect();
    canvas.width = width;
    canvas.height = height;

    if (!floorPlanRect) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (floorPlanImage) {
      ctx.drawImage(floorPlanImage, floorPlanRect.x, floorPlanRect.y, floorPlanRect.width, floorPlanRect.height);
    } else {
      ctx.fillStyle = 'hsl(var(--card))';
      ctx.fillRect(floorPlanRect.x, floorPlanRect.y, floorPlanRect.width, floorPlanRect.height);
    }
    
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.strokeRect(floorPlanRect.x, floorPlanRect.y, floorPlanRect.width, floorPlanRect.height);
    
    drawArchitecturalElements(ctx);
    drawConnections(ctx);
    floor.devices?.forEach(d => drawDevice(ctx, d));
    drawResizeHandles(ctx);

  }, [floor.devices, floorPlanImage, floorPlanRect, drawDevice, drawConnections, drawArchitecturalElements, drawResizeHandles]);

  useEffect(() => {
    let animationFrameId: number;
    const render = () => {
      draw();
      animationFrameId = window.requestAnimationFrame(render);
    };
    render();
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [draw]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getRelativeCoords(e);

    // Check for resize handle interaction
    if (floorPlanRect) {
      const { x, y, width, height } = floorPlanRect;
      const handles = {
        tl: { x, y }, tr: { x: x + width, y },
        bl: { x, y: y + height }, br: { x: x + width, y: y + height },
      };
      for (const [key, pos] of Object.entries(handles)) {
        if (Math.abs(point.x - pos.x) < RESIZE_HANDLE_SIZE && Math.abs(point.y - pos.y) < RESIZE_HANDLE_SIZE) {
          setResizingHandle(key);
          return;
        }
      }
    }

    // Check for device interaction
    for (const device of [...floor.devices].reverse()) {
      const deviceCoords = getAbsoluteCoords(device);
      if (deviceCoords) {
        const distance = Math.sqrt(Math.pow(point.x - deviceCoords.x, 2) + Math.pow(point.y - deviceCoords.y, 2));
        if (distance < ICON_SIZE / 2) {
          if (cablingMode.enabled && cablingMode.fromDeviceId) {
            if (cablingMode.fromDeviceId !== device.id) {
              onAddConnection({
                id: `conn_${Date.now()}`,
                fromDeviceId: cablingMode.fromDeviceId,
                toDeviceId: device.id,
                cableType: 'utp-cat6'
              });
              onSetCablingMode({ enabled: false, fromDeviceId: null });
            }
            return;
          }

          onSelectDevice(device);
          setDraggingDevice(device);
          setDragOffset({ x: point.x - deviceCoords.x, y: point.y - deviceCoords.y });
          return;
        }
      }
    }
    
    // Architectural drawing
    if (selectedArchTool) {
      const startPoint = getFloorPlanRelativeCoords(point);
      if (startPoint) {
        const pointBasedTools: ArchitecturalElementType[] = ['table', 'chair', 'elevator', 'fire-escape', 'shaft'];
        if (pointBasedTools.includes(selectedArchTool)) {
            onAddArchElement({
                id: `arch_${Date.now()}`,
                type: selectedArchTool,
                start: startPoint,
                end: startPoint, // For point objects, start and end are the same
            });
        } else {
            // It's a line-based tool, start drawing
            onSetDrawingState({ isDrawing: true, startPoint });
        }
      }
      return;
    }
    
    onCanvasClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getRelativeCoords(e);
    
    // Handle floor plan resizing
    if (resizingHandle && floorPlanRect) {
      let { x, y, width, height } = floorPlanRect;
      const right = x + width;
      const bottom = y + height;

      if (resizingHandle.includes('l')) { x = point.x; }
      if (resizingHandle.includes('r')) { width = point.x - x; }
      if (resizingHandle.includes('t')) { y = point.y; }
      if (resizingHandle.includes('b')) { height = point.y - y; }

      if (resizingHandle.includes('l')) { width = right - point.x; }
      if (resizingHandle.includes('t')) { height = bottom - point.y; }

      onUpdateFloorPlanRect(new DOMRect(x, y, Math.max(width, 20), Math.max(height, 20)));
      return;
    }

    // Handle device dragging
    if (draggingDevice && floorPlanRect) {
      const newAbsX = point.x - dragOffset.x;
      const newAbsY = point.y - dragOffset.y;
      const newRelX = (newAbsX - floorPlanRect.x) / floorPlanRect.width;
      const newRelY = (newAbsY - floorPlanRect.y) / floorPlanRect.height;
      
      onUpdateDevice({ ...draggingDevice, x: newRelX, y: newRelY });
      return;
    }
    
    // Handle architecture drawing preview (can be added later)
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (drawingState.isDrawing && drawingState.startPoint && selectedArchTool) {
      const endPoint = getFloorPlanRelativeCoords(getRelativeCoords(e));
      if (endPoint) {
          onAddArchElement({
              id: `arch_${Date.now()}`,
              type: selectedArchTool,
              start: drawingState.startPoint,
              end: endPoint,
          });
      }
      onSetDrawingState({ isDrawing: false, startPoint: null });
    }
    setDraggingDevice(null);
    setResizingHandle(null);
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
