
// นำเข้าไอคอนอุปกรณ์ต่างๆ
import {
    CctvBulletIcon, CctvDomeIcon, CctvPtzIcon, MonitorIcon, NvrIcon,
    RackIcon, SwitchIcon, WifiApIcon, UtpCat6Icon, FiberOpticIcon,
    DataCenterIcon, NetworkIcon,
    ElectricalPanelIcon, BmsIcon, FireAlarmPanelIcon, 
    AccessControlIcon, PaSystemIcon, AudioSystemIcon, 
    MatvIcon, SatelliteIcon, NurseCallIcon
} from '@/components/icons';
import { Server, Zap, HardDrive, PanelTop, Power, Table, Building } from 'lucide-react';
import type { DeviceConfig, DeviceType } from './types';

// คอนฟิกอุปกรณ์ทั้งหมดในระบบ CCTV
export const DEVICE_CONFIG: Record<DeviceType, DeviceConfig> = {
    // กล้องวงจรปิดแบบกระสุน
    'cctv-bullet': {
        type: 'cctv-bullet',
        label: 'กล้องวงจรปิดแบบกระสุน',
        icon: CctvBulletIcon,
        colorClass: 'bg-red-500/80 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.6)]',
        properties: { price: 1500, resolution: '1080p', fov: 90, range: 20, powerConsumption: 5 },
    },
    // กล้องวงจรปิดแบบโดม
    'cctv-dome': {
        type: 'cctv-dome',
        label: 'กล้องวงจรปิดแบบโดม',
        icon: CctvDomeIcon,
        colorClass: 'bg-sky-500/80 border-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.6)]',
        properties: { price: 1800, resolution: '1080p', fov: 110, range: 15, powerConsumption: 4 },
    },
    // กล้องวงจรปิดแบบหมุนได้
    'cctv-ptz': {
        type: 'cctv-ptz',
        label: 'กล้องวงจรปิดแบบหมุนได้',
        icon: CctvPtzIcon,
        colorClass: 'bg-violet-500/80 border-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.6)]',
        properties: { price: 5500, resolution: '2K', fov: 120, range: 50, powerConsumption: 12, zoomLevel: 1 },
    },
    // จอแสดงผล
    'monitor': {
        type: 'monitor',
        label: 'จอแสดงผล',
        icon: MonitorIcon,
        colorClass: 'bg-amber-500/80 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]',
        properties: { price: 4000, powerConsumption: 30 },
    },
    // เครื่องบันทึกภาพ
    'nvr': {
        type: 'nvr',
        label: 'เครื่องบันทึกภาพ',
        icon: NvrIcon,
        colorClass: 'bg-slate-500/80 border-slate-400 shadow-[0_0_15px_rgba(100,115,135,0.6)]',
        properties: { price: 8000, channels: 16, powerConsumption: 40 },
    },
    // ตู้แร็คใส่อุปกรณ์
    'rack': {
        type: 'rack',
        label: 'ตู้แร็คใส่อุปกรณ์',
        icon: RackIcon,
        colorClass: 'bg-gray-600/80 border-gray-500 shadow-[0_0_15px_rgba(75,85,99,0.6)]',
        properties: { price: 9000, powerConsumption: 0, uHeight: 42, devices: [] },
    },
    // สวิตช์เครือข่าย
    'switch': {
        type: 'switch',
        label: 'สวิตช์เครือข่าย',
        icon: SwitchIcon,
        colorClass: 'bg-green-500/80 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)]',
        properties: { price: 3500, ports: 24, powerConsumption: 20 },
    },
    // จุดเชื่อมต่อไวไฟ
    'wifi-ap': {
        type: 'wifi-ap',
        label: 'จุดเชื่อมต่อไวไฟ',
        icon: WifiApIcon,
        colorClass: 'bg-fuchsia-500/80 border-fuchsia-400 shadow-[0_0_15px_rgba(217,70,239,0.6)]',
        properties: { price: 2800, powerConsumption: 8 },
    },
    // สายแลน
    'utp-cat6': {
        type: 'utp-cat6',
        label: 'สายแลน',
        icon: UtpCat6Icon,
        colorClass: 'bg-blue-500/80 border-blue-400',
        properties: { price: 20 },
    },
    // สายใยแก้วนำแสง
    'fiber-optic': {
        type: 'fiber-optic',
        label: 'สายใยแก้วนำแสง',
        icon: FiberOpticIcon,
        colorClass: 'bg-yellow-400/80 border-yellow-300',
        properties: { price: 40 },
    },
    // กล้องความร้อน
    'thermal-camera': {
        type: 'thermal-camera',
        label: 'กล้องความร้อน',
        icon: CctvBulletIcon,
        colorClass: 'bg-orange-500/80 border-orange-400',
        properties: { price: 15000, resolution: '384x288', powerConsumption: 8 },
    },
    // ตู้แร็คภายใน
    'rack-indoor': {
        type: 'rack-indoor',
        label: 'ตู้แร็คภายใน',
        icon: RackIcon,
        colorClass: 'bg-blue-600/80 border-blue-500',
        properties: { price: 7000, size: '9U', powerConsumption: 0 },
    },
    // ตู้แร็คภายนอก
    'rack-outdoor': {
        type: 'rack-outdoor',
        label: 'ตู้แร็คภายนอก',
        icon: RackIcon,
        colorClass: 'bg-green-600/80 border-green-500',
        properties: { price: 12000, size: '9U', ip_rating: 'IP65', powerConsumption: 0 },
    },
    // แผงจ่ายสาย
    'patch-panel': {
        type: 'patch-panel',
        label: 'แผงจ่ายสาย',
        icon: PanelTop,
        colorClass: 'bg-gray-500/80 border-gray-400',
        properties: { price: 1500, ports: 24, uHeight: 1, powerConsumption: 0 },
    },
    // หน่วยจ่ายไฟ
    'pdu': {
        type: 'pdu',
        label: 'หน่วยจ่ายไฟ',
        icon: Power,
        colorClass: 'bg-red-600/80 border-red-500',
        properties: { price: 3000, powerCapacity: 32, uHeight: 1, powerConsumption: 0 },
    },
    // เครื่องสำรองไฟ
    'ups': {
        type: 'ups',
        label: 'เครื่องสำรองไฟ',
        icon: HardDrive,
        colorClass: 'bg-purple-600/80 border-purple-500',
        properties: { price: 8000, powerCapacity: 1000, uHeight: 2, powerConsumption: 0 },
    },
    // โต๊ะ
    'table': {
        type: 'table',
        label: 'โต๊ะ',
        icon: Table,
        colorClass: 'bg-brown-500/80 border-brown-400',
        properties: { price: 500, powerConsumption: 0 },
    },
    // ลิฟท์
    'elevator': {
        type: 'elevator',
        label: 'ลิฟท์',
        icon: Building,
        colorClass: 'bg-indigo-500/80 border-indigo-400',
        properties: { price: 50000, powerConsumption: 0 },
    },
    // ศูนย์ข้อมูล
    'datacenter': {
        type: 'datacenter',
        label: 'ศูนย์ข้อมูล',
        icon: Server,
        colorClass: 'bg-slate-700/80 border-slate-600',
        properties: { price: 100000, powerConsumption: 500 },
    },
    // เครือข่าย
    'network': {
        type: 'network',
        label: 'เครือข่าย',
        icon: NetworkIcon,
        colorClass: 'bg-cyan-500/80 border-cyan-400',
        properties: { price: 5000, powerConsumption: 0 },
    },
    // ระบบสื่อสาร
    'communication': {
        type: 'communication',
        label: 'ระบบสื่อสาร',
        icon: NetworkIcon,
        colorClass: 'bg-teal-500/80 border-teal-400',
        properties: { price: 8000, powerConsumption: 15 },
    },
    // แผงไฟฟ้า
    'electrical-panel': {
        type: 'electrical-panel',
        label: 'แผงไฟฟ้า',
        icon: ElectricalPanelIcon,
        colorClass: 'bg-yellow-600/80 border-yellow-500',
        properties: { price: 15000, powerConsumption: 0 },
    },
    // ระบบจัดการอาคาร
    'bms': {
        type: 'bms',
        label: 'ระบบจัดการอาคาร',
        icon: BmsIcon,
        colorClass: 'bg-emerald-600/80 border-emerald-500',
        properties: { price: 25000, powerConsumption: 50 },
    },
    // ระบบเตือนภัยเพลิงไหม้
    'fire-alarm': {
        type: 'fire-alarm',
        label: 'ระบบเตือนภัยเพลิงไหม้',
        icon: FireAlarmPanelIcon,
        colorClass: 'bg-red-700/80 border-red-600',
        properties: { price: 20000, powerConsumption: 25 },
    },
    // ระบบควบคุมการเข้าออก
    'access-control': {
        type: 'access-control',
        label: 'ระบบควบคุมการเข้าออก',
        icon: AccessControlIcon,
        colorClass: 'bg-purple-700/80 border-purple-600',
        properties: { price: 18000, powerConsumption: 20 },
    },
    // ระบบเสียงตามสาย
    'pa-system': {
        type: 'pa-system',
        label: 'ระบบเสียงตามสาย',
        icon: PaSystemIcon,
        colorClass: 'bg-pink-600/80 border-pink-500',
        properties: { price: 12000, powerConsumption: 30 },
    },
    // ระบบเสียง
    'audio-system': {
        type: 'audio-system',
        label: 'ระบบเสียง',
        icon: AudioSystemIcon,
        colorClass: 'bg-rose-600/80 border-rose-500',
        properties: { price: 10000, powerConsumption: 40 },
    },
    // ระบบทีวีรวม
    'matv': {
        type: 'matv',
        label: 'ระบบทีวีรวม',
        icon: MatvIcon,
        colorClass: 'bg-blue-700/80 border-blue-600',
        properties: { price: 15000, powerConsumption: 25 },
    },
    // ดาวเทียม
    'satellite': {
        type: 'satellite',
        label: 'ดาวเทียม',
        icon: SatelliteIcon,
        colorClass: 'bg-indigo-700/80 border-indigo-600',
        properties: { price: 30000, powerConsumption: 35 },
    },
    // ระบบเรียกพยาบาล
    'nursecall': {
        type: 'nursecall',
        label: 'ระบบเรียกพยาบาล',
        icon: NurseCallIcon,
        colorClass: 'bg-emerald-700/80 border-emerald-600',
        properties: { price: 8000, powerConsumption: 15 },
    }
};

// ฟังก์ชันสร้างอุปกรณ์ใหม่
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
