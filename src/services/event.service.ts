// Event Service for CCTV Visionary System

import { EventBus, EventHandler, EventListener, SystemEvent } from '../types/events';
import { BaseService } from './base.service';

export class EventService extends BaseService implements EventBus {
  private listeners = new Map<string, EventListener[]>();
  private eventHistory: SystemEvent[] = [];
  private maxHistorySize = 1000;

  constructor() {
    super(null as any); // EventService doesn't need eventBus injection
  }

  async initialize(): Promise<void> {
    this.initialized = true;
    console.log('EventService initialized');
  }

  async destroy(): Promise<void> {
    this.listeners.clear();
    this.eventHistory = [];
    this.initialized = false;
    console.log('EventService destroyed');
  }

  emit<T extends SystemEvent>(event: T): void {
    if (!this.initialized) {
      console.warn('EventService not initialized, event ignored:', event);
      return;
    }

    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Get listeners for this event type
    const eventListeners = this.listeners.get(event.type) || [];
    
    // Execute handlers
    for (const listener of eventListeners) {
      try {
        const result = listener.handler(event);
        if (result instanceof Promise) {
          result.catch(error => {
            console.error(`Error in event handler for ${event.type}:`, error);
          });
        }

        // Remove if it's a one-time listener
        if (listener.once) {
          this.removeListener(event.type, listener.id);
        }
      } catch (error) {
        console.error(`Error in event handler for ${event.type}:`, error);
      }
    }
  }

  on<T extends SystemEvent>(eventType: string, handler: EventHandler<T>): string {
    const listenerId = this.generateId();
    const listener: EventListener = {
      id: listenerId,
      eventType,
      handler: handler as EventHandler,
      once: false
    };

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(listener);
    return listenerId;
  }

  once<T extends SystemEvent>(eventType: string, handler: EventHandler<T>): string {
    const listenerId = this.generateId();
    const listener: EventListener = {
      id: listenerId,
      eventType,
      handler: handler as EventHandler,
      once: true
    };

    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    this.listeners.get(eventType)!.push(listener);
    return listenerId;
  }

  off(listenerId: string): void {
    for (const [eventType, listeners] of this.listeners) {
      this.removeListener(eventType, listenerId);
    }
  }

  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  getListeners(eventType: string): EventListener[] {
    return [...(this.listeners.get(eventType) || [])];
  }

  // Additional utility methods
  getEventHistory(): SystemEvent[] {
    return [...this.eventHistory];
  }

  getEventHistoryByType(eventType: string): SystemEvent[] {
    return this.eventHistory.filter(event => event.type === eventType);
  }

  getEventHistoryBySource(source: string): SystemEvent[] {
    return this.eventHistory.filter(event => event.source === source);
  }

  getEventHistoryByTimeRange(start: Date, end: Date): SystemEvent[] {
    return this.eventHistory.filter(event => 
      event.timestamp >= start && event.timestamp <= end
    );
  }

  clearEventHistory(): void {
    this.eventHistory = [];
  }

  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    while (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  getListenerCount(eventType?: string): number {
    if (eventType) {
      return (this.listeners.get(eventType) || []).length;
    }
    
    let total = 0;
    for (const listeners of this.listeners.values()) {
      total += listeners.length;
    }
    return total;
  }

  getAllEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }

  // Promise-based event waiting
  waitForEvent<T extends SystemEvent>(eventType: string, timeout?: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = timeout ? setTimeout(() => {
        this.off(listenerId);
        reject(new Error(`Timeout waiting for event: ${eventType}`));
      }, timeout) : null;

      const listenerId = this.once(eventType, (event: T) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        resolve(event);
      });
    });
  }

  // Event pattern matching
  onPattern(pattern: RegExp, handler: EventHandler): string {
    const listenerId = this.generateId();
    
    // Create a meta-listener that checks all events
    const metaListenerId = this.on('*' as any, (event: SystemEvent) => {
      if (pattern.test(event.type)) {
        handler(event);
      }
    });

    return listenerId;
  }

  // Event middleware
  private middlewares: Array<(event: SystemEvent) => SystemEvent | null> = [];

  addMiddleware(middleware: (event: SystemEvent) => SystemEvent | null): void {
    this.middlewares.push(middleware);
  }

  removeMiddleware(middleware: (event: SystemEvent) => SystemEvent | null): void {
    const index = this.middlewares.indexOf(middleware);
    if (index > -1) {
      this.middlewares.splice(index, 1);
    }
  }

  private processMiddleware(event: SystemEvent): SystemEvent | null {
    let processedEvent: SystemEvent | null = event;
    
    for (const middleware of this.middlewares) {
      if (processedEvent === null) {
        break;
      }
      processedEvent = middleware(processedEvent);
    }
    
    return processedEvent;
  }

  private removeListener(eventType: string, listenerId: string): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.findIndex(l => l.id === listenerId);
      if (index > -1) {
        listeners.splice(index, 1);
        if (listeners.length === 0) {
          this.listeners.delete(eventType);
        }
      }
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Event Service Singleton
export class EventServiceSingleton {
  private static instance: EventService;

  static getInstance(): EventService {
    if (!EventServiceSingleton.instance) {
      EventServiceSingleton.instance = new EventService();
    }
    return EventServiceSingleton.instance;
  }

  static async initialize(): Promise<EventService> {
    const instance = EventServiceSingleton.getInstance();
    await instance.initialize();
    return instance;
  }

  static async destroy(): Promise<void> {
    if (EventServiceSingleton.instance) {
      await EventServiceSingleton.instance.destroy();
      EventServiceSingleton.instance = null as any;
    }
  }
}

// Event Decorators
export function OnEvent(eventType: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const eventService = EventServiceSingleton.getInstance();
      eventService.on(eventType, originalMethod.bind(this));
      return originalMethod.apply(this, args);
    };
  };
}

export function OnceEvent(eventType: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const eventService = EventServiceSingleton.getInstance();
      eventService.once(eventType, originalMethod.bind(this));
      return originalMethod.apply(this, args);
    };
  };
}
