import type { AnyDevice, RackContainer, SelectableItem, ArchitecturalElement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Cable, Warehouse } from 'lucide-react';
import { ArchitecturalElementProperties } from './properties/architectural-element-properties';
import { CameraProperties } from './properties/camera-properties';
import { NetworkDeviceProperties } from './properties/network-device-properties';
import { RackProperties } from './properties/rack-properties';

interface PropertiesPanelProps {
  selectedItem: SelectableItem | null;
  onUpdateDevice: (device: AnyDevice) => void;
  onRemoveDevice: (deviceId: string) => void;
  onStartCabling: (deviceId: string) => void;
  onViewRack: (rack: RackContainer) => void;
  onRemoveArchElement: (elementId: string) => void;
  onUpdateArchElement: (element: ArchitecturalElement) => void;
}

const getSelectedItemName = (item: SelectableItem | null): string => {
    if (!item) return 'Properties';
    if ('label' in item) { // It's a device
      return `Editing: ${item.label}`;
    }
     // It's an architectural element
    return `Editing: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`;
}

export function PropertiesPanel({ 
    selectedItem, 
    onUpdateDevice, 
    onRemoveDevice, 
    onStartCabling, 
    onViewRack,
    onRemoveArchElement,
    onUpdateArchElement
}: PropertiesPanelProps) {
  
  const renderContent = () => {
    if (!selectedItem) {
        return (
             <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-muted-foreground text-center">Select an item on the canvas to view and edit its properties here.</p>
            </div>
        );
    }
    
    const isDevice = 'label' in selectedItem;
    const selectedDevice = isDevice ? selectedItem as AnyDevice : null;
    const selectedArchElement = !isDevice ? selectedItem as ArchitecturalElement : null;

    if (selectedArchElement) {
        return (
            <ArchitecturalElementProperties 
                element={selectedArchElement}
                onUpdate={onUpdateArchElement}
                onRemove={onRemoveArchElement}
            />
        );
    }

    if (selectedDevice) {
        const DeviceActions = () => (
             <div className="p-4 border-t border-border space-y-2">
                {selectedDevice.type.startsWith('rack') && (
                    <Button variant="outline" className="w-full" onClick={() => onViewRack(selectedDevice as RackContainer)}>
                        <Warehouse className="mr-2 h-4 w-4" /> View Rack Elevation
                    </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => onStartCabling(selectedDevice.id)}>
                    <Cable className="mr-2 h-4 w-4"/> Start Cabling
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => onRemoveDevice(selectedDevice.id)}>
                    <Trash2 className="mr-2 h-4 w-4"/> Delete Device
                </Button>
            </div>
        );

        const getDevicePropertiesComponent = () => {
            if (selectedDevice.type.startsWith('cctv-')) {
                return <CameraProperties device={selectedDevice} onUpdate={onUpdateDevice} />;
            }
            if (selectedDevice.type === 'nvr' || selectedDevice.type === 'switch') {
                return <NetworkDeviceProperties device={selectedDevice} onUpdate={onUpdateDevice} />;
            }
            if (selectedDevice.type.startsWith('rack-')) {
                return <RackProperties device={selectedDevice} onUpdate={onUpdateDevice} />;
            }
            return <div className="p-4"><p>This device type has no specific properties.</p></div>;
        };

        return (
            <>
                <div className="flex-1 overflow-y-auto p-4">
                    {getDevicePropertiesComponent()}
                </div>
                <DeviceActions />
            </>
        );
    }

    return null;
  };

  return (
    <div className="h-full flex flex-col">
       <div className="p-3 border-b border-border">
         <h2 className="text-sm font-semibold tracking-tight">Properties Panel</h2>
         <p className="text-xs text-muted-foreground truncate">
             {getSelectedItemName(selectedItem)}
         </p>
      </div>
      {renderContent()}
    </div>
  );
}
