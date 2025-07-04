
import type { AnyDevice, RackContainer } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Cable, Warehouse } from 'lucide-react';

interface PropertiesPanelProps {
  selectedDevice: AnyDevice | null;
  onUpdateDevice: (device: AnyDevice) => void;
  onRemoveDevice: (deviceId: string) => void;
  onStartCabling: (deviceId: string) => void;
  onViewRack: (rack: RackContainer) => void;
}

export function PropertiesPanel({ selectedDevice, onUpdateDevice, onRemoveDevice, onStartCabling, onViewRack }: PropertiesPanelProps) {
  const handleChange = (key: keyof AnyDevice, value: any) => {
      if(selectedDevice){
        // For numeric fields, ensure the value is a number
        const numericFields = ['price', 'powerConsumption', 'rotation', 'fov', 'range', 'channels', 'ports'];
        const finalValue = numericFields.includes(key) ? parseFloat(value) || 0 : value;
        const updatedDevice = { ...selectedDevice, [key]: finalValue };
        onUpdateDevice(updatedDevice);
      }
  };

  const handleRemove = () => {
      if(selectedDevice) {
          onRemoveDevice(selectedDevice.id);
      }
  }

  const renderSpecificFields = () => {
    if (!selectedDevice) return null;

    const fields: {key: keyof AnyDevice, label: string, type?: string}[] = [];

    switch(selectedDevice.type) {
        case 'cctv-bullet':
        case 'cctv-dome':
        case 'cctv-ptz':
            fields.push({ key: 'resolution', label: 'Resolution' });
            fields.push({ key: 'fov', label: 'Field of View (°)', type: 'number' });
            fields.push({ key: 'range', label: 'Range (m)', type: 'number' });
            fields.push({ key: 'rotation', label: 'Rotation (°)', type: 'number' });
            break;
        case 'nvr':
            fields.push({ key: 'channels', label: 'Channels', type: 'number' });
            fields.push({ key: 'storage', label: 'Storage' });
            break;
        case 'switch':
            fields.push({ key: 'ports', label: 'Ports', type: 'number' });
            break;
        case 'rack-indoor':
        case 'rack-outdoor':
            fields.push({ key: 'rack_size', label: 'Rack Size (U)' });
            if (selectedDevice.type === 'rack-outdoor') {
                fields.push({ key: 'ip_rating', label: 'IP Rating' });
            }
            break;
    }

    if (fields.length === 0) return null;

    return (
        <AccordionItem value="specifics">
            <AccordionTrigger>Device Specifics</AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
                {fields.map(field => (
                     <div key={field.key} className="space-y-2">
                        <Label htmlFor={`device-${field.key}`}>{field.label}</Label>
                        <Input 
                            id={`device-${field.key}`}
                            type={field.type || 'text'}
                            value={selectedDevice[field.key] || ''} 
                            onChange={e => handleChange(field.key, e.target.value)} 
                        />
                    </div>
                ))}
            </AccordionContent>
        </AccordionItem>
    );
  }

  return (
    <div className="h-full flex flex-col">
       <div className="p-4 border-b border-border">
         <h2 className="text-lg font-semibold tracking-tight">Properties</h2>
         <p className="text-sm text-muted-foreground">
             {selectedDevice ? `Editing ${selectedDevice.label}` : 'Select a device to see its properties.'}
         </p>
      </div>

       {selectedDevice ? (
        <>
            <div className="flex-1 overflow-y-auto p-4">
                <Accordion type="multiple" defaultValue={['general', 'network', 'placement', 'specifics']} className="w-full">
                    <AccordionItem value="general">
                        <AccordionTrigger>General</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="device-label">Label</Label>
                                <Input id="device-label" value={selectedDevice.label} onChange={e => handleChange('label', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="device-price">Price (THB)</Label>
                                <Input id="device-price" type="number" value={selectedDevice.price || 0} onChange={e => handleChange('price', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="device-type">Device Type</Label>
                                <Input id="device-type" value={selectedDevice.type} disabled />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    {renderSpecificFields()}
                    <AccordionItem value="network">
                        <AccordionTrigger>Network</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="device-ip">IP Address</Label>
                                <Input id="device-ip" value={selectedDevice.ipAddress || ''} onChange={e => handleChange('ipAddress', e.target.value)} />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                     <AccordionItem value="placement">
                        <AccordionTrigger>Placement</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                             <div className="space-y-2">
                                <Label>Position (X, Y)</Label>
                                <div className="flex space-x-2">
                                    <Input value={selectedDevice.x.toFixed(3)} readOnly disabled />
                                    <Input value={selectedDevice.y.toFixed(3)} readOnly disabled />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            <div className="p-4 border-t border-border space-y-2">
                {selectedDevice.type.startsWith('rack') && (
                    <Button variant="outline" className="w-full" onClick={() => onViewRack(selectedDevice as RackContainer)}>
                        <Warehouse /> View Rack Elevation
                    </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => onStartCabling(selectedDevice.id)}>
                    <Cable /> Start Cabling
                </Button>
                <Button variant="destructive" className="w-full" onClick={handleRemove}>
                    <Trash2/> Delete Device
                </Button>
            </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-muted-foreground text-center">Select a device on the canvas to view and edit its properties here.</p>
        </div>
      )}
    </div>
  );
}
