'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import type { Device, DeviceType } from '@/lib/types';
import { DEVICE_CONFIG } from '@/lib/device-config';
import { cn } from '@/lib/utils';
import React from 'react';

interface PlannerCanvasProps {
  currentFloor: number;
  devices: Device[];
  floorPlan: string | null;
  selectedDeviceToAdd: DeviceType | null;
  selectedDevice: Device | null;
  onAddDevice: (type: DeviceType, x: number, y: number) => void;
  onSelectDevice: (device: Device | null) => void;
  onUpdateDevice: (device: Device) => void;
}

const ICON_SIZE = 32;
const HANDLE_SIZE = 10;

function elementToSvgString(element: React.ReactNode): string {
  if (!React.isValidElement(element)) return '';

  const { type, props } = element;
  
  if (typeof type === 'function') {
    return elementToSvgString(type(props));
  }
  
  if (typeof type !== 'string') return '';

  const children = props.children ? React.Children.toArray(props.children) : [];
  const childrenString = children.map(child => {
      if (typeof child === 'string') return child;
      return elementToSvgString(child);
  }).join('');

  const propString = Object.keys(props)
      .filter(key => key !== 'children' && props[key] !== undefined)
      .map(key => {
          const attributeName = key === 'className' ? 'class' : key.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
          return `${attributeName}="${props[key]}"`;
      })
      .join(' ');

  return `<${type} ${propString}>${childrenString}</${type}>`;
}

export function PlannerCanvas({
  currentFloor,
  devices,
  floorPlan,
  selectedDeviceToAdd,
  selectedDevice,
  onAddDevice,
  onSelectDevice,
  onUpdateDevice,
}: PlannerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iconCache = useRef<Map<DeviceType, HTMLImageElement>>(new Map());
  const floorPlanImage = useRef<HTMLImageElement | null>(null);
  const [iconsLoaded, setIconsLoaded] = useState(false);
  
  const [floorPlanRect, setFloorPlanRect] = useState<DOMRect | null>(null);
  const [draggingState, setDraggingState] = useState<{
    type: 'device';
    device: Device;
  } | {
    type: 'plan-resize';
    handle: 'tl' | 'tr' | 'bl' | 'br';
    startRect: DOMRect;
    startPos: { x: number; y: number };
    aspectRatio: number;
  } | null>(null);

  useEffect(() => {
    let loadedCount = 0;
    const deviceTypes = Object.keys(DEVICE_CONFIG);
    if (deviceTypes.length === 0) {
      setIconsLoaded(true);
      return;
    }

    const foregroundHsl = getComputedStyle(document.documentElement).getPropertyValue('--foreground');
    const foregroundColor = `hsl(${foregroundHsl})`;

    Object.entries(DEVICE_CONFIG).forEach(([type, config]) => {
      const IconComponent = config.icon;
      const iconElement = React.createElement(IconComponent);
      const svgString = elementToSvgString(iconElement).replace(/currentColor/g, foregroundColor);

      const img = new Image();
      img.src = `data:image/svg+xml;base64,${btoa(svgString)}`;
      img.onload = () => {
        iconCache.current.set(type as DeviceType, img);
        loadedCount++;
        if (loadedCount === deviceTypes.length) {
          setIconsLoaded(true);
        }
      };
      img.onerror = () => {
        console.error(`Failed to load icon for ${type}`);
        loadedCount++;
        if (loadedCount === deviceTypes.length) {
          setIconsLoaded(true);
        }
      }
    });
  }, []);

  const calculateInitialRect = useCallback(() => {
    const canvas = canvasRef.current;
    const img = floorPlanImage.current;
    const container = canvas?.parentElement;
    if (canvas && img && container) {
      const { clientWidth, clientHeight } = container;
      const hRatio = clientWidth / img.width;
      const vRatio = clientHeight / img.height;
      const ratio = Math.min(hRatio, vRatio) * 0.9;
      
      const rectWidth = img.width * ratio;
      const rectHeight = img.height * ratio;
      const rectX = (clientWidth - rectWidth) / 2;
      const rectY = (clientHeight - rectHeight) / 2;

      setFloorPlanRect(new DOMRect(rectX, rectY, rectWidth, rectHeight));
    }
  }, []);

  useEffect(() => {
    if (floorPlan) {
      const img = new Image();
      img.onload = () => {
        floorPlanImage.current = img;
        calculateInitialRect();
      };
      img.src = floorPlan;
    } else {
      floorPlanImage.current = null;
      setFloorPlanRect(null);
    }
  }, [floorPlan, calculateInitialRect]);

  const getAbsoluteCoords = useCallback((device: Pick<Device, 'x' | 'y'>, planRect: DOMRect): { x: number; y: number } | null => {
    if (!planRect) return null;
    return {
      x: planRect.x + device.x * planRect.width,
      y: planRect.y + device.y * planRect.height,
    };
  }, []);
  
  const getRelativeCoords = useCallback((absX: number, absY: number, planRect: DOMRect): { x: number; y: number } | null => {
    if (!planRect) return null;
    const x = (absX - planRect.x) / planRect.width;
    const y = (absY - planRect.y) / planRect.height;
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
  }, []);
  
  const drawDevice = useCallback((ctx: CanvasRenderingContext2D, device: Device, planRect: DOMRect) => {
    const coords = getAbsoluteCoords(device, planRect);
    if (!coords) return;
    const { x, y } = coords;
    
    const isSelected = selectedDevice?.id === device.id;
    const icon = iconCache.current.get(device.type);

    ctx.save();
    if (isSelected) {
      ctx.fillStyle = 'hsla(var(--accent), 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, ICON_SIZE / 2 + 6, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if (icon && icon.complete) {
      ctx.drawImage(icon, x - ICON_SIZE / 2, y - ICON_SIZE / 2, ICON_SIZE, ICON_SIZE);
    } else {
      const config = DEVICE_CONFIG[device.type];
      ctx.fillStyle = 'hsl(var(--primary))';
      ctx.beginPath();
      ctx.arc(x, y, ICON_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'hsl(var(--primary-foreground))';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 12px Sarabun';
      ctx.fillText(config.name.substring(0,2), x, y);
    }

    ctx.fillStyle = 'hsl(var(--foreground))';
    ctx.textAlign = 'center';
    ctx.font = '11px Sarabun';
    ctx.shadowColor = 'hsl(var(--background))';
    ctx.shadowBlur = 4;
    ctx.fillText(device.label, x, y + ICON_SIZE / 2 + 10);
    ctx.restore();
  }, [getAbsoluteCoords, selectedDevice]);

  const drawCoverage = useCallback((ctx: CanvasRenderingContext2D, device: Device, planRect: DOMRect) => {
    const coords = getAbsoluteCoords(device, planRect);
    if (!coords) return;
    
    const baseScale = planRect.width / 1000;
    const rangeInPixels = (device.range || 0) * 10 * baseScale;
    
    if (device.type.startsWith('cctv-') && rangeInPixels > 0) {
        ctx.save();
        ctx.fillStyle = 'hsla(40, 100%, 50%, 0.2)';
        ctx.strokeStyle = 'hsla(40, 100%, 50%, 0.5)';
        ctx.lineWidth = 1;
        ctx.translate(coords.x, coords.y);
        ctx.rotate((device.rotation || 0) * Math.PI / 180);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        const startAngle = -((device.fov || 0) / 2) * Math.PI / 180;
        const endAngle = ((device.fov || 0) / 2) * Math.PI / 180;
        ctx.arc(0, 0, rangeInPixels, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    } else if (device.type === 'wifi-ap' && rangeInPixels > 0) {
        ctx.fillStyle = 'hsla(var(--primary), 0.15)';
        ctx.strokeStyle = 'hsla(var(--primary), 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(coords.x, coords.y, rangeInPixels, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
  }, [getAbsoluteCoords]);

  const drawResizeHandles = (ctx: CanvasRenderingContext2D, planRect: DOMRect) => {
    ctx.save();
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.strokeStyle = 'hsl(var(--background))';
    ctx.lineWidth = 2;

    const { x, y, width, height } = planRect;
    const halfHandle = HANDLE_SIZE / 2;

    const handles = {
      tl: { x: x - halfHandle, y: y - halfHandle },
      tr: { x: x + width - halfHandle, y: y - halfHandle },
      bl: { x: x - halfHandle, y: y + height - halfHandle },
      br: { x: x + width - halfHandle, y: y + height - halfHandle },
    };

    for (const handle of Object.values(handles)) {
      ctx.fillRect(handle.x, handle.y, HANDLE_SIZE, HANDLE_SIZE);
      ctx.strokeRect(handle.x, handle.y, HANDLE_SIZE, HANDLE_SIZE);
    }
    ctx.restore();
  };
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (container) {
      const { clientWidth, clientHeight } = container;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = clientWidth * dpr;
      canvas.height = clientHeight * dpr;
      canvas.style.width = `${clientWidth}px`;
      canvas.style.height = `${clientHeight}px`;
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (floorPlanImage.current && floorPlanRect) {
      ctx.drawImage(floorPlanImage.current, floorPlanRect.x, floorPlanRect.y, floorPlanRect.width, floorPlanRect.height);
      drawResizeHandles(ctx, floorPlanRect);
    } else {
      ctx.fillStyle = 'hsl(var(--card))';
      const { width, height } = canvas.getBoundingClientRect();
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '16px Sarabun';
      ctx.fillText(`แบบแปลนชั้น ${currentFloor} - อัปโหลดรูปภาพ`, width / 2, height / 2);
    }
    
    if (floorPlanRect) {
      devices.forEach(device => drawCoverage(ctx, device, floorPlanRect));
      devices.forEach(device => drawDevice(ctx, device, floorPlanRect));
    }
  }, [devices, floorPlanRect, currentFloor, drawCoverage, drawDevice]);
  
  useEffect(() => {
    window.addEventListener('resize', calculateInitialRect);
    draw();
    return () => window.removeEventListener('resize', calculateInitialRect);
  }, [draw, calculateInitialRect]);


  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);

    if (floorPlanRect) {
      const { x, y, width, height } = floorPlanRect;
      const halfHandle = HANDLE_SIZE / 2;
      const handles = {
          tl: new DOMRect(x - halfHandle, y - halfHandle, HANDLE_SIZE, HANDLE_SIZE),
          tr: new DOMRect(x + width - halfHandle, y - halfHandle, HANDLE_SIZE, HANDLE_SIZE),
          bl: new DOMRect(x - halfHandle, y + height - halfHandle, HANDLE_SIZE, HANDLE_SIZE),
          br: new DOMRect(x + width - halfHandle, y + height - halfHandle, HANDLE_SIZE, HANDLE_SIZE),
      };
      for (const [key, rect] of Object.entries(handles)) {
          if (pos.x > rect.left && pos.x < rect.right && pos.y > rect.top && pos.y < rect.bottom) {
              setDraggingState({
                  type: 'plan-resize',
                  handle: key as 'tl' | 'tr' | 'bl' | 'br',
                  startRect: floorPlanRect,
                  startPos: pos,
                  aspectRatio: floorPlanRect.width / floorPlanRect.height,
              });
              return;
          }
      }
    }

    if (floorPlanRect) {
      for (let i = devices.length - 1; i >= 0; i--) {
          const device = devices[i];
          const coords = getAbsoluteCoords(device, floorPlanRect);
          if (coords && Math.sqrt((pos.x - coords.x)**2 + (pos.y - coords.y)**2) < ICON_SIZE / 2) {
              onSelectDevice(device);
              setDraggingState({ type: 'device', device });
              return;
          }
      }
    }

    onSelectDevice(null);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingState) return;
    const pos = getMousePos(e);
    
    if (draggingState.type === 'device') {
        const relPos = getRelativeCoords(pos.x, pos.y, floorPlanRect!);
        if (relPos) {
          const updatedDevice = { ...draggingState.device, x: relPos.x, y: relPos.y };
          onUpdateDevice(updatedDevice);
        }
    } else if (draggingState.type === 'plan-resize') {
      const { handle, startRect, startPos, aspectRatio } = draggingState;
      const dx = pos.x - startPos.x;
      const dy = pos.y - startPos.y;

      let { x, y, width, height } = startRect;

      if (handle.includes('r')) width = startRect.width + dx;
      if (handle.includes('l')) {
        width = startRect.width - dx;
        x = startRect.x + dx;
      }
      if (handle.includes('b')) height = startRect.height + dy;
      if (handle.includes('t')) {
        height = startRect.height - dy;
        y = startRect.y + dy;
      }
      
      if (handle.endsWith('r') || handle.endsWith('l')) {
        height = width / aspectRatio;
      } else {
        width = height * aspectRatio;
      }

      if (handle.startsWith('t')) y = startRect.y + startRect.height - height;
      if (handle.startsWith('b')) { /* y does not change */ }
      if (handle.endsWith('l')) x = startRect.x + startRect.width - width;
      if (handle.endsWith('r')) { /* x does not change */ }
      
      if(handle === 'tl') {
        x = startRect.x + dx;
        y = startRect.y + (width / aspectRatio - startRect.height) * -1 + dy;
      } else if (handle === 'tr') {
        y = startRect.y + (startRect.height - width / aspectRatio);
      } else if (handle === 'bl') {
        x = startRect.x + dx;
      }

      setFloorPlanRect(new DOMRect(x, y, Math.max(width, 50), Math.max(height, 50)));
    }
  };
  
  const handleMouseUp = () => {
    setDraggingState(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingState) return;
    if (selectedDeviceToAdd && floorPlanRect) {
        const pos = getMousePos(e);
        const relPos = getRelativeCoords(pos.x, pos.y, floorPlanRect);
        if (relPos) {
          onAddDevice(selectedDeviceToAdd, relPos.x, relPos.y);
        }
    }
  };

  return (
    <div className="flex-1 w-full h-full flex items-center justify-center p-4 bg-muted/20">
      <canvas
        ref={canvasRef}
        className={cn(
            'bg-card border-2 border-dashed shadow-lg rounded-lg',
            selectedDeviceToAdd && floorPlanRect ? 'cursor-copy' : 'cursor-crosshair',
            draggingState?.type === 'device' && 'cursor-move',
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />
    </div>
  );
}
