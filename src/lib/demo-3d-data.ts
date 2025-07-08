import type { Floor, AnyDevice, Connection, ArchitecturalElement } from './types';

// Demo Floor Plan with realistic office layout
export const demo3DFloor: Omit<Floor, 'devices' | 'connections' | 'diagnostics'> = {
  id: 'demo-floor-1',
  name: 'Demo Office Floor - 3D Showcase',
  floorPlanUrl: null,
  
  architecturalElements: [
    // Outer walls
    { id: 'wall-1', type: 'wall', start: { x: 0, y: 0 }, end: { x: 2000, y: 0 } },
    { id: 'wall-2', type: 'wall', start: { x: 2000, y: 0 }, end: { x: 2000, y: 1500 } },
    { id: 'wall-3', type: 'wall', start: { x: 2000, y: 1500 }, end: { x: 0, y: 1500 } },
    { id: 'wall-4', type: 'wall', start: { x: 0, y: 1500 }, end: { x: 0, y: 0 } },
    
    // Interior walls
    { id: 'wall-5', type: 'wall', start: { x: 500, y: 0 }, end: { x: 500, y: 800 } },
    { id: 'wall-6', type: 'wall', start: { x: 1200, y: 0 }, end: { x: 1200, y: 1000 } },
    { id: 'wall-7', type: 'wall', start: { x: 0, y: 800 }, end: { x: 800, y: 800 } },
    { id: 'wall-8', type: 'wall', start: { x: 1500, y: 600 }, end: { x: 2000, y: 600 } },
    
    // Doors
    { id: 'door-1', type: 'door', start: { x: 500, y: 900 }, end: { x: 500, y: 980 } },
    { id: 'door-2', type: 'door', start: { x: 1200, y: 1100 }, end: { x: 1200, y: 1180 } },
    { id: 'door-3', type: 'door', start: { x: 900, y: 0 }, end: { x: 980, y: 0 } },
    { id: 'door-4', type: 'door', start: { x: 1500, y: 500 }, end: { x: 1580, y: 500 } },
    
    // Windows
    { id: 'window-1', type: 'window', start: { x: 2000, y: 200 }, end: { x: 2000, y: 400 } },
    { id: 'window-2', type: 'window', start: { x: 2000, y: 800 }, end: { x: 2000, y: 1000 } },
    { id: 'window-3', type: 'window', start: { x: 200, y: 0 }, end: { x: 400, y: 0 } },
    { id: 'window-4', type: 'window', start: { x: 1400, y: 1500 }, end: { x: 1600, y: 1500 } }
  ]
};

// Demo Devices - All device types with realistic placement
export const demo3DDevices: AnyDevice[] = [
  // CCTV Cameras
  {
    id: 'cam-dome-1',
    type: 'cctv-dome',
    name: 'Dome Camera - Entrance',
    position: { x: 250, y: 100, z: 280 },
    rotation: 45,
    specifications: {
      resolution: '4K',
      nightVision: true,
      ptzCapable: true,
      weatherRating: 'IP67',
      viewAngle: 110,
      zoomLevel: '30x'
    },
    color: '#2563eb',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 25,
    ipAddress: '192.168.1.100',
    macAddress: '00:11:22:33:44:55',
    status: 'online'
  },
  {
    id: 'cam-bullet-1',
    type: 'cctv-bullet',
    name: 'Bullet Camera - Parking',
    position: { x: 1800, y: 300, z: 320 },
    rotation: 180,
    specifications: {
      resolution: '4K',
      nightVision: true,
      ptzCapable: false,
      weatherRating: 'IP67',
      viewAngle: 85,
      zoomLevel: '4x'
    },
    color: '#dc2626',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 15,
    ipAddress: '192.168.1.101',
    macAddress: '00:11:22:33:44:56',
    status: 'online'
  },
  {
    id: 'cam-ptz-1',
    type: 'cctv-ptz',
    name: 'PTZ Camera - Main Hall',
    position: { x: 1000, y: 750, z: 350 },
    rotation: 0,
    specifications: {
      resolution: '4K',
      nightVision: true,
      ptzCapable: true,
      weatherRating: 'IP66',
      viewAngle: 120,
      zoomLevel: '36x'
    },
    color: '#7c3aed',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 45,
    ipAddress: '192.168.1.102',
    macAddress: '00:11:22:33:44:57',
    status: 'online'
  },
  {
    id: 'cam-dome-2',
    type: 'cctv-dome',
    name: 'Dome Camera - Conference Room',
    position: { x: 1400, y: 400, z: 280 },
    rotation: 270,
    specifications: {
      resolution: '2K',
      nightVision: true,
      ptzCapable: false,
      weatherRating: 'IP54',
      viewAngle: 95,
      zoomLevel: '4x'
    },
    color: '#2563eb',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 20,
    ipAddress: '192.168.1.103',
    macAddress: '00:11:22:33:44:58',
    status: 'online'
  },
  {
    id: 'cam-bullet-2',
    type: 'cctv-bullet',
    name: 'Bullet Camera - Back Exit',
    position: { x: 100, y: 1200, z: 300 },
    rotation: 90,
    specifications: {
      resolution: '4K',
      nightVision: true,
      ptzCapable: false,
      weatherRating: 'IP67',
      viewAngle: 78,
      zoomLevel: '3x'
    },
    color: '#dc2626',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 18,
    ipAddress: '192.168.1.104',
    macAddress: '00:11:22:33:44:59',
    status: 'online'
  },

  // Network Video Recorders (NVR)
  {
    id: 'nvr-main',
    type: 'nvr',
    name: 'Main NVR - 32 Channel',
    position: { x: 300, y: 1200, z: 150 },
    rotation: 0,
    specifications: {
      channels: 32,
      storageCapacity: '64TB',
      recordingQuality: '4K',
      backupSupport: true,
      raidLevel: 'RAID 6'
    },
    color: '#059669',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 150,
    ipAddress: '192.168.1.50',
    macAddress: '00:11:22:33:55:01',
    status: 'online'
  },
  {
    id: 'nvr-backup',
    type: 'nvr',
    name: 'Backup NVR - 16 Channel',
    position: { x: 350, y: 1250, z: 150 },
    rotation: 0,
    specifications: {
      channels: 16,
      storageCapacity: '32TB',
      recordingQuality: '4K',
      backupSupport: true,
      raidLevel: 'RAID 5'
    },
    color: '#059669',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 120,
    ipAddress: '192.168.1.51',
    macAddress: '00:11:22:33:55:02',
    status: 'online'
  },

  // Network Switches
  {
    id: 'switch-main',
    type: 'switch',
    name: 'Core Switch - 48 Port',
    position: { x: 400, y: 1200, z: 120 },
    rotation: 0,
    specifications: {
      portCount: 48,
      speed: '1Gbps',
      poeSupport: true,
      manageable: true,
      vlanSupport: true
    },
    color: '#ea580c',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 200,
    ipAddress: '192.168.1.10',
    macAddress: '00:11:22:33:66:01',
    status: 'online'
  },
  {
    id: 'switch-access-1',
    type: 'switch',
    name: 'Access Switch 1 - 24 Port',
    position: { x: 800, y: 600, z: 50 },
    rotation: 0,
    specifications: {
      portCount: 24,
      speed: '1Gbps',
      poeSupport: true,
      manageable: true,
      vlanSupport: true
    },
    color: '#ea580c',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 120,
    ipAddress: '192.168.1.11',
    macAddress: '00:11:22:33:66:02',
    status: 'online'
  },
  {
    id: 'switch-access-2',
    type: 'switch',
    name: 'Access Switch 2 - 16 Port',
    position: { x: 1600, y: 400, z: 50 },
    rotation: 0,
    specifications: {
      portCount: 16,
      speed: '1Gbps',
      poeSupport: true,
      manageable: false,
      vlanSupport: false
    },
    color: '#ea580c',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 80,
    ipAddress: '192.168.1.12',
    macAddress: '00:11:22:33:66:03',
    status: 'online'
  },

  // Monitors
  {
    id: 'monitor-security-1',
    type: 'monitor',
    name: 'Security Monitor 1 - 55"',
    position: { x: 250, y: 1150, z: 200 },
    rotation: 180,
    specifications: {
      size: '55"',
      resolution: '4K',
      panelType: 'LED',
      brightness: '500 nits',
      inputPorts: 'HDMI x4, DisplayPort x2'
    },
    color: '#1f2937',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 180,
    ipAddress: '192.168.1.200',
    macAddress: '00:11:22:33:77:01',
    status: 'online'
  },
  {
    id: 'monitor-wall-1',
    type: 'monitor',
    name: 'Video Wall Monitor 1 - 46"',
    position: { x: 500, y: 200, z: 150 },
    rotation: 0,
    specifications: {
      size: '46"',
      resolution: '4K',
      panelType: 'LCD',
      brightness: '700 nits',
      inputPorts: 'HDMI x2, DVI x1'
    },
    color: '#1f2937',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 150,
    ipAddress: '192.168.1.201',
    macAddress: '00:11:22:33:77:02',
    status: 'online'
  },

  // WiFi Access Points
  {
    id: 'wifi-ap-1',
    type: 'wifi-ap',
    name: 'WiFi AP - Ceiling 1',
    position: { x: 700, y: 400, z: 280 },
    rotation: 0,
    specifications: {
      standard: 'WiFi 6 (802.11ax)',
      frequency: 'Dual-band (2.4/5 GHz)',
      maxSpeed: '1.2 Gbps',
      antennas: 4,
      poeRequired: true
    },
    color: '#10b981',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 25,
    ipAddress: '192.168.1.150',
    macAddress: '00:11:22:33:88:01',
    status: 'online'
  },
  {
    id: 'wifi-ap-2',
    type: 'wifi-ap',
    name: 'WiFi AP - Ceiling 2',
    position: { x: 1400, y: 800, z: 280 },
    rotation: 0,
    specifications: {
      standard: 'WiFi 6 (802.11ax)',
      frequency: 'Dual-band (2.4/5 GHz)',
      maxSpeed: '1.2 Gbps',
      antennas: 4,
      poeRequired: true
    },
    color: '#10b981',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 25,
    ipAddress: '192.168.1.151',
    macAddress: '00:11:22:33:88:02',
    status: 'online'
  },

  // Server Rack
  {
    id: 'rack-main',
    type: 'rack',
    name: 'Main Server Rack - 42U',
    position: { x: 450, y: 1200, z: 0 },
    rotation: 0,
    specifications: {
      height: '42U',
      width: '19"',
      depth: '1000mm',
      loadCapacity: '1500kg',
      airflow: 'Front-to-Back'
    },
    color: '#4b5563',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 0,
    ipAddress: null,
    macAddress: null,
    status: 'installed'
  },

  // Patch Panel
  {
    id: 'patch-panel-1',
    type: 'patch-panel',
    name: 'Cat6 Patch Panel - 48 Port',
    position: { x: 420, y: 1180, z: 180 },
    rotation: 0,
    specifications: {
      portCount: 48,
      category: 'Cat6',
      mounting: '1U Rack Mount',
      connector: 'RJ45',
      shielding: 'UTP'
    },
    color: '#6b7280',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 0,
    ipAddress: null,
    macAddress: null,
    status: 'installed'
  },

  // Power Distribution Unit (PDU)
  {
    id: 'pdu-main',
    type: 'pdu',
    name: 'Rack PDU - 20A',
    position: { x: 480, y: 1180, z: 100 },
    rotation: 0,
    specifications: {
      capacity: '20A',
      outlets: 24,
      voltage: '230V',
      mounting: '1U Rack Mount',
      monitoring: 'Smart PDU'
    },
    color: '#ef4444',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 0,
    ipAddress: '192.168.1.250',
    macAddress: '00:11:22:33:99:01',
    status: 'online'
  },

  // Uninterruptible Power Supply (UPS)
  {
    id: 'ups-main',
    type: 'ups',
    name: 'UPS System - 5000VA',
    position: { x: 500, y: 1300, z: 0 },
    rotation: 0,
    specifications: {
      capacity: '5000VA',
      runtime: '15 minutes',
      inputVoltage: '230V',
      outputVoltage: '230V',
      batteryType: 'Sealed Lead Acid'
    },
    color: '#7c2d12',
    floorId: 'demo-floor-1',
    buildingId: 'demo-building-1',
    powerConsumption: 0,
    ipAddress: '192.168.1.251',
    macAddress: '00:11:22:33:99:02',
    status: 'online'
  }
];

// Demo Connections - Realistic network topology
export const demo3DConnections: Connection[] = [
  // Core infrastructure connections
  {
    id: 'conn-ups-pdu',
    fromDeviceId: 'ups-main',
    toDeviceId: 'pdu-main',
    cableType: 'power',
    length: 50,
    color: '#ef4444'
  },
  {
    id: 'conn-pdu-nvr-main',
    fromDeviceId: 'pdu-main',
    toDeviceId: 'nvr-main',
    cableType: 'power',
    length: 30,
    color: '#ef4444'
  },
  {
    id: 'conn-pdu-nvr-backup',
    fromDeviceId: 'pdu-main',
    toDeviceId: 'nvr-backup',
    cableType: 'power',
    length: 35,
    color: '#ef4444'
  },
  {
    id: 'conn-pdu-switch-main',
    fromDeviceId: 'pdu-main',
    toDeviceId: 'switch-main',
    cableType: 'power',
    length: 25,
    color: '#ef4444'
  },

  // Network backbone
  {
    id: 'conn-switch-main-patch',
    fromDeviceId: 'switch-main',
    toDeviceId: 'patch-panel-1',
    cableType: 'utp-cat6',
    length: 20,
    color: '#3b82f6'
  },
  {
    id: 'conn-switch-main-nvr-main',
    fromDeviceId: 'switch-main',
    toDeviceId: 'nvr-main',
    cableType: 'utp-cat6',
    length: 15,
    color: '#3b82f6'
  },
  {
    id: 'conn-switch-main-nvr-backup',
    fromDeviceId: 'switch-main',
    toDeviceId: 'nvr-backup',
    cableType: 'utp-cat6',
    length: 18,
    color: '#3b82f6'
  },
  {
    id: 'conn-switch-main-access1',
    fromDeviceId: 'switch-main',
    toDeviceId: 'switch-access-1',
    cableType: 'fiber-optic',
    length: 80,
    color: '#f59e0b'
  },
  {
    id: 'conn-switch-main-access2',
    fromDeviceId: 'switch-main',
    toDeviceId: 'switch-access-2',
    cableType: 'fiber-optic',
    length: 150,
    color: '#f59e0b'
  },

  // Camera connections to NVR
  {
    id: 'conn-nvr-cam-dome1',
    fromDeviceId: 'nvr-main',
    toDeviceId: 'cam-dome-1',
    cableType: 'utp-cat6',
    length: 45,
    color: '#10b981'
  },
  {
    id: 'conn-nvr-cam-bullet1',
    fromDeviceId: 'nvr-main',
    toDeviceId: 'cam-bullet-1',
    cableType: 'utp-cat6',
    length: 180,
    color: '#10b981'
  },
  {
    id: 'conn-nvr-cam-ptz1',
    fromDeviceId: 'nvr-main',
    toDeviceId: 'cam-ptz-1',
    cableType: 'utp-cat6',
    length: 95,
    color: '#10b981'
  },
  {
    id: 'conn-nvr-backup-cam-dome2',
    fromDeviceId: 'nvr-backup',
    toDeviceId: 'cam-dome-2',
    cableType: 'utp-cat6',
    length: 140,
    color: '#10b981'
  },
  {
    id: 'conn-nvr-backup-cam-bullet2',
    fromDeviceId: 'nvr-backup',
    toDeviceId: 'cam-bullet-2',
    cableType: 'utp-cat6',
    length: 120,
    color: '#10b981'
  },

  // Access switch connections
  {
    id: 'conn-access1-wifi1',
    fromDeviceId: 'switch-access-1',
    toDeviceId: 'wifi-ap-1',
    cableType: 'utp-cat6',
    length: 25,
    color: '#8b5cf6'
  },
  {
    id: 'conn-access2-wifi2',
    fromDeviceId: 'switch-access-2',
    toDeviceId: 'wifi-ap-2',
    cableType: 'utp-cat6',
    length: 30,
    color: '#8b5cf6'
  },

  // Monitor connections
  {
    id: 'conn-nvr-monitor1',
    fromDeviceId: 'nvr-main',
    toDeviceId: 'monitor-security-1',
    cableType: 'hdmi',
    length: 10,
    color: '#6366f1'
  },
  {
    id: 'conn-nvr-monitor-wall',
    fromDeviceId: 'nvr-backup',
    toDeviceId: 'monitor-wall-1',
    cableType: 'hdmi',
    length: 35,
    color: '#6366f1'
  }
];

// Demo system statistics
export function getDemoSystemStats() {
  const stats = {
    totalDevices: demo3DDevices.length,
    totalConnections: demo3DConnections.length,
    devicesByType: {} as Record<string, number>,
    connectionsByType: {} as Record<string, number>,
    totalPowerConsumption: 0,
    networkSegments: {
      cameras: demo3DDevices.filter(d => d.type.startsWith('cctv-')).length,
      networking: demo3DDevices.filter(d => ['switch', 'wifi-ap', 'nvr'].includes(d.type)).length,
      infrastructure: demo3DDevices.filter(d => ['rack', 'pdu', 'ups', 'patch-panel'].includes(d.type)).length,
      display: demo3DDevices.filter(d => d.type === 'monitor').length
    }
  };

  // Count devices by type
  demo3DDevices.forEach(device => {
    stats.devicesByType[device.type] = (stats.devicesByType[device.type] || 0) + 1;
    stats.totalPowerConsumption += device.powerConsumption || 0;
  });

  // Count connections by cable type
  demo3DConnections.forEach(connection => {
    stats.connectionsByType[connection.cableType] = (stats.connectionsByType[connection.cableType] || 0) + 1;
  });

  return stats;
}

// Function to load demo data into the main application state
export function loadDemoSystem() {
  return {
    floor: demo3DFloor,
    devices: demo3DDevices,
    connections: demo3DConnections,
    stats: getDemoSystemStats()
  };
}
