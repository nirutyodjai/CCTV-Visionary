'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Network } from 'lucide-react';
import type { VLAN, Subnet } from '@/lib/types';

interface NetworkSettingsProps {
  vlans: VLAN[];
  subnets: Subnet[];
  onAddVlan: (vlan: Omit<VLAN, 'id'>) => void;
  onAddSubnet: (subnet: Omit<Subnet, 'id'>) => void;
  // onDelete handlers would be added here
}

export function NetworkSettings({ vlans, subnets, onAddVlan, onAddSubnet }: NetworkSettingsProps) {
  // Using local state for form inputs
  const [newVlanName, setNewVlanName] = React.useState('');
  const [newVlanId, setNewVlanId] = React.useState('');
  const [newSubnetCidr, setNewSubnetCidr] = React.useState('');

  const handleAddVlan = () => {
    if (newVlanName && newVlanId) {
      onAddVlan({ name: newVlanName, color: `hsl(${Math.random() * 360}, 90%, 54%)` });
      setNewVlanName('');
      setNewVlanId('');
    }
  };
  
  const handleAddSubnet = () => {
    // Basic CIDR validation
    if (newSubnetCidr.includes('/')) {
        // In a real app, you'd associate this with a building/floor
        // onAddSubnet({ cidr: newSubnetCidr, buildingId: 'some-building-id' });
        console.log("Adding subnet (UI only for now):", newSubnetCidr);
        setNewSubnetCidr('');
    } else {
        alert("Invalid CIDR format. Should be like 192.168.1.0/24");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Network className="w-5 h-5 mr-2" /> Network Settings</CardTitle>
        <CardDescription>Manage global VLANs and Subnets for the project.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* VLAN Management */}
        <div>
          <h4 className="font-semibold mb-2">VLANs</h4>
          <div className="space-y-2">
            {vlans.map(vlan => (
              <div key={vlan.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: vlan.color }} />
                    <span className="font-bold text-sm">{vlan.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">(ID: {vlan.id})</span>
                </div>
                <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4"/></Button>
              </div>
            ))}
            <div className="flex space-x-2">
              <Input placeholder="VLAN Name" value={newVlanName} onChange={e => setNewVlanName(e.target.value)} />
              <Input type="number" placeholder="ID" value={newVlanId} onChange={e => setNewVlanId(e.target.value)} className="w-20" />
              <Button onClick={handleAddVlan}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

        {/* Subnet Management */}
        <div>
          <h4 className="font-semibold mb-2">Subnets</h4>
          <div className="space-y-2">
             {subnets.map(subnet => (
              <div key={subnet.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <span className="font-mono text-sm">{subnet.cidr}</span>
                <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4"/></Button>
              </div>
            ))}
            <div className="flex space-x-2">
              <Input placeholder="10.10.0.0/16" value={newSubnetCidr} onChange={e => setNewSubnetCidr(e.target.value)} />
              <Button onClick={handleAddSubnet}><Plus className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
