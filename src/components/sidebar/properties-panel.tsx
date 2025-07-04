

import type { AnyDevice, RackContainer, SelectableItem, ArchitecturalElementType, ArchitecturalElement, Shadow } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Cable, Warehouse } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface PropertiesPanelProps {
  selectedItem: SelectableItem | null;
  onUpdateDevice: (device: AnyDevice) => void;
  onRemoveDevice: (deviceId: string) => void;
  onStartCabling: (deviceId: string) => void;
  onViewRack: (rack: RackContainer) => void;
  onRemoveArchElement: (elementId: string) => void;
  onUpdateArchElement: (element: ArchitecturalElement) => void;
}

const ARCH_ELEMENT_NAMES: Record<ArchitecturalElementType, string> = {
    'wall': 'Wall',
    'door': 'Door',
    'window': 'Window',
    'table': 'Table',
    'chair': 'Chair',
    'elevator': 'Elevator',
    'fire-escape': 'Fire Escape',
    'shaft': 'Shaft',
    'tree': 'Tree',
    'motorcycle': 'Motorcycle',
    'car': 'Car',
    'supercar': 'Supercar',
    'area': 'Area'
};


export function PropertiesPanel({ selectedItem, onUpdateDevice, onRemoveDevice, onStartCabling, onViewRack, onRemoveArchElement, onUpdateArchElement }: PropertiesPanelProps) {
  
  if (!selectedItem) {
    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold tracking-tight">Properties</h2>
                <p className="text-sm text-muted-foreground">Select an item to see its properties.</p>
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-muted-foreground text-center">Select an item on the canvas to view and edit its properties here.</p>
            </div>
        </div>
    )
  }

  // A device will have a `label`, an architectural element will not. This is a safer check.
  const isDevice = 'label' in selectedItem;
  const selectedDevice = isDevice ? selectedItem as AnyDevice : null;
  const selectedArchElement = !isDevice ? selectedItem as ArchitecturalElement : null;

  const handleChange = (key: keyof AnyDevice, value: any) => {
      if(selectedDevice){
        const numericFields = ['price', 'powerConsumption', 'rotation', 'fov', 'range', 'channels', 'ports'];
        const finalValue = numericFields.includes(key) ? parseFloat(value) || 0 : value;
        const updatedDevice = { ...selectedDevice, [key]: finalValue };
        onUpdateDevice(updatedDevice);
      }
  };
  
  const handleArchChange = (key: string, value: any) => {
    if(selectedArchElement){
        if (key.startsWith('shadow.')) {
            const shadowKey = key.split('.')[1];
            const updatedElement = {
                ...selectedArchElement,
                shadow: {
                    ...(selectedArchElement.shadow || {}),
                    [shadowKey]: value,
                }
            };
            onUpdateArchElement(updatedElement);
        } else {
            const updatedElement = { ...selectedArchElement, [key]: value };
            onUpdateArchElement(updatedElement);
        }
    }
  };

  const getSelectedItemName = () => {
      if (isDevice && selectedDevice) {
        return `Editing ${selectedDevice.label}`;
      }
      if (selectedArchElement) {
        return `Editing ${ARCH_ELEMENT_NAMES[selectedArchElement.type] || 'Element'}`;
      }
      return 'Select an item'; // Fallback
  }
  
  const renderDeviceSpecificFields = () => {
    if (!selectedDevice) return null;

    const fields: {
      key: keyof AnyDevice;
      label: string;
      type?: 'text' | 'number' | 'slider' | 'select';
      min?: number;
      max?: number;
      step?: number;
      options?: string[];
    }[] = [];

    switch (selectedDevice.type) {
      case 'cctv-bullet':
      case 'cctv-dome':
      case 'cctv-ptz':
        fields.push({
          key: 'resolution',
          label: 'ความละเอียด',
          type: 'select',
          options: ['720p', '1080p', '2K', '4K'],
        });
        fields.push({
          key: 'fov',
          label: `มุมมองภาพ (${(Number(selectedDevice.fov) || 0).toFixed(0)}°)`,
          type: 'slider',
          min: 10,
          max: 180,
          step: 1,
        });
        fields.push({
          key: 'range',
          label: `ระยะ (${(Number(selectedDevice.range) || 0).toFixed(0)} ม.)`,
          type: 'slider',
          min: 1,
          max: 100,
          step: 1,
        });
        fields.push({
          key: 'rotation',
          label: `การหมุน (${(Number(selectedDevice.rotation) || 0).toFixed(0)}°)`,
          type: 'slider',
          min: 0,
          max: 360,
          step: 1,
        });
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
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <Label htmlFor={`device-${field.key}`}>{field.label}</Label>
              {field.type === 'slider' ? (
                <Slider
                  id={`device-${field.key}`}
                  value={[Number(selectedDevice[field.key]) || 0]}
                  onValueChange={([val]) => handleChange(field.key, val)}
                  min={field.min}
                  max={field.max}
                  step={field.step}
                />
              ) : field.type === 'select' ? (
                <Select
                  value={String(selectedDevice[field.key] || '')}
                  onValueChange={(val) => handleChange(field.key, val)}
                >
                  <SelectTrigger id={`device-${field.key}`}>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={`device-${field.key}`}
                  type={field.type || 'text'}
                  value={selectedDevice[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="h-full flex flex-col">
       <div className="p-4 border-b border-border">
         <h2 className="text-lg font-semibold tracking-tight">Properties</h2>
         <p className="text-sm text-muted-foreground">
             {getSelectedItemName()}
         </p>
      </div>
      
       {isDevice && selectedDevice ? (
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
                    {renderDeviceSpecificFields()}
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
                <Button variant="destructive" className="w-full" onClick={() => onRemoveDevice(selectedDevice.id)}>
                    <Trash2/> Delete Device
                </Button>
            </div>
        </>
       ) : ( // Architectural Element View
        selectedArchElement && (
            <>
                <div className="flex-1 overflow-y-auto p-4">
                    <Accordion type="multiple" defaultValue={['general', 'appearance', 'shadow']} className="w-full">
                        <AccordionItem value="general">
                            <AccordionTrigger>General</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="element-type">Element Type</Label>
                                    <Input id="element-type" value={ARCH_ELEMENT_NAMES[selectedArchElement.type as ArchitecturalElementType]} disabled />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        
                        {selectedArchElement.type === 'area' && (
                            <AccordionItem value="appearance">
                                <AccordionTrigger>Appearance</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="element-color">Area Color</Label>
                                        <Input
                                            id="element-color"
                                            type="color"
                                            value={selectedArchElement.color || '#3b82f6'}
                                            onChange={(e) => handleArchChange('color', e.target.value)}
                                            className="h-10 p-1 w-full"
                                        />
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        )}

                        {selectedArchElement.type === 'area' && (
                             <AccordionItem value="shadow">
                                <AccordionTrigger>Shadow</AccordionTrigger>
                                <AccordionContent className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="shadow-enabled">Enable Shadow</Label>
                                            <p className="text-[0.8rem] text-muted-foreground">
                                                Add a drop shadow to the area.
                                            </p>
                                        </div>
                                        <Switch
                                            id="shadow-enabled"
                                            checked={selectedArchElement.shadow?.enabled ?? false}
                                            onCheckedChange={(checked) => handleArchChange('shadow.enabled', checked)}
                                        />
                                    </div>
                                    {selectedArchElement.shadow?.enabled && (
                                        <div className="space-y-4 pt-4 border-t">
                                            <div className="space-y-2">
                                                <Label>Offset X ({selectedArchElement.shadow?.offsetX ?? 0}px)</Label>
                                                <Slider
                                                    value={[selectedArchElement.shadow?.offsetX ?? 0]}
                                                    onValueChange={([val]) => handleArchChange('shadow.offsetX', val)}
                                                    min={-50} max={50} step={1}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Offset Y ({selectedArchElement.shadow?.offsetY ?? 4}px)</Label>
                                                <Slider
                                                    value={[selectedArchElement.shadow?.offsetY ?? 4]}
                                                    onValueChange={([val]) => handleArchChange('shadow.offsetY', val)}
                                                    min={-50} max={50} step={1}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Blur ({selectedArchElement.shadow?.blur ?? 8}px)</Label>
                                                <Slider
                                                    value={[selectedArchElement.shadow?.blur ?? 8]}
                                                    onValueChange={([val]) => handleArchChange('shadow.blur', val)}
                                                    min={0} max={100} step={1}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Opacity ({ (selectedArchElement.shadow?.opacity ?? 0.1).toFixed(2) })</Label>
                                                <Slider
                                                    value={[selectedArchElement.shadow?.opacity ?? 0.1]}
                                                    onValueChange={([val]) => handleArchChange('shadow.opacity', val)}
                                                    min={0} max={1} step={0.01}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="shadow-color">Shadow Color</Label>
                                                <Input
                                                    id="shadow-color"
                                                    type="color"
                                                    value={selectedArchElement.shadow?.color || '#000000'}
                                                    onChange={(e) => handleArchChange('shadow.color', e.target.value)}
                                                    className="h-10 p-1 w-full"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        )}

                    </Accordion>
                </div>
                <div className="p-4 border-t border-border space-y-2">
                    <Button variant="destructive" className="w-full" onClick={() => onRemoveArchElement(selectedArchElement.id)}>
                        <Trash2/> Delete Element
                    </Button>
                </div>
            </>
        )
       )}
    </div>
  );
}
