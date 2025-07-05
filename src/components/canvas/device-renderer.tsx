'use client';

import React from 'react';
import type { AnyDevice } from '@/lib/types';
import { DEVICE_CONFIG } from '@/lib/device-config';
import { cn } from '@/lib/utils';
import { useSelection } from '@/contexts/SelectionContext';

interface DeviceRendererProps {
  device: AnyDevice;
  onDeviceDown: (e: React.PointerEvent, device: AnyDevice) => void;
  containerRect: DOMRect | null;
}

const ICON_WRAPPER_SIZE = 32;

export function DeviceRenderer({ device, onDeviceDown, containerRect }: DeviceRendererProps) {
  const { selectedItem } = useSelection();
  const IconComponent = DEVICE_CONFIG[device.type]?.icon;

  if (!IconComponent || !containerRect) {
    return null;
  }

  const isSelected = selectedItem?.id === device.id;

  const left = device.x * containerRect.width - ICON_WRAPPER_SIZE / 2;
  const top = device.y * containerRect.height - ICON_WRAPPER_SIZE / 2;

  return (
    <div
      className="absolute flex flex-col items-center group pointer-events-auto"
      style={{
        transform: `translate(${left}px, ${top}px)`,
        width: ICON_WRAPPER_SIZE,
        height: ICON_WRAPPER_SIZE,
        touchAction: 'none', // Important for pointer events
      }}
      onPointerDown={(e) => onDeviceDown(e, device)}
    >
      <div
        className={cn(
          'w-full h-full rounded-full flex items-center justify-center transition-all duration-150 border-2',
          isSelected
            ? 'bg-primary border-primary-foreground/50 shadow-lg scale-110'
            : 'bg-card border-border shadow-sm group-hover:scale-110 group-hover:border-primary'
        )}
        style={{ cursor: 'grab' }}
      >
        <IconComponent
          className={cn(
            'w-5 h-5 transition-colors',
            isSelected ? 'text-primary-foreground' : 'text-foreground'
          )}
        />
      </div>
      <div
        className={cn(
          'absolute top-full mt-1.5 text-xs px-1.5 py-0.5 rounded transition-all duration-150 whitespace-nowrap',
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground shadow-sm'
        )}
      >
        {device.label}
      </div>
    </div>
  );
}
