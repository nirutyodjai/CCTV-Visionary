
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
  ipAddress?: string;
  macAddress?: string;
  vlanId?: number;
  status?: 'online' | 'offline' | 'error' | 'installed';
  specifications?: Record<string, any>;
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
  uHeight?: number;
}

export interface RackContainer extends BaseDevice {
    type: 'rack';
    uHeight: number;
    devices: AnyDevice[];
    rack_size?: string;
    ip_rating?: string; // for outdoor racks
}

export type AnyDevice = BaseDevice | CameraDevice | NetworkDevice | RackContainer;

export interface Connection {
  id: string;
  fromDeviceId: string;
  toDeviceId: string;
  cableType: 'utp-cat6' | 'fiber-optic' | 'coaxial' | 'power';
  path?: { x: number, y: number }[];
  length?: number;
  color?: string;
  price?: number;
  specifications?: {
    bandwidth?: string;
    maxLength?: number;
    shielding?: string;
    conduitRequired?: boolean;
    conduitType?: string;
  };
}

export type ArchitecturalElementType = 'wall' | 'door' | 'window' | 'table' | 'chair' | 'elevator' | 'fire-escape' | 'shaft' | 'tree' | 'motorcycle' | 'car' | 'supercar' | 'area';

export interface ArchitecturalElement {
  id: string;
  type: ArchitecturalElementType;
  points: { x: number, y: number }[];
  color?: string;
  opacity?: number;
  width?: number;
  height?: number;
  scale?: number;
  shadow?: {
    enabled: boolean;
    offsetX: number;
    offsetY: number;
    blur: number;
    opacity: number;
    color: string;
  };
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

export type CableType = 'utp-cat6' | 'fiber-optic' | 'coaxial' | 'power';

export interface VLAN {
  id: string;
  name: string;
  color: string;
}

export interface Subnet {
  id: string;
  cidr: string;
}
