
'use client';

import React, { useState } from 'react';
import type { AnyDevice, RackContainer, ArchitecturalElement, CableType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Trash2, Cable, Warehouse, Sparkles } from 'lucide-react';
import { ArchitecturalElementProperties } from './properties/architectural-element-properties';
import { CameraProperties } from './properties/camera-properties';
import { NetworkDeviceProperties } from './properties/network-device-properties';
import { RackProperties } from './properties/rack-properties';
import { useSelection } from '@/contexts/SelectionContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UtpCat6Icon } from '../icons/utp-cat6-icon';
import { FiberOpticIcon } from '../icons/fiber-optic-icon';


interface PropertiesPanelProps {
  onUpdateDevice: (device: AnyDevice) => void;
  onRemoveDevice: (deviceId: string) => void;
  onStartCabling: (deviceId: string, cableType: CableType) => void;
  onViewRack: (rack: RackContainer) => void;
  onRemoveArchElement: (elementId: string) => void;
  onUpdateArchElement: (element: ArchitecturalElement) => void;
}

const getSelectedItemName = (item: AnyDevice | ArchitecturalElement | null): string => {
    if (!item) return 'Properties';
    if ('label' in item) return `Editing: ${item.label}`;
    return `Editing: ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`;
}

export function PropertiesPanel({ 
    onUpdateDevice, 
    onRemoveDevice, 
    onStartCabling, 
    onViewRack,
    onRemoveArchElement,
    onUpdateArchElement
}: PropertiesPanelProps) {
  const { selectedItem } = useSelection();
  const [selectedCableType, setSelectedCableType] = useState<CableType>('utp-cat6');

  const renderContent = () => {
    if (!selectedItem) {
        return (
             <div className="flex-1 flex items-center justify-center p-4">
                <p className="text-muted-foreground text-center">Select an item on the canvas to view and edit its properties here.</p>
            </div>
        );
    }
    
    const isDevice = 'label' in selectedItem;
    
    if (!isDevice) {
        return (
            <ArchitecturalElementProperties 
                element={selectedItem as ArchitecturalElement}
                onUpdate={onUpdateArchElement}
                onRemove={onRemoveArchElement}
            />
        );
    }

    const selectedDevice = selectedItem as AnyDevice;
    const DeviceActions = () => (
         <div className="p-4 border-t border-border space-y-2">
            {selectedDevice.type.startsWith('rack') && (
                <Button variant="outline" className="w-full" onClick={() => onViewRack(selectedDevice as RackContainer)}>
                    <Warehouse className="mr-2 h-4 w-4" /> View Rack Elevation
                </Button>
            )}
            <Card>
                <CardHeader className="p-3">
                    <CardTitle className="text-sm flex items-center"><Cable className="mr-2 h-4 w-4"/> Start Cabling</CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                     <RadioGroup value={selectedCableType} onValueChange={(value: CableType) => setSelectedCableType(value)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="utp-cat6" id="utp-cat6" />
                            <Label htmlFor="utp-cat6" className="flex items-center gap-2 cursor-pointer">
                                <UtpCat6Icon className="w-5 h-5" /> UTP CAT6
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fiber-optic" id="fiber-optic" />
                            <Label htmlFor="fiber-optic" className="flex items-center gap-2 cursor-pointer">
                                <FiberOpticIcon className="w-5 h-5" /> Fiber Optic
                            </Label>
                        </div>
                    </RadioGroup>
                    <Button 
                        className="w-full" 
                        onClick={() => onStartCabling(selectedDevice.id, selectedCableType)}>
                       <Sparkles className="mr-2 h-4 w-4" /> Begin Connection
                    </Button>
                </CardContent>
            </Card>
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
