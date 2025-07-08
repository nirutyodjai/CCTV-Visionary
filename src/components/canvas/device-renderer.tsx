
import React, { memo } from 'react';
import type { AnyDevice } from '@/lib/types';
import { DEVICE_CONFIG } from '@/lib/device-config';
import { useSelection } from '@/contexts/SelectionContext';
import { motion } from 'framer-motion';
import { CameraFovRenderer } from './camera-fov-renderer';
import { GripVertical } from 'lucide-react';

interface DeviceRendererProps {
  device: AnyDevice;
  onDevicePointerDown: (e: React.PointerEvent, device: AnyDevice) => void;
  onRotationPointerDown: (e: React.PointerEvent, device: AnyDevice) => void;
  virtualWidth: number;
  virtualHeight: number;
}

const PIXELS_PER_METER = 8;

const DeviceRendererComponent: React.FC<DeviceRendererProps> = ({ 
  device, 
  onDevicePointerDown,
  onRotationPointerDown,
  virtualWidth, 
  virtualHeight 
}) => {
  const { selectedItem } = useSelection();
  const isSelected = selectedItem?.id === device.id;
  
  const config = DEVICE_CONFIG[device.type];
  if (!config) return null;

  const IconComponent = config.icon;
  const colorClass = config.colorClass || 'bg-card';

  const handlePointerDown = (e: React.PointerEvent) => {
    onDevicePointerDown(e, device);
  };

  const handleRotationHandlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    onRotationPointerDown(e, device);
  };
  
  const iconOffset = 24; 
  const iconLeft = Math.round(device.x * virtualWidth) - iconOffset;
  const iconTop = Math.round(device.y * virtualHeight) - iconOffset;
  const isCamera = device.type.startsWith('cctv-');

  return (
    <div
      className="absolute cursor-grab"
      style={{
        left: `${iconLeft}px`,
        top: `${iconTop}px`,
        width: '48px',
        height: '48px',
        transform: `rotate(${device.rotation || 0}deg)`,
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
        {isCamera && (device.fov && device.range) && (
          <CameraFovRenderer
            deviceId={device.id}
            rotation={device.rotation || 0}
            fov={device.fov}
            rangeInPixels={(device.range || 0) * PIXELS_PER_METER}
            isSelected={isSelected}
          />
        )}
        <div 
          className={`
            relative z-10 w-12 h-12 rounded-full flex items-center justify-center 
            border-2 transition-all duration-200
            ${colorClass}
            ${isSelected ? 'ring-4 ring-offset-2 ring-primary' : 'shadow-md hover:shadow-lg'}
          `}
        >
          <IconComponent className="w-6 h-6 text-card-foreground" />
        </div>
        
        {isSelected && (
          <div
            className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-4 h-8 cursor-grab bg-primary rounded-full z-20 flex items-center justify-center"
            onPointerDown={handleRotationHandlePointerDown}
          >
            <GripVertical className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        
        <p 
          className={`
            absolute top-full left-1/2 -translate-x-1/2
            mt-2 text-xs font-semibold px-2 py-1 rounded-md transition-all z-20
            ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground shadow'}
          `}
          style={{ pointerEvents: 'none', transform: `rotate(-${device.rotation || 0}deg)` }} 
        >
          {device.label}
        </p>
      </motion.div>
    </div>
  );
};

export const DeviceRenderer = memo(DeviceRendererComponent);
