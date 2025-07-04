'use client';

import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { RackContainer, RackDevice, DeviceType } from '@/lib/types';
import { DEVICE_CONFIG, RACK_DEVICE_TYPES } from '@/lib/device-config';
import { Zap } from 'lucide-react';

interface RackElevationViewProps {
  rack: RackContainer | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRack: (rack: RackContainer) => void;
}

const RackItem = ({ device, rackSize }: { device: RackDevice; rackSize: number }) => {
  const itemStyle: React.CSSProperties = {
    height: `${(device.uHeight / rackSize) * 100}%`,
    bottom: `${((device.uPosition - 1) / rackSize) * 100}%`,
  };

  return (
    <div
      className="absolute w-full left-0 border border-border bg-card shadow-sm rounded-sm flex items-center justify-center p-1"
      style={itemStyle}
    >
      <span className="text-xs text-center text-card-foreground truncate">{device.label} ({device.uHeight}U)</span>
    </div>
  );
};


function findEmptySlot(devices: RackDevice[], rackSize: number, uHeight: number): number | null {
    const occupied = new Array(rackSize + 1).fill(false);
    devices.forEach(d => {
        for (let i = 0; i < d.uHeight; i++) {
            if (d.uPosition + i <= rackSize) {
                occupied[d.uPosition + i] = true;
            }
        }
    });

    for (let u = 1; u <= rackSize - uHeight + 1; u++) {
        let hasSpace = true;
        for (let i = 0; i < uHeight; i++) {
            if (occupied[u + i]) {
                hasSpace = false;
                break;
            }
        }
        if (hasSpace) return u;
    }
    return null; // No space found
}


export function RackElevationView({ rack, isOpen, onClose, onUpdateRack }: RackElevationViewProps) {
  if (!rack) return null;

  const rackDevices = rack.devices || [];
  const rackSize = parseInt(rack.rack_size || '9');

  const { totalPowerConsumption, totalPowerCapacity } = useMemo(() => {
    let consumption = 0;
    let capacity = 0;
    rackDevices.forEach(d => {
        consumption += DEVICE_CONFIG[d.type]?.defaults.powerConsumption || 0;
        if (d.type === 'ups' || d.type === 'pdu') {
            capacity += DEVICE_CONFIG[d.type]?.defaults.powerCapacity || 0;
        }
    });
    return { totalPowerConsumption: consumption, totalPowerCapacity: capacity > 0 ? capacity : 2200 }; // Default capacity if no PDU/UPS
  }, [rackDevices]);

  const handleAddDeviceToRack = (type: DeviceType) => {
    const config = DEVICE_CONFIG[type];
    const uHeight = config?.defaults.uHeight || 1;
    const uPosition = findEmptySlot(rackDevices, rackSize, uHeight);

    if (uPosition === null) {
      alert(`No space for a ${uHeight}U device.`);
      return;
    }

    const newDevice: RackDevice = {
        id: `rack_dev_${Date.now()}`,
        type: type,
        label: `${config.name} ${rackDevices.filter(d => d.type === type).length + 1}`,
        uPosition: uPosition,
        uHeight: uHeight,
        price: config.defaults.price,
        powerConsumption: config.defaults.powerConsumption,
    };
    
    const updatedRack: RackContainer = {
        ...rack,
        devices: [...rackDevices, newDevice]
    };

    onUpdateRack(updatedRack);
  };

  const powerUsagePercentage = (totalPowerConsumption / totalPowerCapacity) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Rack Elevation: {rack.label}</DialogTitle>
          <DialogDescription>Manage devices and power within this rack.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-12 gap-6 h-[600px] p-4">
          <div className="col-span-3 border-r pr-6">
              <h3 className="font-semibold mb-4">Add Devices</h3>
              <div className="space-y-2">
                  {RACK_DEVICE_TYPES.map(type => (
                      <Button key={type} className="w-full" variant="outline" onClick={() => handleAddDeviceToRack(type as DeviceType)}>
                          Add {DEVICE_CONFIG[type].name}
                      </Button>
                  ))}
              </div>
              <div className="mt-8">
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
                      {powerUsagePercentage > 100 && (
                          <p className="text-xs text-destructive flex items-center mt-1">
                              <Zap className="w-4 h-4 mr-1" /> Overloaded!
                          </p>
                      )}
                  </div>
              </div>
          </div>
          <div className="col-span-9 bg-muted/50 rounded-lg relative border-4 border-muted">
            {[...Array(2)].map((_, i) => (
                <div key={i} className={`absolute top-0 bottom-0 ${i === 0 ? 'left-2' : 'right-2'} w-4 bg-background border-x-2 border-border`}>
                    {[...Array(rackSize)].map((_, u) => (
                        <div key={u} className="h-[calc(100%/var(--rack-size))] border-b border-dashed border-border flex items-center justify-center text-[8px] text-muted-foreground" style={{'--rack-size': rackSize} as React.CSSProperties}>
                            <span>{rackSize - u}</span>
                        </div>
                    ))}
                </div>
            ))}
            
            <div className="relative w-full h-full p-8">
                {rackDevices.map(device => (
                    <RackItem key={device.id} device={device} rackSize={rackSize} />
                ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
