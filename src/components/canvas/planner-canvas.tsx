'use client';
import { useEffect, useRef, useState } from 'react';
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
  const [draggingDevice, setDraggingDevice] = useState<{ device: Device; offsetX: number; offsetY: number } | null>(null);
  const [iconsLoaded, setIconsLoaded] = useState(false);

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

  useEffect(() => {
    if (floorPlan) {
      const img = new Image();
      img.onload = () => {
        floorPlanImage.current = img;
        draw();
      };
      img.src = floorPlan;
    } else {
      floorPlanImage.current = null;
      draw();
    }
  }, [floorPlan]);


  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const container = canvas.parentElement;
    if (container) {
      const { clientWidth: containerWidth, clientHeight: containerHeight } = container;
      const dpr = window.devicePixelRatio || 1;

      if (floorPlanImage.current) {
        const img = floorPlanImage.current;
        const hRatio = containerWidth / img.width;
        const vRatio = containerHeight / img.height;
        const ratio = Math.min(hRatio, vRatio, 1);
        canvas.width = img.width * ratio * dpr;
        canvas.height = img.height * ratio * dpr;
        canvas.style.width = `${img.width * ratio}px`;
        canvas.style.height = `${img.height * ratio}px`;
      } else {
        canvas.width = containerWidth * dpr;
        canvas.height = containerHeight * dpr;
        canvas.style.width = `${containerWidth}px`;
        canvas.style.height = `${containerHeight}px`;
      }
      ctx.scale(dpr, dpr);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { width: scaledWidth, height: scaledHeight } = canvas.getBoundingClientRect();

    if (floorPlanImage.current) {
      ctx.drawImage(floorPlanImage.current, 0, 0, scaledWidth, scaledHeight);
    } else {
      ctx.fillStyle = 'hsl(var(--card))';
      ctx.fillRect(0, 0, scaledWidth, scaledHeight);
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '16px Sarabun';
      ctx.fillText(`แบบแปลนชั้น ${currentFloor} - อัปโหลดรูปภาพ`, scaledWidth / 2, scaledHeight / 2);
    }
    
    devices.forEach(device => drawCoverage(ctx, device, scaledWidth));
    devices.forEach(device => drawDevice(ctx, device));
  };
  
  const drawDevice = (ctx: CanvasRenderingContext2D, device: Device) => {
    const { x, y, type, label } = device;
    const isSelected = selectedDevice?.id === device.id;
    const icon = iconCache.current.get(type);

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
      const config = DEVICE_CONFIG[type];
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
    ctx.fillText(label, x, y + ICON_SIZE / 2 + 10);
    ctx.restore();
  };
  
  const drawCoverage = (ctx: CanvasRenderingContext2D, device: Device, canvasWidth: number) => {
    // Assuming 1 meter = 10 pixels on a 1000px wide canvas for reference.
    const baseScale = canvasWidth / 1000;
    const rangeInPixels = (device.range || 0) * 10 * baseScale;

    if (device.type.startsWith('cctv-') && rangeInPixels > 0) {
        ctx.fillStyle = 'hsla(40, 100%, 50%, 0.2)';
        ctx.strokeStyle = 'hsla(40, 100%, 50%, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(device.x, device.y);
        const startAngle = ((device.rotation || 0) - (device.fov || 0) / 2) * Math.PI / 180;
        const endAngle = ((device.rotation || 0) + (device.fov || 0) / 2) * Math.PI / 180;
        ctx.arc(device.x, device.y, rangeInPixels, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (device.type === 'wifi-ap' && rangeInPixels > 0) {
        ctx.fillStyle = 'hsla(var(--primary), 0.15)';
        ctx.strokeStyle = 'hsla(var(--primary), 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(device.x, device.y, rangeInPixels, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
  };

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    draw();
    return () => window.removeEventListener('resize', handleResize);
  }, [devices, selectedDevice, currentFloor, floorPlan, iconsLoaded]);


  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e);
    for (let i = devices.length - 1; i >= 0; i--) {
        const device = devices[i];
        if (Math.sqrt((x - device.x)**2 + (y - device.y)**2) < ICON_SIZE / 2) {
            onSelectDevice(device);
            setDraggingDevice({ device, offsetX: x - device.x, offsetY: y - device.y });
            return;
        }
    }
    onSelectDevice(null);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingDevice) {
        const { x, y } = getMousePos(e);
        const rect = canvasRef.current!.getBoundingClientRect();
        const updatedDevice = {
            ...draggingDevice.device,
            x: x - draggingDevice.offsetX,
            y: y - draggingDevice.offsetY,
        };
        updatedDevice.x = Math.max(ICON_SIZE / 2, Math.min(rect.width - ICON_SIZE / 2, updatedDevice.x));
        updatedDevice.y = Math.max(ICON_SIZE / 2, Math.min(rect.height - ICON_SIZE / 2, updatedDevice.y));
        onUpdateDevice(updatedDevice);
    }
  };
  
  const handleMouseUp = () => {
    setDraggingDevice(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingDevice) return;
    if (selectedDeviceToAdd) {
        const { x, y } = getMousePos(e);
        onAddDevice(selectedDeviceToAdd, x, y);
    }
  };


  return (
    <div className="flex-1 w-full h-full flex items-center justify-center p-4 bg-muted/20">
      <canvas
        ref={canvasRef}
        className={cn(
            'bg-card border-2 border-dashed shadow-lg rounded-lg',
            selectedDeviceToAdd ? 'cursor-copy' : 'cursor-crosshair',
            draggingDevice && 'cursor-move'
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
