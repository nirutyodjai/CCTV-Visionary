import type { AnyDevice } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CameraPropertiesProps {
  device: AnyDevice;
  onUpdate: (device: AnyDevice) => void;
}

export function CameraProperties({ device, onUpdate }: CameraPropertiesProps) {
  const handleChange = (key: keyof AnyDevice, value: any) => {
    const numericFields = ['price', 'powerConsumption', 'rotation', 'fov', 'range'];
    const finalValue = numericFields.includes(key) ? parseFloat(value) || 0 : value;
    const updatedDevice = { ...device, [key]: finalValue };
    onUpdate(updatedDevice);
  };

  return (
    <Accordion type="multiple" defaultValue={['general', 'specifics', 'placement']} className="w-full">
      <AccordionItem value="general">
        <AccordionTrigger>General</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="device-label">Label</Label>
            <Input id="device-label" value={device.label} onChange={e => handleChange('label', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="device-price">Price (THB)</Label>
            <Input id="device-price" type="number" value={device.price || 0} onChange={e => handleChange('price', e.target.value)} />
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="specifics">
        <AccordionTrigger>Camera Specifics</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="device-resolution">Resolution</Label>
            <Select value={String(device.resolution || '')} onValueChange={(val) => handleChange('resolution', val)}>
              <SelectTrigger id="device-resolution"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {['720p', '1080p', '2K', '4K'].map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Field of View ({(Number(device.fov) || 0).toFixed(0)}°)</Label>
            <Slider value={[Number(device.fov) || 0]} onValueChange={([val]) => handleChange('fov', val)} min={10} max={180} step={1} />
          </div>
          <div className="space-y-2">
            <Label>Range ({(Number(device.range) || 0).toFixed(0)} m.)</Label>
            <Slider value={[Number(device.range) || 0]} onValueChange={([val]) => handleChange('range', val)} min={1} max={100} step={1} />
          </div>
          <div className="space-y-2">
            <Label>Rotation ({(Number(device.rotation) || 0).toFixed(0)}°)</Label>
            <Slider value={[Number(device.rotation) || 0]} onValueChange={([val]) => handleChange('rotation', val)} min={0} max={360} step={1} />
          </div>
        </AccordionContent>
      </AccordionItem>
      
       <AccordionItem value="network">
        <AccordionTrigger>Network</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
                <Label htmlFor="device-ip">IP Address</Label>
                <Input id="device-ip" value={device.ipAddress || ''} onChange={e => handleChange('ipAddress', e.target.value)} />
            </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="placement">
        <AccordionTrigger>Placement</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Position (X, Y)</Label>
            <div className="flex space-x-2">
              <Input value={device.x.toFixed(3)} readOnly disabled />
              <Input value={device.y.toFixed(3)} readOnly disabled />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
