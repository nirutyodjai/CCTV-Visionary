'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  Cable, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Zap,
  Route,
  FileText,
  Download
} from 'lucide-react';

import type { AnyDevice, Connection, ArchitecturalElement } from '@/lib/types';
import { 
  calculateCablePath, 
  generateCableReport,
  CABLE_SPECIFICATIONS,
  CONDUIT_SPECIFICATIONS,
  selectOptimalConduit,
  type PathCalculationOptions,
  type CablePathResult 
} from '@/lib/cable-calculation';

interface CableCalculatorProps {
  devices: AnyDevice[];
  connections: Connection[];
  architecturalElements: ArchitecturalElement[];
  onUpdateConnection?: (connection: Connection) => void;
}

export function CableCalculator({ 
  devices, 
  connections, 
  architecturalElements,
  onUpdateConnection 
}: CableCalculatorProps) {
  const [selectedConnection, setSelectedConnection] = useState<string>('');
  const [calculationOptions, setCalculationOptions] = useState<PathCalculationOptions>({
    includeSlack: true,
    slackPercentage: 10,
    ceilingHeight: 3.0,
    conduitRequired: false,
    weatherProtection: false,
    pathType: 'ceiling'
  });

  // คำนวณผลรวมระบบสาย
  const systemReport = useMemo(() => {
    return generateCableReport(connections, devices);
  }, [connections, devices]);

  // คำนวณรายละเอียดการเชื่อมต่อที่เลือก
  const selectedConnectionResult = useMemo(() => {
    if (!selectedConnection) return null;
    
    const connection = connections.find(c => c.id === selectedConnection);
    if (!connection) return null;

    const fromDevice = devices.find(d => d.id === connection.fromDeviceId);
    const toDevice = devices.find(d => d.id === connection.toDeviceId);
    
    if (!fromDevice || !toDevice) return null;

    return calculateCablePath(fromDevice, toDevice, connection, calculationOptions);
  }, [selectedConnection, connections, devices, calculationOptions]);

  const updateOption = <K extends keyof PathCalculationOptions>(
    key: K, 
    value: PathCalculationOptions[K]
  ) => {
    setCalculationOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleExportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      project: 'CCTV System Cable Calculation',
      summary: systemReport,
      connections: connections.map(conn => {
        const fromDevice = devices.find(d => d.id === conn.fromDeviceId);
        const toDevice = devices.find(d => d.id === conn.toDeviceId);
        if (!fromDevice || !toDevice) return null;
        
        const result = calculateCablePath(fromDevice, toDevice, conn, calculationOptions);
        return {
          connection: conn,
          fromDevice: fromDevice.label,
          toDevice: toDevice.label,
          calculation: result
        };
      }).filter(Boolean)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cable-calculation-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            ระบบคำนวณระยะสายและท่อ
          </CardTitle>
          <CardDescription>
            คำนวณระยะทาง ค่าใช้จ่าย และความต้องการท่อสำหรับระบบ CCTV
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">สรุประบบ</TabsTrigger>
          <TabsTrigger value="calculator">คำนวณรายการ</TabsTrigger>
          <TabsTrigger value="conduits">ท่อและรางสาย</TabsTrigger>
          <TabsTrigger value="reports">รายงาน</TabsTrigger>
        </TabsList>

        {/* สรุประบบ */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Cable className="h-4 w-4" />
                  ความยาวสายรวม
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(systemReport.totalCableLength).map(([type, length]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm">{CABLE_SPECIFICATIONS[type]?.type || type}</span>
                      <Badge variant="outline">{length.toFixed(1)} m</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  ค่าใช้จ่ายประมาณการ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ฿{systemReport.totalCost.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  รวมสายและท่อทั้งหมด
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  จำนวนการเชื่อมต่อ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{connections.length}</div>
                <p className="text-xs text-muted-foreground">
                  การเชื่อมต่อทั้งหมด
                </p>
              </CardContent>
            </Card>
          </div>

          {systemReport.recommendations.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">ข้อแนะนำ:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {systemReport.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm">{rec}</li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* คำนวณรายการ */}
        <TabsContent value="calculator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* การตั้งค่า */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">การตั้งค่าการคำนวณ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="connection-select">เลือกการเชื่อมต่อ</Label>
                  <Select value={selectedConnection} onValueChange={setSelectedConnection}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกการเชื่อมต่อที่ต้องการคำนวณ" />
                    </SelectTrigger>
                    <SelectContent>
                      {connections.map(conn => {
                        const fromDevice = devices.find(d => d.id === conn.fromDeviceId);
                        const toDevice = devices.find(d => d.id === conn.toDeviceId);
                        return (
                          <SelectItem key={conn.id} value={conn.id}>
                            {fromDevice?.label} → {toDevice?.label} ({conn.cableType})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="include-slack">รวม Slack</Label>
                    <Switch
                      id="include-slack"
                      checked={calculationOptions.includeSlack}
                      onCheckedChange={(checked) => updateOption('includeSlack', checked)}
                    />
                  </div>

                  {calculationOptions.includeSlack && (
                    <div>
                      <Label htmlFor="slack-percentage">เปอร์เซ็นต์ Slack (%)</Label>
                      <Input
                        id="slack-percentage"
                        type="number"
                        value={calculationOptions.slackPercentage}
                        onChange={(e) => updateOption('slackPercentage', parseFloat(e.target.value) || 0)}
                        min="0"
                        max="50"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="ceiling-height">ความสูงเพดาน (เมตร)</Label>
                    <Input
                      id="ceiling-height"
                      type="number"
                      value={calculationOptions.ceilingHeight}
                      onChange={(e) => updateOption('ceilingHeight', parseFloat(e.target.value) || 3.0)}
                      min="2.5"
                      max="6.0"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="path-type">ประเภทเส้นทาง</Label>
                    <Select 
                      value={calculationOptions.pathType} 
                      onValueChange={(value: any) => updateOption('pathType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="direct">เส้นตรง</SelectItem>
                        <SelectItem value="ceiling">ผ่านเพดาน</SelectItem>
                        <SelectItem value="wall">ติดผนัง</SelectItem>
                        <SelectItem value="underground">ใต้ดิน</SelectItem>
                        <SelectItem value="mixed">แบบผสม</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="conduit-required">ต้องการท่อ</Label>
                    <Switch
                      id="conduit-required"
                      checked={calculationOptions.conduitRequired}
                      onCheckedChange={(checked) => updateOption('conduitRequired', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="weather-protection">ป้องกันสภาพอากาศ</Label>
                    <Switch
                      id="weather-protection"
                      checked={calculationOptions.weatherProtection}
                      onCheckedChange={(checked) => updateOption('weatherProtection', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ผลการคำนวณ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ผลการคำนวณ</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedConnectionResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">ระยะทางรวม</Label>
                        <div className="text-xl font-bold">
                          {selectedConnectionResult.totalLength.toFixed(1)} m
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">ค่าใช้จ่าย</Label>
                        <div className="text-xl font-bold">
                          ฿{selectedConnectionResult.estimatedCost.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm text-muted-foreground">เวลาติดตั้งประมาณการ</Label>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{selectedConnectionResult.installationTime.toFixed(1)} ชั่วโมง</span>
                      </div>
                    </div>

                    {selectedConnectionResult.segments.length > 0 && (
                      <div>
                        <Label className="text-sm text-muted-foreground">ส่วนของเส้นทาง</Label>
                        <div className="space-y-2 mt-1">
                          {selectedConnectionResult.segments.map((segment, index) => (
                            <div key={index} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                              <span>ส่วนที่ {index + 1} ({segment.type})</span>
                              <Badge variant="outline">{segment.length.toFixed(1)} m</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedConnectionResult.warnings.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            {selectedConnectionResult.warnings.map((warning, index) => (
                              <p key={index} className="text-sm">{warning}</p>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}

                    {selectedConnectionResult.recommendations.length > 0 && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="font-medium">ข้อแนะนำ:</p>
                            {selectedConnectionResult.recommendations.map((rec, index) => (
                              <p key={index} className="text-sm">• {rec}</p>
                            ))}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    เลือกการเชื่อมต่อเพื่อดูผลการคำนวณ
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ท่อและรางสาย */}
        <TabsContent value="conduits" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(CONDUIT_SPECIFICATIONS).map(([key, spec]) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{spec.type.toUpperCase()} - {spec.size}mm</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Fill Ratio:</span>
                    <span>{(spec.maxFillRatio * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ราคา/เมตร:</span>
                    <span>฿{spec.pricePerMeter}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>ความยาก:</span>
                    <Badge variant={
                      spec.installationDifficulty === 'easy' ? 'default' :
                      spec.installationDifficulty === 'medium' ? 'secondary' : 'destructive'
                    }>
                      {spec.installationDifficulty}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>กันฝน:</span>
                    <span>{spec.weatherResistant ? '✓' : '✗'}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {systemReport.conduitRequirements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>ความต้องการท่อในโครงการ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemReport.conduitRequirements.map((req, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">
                          {req.conduitType.type.toUpperCase()} - {req.conduitType.size}mm
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {req.length.toFixed(1)}m, {req.cableCount} สาย
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">฿{req.cost.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* รายงาน */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                รายงานระบบสาย
              </CardTitle>
              <CardDescription>
                สรุปรายงานการคำนวณระยะสายและค่าใช้จ่าย
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">รายงานรายละเอียด</h3>
                  <p className="text-sm text-muted-foreground">
                    ข้อมูลการคำนวณทั้งหมดในรูปแบบ JSON
                  </p>
                </div>
                <Button onClick={handleExportReport} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด
                </Button>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">สรุปสายเคเบิล</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(systemReport.totalCableLength).map(([type, length]) => {
                        const spec = CABLE_SPECIFICATIONS[type];
                        return (
                          <div key={type} className="flex justify-between items-center">
                            <span className="text-sm">{spec?.type || type}</span>
                            <div className="text-right">
                              <div className="text-sm font-medium">{length.toFixed(1)} m</div>
                              {spec && (
                                <div className="text-xs text-muted-foreground">
                                  ฿{(length * spec.pricePerMeter).toLocaleString()}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">สถิติโครงการ</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">การเชื่อมต่อทั้งหมด:</span>
                      <span className="font-medium">{connections.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">อุปกรณ์ทั้งหมด:</span>
                      <span className="font-medium">{devices.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">ค่าใช้จ่ายรวม:</span>
                      <span className="font-medium">฿{systemReport.totalCost.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
