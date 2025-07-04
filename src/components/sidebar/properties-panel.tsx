
import type { AnyDevice } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  selectedDevice: AnyDevice | null;
  onUpdateDevice: (device: AnyDevice) => void;
  onRemoveDevice: (deviceId: string) => void;
}

export function PropertiesPanel({ selectedDevice, onUpdateDevice, onRemoveDevice }: PropertiesPanelProps) {
  const handleChange = (key: keyof AnyDevice, value: any) => {
      if(selectedDevice){
        const updatedDevice = { ...selectedDevice, [key]: value };
        onUpdateDevice(updatedDevice);
      }
  };

  const handleRemove = () => {
      if(selectedDevice) {
          onRemoveDevice(selectedDevice.id);
      }
  }

  return (
    <div className="h-full flex flex-col">
       <div className="p-4 border-b border-sidebar-border">
         <h2 className="text-lg font-semibold tracking-tight">Properties</h2>
         <p className="text-sm text-muted-foreground">
             {selectedDevice ? `Editing ${selectedDevice.label}` : 'Select a device to see its properties.'}
         </p>
      </div>

       {selectedDevice && (
        <>
            <div className="flex-1 overflow-y-auto p-4">
                <Accordion type="multiple" defaultValue={['general', 'network', 'placement']} className="w-full">
                    <AccordionItem value="general">
                        <AccordionTrigger>General</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="device-label">Label</Label>
                                <Input 
                                id="device-label" 
                                value={selectedDevice.label} 
                                onChange={e => handleChange('label', e.target.value)} 
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="device-type">Device Type</Label>
                                <Input id="device-type" value={selectedDevice.type} disabled />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="network">
                        <AccordionTrigger>Network</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="device-ip">IP Address</Label>
                                <Input 
                                    id="device-ip" 
                                    value={selectedDevice.ipAddress || ''} 
                                    onChange={e => handleChange('ipAddress', e.target.value)} 
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="placement">
                        <AccordionTrigger>Placement</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            {selectedDevice.type.startsWith('cctv') && (
                                <div className="space-y-2">
                                    <Label htmlFor="device-rotation">Rotation (°)</Label>
                                    <Input 
                                    id="device-rotation" 
                                    type="number"
                                    value={selectedDevice.rotation || 0} 
                                    onChange={e => handleChange('rotation', parseInt(e.target.value, 10))} 
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label>Position (X, Y)</Label>
                                <div className="flex space-x-2">
                                    <Input id="device-pos-x" value={selectedDevice.x.toFixed(3)} readOnly disabled />
                                    <Input id="device-pos-y" value={selectedDevice.y.toFixed(3)} readOnly disabled />
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
            <div className="p-4 border-t border-sidebar-border">
                <Button variant="destructive" className="w-full" onClick={handleRemove}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Device
                </Button>
            </div>
        </>
      )}
    </div>
  );
}
