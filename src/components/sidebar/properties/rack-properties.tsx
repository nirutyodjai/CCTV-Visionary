import type { AnyDevice } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface RackPropertiesProps {
  device: AnyDevice;
  onUpdate: (device: AnyDevice) => void;
}

export function RackProperties({ device, onUpdate }: RackPropertiesProps) {
  const handleChange = (key: keyof AnyDevice, value: any) => {
    const numericFields = ['price', 'powerConsumption'];
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
        <AccordionTrigger>Rack Specifics</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
            <div className="space-y-2">
                <Label htmlFor="device-rack-size">Rack Size (U)</Label>
                <Input id="device-rack-size" value={device.rack_size || ''} onChange={(e) => handleChange('rack_size', e.target.value)} />
            </div>
            {device.type === 'rack-outdoor' && (
                 <div className="space-y-2">
                    <Label htmlFor="device-ip-rating">IP Rating</Label>
                    <Input id="device-ip-rating" value={device.ip_rating || ''} onChange={(e) => handleChange('ip_rating', e.target.value)} />
                </div>
            )}
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
