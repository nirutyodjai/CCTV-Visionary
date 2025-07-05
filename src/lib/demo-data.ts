import type { ProjectState, Building, Floor, Device, Connection, CableType, DeviceType } from './types';
import { createDevice } from './device-config';

// This function generates a complete, realistic demo project state.
export function generateDemoProject(): ProjectState {
  const buildings: Building[] = [];

  // --- Building 1: Main Office ---
  const building1_floor1_devices: Device[] = [];
  const b1_f1_nvr = createDevice('nvr', 0.5, 0.1, building1_floor1_devices);
  building1_floor1_devices.push(b1_f1_nvr);
  const b1_f1_switch = createDevice('switch', 0.5, 0.2, building1_floor1_devices);
  building1_floor1_devices.push(b1_f1_switch);

  for(let i=0; i<15; i++){
      const cam = createDevice('cctv-dome', Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1, building1_floor1_devices);
      building1_floor1_devices.push(cam);
  }

  const building1_floor1_connections: Connection[] = building1_floor1_devices
    .filter(d => d.type === 'cctv-dome')
    .map(cam => ({
        id: `conn_${cam.id}`,
        fromDeviceId: cam.id,
        toDeviceId: b1_f1_switch.id, // connect all cameras to the switch
        cableType: 'utp-cat6' as CableType
    }));

  building1_floor1_connections.push({
      id: 'conn_sw_nvr',
      fromDeviceId: b1_f1_switch.id,
      toDeviceId: b1_f1_nvr.id,
      cableType: 'utp-cat6' as CableType
  });

  const building1_floor2_devices: Device[] = [];
  const b1_f2_switch = createDevice('switch', 0.5, 0.2, building1_floor2_devices);
    building1_floor2_devices.push(b1_f2_switch);
  for(let i=0; i<20; i++){
      const cam = createDevice('cctv-dome', Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1, building1_floor2_devices);
      building1_floor2_devices.push(cam);
  }
  const building1_floor2_connections: Connection[] = building1_floor2_devices
    .filter(d => d.type === 'cctv-dome')
    .map(cam => ({
        id: `conn_${cam.id}`,
        fromDeviceId: cam.id,
        toDeviceId: b1_f2_switch.id, // connect all cameras to the switch
        cableType: 'utp-cat6' as CableType
    }));
    building1_floor2_connections.push({
        id: 'conn_b1f1_b1f2',
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
    id: `proj_${Date.now()}`,
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
