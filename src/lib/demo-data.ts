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
        ]
      },
       {
        id: 'flr_demo_1_2',
        name: 'ชั้น 2 - สำนักงาน',
        floorPlanUrl: null,
        devices: building1_floor2_devices,
        connections: building1_floor2_connections,
        architecturalElements: []
      },
    ]
  };
  buildings.push(building1);


  // --- Building 2: Warehouse ---
  const building2_floor1_devices: Device[] = [];
  const b2_f1_switch = createDevice('switch', 0.5, 0.1, building2_floor1_devices);
  building2_floor1_devices.push(b2_f1_switch);

  for(let i=0; i<25; i++){
      const cam = createDevice('cctv-bullet', Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1, building2_floor1_devices);
      building2_floor1_devices.push(cam);
  }

  const building2_floor1_connections: Connection[] = building2_floor1_devices
    .filter(d => d.type === 'cctv-bullet')
    .map(cam => ({
        id: `conn_${cam.id}`,
        fromDeviceId: cam.id,
        toDeviceId: b2_f1_switch.id,
        cableType: 'utp-cat6' as CableType
    }));

   building2_floor1_connections.push({
        id: 'conn_b1_b2',
        fromDeviceId: b1_f1_switch.id,
        toDeviceId: b2_f1_switch.id,
        cableType: 'fiber-optic' as CableType
    });


  const building2: Building = {
      id: 'bld_demo_2',
      name: 'อาคาร B - คลังสินค้า',
      floors: [
          {
              id: 'flr_demo_2_1',
              name: 'ชั้น 1 - โซนจัดเก็บ',
              floorPlanUrl: null,
              devices: building2_floor1_devices,
              connections: building2_floor1_connections,
              architecturalElements: []
          }
      ]
  }
  buildings.push(building2);

  // --- Building 3: Data Center ---
  const building3_floor1_devices: Device[] = [];
  const b3_f1_switch = createDevice('switch', 0.2, 0.5, building3_floor1_devices);
  building3_floor1_devices.push(b3_f1_switch);
   const b3_f1_rack = createDevice('rack-indoor', 0.5, 0.5, building3_floor1_devices);
  building3_floor1_devices.push(b3_f1_rack);


  for(let i=0; i<40; i++){
      const cam = createDevice('cctv-dome', Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1, building3_floor1_devices);
      building3_floor1_devices.push(cam);
  }
   const building3_floor1_connections: Connection[] = building3_floor1_devices
    .filter(d => d.type === 'cctv-dome')
    .map(cam => ({
        id: `conn_${cam.id}`,
        fromDeviceId: cam.id,
        toDeviceId: b3_f1_switch.id,
        cableType: 'utp-cat6' as CableType
    }));

    building3_floor1_connections.push({
        id: 'conn_b1_b3',
        fromDeviceId: b1_f1_switch.id,
        toDeviceId: b3_f1_switch.id,
        cableType: 'fiber-optic' as CableType
    });


   const building3: Building = {
      id: 'bld_demo_3',
      name: 'อาคาร C - ศูนย์ข้อมูล',
      floors: [
          {
              id: 'flr_demo_3_1',
              name: 'ชั้น 1 - ห้องเซิร์ฟเวอร์',
              floorPlanUrl: null,
              devices: building3_floor1_devices,
              connections: building3_floor1_connections,
              architecturalElements: []
          }
      ]
  }
  buildings.push(building3);


  const project: ProjectState = {
    projectName: 'โครงการ CCTV กรมชลประทาน',
    buildings: buildings,
    vlans: [
      { id: 10, name: 'CCTV-VLAN', color: 'hsl(var(--destructive))' },
      { id: 20, name: 'OFFICE-VLAN', color: 'hsl(var(--primary))' },
      { id: 30, name: 'SERVER-VLAN', color: 'hsl(var(--warning))' },
    ],
    subnets: [
        { id: 'sub_demo_1', cidr: '10.20.1.0/24', buildingId: building1.id, vlanId: 10 },
        { id: 'sub_demo_2', cidr: '10.20.2.0/24', buildingId: building2.id, vlanId: 10 },
        { id: 'sub_demo_3', cidr: '10.20.3.0/24', buildingId: building3.id, vlanId: 30 },
    ],
  };

  return project;
}
