'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Layers, 
  Eye, 
  EyeOff, 
  Camera, 
  Cable, 
  Building, 
  Settings,
  Palette
} from 'lucide-react';

interface Layer {
  id: string;
  name: string;
  icon: React.ReactNode;
  visible: boolean;
  opacity: number;
  color: string;
  count: number;
}

interface LayersPanelProps {
  projectState?: any;
  onLayerToggle?: (layerId: string, visible: boolean) => void;
  onLayerOpacityChange?: (layerId: string, opacity: number) => void;
}

export function LayersPanel({ 
  projectState, 
  onLayerToggle, 
  onLayerOpacityChange 
}: LayersPanelProps) {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'cameras',
      name: 'กล้อง CCTV',
      icon: <Camera className="w-4 h-4" />,
      visible: true,
      opacity: 100,
      color: '#ef4444',
      count: 8
    },
    {
      id: 'network',
      name: 'อุปกรณ์เครือข่าย',
      icon: <Settings className="w-4 h-4" />,
      visible: true,
      opacity: 100,
      color: '#3b82f6',
      count: 4
    },
    {
      id: 'cables',
      name: 'สายเคเบิล',
      icon: <Cable className="w-4 h-4" />,
      visible: true,
      opacity: 80,
      color: '#10b981',
      count: 12
    },
    {
      id: 'architecture',
      name: 'สถาปัตยกรรม',
      icon: <Building className="w-4 h-4" />,
      visible: true,
      opacity: 60,
      color: '#6b7280',
      count: 0
    }
  ]);

  const handleLayerToggle = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, visible: !layer.visible }
        : layer
    ));
    
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      onLayerToggle?.(layerId, !layer.visible);
    }
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId 
        ? { ...layer, opacity }
        : layer
    ));
    
    onLayerOpacityChange?.(layerId, opacity);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-500" />
          จัดการเลเยอร์
        </h3>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {layers.map((layer) => (
          <Card key={layer.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Layer Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-4 h-4 rounded layer-color`}
                      data-color={layer.color}
                    />
                    <div className="flex items-center gap-2">
                      {layer.icon}
                      <span className="font-medium text-sm">{layer.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {layer.count}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLayerToggle(layer.id)}
                    >
                      {layer.visible ? (
                        <Eye className="w-4 h-4 text-blue-500" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                    <Switch
                      checked={layer.visible}
                      onCheckedChange={() => handleLayerToggle(layer.id)}
                    />
                  </div>
                </div>

                {/* Opacity Slider */}
                {layer.visible && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>ความทึบแสง</span>
                      <span>{layer.opacity}%</span>
                    </div>
                    <Slider
                      value={[layer.opacity]}
                      onValueChange={(value) => handleOpacityChange(layer.id, value[0])}
                      max={100}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Layer Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Palette className="w-3 h-3 mr-1" />
                    สี
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Settings className="w-3 h-3 mr-1" />
                    ตั้งค่า
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Layer Actions */}
      <div className="space-y-2 pt-4 border-t">
        <Button variant="outline" size="sm" className="w-full">
          เพิ่มเลเยอร์ใหม่
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            แสดงทั้งหมด
          </Button>
          <Button variant="outline" size="sm">
            ซ่อนทั้งหมด
          </Button>
        </div>
      </div>

      {/* Layer Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">💡 เคล็ดลับ:</p>
            <p>ใช้เลเยอร์เพื่อจัดกลุ่มและควบคุมการแสดงผลอุปกรณ์ต่างๆ</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
