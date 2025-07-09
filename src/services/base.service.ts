// Core Service Manager for CCTV Visionary System

import { EventBus } from '../types/events';
import { ApiResponse } from '../types/api';

export abstract class BaseService {
  protected eventBus: EventBus;
  protected initialized = false;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  abstract initialize(): Promise<void>;
  abstract destroy(): Promise<void>;

  protected emit(event: any): void {
    if (this.eventBus) {
      this.eventBus.emit(event);
    }
  }

  protected async handleApiCall<T>(
    apiCall: () => Promise<ApiResponse<T>>
  ): Promise<T> {
    try {
      const response = await apiCall();
      if (!response.success) {
        throw new Error(response.error?.message || 'API call failed');
      }
      return response.data!;
    } catch (error) {
      this.emit({
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'error',
        source: this.constructor.name.toLowerCase(),
        error: error as Error,
        context: {},
        severity: 'medium'
      });
      throw error;
    }
  }
}

export class ServiceManager {
  private services = new Map<string, BaseService>();
  private eventBus: EventBus;
  private initialized = false;

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
  }

  register<T extends BaseService>(name: string, service: T): void {
    if (this.services.has(name)) {
      throw new Error(`Service ${name} is already registered`);
    }
    this.services.set(name, service);
  }

  get<T extends BaseService>(name: string): T {
    const service = this.services.get(name) as T;
    if (!service) {
      throw new Error(`Service ${name} is not registered`);
    }
    return service;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const initPromises: Promise<void>[] = [];
    
    for (const [name, service] of this.services) {
      initPromises.push(
        service.initialize().catch(error => {
          console.error(`Failed to initialize service ${name}:`, error);
          throw error;
        })
      );
    }

    await Promise.all(initPromises);
    this.initialized = true;

    this.eventBus.emit({
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'system:services:initialized',
      source: 'service-manager'
    });
  }

  async destroy(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    const destroyPromises: Promise<void>[] = [];
    
    for (const [name, service] of this.services) {
      destroyPromises.push(
        service.destroy().catch(error => {
          console.error(`Failed to destroy service ${name}:`, error);
        })
      );
    }

    await Promise.all(destroyPromises);
    this.services.clear();
    this.initialized = false;

    this.eventBus.emit({
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'system:services:destroyed',
      source: 'service-manager'
    });
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  hasService(name: string): boolean {
    return this.services.has(name);
  }
}

// Service Factory
export class ServiceFactory {
  private static instance: ServiceFactory;
  private serviceManager: ServiceManager | null = null;

  private constructor() {}

  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  createServiceManager(eventBus: EventBus): ServiceManager {
    if (this.serviceManager) {
      throw new Error('ServiceManager already exists');
    }
    this.serviceManager = new ServiceManager(eventBus);
    return this.serviceManager;
  }

  getServiceManager(): ServiceManager {
    if (!this.serviceManager) {
      throw new Error('ServiceManager not created yet');
    }
    return this.serviceManager;
  }

  async destroyServiceManager(): Promise<void> {
    if (this.serviceManager) {
      await this.serviceManager.destroy();
      this.serviceManager = null;
    }
  }
}

// Service Registry for dependency injection
export class ServiceRegistry {
  private static registry = new Map<string, any>();

  static register<T>(token: string, implementation: T): void {
    ServiceRegistry.registry.set(token, implementation);
  }

  static get<T>(token: string): T {
    const implementation = ServiceRegistry.registry.get(token);
    if (!implementation) {
      throw new Error(`No implementation found for token: ${token}`);
    }
    return implementation;
  }

  static has(token: string): boolean {
    return ServiceRegistry.registry.has(token);
  }

  static clear(): void {
    ServiceRegistry.registry.clear();
  }
}

// Service Decorators
export function Injectable(token?: string) {
  return function <T extends new (...args: any[]) => {}>(constructor: T) {
    const serviceToken = token || constructor.name;
    ServiceRegistry.register(serviceToken, constructor);
    return constructor;
  };
}

export function Inject(token: string) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    // Store injection metadata for later use
    const existingTokens = (target as any).__injectTokens || [];
    existingTokens[parameterIndex] = token;
    (target as any).__injectTokens = existingTokens;
  };
}
