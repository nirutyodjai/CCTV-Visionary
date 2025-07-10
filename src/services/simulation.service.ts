import { BaseService } from './base.service';
import { DeviceType, NetworkDevice, SimulationScenario } from '@/lib/types';
import { EventBus, SimulationStartedEvent, SimulationUpdatedEvent, SimulationStoppedEvent } from '@/types/events';
import { ServiceManager } from './service-manager';

export interface SimulationEvent {
  id: string;
  type: 'alert' | 'notification' | 'system' | 'motion' | 'face' | 'license' | 'object';
  source: string;
  timestamp: Date;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  metadata?: Record<string, any>;
}

export interface SimulationState {
  isRunning: boolean;
  currentScenario?: SimulationScenario;
  startTime?: Date;
  elapsedTime: number;
  systemStatus: {
    networkStatus: 'normal' | 'degraded' | 'critical';
    cameraStatus: 'normal' | 'degraded' | 'critical';
    storageStatus: 'normal' | 'degraded' | 'critical';
    powerStatus: 'normal' | 'degraded' | 'critical';
  };
  eventQueue: SimulationEvent[];
}

export interface SimulationConfig {
  duration: number; // In seconds
  networkCondition: 'excellent' | 'good' | 'fair' | 'poor';
  environmentConditions: {
    light: 'day' | 'night' | 'twilight';
    weather: 'clear' | 'cloudy' | 'rainy' | 'foggy' | 'snowy';
    interference: number; // 0-100%
  };
  scenarios: SimulationScenario[];
  eventFrequency: number; // Events per minute
}

export class SimulationService extends BaseService {
  private simulationState: SimulationState = {
    isRunning: false,
    elapsedTime: 0,
    systemStatus: {
      networkStatus: 'normal',
      cameraStatus: 'normal',
      storageStatus: 'normal',
      powerStatus: 'normal'
    },
    eventQueue: []
  };

  private eventLoop: NodeJS.Timeout | null = null;
  private static instance: SimulationService;

  private constructor(eventBus: EventBus) {
    super(eventBus);
  }

  public static getInstance(): SimulationService {
    if (!SimulationService.instance) {
      SimulationService.instance = new SimulationService(ServiceManager.getInstance().getEventBus());
    }
    return SimulationService.instance;
  }

  public async initialize(): Promise<void> {
    // Initialize the service
    return Promise.resolve();
  }

  public async destroy(): Promise<void> {
    // Cleanup
    if (this.eventLoop) {
      clearInterval(this.eventLoop);
      this.eventLoop = null;
    }
    return Promise.resolve();
  }

  public getState(): SimulationState {
    return { ...this.simulationState };
  }

  public async startSimulation(config: SimulationConfig): Promise<void> {
    if (this.simulationState.isRunning) {
      throw new Error('Simulation is already running');
    }

    this.simulationState = {
      ...this.simulationState,
      isRunning: true,
      startTime: new Date(),
      currentScenario: config.scenarios[0],
      elapsedTime: 0,
      eventQueue: []
    };

    // Emit start event
    this.emit({
      id: crypto.randomUUID(),
      type: 'simulation:started',
      source: 'simulation',
      timestamp: new Date(),
      data: {
        scenario: config.scenarios[0]
      }
    } as SimulationStartedEvent);

    // Start event loop
    this.eventLoop = setInterval(() => {
      this.updateSimulation(config);
    }, 1000); // Update every second
  }

  public async stopSimulation(): Promise<void> {
    if (!this.simulationState.isRunning) {
      throw new Error('Simulation is not running');
    }

    if (this.eventLoop) {
      clearInterval(this.eventLoop);
      this.eventLoop = null;
    }

    const duration = this.simulationState.startTime ? 
      (new Date().getTime() - this.simulationState.startTime.getTime()) / 1000 : 0;

    this.emit({
      id: crypto.randomUUID(),
      type: 'simulation:stopped',
      source: 'simulation',
      timestamp: new Date(),
      data: {
        scenario: this.simulationState.currentScenario,
        duration,
        events: this.simulationState.eventQueue.length
      }
    } as SimulationStoppedEvent);

    this.simulationState = {
      ...this.simulationState,
      isRunning: false,
      currentScenario: undefined,
      startTime: undefined,
      elapsedTime: 0
    };
  }

  private updateSimulation(config: SimulationConfig): void {
    if (!this.simulationState.isRunning) return;

    // Update elapsed time
    this.simulationState.elapsedTime++;

    // Generate random events based on config.eventFrequency
    if (Math.random() < config.eventFrequency / 60) { // Convert per minute to per second
      const event: SimulationEvent = this.generateRandomEvent();
      this.simulationState.eventQueue.push(event);

      // Keep only last 100 events
      if (this.simulationState.eventQueue.length > 100) {
        this.simulationState.eventQueue.shift();
      }
    }

    // Update system status based on network condition
    this.updateSystemStatus(config.networkCondition);

    // Emit update event
    this.emit({
      id: crypto.randomUUID(),
      type: 'simulation:updated',
      source: 'simulation',
      timestamp: new Date(),
      data: this.simulationState
    } as SimulationUpdatedEvent);
  }

  private updateSystemStatus(networkCondition: string): void {
    const statusProbability = {
      excellent: { normal: 0.95, degraded: 0.04, critical: 0.01 },
      good: { normal: 0.8, degraded: 0.15, critical: 0.05 },
      fair: { normal: 0.6, degraded: 0.3, critical: 0.1 },
      poor: { normal: 0.3, degraded: 0.5, critical: 0.2 }
    };

    const prob = statusProbability[networkCondition as keyof typeof statusProbability] ||
                 statusProbability.good;

    // Update each status based on probability
    Object.keys(this.simulationState.systemStatus).forEach(key => {
      const rand = Math.random();
      let newStatus: 'normal' | 'degraded' | 'critical';
      
      if (rand < prob.normal) {
        newStatus = 'normal';
      } else if (rand < prob.normal + prob.degraded) {
        newStatus = 'degraded';
      } else {
        newStatus = 'critical';
      }

      this.simulationState.systemStatus[key as keyof typeof this.simulationState.systemStatus] = newStatus;
    });
  }

  private generateRandomEvent(): SimulationEvent {
    const eventTypes = ['alert', 'notification', 'system', 'motion', 'face', 'license', 'object'] as const;
    const severities = ['info', 'warning', 'critical'] as const;
    const messages = {
      motion: [
        'ตรวจพบการเคลื่อนไหวในพื้นที่ควบคุม',
        'ตรวจพบการเคลื่อนไหวนอกเวลาทำการ',
        'ตรวจพบการเคลื่อนไหวในพื้นที่หวงห้าม'
      ],
      face: [
        'ตรวจพบบุคคลที่ไม่ได้รับอนุญาต',
        'ตรวจพบใบหน้าที่ตรงกับฐานข้อมูล',
        'ระบบจดจำใบหน้าทำงานผิดปกติ'
      ],
      system: [
        'พื้นที่จัดเก็บข้อมูลเหลือน้อย',
        'การเชื่อมต่อเครือข่ายไม่เสถียร',
        'อุณหภูมิระบบสูงเกินกำหนด'
      ]
    };

    const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const messageList = messages[type as keyof typeof messages] || messages.system;
    const message = messageList[Math.floor(Math.random() * messageList.length)];

    return {
      id: crypto.randomUUID(),
      type,
      source: `camera-${Math.floor(Math.random() * 10 + 1)}`,
      timestamp: new Date(),
      message,
      severity,
      metadata: {
        location: `floor-${Math.floor(Math.random() * 3 + 1)}`,
        confidence: Math.random()
      }
    };
  }
}
