
'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { produce } from 'immer';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RackContainer, RackDevice, DeviceType } from '@/lib/types';
import { DEVICE_CONFIG, RACK_DEVICE_TYPES } from '@/lib/device-config';
import { Zap, Trash2, GripVertical } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';


// --- DND SETUP ---
const ItemTypes = {
  RACK_DEVICE: 'rackDevice',
};

// --- DRAGGABLE RACK ITEM ---
const DraggableRackItem = ({ device, rackSize, onSelect, isSelected, onMove }) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const colorClass = DEVICE_CONFIG[device.type]?.colorClass || 'bg-card';


    const [, drop] = useDrop({
        accept: ItemTypes.RACK_DEVICE,
        hover(item: RackDevice, monitor) {
            if (!ref.current) return;
            if (item.id === device.id) return;
        },
    });

    const [{ isDragging }, drag, preview] = useDrag({
        type: ItemTypes.RACK_DEVICE,
        item: () => ({ ...device }),
        end: (item, monitor) => {
            const dropResult = monitor.getDropResult<{ uPosition: number }>();
            if (item && dropResult) {
                onMove(item.id, dropResult.uPosition);
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));
    
    // Correctly calculate the starting grid row from the top (1-based)
    const gridRowStart = rackSize - (device.uPosition + device.uHeight - 1) + 1;

    const itemStyle: React.CSSProperties = {
        gridRow: `${gridRowStart} / span ${device.uHeight}`,
        gridColumn: '1 / -1',
        zIndex: 10,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={preview} style={itemStyle} className="relative">
            <div 
                ref={ref} 
                className={`absolute inset-1 border shadow-sm rounded-md flex items-center justify-between cursor-pointer transition-all duration-200 ${colorClass} ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
                <div ref={drag} className="cursor-move p-2">
                     <GripVertical className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 text-center truncate px-1" onClick={onSelect}>
                    <span className="text-sm font-semibold text-card-foreground truncate">{device.label} ({device.uHeight}U)</span>
                </div>
                <div className="p-2" onClick={() => onSelect()}>
                    <Trash2 className="w-5 h-5 text-destructive/50 hover:text-destructive"/>
                </div>
            </div>
        </div>
    );
};

// --- RACK DROP ZONE (U-SLOT) ---
const RackSlot = ({ u, onDropDevice, children }) => {
    const [, drop] = useDrop(() => ({
        accept: ItemTypes.RACK_DEVICE,
        drop: () => ({ uPosition: u }),
    }));

    return (
        <div ref={drop} className="h-full w-full relative">
            {children}
        </div>
    );
};


// --- ADD DEVICE DIALOG ---
const AddDeviceDialog = ({ isOpen, onOpenChange, onAddDevice, rackDevices, rackSize }) => {
    const [deviceType, setDeviceType] = useState<DeviceType | ''>('');
    const [uPosition, setUPosition] = useState<number>(1);
    const [error, setError] = useState('');

    const availableSlots = useMemo(() => {
        if (!deviceType) return [];

        const config = DEVICE_CONFIG[deviceType];
        const uHeight = config?.defaults.uHeight || 1;
        const occupied = new Array(rackSize + 1).fill(false);
        rackDevices.forEach(d => {
            for (let i = 0; i < d.uHeight; i++) {
                if (d.uPosition + i <= rackSize) {
                    occupied[d.uPosition + i] = true;
                }
            }
        });

        const slots = [];
        for (let u = 1; u <= rackSize - uHeight + 1; u++) {
            let hasSpace = true;
            for (let i = 0; i < uHeight; i++) {
                if (occupied[u + i]) {
                    hasSpace = false;
                    break;
                }
            }
            if (hasSpace) slots.push(u);
        }
        return slots.reverse(); // Show top U-slots first
    }, [deviceType, rackDevices, rackSize]);
    
    useEffect(() => {
        if (availableSlots.length > 0) {
            setUPosition(availableSlots[0]);
        } else {
             setUPosition(1);
        }
    }, [availableSlots])


    const handleSubmit = () => {
        if (!deviceType || !uPosition) {
            setError('Please select a device type and U position.');
            return;
        }
        onAddDevice(deviceType, uPosition);
        onOpenChange(false);
        setDeviceType('');
        setUPosition(1);
        setError('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Device to Rack</DialogTitle>
                    <DialogDescription>Select the device and the starting U position for installation.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="deviceType">Device Type</Label>
                        <Select onValueChange={(value: DeviceType) => setDeviceType(value)} value={deviceType}>
                            <SelectTrigger id="deviceType">
                                <SelectValue placeholder="Select a device..." />
                            </SelectTrigger>
                            <SelectContent>
                                {RACK_DEVICE_TYPES.map(type => (
                                    <SelectItem key={type} value={type}>
                                        {DEVICE_CONFIG[type].name} ({DEVICE_CONFIG[type].defaults.uHeight}U)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Select Starting U Position</Label>
                        {deviceType ? (
                            availableSlots.length > 0 ? (
                                <ScrollArea className="h-48 w-full rounded-md border">
                                    <RadioGroup
                                        value={String(uPosition)}
                                        onValueChange={(value) => setUPosition(Number(value))}
                                        className="p-2 space-y-2"
                                    >
                                        {availableSlots.map(slot => {
                                            const config = DEVICE_CONFIG[deviceType!];
                                            const uHeight = config?.defaults.uHeight || 1;
                                            const slotsToOccupy = Array.from({ length: uHeight }, (_, i) => slot + i);
                                            
                                            return (
                                                <Label
                                                    key={slot}
                                                    htmlFor={`u-pos-${slot}`}
                                                    className="flex cursor-pointer items-center space-x-3 rounded-md border-2 border-muted bg-transparent p-3 transition-colors hover:bg-accent hover:text-accent-foreground has-[:checked]:bg-accent has-[:checked]:text-accent-foreground has-[:checked]:border-primary"
                                                >
                                                    <RadioGroupItem value={String(slot)} id={`u-pos-${slot}`} />
                                                    <div className="flex-1">
                                                        <span className="font-semibold">Position U{slot}</span>
                                                        <p className="text-xs text-muted-foreground">
                                                            Will occupy {uHeight}U (slots U{slotsToOccupy[0]} to U{slotsToOccupy[slotsToOccupy.length - 1]})
                                                        </p>
                                                    </div>
                                                </Label>
                                            );
                                        })}
                                    </RadioGroup>
                                </ScrollArea>
                            ) : (
                                <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                    <p className="text-sm text-muted-foreground text-center">
                                        No available slots for a {DEVICE_CONFIG[deviceType]?.defaults.uHeight}U device.
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                <p className="text-sm text-muted-foreground">Select a device to see available slots.</p>
                            </div>
                        )}
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
                    <Button onClick={handleSubmit} disabled={!deviceType || !uPosition || availableSlots.length === 0}>Add Device</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


// --- MAIN VIEW ---
interface RackElevationViewProps {
  rack: RackContainer;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRack: (rack: RackContainer) => void;
}

export function RackElevationView({ rack, isOpen, onClose, onUpdateRack }: RackElevationViewProps) {
  if (!rack) return null;
  
  const isMobile = useIsMobile();
  const DndBackend = isMobile ? TouchBackend : HTML5Backend;

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  
  const rackDevices = rack.devices || [];
  const rackSize = parseInt(rack.rack_size || '9');

  useEffect(() => {
    setSelectedDeviceId(null);
  }, [rack, isOpen]);

  const { totalPowerConsumption, totalPowerCapacity } = useMemo(() => {
    let consumption = 0;
    let capacity = 0;
    rackDevices.forEach(d => {
        consumption += d.powerConsumption || 0;
        if (d.type === 'ups' || d.type === 'pdu') {
            capacity += (d as any).powerCapacity || 0;
        }
    });
    return { totalPowerConsumption: consumption, totalPowerCapacity: capacity > 0 ? capacity : 2200 };
  }, [rackDevices]);

  const handleAddDevice = (type: DeviceType, uPosition: number) => {
    const config = DEVICE_CONFIG[type];
    const uHeight = config?.defaults.uHeight || 1;

    const newDevice: RackDevice = {
        id: `rack_dev_${Date.now()}`,
        type: type,
        label: `${config.name} ${rackDevices.filter(d => d.type === type).length + 1}`,
        uPosition: uPosition,
        uHeight: uHeight,
        price: config.defaults.price,
        powerConsumption: config.defaults.powerConsumption,
        ...(type === 'ups' && { powerCapacity: config.defaults.powerCapacity }),
    };
    
    const newRackState = produce(rack, draft => {
        if (!draft.devices) {
            draft.devices = [];
        }
        draft.devices.push(newDevice);
    });
    onUpdateRack(newRackState);
  };
  
  const handleRemoveDevice = (deviceId: string) => {
      const newRackState = produce(rack, draft => {
          draft.devices = draft.devices.filter(d => d.id !== deviceId);
      });
      onUpdateRack(newRackState);
      setSelectedDeviceId(null);
  };
  
  const handleMoveDevice = (deviceId: string, newUPosition: number) => {
      onUpdateRack(produce(rack, draft => {
          const deviceToMove = draft.devices.find(d => d.id === deviceId);
          if (deviceToMove) {
            const uHeight = deviceToMove.uHeight;
            const oldUPosition = deviceToMove.uPosition;

            // Check for collisions
            const isOccupied = draft.devices.some(d => {
                if (d.id === deviceId) return false; // Don't check against itself
                const startA = d.uPosition;
                const endA = d.uPosition + d.uHeight - 1;
                const startB = newUPosition;
                const endB = newUPosition + uHeight - 1;
                return Math.max(startA, startB) <= Math.min(endA, endB);
            });

            if (!isOccupied) {
                deviceToMove.uPosition = newUPosition;
            } else {
                console.warn("Cannot move device to an occupied slot.");
                // Optionally, provide user feedback here
            }
          }
      }));
  };

  const powerUsagePercentage = (totalPowerConsumption / totalPowerCapacity) * 100;

  return (
    <DndProvider backend={DndBackend} options={ isMobile ? { enableMouseEvents: true } : {} }>
        <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
            <DialogTitle>Rack Elevation: {rack.label}</DialogTitle>
            <DialogDescription>Drag and drop to arrange devices, or add new ones.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-12 gap-6 h-[600px] p-4">
            <div className="col-span-3 border-r pr-6 flex flex-col justify-between">
                <div>
                    <h3 className="font-semibold mb-4">Controls</h3>
                    <Button className="w-full" onClick={() => setAddDialogOpen(true)}>Add New Device</Button>
                    {selectedDeviceId && (
                        <Card className="mt-4">
                            <CardHeader><CardTitle>Edit Device</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                               <p className="text-sm">Editing: {rackDevices.find(d=>d.id === selectedDeviceId)?.label}</p>
                               <Button variant="destructive" className="w-full" onClick={() => handleRemoveDevice(selectedDeviceId)}>
                                   <Trash2 className="w-4 h-4 mr-2"/>
                                   Delete Selected
                               </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Power Management</h3>
                  <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                          <span>Usage:</span>
                          <span className="font-bold">{totalPowerConsumption}W</span>
                      </div>
                      <div className="flex justify-between text-sm">
                          <span>Capacity:</span>
                          <span className="font-bold">{totalPowerCapacity}W</span>
                      </div>
                      <Progress value={powerUsagePercentage} className="h-4" />
                      {powerUsagePercentage > 100 && <p className="text-xs text-destructive mt-1"><Zap className="w-4 h-4 mr-1"/>Overloaded!</p>}
                  </div>
                </div>
            </div>
            <div className="col-span-9 bg-muted/50 rounded-lg border-4 border-muted flex">
                {/* U-Numbers Left */}
                <div className="w-8 bg-background border-r-2 border-border h-full flex flex-col-reverse justify-end">
                    {[...Array(rackSize)].map((_, i) => (
                        <div key={i} className="flex-1 border-t border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground">
                            <span>{i + 1}</span>
                        </div>
                    ))}
                </div>

                {/* Main Rack Area with CSS Grid */}
                <div 
                  className="relative flex-1 h-full grid"
                  style={{ gridTemplateRows: `repeat(${rackSize}, 1fr)` }}
                >
                  {/* Draggable items are direct children of the grid */}
                  {rackDevices.map(device => (
                    <DraggableRackItem
                        key={device.id}
                        device={device}
                        rackSize={rackSize}
                        isSelected={selectedDeviceId === device.id}
                        onSelect={() => setSelectedDeviceId(device.id === selectedDeviceId ? null : device.id)}
                        onMove={handleMoveDevice}
                    />
                  ))}
                  
                  {/* Drop targets & grid lines */}
                  {[...Array(rackSize)].map((_, i) => (
                    <div 
                      key={i} 
                      className="border-b border-dashed border-border/50 relative" 
                      style={{ gridRow: `${rackSize - i} / span 1` }}
                    >
                        <RackSlot u={i + 1} onDropDevice={() => {}} />
                    </div>
                  ))}
                </div>

                 {/* U-Numbers Right */}
                <div className="w-8 bg-background border-l-2 border-border h-full flex flex-col-reverse justify-end">
                     {[...Array(rackSize)].map((_, i) => (
                        <div key={i} className="flex-1 border-t border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground">
                             <span>{i + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
            </div>
        </DialogContent>
        </Dialog>
        <AddDeviceDialog 
            isOpen={isAddDialogOpen} 
            onOpenChange={setAddDialogOpen}
            onAddDevice={handleAddDevice}
            rackDevices={rackDevices}
            rackSize={rackSize}
        />
    </DndProvider>
  );
}
