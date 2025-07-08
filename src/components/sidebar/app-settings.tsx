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
  Settings, 
  Monitor, 
  Palette, 
  Globe, 
  Zap, 
  Shield, 
  Database,
  Download,
  Upload,
  RotateCcw,
  Eye,
  Grid,
  Layers,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AppSettingsProps {
  onImportDemo?: () => void;
  onExportSettings?: () => void;
  onImportSettings?: (settings: any) => void;
  onResetSettings?: () => void;
}

interface AppSettings {
  // การแสดงผล
  theme: 'light' | 'dark' | 'system';
  language: 'th' | 'en';
  gridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
  
  // ประสิทธิภาพ
  enableAnimations: boolean;
  renderQuality: 'low' | 'medium' | 'high';
  maxDevices: number;
  enableCaching: boolean;
  
  // การทำงาน
  autoSave: boolean;
  autoSaveInterval: number; // minutes
  enableUndoRedo: boolean;
  maxHistorySize: number;
  
  // ความปลอดภัย
  enableBackup: boolean;
  encryptData: boolean;
  sessionTimeout: number; // minutes
  
  // เครือข่าย
  defaultSubnet: string;
  enableIPAM: boolean;
  enableVLAN: boolean;
}

export function AppSettings({ 
  onImportDemo, 
  onExportSettings, 
  onImportSettings, 
  onResetSettings 
}: AppSettingsProps) {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<AppSettings>({
    // การแสดงผล
    theme: 'system',
    language: 'th',
    gridVisible: true,
    snapToGrid: true,
    gridSize: 10,
    
    // ประสิทธิภาพ
    enableAnimations: true,
    renderQuality: 'high',
    maxDevices: 1000,
    enableCaching: true,
    
    // การทำงาน
    autoSave: true,
    autoSaveInterval: 5,
    enableUndoRedo: true,
    maxHistorySize: 50,
    
    // ความปลอดภัย
    enableBackup: true,
    encryptData: false,
    sessionTimeout: 60,
    
    // เครือข่าย
    defaultSubnet: '192.168.1.0/24',
    enableIPAM: true,
    enableVLAN: true,
  });

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleImportDemo = () => {
    if (onImportDemo) {
      onImportDemo();
      toast({
        title: 'โหลดข้อมูลตัวอย่างสำเร็จ',
        description: 'ข้อมูลตัวอย่างได้ถูกโหลดเรียบร้อยแล้ว',
      });
    }
  };

  const handleExportSettings = () => {
    const settingsJson = JSON.stringify(settings, null, 2);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cctv-visionary-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (onExportSettings) {
      onExportSettings();
    }
    
    toast({
      title: 'ส่งออกการตั้งค่าสำเร็จ',
      description: 'ไฟล์การตั้งค่าได้ถูกดาวน์โหลดเรียบร้อยแล้ว',
    });
  };

  const handleResetSettings = () => {
    if (onResetSettings) {
      onResetSettings();
    }
    
    // Reset to defaults
    setSettings({
      theme: 'system',
      language: 'th',
      gridVisible: true,
      snapToGrid: true,
      gridSize: 10,
      enableAnimations: true,
      renderQuality: 'high',
      maxDevices: 1000,
      enableCaching: true,
      autoSave: true,
      autoSaveInterval: 5,
      enableUndoRedo: true,
      maxHistorySize: 50,
      enableBackup: true,
      encryptData: false,
      sessionTimeout: 60,
      defaultSubnet: '192.168.1.0/24',
      enableIPAM: true,
      enableVLAN: true,
    });
    
    toast({
      title: 'รีเซ็ตการตั้งค่าสำเร็จ',
      description: 'การตั้งค่าทั้งหมดถูกรีเซ็ตเป็นค่าเริ่มต้นแล้ว',
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          การตั้งค่าแอปพลิเคชัน
        </CardTitle>
        <CardDescription>
          ปรับแต่งการตั้งค่าและพฤติกรรมของแอปพลิเคชัน
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="display" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="display" className="text-xs">แสดงผล</TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">ประสิทธิภาพ</TabsTrigger>
            <TabsTrigger value="workflow" className="text-xs">การทำงาน</TabsTrigger>
            <TabsTrigger value="security" className="text-xs">ความปลอดภัย</TabsTrigger>
            <TabsTrigger value="data" className="text-xs">ข้อมูล</TabsTrigger>
          </TabsList>
          
          {/* การแสดงผล */}
          <TabsContent value="display" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Palette className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">ธีมและภาษา</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ธีม</Label>
                  <Select value={settings.theme} onValueChange={(value: any) => updateSetting('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          สว่าง
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          มืด
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Laptop className="w-4 h-4" />
                          ตามระบบ
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>ภาษา</Label>
                  <Select value={settings.language} onValueChange={(value: any) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="th">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          ไทย
                        </div>
                      </SelectItem>
                      <SelectItem value="en">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4" />
                          English
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-4">
                <Grid className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">ตาราง</h4>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="grid-visible">แสดงตาราง</Label>
                  <Switch
                    id="grid-visible"
                    checked={settings.gridVisible}
                    onCheckedChange={(checked) => updateSetting('gridVisible', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="snap-to-grid">ดูดติดตาราง</Label>
                  <Switch
                    id="snap-to-grid"
                    checked={settings.snapToGrid}
                    onCheckedChange={(checked) => updateSetting('snapToGrid', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>ขนาดตาราง: {settings.gridSize} พิกเซล</Label>
                  <Slider
                    value={[settings.gridSize]}
                    onValueChange={([value]) => updateSetting('gridSize', value)}
                    min={5}
                    max={50}
                    step={5}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* ประสิทธิภาพ */}
          <TabsContent value="performance" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Zap className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">การเรนเดอร์</h4>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="animations">เปิดใช้ภาพเคลื่อนไหว</Label>
                <Switch
                  id="animations"
                  checked={settings.enableAnimations}
                  onCheckedChange={(checked) => updateSetting('enableAnimations', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>คุณภาพการเรนเดอร์</Label>
                <Select value={settings.renderQuality} onValueChange={(value: any) => updateSetting('renderQuality', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">ต่ำ (เร็ว)</SelectItem>
                    <SelectItem value="medium">ปานกลาง</SelectItem>
                    <SelectItem value="high">สูง (ช้า)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-4">
                <Database className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">หน่วยความจำ</h4>
              </div>
              
              <div className="space-y-2">
                <Label>จำนวนอุปกรณ์สูงสุด: {settings.maxDevices}</Label>
                <Slider
                  value={[settings.maxDevices]}
                  onValueChange={([value]) => updateSetting('maxDevices', value)}
                  min={100}
                  max={5000}
                  step={100}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="caching">เปิดใช้แคช</Label>
                <Switch
                  id="caching"
                  checked={settings.enableCaching}
                  onCheckedChange={(checked) => updateSetting('enableCaching', checked)}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* การทำงาน */}
          <TabsContent value="workflow" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Monitor className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">การบันทึกอัตโนมัติ</h4>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-save">เปิดใช้การบันทึกอัตโนมัติ</Label>
                <Switch
                  id="auto-save"
                  checked={settings.autoSave}
                  onCheckedChange={(checked) => updateSetting('autoSave', checked)}
                />
              </div>
              
              {settings.autoSave && (
                <div className="space-y-2">
                  <Label>ช่วงเวลาการบันทึก: {settings.autoSaveInterval} นาที</Label>
                  <Slider
                    value={[settings.autoSaveInterval]}
                    onValueChange={([value]) => updateSetting('autoSaveInterval', value)}
                    min={1}
                    max={30}
                    step={1}
                  />
                </div>
              )}
              
              <Separator />
              
              <div className="flex items-center gap-4">
                <Layers className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">ประวัติการแก้ไข</h4>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="undo-redo">เปิดใช้ Undo/Redo</Label>
                <Switch
                  id="undo-redo"
                  checked={settings.enableUndoRedo}
                  onCheckedChange={(checked) => updateSetting('enableUndoRedo', checked)}
                />
              </div>
              
              {settings.enableUndoRedo && (
                <div className="space-y-2">
                  <Label>จำนวนประวัติสูงสุด: {settings.maxHistorySize}</Label>
                  <Slider
                    value={[settings.maxHistorySize]}
                    onValueChange={([value]) => updateSetting('maxHistorySize', value)}
                    min={10}
                    max={200}
                    step={10}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* ความปลอดภัย */}
          <TabsContent value="security" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">การรักษาความปลอดภัย</h4>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="backup">เปิดใช้การสำรองข้อมูล</Label>
                <Switch
                  id="backup"
                  checked={settings.enableBackup}
                  onCheckedChange={(checked) => updateSetting('enableBackup', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="encrypt">เข้ารหัสข้อมูล</Label>
                <Switch
                  id="encrypt"
                  checked={settings.encryptData}
                  onCheckedChange={(checked) => updateSetting('encryptData', checked)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>หมดเวลาเซสชั่น: {settings.sessionTimeout} นาที</Label>
                <Slider
                  value={[settings.sessionTimeout]}
                  onValueChange={([value]) => updateSetting('sessionTimeout', value)}
                  min={15}
                  max={480}
                  step={15}
                />
              </div>
            </div>
          </TabsContent>
          
          {/* ข้อมูล */}
          <TabsContent value="data" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Database className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">การจัดการข้อมูล</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={handleImportDemo}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Eye className="w-4 h-4" />
                  โหลดข้อมูลตัวอย่าง
                </Button>
                
                <Button 
                  onClick={handleExportSettings}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Download className="w-4 h-4" />
                  ส่งออกการตั้งค่า
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Subnet เริ่มต้น</Label>
                <Input
                  value={settings.defaultSubnet}
                  onChange={(e) => updateSetting('defaultSubnet', e.target.value)}
                  placeholder="192.168.1.0/24"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="ipam">เปิดใช้ IPAM</Label>
                <Switch
                  id="ipam"
                  checked={settings.enableIPAM}
                  onCheckedChange={(checked) => updateSetting('enableIPAM', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="vlan">เปิดใช้ VLAN</Label>
                <Switch
                  id="vlan"
                  checked={settings.enableVLAN}
                  onCheckedChange={(checked) => updateSetting('enableVLAN', checked)}
                />
              </div>
              
              <Separator />
              
              <Button 
                onClick={handleResetSettings}
                className="flex items-center gap-2 w-full"
                variant="destructive"
              >
                <RotateCcw className="w-4 h-4" />
                รีเซ็ตการตั้งค่าทั้งหมด
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
