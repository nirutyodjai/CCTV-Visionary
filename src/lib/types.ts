export type DeviceType = 
  | 'cctv-bullet' | 'cctv-dome' | 'cctv-ptz'
  | 'nvr' | 'monitor' | 'wifi-ap' | 'switch'
  | 'utp-cat6' | 'fiber-optic';

export interface Device {
  id: string;
  type: DeviceType;
  x: number;
  y: number;
  label: string;
  // CCTV specific
  resolution?: '1080p' | '4MP' | '4K';
  fov?: number;
  range?: number;
  rotation?: number;
  // NVR specific
  channels?: 4 | 8 | 16 | 32;
  storage?: '1TB' | '2TB' | '4TB' | '8TB';
  // Monitor specific
  size?: '19"' | '22"' | '24"' | '27"';
  // Switch specific
  ports?: number;
  // Cable specific
  length?: number;
}

export interface PlanState {
  planName: string;
  totalFloors: number;
  currentFloor: number;
  devicesByFloor: Record<number, Device[]>;
  floorPlansByFloor: Record<number, string | null>;
}

export type PlacementSuggestion = {
  type: 'cctv-bullet' | 'cctv-dome' | 'wifi-ap';
  x: number;
  y: number;
  reason: string;
};
