'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileImage, 
  Download, 
  RotateCcw, 
  Move, 
  ZoomIn, 
  ZoomOut,
  Grid,
  Image as ImageIcon,
  Ruler
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FloorPlanUploadAdvancedProps {
  onUpload: (file: File, metadata: FloorPlanMetadata) => void;
  currentFloorPlan?: string;
}

interface FloorPlanMetadata {
  scale: number; // pixels per meter
  rotation: number; // degrees
  offsetX: number;
  offsetY: number;
  width: number; // actual width in meters
  height: number; // actual height in meters
  fileName: string;
}

export function FloorPlanUploadAdvanced({ onUpload, currentFloorPlan }: FloorPlanUploadAdvancedProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentFloorPlan || null);
  const [isDragging, setIsDragging] = useState(false);
  const [metadata, setMetadata] = useState<FloorPlanMetadata>({
    scale: 50, // 50 pixels per meter
    rotation: 0,
    offsetX: 0,
    offsetY: 0,
    width: 20, // 20 meters
    height: 15, // 15 meters
    fileName: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'ไฟล์ไม่ถูกต้อง',
        description: 'กรุณาเลือกไฟล์รูปภาพ (JPG, PNG, GIF, SVG)',
        variant: 'destructive'
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: 'ไฟล์ใหญ่เกินไป',
        description: 'ขนาดไฟล์ต้องไม่เกิน 10MB',
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    setMetadata(prev => ({ ...prev, fileName: file.name }));
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: 'ไม่พบไฟล์',
        description: 'กรุณาเลือกไฟล์แบบผังก่อน',
        variant: 'destructive'
      });
      return;
    }

    onUpload(selectedFile, metadata);
    toast({
      title: 'อัพโหลดสำเร็จ',
      description: `แบบผัง ${metadata.fileName} ถูกอัพโหลดเรียบร้อย`
    });
  };

  const resetSettings = () => {
    setMetadata({
      scale: 50,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      width: 20,
      height: 15,
      fileName: selectedFile?.name || ''
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          อัพโหลดแบบผังอาคาร
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">อัพโหลด</TabsTrigger>
            <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
            <TabsTrigger value="preview">ดูตัวอย่าง</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {/* Upload Area */}
            <div
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                ${isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileImage className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">ลากไฟล์แบบผังมาวางที่นี่</p>
              <p className="text-sm text-muted-foreground mb-4">
                หรือคลิกเพื่อเลือกไฟล์
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline">JPG</Badge>
                <Badge variant="outline">PNG</Badge>
                <Badge variant="outline">GIF</Badge>
                <Badge variant="outline">SVG</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                ขนาดไฟล์ไม่เกิน 10MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {selectedFile && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">ตั้งค่าขนาดและมาตราส่วน</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">ความกว้าง (เมตร)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={metadata.width}
                    onChange={(e) => setMetadata(prev => ({ ...prev, width: parseInt(e.target.value) || 20 }))}
                    min="1"
                    max="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">ความยาว (เมตร)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={metadata.height}
                    onChange={(e) => setMetadata(prev => ({ ...prev, height: parseInt(e.target.value) || 15 }))}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="scale">มาตราส่วน: {metadata.scale} พิกเซลต่อเมตร</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-8">10</span>
                  <Slider
                    value={[metadata.scale]}
                    onValueChange={([value]: [number]) => setMetadata(prev => ({ ...prev, scale: value }))}
                    min={10}
                    max={200}
                    step={5}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-8">200</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  ขนาดจริง: {Math.round(metadata.width * metadata.scale)} × {Math.round(metadata.height * metadata.scale)} พิกเซล
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rotation">การหมุน: {metadata.rotation}°</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-8">-180°</span>
                  <Slider
                    value={[metadata.rotation]}
                    onValueChange={([value]: [number]) => setMetadata(prev => ({ ...prev, rotation: value }))}
                    min={-180}
                    max={180}
                    step={15}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-8">180°</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center gap-2">
                <Move className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">ตำแหน่งและการจัดตำแหน่ง</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="offsetX">ออฟเซ็ต X</Label>
                  <Input
                    id="offsetX"
                    type="number"
                    value={metadata.offsetX}
                    onChange={(e) => setMetadata(prev => ({ ...prev, offsetX: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offsetY">ออฟเซ็ต Y</Label>
                  <Input
                    id="offsetY"
                    type="number"
                    value={metadata.offsetY}
                    onChange={(e) => setMetadata(prev => ({ ...prev, offsetY: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetSettings} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                รีเซ็ต
              </Button>
              <Button onClick={handleUpload} className="flex-1" disabled={!selectedFile}>
                <Upload className="w-4 h-4 mr-2" />
                อัพโหลด
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {previewUrl ? (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">ตัวอย่างแบบผัง</h4>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="relative bg-white rounded border overflow-hidden" style={{ height: '300px' }}>
                    <img
                      src={previewUrl}
                      alt="Floor plan preview"
                      className="w-full h-full object-contain"
                      style={{
                        transform: `rotate(${metadata.rotation}deg) translate(${metadata.offsetX}px, ${metadata.offsetY}px)`
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs">
                      {metadata.scale} px/m
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">ขนาด</p>
                    <p className="text-muted-foreground">{metadata.width} × {metadata.height} เมตร</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">มาตราส่วน</p>
                    <p className="text-muted-foreground">{metadata.scale} พิกเซล/เมตร</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileImage className="w-12 h-12 mx-auto mb-4" />
                <p>ไม่มีแบบผังแสดง</p>
                <p className="text-sm">กรุณาอัพโหลดแบบผังก่อน</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
