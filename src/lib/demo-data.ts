import type { ProjectState, Building, Floor, AnyDevice, Connection, CableType } from './types';
import { DEVICE_CONFIG } from './device-config';

// This function generates a complete, realistic demo project state.
export function generateDemoProject(): ProjectState {
  const buildings: Building[] = [];

  // --- Building 1: Main Office ---
  const building1_floor1_devices: AnyDevice[] = [];
  
  const b1_f1_nvr = { 
    ...DEVICE_CONFIG['nvr'].defaults, 
    id: 'demo_nvr_1', type: 'nvr', x: 0.5, y: 0.1, label: 'NVR-1' 
  } as AnyDevice;
  building1_floor1_devices.push(b1_f1_nvr);

  const b1_f1_switch = { 
    ...DEVICE_CONFIG['switch'].defaults, 
    id: 'demo_switch_1', type: 'switch', x: 0.5, y: 0.2, label: 'Switch-F1' 
  } as AnyDevice;
  building1_floor1_devices.push(b1_f1_switch);

  const floor1_cam_positions = [
    {x: 0.15, y: 0.25}, {x: 0.35, y: 0.25}, {x: 0.65, y: 0.25}, {x: 0.85, y: 0.25},
    {x: 0.15, y: 0.50}, {x: 0.85, y: 0.50}, {x: 0.15, y: 0.75}, {x: 0.35, y: 0.75}
  ];

  floor1_cam_positions.forEach((pos, i) => {
    const cam = {
      ...DEVICE_CONFIG['cctv-dome'].defaults,
      id: `demo_f1_cam_${i}`,
      type: 'cctv-dome',
      x: pos.x,
      y: pos.y,
      label: `กล้องโดม-${i + 1}`
    } as AnyDevice;
    building1_floor1_devices.push(cam);
  });

  const building1_floor1_connections: Connection[] = building1_floor1_devices
    .filter(d => d.type === 'cctv-dome')
    .map(cam => ({
        id: `conn_cam_${cam.id}`,
        fromDeviceId: cam.id,
        toDeviceId: b1_f1_switch.id,
        cableType: 'utp-cat6' as CableType
    }));

  building1_floor1_connections.push({
      id: 'conn_sw_nvr_f1',
      fromDeviceId: b1_f1_switch.id,
      toDeviceId: b1_f1_nvr.id,
      cableType: 'utp-cat6' as CableType
  });


  const building1_floor2_devices: AnyDevice[] = [];
  const b1_f2_switch = { 
    ...DEVICE_CONFIG['switch'].defaults, 
    id: 'demo_switch_2', type: 'switch', x: 0.5, y: 0.2, label: 'Switch-F2' 
  } as AnyDevice;
  building1_floor2_devices.push(b1_f2_switch);
  
  const floor2_cam_positions = [
      {x: 0.2, y: 0.2}, {x: 0.4, y: 0.2}, {x: 0.6, y: 0.2}, {x: 0.8, y: 0.2},
      {x: 0.2, y: 0.8}, {x: 0.4, y: 0.8}, {x: 0.6, y: 0.8}, {x: 0.8, y: 0.8}
  ];

  floor2_cam_positions.forEach((pos, i) => {
      const cam = {
        ...DEVICE_CONFIG['cctv-dome'].defaults,
        id: `demo_f2_cam_${i}`,
        type: 'cctv-dome',
        x: pos.x,
        y: pos.y,
        label: `กล้องโดม-${i + 9}` // continue numbering
      } as AnyDevice;
      building1_floor2_devices.push(cam);
  });

  const building1_floor2_connections: Connection[] = building1_floor2_devices
    .filter(d => d.type === 'cctv-dome')
    .map(cam => ({
        id: `conn_cam_${cam.id}`,
        fromDeviceId: cam.id,
        toDeviceId: b1_f2_switch.id,
        cableType: 'utp-cat6' as CableType
    }));
    
  // NOTE: This represents a connection between floors. It's stored on floor 1 but connects to a device on floor 2.
  building1_floor1_connections.push({
      id: 'conn_sw_f1_f2',
      fromDeviceId: b1_f1_switch.id,
      toDeviceId: b1_f2_switch.id,
      cableType: 'fiber-optic' as CableType
  });


  const building1: Building = {
    id: 'bld_demo_1',
    name: 'อาคาร A - สำนักงานหลัก',
    floors: [
      {
        id: 'flr_demo_1_1',
        name: 'ชั้น 1 - โถงต้อนรับ',
        floorPlanUrl: null,
        devices: building1_floor1_devices,
        connections: building1_floor1_connections,
        architecturalElements: [
            { id: 'wall1', type: 'wall', start: {x:0.1, y:0.1}, end: {x:0.9, y:0.1} },
            { id: 'wall2', type: 'wall', start: {x:0.1, y:0.9}, end: {x:0.9, y:0.9} },
        ],
        diagnostics: [],
        floorPlanRect: null,
      },
       {
        id: 'flr_demo_1_2',
        name: 'ชั้น 2 - สำนักงาน',
        floorPlanUrl: null,
        devices: building1_floor2_devices,
        connections: building1_floor2_connections,
        architecturalElements: [],
        diagnostics: [],
        floorPlanRect: null,
      },
    ]
  };
  buildings.push(building1);

  const project: ProjectState = {
    id: `proj_demo_12345`,
    projectName: 'โครงการสาธิต กรมชลประทาน',
    buildings: buildings,
    vlans: [
      { id: 10, name: 'CCTV-VLAN', color: 'hsl(var(--destructive))' },
      { id: 20, name: 'OFFICE-VLAN', color: 'hsl(var(--primary))' },
    ],
    subnets: [
        { id: 'sub_demo_1', cidr: '10.20.1.0/24', buildingId: building1.id, vlanId: 10 },
    ],
  };

  return project;
}


/**
 * Generates an empty project structure to start a new plan.
 * @returns An empty ProjectState object with one default building and floor.
 */
export function createInitialState(): ProjectState {
    return generateDemoProject();
}
