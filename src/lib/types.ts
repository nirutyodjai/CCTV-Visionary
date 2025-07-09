
export type DeviceType = 
  // CCTV / Surveillance
  | 'cctv-bullet' | 'cctv-dome' | 'cctv-ptz' | 'monitor' | 'nvr'
  // Network / Communication  
  | 'rack' | 'switch' | 'wifi-ap' | 'utp-cat6' | 'fiber-optic' | 'datacenter' | 'network' | 'communication'
  // Electrical / MEP
  | 'electrical-panel' | 'bms' | 'fire-alarm'
  // Security Systems
  | 'access-control' | 'pa-system' | 'audio-system' | 'matv' | 'satellite' | 'nursecall'
  // Architectural
  | 'table' | 'elevator';

export interface DeviceConfig {
  type: DeviceType;
  label: string;
  icon: React.ComponentType<any>;
  colorClass: string;
  properties: Partial<AnyDevice>;
}

export interface BaseDevice {
  id: string;
  type: DeviceType;
  label: string;
  x: number; // 0-1 percentage of width
  y: number; // 0-1 percentage of height
  rotation: number; // 0-360 degrees
  price?: number;
  powerConsumption?: number;
}

export interface CameraDevice extends BaseDevice {
  type: 'cctv-bullet' | 'cctv-dome' | 'cctv-ptz';
  resolution: string;
  fov: number; // Field of View in degrees
  range: number; // in meters
  zoomLevel?: number; // for PTZ
}

export interface NetworkDevice extends BaseDevice {
  type: 'nvr' | 'switch';
  ports: number;
  channels?: number; // for NVR
}

export interface RackContainer extends BaseDevice {
    type: 'rack';
    uHeight: number;
    devices: AnyDevice[];
}

export type AnyDevice = BaseDevice | CameraDevice | NetworkDevice | RackContainer;

export interface Connection {
  id: string;
  fromDeviceId: string;
  toDeviceId: string;
  cableType: 'utp-cat6' | 'fiber-optic';
  path?: { x: number, y: number }[];
}

export type ArchitecturalElementType = 'wall' | 'door' | 'window';

export interface ArchitecturalElement {
  id: string;
  type: ArchitecturalElementType;
  points: { x: number, y: number }[];
}

export interface Floor {
  id: string;
  name: string;
  floorPlanUrl?: string;
  devices: AnyDevice[];
  connections: Connection[];
  architecturalElements: ArchitecturalElement[];
  diagnostics?: any[];
}

export interface Building {
  id: string;
  name: string;
  floors: Floor[];
}

export interface ProjectState {
  id: string;
  projectName: string;
  buildings: Building[];
}

export interface CablingMode {
    enabled: boolean;
    fromDeviceId: string | null;
    cableType: CableType;
}

export type CableType = 'utp-cat6' | 'fiber-optic';
