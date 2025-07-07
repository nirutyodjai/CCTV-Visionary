'use client';

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
    const numericFields = ['price', 'powerConsumption', 'channels', 'ports', 'uHeight'];
    const finalValue = numericFields.includes(key as string) ? parseFloat(String(value)) || 0 : value;
    const updatedDevice = { ...device, [key]: finalValue };
    onUpdate(updatedDevice);
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="basic">
        <AccordionTrigger>Basic Properties</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Device ID</Label>
            <Input value={device.id} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label>Device Label</Label>
            <Input 
              value={device.label} 
              onChange={(e) => handleChange('label', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Input value={device.type} readOnly disabled />
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="network">
        <AccordionTrigger>Network Configuration</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>IP Address</Label>
            <Input 
              value={device.ipAddress || ''} 
              onChange={(e) => handleChange('ipAddress', e.target.value)}
              placeholder="192.168.1.100"
            />
          </div>
          <div className="space-y-2">
            <Label>VLAN ID</Label>
            <Input 
              type="number"
              value={device.vlanId || ''} 
              onChange={(e) => handleChange('vlanId', parseInt(e.target.value) || 0)}
              placeholder="10"
            />
          </div>
          {device.type === 'switch' && (
            <div className="space-y-2">
              <Label>Ports</Label>
              <Input 
                type="number"
                value={device.ports || ''} 
                onChange={(e) => handleChange('ports', parseInt(e.target.value) || 0)}
                placeholder="24"
              />
            </div>
          )}
          {device.type === 'nvr' && (
            <div className="space-y-2">
              <Label>Channels</Label>
              <Input 
                type="number"
                value={device.channels || ''} 
                onChange={(e) => handleChange('channels', parseInt(e.target.value) || 0)}
                placeholder="16"
              />
            </div>
          )}
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="physical">
        <AccordionTrigger>Physical Properties</AccordionTrigger>
        <AccordionContent className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Price (THB)</Label>
            <Input 
              type="number"
              value={device.price || ''} 
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              placeholder="5000"
            />
          </div>
          <div className="space-y-2">
            <Label>Power Consumption (Watts)</Label>
            <Input 
              type="number"
              value={device.powerConsumption || ''} 
              onChange={(e) => handleChange('powerConsumption', parseFloat(e.target.value) || 0)}
              placeholder="25"
            />
          </div>
          {(device.type === 'nvr' || device.type === 'switch') && (
            <div className="space-y-2">
              <Label>Rack Height (U)</Label>
              <Input 
                type="number"
                value={device.uHeight || ''} 
                onChange={(e) => handleChange('uHeight', parseInt(e.target.value) || 0)}
                placeholder="1"
              />
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
