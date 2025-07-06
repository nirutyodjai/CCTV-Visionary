'use client';

import {
    CctvBulletIcon, CctvDomeIcon, CctvPtzIcon,
    NvrIcon, SwitchIcon, RackIcon, MonitorIcon, WifiApIcon,
    UtpCat6Icon, FiberOpticIcon, TableIcon,
} from '@/components/icons';
import { Server, Zap, HardDrive, PanelTop, Power, Router } from 'lucide-react';

import type { DeviceConfig, DeviceType, RackDeviceType } from './types';

export const RACK_DEVICE_TYPES: RackDeviceType[] = ['nvr', 'switch', 'patch-panel', 'pdu', 'ups'];

export const DEVICE_CONFIG: { [key in DeviceType]: DeviceConfig } = {
    // CCTV Cameras
    'cctv-bullet': {
        name: 'Bullet Camera',
        icon: CctvBulletIcon,
        colorClass: 'bg-sky-100 dark:bg-sky-900/50 border-sky-300 dark:border-sky-700',
        defaults: { price: 1800, powerConsumption: 6, resolution: '1080p', fov: 90, range: 30, uHeight: 0 }
    },
    'cctv-dome': {
        name: 'Dome Camera',
        icon: CctvDomeIcon,
        colorClass: 'bg-sky-100 dark:bg-sky-900/50 border-sky-300 dark:border-sky-700',
        defaults: { price: 1500, powerConsumption: 5, resolution: '1080p', fov: 90, range: 20, uHeight: 0 }
    },
    'cctv-ptz': {
        name: 'PTZ Camera',
        icon: CctvPtzIcon,
        colorClass: 'bg-sky-100 dark:bg-sky-900/50 border-sky-300 dark:border-sky-700',
        defaults: { price: 4500, powerConsumption: 20, resolution: '2K', fov: 120, range: 50, uHeight: 0 }
    },
    // Network Devices
    'nvr': {
        name: 'NVR/DVR',
        icon: HardDrive,
        colorClass: 'bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700',
        defaults: { price: 8500, powerConsumption: 50, uHeight: 2, channels: 16 }
    },
    'switch': {
        name: 'Switch',
        icon: SwitchIcon,
        colorClass: 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700',
        defaults: { price: 2500, powerConsumption: 30, uHeight: 1, ports: 16 }
    },
    'wifi-ap': {
        name: 'Wi-Fi AP',
        icon: WifiApIcon,
        colorClass: 'bg-violet-100 dark:bg-violet-900/50 border-violet-300 dark:border-violet-700',
        defaults: { price: 3000, powerConsumption: 12, range: 20, uHeight: 0 }
    },
    // Rack & Power
    'rack-indoor': {
        name: 'Indoor Rack',
        icon: RackIcon,
        colorClass: 'bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-600',
        defaults: { price: 3500, rack_size: '9U', uHeight: 0 }
    },
    'rack-outdoor': {
        name: 'Outdoor Rack',
        icon: Server,
        colorClass: 'bg-gray-300 dark:bg-gray-700 border-gray-400 dark:border-gray-500',
        defaults: { price: 7500, rack_size: '12U', uHeight: 0 }
    },
    'ups': {
        name: 'UPS',
        icon: Zap,
        colorClass: 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700',
        defaults: { price: 9000, powerConsumption: 10, uHeight: 2, powerCapacity: 900 }
    },
    'pdu': {
        name: 'PDU',
        icon: Power,
        colorClass: 'bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700',
        defaults: { price: 2000, powerConsumption: 2, uHeight: 1, powerCapacity: 2200 }
    },
     'patch-panel': {
        name: 'Patch Panel',
        icon: PanelTop,
        colorClass: 'bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600',
        defaults: { price: 1200, powerConsumption: 0, uHeight: 1, ports: 24 }
    },
    // Other
    'monitor': {
        name: 'Monitor',
        icon: MonitorIcon,
        colorClass: 'bg-fuchsia-100 dark:bg-fuchsia-900/50 border-fuchsia-300 dark:border-fuchsia-700',
        defaults: { price: 4000, powerConsumption: 35, uHeight: 0 }
    },
    'table': {
        name: 'Table',
        icon: TableIcon,
        defaults: { uHeight: 0 }
    },
    // Cables
    'utp-cat6': { name: 'UTP CAT6', icon: UtpCat6Icon, defaults: { price: 15, uHeight: 0 }},
    'fiber-optic': { name: 'Fiber Optic', icon: FiberOpticIcon, defaults: { price: 40, uHeight: 0 }},
};


export function createDevice(type: DeviceType, x: number, y: number, existingDevices: any[]) {
    const config = DEVICE_CONFIG[type];
    if (!config) {
        throw new Error(`Unknown device type: ${type}`);
    }

    const count = existingDevices.filter(d => d.type === type).length + 1;

    return {
        id: `${type}_${Date.now()}`,
        type: type,
        label: `${config.name} ${count}`,
        x,
        y,
        ...config.defaults
    };
}
