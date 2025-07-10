'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, 
  Trash2, 
  Network, 
  Wifi, 
  Shield, 
  Server, 
  Router,
  Globe,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { VLAN, Subnet } from '@/lib/types';

interface NetworkSettingsProps {
  vlans: VLAN[];
  subnets: Subnet[];
  onAddVlan: (vlan: Omit<VLAN, 'id'>) => void;
  onAddSubnet: (subnet: Omit<Subnet, 'id'>) => void;
  onDeleteVlan?: (id: string) => void;
  onDeleteSubnet?: (id: string) => void;
  onTestConnection?: () => Promise<boolean>;
}

interface NetworkConfig {
  dhcpEnabled: boolean;
  dhcpRange: { start: string; end: string };
  dnsServers: string[];
  gatewayIP: string;
  enableSecurity: boolean;
  portScanningEnabled: boolean;
  bandwidthLimit: number; // Mbps
  qosEnabled: boolean;
}

export function NetworkSettings({ 
  vlans, 
  subnets, 
  onAddVlan, 
  onAddSubnet, 
  onDeleteVlan, 
  onDeleteSubnet,
  onTestConnection 
}: NetworkSettingsProps) {
  const { toast } = useToast();
  
  // Using local state for form inputs
  const [newVlanName, setNewVlanName] = useState('');
  const [newVlanId, setNewVlanId] = useState('');
  const [newSubnetCidr, setNewSubnetCidr] = useState('');
  
  const [networkConfig, setNetworkConfig] = useState<NetworkConfig>({
    dhcpEnabled: true,
    dhcpRange: { start: '192.168.1.100', end: '192.168.1.200' },
    dnsServers: ['8.8.8.8', '8.8.4.4'],
    gatewayIP: '192.168.1.1',
    enableSecurity: true,
    portScanningEnabled: false,
    bandwidthLimit: 1000,
    qosEnabled: true,
  });
  
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleAddVlan = () => {
    if (newVlanName && newVlanId) {
      onAddVlan({ name: newVlanName, color: `hsl(${Math.random() * 360}, 90%, 54%)` });
      setNewVlanName('');
      setNewVlanId('');
      toast({
        title: 'เพิ่ม VLAN สำเร็จ',
        description: `VLAN ${newVlanName} ถูกเพิ่มเรียบร้อยแล้ว`,
      });
    }
  };
  
  const handleAddSubnet = () => {
    // Basic CIDR validation
    if (newSubnetCidr.includes('/')) {
        console.log("Adding subnet (UI only for now):", newSubnetCidr);
        setNewSubnetCidr('');
        toast({
          title: 'เพิ่ม Subnet สำเร็จ',
          description: `Subnet ${newSubnetCidr} ถูกเพิ่มเรียบร้อยแล้ว`,
        });
    } else {
        toast({
          title: 'รูปแบบ CIDR ไม่ถูกต้อง',
          description: 'ควรเป็นรูปแบบ 192.168.1.0/24',
          variant: 'destructive'
        });
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      if (onTestConnection) {
        const result = await onTestConnection();
        toast({
          title: result ? 'เชื่อมต่อสำเร็จ' : 'เชื่อมต่อล้มเหลว',
          description: result ? 'การเชื่อมต่อเครือข่ายทำงานปกติ' : 'ไม่สามารถเชื่อมต่อเครือข่ายได้',
          variant: result ? 'default' : 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถทดสอบการเชื่อมต่อได้',
        variant: 'destructive'
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const updateNetworkConfig = <K extends keyof NetworkConfig>(key: K, value: NetworkConfig[K]) => {
    setNetworkConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5" />
            การตั้งค่าเครือข่าย
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4" />
              )}
              ทดสอบการเชื่อมต่อ
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAdvanced ? 'ซ่อน' : 'แสดง'}การตั้งค่าขั้นสูง
            </Button>
          </div>
        </CardTitle>
        <CardDescription>
          จัดการ VLAN, Subnet และการตั้งค่าเครือข่ายสำหรับโครงการ
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="vlans" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vlans">VLAN</TabsTrigger>
            <TabsTrigger value="subnets">Subnet</TabsTrigger>
            <TabsTrigger value="dhcp">DHCP</TabsTrigger>
            <TabsTrigger value="security">ความปลอดภัย</TabsTrigger>
          </TabsList>
          
          {/* VLAN Management */}
          <TabsContent value="vlans" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Router className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">จัดการ VLAN</h4>
              </div>
              
              <div className="space-y-2">
                {vlans.map(vlan => (
                  <div key={vlan.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: vlan.color }} />
                      <div>
                        <span className="font-medium">{vlan.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">(ID: {vlan.id})</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDeleteVlan?.(vlan.id)}
                    >
                      <Trash2 className="w-4 h-4"/>
                    </Button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="ชื่อ VLAN" 
                    value={newVlanName} 
                    onChange={e => setNewVlanName(e.target.value)} 
                  />
                  <Input 
                    type="number" 
                    placeholder="ID" 
                    value={newVlanId} 
                    onChange={e => setNewVlanId(e.target.value)} 
                    className="w-20" 
                  />
                  <Button onClick={handleAddVlan}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Subnet Management */}
          <TabsContent value="subnets" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">จัดการ Subnet</h4>
              </div>
              
              <div className="space-y-2">
                {subnets.map(subnet => (
                  <div key={subnet.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{subnet.cidr}</Badge>
                      <span className="text-sm text-muted-foreground">
                        Available IPs: {Math.pow(2, 32 - parseInt(subnet.cidr.split('/')[1])) - 2}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onDeleteSubnet?.(subnet.id)}
                    >
                      <Trash2 className="w-4 h-4"/>
                    </Button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Input 
                    placeholder="192.168.1.0/24" 
                    value={newSubnetCidr} 
                    onChange={e => setNewSubnetCidr(e.target.value)} 
                  />
                  <Button onClick={handleAddSubnet}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* DHCP Settings */}
          <TabsContent value="dhcp" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">การตั้งค่า DHCP</h4>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="dhcp-enabled">เปิดใช้ DHCP</Label>
                <Switch
                  id="dhcp-enabled"
                  checked={networkConfig.dhcpEnabled}
                  onCheckedChange={(checked) => updateNetworkConfig('dhcpEnabled', checked)}
                />
              </div>
              
              {networkConfig.dhcpEnabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>IP เริ่มต้น</Label>
                      <Input
                        value={networkConfig.dhcpRange.start}
                        onChange={(e) => updateNetworkConfig('dhcpRange', {
                          ...networkConfig.dhcpRange,
                          start: e.target.value
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>IP สิ้นสุด</Label>
                      <Input
                        value={networkConfig.dhcpRange.end}
                        onChange={(e) => updateNetworkConfig('dhcpRange', {
                          ...networkConfig.dhcpRange,
                          end: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Gateway IP</Label>
                    <Input
                      value={networkConfig.gatewayIP}
                      onChange={(e) => updateNetworkConfig('gatewayIP', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>DNS Servers (คั่นด้วยจุลภาค)</Label>
                    <Input
                      value={networkConfig.dnsServers.join(', ')}
                      onChange={(e) => updateNetworkConfig('dnsServers', 
                        e.target.value.split(',').map(s => s.trim())
                      )}
                    />
                  </div>
                </div>
              )}
              
              {showAdvanced && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h5 className="font-medium flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      การตั้งค่าขั้นสูง
                    </h5>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="qos">เปิดใช้ QoS</Label>
                      <Switch
                        id="qos"
                        checked={networkConfig.qosEnabled}
                        onCheckedChange={(checked) => updateNetworkConfig('qosEnabled', checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>จำกัดแบนด์วิดธ์: {networkConfig.bandwidthLimit} Mbps</Label>
                      <Slider
                        value={[networkConfig.bandwidthLimit]}
                        onValueChange={([value]) => updateNetworkConfig('bandwidthLimit', value)}
                        min={10}
                        max={10000}
                        step={10}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">ความปลอดภัยเครือข่าย</h4>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="security-enabled">เปิดใช้ความปลอดภัย</Label>
                <Switch
                  id="security-enabled"
                  checked={networkConfig.enableSecurity}
                  onCheckedChange={(checked) => updateNetworkConfig('enableSecurity', checked)}
                />
              </div>
              
              {networkConfig.enableSecurity && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="port-scanning">Port Scanning Detection</Label>
                      <p className="text-xs text-muted-foreground">
                        ตรวจจับการสแกนพอร์ตที่ผิดปกติ
                      </p>
                    </div>
                    <Switch
                      id="port-scanning"
                      checked={networkConfig.portScanningEnabled}
                      onCheckedChange={(checked) => updateNetworkConfig('portScanningEnabled', checked)}
                    />
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <h5 className="font-medium text-amber-800">คำแนะนำความปลอดภัย</h5>
                    </div>
                    <ul className="mt-2 text-sm text-amber-700 space-y-1">
                      <li>• เปลี่ยนรหัสผ่านเริ่มต้นของอุปกรณ์ทั้งหมด</li>
                      <li>• ใช้การเข้ารหัส WPA3 สำหรับ WiFi</li>
                      <li>• อัปเดตเฟิร์มแวร์อุปกรณ์เป็นประจำ</li>
                      <li>• ตั้งค่า VLAN แยกสำหรับอุปกรณ์ CCTV</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
