import { BaseService } from './base.service';
import { EventBus } from '../types/events';
import { ThermalCameraDevice, ThermalCalibrationData } from '../lib/types';
import { ServiceManager } from './service-manager';

interface CalibrationSettings {
  mode: 'auto' | 'manual' | 'scheduled';
  interval?: number; // ชั่วโมง
  referencePoints?: Array<{
    x: number;
    y: number;
    expectedTemp: number;
    description: string;
  }>;
}

export class ThermalCameraService extends BaseService {
  private static instance: ThermalCameraService;
  private calibrationData: Map<string, ThermalCalibrationData> = new Map();
  private calibrationSchedules: Map<string, NodeJS.Timeout> = new Map();

  private constructor(eventBus: EventBus) {
    super(eventBus);
  }

  public static getInstance(): ThermalCameraService {
    if (!ThermalCameraService.instance) {
      const eventBus = ServiceManager.getInstance().getEventBus();
      ThermalCameraService.instance = new ThermalCameraService(eventBus);
    }
    return ThermalCameraService.instance;
  }

  public async initialize(): Promise<void> {
    // โหลดข้อมูล calibration จาก storage
    return Promise.resolve();
  }

  public async destroy(): Promise<void> {
    // ยกเลิก scheduled calibrations ทั้งหมด
    for (const [deviceId, timer] of this.calibrationSchedules.entries()) {
      clearTimeout(timer);
    }
    this.calibrationSchedules.clear();
    return Promise.resolve();
  }

  public async setupCalibration(deviceId: string, settings: CalibrationSettings): Promise<void> {
    const device = await this.getDevice(deviceId) as ThermalCameraDevice;
    if (!device || device.type !== 'thermal-camera') {
      throw new Error('Invalid device type');
    }

    const now = new Date();
    const calibrationData: ThermalCalibrationData = {
      deviceId,
      referencePoints: [],
      calibrationHistory: [],
      status: {
        lastCalibration: now,
        nextScheduledCalibration: new Date(now.getTime() + (settings.interval || 24) * 3600000),
        calibrationMode: settings.mode,
        currentAccuracy: 100,
        requiresCalibration: false
      }
    };

    if (settings.referencePoints) {
      calibrationData.referencePoints = settings.referencePoints.map(point => ({
        ...point,
        actualTemp: point.expectedTemp // จะถูกอัปเดทระหว่าง calibration
      }));
    }

    this.calibrationData.set(deviceId, calibrationData);

    if (settings.mode === 'scheduled' && settings.interval) {
      this.scheduleCalibration(deviceId, settings.interval);
    }

    // แจ้งเตือนการตั้งค่า
    this.emit({
      type: 'device:calibration:setup',
      source: 'thermal-camera',
      timestamp: new Date(),
      data: {
        deviceId,
        settings
      }
    });
  }

  public async startCalibration(deviceId: string): Promise<void> {
    const calibrationData = this.calibrationData.get(deviceId);
    if (!calibrationData) {
      throw new Error('No calibration data found');
    }

    try {
      // จำลองการวัดอุณหภูมิจริง (ในระบบจริงจะรับค่าจากกล้อง)
      for (const point of calibrationData.referencePoints) {
        const simulatedTemp = point.expectedTemp + (Math.random() * 2 - 1); // สุ่มค่าคลาดเคลื่อน ±1°C
        point.actualTemp = simulatedTemp;
      }

      // คำนวณค่าเฉลี่ยความคลาดเคลื่อน
      const deviations = calibrationData.referencePoints.map(
        point => Math.abs(point.actualTemp - point.expectedTemp)
      );
      const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
      
      // อัปเดทประวัติ calibration
      calibrationData.calibrationHistory.push({
        timestamp: new Date(),
        temperatureOffset: avgDeviation,
        gainAdjustment: 1.0,
        ambientTemp: 25, // สมมติว่าอุณหภูมิห้อง 25°C
        success: avgDeviation < 1.0 // ถือว่าสำเร็จถ้าคลาดเคลื่อนน้อยกว่า 1°C
      });

      // อัปเดทสถานะ
      calibrationData.status = {
        ...calibrationData.status,
        lastCalibration: new Date(),
        currentAccuracy: 100 - (avgDeviation * 10), // แปลงเป็นเปอร์เซ็นต์
        requiresCalibration: avgDeviation > 1.0
      };

      this.calibrationData.set(deviceId, calibrationData);

      // แจ้งเตือนผลการ calibrate
      this.emit({
        type: 'device:calibration:complete',
        source: 'thermal-camera',
        timestamp: new Date(),
        data: {
          deviceId,
          success: avgDeviation < 1.0,
          accuracy: 100 - (avgDeviation * 10),
          details: calibrationData.calibrationHistory[calibrationData.calibrationHistory.length - 1]
        }
      });

    } catch (error) {
      // แจ้งเตือนกรณีเกิดข้อผิดพลาด
      this.emit({
        type: 'device:calibration:error',
        source: 'thermal-camera',
        timestamp: new Date(),
        data: {
          deviceId,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  public getCalibrationStatus(deviceId: string): ThermalCalibrationData | undefined {
    return this.calibrationData.get(deviceId);
  }

  private async getDevice(deviceId: string): Promise<ThermalCameraDevice | null> {
    // ในระบบจริงจะดึงข้อมูลจาก device service
    return null;
  }

  private scheduleCalibration(deviceId: string, intervalHours: number): void {
    // ยกเลิก schedule เดิม (ถ้ามี)
    if (this.calibrationSchedules.has(deviceId)) {
      clearTimeout(this.calibrationSchedules.get(deviceId));
    }

    // ตั้งเวลา calibrate ใหม่
    const timer = setTimeout(async () => {
      try {
        await this.startCalibration(deviceId);
        // ตั้งเวลาสำหรับครั้งถัดไป
        this.scheduleCalibration(deviceId, intervalHours);
      } catch (error) {
        console.error(`Scheduled calibration failed for device ${deviceId}:`, error);
      }
    }, intervalHours * 3600000);

    this.calibrationSchedules.set(deviceId, timer);
  }
}
