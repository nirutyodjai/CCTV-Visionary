import type { ProjectState, Building, Floor, AnyDevice, Connection, CableType, RackContainer, RackDevice } from './types';

// This function generates a complete, realistic demo project state.
export function generateDemoProject(): ProjectState {
  
  // --- Define Rack Devices for Floor 1 ---
  const rack_f1_nvr: RackDevice = {
    id: 'rack_dev_nvr_1',
    type: 'nvr',
    label: 'NVR-01 (16CH)',
    uPosition: 1,
    uHeight: 2,
    price: 8500,
    powerConsumption: 50
  };
  
  const rack_f1_main_switch: RackDevice = {
    id: 'rack_dev_switch_1',
    type: 'switch',
    label: 'Main-Switch-24P',
    uPosition: 3,
    uHeight: 1,
    price: 4500,
    powerConsumption: 40
  };
  
  const rack_f1_patch_panel: RackDevice = {
    id: 'rack_dev_patch_1',
    type: 'patch-panel',
    label: 'Patch-Panel-24P',
    uPosition: 4,
    uHeight: 1,
    price: 1200,
    powerConsumption: 0
  };

  const rack_f1_ups: RackDevice = {
    id: 'rack_dev_ups_1',
    type: 'ups',
    label: 'UPS-1500VA',
    uPosition: 8,
    uHeight: 2,
    price: 9000,
    powerConsumption: 10,
    powerCapacity: 900
  };

  // --- Define Floor Plan Devices ---
  
  // Floor 1
  const b1_f1_rack: RackContainer = {
    id: 'f1_main_rack',
    type: 'rack-indoor',
    label: 'ตู้ Rack หลัก',
    x: 0.5,
    y: 0.15,
    rack_size: '9U',
    price: 2800,
    devices: [rack_f1_nvr, rack_f1_main_switch, rack_f1_patch_panel, rack_f1_ups]
  };

  const b1_f1_cam_bullet_1: AnyDevice = {
    id: 'f1_cam_bullet_1', type: 'cctv-bullet', label: 'กล้องทางเข้า',
    x: 0.1, y: 0.8, price: 1800, powerConsumption: 6, resolution: '1080p', fov: 110, range: 30, rotation: 135
  };
  
  const b1_f1_cam_dome_1: AnyDevice = {
    id: 'f1_cam_dome_1', type: 'cctv-dome', label: 'กล้องโถงต้อนรับ',
    x: 0.35, y: 0.5, price: 1500, powerConsumption: 5, resolution: '1080p', fov: 90, range: 20, rotation: 0
  };

  const b1_f1_ap_1: AnyDevice = {
    id: 'f1_ap_1', type: 'wifi-ap', label: 'AP-Lobby',
    x: 0.75, y: 0.5, price: 2500, powerConsumption: 12, range: 18
  };
  
  const building1_floor1_devices: AnyDevice[] = [b1_f1_rack, b1_f1_cam_bullet_1, b1_f1_cam_dome_1, b1_f1_ap_1];
  
  const building1_floor1_connections: Connection[] = [
    { id: 'conn_f1_bullet1', fromDeviceId: b1_f1_cam_bullet_1.id, toDeviceId: b1_f1_rack.id, cableType: 'utp-cat6' },
    { id: 'conn_f1_dome1', fromDeviceId: b1_f1_cam_dome_1.id, toDeviceId: b1_f1_rack.id, cableType: 'utp-cat6' },
    { id: 'conn_f1_ap1', fromDeviceId: b1_f1_ap_1.id, toDeviceId: b1_f1_rack.id, cableType: 'utp-cat6' },
  ];

  // Floor 2
  const b1_f2_switch: AnyDevice = {
    id: 'f2_switch_1', type: 'switch', label: 'Switch-F2-8P',
    x: 0.5, y: 0.5, price: 2200, powerConsumption: 25, ports: 8
  };
  
  const b1_f2_cam_ptz_1: AnyDevice = {
    id: 'f2_cam_ptz_1', type: 'cctv-ptz', label: 'PTZ-ห้องประชุม',
    x: 0.2, y: 0.2, price: 4500, powerConsumption: 20, resolution: '2K', fov: 120, range: 50, rotation: 45
  };
  
  const b1_f2_cam_dome_1: AnyDevice = {
    id: 'f2_cam_dome_1', type: 'cctv-dome', label: 'กล้อง Office-1',
    x: 0.8, y: 0.2, price: 1500, powerConsumption: 5, resolution: '1080p', fov: 90, range: 20, rotation: -45
  };
  
  const b1_f2_cam_dome_2: AnyDevice = {
    id: 'f2_cam_dome_2', type: 'cctv-dome', label: 'กล้อง Office-2',
    x: 0.8, y: 0.8, price: 1500, powerConsumption: 5, resolution: '1080p', fov: 90, range: 20, rotation: -135
  };

  const building1_floor2_devices: AnyDevice[] = [b1_f2_switch, b1_f2_cam_ptz_1, b1_f2_cam_dome_1, b1_f2_cam_dome_2];
  
  const building1_floor2_connections: Connection[] = [
    { id: 'conn_f2_ptz1', fromDeviceId: b1_f2_cam_ptz_1.id, toDeviceId: b1_f2_switch.id, cableType: 'utp-cat6' },
    { id: 'conn_f2_dome1', fromDeviceId: b1_f2_cam_dome_1.id, toDeviceId: b1_f2_switch.id, cableType: 'utp-cat6' },
    { id: 'conn_f2_dome2', fromDeviceId: b1_f2_cam_dome_2.id, toDeviceId: b1_f2_switch.id, cableType: 'utp-cat6' },
    // Connection between floors (physically a cable running from F2 switch to F1 rack)
    { id: 'conn_f2_to_f1', fromDeviceId: b1_f2_switch.id, toDeviceId: b1_f1_rack.id, cableType: 'fiber-optic' }
  ];

  // --- Assemble Project ---
  
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
            { id: 'wall1', type: 'wall', start: {x:0.05, y:0.05}, end: {x:0.95, y:0.05} },
            { id: 'wall2', type: 'wall', start: {x:0.95, y:0.05}, end: {x:0.95, y:0.95} },
            { id: 'wall3', type: 'wall', start: {x:0.95, y:0.95}, end: {x:0.05, y:0.95} },
            { id: 'wall4', type: 'wall', start: {x:0.05, y:0.95}, end: {x:0.05, y:0.05} },
        ],
        diagnostics: [],
      },
       {
        id: 'flr_demo_1_2',
        name: 'ชั้น 2 - สำนักงาน',
        floorPlanUrl: null,
        devices: building1_floor2_devices,
        connections: building1_floor2_connections,
        architecturalElements: [],
        diagnostics: [],
      },
    ]
  };
  
  const project: ProjectState = {
    id: `proj_demo_final`,
    projectName: 'โครงการสาธิต กรมชลประทาน',
    buildings: [building1],
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
