// Service Index - Central export for all services

export { BaseService } from './base.service';
export { ServiceManager } from './service-manager';
export { EventService, EventServiceSingleton, OnEvent, OnceEvent } from './event.service';
export { DeviceService } from './device.service';
export { NetworkService } from './network.service';
export type { NetworkTopology, BandwidthRequirement, NetworkPath } from './network.service';
export { AnalysisService } from './analysis.service';
export type { AnalysisOptions } from './analysis.service';
export { WiFiAnalysisService } from './wifi-analysis.service';
export type { WiFiAnalysisOptions, WiFiSurveyResult, WiFiMeasurement } from './wifi-analysis.service';
export { CameraManagementService } from './camera-management.service';
export type { CameraDiscoveryResult, DiscoveredCamera, CameraStream, CameraCommand } from './camera-management.service';
export { SimulationService } from './simulation.service';
export type { SimulationState, SimulationEvent, SimulationConfig } from './simulation.service';
export { ThermalCameraService } from './thermal-camera.service';
export type { ThermalCalibrationData } from '../lib/types';

// Re-export types
export type { EventBus, EventHandler, SystemEvent } from '../types/events';
export type {
  AnyDevice,
  BaseDevice,
  CameraDevice,
  Connection, 
  Floor, 
  DeviceType, 
  NetworkDevice,
  SimulationScenario
} from '../lib/types';

// Service initialization helper
import { EventServiceSingleton } from './event.service';
import { ServiceFactory } from './base.service';
import { DeviceService } from './device.service';
import { NetworkService } from './network.service';
import { AnalysisService } from './analysis.service';
import { WiFiAnalysisService } from './wifi-analysis.service';
import { CameraManagementService } from './camera-management.service';
import { SimulationService } from './simulation.service';
import { ThermalCameraService } from './thermal-camera.service';

export async function initializeServices(): Promise<{
  serviceManager: any;
  eventService: any;
  deviceService: DeviceService;
  networkService: NetworkService;
  analysisService: AnalysisService;
  wifiAnalysisService: WiFiAnalysisService;
  cameraManagementService: CameraManagementService;
  simulationService: SimulationService;
  thermalCameraService: ThermalCameraService;
}> {
  // Initialize event service first
  const eventService = await EventServiceSingleton.initialize();
  
  // Create service manager
  const serviceManager = ServiceFactory.getInstance().createServiceManager(eventService);
  
  // Create and register services
  const deviceService = new DeviceService(eventService);
  const networkService = new NetworkService(eventService);
  const analysisService = new AnalysisService(eventService);
  const wifiAnalysisService = new WiFiAnalysisService(eventService);
  const cameraManagementService = new CameraManagementService(eventService);
  const simulationService = SimulationService.getInstance();
  const thermalCameraService = ThermalCameraService.getInstance();
  
  serviceManager.register('device', deviceService);
  serviceManager.register('network', networkService);
  serviceManager.register('analysis', analysisService);
  serviceManager.register('wifi-analysis', wifiAnalysisService);
  serviceManager.register('camera-management', cameraManagementService);
  serviceManager.register('simulation', simulationService);
  serviceManager.register('thermal-camera', thermalCameraService);
  
  // Initialize all services
  await serviceManager.initialize();
  
  console.log('All services initialized successfully');
  
  return {
    serviceManager,
    eventService,
    deviceService,
    networkService,
    analysisService,
    wifiAnalysisService,
    cameraManagementService,
    simulationService,
    thermalCameraService
  };
}

export async function destroyServices(): Promise<void> {
  try {
    const serviceFactory = ServiceFactory.getInstance();
    await serviceFactory.destroyServiceManager();
    await EventServiceSingleton.destroy();
    console.log('All services destroyed successfully');
  } catch (error) {
    console.error('Error destroying services:', error);
  }
}

// Service access helpers
export function getServiceManager() {
  return ServiceFactory.getInstance().getServiceManager();
}

export function getEventService() {
  return EventServiceSingleton.getInstance();
}

export function getDeviceService(): DeviceService {
  return getServiceManager().get<DeviceService>('device');
}

export function getNetworkService(): NetworkService {
  return getServiceManager().get<NetworkService>('network');
}

export function getAnalysisService(): AnalysisService {
  return getServiceManager().get<AnalysisService>('analysis');
}

export function getWiFiAnalysisService(): WiFiAnalysisService {
  return getServiceManager().get<WiFiAnalysisService>('wifi-analysis');
}

export function getCameraManagementService(): CameraManagementService {
  return getServiceManager().get<CameraManagementService>('camera-management');
}

export function getSimulationService(): SimulationService {
  return getServiceManager().get<SimulationService>('simulation');
}

export function getThermalCameraService(): ThermalCameraService {
  return getServiceManager().get<ThermalCameraService>('thermal-camera');
}
