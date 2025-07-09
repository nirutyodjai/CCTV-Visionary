import { CctvBulletIcon, CctvDomeIcon, CctvPtzIcon, WifiApIcon, NvrIcon, SwitchIcon, MonitorIcon, UtpCat6Icon, FiberOpticIcon, RackIcon, TableIcon } from "@/components/icons";
import { Server, Zap, HardDrive, PanelTop, Power } from 'lucide-react';
import type { DeviceType, BaseDevice, DeviceConfig } from "./types";


export const DEVICE_CONFIG: Record<DeviceType, DeviceConfig> = {
  'cctv-bullet': { name: 'กล้องกระบอก', icon: CctvBulletIcon, defaults: { resolution: '1080p', fov: 90, range: 20, rotation: 0 } },
  'cctv-dome': { name: 'กล้องโดม', icon: CctvDomeIcon, defaults: { resolution: '1080p', fov: 90, range: 20, rotation: 0 } },
  'cctv-ptz': { name: 'กล้อง PTZ', icon: CctvPtzIcon, defaults: { resolution: '1080p', fov: 120, range: 30, rotation: 0 } },
  'thermal-camera': { name: 'Thermal Camera', icon: CctvBulletIcon, defaults: { 
    subtype: 'thermal',
    specs: {
      resolution: '384x288',
      thermalSensitivity: '0.05°C',
      temperatureRange: '-20°C to 120°C',
      calibrationMode: 'auto',
      spectralRange: '8-14μm',
      frameRate: 25
    }
  }},
  'wifi-ap': { name: 'WiFi AP', icon: WifiApIcon, defaults: { range: 15 } },
  'nvr': { name: 'NVR/DVR', icon: NvrIcon, defaults: { channels: 16, storage: '4TB' } },
  'switch': { name: 'สวิตช์', icon: SwitchIcon, defaults: { ports: 8 } },
  'monitor': { name: 'จอภาพ', icon: MonitorIcon, defaults: { size: '24"' } },
  'utp-cat6': { name: 'UTP CAT6', icon: UtpCat6Icon, defaults: { length: 10 } },
  'fiber-optic': { name: 'Fiber Optic', icon: FiberOpticIcon, defaults: { length: 10 } },
  'rack': { name: 'Rack', icon: RackIcon, defaults: { uHeight: 42 } },
  'rack-indoor': { name: 'ตู้ Rack (Indoor)', icon: RackIcon, defaults: { size: '9U' } },
  'rack-outdoor': { name: 'ตู้ Rack (Outdoor)', icon: RackIcon, defaults: { size: '9U', ip_rating: 'IP65' } },
  'patch-panel': { name: 'Patch Panel', icon: PanelTop, defaults: { ports: 24, uHeight: 1 } },
  'pdu': { name: 'PDU', icon: Power, defaults: { powerCapacity: 32, uHeight: 1 } },
  'ups': { name: 'UPS', icon: HardDrive, defaults: { powerCapacity: 1000, uHeight: 2 } },
  'table': { name: 'โต๊ะ', icon: TableIcon, defaults: {} },
  'elevator': { name: 'Elevator', icon: TableIcon, defaults: {} },
  'datacenter': { name: 'Data Center', icon: Server, defaults: {} },
  'network': { name: 'Network', icon: SwitchIcon, defaults: {} },
  'communication': { name: 'Communication', icon: SwitchIcon, defaults: {} },
  'electrical-panel': { name: 'Electrical Panel', icon: Zap, defaults: {} },
  'bms': { name: 'BMS', icon: HardDrive, defaults: {} },
  'fire-alarm': { name: 'Fire Alarm', icon: Zap, defaults: {} },
  'access-control': { name: 'Access Control', icon: HardDrive, defaults: {} },
  'pa-system': { name: 'PA System', icon: HardDrive, defaults: {} },
  'audio-system': { name: 'Audio System', icon: HardDrive, defaults: {} },
  'matv': { name: 'MATV', icon: MonitorIcon, defaults: {} },
  'satellite': { name: 'Satellite', icon: MonitorIcon, defaults: {} },
  'nursecall': { name: 'Nurse Call', icon: HardDrive, defaults: {} },
};

export const THERMAL_CAMERA_SPECS = {
  name: 'Thermal Camera',
  type: 'camera',
  subtype: 'thermal',
  specs: {
    resolution: {
      options: ['160x120', '384x288', '640x480', '1024x768'],
      default: '384x288'
    },
    thermalSensitivity: {
      options: ['0.03°C', '0.05°C', '0.1°C'],
      default: '0.05°C'
    },
    temperatureRange: {
      options: [
        '-20°C to 120°C',
        '-40°C to 160°C',
        '0°C to 350°C',
        '200°C to 1500°C'
      ],
      default: '-20°C to 120°C'
    },
    calibrationMode: {
      options: ['auto', 'manual', 'scheduled'],
      default: 'auto'
    },
    spectralRange: {
      options: ['7.5-14μm', '8-14μm', '3-5μm'],
      default: '8-14μm'
    },
    frameRate: {
      options: [9, 15, 25, 30],
      default: 25
    }
  }
};

export function createDevice(type: DeviceType, x: number, y: number, existingDevices: BaseDevice[]): BaseDevice {
  const count = existingDevices.filter(d => d.type === type).length + 1;
  const config = DEVICE_CONFIG[type];

  return {
    id: `dev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: type,
    x,
    y,
    label: `${config.name}-${count}`,
    ...config.defaults
  } as BaseDevice;
}
