/**
 * Enhanced Loading States and User Feedback System
 */

import { toast } from '@/hooks/use-toast';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  error?: string;
}

export interface ProgressStep {
  id: string;
  label: string;
  completed: boolean;
  error?: string;
}

/**
 * Enhanced Error Handler with better UX
 */
export class ErrorHandler {
  static handleAIError(error: any, context: string) {
    console.error(`AI Error in ${context}:`, error);
    
    // Different handling based on error type
    if (error.name === 'AbortError') {
      toast({
        title: 'Request Cancelled',
        description: 'The AI request was cancelled.',
        variant: 'default',
      });
    } else if (error.status === 429) {
      toast({
        title: 'Rate Limited',
        description: 'AI service is busy. Please wait a moment and try again.',
        variant: 'destructive',
      });
    } else if (error.status === 503) {
      toast({
        title: 'Service Unavailable',
        description: 'AI service is temporarily unavailable. Please try again later.',
        variant: 'destructive',
      });
    } else if (error.message?.includes('network')) {
      toast({
        title: 'Network Error',
        description: 'Please check your internet connection and try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'AI Processing Error',
        description: `Failed to process ${context}. Please try again.`,
        variant: 'destructive',
      });
    }
  }

  static handleSuccess(message: string, description?: string) {
    toast({
      title: message,
      description,
      variant: 'default',
    });
  }

  static handleWarning(message: string, description?: string) {
    toast({
      title: message,
      description,
      variant: 'default',
    });
  }

  static handleInfo(message: string, description?: string) {
    toast({
      title: message,
      description,
      variant: 'default',
    });
  }
}

/**
 * Performance monitoring utility
 */
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  static startTiming(operation: string) {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const duration = end - start;
      
      // Log slow operations
      if (duration > 1000) { // > 1 second
        console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
      }
      
      // Store metrics
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, []);
      }
      
      const measurements = this.metrics.get(operation)!;
      measurements.push(duration);
      
      // Keep only last 50 measurements
      if (measurements.length > 50) {
        measurements.shift();
      }
      
      // You can send this to analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'timing_complete', {
          name: operation,
          value: Math.round(duration)
        });
      }
      
      return duration;
    };
  }

  static getMetrics(): Record<string, { avg: number; count: number }> {
    const result: Record<string, { avg: number; count: number }> = {};
    
    for (const [operation, measurements] of this.metrics) {
      const avg = measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
      result[operation] = {
        avg,
        count: measurements.length
      };
    }
    
    return result;
  }

  static clearMetrics(): void {
    this.metrics.clear();
  }
}

/**
 * Retry mechanism for failed operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      console.log(`Retry attempt ${attempt} failed, retrying in ${waitTime}ms...`);
    }
  }
  
  throw lastError!;
}

/**
 * Debounced function wrapper
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T {
  let timeout: ReturnType<typeof setTimeout>;
  
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

/**
 * Loading state utilities
 */
export const LoadingUtils = {
  createLoadingState: (message?: string, progress?: number): LoadingState => ({
    isLoading: true,
    message,
    progress
  }),
  
  createErrorState: (error: string): LoadingState => ({
    isLoading: false,
    error
  }),
  
  createSuccessState: (): LoadingState => ({
    isLoading: false
  })
};
