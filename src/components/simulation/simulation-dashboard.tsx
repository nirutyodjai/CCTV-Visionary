'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { SimulationService, SimulationState, SimulationEvent, SimulationConfig } from '@/services';
import { ServiceManager } from '@/services/service-manager';
import {
  PlayCircle,
  StopCircle,
} from 'lucide-react';
import type { ProjectState, Floor } from '@/lib/types';

const statusTranslations: Record<string, string> = {
  normal: 'ปกติ',
  degraded: 'ลดประสิทธิภาพ',
  critical: 'วิกฤต'
};

const systemMetrics: Record<string, string> = {
  networkLatency: 'ความล่าช้าของเครือข่าย',
  bandwidth: 'แบนด์วิดท์',
  storageUsage: 'พื้นที่เก็บข้อมูล',
  cpuUsage: 'การใช้งาน CPU',
  memoryUsage: 'การใช้งานหน่วยความจำ'
};

interface SystemMetricData {
  networkLatency: number;
  bandwidth: number;
  storageUsage: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface SimulationDashboardProps {
  projectState: ProjectState;
  activeFloor: Floor;
}

const defaultConfig: SimulationConfig = {
  duration: 3600, // 1 hour
  networkCondition: 'good',
  environmentConditions: {
    light: 'day',
    weather: 'clear',
    interference: 0
  },
  scenarios: [
    {
      id: 'default',
      name: 'ทดสอบสถานการณ์ปกติ',
      description: 'จำลองการทำงานของระบบในสภาวะปกติ เพื่อตรวจสอบประสิทธิภาพทั่วไป',
      triggers: []
    }
  ],
  eventFrequency: 10 // 10 events per minute
};

export function SimulationDashboard({ projectState, activeFloor }: SimulationDashboardProps) {
  const [simulationState, setSimulationState] = useState<SimulationState | null>(null);
  const [metrics, setMetrics] = useState<SystemMetricData>({
    networkLatency: 0,
    bandwidth: 0,
    storageUsage: 0,
    cpuUsage: 0,
    memoryUsage: 0
  });
  const { toast } = useToast();
  const simulationService = SimulationService.getInstance();

  useEffect(() => {
    const eventBus = ServiceManager.getInstance().getEventBus();

    const updateSubscription = eventBus.on('simulation:updated', (event: any) => {
      const state = event.data as SimulationState;
      setSimulationState(state);
      // Update metrics based on simulation state
      setMetrics({
        networkLatency: Math.random() * 100,
        bandwidth: Math.random() * 100,
        storageUsage: Math.random() * 100,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100
      });
    });

    const stopSubscription = eventBus.on('simulation:stopped', () => {
      setSimulationState(null);
      setMetrics({
        networkLatency: 0,
        bandwidth: 0,
        storageUsage: 0,
        cpuUsage: 0,
        memoryUsage: 0
      });
    });

    return () => {
      eventBus.off(updateSubscription);
      eventBus.off(stopSubscription);
    };
  }, []);

  const handleStartSimulation = async () => {
    try {
      await simulationService.startSimulation(defaultConfig);
      toast({
        title: 'เริ่มการจำลอง',
        description: 'ระบบจำลองกำลังทำงาน...',
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเริ่มการจำลองได้',
        variant: 'destructive'
      });
    }
  };

  const handleStopSimulation = async () => {
    try {
      await simulationService.stopSimulation();
      toast({
        title: 'หยุดการจำลอง',
        description: 'ระบบจำลองถูกหยุดการทำงาน',
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถหยุดการจำลองได้',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">แดชบอร์ดจำลองสถานการณ์</h2>
        <div className="flex gap-2">
          {!simulationState?.isRunning ? (
            <Button onClick={handleStartSimulation}>
              <PlayCircle className="w-4 h-4 mr-2" />
              เริ่มการจำลอง
            </Button>
          ) : (
            <Button onClick={handleStopSimulation} variant="destructive">
              <StopCircle className="w-4 h-4 mr-2" />
              หยุดการจำลอง
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {simulationState?.systemStatus && Object.entries(simulationState.systemStatus).map(([key, status]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {key === 'networkStatus' && 'สถานะเครือข่าย'}
                {key === 'cameraStatus' && 'สถานะกล้อง'}
                {key === 'storageStatus' && 'สถานะการจัดเก็บ'}
                {key === 'powerStatus' && 'สถานะไฟฟ้า'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={status === 'normal' ? 'default' : status === 'degraded' ? 'secondary' : 'destructive'}
              >
                {statusTranslations[status]}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {systemMetrics[key]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={value} />
                <p className="text-sm text-muted-foreground">
                  {Math.round(value)}%
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>เหตุการณ์ล่าสุด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {simulationState?.eventQueue.slice(-5).map((event) => (
              <div key={event.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                <Badge variant={
                  event.severity === 'critical' ? 'destructive' :
                  event.severity === 'warning' ? 'secondary' : 'default'
                }>
                  {event.severity === 'critical' ? 'วิกฤต' :
                   event.severity === 'warning' ? 'เตือน' : 'ข้อมูล'}
                </Badge>
                <span>{event.message}</span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {new Date(event.timestamp).toLocaleTimeString('th-TH')}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
