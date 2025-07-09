'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Pipe, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  Plus,
  Minus,
  Zap,
  Shield,
  Ruler,
  DollarSign
} from 'lucide-react';

import { 
  CABLE_SPECIFICATIONS, 
  CONDUIT_SPECIFICATIONS,
  selectOptimalConduit,
  type CableSpecs,
  type ConduitSpecs
} from '@/lib/cable-calculation';

interface ConduitDesignerProps {
  onConduitSelect?: (conduit: ConduitSpecs, cables: CableSpecs[]) => void;
}

interface ConduitDesign {
  id: string;
  name: string;
  cables: { spec: CableSpecs; quantity: number }[];
  selectedConduit: ConduitSpecs | null;
  length: number;
}

export function ConduitDesigner({ onConduitSelect }: ConduitDesignerProps) {
  const [designs, setDesigns] = useState<ConduitDesign[]>([
    {
      id: '1',
      name: 'ท่อหลัก - ห้องเซิร์ฟเวอร์',
      cables: [],
      selectedConduit: null,
      length: 50
    }
  ]);
  
  const [activeDesignId, setActiveDesignId] = useState('1');
  const activeDesign = designs.find(d => d.id === activeDesignId);

  const addCableToDesign = (designId: string, cableType: string) => {
    setDesigns(prev => prev.map(design => {
      if (design.id !== designId) return design;
      
      const spec = CABLE_SPECIFICATIONS[cableType];
      if (!spec) return design;

      const existingCable = design.cables.find(c => c.spec.type === spec.type);
      if (existingCable) {
        return {
          ...design,
          cables: design.cables.map(c => 
            c.spec.type === spec.type 
              ? { ...c, quantity: c.quantity + 1 }
              : c
          )
        };
      }

      return {
        ...design,
        cables: [...design.cables, { spec, quantity: 1 }]
      };
    }));
  };

  const removeCableFromDesign = (designId: string, cableType: string) => {
    setDesigns(prev => prev.map(design => {
      if (design.id !== designId) return design;
      
      return {
        ...design,
        cables: design.cables.map(c => 
          c.spec.type === cableType && c.quantity > 1
            ? { ...c, quantity: c.quantity - 1 }
            : c
        ).filter(c => !(c.spec.type === cableType && c.quantity <= 1))
      };
    }));
  };

  const updateDesignLength = (designId: string, length: number) => {
    setDesigns(prev => prev.map(design => 
      design.id === designId ? { ...design, length } : design
    ));
  };

  const calculateOptimalConduit = (design: ConduitDesign) => {
    if (design.cables.length === 0) return null;
    
    const allCables = design.cables.flatMap(c => 
      Array(c.quantity).fill(c.spec)
    );
    
    return selectOptimalConduit(allCables);
  };

  const calculateFillRatio = (design: ConduitDesign, conduit: ConduitSpecs) => {
    const totalCableArea = design.cables.reduce((sum, cable) => {
      const radius = cable.spec.diameter / 2;
      const area = Math.PI * radius * radius;
      return sum + (area * cable.quantity);
    }, 0);

    const conduitArea = Math.PI * (conduit.size / 2) * (conduit.size / 2);
    return totalCableArea / conduitArea;
  };

  const calculateCost = (design: ConduitDesign) => {
    const cableCost = design.cables.reduce((sum, cable) => {
      return sum + (cable.spec.pricePerMeter * cable.quantity * design.length);
    }, 0);

    const optimalConduit = calculateOptimalConduit(design);
    const conduitCost = optimalConduit ? optimalConduit.pricePerMeter * design.length : 0;

    return { cableCost, conduitCost, total: cableCost + conduitCost };
  };

  const addNewDesign = () => {
    const newId = (designs.length + 1).toString();
    const newDesign: ConduitDesign = {
      id: newId,
      name: `ท่อใหม่ ${newId}`,
      cables: [],
      selectedConduit: null,
      length: 30
    };
    setDesigns(prev => [...prev, newDesign]);
    setActiveDesignId(newId);
  };

  const removeDesign = (designId: string) => {
    if (designs.length <= 1) return;
    setDesigns(prev => prev.filter(d => d.id !== designId));
    if (activeDesignId === designId) {
      setActiveDesignId(designs[0].id);
    }
  };

  if (!activeDesign) return null;

  const optimalConduit = calculateOptimalConduit(activeDesign);
  const cost = calculateCost(activeDesign);
  const fillRatio = optimalConduit ? calculateFillRatio(activeDesign, optimalConduit) : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pipe className="h-5 w-5" />
            ระบบออกแบบท่อและรางสาย
          </CardTitle>
          <CardDescription>
            ออกแบบและคำนวณท่อสำหรับเส้นทางสาย CCTV และเครือข่าย
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="designer" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="designer">ออกแบบท่อ</TabsTrigger>
          <TabsTrigger value="calculator">คำนวณ</TabsTrigger>
          <TabsTrigger value="comparison">เปรียบเทียบ</TabsTrigger>
        </TabsList>

        {/* ออกแบบท่อ */}
        <TabsContent value="designer" className="space-y-4">
          <div className="flex items-center gap-4">
            <Select value={activeDesignId} onValueChange={setActiveDesignId}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {designs.map(design => (
                  <SelectItem key={design.id} value={design.id}>
                    {design.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addNewDesign} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
            {designs.length > 1 && (
              <Button 
                onClick={() => removeDesign(activeDesignId)} 
                size="sm" 
                variant="outline"
              >
                <Minus className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* การเลือกสาย */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">เลือกสายเคเบิล</CardTitle>
                <CardDescription>เพิ่มสายเคเบิลที่ต้องการใส่ในท่อ</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cable-length">ความยาวท่อ (เมตร)</Label>
                  <Input
                    id="cable-length"
                    type="number"
                    value={activeDesign.length}
                    onChange={(e) => updateDesignLength(activeDesignId, parseFloat(e.target.value) || 0)}
                    min="1"
                    max="1000"
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>เพิ่มสายเคเบิล</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(CABLE_SPECIFICATIONS).map(([key, spec]) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => addCableToDesign(activeDesignId, key)}
                        className="justify-start text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        {spec.type}
                      </Button>
                    ))}
                  </div>
                </div>

                {activeDesign.cables.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label>สายที่เลือก</Label>
                      {activeDesign.cables.map((cable, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{cable.quantity}x</Badge>
                            <span className="text-sm">{cable.spec.type}</span>
                            <span className="text-xs text-muted-foreground">
                              Ø{cable.spec.diameter}mm
                            </span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeCableFromDesign(activeDesignId, cable.spec.type)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* ผลการคำนวณ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ผลการคำนวณ</CardTitle>
                <CardDescription>ท่อที่แนะนำและข้อมูลการติดตั้ง</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {optimalConduit ? (
                  <>
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">ท่อที่แนะนำ</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p><strong>{optimalConduit.type.toUpperCase()}</strong> - {optimalConduit.size}mm</p>
                        <p>Fill Ratio: {(fillRatio * 100).toFixed(1)}% / {(optimalConduit.maxFillRatio * 100)}%</p>
                        <p>ความยาก: {optimalConduit.installationDifficulty}</p>
                        <p>กันฝน: {optimalConduit.weatherResistant ? 'ใช่' : 'ไม่'}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Ruler className="h-4 w-4" />
                        <Label>Fill Ratio</Label>
                      </div>
                      <Progress value={fillRatio * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {(fillRatio * 100).toFixed(1)}% ของ {(optimalConduit.maxFillRatio * 100)}% ที่อนุญาต
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">ค่าสาย</Label>
                        <div className="font-medium">฿{cost.cableCost.toLocaleString()}</div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">ค่าท่อ</Label>
                        <div className="font-medium">฿{cost.conduitCost.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">ค่าใช้จ่ายรวม: ฿{cost.total.toLocaleString()}</span>
                      </div>
                    </div>

                    {fillRatio > 0.8 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Fill ratio สูง ({(fillRatio * 100).toFixed(1)}%) อาจทำให้การดึงสายยาก
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    เพิ่มสายเคเบิลเพื่อดูคำแนะนำท่อ
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* คำนวณ */}
        <TabsContent value="calculator" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(CONDUIT_SPECIFICATIONS).map(([key, conduit]) => (
              <Card key={key} className="relative">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Pipe className="h-4 w-4" />
                    {conduit.type.toUpperCase()} - {conduit.size}mm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Ruler className="h-3 w-3" />
                      <span>Fill: {(conduit.maxFillRatio * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span>฿{conduit.pricePerMeter}/m</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      <span>{conduit.installationDifficulty}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      <span>{conduit.weatherResistant ? 'กันฝน' : 'ในร่ม'}</span>
                    </div>
                  </div>
                  
                  {activeDesign.cables.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground">
                        Fill ratio: {(calculateFillRatio(activeDesign, conduit) * 100).toFixed(1)}%
                      </div>
                      <Progress 
                        value={calculateFillRatio(activeDesign, conduit) * 100} 
                        className="h-1 mt-1"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* เปรียบเทียบ */}
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>เปรียบเทียบท่อทั้งหมด</CardTitle>
              <CardDescription>
                เปรียบเทียบข้อมูลท่อแต่ละประเภทสำหรับการใช้งาน
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ประเภท</th>
                      <th className="text-center p-2">ขนาด (mm)</th>
                      <th className="text-center p-2">Fill Ratio</th>
                      <th className="text-center p-2">ราคา/เมตร</th>
                      <th className="text-center p-2">ความยาก</th>
                      <th className="text-center p-2">กันฝน</th>
                      <th className="text-center p-2">เหมาะสำหรับ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(CONDUIT_SPECIFICATIONS).map(([key, conduit]) => (
                      <tr key={key} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{conduit.type.toUpperCase()}</td>
                        <td className="text-center p-2">{conduit.size}</td>
                        <td className="text-center p-2">{(conduit.maxFillRatio * 100)}%</td>
                        <td className="text-center p-2">฿{conduit.pricePerMeter}</td>
                        <td className="text-center p-2">
                          <Badge variant={
                            conduit.installationDifficulty === 'easy' ? 'default' :
                            conduit.installationDifficulty === 'medium' ? 'secondary' : 'destructive'
                          }>
                            {conduit.installationDifficulty}
                          </Badge>
                        </td>
                        <td className="text-center p-2">
                          {conduit.weatherResistant ? '✓' : '✗'}
                        </td>
                        <td className="text-center p-2 text-xs">
                          {conduit.type === 'pvc' && 'งานทั่วไป, กลางแจ้ง'}
                          {conduit.type === 'flex' && 'งานยืดหยุน, ภายใน'}
                          {conduit.type === 'cable-tray' && 'Data Center, สายจำนวนมาก'}
                          {conduit.type === 'steel' && 'งานหนัก, ปลอดภัยสูง'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
