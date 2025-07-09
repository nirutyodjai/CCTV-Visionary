import type { ProjectState, Building, Floor, AnyDevice, Connection, CableType, DeviceType, ArchitecturalElement, CameraDevice } from './types';
import { createDevice } from './device-config';

// Helper function to create camera with realistic angles and coverage
function createRealisticCamera(
  type: 'cctv-bullet' | 'cctv-dome' | 'cctv-ptz',
  x: number,
  y: number,
  rotation: number,
  existingDevices: AnyDevice[],
  label?: string,
  fov?: number
): CameraDevice {
  const baseDevice = createDevice(type, x, y, existingDevices);
  
  // Define realistic FOV based on camera type
  const defaultFOV = {
    'cctv-bullet': 90,  // Wide angle for general surveillance
    'cctv-dome': 110,   // Ultra-wide for dome coverage
    'cctv-ptz': 120     // Variable, but wider when zoomed out
  };

  return {
    ...baseDevice,
    rotation,
    fov: fov || defaultFOV[type],
    resolution: type === 'cctv-ptz' ? '4K' : type === 'cctv-dome' ? '2K' : '1080p',
    range: type === 'cctv-ptz' ? 50 : type === 'cctv-bullet' ? 25 : 20,
    zoomLevel: type === 'cctv-ptz' ? 1 : undefined,
    label: label || `${baseDevice.label}`
  } as CameraDevice;
}

export function generateDemoProject(): ProjectState {
  // --- Building A: Main Office ---
  
  // Floor 1 - Reception Area with Strategic Camera Placement
  const b1_f1_devices: AnyDevice[] = [];
  const b1_f1_switch = createDevice('switch', 0.5, 0.5, b1_f1_devices);
  b1_f1_devices.push(b1_f1_switch);
  const b1_f1_nvr = createDevice('nvr', 0.6, 0.5, b1_f1_devices);
  b1_f1_devices.push(b1_f1_nvr);
  
  // Strategic camera placement with realistic angles for maximum coverage
  // Corner cameras covering entrances and main areas
  b1_f1_devices.push(createRealisticCamera('cctv-dome', 0.15, 0.15, 135, b1_f1_devices, 'กล้องทางเข้าหลัก', 110));
  b1_f1_devices.push(createRealisticCamera('cctv-dome', 0.85, 0.15, 225, b1_f1_devices, 'กล้องมุมขวาหน้า', 110));
  b1_f1_devices.push(createRealisticCamera('cctv-bullet', 0.15, 0.85, 45, b1_f1_devices, 'กล้องทางออกหลัง', 90));
  b1_f1_devices.push(createRealisticCamera('cctv-ptz', 0.5, 0.3, 180, b1_f1_devices, 'กล้อง PTZ กลางห้อง', 120));
  
  // Additional coverage for blind spots
  b1_f1_devices.push(createRealisticCamera('cctv-bullet', 0.85, 0.85, 315, b1_f1_devices, 'กล้องมุมขวาหลัง', 85));

  const b1_f1_connections: Connection[] = b1_f1_devices
    .filter(d => d.type === 'cctv-dome')
    .map(cam => ({ id: `conn_${cam.id}`, fromDeviceId: cam.id, toDeviceId: b1_f1_switch.id, cableType: 'utp-cat6' }));
  b1_f1_connections.push({ id: 'conn_sw_nvr', fromDeviceId: b1_f1_switch.id, toDeviceId: b1_f1_nvr.id, cableType: 'utp-cat6'});

  const b1_f1_arch: ArchitecturalElement[] = [
    // Outer Walls
    { id: 'wall_out_1', type: 'wall', points: [{x:0.05, y:0.05}, {x:0.95, y:0.05}] },
    { id: 'wall_out_2', type: 'wall', points: [{x:0.95, y:0.05}, {x:0.95, y:0.95}] },
    { id: 'wall_out_3', type: 'wall', points: [{x:0.95, y:0.95}, {x:0.05, y:0.95}] },
    { id: 'wall_out_4', type: 'wall', points: [{x:0.05, y:0.95}, {x:0.05, y:0.05}] },
    // Inner Walls
    { id: 'wall_in_1', type: 'wall', points: [{x:0.4, y:0.05}, {x:0.4, y:0.6}] },
    { id: 'wall_in_2', type: 'wall', points: [{x:0.4, y:0.6}, {x:0.7, y:0.6}] },
    // Doors for realistic access
    { id: 'door_main', type: 'door', points: [{x:0.45, y:0.05}, {x:0.55, y:0.05}] },
    { id: 'door_office', type: 'door', points: [{x:0.4, y:0.4}, {x:0.4, y:0.5}] },
  ];

  // Floor 2 - Office Area with Comprehensive Coverage
  const b1_f2_devices: AnyDevice[] = [];
  const b1_f2_switch = createDevice('switch', 0.5, 0.5, b1_f2_devices);
  b1_f2_devices.push(b1_f2_switch);
  
  // Strategic office cameras with realistic coverage patterns
  b1_f2_devices.push(createRealisticCamera('cctv-dome', 0.2, 0.2, 135, b1_f2_devices, 'กล้องโซนประชุม', 110));
  b1_f2_devices.push(createRealisticCamera('cctv-dome', 0.8, 0.2, 225, b1_f2_devices, 'กล้องโซนผู้บริหาร', 100));
  b1_f2_devices.push(createRealisticCamera('cctv-bullet', 0.2, 0.8, 45, b1_f2_devices, 'กล้องโซนพนักงาน 1', 90));
  b1_f2_devices.push(createRealisticCamera('cctv-bullet', 0.8, 0.8, 315, b1_f2_devices, 'กล้องโซนพนักงาน 2', 90));
  b1_f2_devices.push(createRealisticCamera('cctv-ptz', 0.5, 0.6, 180, b1_f2_devices, 'กล้อง PTZ ห้องประชุมใหญ่', 120));
  b1_f2_devices.push(createRealisticCamera('cctv-bullet', 0.1, 0.5, 90, b1_f2_devices, 'กล้องทางเดินซ้าย', 85));
  b1_f2_devices.push(createRealisticCamera('cctv-bullet', 0.9, 0.5, 270, b1_f2_devices, 'กล้องทางเดินขวา', 85));
  b1_f2_devices.push(createRealisticCamera('cctv-dome', 0.5, 0.1, 180, b1_f2_devices, 'กล้องลิฟท์', 105));
  
  const b1_f2_connections: Connection[] = b1_f2_devices
    .filter(d => d.type.startsWith('cctv-'))
    .map(cam => ({ id: `conn_${cam.id}`, fromDeviceId: cam.id, toDeviceId: b1_f2_switch.id, cableType: 'utp-cat6' as CableType }));
  
  // Link between floors
  b1_f2_connections.push({ id: 'conn_b1f1_b1f2', fromDeviceId: b1_f1_switch.id, toDeviceId: b1_f2_switch.id, cableType: 'fiber-optic' });

  const building1: Building = {
    id: 'bld_demo_1',
    name: 'อาคาร A - สำนักงานหลัก',
    floors: [
      { id: 'flr_demo_1_1', name: 'ชั้น 1 - โถงต้อนรับ', devices: b1_f1_devices, connections: b1_f1_connections, architecturalElements: b1_f1_arch, diagnostics: [] },
      { id: 'flr_demo_1_2', name: 'ชั้น 2 - สำนักงาน', devices: b1_f2_devices, connections: b1_f2_connections, architecturalElements: [], diagnostics: [] },
    ]
  };

  // --- Building B: Warehouse with Security Focus ---
  const b2_f1_devices: AnyDevice[] = [];
  const b2_f1_switch = createDevice('switch', 0.5, 0.2, b2_f1_devices);
  b2_f1_devices.push(b2_f1_switch);
  
  // Warehouse security cameras with wide coverage for large spaces
  b2_f1_devices.push(createRealisticCamera('cctv-bullet', 0.1, 0.1, 135, b2_f1_devices, 'กล้องทางเข้าคลัง', 90));
  b2_f1_devices.push(createRealisticCamera('cctv-bullet', 0.9, 0.1, 225, b2_f1_devices, 'กล้องโซนรับสินค้า', 90));
  b2_f1_devices.push(createRealisticCamera('cctv-bullet', 0.1, 0.9, 45, b2_f1_devices, 'กล้องโซนส่งสินค้า', 90));
  b2_f1_devices.push(createRealisticCamera('cctv-bullet', 0.9, 0.9, 315, b2_f1_devices, 'กล้องโซนจัดเก็บ', 90));
  b2_f1_devices.push(createRealisticCamera('cctv-ptz', 0.5, 0.5, 0, b2_f1_devices, 'กล้อง PTZ กลางคลัง', 120));
  b2_f1_devices.push(createRealisticCamera('cctv-bullet', 0.3, 0.1, 180, b2_f1_devices, 'กล้องแยกสินค้า 1', 85));
  b2_f1_devices.push(createRealisticCamera('cctv-bullet', 0.7, 0.1, 180, b2_f1_devices, 'กล้องแยกสินค้า 2', 85));
  b2_f1_devices.push(createRealisticCamera('cctv-bullet', 0.1, 0.5, 90, b2_f1_devices, 'กล้องทางเดินซ้าย', 85));
  b2_f1_devices.push(createRealisticCamera('cctv-bullet', 0.9, 0.5, 270, b2_f1_devices, 'กล้องทางเดินขวา', 85));
  b2_f1_devices.push(createRealisticCamera('cctv-dome', 0.3, 0.7, 45, b2_f1_devices, 'กล้องโซนคุณภาพ', 110));
  b2_f1_devices.push(createRealisticCamera('cctv-dome', 0.7, 0.7, 315, b2_f1_devices, 'กล้องโซนแพ็คสินค้า', 110));
  b2_f1_devices.push(createRealisticCamera('cctv-bullet', 0.5, 0.9, 0, b2_f1_devices, 'กล้องโซนขนส่ง', 90));
  
  const b2_f1_connections: Connection[] = b2_f1_devices
    .filter(d => d.type.startsWith('cctv-'))
    .map(cam => ({ id: `conn_${cam.id}`, fromDeviceId: cam.id, toDeviceId: b2_f1_switch.id, cableType: 'utp-cat6' as CableType }));
  
  // Link between buildings
  b2_f1_connections.push({ id: 'conn_b1_b2', fromDeviceId: b1_f1_switch.id, toDeviceId: b2_f1_switch.id, cableType: 'fiber-optic' });
  
  const building2: Building = {
    id: 'bld_demo_2',
    name: 'อาคาร B - คลังสินค้า',
    floors: [
        { id: 'flr_demo_2_1', name: 'ชั้น 1 - โซนจัดเก็บ', devices: b2_f1_devices, connections: b2_f1_connections, architecturalElements: [], diagnostics: [] }
    ]
  };

  // --- Assemble Project ---
  const project: ProjectState = {
    id: `proj_${Date.now()}`,
    projectName: 'โครงการสาธิต ศูนย์กระจายสินค้า - ระบบ CCTV ครอบคลุม 360°',
    buildings: [building1, building2],
  };

  return project;
}

export function createInitialState(): ProjectState {
    return generateDemoProject();
}
