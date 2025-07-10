# CCTV Network Bandwidth Analysis System

## Overview
ระบบวิเคราะห์ bandwidth สำหรับโครงการ CCTV ที่ช่วยคำนวณความต้องการ bandwidth ของกล้องแต่ละตัว แนะนำประเภทสายที่เหมาะสม และแสดงสถานะการใช้งานเครือข่าย

## Features

### 1. Camera Bandwidth Calculation
- **Dynamic Calculation**: คำนวณ bandwidth ตามความละเอียด compression และ FPS
- **Multi-Stream Support**: รองรับกล้องที่มีหลาย stream (main + sub streams)
- **Real-time Updates**: อัพเดทการคำนวณทันทีเมื่อเปลี่ยนการตั้งค่า

#### Supported Specifications:
- **Resolution**: 720p, 1080p, 4K, 8K
- **Compression**: H.264, H.265 (HEVC), MJPEG
- **Frame Rate**: 1-60 FPS
- **Streams**: 1-4 streams per camera

#### Calculation Formula:
```typescript
bandwidth = baseBitrate × compressionMultiplier × fpsMultiplier × streamCount
```

### 2. Network Utilization Analysis
- **Overall System Analysis**: วิเคราะห์การใช้งาน bandwidth ทั้งระบบ
- **Connection-Level Analysis**: ตรวจสอบแต่ละเส้นทางการเชื่อมต่อ
- **Status Indicators**:
  - 🟢 **Optimal** (< 70% utilization)
  - 🟡 **Warning** (70-90% utilization)
  - 🔴 **Critical** (> 90% utilization)

### 3. Cable Type Recommendations
อัลกอริทึมแนะนำประเภทสายตาม bandwidth และระยะทาง:

#### Cable Types Supported:
- **Cat5e UTP**: Up to 100 Mbps, 100m
- **Cat6 UTP**: Up to 1 Gbps, 100m
- **Cat6a UTP**: Up to 10 Gbps, 100m
- **Single Mode Fiber**: Up to 100+ Gbps, 10km+
- **Multi Mode Fiber**: Up to 40 Gbps, 2km

#### Selection Criteria:
1. **Bandwidth Requirements**: เลือกสายที่รองรับ bandwidth ที่ต้องการ
2. **Distance Limitations**: พิจารณาระยะทางสูงสุดของสาย
3. **Cost Optimization**: แนะนำตัวเลือกที่ประหยัดที่สุดที่ตอบโจทย์
4. **Environment**: ปรับแต่งตามสภาพแวดล้อม (indoor/outdoor/industrial)

### 4. Smart Recommendations System
- **Compression Optimization**: แนะนำใช้ H.265 สำหรับกล้องความละเอียดสูง
- **Network Segmentation**: แนะนำแบ่ง subnet เมื่อมีกล้องจำนวนมาก
- **Upgrade Suggestions**: แนะนำการอัพเกรดเมื่อใกล้ขีดจำกัด
- **Bottleneck Detection**: ระบุจุดคอขวดในระบบ

## User Interface

### Tab 1: Camera Configuration
- กำหนดค่ากล้องแต่ละตัว (resolution, compression, fps, streams)
- ตั้งค่า available network bandwidth
- แสดง estimated bandwidth แต่ละกล้องแบบ real-time

### Tab 2: Bandwidth Analysis
- **Network Utilization Overview**
  - Progress bar แสดงการใช้งานรวม
  - สถานะ (Optimal/Warning/Critical)
  - สถิติรวม (total cameras, total bandwidth, peak usage)

- **Camera Details**
  - รายละเอียด bandwidth แต่ละกล้อง
  - แสดง specs ที่ตั้งค่าไว้

- **Connection Analysis**
  - สถานะแต่ละ connection
  - ตรวจจับ bottleneck

### Tab 3: Recommendations
- **System Recommendations**: แนะนำการปรับปรุงระบบ
- **Cable Type Recommendations**: แนะนำสายแต่ละเส้นทาง
- **Alternative Options**: ตัวเลือกอื่นที่ใช้ได้

## Integration with Calibration System

### Seamless Integration
- ใช้ข้อมูล calibration สำหรับคำนวณระยะทางจริง
- รวมกับ cable routing analysis
- แสดงผลใน calibration dialog

### Data Flow
1. **Calibration Data** → ระยะทางจริงระหว่างอุปกรณ์
2. **Camera Specs** → bandwidth requirements
3. **Connection Analysis** → cable type recommendations
4. **Network Analysis** → overall system status

## Technical Implementation

### Core Functions

#### `calculateCameraBandwidth(cameraSpecs: CameraSpec): number`
คำนวณ bandwidth ของกล้องตาม specs

#### `calculateNetworkBandwidthRequirements(cameras, additionalDevices): NetworkBandwidthRequirement`
คำนวณ bandwidth requirements รวมของระบบ

#### `recommendCableType(bandwidth, distance, environment): CableRecommendation`
แนะนำประเภทสายที่เหมาะสม

#### `calculateNetworkUtilization(required, available, connections): UtilizationAnalysis`
วิเคราะห์การใช้งาน network

#### `generateBandwidthReport(cameras, requirements, analysis): BandwidthCalculationResult`
สร้างรายงานครบถ้วน

### Data Structures

#### CameraSpec
```typescript
interface CameraSpec {
  resolution: '720p' | '1080p' | '4K' | '8K';
  fps: number;
  compression: 'H.264' | 'H.265' | 'MJPEG';
  streams: number;
  bitrate?: number; // optional manual override
}
```

#### NetworkBandwidthRequirement
```typescript
interface NetworkBandwidthRequirement {
  totalRequired: number;
  cameraBandwidth: number;
  additionalBandwidth: number;
  overhead: number;
  safetyMargin: number;
  recommendedUplink: number;
}
```

#### BandwidthCalculationResult
```typescript
interface BandwidthCalculationResult {
  cameras: CameraDetails[];
  networkRequirements: NetworkBandwidthRequirement;
  utilizationAnalysis: UtilizationAnalysis;
  summary: SystemSummary;
  recommendations: string[];
  generatedAt: Date;
}
```

## Usage Examples

### Basic Usage
```typescript
// คำนวณ bandwidth กล้องเดี่ยว
const cameraSpec: CameraSpec = {
  resolution: '4K',
  compression: 'H.265',
  fps: 25,
  streams: 2
};

const bandwidth = calculateCameraBandwidth(cameraSpec);
// Result: ~16 Mbps
```

### System Analysis
```typescript
// วิเคราะห์ระบบทั้งหมด
const cameras = [
  { id: 'cam1', specs: { resolution: '1080p', compression: 'H.265', fps: 25, streams: 2 }},
  { id: 'cam2', specs: { resolution: '4K', compression: 'H.265', fps: 30, streams: 1 }}
];

const requirements = calculateNetworkBandwidthRequirements(cameras);
const report = generateBandwidthReport(cameras, requirements, utilization);
```

### Cable Recommendation
```typescript
// แนะนำสายสำหรับกล้อง 4K ระยะ 80 เมตร
const recommendation = recommendCableType(15, 80, 'indoor');
// Result: Cat6a UTP recommended
```

## Benefits

### For System Designers
- **Accurate Planning**: คำนวณ bandwidth ที่แม่นยำ
- **Cost Optimization**: เลือกสายที่เหมาะสมและประหยัด
- **Future-Proofing**: วางแผนสำหรับการขยายระบบ

### For Installers
- **Clear Guidelines**: แนะนำสายแต่ละเส้นทางชัดเจน
- **Validation Tools**: ตรวจสอบความถูกต้องของการติดตั้ง
- **Troubleshooting**: ระบุปัญหาและแนะนำการแก้ไข

### For System Owners
- **Performance Assurance**: มั่นใจในประสิทธิภาพระบบ
- **Maintenance Planning**: วางแผนการบำรุงรักษา
- **Upgrade Roadmap**: แผนการอัพเกรดในอนาคต

## Best Practices

### Camera Configuration
1. **ใช้ H.265** สำหรับกล้องความละเอียดสูง (ประหยัด bandwidth 40%)
2. **ปรับ FPS** ตามความจำเป็น (security vs bandwidth)
3. **จำกัด Sub Streams** ใช้เฉพาะที่จำเป็น

### Network Design
1. **เผื่อ Safety Margin 20%** สำหรับ peak usage
2. **แบ่ง Subnet** เมื่อมีกล้องมากกว่า 16 ตัว
3. **ใช้ Managed Switch** สำหรับ QoS control

### Cable Selection
1. **Cat6a สำหรับ Future-Proofing** ถ้าระยะไม่เกิน 100m
2. **Fiber สำหรับระยะไกล** มากกว่า 100m
3. **พิจารณา Environment** (outdoor rated, industrial grade)

## Limitations

### Current Limitations
- รองรับเฉพาะ standard resolutions และ compression
- ไม่รวม advanced features เช่น analytics bandwidth
- ยังไม่รองรับ wireless connections

### Future Enhancements
- รองรับ custom resolution และ bitrate
- เพิ่ม AI analytics bandwidth calculation
- รองรับ mesh network topology
- เพิ่ม power consumption analysis

## Conclusion

ระบบ Bandwidth Analysis ช่วยให้การออกแบบและติดตั้งระบบ CCTV มีประสิทธิภาพและความแม่นยำมากขึ้น โดยผสานการคำนวณ bandwidth การแนะนำสาย และการวิเคราะห์เครือข่ายเข้าด้วยกันในเครื่องมือเดียว
