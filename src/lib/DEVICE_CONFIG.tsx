import { CctvBulletIcon, CctvDomeIcon, CctvPtzIcon, WifiApIcon, NvrIcon, SwitchIcon, MonitorIcon, UtpCat6Icon, FiberOpticIcon, RackIcon, TableIcon } from "@/components/icons";
import { Server, Zap, HardDrive, PanelTop, Power } from 'lucide-react';
import type { DeviceType, Device, DeviceConfig } from "./types";


export const DEVICE_CONFIG: Record<DeviceType, DeviceConfig> = {
  'cctv-bullet': { name: 'กล้องกระบอก', icon: CctvBulletIcon, defaults: { resolution: '1080p', fov: 90, range: 20, rotation: 0 } },
  'cctv-dome': { name: 'กล้องโดม', icon: CctvDomeIcon, defaults: { resolution: '1080p', fov: 90, range: 20, rotation: 0 } },
  'cctv-ptz': { name: 'กล้อง PTZ', icon: CctvPtzIcon, defaults: { resolution: '1080p', fov: 120, range: 30, rotation: 0 } },
  'wifi-ap': { name: 'WiFi AP', icon: WifiApIcon, defaults: { range: 15 } },
  'nvr': { name: 'NVR/DVR', icon: NvrIcon, defaults: { channels: 16, storage: '4TB' } },
  'switch': { name: 'สวิตช์', icon: SwitchIcon, defaults: { ports: 8 } },
  'monitor': { name: 'จอภาพ', icon: MonitorIcon, defaults: { size: '24"' } },
  'utp-cat6': { name: 'UTP CAT6', icon: UtpCat6Icon, defaults: { length: 10 } },
  'fiber-optic': { name: 'Fiber Optic', icon: FiberOpticIcon, defaults: { length: 10 } },
  'rack-indoor': { name: 'ตู้ Rack (Indoor)', icon: RackIcon, defaults: { size: '9U' } },
  'rack-outdoor': { name: 'ตู้ Rack (Outdoor)', icon: RackIcon, defaults: { size: '9U', ip_rating: 'IP65' } },
  'patch-panel': { name: 'Patch Panel', icon: PanelTop, defaults: { ports: 24, uHeight: 1 } },
  'pdu': { name: 'PDU', icon: Power, defaults: { powerCapacity: 32, uHeight: 1 } },
  'ups': { name: 'UPS', icon: HardDrive, defaults: { powerCapacity: 1000, uHeight: 2 } },
  'table': { name: 'โต๊ะ', icon: TableIcon, defaults: {} },
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
