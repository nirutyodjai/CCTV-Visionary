import type { ProjectState, Building, Floor, Device, Connection } from './types';
import { createDevice } from './device-config';

// This function generates a complete, realistic demo project state.
export function generateDemoProject(): ProjectState {
  const buildings: Building[] = [];

  // --- Building 1: Main Office ---
  const building1_floor1_devices: Device[] = [];
  const b1_f1_dev1 = createDevice('nvr', 0.5, 0.1, building1_floor1_devices);
  building1_floor1_devices.push(b1_f1_dev1);
  const b1_f1_dev2 = createDevice('switch', 0.5, 0.2, building1_floor1_devices);
  building1_floor1_devices.push(b1_f1_dev2);

  for(let i=0; i<10; i++){
      const cam = createDevice('cctv-dome', Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1, building1_floor1_devices);
      building1_floor1_devices.push(cam);
  }

  const building1_floor1_connections: Connection[] = building1_floor1_devices
    .filter(d => d.type === 'cctv-dome')
    .map(cam => ({
        id: `conn_${cam.id}`,
        fromDeviceId: cam.id,
        toDeviceId: b1_f1_dev2.id, // connect all cameras to the switch
        cableType: 'utp-cat6'
    }));
    
  building1_floor1_connections.push({
      id: 'conn_sw_nvr',
      fromDeviceId: b1_f1_dev2.id,
      toDeviceId: b1_f1_dev1.id,
      cableType: 'utp-cat6'
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
        ]
      },
      // You can add more floors here
    ]
  };
  buildings.push(building1);

  const project: ProjectState = {
    projectName: 'โครงการกล้อง 150 ตัว กรมพัฒนาที่ดิน',
    buildings: buildings,
    vlans: [
      { id: 10, name: 'CCTV-VLAN', color: 'hsl(var(--destructive))' },
      { id: 20, name: 'OFFICE-VLAN', color: 'hsl(var(--primary))' },
    ],
    subnets: [
        { id: 'sub_demo_1', cidr: '10.20.1.0/24', buildingId: building1.id }
    ],
  };

  return project;
}
