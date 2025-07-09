'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Ruler, 
  Target, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Upload, 
  Settings,
  MapPin,
  Calculator,
  Zap,
  TrendingUp,
  Save,
  RotateCcw,
  Info,
  Cable
} from 'lucide-react';
import type { AnyDevice, Connection, Floor } from '@/lib/types';
import { 
  CalibrationData, 
  CalibrationPoint, 
  CalibrationSettings,
  DEFAULT_CALIBRATION_SETTINGS,
  calculateCalibratedCableLength,
  validateCalibration,
  updateCalibrationFromMeasurements,
  generateCalibrationReport,
  exportCalibrationData,
  importCalibrationData,
  createCalibrationPointsFromDevices,
  calculateVirtualDistance,
  virtualToRealWorld
} from '@/lib/calibration';
import type { CableRoutingDetails } from '@/lib/calibration';
import { calculateCalibratedCableLengthWithDrops, createCableRoutingDetails } from '@/lib/calibration';
import BandwidthAnalysis from '@/components/ui/bandwidth-analysis';
import type { BandwidthCalculationResult } from '@/lib/calibration';
import { CableRoutingConfig } from '@/components/ui/cable-routing-config';

interface CableCalibrationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  floor: Floor;
  devices: AnyDevice[];
  connections: Connection[];
  onCalibrationUpdate: (calibrationData: CalibrationData) => void;
  currentCalibration?: CalibrationData;
}

export function CableCalibrationDialog({
  isOpen,
  onClose,
  floor,
  devices,
  connections,
  onCalibrationUpdate,
  currentCalibration
}: CableCalibrationDialogProps) {
  const [activeTab, setActiveTab] = useState('setup');
  const [calibrationData, setCalibrationData] = useState<CalibrationData>(
    currentCalibration || {
      id: `cal-${Date.now()}`,
      floorId: floor.id,
      name: `Calibration ${new Date().toLocaleDateString('th-TH')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      points: [],
      baseScale: 50, // default pixels per meter
      realWorldDimensions: { width: 20, height: 15 },
      referenceDistances: { horizontal: 0, vertical: 0, diagonal: 0 },
      accuracy: { deviation: 0, confidence: 'low', lastValidated: new Date() }
    }
  );
  
  const [settings, setSettings] = useState<CalibrationSettings>(DEFAULT_CALIBRATION_SETTINGS);
  const [selectedPoints, setSelectedPoints] = useState<string[]>([]);
  const [manualDistance, setManualDistance] = useState<number>(0);
  const [testResults, setTestResults] = useState<any>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [cableRoutingDetails, setCableRoutingDetails] = useState<{ [connectionId: string]: CableRoutingDetails }>({});
  const [selectedConnectionForRouting, setSelectedConnectionForRouting] = useState<string | null>(null);
  const [bandwidthResult, setBandwidthResult] = useState<BandwidthCalculationResult | null>(null);

  // Auto-generate calibration points from devices
  useEffect(() => {
    if (calibrationData.points.length === 0 && devices.length > 0) {
      const points = createCalibrationPointsFromDevices(devices);
      setCalibrationData(prev => ({
        ...prev,
        points: points.slice(0, 6) // limit to 6 points initially
      }));
    }
  }, [devices, calibrationData.points.length]);

  const handlePointSelect = (pointId: string) => {
    setSelectedPoints(prev => {
      const newSelection = prev.includes(pointId) 
        ? prev.filter(id => id !== pointId)
        : [...prev, pointId].slice(-2); // max 2 points
      return newSelection;
    });
  };

  const setReferenceDistance = () => {
    if (selectedPoints.length === 2 && manualDistance > 0) {
      const point1 = calibrationData.points.find(p => p.id === selectedPoints[0]);
      const point2 = calibrationData.points.find(p => p.id === selectedPoints[1]);
      
      if (point1 && point2) {
        const virtualDist = calculateVirtualDistance(point1.virtualCoords, point2.virtualCoords);
        const scaleFactor = manualDistance / virtualDist;
        
        setCalibrationData(prev => ({
          ...prev,
          baseScale: scaleFactor,
          updatedAt: new Date(),
          accuracy: {
            ...prev.accuracy,
            lastValidated: new Date()
          }
        }));
        
        setIsDirty(true);
        setSelectedPoints([]);
        setManualDistance(0);
      }
    }
  };

  const runCalibrationTest = () => {
    // สร้างข้อมูลทดสอบ
    const testConnections = connections.slice(0, 3); // ทดสอบ 3 การเชื่อมต่อแรก
    const mockActualMeasurements: { [key: string]: number } = {};
    
    testConnections.forEach(conn => {
      const fromDevice = devices.find(d => d.id === conn.fromDeviceId);
      const toDevice = devices.find(d => d.id === conn.toDeviceId);
      if (fromDevice && toDevice) {
        const result = calculateCalibratedCableLength(fromDevice, toDevice, conn, calibrationData, settings);
        // เพิ่ม random variation ±5% เพื่อจำลองการวัดจริง
        mockActualMeasurements[conn.id] = result.totalLength * (0.95 + Math.random() * 0.1);
      }
    });

    const validation = validateCalibration(calibrationData, testConnections, mockActualMeasurements);
    setTestResults(validation);
  };

  const saveCalibration = () => {
    onCalibrationUpdate(calibrationData);
    setIsDirty(false);
  };

  const exportData = () => {
    const dataStr = exportCalibrationData(calibrationData);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calibration-${calibrationData.name.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = importCalibrationData(e.target?.result as string);
        setCalibrationData(imported);
        setIsDirty(true);
      } catch (error) {
        alert('Error importing calibration data');
      }
    };
    reader.readAsText(file);
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateEstimatedLengths = () => {
    return connections.map(conn => {
      const fromDevice = devices.find(d => d.id === conn.fromDeviceId);
      const toDevice = devices.find(d => d.id === conn.toDeviceId);
      if (!fromDevice || !toDevice) return null;

      const routing = cableRoutingDetails[conn.id];
      const result = calculateCalibratedCableLengthWithDrops(
        fromDevice, 
        toDevice, 
        conn, 
        calibrationData, 
        settings,
        routing
      );
      
      return {
        connectionId: conn.id,
        fromLabel: fromDevice.label,
        toLabel: toDevice.label,
        cableType: conn.cableType,
        ...result
      };
    }).filter(Boolean);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Cable Length Calibration System
          </DialogTitle>
          <DialogDescription>
            ปรับแต่งระบบการคำนวณระยะสายให้ตรงกับความเป็นจริงในงานติดตั้ง
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="points">Calibration Points</TabsTrigger>
            <TabsTrigger value="cable-routing">Cable Routing</TabsTrigger>
            <TabsTrigger value="bandwidth">Bandwidth Analysis</TabsTrigger>
            <TabsTrigger value="settings">Advanced Settings</TabsTrigger>
            <TabsTrigger value="results">Results & Testing</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Basic Calibration Setup
                </CardTitle>
                <CardDescription>
                  กำหนดข้อมูลพื้นฐานสำหรับการ calibrate ระบบ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cal-name">ชื่อ Calibration</Label>
                    <Input
                      id="cal-name"
                      value={calibrationData.name}
                      onChange={(e) => {
                        setCalibrationData(prev => ({
                          ...prev,
                          name: e.target.value,
                          updatedAt: new Date()
                        }));
                        setIsDirty(true);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confidence Level</Label>
                    <Badge className={getConfidenceColor(calibrationData.accuracy.confidence)}>
                      {calibrationData.accuracy.confidence.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="real-width">ความกว้างจริง (เมตร)</Label>
                    <Input
                      id="real-width"
                      type="number"
                      value={calibrationData.realWorldDimensions.width}
                      onChange={(e) => {
                        setCalibrationData(prev => ({
                          ...prev,
                          realWorldDimensions: {
                            ...prev.realWorldDimensions,
                            width: parseFloat(e.target.value) || 0
                          },
                          updatedAt: new Date()
                        }));
                        setIsDirty(true);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="real-height">ความยาวจริง (เมตร)</Label>
                    <Input
                      id="real-height"
                      type="number"
                      value={calibrationData.realWorldDimensions.height}
                      onChange={(e) => {
                        setCalibrationData(prev => ({
                          ...prev,
                          realWorldDimensions: {
                            ...prev.realWorldDimensions,
                            height: parseFloat(e.target.value) || 0
                          },
                          updatedAt: new Date()
                        }));
                        setIsDirty(true);
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Base Scale: {calibrationData.baseScale.toFixed(1)} pixels/meter</Label>
                  <Slider
                    value={[calibrationData.baseScale]}
                    onValueChange={([value]) => {
                      setCalibrationData(prev => ({
                        ...prev,
                        baseScale: value,
                        updatedAt: new Date()
                      }));
                      setIsDirty(true);
                    }}
                    min={10}
                    max={200}
                    step={1}
                  />
                </div>

                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    ปรับ base scale หรือใช้ reference points เพื่อให้ได้ความแม่นยำที่สูงขึ้น
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="points" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Calibration Points
                </CardTitle>
                <CardDescription>
                  เลือกจุดอ้างอิงและกำหนดระยะทางจริง
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 max-h-40 overflow-y-auto">
                  {calibrationData.points.map((point) => (
                    <div
                      key={point.id}
                      className={`p-2 border rounded cursor-pointer transition-colors ${
                        selectedPoints.includes(point.id) 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => handlePointSelect(point.id)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{point.label}</span>
                        <span className="text-sm text-muted-foreground">
                          ({point.virtualCoords.x.toFixed(3)}, {point.virtualCoords.y.toFixed(3)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPoints.length === 2 && (
                  <Card className="border-primary">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Set Reference Distance</h4>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="ระยะทางจริง (เมตร)"
                          value={manualDistance || ''}
                          onChange={(e) => setManualDistance(parseFloat(e.target.value) || 0)}
                        />
                        <Button onClick={setReferenceDistance} disabled={manualDistance <= 0}>
                          <Target className="w-4 h-4 mr-2" />
                          Set
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        จุดที่เลือก: {selectedPoints.map(id => 
                          calibrationData.points.find(p => p.id === id)?.label
                        ).join(' → ')}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Alert>
                  <CheckCircle className="w-4 h-4" />
                  <AlertDescription>
                    เลือก 2 จุดแล้วกำหนดระยะทางจริงเพื่อ calibrate ระบบ
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cable-routing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cable className="w-4 h-4" />
                  Cable Routing Configuration
                </CardTitle>
                <CardDescription>
                  กำหนดระยะสายต้นทาง-ปลายทาง และเส้นทางการเดินสายแต่ละการเชื่อมต่อ
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Cable className="w-12 h-12 mx-auto mb-4" />
                    <p>ยังไม่มีการเชื่อมต่อในโปรเจกต์นี้</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label>เลือกการเชื่อมต่อที่ต้องการกำหนดค่า</Label>
                      <div className="grid gap-2 max-h-40 overflow-y-auto">
                        {connections.map((conn) => {
                          const fromDevice = devices.find(d => d.id === conn.fromDeviceId);
                          const toDevice = devices.find(d => d.id === conn.toDeviceId);
                          if (!fromDevice || !toDevice) return null;

                          const isSelected = selectedConnectionForRouting === conn.id;
                          const hasRouting = cableRoutingDetails[conn.id];

                          return (
                            <div
                              key={conn.id}
                              className={`p-3 border rounded cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'border-primary bg-primary/10' 
                                  : 'border-border hover:bg-muted'
                              }`}
                              onClick={() => setSelectedConnectionForRouting(isSelected ? null : conn.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="font-medium">
                                    {fromDevice.label} → {toDevice.label}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {conn.cableType}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {hasRouting && (
                                    <Badge variant="secondary" className="text-xs">
                                      Configured
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {conn.id.substring(0, 8)}...
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {selectedConnectionForRouting && (() => {
                      const conn = connections.find(c => c.id === selectedConnectionForRouting);
                      const fromDevice = devices.find(d => d.id === conn?.fromDeviceId);
                      const toDevice = devices.find(d => d.id === conn?.toDeviceId);
                      
                      if (!conn || !fromDevice || !toDevice) return null;

                      return (
                        <div className="border-t pt-4">
                          <CableRoutingConfig
                            connection={conn}
                            fromDevice={fromDevice}
                            toDevice={toDevice}
                            routingDetails={cableRoutingDetails[conn.id]}
                            onRoutingUpdate={(routing: CableRoutingDetails) => {
                              setCableRoutingDetails(prev => ({
                                ...prev,
                                [conn.id]: routing
                              }));
                              setIsDirty(true);
                            }}
                            calibrationSettings={settings}
                          />
                        </div>
                      );
                    })()}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bandwidth" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Network Bandwidth Analysis
                </CardTitle>
                <CardDescription>
                  วิเคราะห์ bandwidth ของกล้องและแนะนำประเภทสายที่เหมาะสม
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BandwidthAnalysis
                  cameras={devices.filter(d => d.type.includes('camera')).map(camera => ({
                    id: camera.id,
                    label: camera.label || `Camera ${camera.id}`,
                    type: camera.type,
                    x: camera.x,
                    y: camera.y
                  }))}
                  connections={connections.map(conn => {
                    const fromDevice = devices.find(d => d.id === conn.fromDeviceId);
                    const toDevice = devices.find(d => d.id === conn.toDeviceId);
                    
                    if (!fromDevice || !toDevice) {
                      return {
                        id: conn.id,
                        fromDeviceId: conn.fromDeviceId,
                        toDeviceId: conn.toDeviceId,
                        distance: 0,
                        cableType: conn.cableType || 'cat6'
                      };
                    }

                    // คำนวณระยะทางจาก calibration
                    const distance = calculateVirtualDistance(fromDevice, toDevice);
                    const realDistance = virtualToRealWorld(distance, calibrationData);
                    
                    return {
                      id: conn.id,
                      fromDeviceId: conn.fromDeviceId,
                      toDeviceId: conn.toDeviceId,
                      distance: realDistance,
                      cableType: conn.cableType || 'cat6'
                    };
                  })}
                  onBandwidthCalculated={(result) => {
                    setBandwidthResult(result);
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Advanced Calibration Settings
                </CardTitle>
                <CardDescription>
                  ปรับแต่งปัจจัยต่างๆ สำหรับการคำนวณที่แม่นยำ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="slack">
                    <AccordionTrigger>Slack Factor ({(settings.slackFactor * 100).toFixed(0)}%)</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <Slider
                        value={[settings.slackFactor * 100]}
                        onValueChange={([value]) => setSettings(prev => ({
                          ...prev,
                          slackFactor: value / 100
                        }))}
                        min={5}
                        max={25}
                        step={1}
                      />
                      <p className="text-sm text-muted-foreground">
                        เผื่อความยาวสายสำหรับการเคลื่อนไหวและการบำรุงรักษา
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="installation">
                    <AccordionTrigger>Installation Factors</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Ceiling: {settings.installationFactors.ceiling}x</Label>
                          <Slider
                            value={[settings.installationFactors.ceiling]}
                            onValueChange={([value]) => setSettings(prev => ({
                              ...prev,
                              installationFactors: {
                                ...prev.installationFactors,
                                ceiling: value
                              }
                            }))}
                            min={1.1}
                            max={2.0}
                            step={0.1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Wall: {settings.installationFactors.wall}x</Label>
                          <Slider
                            value={[settings.installationFactors.wall]}
                            onValueChange={([value]) => setSettings(prev => ({
                              ...prev,
                              installationFactors: {
                                ...prev.installationFactors,
                                wall: value
                              }
                            }))}
                            min={1.1}
                            max={2.0}
                            step={0.1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Underground: {settings.installationFactors.underground}x</Label>
                          <Slider
                            value={[settings.installationFactors.underground]}
                            onValueChange={([value]) => setSettings(prev => ({
                              ...prev,
                              installationFactors: {
                                ...prev.installationFactors,
                                underground: value
                              }
                            }))}
                            min={1.5}
                            max={3.0}
                            step={0.1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Outdoor: {settings.installationFactors.outdoor}x</Label>
                          <Slider
                            value={[settings.installationFactors.outdoor]}
                            onValueChange={([value]) => setSettings(prev => ({
                              ...prev,
                              installationFactors: {
                                ...prev.installationFactors,
                                outdoor: value
                              }
                            }))}
                            min={1.2}
                            max={2.5}
                            step={0.1}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="other">
                    <AccordionTrigger>Other Factors</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Bend Allowance: {(settings.bendAllowance * 100).toFixed(0)}%</Label>
                        <Slider
                          value={[settings.bendAllowance * 100]}
                          onValueChange={([value]) => setSettings(prev => ({
                            ...prev,
                            bendAllowance: value / 100
                          }))}
                          min={3}
                          max={15}
                          step={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Termination Allowance: {settings.terminationAllowance}m</Label>
                        <Slider
                          value={[settings.terminationAllowance]}
                          onValueChange={([value]) => setSettings(prev => ({
                            ...prev,
                            terminationAllowance: value
                          }))}
                          min={0.5}
                          max={3.0}
                          step={0.1}
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="vertical">
                    <AccordionTrigger>Vertical Cable Settings</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Source Drop Length: {settings.verticalCabling.sourceDropLength}m</Label>
                          <Slider
                            value={[settings.verticalCabling.sourceDropLength]}
                            onValueChange={([value]) => setSettings(prev => ({
                              ...prev,
                              verticalCabling: {
                                ...prev.verticalCabling,
                                sourceDropLength: value
                              }
                            }))}
                            min={0.1}
                            max={10.0}
                            step={0.1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Destination Drop Length: {settings.verticalCabling.destinationDropLength}m</Label>
                          <Slider
                            value={[settings.verticalCabling.destinationDropLength]}
                            onValueChange={([value]) => setSettings(prev => ({
                              ...prev,
                              verticalCabling: {
                                ...prev.verticalCabling,
                                destinationDropLength: value
                              }
                            }))}
                            min={0.1}
                            max={10.0}
                            step={0.1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Ceiling Height: {settings.verticalCabling.ceilingHeight}m</Label>
                          <Slider
                            value={[settings.verticalCabling.ceilingHeight]}
                            onValueChange={([value]) => setSettings(prev => ({
                              ...prev,
                              verticalCabling: {
                                ...prev.verticalCabling,
                                ceilingHeight: value
                              }
                            }))}
                            min={2.0}
                            max={6.0}
                            step={0.1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Riser Allowance: {settings.verticalCabling.riserAllowance}m</Label>
                          <Slider
                            value={[settings.verticalCabling.riserAllowance]}
                            onValueChange={([value]) => setSettings(prev => ({
                              ...prev,
                              verticalCabling: {
                                ...prev.verticalCabling,
                                riserAllowance: value
                              }
                            }))}
                            min={0.1}
                            max={3.0}
                            step={0.1}
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Cable Length Estimates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {calculateEstimatedLengths().map((result, index) => result && (
                      <div key={index} className="border rounded p-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{result.fromLabel} → {result.toLabel}</div>
                          <Badge variant="outline">{result.cableType}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">แนวนอน:</span>
                            <span className="ml-1">{result.breakdown.horizontalDistance.toFixed(1)}m</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">แนวตั้ง:</span>
                            <span className="ml-1">{result.breakdown.verticalDistance.toFixed(1)}m</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ต้นทาง:</span>
                            <span className="ml-1">{result.verticalLengths.sourceDropLength.toFixed(1)}m</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">ปลายทาง:</span>
                            <span className="ml-1">{result.verticalLengths.destinationDropLength.toFixed(1)}m</span>
                          </div>
                        </div>
                        
                        <div className="border-t pt-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">รวมทั้งหมด:</span>
                            <span className="font-semibold">{result.totalLength.toFixed(1)}m</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Accuracy Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Accuracy</span>
                      <span className="text-sm">{(100 - calibrationData.accuracy.deviation).toFixed(1)}%</span>
                    </div>
                    <Progress value={100 - calibrationData.accuracy.deviation} />
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div>Deviation: {calibrationData.accuracy.deviation.toFixed(1)}%</div>
                    <div>Last validated: {calibrationData.accuracy.lastValidated.toLocaleDateString('th-TH')}</div>
                  </div>

                  <Button onClick={runCalibrationTest} variant="outline" className="w-full">
                    <Zap className="w-4 h-4 mr-2" />
                    Run Test
                  </Button>
                </CardContent>
              </Card>
            </div>

            {testResults && (
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>Overall Accuracy: {testResults.accuracy.toFixed(1)}%</div>
                    <div>Recommendation: {testResults.recommendation}</div>
                    <Separator />
                    <div className="text-sm space-y-1">
                      {testResults.deviations.map((dev: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>Connection {index + 1}</span>
                          <span>{dev.deviation.toFixed(1)}% deviation</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <label>
              <Button variant="outline" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </span>
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={saveCalibration} 
              disabled={!isDirty}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Calibration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
