// In PropertiesPanel.tsx

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { VLAN } from '@/lib/types';

interface PropertiesPanelProps {
  // ...
  vlans: VLAN[];
}

export function PropertiesPanel({ selectedDevice, onUpdateDevice, vlans, /*...other props*/ }: PropertiesPanelProps) {
  // ...

  const renderNetworkProperties = () => (
    <div className="space-y-2">
        <Label>VLAN</Label>
        <Select
            value={String(selectedDevice.vlanId || '')}
            onValueChange={(val) => onUpdateDevice({ ...selectedDevice, vlanId: val ? parseInt(val) : undefined })}
        >
            <SelectTrigger>
                <SelectValue placeholder="No VLAN" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="">No VLAN</SelectItem>
                {vlans.map(vlan => (
                    <SelectItem key={vlan.id} value={String(vlan.id)}>
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: vlan.color }} />
                            {vlan.name} (ID: {vlan.id})
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
  );

  return (
    <Card>
      {/* ... */}
      <CardContent>
        {/* ... */}
        {renderNetworkProperties()}
        {/* ... */}
      </CardContent>
    </Card>
  );
}
