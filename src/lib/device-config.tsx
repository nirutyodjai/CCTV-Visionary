import React from 'react';
import { CctvBulletIcon, CctvDomeIcon, CctvPtzIcon, WifiApIcon, NvrIcon, SwitchIcon, MonitorIcon, UtpCat6Icon, FiberOpticIcon, RackIcon } from "@/components/icons";
import type { Device, DeviceType } from './types';

export const RACK_DEVICE_TYPES: DeviceType[] = ['nvr', 'switch', 'patch-panel', 'pdu', 'ups'];

const PlaceholderRackDeviceIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <rect x="2" y="7" width="20" height="10" rx="1" fill="currentColor" />
        <line x1="6" y1="12" x2="8" y2="12" stroke="white" strokeWidth="1.5" />
        <line x1="10" y1="12" x2="12" y2="12" stroke="white" strokeWidth="1.5" />
    </svg>
);


export const DEVICE_CONFIG: Record<string, { name: string; icon: React.ComponentType<any>; color?: string; defaults: Partial<Device> & { uHeight?: number; powerConsumption?: number; powerCapacity?: number; } }> = {
  // Field devices
  'cctv-bullet': { name: 'กล้องกระบอก', icon: CctvBulletIcon, color: 'hsl(221, 83%, 53%)', defaults: { resolution: '1080p', fov: 90, range: 20, rotation: 0, price: 1500, powerConsumption: 5 } },
  'cctv-dome': { name: 'กล้องโดม', icon: CctvDomeIcon, color: 'hsl(221, 83%, 53%)', defaults: { resolution: '1080p', fov: 90, range: 20, rotation: 0, price: 1400, powerConsumption: 5 } },
  'cctv-ptz': { name: 'กล้อง PTZ', icon: CctvPtzIcon, color: 'hsl(221, 83%, 53%)', defaults: { resolution: '1080p', fov: 120, range: 30, rotation: 0, price: 4500, powerConsumption: 20 } },
  'wifi-ap': { name: 'WiFi AP', icon: WifiApIcon, color: 'hsl(142, 71%, 45%)', defaults: { range: 15, price: 2500, powerConsumption: 15 } },
  
  // Rack containers (placed on floor plan)
  'rack-indoor': { name: 'ตู้ Rack (Indoor)', icon: RackIcon, color: 'hsl(215, 20%, 65%)', defaults: { rack_size: '9U', price: 2800, devices: [] } },
  'rack-outdoor': { name: 'ตู้ Rack (Outdoor)', icon: RackIcon, color: 'hsl(215, 20%, 65%)', defaults: { rack_size: '9U', ip_rating: 'IP65', price: 4200, devices: [] } },

  // Head-end / Rack-mountable devices (some might be on canvas)
  'nvr': { name: 'NVR/DVR', icon: NvrIcon, color: 'hsl(24, 95%, 53%)', defaults: { channels: 16, storage: '4TB', price: 8000, uHeight: 2, powerConsumption: 50 } },
  'switch': { name: 'สวิตช์', icon: SwitchIcon, color: 'hsl(24, 95%, 53%)', defaults: { ports: 8, price: 2200, uHeight: 1, powerConsumption: 30 } },
  'patch-panel': { name: 'Patch Panel', icon: PlaceholderRackDeviceIcon, defaults: { uHeight: 1, price: 1200, powerConsumption: 0 } },
  'pdu': { name: 'PDU', icon: PlaceholderRackDeviceIcon, defaults: { uHeight: 1, price: 2500, powerConsumption: 0, powerCapacity: 2200 } },
  'ups': { name: 'UPS', icon: PlaceholderRackDeviceIcon, defaults: { uHeight: 2, price: 9000, powerConsumption: 10, powerCapacity: 1200 } },
  
  // Other (not placed on canvas)
  'monitor': { name: 'จอภาพ', icon: MonitorIcon, defaults: { size: '24"', price: 4000 } },
  'utp-cat6': { name: 'สาย UTP CAT6', icon: UtpCat6Icon, defaults: { length: 1, price: 20 } },
  'fiber-optic': { name: 'สาย Fiber Optic', icon: FiberOpticIcon, defaults: { length: 1, price: 40 } },
};

export function createDevice(type: DeviceType, x: number, y: number, existingDevices: Device[]): Device {
  const config = DEVICE_CONFIG[type];

  if (!config) {
    console.error(`[createDevice] FATAL: No configuration found for device type: "${type}"`);
    throw new Error(`Invalid device type specified: ${type}`);
  }

  const count = existingDevices.filter(d => d.type === type).length + 1;

  return {
    id: `dev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: type,
    x,
    y,
    label: `${config.name}-${count}`,
    ...config.defaults
  } as Device;
}
