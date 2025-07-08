'use client';
import type { AnyDevice } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface CameraPropertiesProps {
  device: AnyDevice;
  onUpdate: (device: AnyDevice) => void;
}

export function CameraProperties({ device, onUpdate }: CameraPropertiesProps) {
  const isPtz = device.type === 'cctv-ptz';

  const handleChange = (key: keyof AnyDevice, value: any) => {
    const numericFields = ['price', 'powerConsumption', 'rotation', 'fov', 'range', 'zoomLevel'];
    const finalValue = numericFields.includes(key as string) ? parseFloat(String(value)) || 0 : value;
    const updatedDevice = { ...device, [key]: finalValue };
    onUpdate(updatedDevice);
  };

  const handlePtzZoomChange = (zoomLevel: number) => {
    const baseFov = 120;
    const baseRange = 50;
    const newFov = baseFov / zoomLevel;
    const newRange = baseRange * zoomLevel;
    const updatedDevice = { 
        ...device, 
        zoomLevel,
        fov: newFov,
        range: newRange
    };
    onUpdate(updatedDevice);
  };
  
  const handleRotationChange = (value: number) => {
    // Ensure rotation stays within 0-360 range
    const newRotation = (value + 360) % 360;
    handleChange('rotation', newRotation);
  };

  return (
    <Accordion type="multiple" defaultValue={['general', 'specifics', 'placement']} className="w-full">
      <AccordionItem value="general">
        <AccordionTrigger>General</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          {/* General properties content */}
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="specifics">
        <AccordionTrigger>Camera Specifics</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          {/* Camera specifics content */}
          
          <div className="space-y-2">
            <Label>Rotation {isPtz && '(Pan)'} ({(Number(device.rotation) || 0).toFixed(0)}°)</Label>
            <div className="flex items-center space-x-2">
                <Slider 
                    value={[Number(device.rotation) || 0]} 
                    onValueChange={([val]) => handleRotationChange(val)} 
                    min={0} 
                    max={360} 
                    step={1}
                    className="flex-1"
                />
                <Input
                    type="number"
                    value={(Number(device.rotation) || 0).toFixed(0)}
                    onChange={(e) => handleRotationChange(parseInt(e.target.value))}
                    className="w-20"
                    min="0"
                    max="360"
                />
                <Button variant="outline" size="icon" onClick={() => handleRotationChange((device.rotation || 0) + 90)}>
                    <RotateCcw className="h-4 w-4" />
                </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="network">
        <AccordionTrigger>Network</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          {/* Network properties content */}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="placement">
        <AccordionTrigger>Placement</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          {/* Placement properties content */}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
