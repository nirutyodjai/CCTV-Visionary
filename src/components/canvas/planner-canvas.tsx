
'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
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
  onDeviceUpdate: (device: AnyDevice) => void;
}

export function PlannerCanvas({
  floor,
  cablingMode,
  onDeviceClick,
  onArchElementClick,
  onCanvasClick,
  onDeviceMove,
  onDeviceUpdate,
}: PlannerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();
  const lineDashOffset = useRef(0);
  
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const [imageTransform, setImageTransform] = useState<ImageTransform>({ scale: 1, offsetX: 0, offsetY: 0 });

  const activeInteraction = useRef<{
    deviceId: string;
    type: 'move' | 'rotate';
    pointerId: number;
    element: HTMLElement;
  } | null>(null);
  
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const propsRef = useRef({ onDeviceMove, onDeviceUpdate, floor });
  useEffect(() => {
    propsRef.current = { onDeviceMove, onDeviceUpdate, floor };
  }, [onDeviceMove, onDeviceUpdate, floor]);

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

  const { intWidth, intHeight } = useMemo(() => {
    if (!containerRect) return { intWidth: 0, intHeight: 0 };
    return {
      intWidth: Math.floor(containerRect.width),
      intHeight: Math.floor(containerRect.height),
    };
  }, [containerRect]);
  
  useEffect(() => {
    if (intWidth > 0 && intHeight > 0 && bgImage) {
      const hRatio = intWidth / bgImage.width;
      const vRatio = intHeight / bgImage.height;
      const scale = Math.min(hRatio, vRatio);
      const offsetX = (intWidth - bgImage.width * scale) / 2;
      const offsetY = (intHeight - bgImage.height * scale) / 2;
      setImageTransform({ scale, offsetX, offsetY });
    } else if (intWidth > 0) {
      setImageTransform({ scale: 1, offsetX: 0, offsetY: 0 });
    }
  }, [bgImage, intWidth, intHeight]);
  
  const virtualWidth = bgImage?.width ?? intWidth ?? 0;
  const virtualHeight = bgImage?.height ?? intHeight ?? 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !virtualWidth || !virtualHeight) return;

    if (canvas.width !== virtualWidth) canvas.width = virtualWidth;
    if (canvas.height !== virtualHeight) canvas.height = virtualHeight;

    const draw = () => {
        ctx.clearRect(0, 0, virtualWidth, virtualHeight);
        if (bgImage) {
            ctx.drawImage(bgImage, 0, 0, bgImage.width, bgImage.height);
        }
        
        const currentFloor = propsRef.current.floor;
        if (currentFloor.connections) {
            currentFloor.connections.forEach(conn => {
                const fromDevice = currentFloor.devices.find(d => d.id === conn.fromDeviceId);
                const toDevice = currentFloor.devices.find(d => d.id === conn.toDeviceId);
                if (!fromDevice || !toDevice) return;

                const path = new Path2D();
                
                const pointsToDraw = conn.path && conn.path.length >= 2
                    ? conn.path
                    : [{ x: fromDevice.x, y: fromDevice.y }, { x: toDevice.x, y: toDevice.y }];

                if (pointsToDraw.length < 2) return;

                const virtualPoints = pointsToDraw.map(p => ({
                    x: Math.round(p.x * virtualWidth),
                    y: Math.round(p.y * virtualHeight),
                }));
                
                path.moveTo(virtualPoints[0].x, virtualPoints[0].y);
                for (let i = 1; i < virtualPoints.length; i++) {
                    path.lineTo(virtualPoints[i].x, virtualPoints[i].y);
                }

                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 1;
                ctx.setLineDash([4, 4]);
                ctx.lineDashOffset = -lineDashOffset.current;
                ctx.stroke(path);
            });
        }
    }

    const animate = () => {
        lineDashOffset.current += 0.1;
        draw();
        animationFrameId.current = requestAnimationFrame(animate);
    };
    animationFrameId.current = requestAnimationFrame(animate);
    
    return () => {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [bgImage, virtualWidth, virtualHeight]);

  const getCoordsInVirtualSpace = useCallback((e: React.PointerEvent) => {
    if (!containerRect) return null;
    const { scale, offsetX, offsetY } = imageTransform;
    const viewX = e.clientX - containerRect.left;
    const viewY = e.clientY - containerRect.top;
    const virtualX = (viewX - offsetX) / scale;
    const virtualY = (viewY - offsetY) / scale;
    return { x: virtualX / virtualWidth, y: virtualY / virtualHeight };
  }, [containerRect, imageTransform, virtualWidth, virtualHeight]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!activeInteraction.current || activeInteraction.current.pointerId !== e.pointerId) return;

    const virtualPos = getCoordsInVirtualSpace(e);
    if (!virtualPos) return;

    const { deviceId, type } = activeInteraction.current;
    const device = propsRef.current.floor.devices.find(d => d.id === deviceId);
    if (!device) return;

    if (type === 'move') {
      const finalPos = {
        x: Math.max(0, Math.min(1, virtualPos.x + dragOffset.current.x)),
        y: Math.max(0, Math.min(1, virtualPos.y + dragOffset.current.y)),
      };
      propsRef.current.onDeviceMove(deviceId, finalPos);
    } else if (type === 'rotate') {
      const dx = virtualPos.x - device.x;
      const dy = virtualPos.y - device.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const rotation = (angle + 90 + 360) % 360;
      propsRef.current.onDeviceUpdate({ ...device, rotation });
    }
  }, [getCoordsInVirtualSpace]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (activeInteraction.current && activeInteraction.current.pointerId === e.pointerId) {
      activeInteraction.current.element.releasePointerCapture(e.pointerId);
      activeInteraction.current = null;
    }
  }, []);

  const startInteraction = useCallback((e: React.PointerEvent, device: AnyDevice, type: 'move' | 'rotate') => {
    e.stopPropagation();
    const element = e.currentTarget as HTMLElement;
    element.setPointerCapture(e.pointerId);

    activeInteraction.current = { deviceId: device.id, type, pointerId: e.pointerId, element };

    if (type === 'move') {
      onDeviceClick(device);
      if (!cablingMode.enabled) {
        const virtualPos = getCoordsInVirtualSpace(e);
        if (virtualPos) {
          dragOffset.current = { x: device.x - virtualPos.x, y: device.y - virtualPos.y };
        }
      }
    }
  }, [onDeviceClick, cablingMode.enabled, getCoordsInVirtualSpace]);

  const handleDevicePointerDown = useCallback((e: React.PointerEvent, device: AnyDevice) => {
    startInteraction(e, device, 'move');
  }, [startInteraction]);

  const handleRotationPointerDown = useCallback((e: React.PointerEvent, device: AnyDevice) => {
    startInteraction(e, device, 'rotate');
  }, [startInteraction]);
  
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    if(e.target === e.currentTarget) onCanvasClick();
  }, [onCanvasClick]);

  const cursor = useMemo(() => {
      if(activeInteraction.current) return 'grabbing';
      if(cablingMode.enabled) return 'crosshair';
      return 'default';
  }, [cablingMode.enabled, activeInteraction.current]);

  const transformLayerStyle: React.CSSProperties = {
      position: 'absolute',
      left: `${imageTransform.offsetX}px`,
      top: `${imageTransform.offsetY}px`,
      width: `${virtualWidth}px`,
      height: `${virtualHeight}px`,
      transform: `scale(${imageTransform.scale})`,
      transformOrigin: 'top left',
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-muted/20 overflow-hidden touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerDown={handleCanvasPointerDown}
      style={{ cursor }}
    >
        {intWidth > 0 && intHeight > 0 && (
            <div style={transformLayerStyle}>
                <canvas
                    ref={canvasRef}
                    width={virtualWidth}
                    height={virtualHeight}
                    className="absolute inset-0"
                />
                
                <div className="absolute inset-0">
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
                        onRotationPointerDown={handleRotationPointerDown}
                        virtualWidth={virtualWidth}
                        virtualHeight={virtualHeight}
                    />
                    ))}
                </div>
            </div>
        )}
    </div>
  );
}
