'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Camera, 
  Play,
  Pause,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Thermometer,
  Eye,
  BarChart,
  SquareUser,
  PanelTopOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ProjectState, Floor, AnyDevice } from '@/lib/types';

interface CameraViewSimulatorProps {
  projectState: ProjectState;
  activeFloor: Floor;
}

interface CameraState {
  id: string;
  label: string;
  type: string;
  image: string;
  fov: number; // Field of view in degrees
  quality: number; // 0-100%
  active: boolean;
  nightMode: boolean;
}

interface SimulationState {
  timeOfDay: 'day' | 'night' | 'dawn' | 'dusk';
  weather: 'clear' | 'rain' | 'fog' | 'snow';
  movement: 'none' | 'low' | 'medium' | 'high';
  temperature: number;
  visibility: number; // 0-100%
}

// Sample camera images based on conditions
const CAMERA_IMAGES = {
  day: {
    clear: '/images/camera-day-clear.jpg',
    rain: '/images/camera-day-rain.jpg',
    fog: '/images/camera-day-fog.jpg',
    snow: '/images/camera-day-snow.jpg'
  },
  night: {
    clear: '/images/camera-night-clear.jpg',
    rain: '/images/camera-night-rain.jpg',
    fog: '/images/camera-night-fog.jpg',
    snow: '/images/camera-night-snow.jpg'
  },
  dawn: {
    clear: '/images/camera-dawn-clear.jpg',
    rain: '/images/camera-dawn-rain.jpg',
    fog: '/images/camera-dawn-fog.jpg',
    snow: '/images/camera-dawn-snow.jpg'
  },
  dusk: {
    clear: '/images/camera-dusk-clear.jpg',
    rain: '/images/camera-dusk-rain.jpg',
    fog: '/images/camera-dusk-fog.jpg',
    snow: '/images/camera-dusk-snow.jpg'
  }
};

// Mock images fallback (since we don't have actual images)
const MOCK_IMAGES = {
  day: {
    clear: 'https://images.unsplash.com/photo-1573108037329-51c138d548b4?q=80&w=1024',
    rain: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1024',
    fog: 'https://images.unsplash.com/photo-1486815228317-95f744137c2c?q=80&w=1024',
    snow: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?q=80&w=1024'
  },
  night: {
    clear: 'https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?q=80&w=1024',
    rain: 'https://images.unsplash.com/photo-1501691541882-89a8332ea0b4?q=80&w=1024',
    fog: 'https://images.unsplash.com/photo-1505502577165-39bdb3c4cd5f?q=80&w=1024',
    snow: 'https://images.unsplash.com/photo-1517242810446-cc8951b2be40?q=80&w=1024'
  },
  dawn: {
    clear: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1024',
    rain: 'https://images.unsplash.com/photo-1618557703924-ec47db0a814d?q=80&w=1024',
    fog: 'https://images.unsplash.com/photo-1485236715568-ddc5ee6ca227?q=80&w=1024',
    snow: 'https://images.unsplash.com/photo-1482841628122-9080d44bb807?q=80&w=1024'
  },
  dusk: {
    clear: 'https://images.unsplash.com/photo-1472120435266-53107fd0c44a?q=80&w=1024',
    rain: 'https://images.unsplash.com/photo-1501703375462-5ed52504ce9a?q=80&w=1024',
    fog: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?q=80&w=1024',
    snow: 'https://images.unsplash.com/photo-1508516159302-a0d5a1a4733a?q=80&w=1024'
  }
};

export function CameraViewSimulator({ projectState, activeFloor }: CameraViewSimulatorProps) {
  const [cameras, setCameras] = useState<CameraState[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'single' | 'quad' | 'all'>('single');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showEffects, setShowEffects] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);

  const [simulationState, setSimulationState] = useState<SimulationState>({
    timeOfDay: 'day',
    weather: 'clear',
    movement: 'none',
    temperature: 25,
    visibility: 100
  });

  const simulationRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Initialize cameras from devices
  useEffect(() => {
    const cameraDevices = activeFloor.devices.filter(d => 
      d.type.includes('cctv-')
    );
    
    if (cameraDevices.length > 0) {
      const initialCameras: CameraState[] = cameraDevices.map(device => ({
        id: device.id,
        label: device.label || `Camera ${device.id.substring(0, 4)}`,
        type: device.type,
        image: MOCK_IMAGES.day.clear, // Default image
        fov: getFOVForDeviceType(device.type),
        quality: 95,
        active: true,
        nightMode: false
      }));
      
      setCameras(initialCameras);
      setSelectedCamera(initialCameras[0].id);
    } else {
      setCameras([]);
      setSelectedCamera(null);
      toast({
        title: 'ไม่พบกล้อง',
        description: 'กรุณาเพิ่มกล้องในแบบแปลนก่อนใช้เครื่องมือจำลอง',
        variant: 'destructive'
      });
    }
  }, [activeFloor.devices, toast]);

  const getFOVForDeviceType = (type: string): number => {
    switch(type) {
      case 'cctv-dome': return 90;
      case 'cctv-bullet': return 70;
      case 'cctv-ptz': return 60;
      default: return 80;
    }
  };

  const startSimulation = () => {
    setIsSimulating(true);
    
    toast({
      title: 'เริ่มการจำลองมุมมองกล้อง',
      description: 'กำลังจำลองสภาพแสง สภาพอากาศ และการเคลื่อนไหว'
    });
    
    simulationRef.current = setInterval(() => {
      // Update simulation state to create dynamic environment
      updateSimulationState();
      
      // Update camera states based on simulation
      updateCameraStates();
    }, 3000);
  };
  
  const stopSimulation = () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
    }
    setIsSimulating(false);
    
    toast({
      title: 'หยุดการจำลองมุมมองกล้อง',
      description: 'คุณสามารถปรับเปลี่ยนสภาพแวดล้อมด้วยตนเอง'
    });
  };
  
  const updateSimulationState = () => {
    if (!isSimulating) return;
    
    setSimulationState(prev => {
      // Random changes to create dynamic environment
      const newState = { ...prev };
      
      // Occasionally change time of day
      if (Math.random() < 0.2) {
        const timeOptions: ('day' | 'night' | 'dawn' | 'dusk')[] = ['day', 'night', 'dawn', 'dusk'];
        newState.timeOfDay = timeOptions[Math.floor(Math.random() * timeOptions.length)];
      }
      
      // Occasionally change weather
      if (Math.random() < 0.15) {
        const weatherOptions: ('clear' | 'rain' | 'fog' | 'snow')[] = ['clear', 'rain', 'fog', 'snow'];
        newState.weather = weatherOptions[Math.floor(Math.random() * weatherOptions.length)];
      }
      
      // Regularly change movement level
      if (Math.random() < 0.3) {
        const movementOptions: ('none' | 'low' | 'medium' | 'high')[] = ['none', 'low', 'medium', 'high'];
        newState.movement = movementOptions[Math.floor(Math.random() * movementOptions.length)];
      }
      
      // Adjust temperature based on time of day and weather
      if (newState.timeOfDay === 'day') {
        newState.temperature = 22 + Math.random() * 10;
      } else if (newState.timeOfDay === 'night') {
        newState.temperature = 10 + Math.random() * 8;
      } else {
        newState.temperature = 15 + Math.random() * 8;
      }
      
      // Adjust visibility based on weather
      switch(newState.weather) {
        case 'clear':
          newState.visibility = 90 + Math.random() * 10;
          break;
        case 'rain':
          newState.visibility = 60 + Math.random() * 20;
          break;
        case 'fog':
          newState.visibility = 30 + Math.random() * 30;
          break;
        case 'snow':
          newState.visibility = 40 + Math.random() * 30;
          break;
      }
      
      return newState;
    });
  };
  
  const updateCameraStates = () => {
    // Update cameras based on simulation state
    setCameras(prev => prev.map(camera => {
      // Get appropriate image based on conditions
      const image = MOCK_IMAGES[simulationState.timeOfDay][simulationState.weather];
      
      // Calculate quality based on conditions
      let qualityModifier = 0;
      
      // Weather affects quality
      switch(simulationState.weather) {
        case 'clear': qualityModifier += 0; break;
        case 'rain': qualityModifier -= 15; break;
        case 'fog': qualityModifier -= 30; break;
        case 'snow': qualityModifier -= 20; break;
      }
      
      // Time of day affects quality
      switch(simulationState.timeOfDay) {
        case 'day': qualityModifier += 0; break;
        case 'night': qualityModifier -= 25; break;
        case 'dawn': qualityModifier -= 10; break;
        case 'dusk': qualityModifier -= 15; break;
      }
      
      // Calculate night mode based on time of day
      const shouldUseNightMode = 
        simulationState.timeOfDay === 'night' || 
        (simulationState.timeOfDay === 'dusk' && Math.random() > 0.3) ||
        (simulationState.timeOfDay === 'dawn' && Math.random() > 0.7);
      
      return {
        ...camera,
        image,
        quality: Math.max(30, Math.min(95, 95 + qualityModifier)),
        nightMode: shouldUseNightMode
      };
    }));
  };
  
  const handleEnvironmentChange = (param: keyof SimulationState, value: any) => {
    setSimulationState(prev => ({
      ...prev,
      [param]: value
    }));
    
    // Update camera images based on new environment
    updateCameraStates();
  };
  
  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'clear': return <Sun className="w-4 h-4" />;
      case 'rain': return <CloudRain className="w-4 h-4" />;
      case 'fog': return <Cloud className="w-4 h-4" />;
      case 'snow': return <Cloud className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };

  const getTimeIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'day': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'night': return <Moon className="w-4 h-4 text-blue-500" />;
      case 'dawn': return <Sun className="w-4 h-4 text-orange-300" />;
      case 'dusk': return <Sun className="w-4 h-4 text-orange-500" />;
      default: return <Sun className="w-4 h-4" />;
    }
  };
  
  const getOverlayEffect = (camera: CameraState) => {
    let styles = {};
    
    // Apply effects based on environment
    if (simulationState.timeOfDay === 'night' && camera.nightMode) {
      styles = {
        ...styles,
        filter: 'brightness(1.2) hue-rotate(120deg) grayscale(0.5)'
      };
    }
    
    if (simulationState.weather === 'rain') {
      styles = {
        ...styles,
        backgroundImage: 'url(https://media.giphy.com/media/JTgfQ5oL2QgRnj7Sre/giphy.gif)',
        backgroundSize: 'cover',
        backgroundBlendMode: 'overlay',
        opacity: 0.5
      };
    }
    
    if (simulationState.weather === 'fog') {
      styles = {
        ...styles,
        background: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(4px)'
      };
    }
    
    if (simulationState.weather === 'snow') {
      styles = {
        ...styles,
        backgroundImage: 'url(https://media.giphy.com/media/xUOwGoNa2uX6M170d2/giphy.gif)',
        backgroundSize: 'cover',
        backgroundBlendMode: 'overlay',
        opacity: 0.6
      };
    }
    
    return showEffects ? styles : {};
  };
  
  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, []);

  const selectedCameraData = selectedCamera ? cameras.find(cam => cam.id === selectedCamera) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-500" />
            จำลองมุมมองกล้องวงจรปิด
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>เลือกรูปแบบการแสดงผล</Label>
              <div className="flex space-x-4 mt-2">
                <Button 
                  variant={selectedView === 'single' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedView('single')}
                  className="flex items-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  กล้องเดียว
                </Button>
                <Button 
                  variant={selectedView === 'quad' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedView('quad')}
                  className="flex items-center gap-2"
                >
                  <PanelTopOpen className="w-4 h-4" />
                  4 กล้อง
                </Button>
              </div>
            </div>
            
            <div>
              <Label>เลือกกล้อง</Label>
              <Select 
                value={selectedCamera || ''} 
                onValueChange={setSelectedCamera}
                disabled={cameras.length === 0}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="เลือกกล้อง" />
                </SelectTrigger>
                <SelectContent>
                  {cameras.map(camera => (
                    <SelectItem key={camera.id} value={camera.id}>
                      {camera.label} ({camera.type.replace('cctv-', '')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>การจำลอง</Label>
              <div className="flex items-center gap-4 mt-2">
                {isSimulating ? (
                  <Button 
                    onClick={stopSimulation}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    หยุดจำลอง
                  </Button>
                ) : (
                  <Button 
                    onClick={startSimulation}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    เริ่มจำลอง
                  </Button>
                )}
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="effects" 
                    checked={showEffects}
                    onCheckedChange={setShowEffects}
                  />
                  <Label htmlFor="effects">เอฟเฟกต์</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="analytics" 
                    checked={showAnalytics}
                    onCheckedChange={setShowAnalytics}
                  />
                  <Label htmlFor="analytics">Analytics</Label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-4 md:col-span-1">
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">สภาพแวดล้อม</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 py-2">
                  <div>
                    <Label className="flex items-center gap-2">
                      {getTimeIcon(simulationState.timeOfDay)}
                      เวลา
                    </Label>
                    <Select 
                      value={simulationState.timeOfDay}
                      onValueChange={(value: 'day' | 'night' | 'dawn' | 'dusk') => 
                        handleEnvironmentChange('timeOfDay', value)
                      }
                      disabled={isSimulating}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day">กลางวัน</SelectItem>
                        <SelectItem value="night">กลางคืน</SelectItem>
                        <SelectItem value="dawn">รุ่งเช้า</SelectItem>
                        <SelectItem value="dusk">พลบค่ำ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      {getWeatherIcon(simulationState.weather)}
                      สภาพอากาศ
                    </Label>
                    <Select 
                      value={simulationState.weather}
                      onValueChange={(value: 'clear' | 'rain' | 'fog' | 'snow') => 
                        handleEnvironmentChange('weather', value)
                      }
                      disabled={isSimulating}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clear">แจ่มใส</SelectItem>
                        <SelectItem value="rain">ฝนตก</SelectItem>
                        <SelectItem value="fog">หมอก</SelectItem>
                        <SelectItem value="snow">หิมะ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4" />
                      อุณหภูมิ
                    </Label>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>10°C</span>
                      <span>35°C</span>
                    </div>
                    <Slider
                      value={[simulationState.temperature]}
                      onValueChange={([temp]) => handleEnvironmentChange('temperature', temp)}
                      disabled={isSimulating}
                      min={10}
                      max={35}
                      step={0.5}
                      className="mt-1"
                    />
                    <div className="text-center text-sm font-medium mt-1">
                      {simulationState.temperature.toFixed(1)}°C
                    </div>
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      ทัศนวิสัย
                    </Label>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>แย่</span>
                      <span>ดี</span>
                    </div>
                    <Slider
                      value={[simulationState.visibility]}
                      onValueChange={([vis]) => handleEnvironmentChange('visibility', vis)}
                      disabled={isSimulating}
                      min={10}
                      max={100}
                      step={1}
                      className="mt-1"
                    />
                    <div className="text-center text-sm font-medium mt-1">
                      {simulationState.visibility}%
                    </div>
                  </div>
                  
                  <div>
                    <Label className="flex items-center gap-2">
                      <SquareUser className="w-4 h-4" />
                      การเคลื่อนไหว
                    </Label>
                    <Select 
                      value={simulationState.movement}
                      onValueChange={(value: 'none' | 'low' | 'medium' | 'high') => 
                        handleEnvironmentChange('movement', value)
                      }
                      disabled={isSimulating}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">ไม่มี</SelectItem>
                        <SelectItem value="low">น้อย</SelectItem>
                        <SelectItem value="medium">ปานกลาง</SelectItem>
                        <SelectItem value="high">มาก</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="col-span-4 md:col-span-3 space-y-4">
              {selectedView === 'single' ? (
                <div>
                  {selectedCameraData ? (
                    <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img 
                        src={selectedCameraData.image} 
                        alt="Camera View"
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={getOverlayEffect(selectedCameraData)}
                      />
                      
                      {/* Camera info overlay */}
                      <div className="absolute top-0 left-0 p-3 text-white text-shadow flex items-center space-x-2">
                        <Camera className="w-5 h-5" />
                        <span>{selectedCameraData.label}</span>
                        <Badge 
                          variant="secondary" 
                          className={selectedCameraData.nightMode ? 'bg-blue-900 text-white' : ''}
                        >
                          {selectedCameraData.nightMode ? 'Night Mode' : 'Day Mode'}
                        </Badge>
                      </div>
                      
                      {/* Analytics overlay */}
                      {showAnalytics && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-3">
                          <div className="flex justify-between">
                            <div>Quality: {selectedCameraData.quality.toFixed(0)}%</div>
                            <div>FOV: {selectedCameraData.fov}°</div>
                            <div>{simulationState.timeOfDay} / {simulationState.weather}</div>
                            <div>{simulationState.temperature.toFixed(1)}°C</div>
                          </div>
                          
                          {simulationState.movement !== 'none' && (
                            <div className="text-yellow-400 mt-1 flex items-center">
                              <BarChart className="w-4 h-4 mr-1" /> Movement detected: {simulationState.movement} intensity
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Camera className="w-10 h-10 mx-auto text-muted-foreground opacity-30" />
                        <p className="mt-2 text-muted-foreground">ไม่พบกล้อง</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {cameras.slice(0, 4).map((camera, index) => (
                    <div key={camera.id} className="relative aspect-video bg-black rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img 
                        src={camera.image} 
                        alt={`Camera ${index+1}`}
                        className="w-full h-full object-cover"
                      />
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={getOverlayEffect(camera)}
                      />
                      
                      {/* Camera info overlay */}
                      <div className="absolute top-0 left-0 p-2 text-white text-shadow">
                        <div className="text-sm font-semibold flex items-center">
                          <Camera className="w-3 h-3 mr-1" />
                          {camera.label}
                        </div>
                      </div>
                      
                      {/* Analytics overlay - simplified for quad view */}
                      {showAnalytics && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2">
                          <div className="flex justify-between">
                            <div>Q: {camera.quality.toFixed(0)}%</div>
                            <div>{simulationState.movement !== 'none' && (
                              <span className="text-yellow-400">Movement</span>
                            )}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {cameras.length < 4 && Array(4 - cameras.length).fill(0).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <Camera className="w-8 h-8 text-muted-foreground opacity-30" />
                    </div>
                  ))}
                </div>
              )}
              
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Camera Performance Analysis</CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Image Quality</Label>
                      {selectedCameraData && (
                        <>
                          <div className="text-2xl font-semibold">
                            {selectedCameraData.quality.toFixed(0)}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {selectedCameraData.quality > 80 ? 'Excellent' :
                             selectedCameraData.quality > 60 ? 'Good' :
                             selectedCameraData.quality > 40 ? 'Fair' : 'Poor'}
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div>
                      <Label>Environmental Effects</Label>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant={
                          simulationState.weather === 'clear' ? 'default' :
                          simulationState.weather === 'rain' ? 'secondary' :
                          simulationState.weather === 'fog' ? 'destructive' : 'outline'
                        }>
                          {simulationState.weather}
                        </Badge>
                        
                        <Badge variant={
                          simulationState.visibility > 80 ? 'default' :
                          simulationState.visibility > 50 ? 'secondary' : 'destructive'
                        }>
                          {simulationState.visibility}% visibility
                        </Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Motion Detection</Label>
                      <div className="text-lg font-semibold">
                        {simulationState.movement === 'none' ? 'No Motion' :
                         simulationState.movement === 'low' ? 'Low Activity' :
                         simulationState.movement === 'medium' ? 'Medium Activity' : 'High Activity'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
