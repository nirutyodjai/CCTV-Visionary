'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { SimulationState } from '@/services/simulation.service';
import {
  CircleDot,
  PlayCircle,
  PauseCircle,
  StopCircle,
  FastForward,
  RotateCcw
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Eye, 
  Wifi, 
  Zap, 
  Thermometer,
  Cloud,
  Sun,
  Moon,
  CloudRain,
  Snowflake,
  Wind,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import type { Floor, AnyDevice, ProjectState } from '@/lib/types';

interface SimulationState {
  isRunning: boolean;
  currentTime: number;
  timeScale: number;
  scenario: SimulationScenario;
  environment: EnvironmentConditions;
  networkLoad: NetworkLoad;
  deviceStates: DeviceSimulationState[];
  alerts: SimulationAlert[];
  performance: PerformanceMetrics;
}

interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  duration: number; // in seconds
  events: SimulationEvent[];
}

interface SimulationEvent {
  id: string;
  time: number;
  type: 'motion_detection' | 'network_spike' | 'device_failure' | 'weather_change' | 'power_fluctuation';
  deviceId?: string;
  data: any;
}

interface EnvironmentConditions {
  timeOfDay: 'day' | 'night' | 'dawn' | 'dusk';
  weather: 'clear' | 'rain' | 'fog' | 'snow' | 'storm';
  temperature: number; // celsius
  humidity: number; // percentage
  lightLevel: number; // lux
  visibility: number; // meters
}

interface NetworkLoad {
  totalBandwidth: number; // Mbps
  usedBandwidth: number; // Mbps
  latency: number; // ms
  packetLoss: number; // percentage
  switchUtilization: { [switchId: string]: number };
}

interface DeviceSimulationState {
  deviceId: string;
  status: 'online' | 'offline' | 'error' | 'warning';
  temperature: number;
  powerConsumption: number; // watts
  networkUsage: number; // Mbps
  videoQuality: number; // 0-100
  motionDetected: boolean;
  nightVisionActive: boolean;
  irIlluminatorActive: boolean;
  alerts: string[];
}

interface SimulationAlert {
  id: string;
  time: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  deviceId?: string;
  resolved: boolean;
}

interface PerformanceMetrics {
  averageResponseTime: number;
  systemUptime: number;
  errorRate: number;
  bandwidthEfficiency: number;
  coverageEffectiveness: number;
}

interface SimulationEngineProps {
  isActive: boolean;
  state: SimulationState | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  simulationSpeed: number;
}

// Predefined simulation scenarios
const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'normal_day',
    name: 'วันปกติ (24 ชั่วโมง)',
    description: 'จำลองการทำงานในวันปกติ พร้อมกิจกรรมตามปกติ',
    duration: 86400, // 24 hours
    events: [
      { id: 'morning_activity', time: 28800, type: 'motion_detection', data: { intensity: 'high' } },
      { id: 'lunch_rush', time: 43200, type: 'motion_detection', data: { intensity: 'peak' } },
      { id: 'evening_activity', time: 64800, type: 'motion_detection', data: { intensity: 'high' } },
      { id: 'night_mode', time: 79200, type: 'weather_change', data: { timeOfDay: 'night' } }
    ]
  },
  {
    id: 'severe_weather',
    name: 'สภาพอากาศเลวร้าย',
    description: 'ทดสอบระบบในสภาพอากาศแปรปรวน ฝน พายุ',
    duration: 7200, // 2 hours
    events: [
      { id: 'rain_start', time: 900, type: 'weather_change', data: { weather: 'rain', visibility: 100 } },
      { id: 'storm_peak', time: 3600, type: 'weather_change', data: { weather: 'storm', visibility: 50 } },
      { id: 'power_fluctuation', time: 4200, type: 'power_fluctuation', data: { voltage: 200 } },
      { id: 'weather_clear', time: 6300, type: 'weather_change', data: { weather: 'clear', visibility: 1000 } }
    ]
  },
  {
    id: 'network_stress',
    name: 'ทดสอบความเครียดเครือข่าย',
    description: 'จำลองสถานการณ์เครือข่ายมีปัญหา แบนด์วิธเต็ม',
    duration: 3600, // 1 hour
    events: [
      { id: 'bandwidth_spike', time: 600, type: 'network_spike', data: { usage: 90 } },
      { id: 'switch_overload', time: 1800, type: 'network_spike', data: { usage: 95 } },
      { id: 'device_timeout', time: 2400, type: 'device_failure', data: { reason: 'network_timeout' } },
      { id: 'recovery', time: 3000, type: 'network_spike', data: { usage: 60 } }
    ]
  },
  {
    id: 'security_incident',
    name: 'เหตุการณ์ความปลอดภัย',
    description: 'จำลองสถานการณ์ฉุกเฉินและการตอบสนอง',
    duration: 1800, // 30 minutes
    events: [
      { id: 'motion_alert', time: 300, type: 'motion_detection', data: { intensity: 'critical', zone: 'restricted' } },
      { id: 'multiple_triggers', time: 600, type: 'motion_detection', data: { intensity: 'critical', zone: 'multiple' } },
      { id: 'system_alert', time: 900, type: 'device_failure', data: { reason: 'overload' } },
      { id: 'all_clear', time: 1500, type: 'motion_detection', data: { intensity: 'normal' } }
    ]
  }
];

export function SimulationEngine({
  isActive,
  state,
  onStart,
  onPause,
  onResume,
  onStop,
  onSpeedChange,
  simulationSpeed
}: SimulationEngineProps) {
  if (!isActive) return null;

  if (!state) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Card className="w-[600px]">
          <CardHeader>
            <CardTitle>ระบบจำลองสถานการณ์</CardTitle>
            <CardDescription>กดปุ่มเริ่มเพื่อเริ่มการจำลองสถานการณ์</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={onStart}>
              <PlayCircle className="w-4 h-4 mr-2" />
              เริ่มการจำลอง
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { systemStatus, isRunning, elapsedTime } = state;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">สถานะเครือข่าย</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CircleDot className={`w-4 h-4 ${
                systemStatus.networkStatus === 'normal' ? 'text-green-500' :
                systemStatus.networkStatus === 'degraded' ? 'text-yellow-500' :
                'text-red-500'
              }`} />
              <span className="capitalize">{systemStatus.networkStatus}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">สถานะกล้อง</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CircleDot className={`w-4 h-4 ${
                systemStatus.cameraStatus === 'normal' ? 'text-green-500' :
                systemStatus.cameraStatus === 'degraded' ? 'text-yellow-500' :
                'text-red-500'
              }`} />
              <span className="capitalize">{systemStatus.cameraStatus}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">สถานะพื้นที่จัดเก็บ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CircleDot className={`w-4 h-4 ${
                systemStatus.storageStatus === 'normal' ? 'text-green-500' :
                systemStatus.storageStatus === 'degraded' ? 'text-yellow-500' :
                'text-red-500'
              }`} />
              <span className="capitalize">{systemStatus.storageStatus}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">สถานะไฟฟ้า</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CircleDot className={`w-4 h-4 ${
                systemStatus.powerStatus === 'normal' ? 'text-green-500' :
                systemStatus.powerStatus === 'degraded' ? 'text-yellow-500' :
                'text-red-500'
              }`} />
              <span className="capitalize">{systemStatus.powerStatus}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>การควบคุมการจำลอง</CardTitle>
          <CardDescription>
            เวลาที่ผ่านไป: {Math.floor(elapsedTime / 3600)}:{String(Math.floor((elapsedTime % 3600) / 60)).padStart(2, '0')}:{String(Math.floor(elapsedTime % 60)).padStart(2, '0')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={(elapsedTime / 3600) * 100} />
            
            <div className="flex items-center space-x-2">
              {!isRunning ? (
                <Button onClick={onStart}>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  เริ่ม
                </Button>
              ) : (
                <Button onClick={onPause}>
                  <PauseCircle className="w-4 h-4 mr-2" />
                  พัก
                </Button>
              )}
              <Button onClick={onStop} variant="secondary">
                <StopCircle className="w-4 h-4 mr-2" />
                หยุด
              </Button>
              <Button
                onClick={() => onSpeedChange(simulationSpeed === 1 ? 2 : simulationSpeed === 2 ? 4 : 1)}
                variant="outline"
              >
                <FastForward className="w-4 h-4 mr-2" />
                {simulationSpeed}x
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
