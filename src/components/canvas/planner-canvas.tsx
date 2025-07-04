
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { Floor, AnyDevice, Connection, ArchitecturalElement, Point, CablingMode, ArchitecturalElementType, SelectableItem } from '@/lib/types';
import { useTheme } from 'next-themes';

const ICON_SIZE = 28;
const RESIZE_HANDLE_SIZE = 10;
const SELECTION_THRESHOLD = 10; // Click tolerance in pixels

const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

interface PlannerCanvasProps {
  floor: Floor;
  selectedItem: SelectableItem | null;
  onSelectItem: (item: SelectableItem | null) => void;
  onUpdateDevice: (device: AnyDevice) => void;
  onCanvasClick: (e: React.MouseEvent<HTMLDivElement>) => void;
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
  floor,
  selectedItem,
  onSelectItem,
  onUpdateDevice,
  onCanvasClick,
  cablingMode,
  onSetCablingMode,
  onAddConnection,
  selectedArchTool,
  drawingState,
  onSetDrawingState,
  onAddArchElement,
  onUpdateArchElement,
  floorPlanRect,
  onUpdateFloorPlanRect,
}: PlannerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [floorPlanImage, setFloorPlanImage] = useState<HTMLImageElement | null>(null);
  const [iconImages, setIconImages] = useState<Record<string, HTMLImageElement>>({});
  const [draggingDevice, setDraggingDevice] = useState<AnyDevice | null>(null);
  const [draggingElement, setDraggingElement] = useState<ArchitecturalElement | null>(null);
  const [resizingElement, setResizingElement] = useState<{ element: ArchitecturalElement, handle: string } | null>(null);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const [resizingHandle, setResizingHandle] = useState<string | null>(null); // For floor plan
  const { resolvedTheme } = useTheme();
  const initializedFloorRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (floor.floorPlanUrl) {
      const img = new Image();
      img.src = floor.floorPlanUrl;
      img.onload = () => setFloorPlanImage(img);
    } else {
      setFloorPlanImage(null);
    }
  }, [floor.floorPlanUrl]);
  
  // Effect to pre-render device icons as images
  useEffect(() => {
    const deviceIconSvgs: Record<string, string> = {
      'cctv-bullet': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 9H16C17.1046 9 18 9.89543 18 11V14C18 15.1046 17.1046 16 16 16H2V9Z" fill="currentColor" /><path d="M18 11.5L22 9V16L18 13.5" fill="currentColor" /><path d="M8 16V19C8 19.5523 8.44772 20 9 20H11C11.5523 20 12 19.5523 12 19V16" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>`,
      'cctv-dome': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12H20V14H4V12Z" fill="currentColor" /><path d="M20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12" fill="currentColor" /><circle cx="12" cy="11" r="2" fill="white" fill-opacity="0.7" /></svg>`,
      'cctv-ptz': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17C15.3137 17 18 14.3137 18 11C18 7.68629 15.3137 5 12 5C8.68629 5 6 7.68629 6 11C6 14.3137 8.68629 17 12 17Z" fill="currentColor" /><circle cx="12" cy="11" r="2" fill="white" /><path d="M9 17V19C9 19.5523 9.44772 20 10 20H14C14.5523 20 15 19.5523 15 19V17" stroke="currentColor" stroke-width="2" /><path d="M20 11L22 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" /><path d="M2 11L4 11" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>`,
      'wifi-ap': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C12.5523 12 13 11.5523 13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11C11 11.5523 11.4477 12 12 12Z" fill="currentColor" /><path d="M5.63604 18.364C9.51139 22.2393 15.843 22.2393 19.7184 18.364" stroke="currentColor" stroke-width="2" stroke-linecap="round" /><path d="M8.46448 15.5355C10.9526 13.0474 14.8284 13.0474 17.3165 15.5355" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>`,
      'nvr': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="20" height="8" rx="1" fill="currentColor" /><circle cx="19" cy="12" r="1" fill="lime" /><circle cx="16" cy="12" r="1" fill="gray" /></svg>`,
      'switch': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="20" height="10" rx="2" fill="currentColor" /><path d="M6 11L7 12L8 11" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M11 11L10 12L9 11" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M15 11L16 12L17 11" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /><path d="M20 11L19 12L18 11" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>`,
      'rack-indoor': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="2" ry="2"></rect><line x1="7" y1="6" x2="17" y2="6"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="7" y1="18" x2="17" y2="18"></line></svg>`,
      'rack-outdoor': `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="2" width="18" height="20" rx="2" ry="2"></rect><line x1="7" y1="6" x2="17" y2="6"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="7" y1="18" x2="17" y2="18"></line></svg>`,
    };

    const loadImages = () => {
        if (!canvasRef.current || !document.body.contains(canvasRef.current)) return;
        
        const style = getComputedStyle(document.documentElement);
        const primaryColor = style.getPropertyValue('--primary');
        const accentColor = style.getPropertyValue('--accent');
        
        const images: Record<string, HTMLImageElement> = {};
        
        Object.entries(deviceIconSvgs).forEach(([type, svgTemplate]) => {
            // Create normal version
            const normalColor = `hsl(${primaryColor})`;
            let normalSvg = svgTemplate.replace(/currentColor/g, normalColor);
            const normalImg = new Image();
            normalImg.src = `data:image/svg+xml;base64,${btoa(normalSvg)}`;
            images[`${type}-normal`] = normalImg;

            // Create selected version
            const selectedColor = `hsl(${accentColor})`;
            let selectedSvg = svgTemplate.replace(/currentColor/g, selectedColor);
            const selectedImg = new Image();
            selectedImg.src = `data:image/svg+xml;base64,${btoa(selectedSvg)}`;
            images[`${type}-selected`] = selectedImg;
        });
        setIconImages(images);
    };

    // Need a slight delay to ensure CSS variables are available
    const timer = setTimeout(loadImages, 50);
    return () => clearTimeout(timer);
  }, [resolvedTheme]);

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

  const getAbsoluteCoords = (relPoint: Point): Point | null => {
    if (!floorPlanRect) return null;
    return {
      x: floorPlanRect.x + relPoint.x * floorPlanRect.width,
      y: floorPlanRect.y + relPoint.y * floorPlanRect.height,
    };
  };

  const drawDevice = useCallback((ctx: CanvasRenderingContext2D, device: AnyDevice) => {
    const coords = getAbsoluteCoords(device);
    if (!coords) return;
    const { x, y } = coords;
    
    const isSelected = selectedItem?.id === device.id;
    const isCablingStart = cablingMode.enabled && cablingMode.fromDeviceId === device.id;

    ctx.save();

    // Draw background circle for cameras
    if (device.type.startsWith('cctv-')) {
        let bgColor = 'hsla(210, 90%, 85%, 0.7)'; // Default: Soft Blue
        if (device.type === 'cctv-dome') bgColor = 'hsla(145, 63%, 85%, 0.7)'; // Soft Green
        if (device.type === 'cctv-ptz') bgColor = 'hsla(45, 100%, 85%, 0.7)'; // Soft Yellow
        
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.arc(x, y, ICON_SIZE / 2 + 2, 0, 2 * Math.PI);
        ctx.fill();

        // Also draw a border to make it pop
        ctx.strokeStyle = bgColor.replace('0.7', '1');
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
    
    if (isCablingStart) {
      const pulseRadius = (ICON_SIZE / 2 + 5) * (1 + Math.sin(Date.now() / 300) * 0.1);
      ctx.fillStyle = 'hsla(var(--accent), 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    if (isSelected) {
      ctx.fillStyle = 'hsla(var(--accent), 0.3)';
      ctx.beginPath();
      ctx.arc(x, y, ICON_SIZE / 2 + 4, 0, 2 * Math.PI);
      ctx.fill();
    }
    
    const imageKey = `${device.type}-${isSelected ? 'selected' : 'normal'}`;
    const iconImage = iconImages[imageKey];

    if (iconImage && iconImage.complete) {
        ctx.drawImage(iconImage, x - ICON_SIZE / 2, y - ICON_SIZE / 2, ICON_SIZE, ICON_SIZE);
    } else {
        // Fallback to circle if image not loaded yet
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
  }, [getAbsoluteCoords, selectedItem, cablingMode, resolvedTheme, iconImages]);

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
  
  const getAreaHandles = useCallback((el: ArchitecturalElement) => {
    if (el.type !== 'area' || !floorPlanRect) return {};
    const startAbs = getAbsoluteCoords(el.start);
    const endAbs = getAbsoluteCoords(el.end);
    if (!startAbs || !endAbs) return {};

    const x1 = Math.min(startAbs.x, endAbs.x);
    const y1 = Math.min(startAbs.y, endAbs.y);
    const x2 = Math.max(startAbs.x, endAbs.x);
    const y2 = Math.max(startAbs.y, endAbs.y);

    return {
      tl: { x: x1, y: y1 }, tr: { x: x2, y: y1 },
      bl: { x: x1, y: y2 }, br: { x: x2, y: y2 },
    };
  }, [floorPlanRect, getAbsoluteCoords]);

  const drawArchitecturalElements = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!floorPlanRect) return;

    floor.architecturalElements?.forEach(el => {
      ctx.save();
      const scale = el.scale ?? 1;

      const lineBasedTools: ArchitecturalElementType[] = ['wall', 'door', 'window'];
      const pointBasedTools: ArchitecturalElementType[] = ['table', 'chair', 'elevator', 'fire-escape', 'shaft'];
      const rotatableSizableTools: ArchitecturalElementType[] = ['tree', 'motorcycle', 'car', 'supercar'];

      const startAbs = getAbsoluteCoords(el.start);
      if (!startAbs) {
        ctx.restore();
        return;
      }
      
      const isSelected = selectedItem?.id === el.id;

      if (isSelected && el.type !== 'area') {
        ctx.strokeStyle = 'hsla(var(--accent), 0.9)';
        ctx.fillStyle = 'hsla(var(--accent), 0.2)';
        ctx.lineWidth = 2;
        const endAbs = getAbsoluteCoords(el.end);
        if (endAbs) {
            const minX = Math.min(startAbs.x, endAbs.x) - 5;
            const minY = Math.min(startAbs.y, endAbs.y) - 5;
            const width = Math.abs(endAbs.x - startAbs.x) + 10;
            const height = Math.abs(endAbs.y - startAbs.y) + 10;
            ctx.strokeRect(minX, minY, width, height);
            ctx.fillRect(minX, minY, width, height);
        }
      }

      if (el.type === 'area') {
        const endAbs = getAbsoluteCoords(el.end);
        if (!endAbs) { ctx.restore(); return; }
        
        const x1 = Math.min(startAbs.x, endAbs.x);
        const y1 = Math.min(startAbs.y, endAbs.y);
        const width = Math.abs(endAbs.x - startAbs.x);
        const height = Math.abs(endAbs.y - startAbs.y);

        ctx.save();
        if (el.shadow?.enabled) {
            const rgb = hexToRgb(el.shadow.color || '#000000');
            if (rgb) {
                ctx.shadowColor = `rgba(${rgb}, ${el.shadow.opacity ?? 0.1})`;
                ctx.shadowBlur = el.shadow.blur ?? 8;
                ctx.shadowOffsetX = el.shadow.offsetX ?? 0;
                ctx.shadowOffsetY = el.shadow.offsetY ?? 4;
            }
        }
        
        const color = el.color || '#3b82f6';
        ctx.fillStyle = `${color}33`; // Add ~20% opacity
        ctx.fillRect(x1, y1, width, height);
        ctx.restore();

        ctx.strokeStyle = el.color || '#3b82f6';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x1, y1, width, height);

        if (isSelected) {
            const handles = getAreaHandles(el);
            ctx.fillStyle = 'hsl(var(--primary))';
            Object.values(handles).forEach(pos => {
                ctx.fillRect(pos.x - RESIZE_HANDLE_SIZE / 2, pos.y - RESIZE_HANDLE_SIZE / 2, RESIZE_HANDLE_SIZE, RESIZE_HANDLE_SIZE);
            });
        }
      } else if (lineBasedTools.includes(el.type)) {
           const endAbs = getAbsoluteCoords(el.end);
          if (!endAbs) { ctx.restore(); return; }

          ctx.strokeStyle = 'hsl(var(--foreground) / 0.5)';
          ctx.lineWidth = (el.type === 'wall' ? 5 : 3) * scale;
          if (el.type === 'door' || el.type === 'window') {
              ctx.setLineDash([5, 5]);
          }
          ctx.beginPath();
          ctx.moveTo(startAbs.x, startAbs.y);
          ctx.lineTo(endAbs.x, endAbs.y);
          ctx.stroke();
      } else if (rotatableSizableTools.includes(el.type)) {
           const endAbs = getAbsoluteCoords(el.end);
          if (!endAbs) { ctx.restore(); return; }

          const dx = endAbs.x - startAbs.x;
          const dy = endAbs.y - startAbs.y;
          const baseSize = Math.max(1, Math.sqrt(dx * dx + dy * dy));
          const size = baseSize * scale;
          const rotation = Math.atan2(dy, dx);
          
          ctx.translate(startAbs.x, startAbs.y);
          ctx.rotate(rotation);

          if (el.type === 'tree') {
              const radius = size;
              ctx.fillStyle = 'hsl(120, 50%, 40%)';
              ctx.beginPath();
              ctx.arc(0, 0, radius, 0, Math.PI * 2);
              ctx.fill();
          } else if (el.type === 'car' || el.type === 'supercar') {
              const carLength = size * 2;
              const carWidth = size;
              ctx.fillStyle = el.type === 'supercar' ? 'hsl(var(--destructive))' : 'hsl(var(--foreground) / 0.7)';
              ctx.fillRect(-carLength / 2, -carWidth / 2, carLength, carWidth);
              ctx.fillStyle = 'hsl(var(--secondary))';
              ctx.fillRect(carLength * 0.1, -carWidth/2 * 0.8, carLength * 0.3, carWidth * 0.8);
          } else if (el.type === 'motorcycle') {
              const bodyLength = size * 1.8;
              const bodyHeight = size * 0.3;
              const wheelRadius = size * 0.4;
              ctx.fillStyle = 'hsl(var(--foreground) / 0.7)';
              ctx.strokeStyle = 'hsl(var(--foreground) / 0.9)';
              ctx.lineWidth = 2;
              
              ctx.fillRect(-bodyLength/2, -bodyHeight, bodyLength, bodyHeight);
              ctx.beginPath();
              ctx.arc(-bodyLength * 0.35, 0, wheelRadius, 0, 2 * Math.PI);
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(bodyLength * 0.35, 0, wheelRadius, 0, 2 * Math.PI);
              ctx.stroke();
          }
      } else if (pointBasedTools.includes(el.type)) {
          const coords = startAbs;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '10px Sarabun';

          if (el.type === 'table') {
              ctx.fillStyle = 'hsl(var(--foreground) / 0.6)';
              const size = 16 * scale;
              ctx.fillRect(coords.x - size / 1.5, coords.y - size / 2, size * 1.5, size);
          } else if (el.type === 'chair') {
              ctx.fillStyle = 'hsl(var(--foreground) / 0.6)';
              const size = 16 * scale;
              ctx.beginPath();
              ctx.arc(coords.x, coords.y, size / 2, 0, Math.PI * 2);
              ctx.fill();
          } else {
              const rectSize = 30 * scale;
              const rectX = coords.x - rectSize / 2;
              const rectY = coords.y - rectSize / 2;

              if (el.type === 'elevator') {
                  ctx.strokeStyle = 'hsl(var(--foreground) / 0.8)';
                  ctx.lineWidth = 2;
                  ctx.strokeRect(rectX, rectY, rectSize, rectSize);
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
  }, [floor.architecturalElements, floorPlanRect, selectedItem, getAbsoluteCoords, getAreaHandles]);

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
  
  const isPointOnElement = (clickPoint: Point, el: ArchitecturalElement): boolean => {
    if (!floorPlanRect) return false;

    const startAbs = getAbsoluteCoords(el.start);
    if (!startAbs) return false;

    if (['table', 'chair', 'elevator', 'fire-escape', 'shaft'].includes(el.type)) {
        const distance = Math.sqrt(Math.pow(clickPoint.x - startAbs.x, 2) + Math.pow(clickPoint.y - startAbs.y, 2));
        return distance < SELECTION_THRESHOLD * 1.5;
    }

    const endAbs = getAbsoluteCoords(el.end);
    if (!endAbs) return false;
    
    if (el.type === 'area') {
        const minX = Math.min(startAbs.x, endAbs.x);
        const maxX = Math.max(startAbs.x, endAbs.x);
        const minY = Math.min(startAbs.y, endAbs.y);
        const maxY = Math.max(startAbs.y, endAbs.y);
        return clickPoint.x >= minX && clickPoint.x <= maxX && clickPoint.y >= minY && clickPoint.y <= maxY;
    }
    
    // For line-based and sizable objects
    const px = endAbs.x - startAbs.x;
    const py = endAbs.y - startAbs.y;
    const lenSq = px * px + py * py;
    if (lenSq === 0) {
        const distance = Math.sqrt(Math.pow(clickPoint.x - startAbs.x, 2) + Math.pow(clickPoint.y - startAbs.y, 2));
        return distance < SELECTION_THRESHOLD;
    }
    let u = ((clickPoint.x - startAbs.x) * px + (clickPoint.y - startAbs.y) * py) / lenSq;
    u = Math.max(0, Math.min(1, u));
    const x = startAbs.x + u * px;
    const y = startAbs.y + u * py;
    const dx = x - clickPoint.x;
    const dy = y - clickPoint.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist < SELECTION_THRESHOLD;
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const point = getRelativeCoords(e);

    // Check for architectural element resize
    if (selectedItem && selectedItem.type === 'area') {
        const handles = getAreaHandles(selectedItem as ArchitecturalElement);
        for (const [key, pos] of Object.entries(handles)) {
            if (Math.hypot(point.x - pos.x, point.y - pos.y) < RESIZE_HANDLE_SIZE) {
                setResizingElement({ element: selectedItem as ArchitecturalElement, handle: key });
                return;
            }
        }
    }

    // Check for floor plan resize
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
    
    // Check for architectural element interaction first
    for (const el of [...floor.architecturalElements].reverse()) {
        if (isPointOnElement(point, el)) {
            onSelectItem(el);
            setDraggingElement(el);
            const startAbs = getAbsoluteCoords(el.start);
            if (startAbs) {
                setDragOffset({ x: point.x - startAbs.x, y: point.y - startAbs.y });
            }
            return;
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

          onSelectItem(device);
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
            onAddArchElement({ id: `arch_${Date.now()}`, type: selectedArchTool, start: startPoint, end: startPoint, scale: 1 });
        } else { // line-based tools, sizable objects, and 'area'
            onSetDrawingState({ isDrawing: true, startPoint });
        }
      }
      return;
    }
    
    onSelectItem(null); // Deselect if clicking on empty space
    onCanvasClick(e);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const point = getRelativeCoords(e);
    const relPoint = getFloorPlanRelativeCoords(point);

    // Handle area resizing
    if (resizingElement && relPoint) {
        const { element, handle } = resizingElement;
        const normalizedStart = { x: Math.min(element.start.x, element.end.x), y: Math.min(element.start.y, element.end.y) };
        const normalizedEnd = { x: Math.max(element.start.x, element.end.x), y: Math.max(element.start.y, element.end.y) };
        
        let nextStart = { ...normalizedStart };
        let nextEnd = { ...normalizedEnd };

        if (handle.includes('l')) { nextStart.x = relPoint.x; }
        if (handle.includes('r')) { nextEnd.x = relPoint.x; }
        if (handle.includes('t')) { nextStart.y = relPoint.y; }
        if (handle.includes('b')) { nextEnd.y = relPoint.y; }

        const updatedElement = { ...element, start: nextStart, end: nextEnd };
        onUpdateArchElement(updatedElement);
        setResizingElement({ ...resizingElement, element: updatedElement });
        return;
    }
    
    // Handle architectural element dragging
    if (draggingElement && relPoint && floorPlanRect) {
        const newStartAbs = { x: point.x - dragOffset.x, y: point.y - dragOffset.y };
        const newStartRel = getFloorPlanRelativeCoords(newStartAbs);
        if (newStartRel) {
            const widthRel = draggingElement.end.x - draggingElement.start.x;
            const heightRel = draggingElement.end.y - draggingElement.start.y;
            const newEndRel = { x: newStartRel.x + widthRel, y: newStartRel.y + heightRel };
            const updatedElement = { ...draggingElement, start: newStartRel, end: newEndRel };
            onUpdateArchElement(updatedElement);
        }
        return;
    }

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
    if (draggingDevice && floorPlanRect && relPoint) {
      onUpdateDevice({ ...draggingDevice, x: relPoint.x, y: relPoint.y });
      return;
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (drawingState.isDrawing && drawingState.startPoint && selectedArchTool) {
      const endPoint = getFloorPlanRelativeCoords(getRelativeCoords(e));
      if (endPoint) {
          const start = drawingState.startPoint;
          let finalStart = start;
          let finalEnd = endPoint;

          // For 'area', we always want normalized top-left and bottom-right corners.
          if (selectedArchTool === 'area') {
              finalStart = { x: Math.min(start.x, endPoint.x), y: Math.min(start.y, endPoint.y) };
              finalEnd = { x: Math.max(start.x, endPoint.x), y: Math.max(start.y, endPoint.y) };
          }

          onAddArchElement({
              id: `arch_${Date.now()}`,
              type: selectedArchTool,
              start: finalStart,
              end: finalEnd,
              scale: 1,
          });
      }
      onSetDrawingState({ isDrawing: false, startPoint: null });
    }
    if (resizingElement) {
        const { element } = resizingElement;
        const finalStart = { x: Math.min(element.start.x, element.end.x), y: Math.min(element.start.y, element.end.y) };
        const finalEnd = { x: Math.max(element.start.x, element.end.x), y: Math.max(element.start.y, element.end.y) };
        onUpdateArchElement({ ...element, start: finalStart, end: finalEnd });
    }

    setDraggingDevice(null);
    setResizingHandle(null);
    setDraggingElement(null);
    setResizingElement(null);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-[#e8e8e8] dark:bg-[#2a2a2a] shadow-[rgba(50,50,93,0.25)_0px_50px_100px_-20px,rgba(0,0,0,0.3)_0px_30px_60px_-30px,rgba(10,37,64,0.35)_0px_-2px_6px_0px_inset] dark:shadow-[rgba(0,0,0,0.4)_0px_30px_60px_-30px,rgba(255,255,255,0.05)_0px_-2px_6px_0px_inset] cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div 
        className="absolute inset-0 pointer-events-none bg-[repeating-conic-gradient(#e8e8e8_0.0000001%,#93a1a1_0.000104%)_60%_60%/600%_600%] dark:bg-[repeating-conic-gradient(#2a2a2a_0.0000001%,#444_0.000104%)_60%_60%/600%_600%] opacity-10 contrast-105"
        aria-hidden="true"
      />
      <canvas ref={canvasRef} className="relative z-10" />
    </div>
  );
}
