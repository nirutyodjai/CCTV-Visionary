'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Wifi, 
  Network, 
  Activity,
  BarChart2,
  Zap,
  LineChart,
  ArrowDownToLine,
  ArrowUpToLine,
  Cable,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ProjectState, Floor, AnyDevice } from '@/lib/types';
import dynamic from 'next/dynamic';

// Dynamically import ReactFlow to avoid SSR issues
const ReactFlow = dynamic(() => import('reactflow').then(mod => mod.ReactFlow), { ssr: false });
const { Background, Controls } = dynamic(() => import('reactflow'), { ssr: false });

interface NetworkSimulatorProps {
  projectState: ProjectState;
  activeFloor: Floor;
}

interface NetworkDevice {
  id: string;
  type: string;
  label: string;
  data: {
    throughput: number;
    maxBandwidth: number;
    usage: number;
    status: 'online' | 'warning' | 'error';
    addresses: string[];
  };
}

interface Connection {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  style: {
    stroke: string;
    strokeWidth: number;
  };
}

export function NetworkSimulator({ projectState, activeFloor }: NetworkSimulatorProps) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [simulationTime, setSimulationTime] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState('normal');
  const [networkDevices, setNetworkDevices] = useState<NetworkDevice[]>([]);
  const [networkConnections, setNetworkConnections] = useState<Connection[]>([]);
  const [totalBandwidth, setTotalBandwidth] = useState(0);
  const [usedBandwidth, setUsedBandwidth] = useState(0);
  const [trafficSpikes, setTrafficSpikes] = useState<{time: number, value: number}[]>([]);
  
  const simulationRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Initialize network topology
  useEffect(() => {
    const devices: NetworkDevice[] = [];
    const connections: Connection[] = [];
    
    let totalMaxBandwidth = 0;

    // Map devices to network nodes
    activeFloor.devices.forEach((device, index) => {
      if (device.type.includes('switch') || 
          device.type.includes('nvr') || 
          device.type.includes('server') ||
          device.type.includes('cctv')) {
        
        const maxBandwidth = getDeviceMaxBandwidth(device.type);
        totalMaxBandwidth += maxBandwidth;
        
        devices.push({
          id: device.id,
          type: device.type,
          label: device.label || `${device.type}-${index + 1}`,
          data: {
            throughput: 0,
            maxBandwidth: maxBandwidth,
            usage: 0,
            status: 'online',
            addresses: generateMockIPs(device.type, index)
          }
        });
      }
    });
    
    // Map connections
    activeFloor.connections.forEach((connection, index) => {
      connections.push({
        id: `edge-${index}`,
        source: connection.fromDeviceId,
        target: connection.toDeviceId,
        type: 'straight',
        animated: false,
        style: {
          stroke: '#666',
          strokeWidth: 2
        }
      });
    });
    
    setNetworkDevices(devices);
    setNetworkConnections(connections);
    setTotalBandwidth(totalMaxBandwidth);
  }, [activeFloor]);

  const getDeviceMaxBandwidth = (deviceType: string): number => {
    switch (deviceType) {
      case 'cctv-dome':
      case 'cctv-bullet':
        return 8; // 8 Mbps
      case 'cctv-ptz':
        return 15; // 15 Mbps for HD PTZ
      case 'switch-poe':
      case 'switch-gigabit':
        return 1000; // 1Gbps
      case 'nvr':
        return 500; // 500 Mbps recording
      case 'server':
        return 1000; // 1Gbps server
      default:
        return 5;
    }
  };

  const generateMockIPs = (deviceType: string, index: number): string[] => {
    const addresses = [];
    
    // IP address
    addresses.push(`192.168.1.${100 + index}`);
    
    // MAC address for some devices
    if (deviceType.includes('switch') || deviceType.includes('server')) {
      addresses.push(`00:1B:44:11:3A:${index < 16 ? '0' : ''}${index.toString(16).toUpperCase()}`);
    }
    
    return addresses;
  };

  const startSimulation = () => {
    setIsSimulating(true);
    setSimulationTime(0);
    setTrafficSpikes([]);
    
    let totalUsed = 0;
    
    // Reset device states
    const updatedDevices = networkDevices.map(device => {
      const throughput = calculateDeviceThroughput(device.type, selectedScenario);
      totalUsed += throughput;
      
      return {
        ...device,
        data: {
          ...device.data,
          throughput: throughput,
          usage: (throughput / device.data.maxBandwidth) * 100,
          status: 'online'
        }
      };
    });
    
    setNetworkDevices(updatedDevices);
    setUsedBandwidth(totalUsed);
    
    // Update connections
    const updatedConnections = networkConnections.map(connection => ({
      ...connection,
      animated: true,
      style: {
        ...connection.style,
        strokeWidth: 2
      }
    }));
    
    setNetworkConnections(updatedConnections);
    
    // Create traffic pattern
    generateTrafficPattern(selectedScenario);
    
    toast({
      title: 'การจำลองเครือข่ายเริ่มต้นแล้ว',
      description: 'กำลังวิเคราะห์ประสิทธิภาพและภาระของเครือข่าย'
    });
    
    simulationRef.current = setInterval(() => {
      setSimulationTime(prev => {
        const newTime = prev + simulationSpeed;
        if (newTime >= 3600) {
          stopSimulation();
          return 3600;
        }
        return newTime;
      });
      
      updateNetworkState();
    }, 100);
  };
  
  const stopSimulation = () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
    }
    setIsSimulating(false);
    
    // Reset animation on connections
    const updatedConnections = networkConnections.map(connection => ({
      ...connection,
      animated: false
    }));
    
    setNetworkConnections(updatedConnections);
    
    if (simulationTime >= 3599) {
      toast({
        title: 'การจำลองเครือข่ายเสร็จสมบูรณ์',
        description: 'รายงานประสิทธิภาพเครือข่ายพร้อมแล้ว'
      });
    } else {
      toast({
        title: 'หยุดการจำลองเครือข่าย',
        description: 'คุณสามารถรีสตาร์ทเพื่อดำเนินการต่อได้'
      });
    }
  };
  
  const calculateDeviceThroughput = (deviceType: string, scenario: string): number => {
    const baseThroughput = getDeviceMaxBandwidth(deviceType) * 0.2; // 20% baseline usage
    
    // Adjust based on scenario
    let multiplier = 1;
    switch (scenario) {
      case 'normal':
        multiplier = Math.random() * 0.3 + 0.2; // 20-50%
        break;
      case 'high_load':
        multiplier = Math.random() * 0.3 + 0.6; // 60-90%
        break;
      case 'peak':
        multiplier = Math.random() * 0.15 + 0.85; // 85-100%
        break;
      case 'failure':
        multiplier = deviceType.includes('switch') ? 
          (Math.random() > 0.3 ? 0 : 1) : // Some switches down
          Math.random() * 0.5 + 0.5; // Others at 50-100%
        break;
    }
    
    return deviceType.includes('switch') || deviceType.includes('server') || deviceType.includes('nvr') ?
      baseThroughput * 2 * multiplier : // Switches and servers handle more traffic
      baseThroughput * multiplier;
  };
  
  const generateTrafficPattern = (scenario: string) => {
    const spikes: {time: number, value: number}[] = [];
    
    switch (scenario) {
      case 'normal':
        // Few moderate spikes
        for (let i = 0; i < 5; i++) {
          spikes.push({
            time: Math.floor(Math.random() * 3600),
            value: Math.random() * 20 + 10 // 10-30% increase
          });
        }
        break;
        
      case 'high_load':
        // Regular high spikes
        for (let i = 0; i < 12; i++) {
          spikes.push({
            time: i * 300 + Math.floor(Math.random() * 200),
            value: Math.random() * 40 + 30 // 30-70% increase
          });
        }
        break;
        
      case 'peak':
        // Continuous peaks
        for (let i = 0; i < 20; i++) {
          spikes.push({
            time: i * 180 + Math.floor(Math.random() * 100),
            value: Math.random() * 50 + 50 // 50-100% increase
          });
        }
        break;
        
      case 'failure':
        // Critical spikes followed by drops
        for (let i = 0; i < 8; i++) {
          spikes.push({
            time: i * 400 + Math.floor(Math.random() * 150),
            value: i % 2 === 0 ? 100 : -50 // Alternate between spikes and drops
          });
        }
        break;
    }
    
    setTrafficSpikes(spikes);
  };
  
  const updateNetworkState = () => {
    // Find applicable traffic spikes
    const currentSpikes = trafficSpikes.filter(spike => 
      Math.abs(spike.time - simulationTime) < 100
    );
    
    let spikeEffect = 0;
    if (currentSpikes.length > 0) {
      spikeEffect = currentSpikes.reduce((acc, spike) => acc + spike.value, 0) / currentSpikes.length;
    }
    
    // Update each device's throughput
    const updatedDevices = networkDevices.map(device => {
      // Base fluctuation ±10%
      let fluctuation = (Math.random() * 20 - 10) / 100;
      
      // Add spike effect
      fluctuation += spikeEffect / 100;
      
      const newThroughput = Math.max(
        0, 
        Math.min(
          device.data.maxBandwidth,
          device.data.throughput * (1 + fluctuation)
        )
      );
      
      const newUsage = (newThroughput / device.data.maxBandwidth) * 100;
      
      // Determine status based on usage
      let status: 'online' | 'warning' | 'error' = 'online';
      if (newUsage > 90) status = 'error';
      else if (newUsage > 70) status = 'warning';
      
      return {
        ...device,
        data: {
          ...device.data,
          throughput: newThroughput,
          usage: newUsage,
          status: status
        }
      };
    });
    
    setNetworkDevices(updatedDevices);
    
    // Calculate total bandwidth usage
    const newTotalUsed = updatedDevices.reduce(
      (sum, device) => sum + device.data.throughput, 
      0
    );
    setUsedBandwidth(newTotalUsed);
    
    // Update connection thickness based on traffic
    updateConnectionTraffic(updatedDevices);
    
    // Detect and handle network issues
    detectNetworkIssues(updatedDevices);
  };
  
  const updateConnectionTraffic = (devices: NetworkDevice[]) => {
    const updatedConnections = networkConnections.map(connection => {
      const sourceDevice = devices.find(d => d.id === connection.source);
      const targetDevice = devices.find(d => d.id === connection.target);
      
      if (!sourceDevice || !targetDevice) return connection;
      
      // Calculate connection load based on source and target devices
      const trafficLevel = Math.max(
        sourceDevice.data.usage,
        targetDevice.data.usage
      );
      
      // Determine color and thickness based on traffic level
      let stroke = '#666';
      let strokeWidth = 2;
      
      if (trafficLevel > 90) {
        stroke = '#ef4444'; // Red for heavy traffic
        strokeWidth = 6;
      } else if (trafficLevel > 70) {
        stroke = '#f97316'; // Orange for medium-high traffic
        strokeWidth = 5;
      } else if (trafficLevel > 50) {
        stroke = '#3b82f6'; // Blue for medium traffic
        strokeWidth = 4;
      } else if (trafficLevel > 30) {
        stroke = '#22c55e'; // Green for light-medium traffic
        strokeWidth = 3;
      }
      
      return {
        ...connection,
        style: {
          stroke,
          strokeWidth
        }
      };
    });
    
    setNetworkConnections(updatedConnections);
  };
  
  const detectNetworkIssues = (devices: NetworkDevice[]) => {
    // Look for devices with critical usage
    const criticalDevices = devices.filter(d => d.data.usage > 90);
    
    if (criticalDevices.length > 0 && Math.random() > 0.85) {
      const device = criticalDevices[Math.floor(Math.random() * criticalDevices.length)];
      
      toast({
        title: 'แจ้งเตือนเครือข่าย',
        description: `${device.label} มีการใช้แบนด์วิธสูง (${device.data.usage.toFixed(1)}%)`,
        variant: 'destructive'
      });
    }
    
    // Look for potential bottlenecks
    if (usedBandwidth / totalBandwidth > 0.8 && Math.random() > 0.9) {
      toast({
        title: 'คำเตือน: คอขวดเครือข่าย',
        description: 'เครือข่ายกำลังเข้าใกล้ขีดจำกัดความจุแล้ว พิจารณาอัพเกรดอุปกรณ์',
        variant: 'destructive'
      });
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-500" />
            จำลองประสิทธิภาพเครือข่าย
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>รูปแบบการทดสอบ</Label>
              <Select 
                value={selectedScenario} 
                onValueChange={setSelectedScenario}
                disabled={isSimulating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">การใช้งานปกติ</SelectItem>
                  <SelectItem value="high_load">ภาระงานสูง</SelectItem>
                  <SelectItem value="peak">ชั่วโมงเร่งด่วน</SelectItem>
                  <SelectItem value="failure">สถานการณ์ล้มเหลว</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>ความเร็วจำลอง (x{simulationSpeed})</Label>
              <Slider
                disabled={isSimulating}
                value={[simulationSpeed]}
                onValueChange={(values) => setSimulationSpeed(values[0])}
                min={1}
                max={10}
                step={1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>เวลาจำลอง: {formatTime(simulationTime)}</Label>
              <Progress 
                value={(simulationTime / 3600) * 100}
                className="mt-2"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button
              disabled={isSimulating}
              onClick={startSimulation}
              className="flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              เริ่มการจำลอง
            </Button>
            
            <Button
              disabled={!isSimulating}
              onClick={stopSimulation}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Wifi className="w-4 h-4" />
              หยุดจำลอง
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 h-[500px]">
          <CardHeader>
            <CardTitle>Network Topology</CardTitle>
          </CardHeader>
          <CardContent className="h-[420px]">
            {networkDevices.length > 0 && (
              <div className="h-full w-full bg-slate-50 dark:bg-slate-900 rounded-md border">
                <div className="h-full">
                  {typeof window !== 'undefined' && (
                    <ReactFlow
                      nodes={networkDevices.map(device => ({
                        id: device.id,
                        position: { x: Math.random() * 400, y: Math.random() * 400 },
                        data: { 
                          label: (
                            <div className="text-center p-1">
                              <div className="font-semibold">{device.label}</div>
                              <div className="text-xs text-muted-foreground">{device.type}</div>
                              <Badge 
                                variant={
                                  device.data.status === 'online' ? 'default' :
                                  device.data.status === 'warning' ? 'secondary' : 'destructive'
                                }
                                className="mt-1"
                              >
                                {device.data.usage.toFixed(0)}% used
                              </Badge>
                            </div>
                          ) 
                        },
                        style: {
                          background: device.data.status === 'online' ? '#fff' : 
                                      device.data.status === 'warning' ? '#fef3c7' : '#fee2e2',
                          border: `2px solid ${
                            device.data.status === 'online' ? '#94a3b8' : 
                            device.data.status === 'warning' ? '#f97316' : '#ef4444'
                          }`,
                          borderRadius: '8px',
                          padding: '10px',
                          width: 'auto',
                        }
                      }))}
                      edges={networkConnections}
                      fitView
                    >
                      <Background />
                      <Controls />
                    </ReactFlow>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5" />
                สรุปเครือข่าย
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>แบนด์วิธรวมที่ใช้</Label>
                <div className="text-2xl font-semibold">
                  {usedBandwidth.toFixed(1)} / {totalBandwidth.toFixed(1)} Mbps
                </div>
                <Progress 
                  value={(usedBandwidth / totalBandwidth) * 100}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label>สถานะอุปกรณ์</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Badge variant="outline" className="flex justify-center py-1">
                    {networkDevices.filter(d => d.data.status === 'online').length} Online
                  </Badge>
                  <Badge variant="secondary" className="flex justify-center py-1">
                    {networkDevices.filter(d => d.data.status === 'warning').length} Warning
                  </Badge>
                  <Badge variant="destructive" className="flex justify-center py-1">
                    {networkDevices.filter(d => d.data.status === 'error').length} Error
                  </Badge>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="font-semibold mb-2">Top Bandwidth Users</div>
                <div className="space-y-2">
                  {networkDevices
                    .sort((a, b) => b.data.throughput - a.data.throughput)
                    .slice(0, 3)
                    .map(device => (
                      <div key={device.id} className="flex justify-between items-center">
                        <div className="text-sm">{device.label}</div>
                        <div className="text-sm font-semibold">{device.data.throughput.toFixed(1)} Mbps</div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cable className="w-5 h-5" />
                สถานะการเชื่อมต่อ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>คอขวดที่ตรวจพบ</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <AlertTriangle className={`w-5 h-5 ${usedBandwidth / totalBandwidth > 0.7 ? 'text-red-500' : 'text-green-500'}`} />
                    <span>
                      {usedBandwidth / totalBandwidth > 0.9 ? 'คอขวดรุนแรง' :
                       usedBandwidth / totalBandwidth > 0.7 ? 'คอขวดปานกลาง' : 'ไม่พบคอขวด'}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Latency</Label>
                    <div className="text-lg font-semibold mt-1">
                      {(usedBandwidth / totalBandwidth * 30).toFixed(1)} ms
                    </div>
                  </div>
                  
                  <div>
                    <Label>Packet Loss</Label>
                    <div className="text-lg font-semibold mt-1">
                      {usedBandwidth / totalBandwidth > 0.9 ? '2.1' : 
                       usedBandwidth / totalBandwidth > 0.8 ? '0.5' : '0.0'}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
