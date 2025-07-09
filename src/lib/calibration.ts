/**
 * @fileOverview Cable Calculation Calibration System
 * ระบบ Calibration สำหรับการคำนวณระยะสายให้ตรงกับงานจริง
 */

import type { AnyDevice, Connection, Floor } from '@/lib/types';

// เพิ่ม interfaces สำหรับระบบ bandwidth calculation
export interface CameraSpec {
  resolution: '720p' | '1080p' | '4K' | '8K';
  fps: number;
  compression: 'H.264' | 'H.265' | 'MJPEG';
  streams: number; // จำนวน streams (main + sub streams)
  bitrate?: number; // Mbps (optional, จะคำนวณอัตโนมัติถ้าไม่ระบุ)
}

export interface NetworkBandwidthRequirement {
  totalRequired: number; // Mbps รวมทั้งระบบ
  cameraBandwidth: number; // Mbps จากกล้องทั้งหมด
  additionalBandwidth: number; // Mbps จากอุปกรณ์อื่น
  overhead: number; // Mbps overhead
  safetyMargin: number; // Mbps safety margin
  recommendedUplink: number; // Mbps uplink ที่แนะนำ
}

export interface BandwidthCalculationResult {
  cameras: Array<{
    id: string;
    label: string;
    bandwidth: number;
    specs: CameraSpec;
  }>;
  networkRequirements: NetworkBandwidthRequirement;
  utilizationAnalysis: {
    overall: {
      utilization: number;
      status: 'optimal' | 'warning' | 'critical';
      recommendations: string[];
    };
    connections: Array<{
      id: string;
      utilization: number;
      status: 'optimal' | 'warning' | 'critical';
      bottleneck?: string;
    }>;
  };
  summary: {
    totalCameras: number;
    totalBandwidth: number;
    peakUsage: number;
    averagePerCamera: number;
  };
  recommendations: string[];
  generatedAt: Date;
}

// Cable routing details interface
export interface CableRoutingDetails {
  connectionId: string;
  sourceInfo: {
    deviceId: string;
    dropLength: number; // ระยะสายลงจากเพดาน/ขึ้นจากพื้น (เมตร)
    mountingHeight: number; // ความสูงติดตั้งอุปกรณ์ (เมตร)
    cableEntry: 'top' | 'bottom' | 'side'; // ทิศทางเข้าสาย
  };
  destinationInfo: {
    deviceId: string;
    dropLength: number;
    mountingHeight: number;
    cableEntry: 'top' | 'bottom' | 'side';
  };
  routingPath: {
    pathType: 'ceiling' | 'wall' | 'floor' | 'underground';
    intermediatePoints: Array<{ x: number; y: number; description?: string }>;
  };
  customLengths: {
    horizontalLength?: number; // กรอกเอง (optional)
    verticalLength?: number; // กรอกเอง (optional)
    totalCustomLength: number; // รวมกรอกเอง
  };
}

export interface NetworkInfrastructure {
  switches: {
    deviceId: string;
    ports: number;
    uplinkBandwidth: number; // Mbps
    totalBandwidth: number; // Mbps
  }[];
  backbone: {
    bandwidth: number; // Mbps
    type: 'copper' | 'fiber';
    redundancy: boolean;
  };
  internetUplink: {
    bandwidth: number; // Mbps
    provider: string;
  };
}

export interface CableTypeSpec {
  type: 'cat5e' | 'cat6' | 'cat6a' | 'fiber-single' | 'fiber-multi';
  name: string; // เพิ่ม name property
  maxBandwidth: number; // Mbps
  maxDistance: number; // meters
  cost: number; // ราคาต่อเมตร (บาท)
  installation: 'easy' | 'medium' | 'complex';
}

// Cable specifications
export const CABLE_SPECIFICATIONS: CableTypeSpec[] = [
  {
    type: 'cat5e',
    name: 'Cat5e UTP',
    maxBandwidth: 1000, // 1 Gbps
    maxDistance: 100,
    cost: 8,
    installation: 'easy'
  },
  {
    type: 'cat6',
    name: 'Cat6 UTP',
    maxBandwidth: 1000, // 1 Gbps (10 Gbps for short distances)
    maxDistance: 100,
    cost: 12,
    installation: 'easy'
  },
  {
    type: 'cat6a',
    name: 'Cat6a UTP',
    maxBandwidth: 10000, // 10 Gbps
    maxDistance: 100,
    cost: 18,
    installation: 'medium'
  },
  {
    type: 'fiber-single',
    name: 'Single Mode Fiber',
    maxBandwidth: 100000, // 100 Gbps+
    maxDistance: 10000,
    cost: 25,
    installation: 'complex'
  },
  {
    type: 'fiber-multi',
    name: 'Multi Mode Fiber',
    maxBandwidth: 40000, // 40 Gbps
    maxDistance: 2000,
    cost: 20,
    installation: 'complex'
  }
];

// Camera bandwidth presets based on resolution and compression
export const CAMERA_BANDWIDTH_PRESETS: Record<string, Record<string, number>> = {
  '720p': {
    'H.264': 2,
    'H.265': 1,
    'MJPEG': 8
  },
  '1080p': {
    'H.264': 4,
    'H.265': 2,
    'MJPEG': 16
  },
  '4K': {
    'H.264': 15,
    'H.265': 8,
    'MJPEG': 50
  },
  '8K': {
    'H.264': 50,
    'H.265': 25,
    'MJPEG': 150
  }
};

export interface CalibrationPoint {
  id: string;
  label: string;
  virtualCoords: { x: number; y: number }; // coordinates ใน canvas (0-1)
  realWorldDistance?: number; // ระยะทางจริงในหน่วยเมตร
  isReference: boolean; // จุดอ้างอิงหลัก
}

export interface CalibrationData {
  id: string;
  floorId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  points: CalibrationPoint[];
  baseScale: number; // pixels per meter
  realWorldDimensions: {
    width: number; // เมตร
    height: number; // เมตร
  };
  referenceDistances: {
    horizontal: number; // ระยะอ้างอิงในแนวนอน (เมตร)
    vertical: number; // ระยะอ้างอิงในแนวตั้ง (เมตร)
    diagonal: number; // ระยะอ้างอิงในแนวทแยง (เมตร)
  };
  accuracy: {
    deviation: number; // ค่าเบี่ยงเบนเฉลี่ย (เปอร์เซ็นต์)
    confidence: 'low' | 'medium' | 'high';
    lastValidated: Date;
  };
}

export interface CalibrationSettings {
  slackFactor: number; // ปัจจัยเผื่อสาย (10-20%)
  installationFactors: {
    ceiling: number; // 1.5x สำหรับเส้นทางเพดาน
    wall: number; // 1.3x สำหรับเส้นทางผนัง
    underground: number; // 2.0x สำหรับใต้ดิน
    outdoor: number; // 1.4x สำหรับกลางแจ้ง
  };
  bendAllowance: number; // เผื่อการโค้งงอ (5-10%)
  terminationAllowance: number; // เผื่อการต่อปลาย (0.5-1 เมตร)
  // เพิ่มการตั้งค่าสำหรับสายขึ้น-ลง
  verticalCabling: {
    sourceDropLength: number; // ระยะสายต้นทาง (ลงจากเพดาน/ขึ้นจากพื้น)
    destinationDropLength: number; // ระยะสายปลายทาง (ลงจากเพดาน/ขึ้นจากพื้น)
    ceilingHeight: number; // ความสูงเพดาน (เมตร)
    riserAllowance: number; // เผื่อสำหรับ riser/backbone cable
  };
}

// Default calibration settings
export const DEFAULT_CALIBRATION_SETTINGS: CalibrationSettings = {
  slackFactor: 0.15, // 15%
  installationFactors: {
    ceiling: 1.5,
    wall: 1.3,
    underground: 2.0,
    outdoor: 1.4
  },
  bendAllowance: 0.08, // 8%
  terminationAllowance: 1.0, // 1 เมตร
  verticalCabling: {
    sourceDropLength: 1.5, // 1.5 เมตร (ระยะสายต้นทาง)
    destinationDropLength: 1.5, // 1.5 เมตร (ระยะสายปลายทาง)
    ceilingHeight: 3.0, // 3 เมตร (ความสูงเพดาน)
    riserAllowance: 0.5 // 0.5 เมตร (เผื่อสำหรับ riser)
  }
};

/**
 * คำนวณระยะทางจริงระหว่างสองจุดใน virtual space
 */
export function calculateVirtualDistance(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const dx = Math.abs(point2.x - point1.x);
  const dy = Math.abs(point2.y - point1.y);
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * แปลงระยะทาง virtual เป็นระยะทางจริง
 */
export function virtualToRealWorld(
  virtualDistance: number,
  calibrationData: CalibrationData
): number {
  const { realWorldDimensions } = calibrationData;
  
  // ใช้ค่าเฉลี่ยของความกว้างและความสูงเป็นฐาน
  const avgDimension = (realWorldDimensions.width + realWorldDimensions.height) / 2;
  const avgVirtualDimension = 0.5; // ค่าเฉลี่ยของ 0-1 coordinate space
  
  // คำนวณ scale factor
  const scaleFactor = avgDimension / avgVirtualDimension;
  
  return virtualDistance * scaleFactor;
}

/**
 * คำนวณระยะสายที่ปรับแล้วตาม calibration
 */
export function calculateCalibratedCableLength(
  fromDevice: AnyDevice,
  toDevice: AnyDevice,
  connection: Connection,
  calibrationData: CalibrationData,
  settings: CalibrationSettings = DEFAULT_CALIBRATION_SETTINGS
): {
  baseLength: number;
  adjustedLength: number;
  totalLength: number;
  adjustments: {
    slack: number;
    installation: number;
    bend: number;
    termination: number;
  };
} {
  // คำนวณระยะทางพื้นฐาน
  let baseLength: number;
  
  if (connection.path && connection.path.length > 1) {
    // ใช้ path ที่กำหนดไว้
    baseLength = 0;
    for (let i = 0; i < connection.path.length - 1; i++) {
      const segmentDistance = calculateVirtualDistance(
        connection.path[i],
        connection.path[i + 1]
      );
      baseLength += virtualToRealWorld(segmentDistance, calibrationData);
    }
  } else {
    // คำนวณเส้นตรง
    const directDistance = calculateVirtualDistance(fromDevice, toDevice);
    baseLength = virtualToRealWorld(directDistance, calibrationData);
  }

  // คำนวณค่าปรับต่างๆ
  const slackAdjustment = baseLength * settings.slackFactor;
  const bendAdjustment = baseLength * settings.bendAllowance;
  
  // กำหนดปัจจัยการติดตั้งตามประเภทเส้นทาง
  let installationFactor = settings.installationFactors.ceiling; // default
  
  // ตรวจสอบประเภทการติดตั้งจาก connection metadata หรือ device type
  if (connection.cableType === 'fiber-optic') {
    installationFactor = settings.installationFactors.underground;
  } else if (fromDevice.type.includes('outdoor') || toDevice.type.includes('outdoor')) {
    installationFactor = settings.installationFactors.outdoor;
  }
  
  const installationAdjustment = baseLength * (installationFactor - 1);
  const terminationAdjustment = settings.terminationAllowance;

  const adjustedLength = baseLength + slackAdjustment + installationAdjustment + bendAdjustment;
  const totalLength = adjustedLength + terminationAdjustment;

  return {
    baseLength,
    adjustedLength,
    totalLength,
    adjustments: {
      slack: slackAdjustment,
      installation: installationAdjustment,
      bend: bendAdjustment,
      termination: terminationAdjustment
    }
  };
}

/**
 * คำนวณระยะสายที่ปรับแล้วตาม calibration พร้อมระยะสายขึ้น-ลง
 */
export function calculateCalibratedCableLengthWithDrops(
  fromDevice: AnyDevice,
  toDevice: AnyDevice,
  connection: Connection,
  calibrationData: CalibrationData,
  settings: CalibrationSettings = DEFAULT_CALIBRATION_SETTINGS,
  routingDetails?: CableRoutingDetails
): {
  baseLength: number;
  verticalLengths: {
    sourceDropLength: number;
    destinationDropLength: number;
    riserLength: number;
  };
  adjustedLength: number;
  totalLength: number;
  adjustments: {
    slack: number;
    installation: number;
    bend: number;
    termination: number;
  };
  breakdown: {
    horizontalDistance: number;
    verticalDistance: number;
    customLengths: number;
  };
} {
  // คำนวณระยะทางแนวนอนพื้นฐาน
  let horizontalDistance: number;
  
  if (connection.path && connection.path.length > 1) {
    // ใช้ path ที่กำหนดไว้
    horizontalDistance = 0;
    for (let i = 0; i < connection.path.length - 1; i++) {
      const segmentDistance = calculateVirtualDistance(
        connection.path[i],
        connection.path[i + 1]
      );
      horizontalDistance += virtualToRealWorld(segmentDistance, calibrationData);
    }
  } else {
    // คำนวณเส้นตรง
    const directDistance = calculateVirtualDistance(fromDevice, toDevice);
    horizontalDistance = virtualToRealWorld(directDistance, calibrationData);
  }

  // คำนวณระยะสายแนวตั้ง
  const verticalLengths = {
    sourceDropLength: routingDetails?.sourceInfo.dropLength || settings.verticalCabling.sourceDropLength,
    destinationDropLength: routingDetails?.destinationInfo.dropLength || settings.verticalCabling.destinationDropLength,
    riserLength: settings.verticalCabling.riserAllowance
  };

  // คำนวณระยะทางที่กำหนดเองเพิ่มเติม
  const customLengths = routingDetails?.customLengths.totalCustomLength || 0;

  // ระยะทางรวมพื้นฐาน
  const baseLength = horizontalDistance + verticalLengths.sourceDropLength + 
                    verticalLengths.destinationDropLength + verticalLengths.riserLength + customLengths;

  // คำนวณค่าปรับต่างๆ
  const slackAdjustment = baseLength * settings.slackFactor;
  const bendAdjustment = baseLength * settings.bendAllowance;
  
  // กำหนดปัจจัยการติดตั้งตามประเภทเส้นทาง
  let installationFactor = settings.installationFactors.ceiling; // default
  
  if (routingDetails?.routingPath.pathType) {
    switch (routingDetails.routingPath.pathType) {
      case 'wall':
        installationFactor = settings.installationFactors.wall;
        break;
      case 'underground':
        installationFactor = settings.installationFactors.underground;
        break;
      case 'ceiling':
      case 'floor':
        installationFactor = settings.installationFactors.ceiling;
        break;
    }
  } else if (connection.cableType === 'fiber-optic') {
    installationFactor = settings.installationFactors.underground;
  } else if (fromDevice.type.includes('outdoor') || toDevice.type.includes('outdoor')) {
    installationFactor = settings.installationFactors.outdoor;
  }
  
  const installationAdjustment = baseLength * (installationFactor - 1);
  const terminationAdjustment = settings.terminationAllowance;

  const adjustedLength = baseLength + slackAdjustment + installationAdjustment + bendAdjustment;
  const totalLength = adjustedLength + terminationAdjustment;

  return {
    baseLength,
    verticalLengths,
    adjustedLength,
    totalLength,
    adjustments: {
      slack: slackAdjustment,
      installation: installationAdjustment,
      bend: bendAdjustment,
      termination: terminationAdjustment
    },
    breakdown: {
      horizontalDistance,
      verticalDistance: verticalLengths.sourceDropLength + verticalLengths.destinationDropLength + verticalLengths.riserLength,
      customLengths
    }
  };
}

/**
 * สร้างจุด calibration จากอุปกรณ์ที่มีอยู่
 */
export function createCalibrationPointsFromDevices(
  devices: AnyDevice[],
  knownDistances: { [key: string]: number } = {}
): CalibrationPoint[] {
  const points: CalibrationPoint[] = [];
  
  devices.forEach((device, index) => {
    const point: CalibrationPoint = {
      id: `cal-${device.id}`,
      label: device.label || `Point ${index + 1}`,
      virtualCoords: { x: device.x, y: device.y },
      realWorldDistance: knownDistances[device.id],
      isReference: false
    };
    points.push(point);
  });

  return points;
}

/**
 * ตรวจสอบความแม่นยำของ calibration
 */
export function validateCalibration(
  calibrationData: CalibrationData,
  testConnections: Connection[],
  actualMeasurements: { [connectionId: string]: number }
): {
  accuracy: number;
  deviations: { connectionId: string; expected: number; actual: number; deviation: number }[];
  recommendation: string;
} {
  const deviations: { connectionId: string; expected: number; actual: number; deviation: number }[] = [];
  
  testConnections.forEach(conn => {
    const actualLength = actualMeasurements[conn.id];
    if (actualLength) {
      // คำนวณความยาวที่คาดหวังจาก calibration
      // (ต้องหา devices จริงในระบบ)
      const expectedLength = actualLength; // placeholder
      
      const deviation = Math.abs((expectedLength - actualLength) / actualLength) * 100;
      deviations.push({
        connectionId: conn.id,
        expected: expectedLength,
        actual: actualLength,
        deviation
      });
    }
  });

  const avgDeviation = deviations.reduce((sum, d) => sum + d.deviation, 0) / deviations.length;
  
  let recommendation = '';
  if (avgDeviation < 5) {
    recommendation = 'Calibration แม่นยำดีเยี่ยม (< 5% deviation)';
  } else if (avgDeviation < 10) {
    recommendation = 'Calibration แม่นยำยอมรับได้ (5-10% deviation)';
  } else if (avgDeviation < 15) {
    recommendation = 'ควร recalibrate ระบบ (10-15% deviation)';
  } else {
    recommendation = 'จำเป็นต้อง recalibrate ใหม่ทั้งหมด (> 15% deviation)';
  }

  return {
    accuracy: 100 - avgDeviation,
    deviations,
    recommendation
  };
}

/**
 * อัพเดท calibration จากการวัดจริง
 */
export function updateCalibrationFromMeasurements(
  calibrationData: CalibrationData,
  measurements: { virtualDistance: number; realDistance: number }[]
): CalibrationData {
  if (measurements.length === 0) return calibrationData;

  // คำนวณ scale factor ใหม่จากการวัด
  const scaleFactors = measurements.map(m => m.realDistance / m.virtualDistance);
  const avgScaleFactor = scaleFactors.reduce((sum, sf) => sum + sf, 0) / scaleFactors.length;
  
  // คำนวณความเบี่ยงเบน
  const deviations = scaleFactors.map(sf => Math.abs(sf - avgScaleFactor) / avgScaleFactor * 100);
  const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;

  // อัพเดท calibration data
  const updated: CalibrationData = {
    ...calibrationData,
    baseScale: avgScaleFactor,
    accuracy: {
      deviation: avgDeviation,
      confidence: avgDeviation < 5 ? 'high' : avgDeviation < 10 ? 'medium' : 'low',
      lastValidated: new Date()
    },
    updatedAt: new Date()
  };

  return updated;
}

/**
 * สร้าง calibration report
 */
export function generateCalibrationReport(
  calibrationData: CalibrationData,
  connections: Connection[]
): {
  summary: string;
  details: {
    totalCableLength: number;
    estimatedCost: number;
    accuracyMetrics: {
      confidence: string;
      deviation: number;
      lastValidated: string;
    };
  };
  recommendations: string[];
} {
  // คำนวณความยาวสายรวม (ต้องใช้กับ devices จริง)
  const totalCableLength = 0; // placeholder
  const estimatedCost = 0; // placeholder

  const recommendations = [
    'ตรวจสอบ calibration ทุก 3-6 เดือน',
    'วัดระยะจริงในงานติดตั้งเพื่อปรับปรุงความแม่นยำ',
    'ใช้ reference points มากกว่า 3 จุดเพื่อเพิ่มความแม่นยำ'
  ];

  if (calibrationData.accuracy.deviation > 10) {
    recommendations.push('ควร recalibrate ระบบเนื่องจากค่าเบี่ยงเบนสูง');
  }

  if (calibrationData.points.length < 3) {
    recommendations.push('เพิ่ม calibration points เพื่อปรับปรุงความแม่นยำ');
  }

  return {
    summary: `Calibration Report: ${calibrationData.accuracy.confidence} confidence with ${calibrationData.accuracy.deviation.toFixed(1)}% deviation`,
    details: {
      totalCableLength,
      estimatedCost,
      accuracyMetrics: {
        confidence: calibrationData.accuracy.confidence,
        deviation: calibrationData.accuracy.deviation,
        lastValidated: calibrationData.accuracy.lastValidated.toLocaleDateString('th-TH')
      }
    },
    recommendations
  };
}

/**
 * Export/Import calibration data
 */
export function exportCalibrationData(calibrationData: CalibrationData): string {
  return JSON.stringify(calibrationData, null, 2);
}

export function importCalibrationData(jsonData: string): CalibrationData {
  try {
    const data = JSON.parse(jsonData);
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      accuracy: {
        ...data.accuracy,
        lastValidated: new Date(data.accuracy.lastValidated)
      }
    };
  } catch (error) {
    throw new Error('Invalid calibration data format');
  }
}

/**
 * สร้าง cable routing details จาก connection และ devices
 */
export function createCableRoutingDetails(
  connection: Connection,
  fromDevice: AnyDevice,
  toDevice: AnyDevice,
  customSettings?: Partial<CableRoutingDetails>
): CableRoutingDetails {
  // กำหนดค่าเริ่มต้นตามประเภทอุปกรณ์
  const getDefaultDropLength = (device: AnyDevice): number => {
    if (device.type.includes('camera')) return 1.5; // กล้อง
    if (device.type.includes('switch')) return 0.3; // switch ในตู้
    if (device.type.includes('nvr')) return 0.3; // NVR ในตู้
    if (device.type.includes('monitor')) return 1.0; // monitor
    return 1.0; // default
  };

  const getDefaultMountingHeight = (device: AnyDevice): number => {
    if (device.type.includes('camera')) return 3.5; // กล้องติดเพดาน
    if (device.type.includes('switch') || device.type.includes('nvr')) return 1.5; // ในตู้
    if (device.type.includes('monitor')) return 1.8; // หน้าจอ
    return 2.0; // default
  };

  const getCableEntry = (device: AnyDevice): 'top' | 'bottom' | 'side' => {
    if (device.type.includes('camera')) return 'top'; // เข้าจากด้านบน
    if (device.type.includes('switch') || device.type.includes('nvr')) return 'top'; // เข้าตู้จากด้านบน
    return 'side'; // default
  };

  return {
    connectionId: connection.id,
    sourceInfo: {
      deviceId: fromDevice.id,
      dropLength: customSettings?.sourceInfo?.dropLength || getDefaultDropLength(fromDevice),
      mountingHeight: customSettings?.sourceInfo?.mountingHeight || getDefaultMountingHeight(fromDevice),
      cableEntry: customSettings?.sourceInfo?.cableEntry || getCableEntry(fromDevice)
    },
    destinationInfo: {
      deviceId: toDevice.id,
      dropLength: customSettings?.destinationInfo?.dropLength || getDefaultDropLength(toDevice),
      mountingHeight: customSettings?.destinationInfo?.mountingHeight || getDefaultMountingHeight(toDevice),
      cableEntry: customSettings?.destinationInfo?.cableEntry || getCableEntry(toDevice)
    },
    routingPath: {
      pathType: customSettings?.routingPath?.pathType || 'ceiling',
      intermediatePoints: customSettings?.routingPath?.intermediatePoints || []
    },
    customLengths: {
      horizontalLength: customSettings?.customLengths?.horizontalLength,
      verticalLength: customSettings?.customLengths?.verticalLength,
      totalCustomLength: customSettings?.customLengths?.totalCustomLength || 0
    }
  };
}

/**
 * คำนวณ bandwidth ของกล้องแต่ละตัว
 */
export function calculateCameraBandwidth(
  cameraSpecs: CameraSpec
): number {
  const { resolution, compression, fps, streams } = cameraSpecs;
  
  // คำนวณ base bitrate จากความละเอียด
  let baseBitrate = 0;
  
  switch (resolution) {
    case '720p':
      baseBitrate = 1.5; // Mbps
      break;
    case '1080p':
      baseBitrate = 3.0;
      break;
    case '4K':
      baseBitrate = 15.0;
      break;
    case '8K':
      baseBitrate = 50.0;
      break;
    default:
      baseBitrate = 3.0; // default 1080p
  }
  
  // ปรับตาม compression
  let compressionMultiplier = 1.0;
  switch (compression) {
    case 'H.264':
      compressionMultiplier = 1.0;
      break;
    case 'H.265':
      compressionMultiplier = 0.6; // ประหยัดกว่า 40%
      break;
    case 'MJPEG':
      compressionMultiplier = 3.0; // ใช้มากกว่า
      break;
  }
  
  // ปรับตาม FPS
  const fpsMultiplier = fps / 25; // base 25 fps
  
  // คำนวณสำหรับหลาย streams
  let totalBandwidth = baseBitrate * compressionMultiplier * fpsMultiplier;
  
  if (streams > 1) {
    // main stream + sub streams (โดยปกติ sub stream ใช้ 20-30% ของ main)
    const subStreamsBandwidth = totalBandwidth * 0.25 * (streams - 1);
    totalBandwidth += subStreamsBandwidth;
  }
  
  return Math.round(totalBandwidth * 100) / 100; // round to 2 decimal places
}

/**
 * คำนวณ bandwidth requirements รวมของระบบ
 */
export function calculateNetworkBandwidthRequirements(
  cameras: { id: string; specs: CameraSpec }[],
  additionalDevices: { id: string; bandwidth: number }[] = []
): NetworkBandwidthRequirement {
  // คำนวณ bandwidth ของกล้องทั้งหมด
  const cameraBandwidth = cameras.reduce((total, camera) => {
    return total + calculateCameraBandwidth(camera.specs);
  }, 0);
  
  // รวม bandwidth จากอุปกรณ์อื่น
  const additionalBandwidth = additionalDevices.reduce((total, device) => {
    return total + device.bandwidth;
  }, 0);
  
  const totalBandwidth = cameraBandwidth + additionalBandwidth;
  
  // เพิ่ม overhead และ safety margin
  const overhead = totalBandwidth * 0.1; // 10% overhead
  const safetyMargin = totalBandwidth * 0.2; // 20% safety margin
  
  const requiredBandwidth = totalBandwidth + overhead + safetyMargin;
  
  return {
    totalRequired: Math.round(requiredBandwidth * 100) / 100,
    cameraBandwidth: Math.round(cameraBandwidth * 100) / 100,
    additionalBandwidth: Math.round(additionalBandwidth * 100) / 100,
    overhead: Math.round(overhead * 100) / 100,
    safetyMargin: Math.round(safetyMargin * 100) / 100,
    recommendedUplink: Math.round((requiredBandwidth * 1.5) * 100) / 100 // 150% ของที่ต้องการ
  };
}

/**
 * แนะนำประเภทสายตาม bandwidth และระยะทาง
 */
export function recommendCableType(
  bandwidth: number, // Mbps
  distance: number, // meters
  environment: 'indoor' | 'outdoor' | 'industrial' = 'indoor'
): {
  recommendedCable: string;
  maxBandwidth: number;
  maxDistance: number;
  alternatives: Array<{
    cableType: string;
    bandwidth: number;
    distance: number;
    pros: string[];
    cons: string[];
  }>;
  reasoning: string;
} {
  const recommendations = [];
  
  // Cat5e UTP
  if (distance <= 90 && bandwidth <= 100) {
    recommendations.push({
      cableType: 'Cat5e UTP',
      bandwidth: 100,
      distance: 90,
      cost: 1.0, // relative cost
      pros: ['ราคาถูก', 'ติดตั้งง่าย', 'เหมาะสำหรับงานทั่วไป'],
      cons: ['จำกัด bandwidth', 'ไม่เหมาะสำหรับระยะไกล']
    });
  }
  
  // Cat6 UTP
  if (distance <= 100 && bandwidth <= 1000) {
    recommendations.push({
      cableType: 'Cat6 UTP',
      bandwidth: 1000,
      distance: 100,
      cost: 1.3,
      pros: ['รองรับ Gigabit', 'ราคายังยอมรับได้', 'มาตรฐานปัจจุบัน'],
      cons: ['แพงกว่า Cat5e', 'ไม่เหมาะสำหรับระยะไกล']
    });
  }
  
  // Cat6a UTP
  if (distance <= 100 && bandwidth <= 10000) {
    recommendations.push({
      cableType: 'Cat6a UTP',
      bandwidth: 10000,
      distance: 100,
      cost: 1.8,
      pros: ['รองรับ 10 Gigabit', 'Future-proof', 'ใช้ได้ 100 เมตร'],
      cons: ['ราคาสูง', 'ความหนามากกว่า']
    });
  }
  
  // Fiber Optic - Single Mode
  if (distance > 100 || bandwidth > 1000) {
    recommendations.push({
      cableType: 'Single Mode Fiber',
      bandwidth: 100000, // 100 Gbps+
      distance: 10000, // 10 km+
      cost: 3.0,
      pros: ['ระยะไกลมาก', 'bandwidth สูงมาก', 'ไม่รบกวนจาก EMI'],
      cons: ['ราคาแพง', 'ต้องใช้ converter', 'ติดตั้งยาก']
    });
  }
  
  // Fiber Optic - Multi Mode
  if (distance > 90 && distance <= 2000 && bandwidth > 100) {
    recommendations.push({
      cableType: 'Multi Mode Fiber',
      bandwidth: 10000,
      distance: 2000,
      cost: 2.5,
      pros: ['ระยะไกล', 'bandwidth สูง', 'ไม่รบกวนจาก EMI'],
      cons: ['ราคาแพง', 'ต้องใช้ converter', 'ติดตั้งยาก']
    });
  }
  
  // เลือกคำแนะนำหลัก
  const viableOptions = recommendations.filter(rec => 
    rec.bandwidth >= bandwidth && rec.distance >= distance
  );
  
  // เรียงตามราคาถ้ามีหลายตัวเลือก
  viableOptions.sort((a, b) => a.cost - b.cost);
  
  const recommended = viableOptions[0];
  
  if (!recommended) {
    return {
      recommendedCable: 'Custom Solution Required',
      maxBandwidth: 0,
      maxDistance: 0,
      alternatives: [],
      reasoning: 'ความต้องการเกินขีดจำกัดของสายมาตรฐาน ต้องใช้โซลูชันพิเศษ'
    };
  }
  
  let reasoning = `แนะนำ ${recommended.cableType} เพราะ `;
  if (recommended === viableOptions[0]) {
    reasoning += 'เป็นตัวเลือกที่ประหยัดที่สุดที่ตอบโจทย์';
  }
  
  if (environment === 'outdoor') {
    reasoning += ' (ควรใช้แบบ outdoor rated)';
  } else if (environment === 'industrial') {
    reasoning += ' (ควรใช้แบบ industrial grade)';
  }
  
  return {
    recommendedCable: recommended.cableType,
    maxBandwidth: recommended.bandwidth,
    maxDistance: recommended.distance,
    alternatives: viableOptions.slice(1),
    reasoning
  };
}

/**
 * คำนวณสถานะการใช้งาน network
 */
export function calculateNetworkUtilization(
  requiredBandwidth: number,
  availableBandwidth: number,
  connections: Array<{
    id: string;
    bandwidth: number;
    distance: number;
    cableType: string;
  }>
): {
  overall: {
    utilization: number;
    status: 'optimal' | 'warning' | 'critical';
    recommendations: string[];
  };
  connections: Array<{
    id: string;
    utilization: number;
    status: 'optimal' | 'warning' | 'critical';
    bottleneck?: string;
  }>;
} {
  const overallUtilization = (requiredBandwidth / availableBandwidth) * 100;
  
  let overallStatus: 'optimal' | 'warning' | 'critical';
  const recommendations: string[] = [];
  
  if (overallUtilization <= 70) {
    overallStatus = 'optimal';
    recommendations.push('ระบบทำงานในเกณฑ์ดี');
  } else if (overallUtilization <= 90) {
    overallStatus = 'warning';
    recommendations.push('ควรจัดเตรียมการอัพเกรด bandwidth');
    recommendations.push('ตรวจสอบการใช้งานในช่วงเวลาที่มีการใช้งานสูง');
  } else {
    overallStatus = 'critical';
    recommendations.push('จำเป็นต้องอัพเกรด bandwidth ทันที');
    recommendations.push('อาจเกิดปัญหาความล่าช้าและสูญหายของข้อมูล');
  }
  
  // วิเคราะห์แต่ละ connection
  const connectionAnalysis = connections.map(conn => {
    const cableSpec = CABLE_SPECIFICATIONS.find(spec => 
      spec.name.toLowerCase().includes(conn.cableType.toLowerCase())
    );
    
    if (!cableSpec) {
      return {
        id: conn.id,
        utilization: 0,
        status: 'optimal' as const,
        bottleneck: 'Unknown cable specification'
      };
    }
    
    let maxBandwidth = cableSpec.maxBandwidth;
    
    // ปรับ bandwidth ตามระยะทาง
    if (conn.distance > cableSpec.maxDistance * 0.8) {
      maxBandwidth *= 0.8; // ลดประสิทธิภาพเมื่อใกล้ระยะสูงสุด
    }
    
    const connUtilization = (conn.bandwidth / maxBandwidth) * 100;
    
    let connStatus: 'optimal' | 'warning' | 'critical';
    let bottleneck: string | undefined;
    
    if (connUtilization <= 70) {
      connStatus = 'optimal';
    } else if (connUtilization <= 90) {
      connStatus = 'warning';
      bottleneck = 'Approaching bandwidth limit';
    } else {
      connStatus = 'critical';
      bottleneck = 'Bandwidth exceeded';
    }
    
    if (conn.distance > cableSpec.maxDistance) {
      connStatus = 'critical';
      bottleneck = 'Distance exceeded cable specification';
    }
    
    return {
      id: conn.id,
      utilization: Math.round(connUtilization * 100) / 100,
      status: connStatus,
      bottleneck
    };
  });
  
  return {
    overall: {
      utilization: Math.round(overallUtilization * 100) / 100,
      status: overallStatus,
      recommendations
    },
    connections: connectionAnalysis
  };
}

/**
 * สร้างรายงาน bandwidth analysis
 */
export function generateBandwidthReport(
  cameras: { id: string; label: string; specs: CameraSpec }[],
  networkRequirements: NetworkBandwidthRequirement,
  utilizationAnalysis: ReturnType<typeof calculateNetworkUtilization>
): BandwidthCalculationResult {
  const cameraDetails = cameras.map(camera => ({
    id: camera.id,
    label: camera.label,
    bandwidth: calculateCameraBandwidth(camera.specs),
    specs: camera.specs
  }));
  
  const summary = {
    totalCameras: cameras.length,
    totalBandwidth: networkRequirements.totalRequired,
    peakUsage: Math.max(...cameraDetails.map(c => c.bandwidth)),
    averagePerCamera: networkRequirements.cameraBandwidth / cameras.length
  };
  
  const recommendations: string[] = [
    ...utilizationAnalysis.overall.recommendations
  ];
  
  // เพิ่มคำแนะนำเฉพาะ
  if (summary.totalCameras > 16) {
    recommendations.push('ควรแบ่งกล้องออกเป็นหลาย subnet เพื่อกระจายโหลด');
  }
  
  if (summary.peakUsage > 50) {
    recommendations.push('กล้องความละเอียดสูงควรใช้ H.265 compression');
  }
  
  const criticalConnections = utilizationAnalysis.connections.filter(
    conn => conn.status === 'critical'
  );
  
  if (criticalConnections.length > 0) {
    recommendations.push(`มี ${criticalConnections.length} เส้นทางที่มีปัญหา ต้องอัพเกรดทันที`);
  }
  
  return {
    cameras: cameraDetails,
    networkRequirements,
    utilizationAnalysis,
    summary,
    recommendations,
    generatedAt: new Date()
  };
}
