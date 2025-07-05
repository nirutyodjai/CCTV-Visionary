import type { AnyDevice } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface NetworkDevicePropertiesProps {
  device: AnyDevice;
  onUpdate: (device: AnyDevice) => void;
}

export function NetworkDeviceProperties({ device, onUpdate }: NetworkDevicePropertiesProps) {
  const handleChange = (key: keyof AnyDevice, value: any) => {
    const numericFields = ['price', 'powerConsumption', 'channels', 'ports'];
    const finalValue = numericFields.includes(key) ? parseFloat(value) || 0 : value;
    const updatedDevice = { ...device, [key]: finalValue };
    onUpdate(updatedDevice);
  };

  const renderDeviceSpecifics = () => {
    const fields = [];
    if (device.type === 'nvr') {
        fields.push({ key: 'channels', label: 'Channels', type: 'number' });
        fields.push({ key: 'storage', label: 'Storage (TB)', type: 'number' });
    } else if (device.type === 'switch') {
        fields.push({ key: 'ports', label: 'Ports', type: 'number' });
    } else {
        return null;
    }

    return (
        <AccordionItem value="specifics">
            <AccordionTrigger>Device Specifics</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
            {fields.map((field) => (
                <div key={field.key} className="space-y-2">
                    <Label htmlFor={`device-${field.key}`}>{field.label}</Label>
                    <Input
                        id={`device-${field.key}`}
                        type={field.type || 'text'}
                        value={device[field.key as keyof AnyDevice] as any || ''}
                        onChange={(e) => handleChange(field.key as keyof AnyDevice, e.target.value)}
                    />
                </div>
            ))}
            </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={['general', 'specifics', 'network', 'placement']} className="w-full">
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
      
      {renderDeviceSpecifics()}
      
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
