
import React from 'react';
import type { AnyDevice } from '@/lib/types';
import { DEVICE_CONFIG } from '@/lib/device-config';
import { useSelection } from '@/contexts/SelectionContext';
import { motion } from 'framer-motion';

interface DeviceRendererProps {
  device: AnyDevice;
  onDevicePointerDown: (e: React.PointerEvent, device: AnyDevice) => void;
  virtualWidth: number;
  virtualHeight: number;
}

export const DeviceRenderer: React.FC<DeviceRendererProps> = ({ device, onDevicePointerDown, virtualWidth, virtualHeight }) => {
  const { selectedItem } = useSelection();
  const isSelected = selectedItem?.id === device.id;
  
  const config = DEVICE_CONFIG[device.type];
  if (!config) return null;

  const IconComponent = config.icon;
  const colorClass = config.colorClass || 'bg-card';

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onDevicePointerDown(e, device);
  };
  
  // The icon is w-12 h-12, which is 48px. Its center offset is 24px.
  const iconOffset = 24; 

  // Calculate the exact top-left position for the icon itself to be centered on the target point.
  const iconLeft = Math.round(device.x * virtualWidth) - iconOffset;
  const iconTop = Math.round(device.y * virtualHeight) - iconOffset;

  return (
    // This container is for event handling and grouping.
    // It is sized and positioned exactly where the icon should be.
    <div
      className="absolute cursor-grab"
      style={{
        left: `${iconLeft}px`,
        top: `${iconTop}px`,
        pointerEvents: 'auto',
        width: '48px',
        height: '48px',
      }}
      onPointerDown={handlePointerDown}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative w-full h-full"
      >
        <div 
          className={`
            w-12 h-12 rounded-full flex items-center justify-center 
            border-2 transition-all duration-200
            ${colorClass}
            ${isSelected ? 'ring-4 ring-offset-2 ring-primary' : 'shadow-md hover:shadow-lg'}
          `}
        >
          <IconComponent className="w-6 h-6 text-card-foreground" />
        </div>
        
        {/* The label is positioned absolutely relative to the icon's container. */}
        <p 
          className={`
            absolute top-full left-1/2 -translate-x-1/2
            mt-2 text-xs font-semibold px-2 py-1 rounded-md transition-all
            ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground shadow'}
          `}
          // Stop pointer events on the label so they pass through to the main div
          style={{ pointerEvents: 'none' }} 
        >
          {device.label}
        </p>
      </motion.div>
    </div>
  );
};
