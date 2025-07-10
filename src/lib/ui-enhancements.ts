
import { toast } from '@/hooks/use-toast';

export const ErrorHandler = {
  handle: (error: Error, message: string) => {
    console.error(message, error);
    toast({ title: 'ข้อผิดพลาด', description: message, variant: 'destructive' });
  },
  handleAIError: (error: any, context: string) => {
    console.error(`AI Error in ${context}:`, error);
    toast({ title: 'ข้อผิดพลาดจาก AI', description: `เกิดข้อผิดพลาดระหว่าง ${context}`, variant: 'destructive' });
  },
  handleSuccess: (title: string, description: string) => {
    toast({ title, description });
  },
  handleWarning: (title: string, description: string) => {
    toast({ title, description, variant: 'destructive' });
  },
  handleInfo: (title: string, description: string) => {
    toast({ title, description });
  }
};

export const PerformanceMonitor = {
  startTiming: (name: string): () => void => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(`${name} took ${endTime - startTime}ms`);
    };
  },
};
