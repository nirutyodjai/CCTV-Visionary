import { CctvBulletIcon, CctvDomeIcon, CctvPtzIcon, WifiApIcon, NvrIcon, SwitchIcon, MonitorIcon, UtpCat6Icon, FiberOpticIcon, RackIcon } from "@/components/icons";
import type { Device, DeviceType } from './types';

// Add new device types for rack-mountable equipment
export const RACK_DEVICE_TYPES = ['patch-panel', 'pdu', 'ups', 'switch', 'nvr'];

export const DEVICE_CONFIG: Record<DeviceType | 'patch-panel' | 'pdu' | 'ups', { name: string; icon: React.ComponentType<any>; defaults: Partial<Device> & { uHeight?: number; powerConsumption?: number; powerCapacity?: number; } }> = {
  // Existing devices...
  'cctv-bullet': { name: 'กล้องกระบอก', icon: CctvBulletIcon, defaults: { resolution: '1080p', fov: 90, range: 20, rotation: 0, price: 1500, powerConsumption: 5 } },
  'cctv-dome': { name: 'กล้องโดม', icon: CctvDomeIcon, defaults: { resolution: '1080p', fov: 90, range: 20, rotation: 0, price: 1400, powerConsumption: 5 } },
  'cctv-ptz': { name: 'กล้อง PTZ', icon: CctvPtzIcon, defaults: { resolution: '1080p', fov: 120, range: 30, rotation: 0, price: 4500, powerConsumption: 20 } },
  'wifi-ap': { name: 'WiFi AP', icon: WifiApIcon, defaults: { range: 15, price: 2500, powerConsumption: 15 } },
  'nvr': { name: 'NVR/DVR', icon: NvrIcon, defaults: { channels: 16, storage: '4TB', price: 8000, uHeight: 2, powerConsumption: 50 } },
  'switch': { name: 'สวิตช์', icon: SwitchIcon, defaults: { ports: 8, price: 2200, uHeight: 1, powerConsumption: 30 } },
  
  // Rack containers
  'rack-indoor': { name: 'ตู้ Rack (Indoor)', icon: RackIcon, defaults: { rack_size: '9U', price: 2800 } },
  'rack-outdoor': { name: 'ตู้ Rack (Outdoor)', icon: RackIcon, defaults: { rack_size: '9U', ip_rating: 'IP65', price: 4200 } },

  // New rack-mountable devices
  'patch-panel': { name: 'Patch Panel', icon: SwitchIcon, defaults: { uHeight: 1, price: 1200 } },
  'pdu': { name: 'Power Distribution Unit', icon: SwitchIcon, defaults: { uHeight: 1, price: 2500, powerCapacity: 2200 } }, // in Watts
  'ups': { name: 'UPS', icon: SwitchIcon, defaults: { uHeight: 2, price: 9000, powerCapacity: 1200 } }, // in Watts
  
  // Cables and Monitor are not rack-mountable
  'monitor': { name: 'จอภาพ', icon: MonitorIcon, defaults: { size: '24"', price: 4000 } },
  'utp-cat6': { name: 'UTP CAT6', icon: UtpCat6Icon, defaults: { length: 1, price: 20 } },
  'fiber-optic': { name: 'Fiber Optic', icon: FiberOpticIcon, defaults: { length: 1, price: 40 } },
};

export function createDevice(type: DeviceType, x: number, y: number, existingDevices: Device[]): Device {
  const count = existingDevices.filter(d => d.type === type).length + 1;
  const config = DEVICE_CONFIG[type];

  return {
    id: `dev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: type,
    x,
    y,
    label: `${config.name}-${count}`,
    ...config.defaults
  } as Device;
}
