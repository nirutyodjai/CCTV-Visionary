'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { 
  Route, 
  Zap, 
  AlertTriangle, 
  CheckCircle2, 
  Calculator,
  MapPin,
  Layers,
  Settings,
  Bot,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';

import type { AnyDevice, Connection, ArchitecturalElement } from '@/lib/types';
import { 
  calculateCablePath, 
  analyzePathObstacles,
  CABLE_SPECIFICATIONS,
  type PathCalculationOptions,
  type CablePathResult 
} from '@/lib/cable-calculation';

interface AdvancedCableRoutingProps {
  devices: AnyDevice[];
  connections: Connection[];
  architecturalElements: ArchitecturalElement[];
  floorDimensions?: { width: number; height: number };
  onUpdateConnection?: (connection: Connection) => void;
  onUpdateConnections?: (connections: Connection[]) => void;
}

interface RouteAnalysis {
  connectionId: string;
  from: string;
  to: string;
  currentLength: number;
  optimizedLength: number;
  savings: number;
  obstacles: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  cost: number;
  recommendations: string[];
}

export function AdvancedCableRouting({ 
  devices, 
  connections, 
  architecturalElements,
  floorDimensions = { width: 1000, height: 800 },
  onUpdateConnection,
  onUpdateConnections 
}: AdvancedCableRoutingProps) {
  
  const [routingOptions, setRoutingOptions] = useState<PathCalculationOptions>({
    includeSlack: true,
    slackPercentage: 15,
    ceilingHeight: 3.0,
    conduitRequired: true,
    weatherProtection: false,
    pathType: 'ceiling'
  });

  const [selectedConnections, setSelectedConnections] = useState<string[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState<'basic' | 'advanced' | 'ai'>('advanced');

  // วิเคราะห์เส้นทางทั้งหมด
  const routeAnalyses = useMemo(() => {
    return connections.map(connection => {
      const fromDevice = devices.find(d => d.id === connection.fromDeviceId);
      const toDevice = devices.find(d => d.id === connection.toDeviceId);
      
      if (!fromDevice || !toDevice) return null;

      const currentResult = calculateCablePath(fromDevice, toDevice, connection, routingOptions);
      
      // คำนวณเส้นทางที่เหมาะสมที่สุด
      const optimizedOptions = { ...routingOptions, pathType: 'ceiling' as const };
      const optimizedResult = calculateCablePath(fromDevice, toDevice, connection, optimizedOptions);
      
      const obstacles = analyzePathObstacles(
        { x: fromDevice.x, y: fromDevice.y },
        { x: toDevice.x, y: toDevice.y },
        architecturalElements.filter(el => el.type === 'wall')
      );

      const difficulty = obstacles.length > 2 ? 'hard' : obstacles.length > 0 ? 'medium' : 'easy';
      const savings = currentResult.totalLength - optimizedResult.totalLength;

      return {
        connectionId: connection.id,
        from: fromDevice.label,
        to: toDevice.label,
        currentLength: currentResult.totalLength,
        optimizedLength: optimizedResult.totalLength,
        savings,
        obstacles,
        difficulty,
        cost: optimizedResult.estimatedCost,
        recommendations: optimizedResult.recommendations
      } as RouteAnalysis;
    }).filter(Boolean) as RouteAnalysis[];
  }, [connections, devices, architecturalElements, routingOptions]);

  // สถิติการเส้นทาง
  const routingStats = useMemo(() => {
    const totalConnections = routeAnalyses.length;
    const totalCurrentLength = routeAnalyses.reduce((sum, analysis) => sum + analysis.currentLength, 0);
    const totalOptimizedLength = routeAnalyses.reduce((sum, analysis) => sum + analysis.optimizedLength, 0);
    const totalSavings = totalCurrentLength - totalOptimizedLength;
    const totalCost = routeAnalyses.reduce((sum, analysis) => sum + analysis.cost, 0);
    
    const difficultRoutes = routeAnalyses.filter(a => a.difficulty === 'hard').length;
    const routesWithObstacles = routeAnalyses.filter(a => a.obstacles.length > 0).length;

    return {
      totalConnections,
      totalCurrentLength,
      totalOptimizedLength,
      totalSavings,
      totalCost,
      difficultRoutes,
      routesWithObstacles,
      averageLength: totalOptimizedLength / totalConnections || 0
    };
  }, [routeAnalyses]);

  const updateRoutingOption = <K extends keyof PathCalculationOptions>(
    key: K, 
    value: PathCalculationOptions[K]
  ) => {
    setRoutingOptions(prev => ({ ...prev, [key]: value }));
  };

  const optimizeSelectedRoutes = useCallback(async () => {
    if (selectedConnections.length === 0) return;
    
    setIsOptimizing(true);
    try {
      // จำลองการเรียก AI optimization
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedConnections = connections.map(conn => {
        if (!selectedConnections.includes(conn.id)) return conn;
        
        const fromDevice = devices.find(d => d.id === conn.fromDeviceId);
        const toDevice = devices.find(d => d.id === conn.toDeviceId);
        
        if (!fromDevice || !toDevice) return conn;

        const optimizedResult = calculateCablePath(fromDevice, toDevice, conn, routingOptions);
        
        return {
          ...conn,
          length: optimizedResult.totalLength,
          path: optimizedResult.segments.map(s => s.start),
          specifications: {
            ...conn.specifications,
            optimized: true,
            estimatedCost: optimizedResult.estimatedCost
          }
        };
      });

      onUpdateConnections?.(updatedConnections);
    } finally {
      setIsOptimizing(false);
    }
  }, [selectedConnections, connections, devices, routingOptions, onUpdateConnections]);

  const optimizeAllRoutes = useCallback(() => {
    setSelectedConnections(connections.map(c => c.id));
    optimizeSelectedRoutes();
  }, [connections, optimizeSelectedRoutes]);

  const exportRoutingReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      project: 'CCTV Cable Routing Analysis',
      options: routingOptions,
      statistics: routingStats,
      routes: routeAnalyses,
      recommendations: [
        ...new Set(routeAnalyses.flatMap(a => a.recommendations))
      ]
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cable-routing-analysis-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            ระบบออกแบบเส้นทางสายขั้นสูง
          </CardTitle>
          <CardDescription>
            วิเคราะห์และเพิ่มประสิทธิภาพเส้นทางสายด้วย AI
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analysis">วิเคราะห์</TabsTrigger>
          <TabsTrigger value="optimization">เพิ่มประสิทธิภาพ</TabsTrigger>
          <TabsTrigger value="visualization">ภาพรวม</TabsTrigger>
          <TabsTrigger value="settings">การตั้งค่า</TabsTrigger>
        </TabsList>

        {/* วิเคราะห์ */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">การเชื่อมต่อทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routingStats.totalConnections}</div>
                <p className="text-xs text-muted-foreground">เส้นทาง</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ระยะทางรวม</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routingStats.totalOptimizedLength.toFixed(0)} m</div>
                <p className="text-xs text-muted-foreground">เมตร</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ประหยัดได้</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {routingStats.totalSavings.toFixed(0)} m
                </div>
                <p className="text-xs text-muted-foreground">
                  {((routingStats.totalSavings / routingStats.totalCurrentLength) * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">ค่าใช้จ่าย</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">฿{routingStats.totalCost.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">ประมาณการ</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">รายละเอียดเส้นทาง</CardTitle>
              <CardDescription>
                วิเคราะห์เส้นทางแต่ละการเชื่อมต่อ ({routingStats.routesWithObstacles} เส้นทางมีสิ่งกีดขวาง)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {routeAnalyses.map((analysis, index) => (
                  <div key={analysis.connectionId} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedConnections.includes(analysis.connectionId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedConnections(prev => [...prev, analysis.connectionId]);
                            } else {
                              setSelectedConnections(prev => prev.filter(id => id !== analysis.connectionId));
                            }
                          }}
                        />
                        <span className="font-medium text-sm">
                          {analysis.from} → {analysis.to}
                        </span>
                        <Badge variant={
                          analysis.difficulty === 'easy' ? 'default' :
                          analysis.difficulty === 'medium' ? 'secondary' : 'destructive'
                        }>
                          {analysis.difficulty}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {analysis.optimizedLength.toFixed(1)} m
                        </div>
                        {analysis.savings > 0 && (
                          <div className="text-xs text-green-600">
                            -{analysis.savings.toFixed(1)} m
                          </div>
                        )}
                      </div>
                    </div>

                    {analysis.obstacles.length > 0 && (
                      <div className="mb-2">
                        <Label className="text-xs text-muted-foreground">สิ่งกีดขวาง:</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {analysis.obstacles.map((obstacle, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {obstacle}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>ค่าใช้จ่าย: ฿{analysis.cost.toLocaleString()}</span>
                      <span>{analysis.recommendations.length} ข้อแนะนำ</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* เพิ่มประสิทธิภาพ */}
        <TabsContent value="optimization" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ตัวเลือกการเพิ่มประสิทธิภาพ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ระดับการเพิ่มประสิทธิภาพ</Label>
                  <Select value={optimizationLevel} onValueChange={(value: any) => setOptimizationLevel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">พื้นฐาน - คำนวณระยะทางตรง</SelectItem>
                      <SelectItem value="advanced">ขั้นสูง - หลีกเลี่ยงสิ่งกีดขวาง</SelectItem>
                      <SelectItem value="ai">AI - เพิ่มประสิทธิภาพด้วย AI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>รวม Slack ในการคำนวณ</Label>
                    <Switch
                      checked={routingOptions.includeSlack}
                      onCheckedChange={(checked) => updateRoutingOption('includeSlack', checked)}
                    />
                  </div>

                  {routingOptions.includeSlack && (
                    <div>
                      <Label>เปอร์เซ็นต์ Slack: {routingOptions.slackPercentage}%</Label>
                      <Slider
                        value={[routingOptions.slackPercentage]}
                        onValueChange={([value]) => updateRoutingOption('slackPercentage', value)}
                        min={5}
                        max={30}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <Label>ต้องการท่อ</Label>
                    <Switch
                      checked={routingOptions.conduitRequired}
                      onCheckedChange={(checked) => updateRoutingOption('conduitRequired', checked)}
                    />
                  </div>

                  <div>
                    <Label>ประเภทเส้นทางหลัก</Label>
                    <Select 
                      value={routingOptions.pathType} 
                      onValueChange={(value: any) => updateRoutingOption('pathType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ceiling">ผ่านเพดาน (แนะนำ)</SelectItem>
                        <SelectItem value="wall">ติดผนัง</SelectItem>
                        <SelectItem value="underground">ใต้ดิน</SelectItem>
                        <SelectItem value="mixed">แบบผสม</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    เลือกแล้ว: {selectedConnections.length} จาก {connections.length} การเชื่อมต่อ
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setSelectedConnections(connections.map(c => c.id))}
                      variant="outline"
                      size="sm"
                    >
                      เลือกทั้งหมด
                    </Button>
                    <Button
                      onClick={() => setSelectedConnections([])}
                      variant="outline"
                      size="sm"
                    >
                      ยกเลิกทั้งหมด
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">การดำเนินการ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">การเพิ่มประสิทธิภาพ AI</span>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    ใช้ AI เพื่อหาเส้นทางที่เหมาะสมที่สุด โดยพิจารณาสิ่งกีดขวาง ความยาว และค่าใช้จ่าย
                  </p>
                  <Button 
                    onClick={optimizeSelectedRoutes} 
                    disabled={selectedConnections.length === 0 || isOptimizing}
                    className="w-full"
                  >
                    {isOptimizing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        กำลังเพิ่มประสิทธิภาพ...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        เพิ่มประสิทธิภาพที่เลือก
                      </>
                    )}
                  </Button>
                </div>

                <Button 
                  onClick={optimizeAllRoutes}
                  variant="outline"
                  className="w-full"
                  disabled={isOptimizing}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  เพิ่มประสิทธิภาพทั้งหมด
                </Button>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">สถิติการเพิ่มประสิทธิภาพ</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>เส้นทางยากติดตั้ง:</span>
                      <Badge variant="destructive">{routingStats.difficultRoutes}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>ประหยัดระยะทางได้:</span>
                      <span className="text-green-600 font-medium">
                        {routingStats.totalSavings.toFixed(1)} m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>ประหยัดเปอร์เซ็นต์:</span>
                      <span className="text-green-600 font-medium">
                        {((routingStats.totalSavings / routingStats.totalCurrentLength) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <Button onClick={exportRoutingReport} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  ส่งออกรายงาน
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ภาพรวม */}
        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  ภาพรวมเส้นทางสาย
                </span>
                <Switch
                  checked={showVisualization}
                  onCheckedChange={setShowVisualization}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showVisualization ? (
                <div className="space-y-4">
                  <div className="w-full h-64 bg-gray-100 border rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p>แผนที่เส้นทางสาย</p>
                      <p className="text-sm">จะแสดงเส้นทางสายและสิ่งกีดขวาง</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">เส้นทางง่าย</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold text-green-600">
                          {routeAnalyses.filter(a => a.difficulty === 'easy').length}
                        </div>
                        <div className="w-full bg-green-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(routeAnalyses.filter(a => a.difficulty === 'easy').length / routeAnalyses.length) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">เส้นทางปานกลาง</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold text-yellow-600">
                          {routeAnalyses.filter(a => a.difficulty === 'medium').length}
                        </div>
                        <div className="w-full bg-yellow-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-yellow-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(routeAnalyses.filter(a => a.difficulty === 'medium').length / routeAnalyses.length) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">เส้นทางยาก</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-bold text-red-600">
                          {routeAnalyses.filter(a => a.difficulty === 'hard').length}
                        </div>
                        <div className="w-full bg-red-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-red-600 h-2 rounded-full" 
                            style={{ 
                              width: `${(routeAnalyses.filter(a => a.difficulty === 'hard').length / routeAnalyses.length) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Layers className="h-8 w-8 mx-auto mb-2" />
                  <p>เปิดการแสดงผลเพื่อดูภาพรวมเส้นทาง</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* การตั้งค่า */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                การตั้งค่าขั้นสูง
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ความสูงเพดาน (เมตร)</Label>
                <Slider
                  value={[routingOptions.ceilingHeight]}
                  onValueChange={([value]) => updateRoutingOption('ceilingHeight', value)}
                  min={2.5}
                  max={6.0}
                  step={0.1}
                  className="mt-2"
                />
                <div className="text-sm text-muted-foreground mt-1">
                  {routingOptions.ceilingHeight.toFixed(1)} เมตร
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="weather-protection">ป้องกันสภาพอากาศ</Label>
                  <Switch
                    id="weather-protection"
                    checked={routingOptions.weatherProtection}
                    onCheckedChange={(checked) => updateRoutingOption('weatherProtection', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label className="text-base font-medium">ข้อมูลพื้นที่</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="floor-width">ความกว้าง (หน่วย)</Label>
                    <Input
                      id="floor-width"
                      type="number"
                      value={floorDimensions.width}
                      readOnly
                    />
                  </div>
                  <div>
                    <Label htmlFor="floor-height">ความยาว (หน่วย)</Label>
                    <Input
                      id="floor-height"
                      type="number"
                      value={floorDimensions.height}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
