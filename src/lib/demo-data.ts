import type { ProjectState, Building, Floor, Device, Connection, CableType, DeviceType, ArchitecturalElement } from './types';
import { createDevice } from './device-config';

export function generateDemoProject(): ProjectState {
  // --- Building A: Main Office ---
  
  // Floor 1
  const b1_f1_devices: Device[] = [];
  const b1_f1_switch = createDevice('switch', 0.5, 0.5, b1_f1_devices);
  b1_f1_devices.push(b1_f1_switch);
  const b1_f1_nvr = createDevice('nvr', 0.6, 0.5, b1_f1_devices);
  b1_f1_devices.push(b1_f1_nvr);
  b1_f1_devices.push(createDevice('cctv-dome', 0.25, 0.25, b1_f1_devices));
  b1_f1_devices.push(createDevice('cctv-dome', 0.75, 0.25, b1_f1_devices));
  b1_f1_devices.push(createDevice('cctv-dome', 0.25, 0.75, b1_f1_devices));
  b1_f1_devices.push(createDevice('cctv-dome', 0.75, 0.75, b1_f1_devices));

  const b1_f1_connections: Connection[] = b1_f1_devices
    .filter(d => d.type === 'cctv-dome')
    .map(cam => ({ id: `conn_${cam.id}`, fromDeviceId: cam.id, toDeviceId: b1_f1_switch.id, cableType: 'utp-cat6' }));
  b1_f1_connections.push({ id: 'conn_sw_nvr', fromDeviceId: b1_f1_switch.id, toDeviceId: b1_f1_nvr.id, cableType: 'utp-cat6'});

  const b1_f1_arch: ArchitecturalElement[] = [
    // Outer Walls
    { id: 'wall_out_1', type: 'wall', start: {x:0.05, y:0.05}, end: {x:0.95, y:0.05} },
    { id: 'wall_out_2', type: 'wall', start: {x:0.95, y:0.05}, end: {x:0.95, y:0.95} },
    { id: 'wall_out_3', type: 'wall', start: {x:0.95, y:0.95}, end: {x:0.05, y:0.95} },
    { id: 'wall_out_4', type: 'wall', start: {x:0.05, y:0.95}, end: {x:0.05, y:0.05} },
    // Inner Walls
    { id: 'wall_in_1', type: 'wall', start: {x:0.4, y:0.05}, end: {x:0.4, y:0.6} },
    { id: 'wall_in_2', type: 'wall', start: {x:0.4, y:0.6}, end: {x:0.7, y:0.6} },
  ];

  // Floor 2
  const b1_f2_devices: Device[] = [];
  const b1_f2_switch = createDevice('switch', 0.5, 0.5, b1_f2_devices);
  b1_f2_devices.push(b1_f2_switch);
  for(let i=0; i<8; i++){
      b1_f2_devices.push(createDevice('cctv-dome', Math.random() * 0.9 + 0.05, Math.random() * 0.9 + 0.05, b1_f2_devices));
  }
  const b1_f2_connections: Connection[] = b1_f2_devices
    .filter(d => d.type === 'cctv-dome')
    .map(cam => ({ id: `conn_${cam.id}`, fromDeviceId: cam.id, toDeviceId: b1_f2_switch.id, cableType: 'utp-cat6' }));
  
  // Link between floors
  b1_f2_connections.push({ id: 'conn_b1f1_b1f2', fromDeviceId: b1_f1_switch.id, toDeviceId: b1_f2_switch.id, cableType: 'fiber-optic' });

  const building1: Building = {
    id: 'bld_demo_1',
    name: 'อาคาร A - สำนักงานหลัก',
    floors: [
      { id: 'flr_demo_1_1', name: 'ชั้น 1 - โถงต้อนรับ', floorPlanUrl: null, devices: b1_f1_devices, connections: b1_f1_connections, architecturalElements: b1_f1_arch, diagnostics: [] },
      { id: 'flr_demo_1_2', name: 'ชั้น 2 - สำนักงาน', floorPlanUrl: null, devices: b1_f2_devices, connections: b1_f2_connections, architecturalElements: [], diagnostics: [] },
    ]
  };

  // --- Building B: Warehouse ---
  const b2_f1_devices: Device[] = [];
  const b2_f1_switch = createDevice('switch', 0.5, 0.2, b2_f1_devices);
  b2_f1_devices.push(b2_f1_switch);
  for(let i=0; i<12; i++){
      b2_f1_devices.push(createDevice('cctv-bullet', Math.random() * 0.9 + 0.05, Math.random() * 0.9 + 0.05, b2_f1_devices));
  }
  const b2_f1_connections: Connection[] = b2_f1_devices
    .filter(d => d.type === 'cctv-bullet')
    .map(cam => ({ id: `conn_${cam.id}`, fromDeviceId: cam.id, toDeviceId: b2_f1_switch.id, cableType: 'utp-cat6' }));
  
  // Link between buildings
  b2_f1_connections.push({ id: 'conn_b1_b2', fromDeviceId: b1_f1_switch.id, toDeviceId: b2_f1_switch.id, cableType: 'fiber-optic' });
  
  const building2: Building = {
    id: 'bld_demo_2',
    name: 'อาคาร B - คลังสินค้า',
    floors: [
        { id: 'flr_demo_2_1', name: 'ชั้น 1 - โซนจัดเก็บ', floorPlanUrl: null, devices: b2_f1_devices, connections: b2_f1_connections, architecturalElements: [], diagnostics: [] }
    ]
  };

  // --- Assemble Project ---
  const project: ProjectState = {
    id: `proj_${Date.now()}`,
    projectName: 'โครงการสาธิต ศูนย์กระจายสินค้า',
    buildings: [building1, building2],
    vlans: [
      { id: 10, name: 'CCTV-VLAN', color: 'hsl(var(--destructive))' },
      { id: 20, name: 'OFFICE-VLAN', color: 'hsl(var(--primary))' },
      { id: 30, name: 'WAREHOUSE-VLAN', color: 'hsl(var(--success))' },
    ],
    subnets: [
        { id: 'sub_demo_1', cidr: '10.10.10.0/24', buildingId: building1.id },
        { id: 'sub_demo_2', cidr: '10.10.20.0/24', buildingId: building2.id },
    ],
  };

  return project;
}

export function createInitialState(): ProjectState {
    return generateDemoProject();
}
