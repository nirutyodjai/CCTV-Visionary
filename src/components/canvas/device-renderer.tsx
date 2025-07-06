
import React from 'react';
import type { AnyDevice } from '@/lib/types';
import { DEVICE_CONFIG } from '@/lib/device-config';
import { useSelection } from '@/contexts/SelectionContext';
import { motion } from 'framer-motion';

interface DeviceRendererProps {
  device: AnyDevice;
  onDevicePointerDown: (e: React.PointerEvent, device: AnyDevice) => void;
}

export const DeviceRenderer: React.FC<DeviceRendererProps> = ({ device, onDevicePointerDown }) => {
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

  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute flex flex-col items-center"
      style={{
        left: `${device.x * 100}%`,
        top: `${device.y * 100}%`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
      }}
      onPointerDown={handlePointerDown}
    >
        <div 
          className={`
            w-12 h-12 rounded-full flex items-center justify-center 
            border-2 transition-all duration-200 ease-in-out cursor-grab
            ${colorClass}
            ${isSelected ? 'ring-4 ring-offset-2 ring-primary' : 'shadow-md hover:shadow-lg'}
          `}
        >
          <IconComponent className="w-6 h-6 text-card-foreground" />
        </div>
        <p 
          className={`
            mt-2 text-xs font-semibold px-2 py-1 rounded-md transition-all
            ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground shadow'}
          `}
        >
          {device.label}
        </p>
    </motion.div>
  );
};
