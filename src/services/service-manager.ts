import { EventBus, SystemEvent, BaseEvent } from '../types/events';
import { BaseService } from './base.service';
import { SimulationService } from './simulation.service';

type EventHandler<T extends BaseEvent> = (event: T) => void;

export class ServiceManager {
  private static instance: ServiceManager;
  private eventBus: EventBus;
  private services: Map<string, BaseService> = new Map();
  private eventHandlers: Map<string, Set<EventHandler<any>>> = new Map();
  
  private constructor() {
    // Initialize event bus
    this.eventBus = {
      emit: (event: SystemEvent) => {
        // Broadcast event to all subscribed handlers
        const handlers = this.eventHandlers.get(event.type);
        if (handlers) {
          handlers.forEach(handler => handler(event));
        }
      },
      on: <T extends SystemEvent>(eventType: string, handler: EventHandler<T>): string => {
        const handlers = this.eventHandlers.get(eventType) || new Set();
        handlers.add(handler);
        this.eventHandlers.set(eventType, handlers);
        return `${eventType}:${handlers.size}`;
      },
      off: (listenerId: string): void => {
        const [eventType, index] = listenerId.split(':');
        const handlers = this.eventHandlers.get(eventType);
        if (handlers) {
          const handlerArray = Array.from(handlers);
          handlers.delete(handlerArray[parseInt(index, 10) - 1]);
        }
      }
    };
  }

  public static getInstance(): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager();
    }
    return ServiceManager.instance;
  }

  public getEventBus(): EventBus {
    return this.eventBus;
  }

  public async initializeServices(): Promise<void> {
    const eventBus = this.getEventBus();
    
    // Initialize simulation service
    const simulationService = SimulationService.createInstance(eventBus);
    this.services.set('simulation', simulationService);
    await simulationService.initialize();

    // Initialize other services here...
  }

  public async destroyServices(): Promise<void> {
    for (const service of this.services.values()) {
      await service.destroy();
    }
    this.services.clear();
    this.eventHandlers.clear();
  }
}
