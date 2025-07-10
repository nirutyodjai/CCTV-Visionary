// Event Types for CCTV Visionary System

export interface BaseEvent {
  id: string;
  timestamp: Date;
  type: string;
  source: string;
  data?: any;
}

// Event Bus Types
export type EventHandler<T extends BaseEvent> = (event: T) => void;

export interface EventBus {
  emit: (event: SystemEvent) => void;
  on: <T extends SystemEvent>(eventType: string, handler: EventHandler<T>) => string;
  off: (listenerId: string) => void;
}

export type SystemEvent = BaseEvent |
  CanvasEvent |
  DeviceEvent |
  ConnectionEvent |
  UIEvent |
  SimulationEvent;

// Canvas Events
export interface CanvasEvent extends BaseEvent {
  position: { x: number; y: number };
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
  };
}

export interface DeviceEvent extends CanvasEvent {
  deviceId: string;
  deviceType: string;
}

export interface ConnectionEvent extends CanvasEvent {
  connectionId: string;
  fromDeviceId: string;
  toDeviceId: string;
}

// Device Events
export interface DeviceAddedEvent extends DeviceEvent {
  type: 'device:added';
  device: any; // Device type from main types
}

export interface DeviceRemovedEvent extends DeviceEvent {
  type: 'device:removed';
}

export interface DeviceMovedEvent extends DeviceEvent {
  type: 'device:moved';
  oldPosition: { x: number; y: number };
  newPosition: { x: number; y: number };
}

export interface DeviceSelectedEvent extends DeviceEvent {
  type: 'device:selected';
  multiSelect: boolean;
}

export interface DevicePropertiesChangedEvent extends DeviceEvent {
  type: 'device:properties:changed';
  properties: Record<string, any>;
  oldProperties: Record<string, any>;
}

// Connection Events
export interface ConnectionAddedEvent extends ConnectionEvent {
  type: 'connection:added';
  connection: any; // Connection type from main types
}

export interface ConnectionRemovedEvent extends ConnectionEvent {
  type: 'connection:removed';
}

export interface ConnectionModifiedEvent extends ConnectionEvent {
  type: 'connection:modified';
  path: Array<{ x: number; y: number }>;
}

// UI Events
export interface UIEvent extends BaseEvent {
  source: 'ui';
}

export interface ToolChangedEvent extends UIEvent {
  type: 'tool:changed';
  tool: string;
  previousTool: string;
}

export interface ViewModeChangedEvent extends UIEvent {
  type: 'view:mode:changed';
  mode: string;
  previousMode: string;
}

export interface ZoomChangedEvent extends UIEvent {
  type: 'view:zoom:changed';
  zoom: number;
  previousZoom: number;
}

export interface PanChangedEvent extends UIEvent {
  type: 'view:pan:changed';
  pan: { x: number; y: number };
  previousPan: { x: number; y: number };
}

// Analysis Events
export interface AnalysisEvent extends BaseEvent {
  source: 'analysis';
}

export interface CoverageAnalysisStartedEvent extends AnalysisEvent {
  type: 'analysis:coverage:started';
  floorPlanId: string;
}

export interface CoverageAnalysisCompletedEvent extends AnalysisEvent {
  type: 'analysis:coverage:completed';
  floorPlanId: string;
  results: any; // CoverageAnalysis type from main types
}

export interface NetworkAnalysisStartedEvent extends AnalysisEvent {
  type: 'analysis:network:started';
  projectId: string;
}

export interface NetworkAnalysisCompletedEvent extends AnalysisEvent {
  type: 'analysis:network:completed';
  projectId: string;
  results: any; // NetworkAnalysis type from main types
}

// Project Events
export interface ProjectEvent extends BaseEvent {
  source: 'project';
  projectId: string;
}

export interface ProjectCreatedEvent extends ProjectEvent {
  type: 'project:created';
  project: any; // Project type from main types
}

export interface ProjectLoadedEvent extends ProjectEvent {
  type: 'project:loaded';
}

export interface ProjectSavedEvent extends ProjectEvent {
  type: 'project:saved';
  autoSave: boolean;
}

export interface ProjectExportedEvent extends ProjectEvent {
  type: 'project:exported';
  format: string;
  destination: string;
}

// Error Events
export interface ErrorEvent extends BaseEvent {
  type: 'error';
  error: Error;
  context: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Keyboard Events
export interface KeyboardEvent extends BaseEvent {
  source: 'keyboard';
  key: string;
  code: string;
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };
}

export interface ShortcutEvent extends KeyboardEvent {
  type: 'shortcut';
  action: string;
}

// File Events
export interface FileEvent extends BaseEvent {
  source: 'file';
  fileName: string;
  fileType: string;
}

export interface FileImportedEvent extends FileEvent {
  type: 'file:imported';
  data: any;
}

export interface FileExportedEvent extends FileEvent {
  type: 'file:exported';
  format: string;
}

// System Management Events
export interface SystemInitializedEvent extends BaseEvent {
  type: 'system:services:initialized';
  source: 'service-manager';
}

export interface SystemDestroyedEvent extends BaseEvent {
  type: 'system:services:destroyed';
  source: 'service-manager';
}

// Simulation Events
export interface SimulationEvent extends BaseEvent {
  source: 'simulation';
}

export interface SimulationStartedEvent extends SimulationEvent {
  type: 'simulation:started';
  data: {
    scenario: any;
  };
}

export interface SimulationUpdatedEvent extends SimulationEvent {
  type: 'simulation:updated';
  data: any;
}

export interface SimulationStoppedEvent extends SimulationEvent {
  type: 'simulation:stopped';
  data: {
    scenario?: any;
    duration: number;
    events: number;
  };
}
