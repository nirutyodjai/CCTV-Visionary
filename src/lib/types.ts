
export type DeviceType =
  | 'cctv-bullet'
  | 'cctv-dome'
  | 'cctv-ptz'
  | 'wifi-ap'
  | 'nvr'
  | 'switch'
  | 'monitor'
  | 'utp-cat6'
  | 'fiber-optic'
  | 'rack-indoor'
  | 'rack-outdoor'
  // Rack-specific devices
  | 'patch-panel'
  | 'pdu'
  | 'ups';

export type ArchitecturalElementType = 'wall' | 'door' | 'window';
export type CableType = 'utp-cat6' | 'fiber-optic';

export interface Point {
  x: number;
  y: number;
}

export interface BaseDevice {
  id: string;
  type: DeviceType;
  label: string;
  x: number; // Relative coordinate on floor plan (0-1)
  y: number; // Relative coordinate on floor plan (0-1)
  price?: number;
  powerConsumption?: number; // in Watts
  ipAddress?: string;
  vlanId?: number;
}

// Specific device types
export interface CameraDevice extends BaseDevice {
  type: 'cctv-bullet' | 'cctv-dome' | 'cctv-ptz';
  resolution: string;
  fov: number;
  range: number;
  rotation: number;
}

export interface WifiAPDevice extends BaseDevice {
  type: 'wifi-ap';
  range: number;
}

export interface NvrDevice extends BaseDevice {
  type: 'nvr';
  channels: number;
  storage: string;
  uHeight: number;
}

export interface SwitchDevice extends BaseDevice {
  type: 'switch';
  ports: number;
  uHeight: number;
}

export interface MonitorDevice extends BaseDevice {
  type: 'monitor';
  size: string;
}

// Container devices
export interface RackContainer extends BaseDevice {
  type: 'rack-indoor' | 'rack-outdoor';
  rack_size: string; // e.g. '9U', '42U'
  ip_rating?: string;
  devices?: RackDevice[];
}

// Devices that can be placed inside a rack
export interface RackDevice {
    id: string;
    type: DeviceType;
    label: string;
    uPosition: number;
    uHeight: number;
    price?: number;
    powerConsumption?: number;
    powerCapacity?: number;
}

export type AnyDevice = BaseDevice & { [key: string]: any };


export interface Connection {
  id: string;
  fromDeviceId: string;
  toDeviceId: string;
  cableType: CableType;
  length?: number;
  price?: number;
}

export interface ArchitecturalElement {
  id: string;
  type: ArchitecturalElementType;
  start: Point;
  end: Point;
}

export interface Floor {
  id: string;
  name: string;
  floorPlanUrl: string | null;
  devices: AnyDevice[];
  connections: Connection[];
  architecturalElements: ArchitecturalElement[];
  floorPlanRect?: DOMRect | null;
}

export interface Building {
  id:string;
  name: string;
  floors: Floor[];
}

export interface VLAN {
  id: number;
  name: string;
  color: string;
}

export interface Subnet {
  id: string;
  cidr: string;
  gateway?: string;
  buildingId: string;
  floorId?: string;
}

export interface ProjectState {
  projectName: string;
  buildings: Building[];
  vlans: VLAN[];
  subnets: Subnet[];
}

export interface CablingMode {
  enabled: boolean;
  fromDeviceId: string | null;
}
