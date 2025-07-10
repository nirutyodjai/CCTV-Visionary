
import {
    CctvBulletIcon, CctvDomeIcon, CctvPtzIcon, MonitorIcon, NvrIcon,
    RackIcon, SwitchIcon, WifiApIcon, UtpCat6Icon, FiberOpticIcon
} from '@/components/icons';
import type { DeviceConfig, DeviceType } from './types';

export const DEVICE_CONFIG: Record<DeviceType, DeviceConfig> = {
    'cctv-bullet': {
        type: 'cctv-bullet',
        label: 'กล้องวงจรปิดแบบ Bullet',
        icon: CctvBulletIcon,
        colorClass: 'bg-red-500/80 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
        properties: { price: 1500, resolution: '1080p', fov: 90, range: 20, powerConsumption: 5 },
    },
    'cctv-dome': {
        type: 'cctv-dome',
        label: 'กล้องวงจรปิดแบบ Dome',
        icon: CctvDomeIcon,
        colorClass: 'bg-sky-500/80 border-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.6)]',
        properties: { price: 1800, resolution: '1080p', fov: 110, range: 15, powerConsumption: 4 },
    },
    'cctv-ptz': {
        type: 'cctv-ptz',
        label: 'กล้องวงจรปิด PTZ',
        icon: CctvPtzIcon,
        colorClass: 'bg-violet-500/80 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.6)]',
        properties: { price: 5500, resolution: '2K', fov: 120, range: 50, powerConsumption: 12, zoomLevel: 1 },
    },
    'monitor': {
        type: 'monitor',
        label: 'จอแสดงผล',
        icon: MonitorIcon,
        colorClass: 'bg-amber-500/80 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]',
        properties: { price: 4000, powerConsumption: 30 },
    },
    'nvr': {
        type: 'nvr',
        label: 'เครื่องบันทึก NVR',
        icon: NvrIcon,
        colorClass: 'bg-slate-500/80 border-slate-400 shadow-[0_0_15px_rgba(100,115,135,0.6)]',
        properties: { price: 8000, channels: 16, powerConsumption: 40 },
    },
    'rack': {
        type: 'rack',
        label: 'ตู้แร็ค',
        icon: RackIcon,
        colorClass: 'bg-gray-600/80 border-gray-500 shadow-[0_0_15px_rgba(75,85,99,0.6)]',
        properties: { price: 9000, powerConsumption: 0, uHeight: 42, devices: [] },
    },
    'switch': {
        type: 'switch',
        label: 'สวิตช์เครือข่าย',
        icon: SwitchIcon,
        colorClass: 'bg-green-500/80 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)]',
        properties: { price: 3500, ports: 24, powerConsumption: 20 },
    },
    'wifi-ap': {
        type: 'wifi-ap',
        label: 'Wi-Fi Access Point',
        icon: WifiApIcon,
        colorClass: 'bg-fuchsia-500/80 border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.6)]',
        properties: { price: 2800, powerConsumption: 8 },
    },
    'utp-cat6': {
        type: 'utp-cat6',
        label: 'สาย UTP CAT6',
        icon: UtpCat6Icon,
        colorClass: 'bg-blue-500/80 border-blue-400',
        properties: { price: 20 },
    },
    'fiber-optic': {
        type: 'fiber-optic',
        label: 'สาย Fiber Optic',
        icon: FiberOpticIcon,
        colorClass: 'bg-yellow-400/80 border-yellow-300',
        properties: { price: 40 },
    }
};

export const createDevice = (type: DeviceType, x: number, y: number, existingDevices: any[]) => {
    const config = DEVICE_CONFIG[type];
    const count = existingDevices.filter(d => d.type === type).length + 1;
    return {
        id: `${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        type: type,
        label: `${config.label} ${count}`,
        x,
        y,
        rotation: 0,
        ...config.properties,
    };
};
