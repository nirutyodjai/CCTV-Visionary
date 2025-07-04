

import type { AnyDevice, RackContainer, SelectableItem, ArchitecturalElementType, ArchitecturalElement } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Cable, Warehouse } from 'lucide-react';

interface PropertiesPanelProps {
  selectedItem: SelectableItem | null;
  onUpdateDevice: (device: AnyDevice) => void;
  onRemoveDevice: (deviceId: string) => void;
  onStartCabling: (deviceId: string) => void;
  onViewRack: (rack: RackContainer) => void;
  onRemoveArchElement: (elementId: string) => void;
  onUpdateArchElement: (element: ArchitecturalElement) => void;
}

const ARCH_ELEMENT_TYPES: ArchitecturalElementType[] = ['wall', 'door', 'window', 'table', 'chair', 'elevator', 'fire-escape', 'shaft', 'tree', 'motorcycle', 'car', 'supercar', 'area'];
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
  
  const isDevice = selectedItem && !ARCH_ELEMENT_TYPES.includes(selectedItem.type as ArchitecturalElementType);
  const selectedDevice = isDevice ? selectedItem as AnyDevice : null;
  const isArea = selectedItem?.type === 'area';

  const handleChange = (key: keyof AnyDevice, value: any) => {
      if(selectedDevice){
        const numericFields = ['price', 'powerConsumption', 'rotation', 'fov', 'range', 'channels', 'ports'];
        const finalValue = numericFields.includes(key) ? parseFloat(value) || 0 : value;
        const updatedDevice = { ...selectedDevice, [key]: finalValue };
        onUpdateDevice(updatedDevice);
      }
  };

  const handleArchChange = (key: keyof ArchitecturalElement, value: any) => {
    if(selectedItem && !isDevice){
        const updatedElement = { ...selectedItem, [key]: value } as ArchitecturalElement;
        onUpdateArchElement(updatedElement);
    }
  };

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
  
  const getSelectedItemName = () => {
      if (!selectedItem) return 'Select an item to see its properties.';
      if (isDevice) {
        return `Editing ${(selectedItem as AnyDevice).label}`;
      }
      return `Editing ${ARCH_ELEMENT_NAMES[selectedItem.type as ArchitecturalElementType]}`;
  }

  return (
    <div className="h-full flex flex-col">
       <div className="p-4 border-b border-border">
         <h2 className="text-lg font-semibold tracking-tight">Properties</h2>
         <p className="text-sm text-muted-foreground">
             {getSelectedItemName()}
         </p>
      </div>

       {selectedItem ? (
        isDevice && selectedDevice ? (
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
                <Button variant="destructive" className="w-full" onClick={() => onRemoveDevice(selectedDevice.id)}>
                    <Trash2/> Delete Device
                </Button>
            </div>
        </>
        ) : ( // Architectural Element View
        <>
            <div className="flex-1 overflow-y-auto p-4">
                <Accordion type="multiple" defaultValue={['general', 'appearance']} className="w-full">
                    <AccordionItem value="general">
                        <AccordionTrigger>General</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="element-type">Element Type</Label>
                                <Input id="element-type" value={ARCH_ELEMENT_NAMES[selectedItem.type as ArchitecturalElementType]} disabled />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    {isArea && (
                        <AccordionItem value="appearance">
                            <AccordionTrigger>Appearance</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label htmlFor="element-color">Area Color</Label>
                                    <Input
                                        id="element-color"
                                        type="color"
                                        value={(selectedItem as ArchitecturalElement).color || '#3b82f6'}
                                        onChange={(e) => handleArchChange('color', e.target.value)}
                                        className="h-10 p-1"
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    )}
                </Accordion>
            </div>
            <div className="p-4 border-t border-border space-y-2">
                <Button variant="destructive" className="w-full" onClick={() => onRemoveArchElement(selectedItem.id)}>
                    <Trash2/> Delete Element
                </Button>
            </div>
        </>
        )
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-muted-foreground text-center">Select an item on the canvas to view and edit its properties here.</p>
        </div>
      )}
    </div>
  );
}
