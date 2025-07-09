/**
 * @fileOverview Cable Length Calculation and Conduit Design System
 * ระบบคำนวณระยะสายและการออกแบบท่อสำหรับงาน CCTV
 */

import type { AnyDevice, Connection, ArchitecturalElement } from '@/lib/types';
import type { CalibrationData, CalibrationSettings } from '@/lib/calibration';
import { calculateCalibratedCableLength, DEFAULT_CALIBRATION_SETTINGS } from '@/lib/calibration';

export interface CableSpecs {
  type: 'utp-cat6' | 'fiber-optic' | 'coaxial' | 'power';
  maxLength: number;
  bandwidth?: string;
  powerRating?: number;
  shielding: string;
  diameter: number; // mm
  bendRadius: number; // minimum bend radius in mm
  pricePerMeter: number;
}

export interface ConduitSpecs {
  type: 'pvc' | 'steel' | 'flex' | 'cable-tray';
  size: number; // internal diameter in mm
  maxFillRatio: number; // 0.4 = 40% fill ratio
  pricePerMeter: number;
  installationDifficulty: 'easy' | 'medium' | 'hard';
  weatherResistant: boolean;
}

export interface PathCalculationOptions {
  includeSlack: boolean;
  slackPercentage: number; // default 10%
  ceilingHeight: number; // meters
  conduitRequired: boolean;
  weatherProtection: boolean;
  pathType: 'direct' | 'ceiling' | 'wall' | 'underground' | 'mixed';
}

export interface CablePathResult {
  totalLength: number;
  segments: PathSegment[];
  conduitRequired: ConduitRequirement[];
  estimatedCost: number;
  installationTime: number; // hours
  warnings: string[];
  recommendations: string[];
}

export interface PathSegment {
  start: { x: number; y: number; z?: number };
  end: { x: number; y: number; z?: number };
  length: number;
  type: 'horizontal' | 'vertical' | 'diagonal';
  environment: 'indoor' | 'outdoor' | 'ceiling' | 'wall' | 'underground';
  obstacles: string[];
}

export interface ConduitRequirement {
  conduitType: ConduitSpecs;
  length: number;
  cableCount: number;
  cost: number;
}

// ข้อมูลสายเคเบิลมาตรฐาน
export const CABLE_SPECIFICATIONS: Record<string, CableSpecs> = {
  'utp-cat6': {
    type: 'utp-cat6',
    maxLength: 100, // meters
    bandwidth: '1 Gbps',
    shielding: 'UTP',
    diameter: 6.2,
    bendRadius: 25,
    pricePerMeter: 8.50
  },
  'utp-cat6a': {
    type: 'utp-cat6',
    maxLength: 100,
    bandwidth: '10 Gbps',
    shielding: 'STP',
    diameter: 7.8,
    bendRadius: 30,
    pricePerMeter: 12.00
  },
  'fiber-optic-single': {
    type: 'fiber-optic',
    maxLength: 2000,
    bandwidth: '10 Gbps+',
    shielding: 'Armored',
    diameter: 9.0,
    bendRadius: 15,
    pricePerMeter: 25.00
  },
  'fiber-optic-multi': {
    type: 'fiber-optic',
    maxLength: 550,
    bandwidth: '10 Gbps',
    shielding: 'Standard',
    diameter: 12.0,
    bendRadius: 20,
    pricePerMeter: 18.00
  },
  'coaxial-rg6': {
    type: 'coaxial',
    maxLength: 150,
    bandwidth: '1 GHz',
    shielding: 'Quad Shield',
    diameter: 6.9,
    bendRadius: 35,
    pricePerMeter: 15.00
  },
  'power-cable': {
    type: 'power',
    maxLength: 50,
    powerRating: 220,
    shielding: 'PVC',
    diameter: 12.0,
    bendRadius: 50,
    pricePerMeter: 22.00
  }
};

// ข้อมูลท่อและรางเคเบิล
export const CONDUIT_SPECIFICATIONS: Record<string, ConduitSpecs> = {
  'pvc-20': {
    type: 'pvc',
    size: 20,
    maxFillRatio: 0.4,
    pricePerMeter: 35.00,
    installationDifficulty: 'easy',
    weatherResistant: true
  },
  'pvc-25': {
    type: 'pvc',
    size: 25,
    maxFillRatio: 0.4,
    pricePerMeter: 45.00,
    installationDifficulty: 'easy',
    weatherResistant: true
  },
  'pvc-32': {
    type: 'pvc',
    size: 32,
    maxFillRatio: 0.4,
    pricePerMeter: 65.00,
    installationDifficulty: 'medium',
    weatherResistant: true
  },
  'steel-flexible': {
    type: 'flex',
    size: 25,
    maxFillRatio: 0.35,
    pricePerMeter: 85.00,
    installationDifficulty: 'medium',
    weatherResistant: false
  },
  'cable-tray-100': {
    type: 'cable-tray',
    size: 100,
    maxFillRatio: 0.5,
    pricePerMeter: 180.00,
    installationDifficulty: 'hard',
    weatherResistant: false
  },
  'cable-tray-200': {
    type: 'cable-tray',
    size: 200,
    maxFillRatio: 0.5,
    pricePerMeter: 320.00,
    installationDifficulty: 'hard',
    weatherResistant: false
  }
};

/**
 * คำนวณระยะทางระหว่างจุดสองจุด
 */
export function calculateDistance(point1: { x: number; y: number; z?: number }, point2: { x: number; y: number; z?: number }): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  const dz = (point2.z || 0) - (point1.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * คำนวณเส้นทางและระยะสายสำหรับการเชื่อมต่อ
 */
export function calculateCablePath(
  fromDevice: AnyDevice,
  toDevice: AnyDevice,
  connection: Connection,
  options: PathCalculationOptions = {
    includeSlack: true,
    slackPercentage: 10,
    ceilingHeight: 3.0,
    conduitRequired: false,
    weatherProtection: false,
    pathType: 'ceiling'
  }
): CablePathResult {
  
  const cableSpec = CABLE_SPECIFICATIONS[connection.cableType] || CABLE_SPECIFICATIONS['utp-cat6'];
  
  // คำนวณระยะทางพื้นฐาน
  let totalLength = 0;
  const segments: PathSegment[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // ถ้ามี path ที่กำหนดไว้แล้ว ใช้ path นั้น
  if (connection.path && connection.path.length > 1) {
    for (let i = 0; i < connection.path.length - 1; i++) {
      const start = connection.path[i];
      const end = connection.path[i + 1];
      const segmentLength = calculateDistance(start, end);
      
      segments.push({
        start,
        end,
        length: segmentLength,
        type: Math.abs(start.x - end.x) > Math.abs(start.y - end.y) ? 'horizontal' : 'vertical',
        environment: 'indoor',
        obstacles: []
      });
      
      totalLength += segmentLength;
    }
  } else {
    // คำนวณเส้นทางพื้นฐาน (เส้นตรง)
    const directDistance = calculateDistance(fromDevice, toDevice);
    
    // เพิ่มความสูงสำหรับเส้นทางผ่านเพดาน
    if (options.pathType === 'ceiling') {
      // ขึ้นเพดาน + เดินบนเพดาน + ลงจากเพดาน
      const verticalDistance = options.ceilingHeight * 2; // ขึ้นและลง
      totalLength = directDistance + verticalDistance;
      
      segments.push({
        start: { x: fromDevice.x, y: fromDevice.y, z: 0 },
        end: { x: fromDevice.x, y: fromDevice.y, z: options.ceilingHeight },
        length: options.ceilingHeight,
        type: 'vertical',
        environment: 'indoor',
        obstacles: []
      });
      
      segments.push({
        start: { x: fromDevice.x, y: fromDevice.y, z: options.ceilingHeight },
        end: { x: toDevice.x, y: toDevice.y, z: options.ceilingHeight },
        length: directDistance,
        type: 'horizontal',
        environment: 'ceiling',
        obstacles: []
      });
      
      segments.push({
        start: { x: toDevice.x, y: toDevice.y, z: options.ceilingHeight },
        end: { x: toDevice.x, y: toDevice.y, z: 0 },
        length: options.ceilingHeight,
        type: 'vertical',
        environment: 'indoor',
        obstacles: []
      });
    } else {
      totalLength = directDistance;
      segments.push({
        start: { x: fromDevice.x, y: fromDevice.y },
        end: { x: toDevice.x, y: toDevice.y },
        length: directDistance,
        type: 'diagonal',
        environment: 'indoor',
        obstacles: []
      });
    }
  }

  // เพิ่ม slack
  if (options.includeSlack) {
    totalLength *= (1 + options.slackPercentage / 100);
  }

  // ตรวจสอบขีดจำกัดความยาวสาย
  if (totalLength > cableSpec.maxLength) {
    warnings.push(`ระยะสาย ${totalLength.toFixed(1)}m เกินขีดจำกัด ${cableSpec.maxLength}m สำหรับ ${cableSpec.type}`);
    recommendations.push(`ควรใช้ repeater หรือเปลี่ยนเป็น fiber optic`);
  }

  // คำนวณค่าใช้จ่าย
  const cableCost = totalLength * cableSpec.pricePerMeter;
  
  // คำนวณความต้องการท่อ
  const conduitRequired: ConduitRequirement[] = [];
  if (options.conduitRequired) {
    const recommendedConduit = selectOptimalConduit([cableSpec]);
    conduitRequired.push({
      conduitType: recommendedConduit,
      length: totalLength,
      cableCount: 1,
      cost: totalLength * recommendedConduit.pricePerMeter
    });
  }

  const conduitCost = conduitRequired.reduce((sum, req) => sum + req.cost, 0);
  const estimatedCost = cableCost + conduitCost;

  // คำนวณเวลาติดตั้ง (ประมาณการ)
  const installationTime = calculateInstallationTime(totalLength, options.pathType, options.conduitRequired);

  return {
    totalLength,
    segments,
    conduitRequired,
    estimatedCost,
    installationTime,
    warnings,
    recommendations
  };
}

/**
 * คำนวณเส้นทางและระยะสายสำหรับการเชื่อมต่อ (Enhanced with Calibration)
 */
export function calculateCablePathWithCalibration(
  fromDevice: AnyDevice,
  toDevice: AnyDevice,
  connection: Connection,
  calibrationData?: CalibrationData,
  calibrationSettings?: CalibrationSettings,
  options: PathCalculationOptions = {
    includeSlack: true,
    slackPercentage: 10,
    ceilingHeight: 3.0,
    conduitRequired: false,
    weatherProtection: false,
    pathType: 'ceiling'
  }
): CablePathResult & {
  calibratedLength?: number;
  calibrationUsed: boolean;
  realWorldAdjustments?: {
    slack: number;
    installation: number;
    bend: number;
    termination: number;
  };
} {
  // คำนวณแบบดั้งเดิม
  const basicResult = calculateCablePath(fromDevice, toDevice, connection, options);
  
  // ถ้ามี calibration data ให้ใช้การคำนวณแบบ calibrated
  if (calibrationData) {
    const calibratedResult = calculateCalibratedCableLength(
      fromDevice,
      toDevice,
      connection,
      calibrationData,
      calibrationSettings || DEFAULT_CALIBRATION_SETTINGS
    );
    
    return {
      ...basicResult,
      calibratedLength: calibratedResult.totalLength,
      calibrationUsed: true,
      realWorldAdjustments: calibratedResult.adjustments,
      totalLength: calibratedResult.totalLength, // override with calibrated length
      estimatedCost: calibratedResult.totalLength * (CABLE_SPECIFICATIONS[connection.cableType]?.pricePerMeter || 8.50)
    };
  }
  
  return {
    ...basicResult,
    calibrationUsed: false
  };
}

/**
 * Enhanced Cable Calculation with Calibration Support
 */

// เพิ่ม interface สำหรับ calibrated results
export interface CalibratedCableResult extends CablePathResult {
  calibratedLength?: number;
  calibrationUsed: boolean;
  realWorldAdjustments?: {
    slack: number;
    installation: number;
    bend: number;
    termination: number;
  };
}

/**
 * คำนวณระยะสายสำหรับหลายการเชื่อมต่อด้วย calibration
 */
export function calculateMultipleCablesWithCalibration(
  devices: AnyDevice[],
  connections: Connection[],
  calibrationData?: CalibrationData,
  calibrationSettings?: CalibrationSettings
): {
  results: (CalibratedCableResult & { connectionId: string })[];
  summary: {
    totalLength: number;
    totalCost: number;
    calibratedConnections: number;
    averageAccuracy: number;
  };
} {
  const results = connections.map(conn => {
    const fromDevice = devices.find(d => d.id === conn.fromDeviceId);
    const toDevice = devices.find(d => d.id === conn.toDeviceId);
    
    if (!fromDevice || !toDevice) {
      return null;
    }
    
    const result = calculateCablePathWithCalibration(
      fromDevice,
      toDevice,
      conn,
      calibrationData,
      calibrationSettings
    );
    
    return {
      ...result,
      connectionId: conn.id
    };
  }).filter(Boolean) as (CalibratedCableResult & { connectionId: string })[];

  const summary = {
    totalLength: results.reduce((sum, r) => sum + r.totalLength, 0),
    totalCost: results.reduce((sum, r) => sum + r.estimatedCost, 0),
    calibratedConnections: results.filter(r => r.calibrationUsed).length,
    averageAccuracy: calibrationData ? (100 - calibrationData.accuracy.deviation) : 0
  };

  return { results, summary };
}

/**
 * เลือกท่อที่เหมาะสมสำหรับสายเคเบิล
 */
export function selectOptimalConduit(cables: CableSpecs[]): ConduitSpecs {
  // คำนวณขนาดรวมของสายทั้งหมด
  const totalCableArea = cables.reduce((sum, cable) => {
    const radius = cable.diameter / 2;
    return sum + Math.PI * radius * radius;
  }, 0);

  // หาท่อที่เหมาะสม (fill ratio ไม่เกิน 40%)
  const conduitOptions = Object.values(CONDUIT_SPECIFICATIONS);
  
  for (const conduit of conduitOptions.sort((a, b) => a.size - b.size)) {
    const conduitArea = Math.PI * (conduit.size / 2) * (conduit.size / 2);
    const fillRatio = totalCableArea / conduitArea;
    
    if (fillRatio <= conduit.maxFillRatio) {
      return conduit;
    }
  }

  // ถ้าไม่มีท่อที่เหมาะสม ให้ใช้ cable tray
  return CONDUIT_SPECIFICATIONS['cable-tray-200'];
}

/**
 * คำนวณเวลาติดตั้ง
 */
export function calculateInstallationTime(
  length: number,
  pathType: string,
  hasConduit: boolean
): number {
  let baseTime = length * 0.1; // 0.1 ชั่วโมงต่อเมตร

  // ปรับตามประเภทเส้นทาง
  const multipliers = {
    'direct': 1.0,
    'ceiling': 1.5,
    'wall': 1.3,
    'underground': 2.0,
    'mixed': 1.7
  };

  baseTime *= multipliers[pathType as keyof typeof multipliers] || 1.0;

  // เพิ่มเวลาถ้ามีท่อ
  if (hasConduit) {
    baseTime *= 1.5;
  }

  return Math.max(baseTime, 0.5); // อย่างน้อย 30 นาที
}

/**
 * วิเคราะห์เส้นทางและสิ่งกีดขวาง
 */
export function analyzePathObstacles(
  start: { x: number; y: number },
  end: { x: number; y: number },
  walls: ArchitecturalElement[]
): string[] {
  const obstacles: string[] = [];
  
  // ตรวจสอบการผ่านกำแพง
  for (const wall of walls.filter(w => w.type === 'wall')) {
    if (isPathCrossingWall(start, end, wall)) {
      obstacles.push(`ผ่านกำแพง (${wall.id})`);
    }
  }

  return obstacles;
}

/**
 * ตรวจสอบว่าเส้นทางผ่านกำแพงหรือไม่
 */
function isPathCrossingWall(
  start: { x: number; y: number },
  end: { x: number; y: number },
  wall: ArchitecturalElement
): boolean {
  // Simplified line intersection check
  if (wall.points.length < 2) return false;
  
  for (let i = 0; i < wall.points.length - 1; i++) {
    const wallStart = wall.points[i];
    const wallEnd = wall.points[i + 1];
    
    if (doLinesIntersect(start, end, wallStart, wallEnd)) {
      return true;
    }
  }
  
  return false;
}

/**
 * ตรวจสอบการตัดกันของเส้น
 */
function doLinesIntersect(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number }
): boolean {
  const denominator = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  
  if (denominator === 0) return false; // Parallel lines
  
  const ua = ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denominator;
  const ub = ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denominator;
  
  return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
}

/**
 * สร้างรายงานสรุประบบสาย
 */
export function generateCableReport(connections: Connection[], devices: AnyDevice[]): {
  totalCableLength: Record<string, number>;
  totalCost: number;
  conduitRequirements: ConduitRequirement[];
  recommendations: string[];
} {
  const cableSummary: Record<string, number> = {};
  let totalCost = 0;
  const conduitRequirements: ConduitRequirement[] = [];
  const recommendations: string[] = [];

  for (const connection of connections) {
    const fromDevice = devices.find(d => d.id === connection.fromDeviceId);
    const toDevice = devices.find(d => d.id === connection.toDeviceId);
    
    if (!fromDevice || !toDevice) continue;

    const pathResult = calculateCablePath(fromDevice, toDevice, connection);
    
    // สะสมความยาวสาย
    const cableType = connection.cableType;
    cableSummary[cableType] = (cableSummary[cableType] || 0) + pathResult.totalLength;
    
    totalCost += pathResult.estimatedCost;
    conduitRequirements.push(...pathResult.conduitRequired);
    recommendations.push(...pathResult.recommendations);
  }

  return {
    totalCableLength: cableSummary,
    totalCost,
    conduitRequirements,
    recommendations: [...new Set(recommendations)] // remove duplicates
  };
}
