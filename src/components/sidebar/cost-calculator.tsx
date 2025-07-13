'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Download,
  RefreshCw,
  ShoppingCart,
  Zap,
  FileText,
  Eye,
  EyeOff
} from 'lucide-react';

interface CostItem {
  id: string;
  name: string;
  category: 'camera' | 'nvr' | 'network' | 'cable' | 'installation' | 'other';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  description?: string;
}

interface CostCalculatorProps {
  projectDevices?: any[];
  onExportReport?: () => void;
  onRequestQuote?: () => void;
}

export function CostCalculator({ 
  projectDevices = [], 
  onExportReport, 
  onRequestQuote 
}: CostCalculatorProps) {
  const [costItems, setCostItems] = useState<CostItem[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [budget, setBudget] = useState(300000); // งบประมาณเริ่มต้น 300,000 บาท

  // คำนวณต้นทุนอัตโนมัติจากอุปกรณ์ในโปรเจค
  useEffect(() => {
    const calculateCosts = () => {
      const items: CostItem[] = [];

      // ราคาต่อหน่วยของอุปกรณ์แต่ละประเภท
      const pricing = {
        'cctv-dome': { price: 12000, name: 'กล้อง Dome IP' },
        'cctv-bullet': { price: 10000, name: 'กล้อง Bullet IP' },
        'cctv-ptz': { price: 35000, name: 'กล้อง PTZ' },
        'nvr': { price: 25000, name: 'เครื่องบันทึก NVR' },
        'switch': { price: 8000, name: 'Switch PoE' },
        'router': { price: 3500, name: 'Router' },
        'monitor': { price: 15000, name: 'จอแสดงผล' },
        'utp-cat6': { price: 8, name: 'สาย UTP CAT6 (ต่อเมตร)' },
        'fiber-optic': { price: 25, name: 'สายใยแก้วนำแสง (ต่อเมตร)' }
      };

      // นับจำนวนอุปกรณ์แต่ละประเภท
      const deviceCounts: Record<string, number> = {};
      projectDevices.forEach(device => {
        const type = device.type || 'other';
        deviceCounts[type] = (deviceCounts[type] || 0) + 1;
      });

      // สร้างรายการต้นทุนจากอุปกรณ์
      Object.entries(deviceCounts).forEach(([type, quantity]) => {
        const priceInfo = pricing[type as keyof typeof pricing];
        if (priceInfo) {
          const unitPrice = priceInfo.price;
          const totalPrice = unitPrice * quantity;
          
          items.push({
            id: type,
            name: priceInfo.name,
            category: getCategoryFromType(type),
            quantity,
            unitPrice,
            totalPrice,
            description: `${quantity} หน่วย × ${unitPrice.toLocaleString()} บาท`
          });
        }
      });

      // เพิ่มค่าติดตั้งและค่าใช้จ่ายอื่นๆ
      const totalDeviceCost = items.reduce((sum, item) => sum + item.totalPrice, 0);
      
      items.push({
        id: 'installation',
        name: 'ค่าติดตั้งและเดินสาย',
        category: 'installation',
        quantity: 1,
        unitPrice: Math.round(totalDeviceCost * 0.15),
        totalPrice: Math.round(totalDeviceCost * 0.15),
        description: '15% ของมูลค่าอุปกรณ์'
      });

      items.push({
        id: 'warranty',
        name: 'การรับประกันและบำรุงรักษา (1 ปี)',
        category: 'other',
        quantity: 1,
        unitPrice: Math.round(totalDeviceCost * 0.1),
        totalPrice: Math.round(totalDeviceCost * 0.1),
        description: '10% ของมูลค่าอุปกรณ์'
      });

      setCostItems(items);
    };

    calculateCosts();
  }, [projectDevices]);

  const getCategoryFromType = (type: string): CostItem['category'] => {
    if (type.startsWith('cctv-')) return 'camera';
    if (type === 'nvr') return 'nvr';
    if (['switch', 'router'].includes(type)) return 'network';
    if (['utp-cat6', 'fiber-optic'].includes(type)) return 'cable';
    return 'other';
  };

  const totalCost = costItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const budgetUsage = (totalCost / budget) * 100;

  const categoryTotals = costItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.totalPrice;
    return acc;
  }, {} as Record<string, number>);

  const categoryNames = {
    camera: 'กล้อง CCTV',
    nvr: 'เครื่องบันทึก',
    network: 'อุปกรณ์เครือข่าย',
    cable: 'สายเคเบิล',
    installation: 'ค่าติดตั้ง',
    other: 'อื่นๆ'
  };

  const categoryColors = {
    camera: 'bg-red-500',
    nvr: 'bg-blue-500',
    network: 'bg-green-500',
    cable: 'bg-orange-500',
    installation: 'bg-purple-500',
    other: 'bg-gray-500'
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5 text-green-500" />
          คำนวณต้นทุน
        </h3>
        <Badge variant={budgetUsage > 100 ? "destructive" : "secondary"}>
          {budgetUsage.toFixed(1)}% ของงบประมาณ
        </Badge>
      </div>

      {/* Cost Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-green-800">ต้นทุนรวม</span>
              <span className="text-2xl font-bold text-green-600">
                ฿{totalCost.toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>งบประมาณ: ฿{budget.toLocaleString()}</span>
                <span className={budgetUsage > 100 ? 'text-red-600' : 'text-green-600'}>
                  {budgetUsage > 100 ? 'เกิน' : 'เหลือ'} ฿{Math.abs(budget - totalCost).toLocaleString()}
                </span>
              </div>
              <Progress 
                value={Math.min(budgetUsage, 100)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            แยกตามหมวดหมู่
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(categoryTotals).map(([category, amount]) => {
            const percentage = (amount / totalCost) * 100;
            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${categoryColors[category as keyof typeof categoryColors]}`} />
                    <span className="text-sm font-medium">
                      {categoryNames[category as keyof typeof categoryNames]}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">฿{amount.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={percentage} className="h-1" />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" />
              รายละเอียดค่าใช้จ่าย
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>
        {showDetails && (
          <CardContent className="space-y-3">
            {costItems.map((item) => (
              <div key={item.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500">{item.description}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">฿{item.totalPrice.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">
                      {item.quantity} × ฿{item.unitPrice.toLocaleString()}
                    </div>
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => setCostItems([])}>
          <RefreshCw className="w-4 h-4 mr-2" />
          คำนวณใหม่
        </Button>
        <Button variant="outline" onClick={onExportReport}>
          <Download className="w-4 h-4 mr-2" />
          ส่งออก PDF
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button className="w-full bg-green-500 hover:bg-green-600" onClick={onRequestQuote}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          ขอใบเสนอราคา
        </Button>
        
        <Button variant="outline" className="w-full">
          <Zap className="w-4 h-4 mr-2" />
          เปรียบเทียบทางเลือก
        </Button>
      </div>

      {/* Cost Insights */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-3">
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">💡 คำแนะนำ:</p>
            <ul className="space-y-1 text-xs">
              <li>• ต้นทุนกล้องควรอยู่ที่ 60-70% ของงบประมาณทั้งหมด</li>
              <li>• ค่าติดตั้งปกติอยู่ที่ 10-20% ของมูลค่าอุปกรณ์</li>
              <li>• ควรจัดสรรงบสำรองอีก 10% สำหรับค่าใช้จ่ายไม่คาดคิด</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
