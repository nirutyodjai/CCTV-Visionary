
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Camera, 
  Network, 
  Cable, 
  Info,
  Power,
  Wifi,
  Monitor,
  HardDrive
} from 'lucide-react';
interface SelectedDevice {
  id: string;
  type: 'camera' | 'nvr' | 'switch' | 'router' | 'cable';
  name: string;
  model?: string;
  position: { x: number; y: number };
  properties: Record<string, any>;
}

interface PropertiesPanelProps {
  selectedDevice?: SelectedDevice | null;
  onDeviceUpdate?: (deviceId: string, updates: Partial<SelectedDevice>) => void;
}

export function PropertiesPanel({ 
  selectedDevice, 
  onDeviceUpdate 
}: PropertiesPanelProps) {
  const [localProperties, setLocalProperties] = useState(selectedDevice?.properties || {});

  const handlePropertyChange = (key: string, value: any) => {
    const newProperties = { ...localProperties, [key]: value };
    setLocalProperties(newProperties);
    
    if (selectedDevice) {
      onDeviceUpdate?.(selectedDevice.id, { properties: newProperties });
    }
  };

  const handleBasicInfoChange = (field: string, value: any) => {
    if (selectedDevice) {
      onDeviceUpdate?.(selectedDevice.id, { [field]: value });
    }
  };

  if (!selectedDevice) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Settings className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-sm">เลือกอุปกรณ์เพื่อดูคุณสมบัติ</p>
      </div>
    );
  }

  const getDeviceIcon = () => {
    switch (selectedDevice.type) {
      case 'camera': return <Camera className="w-5 h-5 text-red-500" />;
      case 'nvr': return <HardDrive className="w-5 h-5 text-blue-500" />;
      case 'switch': return <Network className="w-5 h-5 text-green-500" />;
      case 'router': return <Wifi className="w-5 h-5 text-purple-500" />;
      case 'cable': return <Cable className="w-5 h-5 text-orange-500" />;
      default: return <Settings className="w-5 h-5 text-gray-500" />;
    }
  };

  const getDeviceTypeName = () => {
    const typeNames = {
      camera: 'กล้อง CCTV',
      nvr: 'เครื่องบันทึก NVR',
      switch: 'สวิตช์เครือข่าย',
      router: 'เราเตอร์',
      cable: 'สายเคเบิล'
    };
    return typeNames[selectedDevice.type] || 'อุปกรณ์';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Device Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          {getDeviceIcon()}
          คุณสมบัติอุปกรณ์
        </h3>
        <Badge variant="secondary">{getDeviceTypeName()}</Badge>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">ข้อมูลพื้นฐาน</TabsTrigger>
          <TabsTrigger value="technical">ข้อมูลเทคนิค</TabsTrigger>
          <TabsTrigger value="network">เครือข่าย</TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Info className="w-4 h-4" />
                ข้อมูลทั่วไป
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="device-name">ชื่ออุปกรณ์</Label>
                <Input
                  id="device-name"
                  value={selectedDevice.name}
                  onChange={(e) => handleBasicInfoChange('name', e.target.value)}
                  placeholder="ระบุชื่ออุปกรณ์"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="device-model">รุ่น/Model</Label>
                <Input
                  id="device-model"
                  value={selectedDevice.model || ''}
                  onChange={(e) => handleBasicInfoChange('model', e.target.value)}
                  placeholder="ระบุรุ่นอุปกรณ์"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="device-description">รายละเอียด</Label>
                <Textarea
                  id="device-description"
                  value={localProperties.description || ''}
                  onChange={(e) => handlePropertyChange('description', e.target.value)}
                  placeholder="รายละเอียดเพิ่มเติม"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ตำแหน่ง X</Label>
                  <Input
                    type="number"
                    value={selectedDevice.position.x}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ตำแหน่ง Y</Label>
                  <Input
                    type="number"
                    value={selectedDevice.position.y}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technical Specifications Tab */}
        <TabsContent value="technical" className="space-y-4">
          {selectedDevice.type === 'camera' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  ข้อมูลกล้อง
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ความละเอียด</Label>
                  <Select
                    value={localProperties.resolution || '1080p'}
                    onValueChange={(value) => handlePropertyChange('resolution', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="720p">720p HD</SelectItem>
                      <SelectItem value="1080p">1080p Full HD</SelectItem>
                      <SelectItem value="4k">4K Ultra HD</SelectItem>
                      <SelectItem value="8k">8K</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ชนิดกล้อง</Label>
                  <Select
                    value={localProperties.cameraType || 'ip'}
                    onValueChange={(value) => handlePropertyChange('cameraType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ip">IP Camera</SelectItem>
                      <SelectItem value="analog">Analog Camera</SelectItem>
                      <SelectItem value="thermal">Thermal Camera</SelectItem>
                      <SelectItem value="ptz">PTZ Camera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="night-vision">Night Vision</Label>
                  <Switch
                    id="night-vision"
                    checked={localProperties.nightVision || false}
                    onCheckedChange={(checked) => handlePropertyChange('nightVision', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="motion-detection">Motion Detection</Label>
                  <Switch
                    id="motion-detection"
                    checked={localProperties.motionDetection || false}
                    onCheckedChange={(checked) => handlePropertyChange('motionDetection', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {(selectedDevice.type === 'nvr' || selectedDevice.type === 'switch') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  ข้อมูลเครือข่าย
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>จำนวนพอร์ต</Label>
                  <Select
                    value={localProperties.ports?.toString() || '8'}
                    onValueChange={(value) => handlePropertyChange('ports', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 Ports</SelectItem>
                      <SelectItem value="8">8 Ports</SelectItem>
                      <SelectItem value="16">16 Ports</SelectItem>
                      <SelectItem value="24">24 Ports</SelectItem>
                      <SelectItem value="32">32 Ports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="poe-support">PoE Support</Label>
                  <Switch
                    id="poe-support"
                    checked={localProperties.poeSupport || false}
                    onCheckedChange={(checked) => handlePropertyChange('poeSupport', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Network Configuration Tab */}
        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Network className="w-4 h-4" />
                การตั้งค่าเครือข่าย
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ip-address">IP Address</Label>
                <Input
                  id="ip-address"
                  value={localProperties.ipAddress || ''}
                  onChange={(e) => handlePropertyChange('ipAddress', e.target.value)}
                  placeholder="192.168.1.100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subnet-mask">Subnet Mask</Label>
                <Input
                  id="subnet-mask"
                  value={localProperties.subnetMask || ''}
                  onChange={(e) => handlePropertyChange('subnetMask', e.target.value)}
                  placeholder="255.255.255.0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gateway">Gateway</Label>
                <Input
                  id="gateway"
                  value={localProperties.gateway || ''}
                  onChange={(e) => handlePropertyChange('gateway', e.target.value)}
                  placeholder="192.168.1.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dns">DNS Server</Label>
                <Input
                  id="dns"
                  value={localProperties.dns || ''}
                  onChange={(e) => handlePropertyChange('dns', e.target.value)}
                  placeholder="8.8.8.8"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="dhcp">DHCP</Label>
                <Switch
                  id="dhcp"
                  checked={localProperties.dhcp || false}
                  onCheckedChange={(checked) => handlePropertyChange('dhcp', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" size="sm" className="flex-1">
          รีเซ็ต
        </Button>
        <Button size="sm" className="flex-1">
          บันทึก
        </Button>
      </div>
    </div>
  );
}
