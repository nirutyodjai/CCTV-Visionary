import type { ProjectState, Building, Floor, AnyDevice, Connection, CableType } from './types';
import { createDevice } from './device-config';

function createFloor(id: string, name: string, floorPlanUrl: string | null = null): Floor {
    return {
        id,
        name,
        floorPlanUrl,
        devices: [],
        connections: [],
        architecturalElements: [],
        diagnostics: [],
    };
}

export function generateDemoProject(): ProjectState {
    const buildings: Building[] = [];

    // --- Building 1: Main Office ---
    const building1 = { id: 'bld_demo_1', name: 'อาคาร A - สำนักงานหลัก', floors: [
        createFloor('flr_demo_1_1', 'ชั้น 1 - โถงต้อนรับ'),
        createFloor('flr_demo_1_2', 'ชั้น 2 - สำนักงาน'),
    ]};
    
    // Floor 1 devices
    const b1f1 = building1.floors[0];
    const b1_f1_nvr = createDevice('nvr', 0.5, 0.1, b1f1.devices);
    b1f1.devices.push(b1_f1_nvr);
    const b1_f1_switch = createDevice('switch', 0.5, 0.2, b1f1.devices);
    b1f1.devices.push(b1_f1_switch);
    for(let i = 0; i < 5; i++) {
        b1f1.devices.push(createDevice('cctv-dome', Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1, b1f1.devices));
    }
    b1f1.devices.filter(d => d.type === 'cctv-dome').forEach(cam => {
        b1f1.connections.push({ id: `conn_${cam.id}`, fromDeviceId: cam.id, toDeviceId: b1_f1_switch.id, cableType: 'utp-cat6' });
    });
    b1f1.connections.push({ id: 'conn_sw_nvr_b1f1', fromDeviceId: b1_f1_switch.id, toDeviceId: b1_f1_nvr.id, cableType: 'utp-cat6' });

    // Floor 2 devices
    const b1f2 = building1.floors[1];
    const b1_f2_switch = createDevice('switch', 0.5, 0.2, b1f2.devices);
    b1f2.devices.push(b1_f2_switch);
    for(let i = 0; i < 7; i++) {
        b1f2.devices.push(createDevice('cctv-dome', Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1, b1f2.devices));
    }
    b1f2.devices.filter(d => d.type === 'cctv-dome').forEach(cam => {
        b1f2.connections.push({ id: `conn_${cam.id}`, fromDeviceId: cam.id, toDeviceId: b1_f2_switch.id, cableType: 'utp-cat6' });
    });
    
    // Connection between floors (conceptual)
    b1f1.connections.push({ id: 'conn_b1f1_b1f2', fromDeviceId: b1_f1_switch.id, toDeviceId: b1_f2_switch.id, cableType: 'fiber-optic' as CableType });

    buildings.push(building1);

    // --- Building 2: Warehouse ---
     const building2 = { id: 'bld_demo_2', name: 'อาคาร B - คลังสินค้า', floors: [
        createFloor('flr_demo_2_1', 'ชั้น 1 - โซนจัดเก็บ'),
    ]};
    const b2f1 = building2.floors[0];
    const b2_f1_switch = createDevice('switch', 0.5, 0.1, b2f1.devices);
    b2f1.devices.push(b2_f1_switch);
    for(let i = 0; i < 12; i++) {
        b2f1.devices.push(createDevice('cctv-bullet', Math.random() * 0.8 + 0.1, Math.random() * 0.8 + 0.1, b2f1.devices));
    }
    b2f1.devices.filter(d => d.type === 'cctv-bullet').forEach(cam => {
        b2f1.connections.push({ id: `conn_${cam.id}`, fromDeviceId: cam.id, toDeviceId: b2_f1_switch.id, cableType: 'utp-cat6' });
    });
    
    // Connection to main building (conceptual)
    b1f1.connections.push({ id: 'conn_b1_b2', fromDeviceId: b1_f1_switch.id, toDeviceId: b2_f1_switch.id, cableType: 'fiber-optic' });
    
    buildings.push(building2);


    const project: ProjectState = {
        projectName: 'โครงการ CCTV กรมชลประทาน',
        buildings: buildings,
        vlans: [
            { id: 10, name: 'CCTV-VLAN', color: 'hsl(var(--destructive))' },
            { id: 20, name: 'OFFICE-VLAN', color: 'hsl(var(--primary))' },
        ],
        subnets: [
            { id: 'sub_demo_1', cidr: '10.20.1.0/24', buildingId: building1.id },
            { id: 'sub_demo_2', cidr: '10.20.2.0/24', buildingId: building2.id },
        ],
    };

    return project;
}
