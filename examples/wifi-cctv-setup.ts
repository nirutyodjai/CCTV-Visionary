// Example: WiFi Camera Setup and Analysis

import { 
  initializeServices,
  getDeviceService,
  getWiFiAnalysisService,
  getCameraManagementService
} from '@/services';
import { 
  WiFiCamera, 
  AccessPoint, 
  FloorPlan,
  WirelessCoverageAnalysis 
} from '@/types';

// Initialize the CCTV Visionary system with WiFi capabilities
export async function setupWiFiCCTVSystem() {
  // 1. Initialize all services
  console.log('🚀 Initializing CCTV Visionary Services...');
  const {
    deviceService,
    wifiAnalysisService,
    cameraManagementService
  } = await initializeServices();

  // 2. Create a sample floor plan
  const floorPlan: FloorPlan = {
    id: 'office-floor-1',
    name: 'Office Building - Floor 1',
    scale: 20, // 20 pixels per meter
    bounds: { x: 0, y: 0, width: 2000, height: 1500 }, // 100m x 75m
    elements: [
      {
        id: 'wall-1',
        type: 'wall',
        points: [
          { x: 0, y: 0 },
          { x: 2000, y: 0 },
          { x: 2000, y: 1500 },
          { x: 0, y: 1500 },
          { x: 0, y: 0 }
        ],
        style: {
          strokeColor: '#000000',
          fillColor: '#f0f0f0',
          strokeWidth: 2,
          strokeStyle: 'solid',
          opacity: 1
        },
        properties: { material: 'concrete', thickness: 0.2 }
      }
    ],
    devices: [],
    connections: []
  };

  // 3. Set up Access Points for WiFi coverage
  console.log('📡 Setting up WiFi Access Points...');
  
  const accessPoint1: AccessPoint = {
    id: 'ap-entrance',
    name: 'Entrance Access Point',
    type: 'access_point',
    position: { x: 500, y: 300 }, // 25m, 15m
    size: { width: 40, height: 40 },
    rotation: 0,
    properties: {},
    connections: [],
    wifiNetworks: [{
      id: 'network-main',
      ssid: 'CCTV-Main',
      password: 'SecurePassword123',
      encryption: 'WPA3',
      frequency: 'dual',
      channel: 36,
      bandwidth: 80,
      maxDevices: 50,
      hidden: false,
      accessPointId: 'ap-entrance'
    }],
    coverage: {
      range2_4GHz: 50, // 50 meters
      range5GHz: 30,   // 30 meters
      shape: 'circular',
      obstacles: []
    },
    supportedStandards: ['802.11ax', '802.11ac', '802.11n'],
    powerOutput: 20, // 20 dBm
    antennaGain: 5   // 5 dBi
  };

  const accessPoint2: AccessPoint = {
    id: 'ap-corridor',
    name: 'Corridor Access Point',
    type: 'access_point',
    position: { x: 1500, y: 800 }, // 75m, 40m
    size: { width: 40, height: 40 },
    rotation: 0,
    properties: {},
    connections: [],
    wifiNetworks: [{
      id: 'network-corridor',
      ssid: 'CCTV-Corridor',
      password: 'SecurePassword123',
      encryption: 'WPA3',
      frequency: '5GHz',
      channel: 149,
      bandwidth: 80,
      maxDevices: 30,
      hidden: false,
      accessPointId: 'ap-corridor'
    }],
    coverage: {
      range2_4GHz: 45,
      range5GHz: 28,
      shape: 'circular',
      obstacles: []
    },
    supportedStandards: ['802.11ax', '802.11ac'],
    powerOutput: 23,
    antennaGain: 6
  };

  // Add access points to device service
  await deviceService.createDevice({
    name: accessPoint1.name,
    type: 'access_point',
    position: accessPoint1.position,
    properties: accessPoint1,
    floorPlanId: floorPlan.id
  });

  await deviceService.createDevice({
    name: accessPoint2.name,
    type: 'access_point',
    position: accessPoint2.position,
    properties: accessPoint2,
    floorPlanId: floorPlan.id
  });

  // 4. Discover and configure WiFi cameras
  console.log('📹 Discovering WiFi cameras...');
  
  const discoveryResult = await cameraManagementService.discoverCameras('onvif', {
    ipRange: '192.168.1.0/24',
    timeout: 30000
  });

  console.log(`Found ${discoveryResult.cameras.length} cameras in ${discoveryResult.scanDuration}ms`);

  // 5. Create WiFi cameras
  const wifiCameras: WiFiCamera[] = [];
  
  const camera1: WiFiCamera = {
    id: 'wifi-cam-entrance',
    name: 'Entrance WiFi Camera',
    type: 'camera',
    cameraType: 'dome',
    position: { x: 400, y: 200 }, // 20m, 10m
    size: { width: 30, height: 30 },
    rotation: 0,
    properties: {},
    connections: [],
    fov: {
      angle: 110,
      range: 15,
      direction: 45
    },
    resolution: { width: 2560, height: 1440, mp: 4 },
    nightVision: true,
    poeRequired: false,
    mountType: 'ceiling',
    weatherRating: 'IP67',
    wifiCapable: true,
    supportedFrequencies: ['2.4GHz', '5GHz'],
    wifiStandards: ['802.11ac', '802.11ax'],
    maxWirelessBandwidth: 100, // 100 Mbps
    powerMode: 'battery',
    batteryLife: 24, // 24 hours
    solarPowered: true
  };

  const camera2: WiFiCamera = {
    id: 'wifi-cam-corridor',
    name: 'Corridor WiFi Camera',
    type: 'camera',
    cameraType: 'bullet',
    position: { x: 1600, y: 700 }, // 80m, 35m
    size: { width: 25, height: 30 },
    rotation: 180,
    properties: {},
    connections: [],
    fov: {
      angle: 85,
      range: 20,
      direction: 270
    },
    resolution: { width: 1920, height: 1080, mp: 2 },
    nightVision: true,
    poeRequired: false,
    mountType: 'wall',
    weatherRating: 'IP66',
    wifiCapable: true,
    supportedFrequencies: ['5GHz'],
    wifiStandards: ['802.11ac'],
    maxWirelessBandwidth: 50,
    powerMode: 'hybrid',
    batteryLife: 12,
    solarPowered: false
  };

  wifiCameras.push(camera1, camera2);

  // Add cameras to device service
  for (const camera of wifiCameras) {
    await deviceService.createDevice({
      name: camera.name,
      type: 'camera',
      position: camera.position,
      properties: camera,
      floorPlanId: floorPlan.id
    });
  }

  // 6. Configure WiFi connections for cameras
  console.log('🔗 Configuring WiFi connections...');
  
  await cameraManagementService.configureWiFiCamera(camera1.id, {
    ssid: 'CCTV-Main',
    password: 'SecurePassword123',
    frequency: '5GHz'
  });

  await cameraManagementService.configureWiFiCamera(camera2.id, {
    ssid: 'CCTV-Corridor',
    password: 'SecurePassword123',
    frequency: '5GHz'
  });

  // 7. Analyze WiFi coverage
  console.log('📊 Analyzing WiFi coverage...');
  
  const wifiAnalysis: WirelessCoverageAnalysis = await wifiAnalysisService.analyzeWiFiCoverage(
    floorPlan,
    [accessPoint1, accessPoint2],
    wifiCameras,
    {
      resolution: 2.0, // 2 meter grid
      frequencyBands: ['2.4GHz', '5GHz'],
      includeInterference: true,
      channelOptimization: true
    }
  );

  console.log('📈 WiFi Analysis Results:');
  console.log(`- Average Signal Strength: ${wifiAnalysis.signalQuality.averageSignalStrength.toFixed(1)} dBm`);
  console.log(`- Dead Zones: ${wifiAnalysis.signalQuality.deadZones.length} areas`);
  console.log(`- Interference Level: ${(wifiAnalysis.signalQuality.interferenceLevel * 100).toFixed(1)}%`);
  console.log(`- Recommendations: ${wifiAnalysis.recommendations.length} items`);

  // 8. Display recommendations
  if (wifiAnalysis.recommendations.length > 0) {
    console.log('\n💡 WiFi Optimization Recommendations:');
    wifiAnalysis.recommendations.forEach((rec, index) => {
      console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
      console.log(`   ${rec.description}`);
      console.log(`   Impact: ${rec.impact}`);
      console.log(`   Action: ${rec.action.type} (Cost: $${rec.action.estimatedCost || 0})`);
      console.log('');
    });
  }

  // 9. Optimize channel allocation
  console.log('🔧 Optimizing WiFi channels...');
  const optimizedChannels = await wifiAnalysisService.optimizeChannels([accessPoint1, accessPoint2]);
  
  console.log('Optimized channel assignments:');
  optimizedChannels.forEach((channel, networkId) => {
    console.log(`- ${networkId}: Channel ${channel}`);
  });

  // 10. Start camera streams and monitoring
  console.log('📺 Starting camera streams...');
  
  for (const camera of wifiCameras) {
    try {
      const stream = await cameraManagementService.startStream(camera.id, {
        resolution: camera.resolution,
        frameRate: 25,
        bitrate: camera.maxWirelessBandwidth * 800, // 80% of max bandwidth
        compression: 'H.264',
        quality: 'high'
      });
      console.log(`Stream started for ${camera.name}: ${stream.streamUrl}`);
    } catch (error) {
      console.error(`Failed to start stream for ${camera.name}:`, error);
    }
  }

  // 11. Monitor camera status
  console.log('⚡ Monitoring camera status...');
  
  setTimeout(async () => {
    const statuses = cameraManagementService.getAllCameraStatuses();
    console.log('\n📱 Camera Status Report:');
    
    statuses.forEach(status => {
      console.log(`${status.cameraId}:`);
      console.log(`  - Online: ${status.online ? '✅' : '❌'}`);
      console.log(`  - Streaming: ${status.streaming ? '✅' : '❌'}`);
      console.log(`  - Signal: ${status.signalStrength?.toFixed(1) || 'N/A'} dBm`);
      console.log(`  - Battery: ${status.batteryLevel?.toFixed(1) || 'N/A'}%`);
      console.log(`  - Bandwidth: ${status.performance.bandwidthUsage.toFixed(1)} Mbps`);
      console.log('');
    });
  }, 2000);

  return {
    floorPlan,
    accessPoints: [accessPoint1, accessPoint2],
    cameras: wifiCameras,
    wifiAnalysis,
    services: {
      deviceService,
      wifiAnalysisService,
      cameraManagementService
    }
  };
}

// Example usage
export async function demonstrateWiFiCCTV() {
  try {
    console.log('🎯 Starting WiFi CCTV System Demonstration...\n');
    
    const system = await setupWiFiCCTVSystem();
    
    console.log('\n✅ WiFi CCTV System Setup Complete!');
    console.log(`📍 Floor Plan: ${system.floorPlan.name}`);
    console.log(`📡 Access Points: ${system.accessPoints.length}`);
    console.log(`📹 WiFi Cameras: ${system.cameras.length}`);
    console.log(`📊 Analysis: ${system.wifiAnalysis.recommendations.length} recommendations`);
    
    // Simulate camera optimization
    setTimeout(async () => {
      console.log('\n🔄 Running camera optimization...');
      
      for (const camera of system.cameras) {
        await system.services.cameraManagementService.optimizeWiFiCamera(camera.id);
      }
      
      console.log('✅ Camera optimization complete!');
    }, 5000);
    
  } catch (error) {
    console.error('❌ Failed to demonstrate WiFi CCTV system:', error);
  }
}

// Run the demonstration
if (typeof window === 'undefined') {
  // Only run in Node.js environment
  demonstrateWiFiCCTV();
}
