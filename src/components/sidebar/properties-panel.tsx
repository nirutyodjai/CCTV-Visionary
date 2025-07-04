'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import type { Device } from '@/lib/types';
import { Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  selectedDevice: Device | null;
  onUpdateDevice: (updatedDevice: Device) => void;
  onDeleteDevice: (deviceId: string) => void;
}

export function PropertiesPanel({ selectedDevice, onUpdateDevice, onDeleteDevice }: PropertiesPanelProps) {
  if (!selectedDevice) {
    return null;
  }

  const handleUpdate = (prop: keyof Device, value: any) => {
    onUpdateDevice({ ...selectedDevice, [prop]: value });
  };
  
  const renderCommonProperties = () => (
    <div className="space-y-2">
      <Label htmlFor="label">ป้ายกำกับ</Label>
      <Input id="label" value={selectedDevice.label} onChange={(e) => handleUpdate('label', e.target.value)} />
    </div>
  );

  const renderCctvProperties = () => (
    <>
      <div className="space-y-2">
        <Label>ความละเอียด</Label>
        <Select value={selectedDevice.resolution} onValueChange={(val) => handleUpdate('resolution', val)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1080p">1080p</SelectItem>
            <SelectItem value="4MP">4MP</SelectItem>
            <SelectItem value="4K">4K</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>มุมมองภาพ ({selectedDevice.fov}°)</Label>
        <Slider value={[selectedDevice.fov || 90]} onValueChange={([val]) => handleUpdate('fov', val)} min={10} max={180} step={1} />
      </div>
      <div className="space-y-2">
        <Label>ระยะ ({selectedDevice.range}m)</Label>
        <Slider value={[selectedDevice.range || 20]} onValueChange={([val]) => handleUpdate('range', val)} min={0} max={50} step={1} />
      </div>
       <div className="space-y-2">
        <Label>การหมุน ({selectedDevice.rotation}°)</Label>
        <Slider value={[selectedDevice.rotation || 0]} onValueChange={([val]) => handleUpdate('rotation', val)} min={0} max={360} step={1} />
      </div>
    </>
  );
  
  const renderWifiProperties = () => (
     <div className="space-y-2">
        <Label>รัศมีครอบคลุม ({selectedDevice.range}m)</Label>
        <Slider value={[selectedDevice.range || 15]} onValueChange={([val]) => handleUpdate('range', val)} min={0} max={30} step={1} />
      </div>
  );
  
  const renderNvrProperties = () => (
    <>
      <div className="space-y-2">
        <Label>จำนวนช่อง</Label>
        <Select value={String(selectedDevice.channels)} onValueChange={(val) => handleUpdate('channels', parseInt(val))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="4">4</SelectItem>
            <SelectItem value="8">8</SelectItem>
            <SelectItem value="16">16</SelectItem>
            <SelectItem value="32">32</SelectItem>
          </SelectContent>
        </Select>
      </div>
       <div className="space-y-2">
        <Label>ความจุ</Label>
        <Select value={selectedDevice.storage} onValueChange={(val) => handleUpdate('storage', val)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1TB">1TB</SelectItem>
            <SelectItem value="2TB">2TB</SelectItem>
            <SelectItem value="4TB">4TB</SelectItem>
            <SelectItem value="8TB">8TB</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">คุณสมบัติอุปกรณ์</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm space-y-4">
        {renderCommonProperties()}
        {selectedDevice.type.startsWith('cctv-') && renderCctvProperties()}
        {selectedDevice.type === 'wifi-ap' && renderWifiProperties()}
        {selectedDevice.type === 'nvr' && renderNvrProperties()}
        {/* Add other device types here */}
        <Button variant="destructive" className="w-full" onClick={() => onDeleteDevice(selectedDevice.id)}>
            <Trash2 className="w-4 h-4 mr-2" />
            ลบอุปกรณ์
        </Button>
      </CardContent>
    </Card>
  );
}
