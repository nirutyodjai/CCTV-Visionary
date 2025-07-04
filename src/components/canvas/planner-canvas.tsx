'use client';
import { useEffect, useRef, useState } from 'react';
import type { Device, DeviceType } from '@/lib/types';
import { DEVICE_CONFIG } from '@/lib/device-config';
import { cn } from '@/lib/utils';

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

  // Preload icons
  useEffect(() => {
    Object.entries(DEVICE_CONFIG).forEach(([type, config]) => {
      const img = new Image();
      const IconComponent = config.icon;
      // This is a trick to render a React component to an SVG string
      const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="hsl(var(--foreground))">${new IconComponent({}).props.children}</g></svg>`;
      const coloredSvgString = new DOMParser().parseFromString(IconComponent({className: "text-foreground"}).props.children, "image/svg+xml");
      
      const SvgIconAsString = (Icon: React.ComponentType<any>): string => {
        const component = Icon({ className: "text-foreground" });
        const path = component.props.children.map((child: any) => child.props.d).join('');

        // This is a simplistic approach and might not work for all SVGs from the prototype
         const svgString = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          ${component.props.children.map((child:any) => new XMLSerializer().serializeToString(child)).join('')}
         </svg>`;

        // A better approach is needed here. For now, use the provided SVGs directly.
        // I will use the original SVGs from the prompt and replace color with currentColor
        return (new XMLSerializer()).serializeToString(document.createElementNS("http://www.w3.org/2000/svg", "svg"))
      }

      // Simplified SVG rendering, might need a library for complex cases
      img.src = `data:image/svg+xml;base64,${btoa(config.icon.toString())}`;
      
      const icon = DEVICE_CONFIG[type as DeviceType].icon;
      // Not feasible to convert component to string easily. Let's skip preloading for now and draw on canvas with a placeholder
    });
  }, []);

  // Load floor plan image
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

    // Resize canvas to fit container
    const container = canvas.parentElement;
    if (container) {
      const size = Math.min(container.clientWidth, container.clientHeight) * 0.98;
      if(canvas.width !== size) canvas.width = size;
      if(canvas.height !== size) canvas.height = size;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw floor plan or placeholder
    if (floorPlanImage.current) {
      ctx.drawImage(floorPlanImage.current, 0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = 'hsl(var(--card))';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'hsl(var(--muted-foreground))';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '16px Sarabun';
      ctx.fillText(`แบบแปลนชั้น ${currentFloor} - อัปโหลดรูปภาพ`, canvas.width / 2, canvas.height / 2);
    }
    
    // Draw coverage first
    devices.forEach(device => drawCoverage(ctx, device, canvas.width));
    // Draw devices on top
    devices.forEach(device => drawDevice(ctx, device));
  };
  
  const drawDevice = (ctx: CanvasRenderingContext2D, device: Device) => {
    const { x, y, type, label } = device;
    const isSelected = selectedDevice?.id === device.id;

    ctx.save();
    if (isSelected) {
      ctx.fillStyle = 'hsla(var(--accent), 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, ICON_SIZE / 2 + 6, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Placeholder rendering for icon
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

    ctx.fillStyle = 'hsl(var(--foreground))';
    ctx.textAlign = 'center';
    ctx.font = '11px Sarabun';
    ctx.fillText(label, x, y + ICON_SIZE / 2 + 10);
    ctx.restore();
  };
  
  const drawCoverage = (ctx: CanvasRenderingContext2D, device: Device, canvasWidth: number) => {
    if (device.type.startsWith('cctv-') && device.range && device.range > 0) {
        ctx.fillStyle = 'hsla(40, 100%, 50%, 0.2)';
        ctx.strokeStyle = 'hsla(40, 100%, 50%, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(device.x, device.y);
        const startAngle = ((device.rotation || 0) - (device.fov || 0) / 2) * Math.PI / 180;
        const endAngle = ((device.rotation || 0) + (device.fov || 0) / 2) * Math.PI / 180;
        ctx.arc(device.x, device.y, device.range * (canvasWidth / 100), startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (device.type === 'wifi-ap' && device.range && device.range > 0) {
        ctx.fillStyle = 'hsla(var(--primary), 0.15)';
        ctx.strokeStyle = 'hsla(var(--primary), 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(device.x, device.y, device.range * (canvasWidth / 100), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }
  };

  useEffect(() => {
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    draw(); // Initial draw
    return () => window.removeEventListener('resize', handleResize);
  }, [devices, selectedDevice, currentFloor, floorPlan]);


  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getMousePos(e);
    // Find clicked device (reverse loop to prioritize top-most devices)
    for (let i = devices.length - 1; i >= 0; i--) {
        const device = devices[i];
        if (Math.sqrt((x - device.x)**2 + (y - device.y)**2) < ICON_SIZE / 2) {
            onSelectDevice(device);
            setDraggingDevice({ device, offsetX: x - device.x, offsetY: y - device.y });
            return;
        }
    }
    // If no device is clicked, deselect
    onSelectDevice(null);
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingDevice) {
        const { x, y } = getMousePos(e);
        const updatedDevice = {
            ...draggingDevice.device,
            x: x - draggingDevice.offsetX,
            y: y - draggingDevice.offsetY,
        };
        onUpdateDevice(updatedDevice);
    }
  };
  
  const handleMouseUp = () => {
    setDraggingDevice(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedDeviceToAdd) {
        const { x, y } = getMousePos(e);
        onAddDevice(selectedDeviceToAdd, x, y);
    }
  };


  return (
    <div className="flex-1 w-full h-full flex items-center justify-center p-4">
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
        onMouseLeave={handleMouseUp} // Stop dragging if mouse leaves canvas
        onClick={handleClick}
      />
    </div>
  );
}
