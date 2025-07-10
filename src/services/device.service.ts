// Device Service for CCTV Visionary System

import { BaseService } from './base.service';
import { EventBus, DeviceAddedEvent, DeviceRemovedEvent, DeviceMovedEvent, DevicePropertiesChangedEvent } from '../types/events';
import { Device, Camera, Point, DeviceType, CameraType } from '../types';
import { CreateDeviceRequest, UpdateDeviceRequest, DeviceTemplate } from '../types/api';

export class DeviceService extends BaseService {
  private devices = new Map<string, Device>();
  private deviceTemplates = new Map<string, DeviceTemplate>();
  private deviceConnections = new Map<string, string[]>(); // deviceId -> connected device IDs

  constructor(eventBus: EventBus) {
    super(eventBus);
  }

  async initialize(): Promise<void> {
    await this.loadDeviceTemplates();
    this.initialized = true;
    console.log('DeviceService initialized');
  }

  async destroy(): Promise<void> {
    this.devices.clear();
    this.deviceTemplates.clear();
    this.deviceConnections.clear();
    this.initialized = false;
    console.log('DeviceService destroyed');
  }

  // Device CRUD Operations
  async createDevice(request: CreateDeviceRequest): Promise<Device> {
    const device: Device = {
      id: this.generateId(),
      name: request.name,
      type: request.type as DeviceType,
      position: request.position,
      size: { width: 50, height: 50 }, // Default size
      rotation: 0,
      properties: request.properties,
      connections: [],
      metadata: {
        floorPlanId: request.floorPlanId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };

    // Apply template properties if available
    const template = this.getDeviceTemplate(request.type);
    if (template) {
      device.properties = { ...template.defaultProperties, ...request.properties };
      device.size = {
        width: template.specifications.dimensions.width,
        height: template.specifications.dimensions.height
      };
    }

    this.devices.set(device.id, device);

    // Emit event
    const event: DeviceAddedEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'device:added',
      source: 'device-service',
      position: device.position,
      modifiers: { shift: false, ctrl: false, alt: false },
      deviceId: device.id,
      deviceType: device.type,
      device
    };
    this.emit(event);

    return device;
  }

  async updateDevice(deviceId: string, request: UpdateDeviceRequest): Promise<Device> {
    const device = this.getDevice(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    const oldPosition = { ...device.position };
    const oldProperties = { ...device.properties };

    // Update device properties
    if (request.name !== undefined) device.name = request.name;
    if (request.position !== undefined) device.position = request.position;
    if (request.properties !== undefined) {
      device.properties = { ...device.properties, ...request.properties };
    }
    if (request.rotation !== undefined) device.rotation = request.rotation;

    device.metadata = {
      ...device.metadata,
      updatedAt: new Date().toISOString()
    };

    // Emit events
    if (request.position && (oldPosition.x !== device.position.x || oldPosition.y !== device.position.y)) {
      const moveEvent: DeviceMovedEvent = {
        id: this.generateId(),
        timestamp: new Date(),
        type: 'device:moved',
        source: 'device-service',
        position: device.position,
        modifiers: { shift: false, ctrl: false, alt: false },
        deviceId: device.id,
        deviceType: device.type,
        oldPosition,
        newPosition: device.position
      };
      this.emit(moveEvent);
    }

    if (request.properties) {
      const propertiesEvent: DevicePropertiesChangedEvent = {
        id: this.generateId(),
        timestamp: new Date(),
        type: 'device:properties:changed',
        source: 'device-service',
        position: device.position,
        modifiers: { shift: false, ctrl: false, alt: false },
        deviceId: device.id,
        deviceType: device.type,
        properties: device.properties,
        oldProperties
      };
      this.emit(propertiesEvent);
    }

    return device;
  }

  async removeDevice(deviceId: string): Promise<void> {
    const device = this.getDevice(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    // Remove connections
    await this.removeAllDeviceConnections(deviceId);

    this.devices.delete(deviceId);

    // Emit event
    const event: DeviceRemovedEvent = {
      id: this.generateId(),
      timestamp: new Date(),
      type: 'device:removed',
      source: 'device-service',
      position: device.position,
      modifiers: { shift: false, ctrl: false, alt: false },
      deviceId: device.id,
      deviceType: device.type
    };
    this.emit(event);
  }

  // Device Query Operations
  getDevice(deviceId: string): Device | undefined {
    return this.devices.get(deviceId);
  }

  getAllDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  getDevicesByType(deviceType: DeviceType): Device[] {
    return this.getAllDevices().filter(device => device.type === deviceType);
  }

  getDevicesByFloorPlan(floorPlanId: string): Device[] {
    return this.getAllDevices().filter(device => 
      device.metadata?.floorPlanId === floorPlanId
    );
  }

  getCameras(): Camera[] {
    return this.getDevicesByType('camera') as Camera[];
  }

  getCamerasByType(cameraType: CameraType): Camera[] {
    return this.getCameras().filter(camera => camera.cameraType === cameraType);
  }

  getDevicesInArea(topLeft: Point, bottomRight: Point): Device[] {
    return this.getAllDevices().filter(device => {
      const pos = device.position;
      return pos.x >= topLeft.x && 
             pos.x <= bottomRight.x && 
             pos.y >= topLeft.y && 
             pos.y <= bottomRight.y;
    });
  }

  getDevicesWithProperty(propertyName: string, propertyValue?: any): Device[] {
    return this.getAllDevices().filter(device => {
      const hasProperty = device.properties.hasOwnProperty(propertyName);
      if (propertyValue === undefined) {
        return hasProperty;
      }
      return hasProperty && device.properties[propertyName] === propertyValue;
    });
  }

  // Device Template Operations
  getDeviceTemplate(deviceType: string): DeviceTemplate | undefined {
    return this.deviceTemplates.get(deviceType);
  }

  getAllDeviceTemplates(): DeviceTemplate[] {
    return Array.from(this.deviceTemplates.values());
  }

  getDeviceTemplatesByCategory(category: string): DeviceTemplate[] {
    return this.getAllDeviceTemplates().filter(template => template.category === category);
  }

  addDeviceTemplate(template: DeviceTemplate): void {
    this.deviceTemplates.set(template.type, template);
  }

  // Device Connection Operations
  addDeviceConnection(fromDeviceId: string, toDeviceId: string): void {
    if (!this.deviceConnections.has(fromDeviceId)) {
      this.deviceConnections.set(fromDeviceId, []);
    }
    if (!this.deviceConnections.has(toDeviceId)) {
      this.deviceConnections.set(toDeviceId, []);
    }

    const fromConnections = this.deviceConnections.get(fromDeviceId)!;
    const toConnections = this.deviceConnections.get(toDeviceId)!;

    if (!fromConnections.includes(toDeviceId)) {
      fromConnections.push(toDeviceId);
    }
    if (!toConnections.includes(fromDeviceId)) {
      toConnections.push(fromDeviceId);
    }
  }

  removeDeviceConnection(fromDeviceId: string, toDeviceId: string): void {
    const fromConnections = this.deviceConnections.get(fromDeviceId);
    const toConnections = this.deviceConnections.get(toDeviceId);

    if (fromConnections) {
      const index = fromConnections.indexOf(toDeviceId);
      if (index > -1) {
        fromConnections.splice(index, 1);
      }
    }

    if (toConnections) {
      const index = toConnections.indexOf(fromDeviceId);
      if (index > -1) {
        toConnections.splice(index, 1);
      }
    }
  }

  getConnectedDevices(deviceId: string): string[] {
    return this.deviceConnections.get(deviceId) || [];
  }

  isDeviceConnected(deviceId1: string, deviceId2: string): boolean {
    const connections = this.deviceConnections.get(deviceId1);
    return connections ? connections.includes(deviceId2) : false;
  }

  private async removeAllDeviceConnections(deviceId: string): Promise<void> {
    const connectedDevices = this.getConnectedDevices(deviceId);
    for (const connectedDeviceId of connectedDevices) {
      this.removeDeviceConnection(deviceId, connectedDeviceId);
    }
    this.deviceConnections.delete(deviceId);
  }

  // Device Validation
  validateDevicePosition(device: Device, bounds: { width: number; height: number }): boolean {
    const pos = device.position;
    const size = device.size;
    
    return pos.x >= 0 && 
           pos.y >= 0 && 
           pos.x + size.width <= bounds.width && 
           pos.y + size.height <= bounds.height;
  }

  validateDeviceProperties(device: Device): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const template = this.getDeviceTemplate(device.type);

    if (!template) {
      errors.push(`Unknown device type: ${device.type}`);
      return { valid: false, errors };
    }

    // Validate required properties based on template
    // This is a simplified validation - extend as needed
    if (!device.name || device.name.trim() === '') {
      errors.push('Device name is required');
    }

    if (device.type === 'camera') {
      const camera = device as Camera;
      if (!camera.cameraType) {
        errors.push('Camera type is required');
      }
      if (!camera.resolution) {
        errors.push('Camera resolution is required');
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // Device Search and Filtering
  searchDevices(query: string): Device[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllDevices().filter(device => 
      device.name.toLowerCase().includes(lowercaseQuery) ||
      device.type.toLowerCase().includes(lowercaseQuery) ||
      Object.values(device.properties).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(lowercaseQuery)
      )
    );
  }

  filterDevices(filters: {
    type?: DeviceType;
    floorPlanId?: string;
    properties?: Record<string, any>;
    area?: { topLeft: Point; bottomRight: Point };
  }): Device[] {
    let devices = this.getAllDevices();

    if (filters.type) {
      devices = devices.filter(device => device.type === filters.type);
    }

    if (filters.floorPlanId) {
      devices = devices.filter(device => 
        device.metadata?.floorPlanId === filters.floorPlanId
      );
    }

    if (filters.properties) {
      devices = devices.filter(device => {
        return Object.entries(filters.properties!).every(([key, value]) => 
          device.properties[key] === value
        );
      });
    }

    if (filters.area) {
      devices = this.getDevicesInArea(filters.area.topLeft, filters.area.bottomRight);
    }

    return devices;
  }

  // Utility Methods
  private async loadDeviceTemplates(): Promise<void> {
    // Load default device templates
    const defaultTemplates: DeviceTemplate[] = [
      {
        id: 'camera-dome',
        name: 'Dome Camera',
        type: 'camera',
        category: 'Security',
        manufacturer: 'Generic',
        model: 'Dome-001',
        specifications: {
          dimensions: { width: 40, height: 40, depth: 20 },
          weight: 1.5,
          powerConsumption: 12,
          operatingTemperature: { min: -10, max: 50 },
          humidity: { min: 10, max: 95 },
          certifications: ['IP66'],
          warranty: '2 years'
        },
        defaultProperties: {
          resolution: { width: 1920, height: 1080, mp: 2 },
          fov: { angle: 90, range: 10, direction: 0 },
          nightVision: true,
          poeRequired: true,
          mountType: 'ceiling'
        },
        icon: 'dome-camera',
        thumbnail: '/icons/dome-camera.png'
      }
      // Add more templates as needed
    ];

    for (const template of defaultTemplates) {
      this.deviceTemplates.set(template.type, template);
    }
  }

  private generateId(): string {
    return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
