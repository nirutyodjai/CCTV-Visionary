'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Building, 
  MapPin, 
  Camera, 
  Shield, 
  Zap, 
  Plus,
  ArrowLeft,
  Upload,
  FileImage,
  Layers
} from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  devices: string[];
  difficulty: 'เริ่มต้น' | 'ปานกลาง' | 'ขั้นสูง';
}

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'basic-office',
    name: 'สำนักงานขนาดเล็ก',
    description: 'ระบบ CCTV พื้นฐานสำหรับสำนักงาน 1-2 ชั้น',
    icon: <Building className="w-8 h-8 text-blue-500" />,
    devices: ['กล้องโดม 4 ตัว', 'NVR 8 ช่อง', 'สวิตช์ 8 พอร์ต'],
    difficulty: 'เริ่มต้น'
  },
  {
    id: 'retail-store',
    name: 'ร้านค้าปลีก',
    description: 'ระบบรักษาความปลอดภัยสำหรับร้านค้า',
    icon: <Shield className="w-8 h-8 text-green-500" />,
    devices: ['กล้องโดม 6 ตัว', 'กล้อง PTZ 2 ตัว', 'NVR 16 ช่อง'],
    difficulty: 'ปานกลาง'
  },
  {
    id: 'warehouse',
    name: 'โรงงาน/คลังสินค้า',
    description: 'ระบบรักษาความปลอดภัยขนาดใหญ่',
    icon: <Zap className="w-8 h-8 text-orange-500" />,
    devices: ['กล้องกระสุน 12 ตัว', 'กล้อง PTZ 4 ตัว', 'NVR 32 ช่อง'],
    difficulty: 'ขั้นสูง'
  }
];

export default function NewProjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // ข้อมูลโปรเจ็กต์
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    location: '',
    clientName: '',
    clientEmail: '',
    budget: '',
    template: ''
  });

  // ข้อมูลอาคาร
  const [buildings, setBuildings] = useState([
    { id: '1', name: 'อาคารหลัก', floors: 1 }
  ]);

  // ไฟล์แบบผัง
  const [floorPlans, setFloorPlans] = useState<File[]>([]);
  
  // ขั้นตอนการสร้าง
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (templateId: string) => {
    setProjectData(prev => ({ ...prev, template: templateId }));
  };

  const handleAddBuilding = () => {
    const newBuilding = {
      id: Date.now().toString(),
      name: `อาคาร ${buildings.length + 1}`,
      floors: 1
    };
    setBuildings(prev => [...prev, newBuilding]);
  };

  const handleFloorPlanUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFloorPlans(prev => [...prev, ...files]);
  };

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) {
      toast({
        title: '❌ กรุณาใส่ชื่อโปรเจ็กต์',
        variant: 'destructive'
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // สำลิ่ก API สร้างโปรเจ็กต์
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: '✅ สร้างโปรเจ็กต์สำเร็จ',
        description: `โปรเจ็กต์ "${projectData.name}" ถูกสร้างเรียบร้อยแล้ว`
      });
      
      // ไปยังหน้าออกแบบโปรเจ็กต์
      router.push(`/projects/${Date.now()}/design`);
      
    } catch (error) {
      toast({
        title: '❌ เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างโปรเจ็กต์ได้',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">ข้อมูลโปรเจ็กต์</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="projectName">ชื่อโปรเจ็กต์ *</Label>
              <Input
                id="projectName"
                placeholder="เช่น ระบบ CCTV โรงงาน ABC"
                value={projectData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="location">สถานที่</Label>
              <Input
                id="location"
                placeholder="เช่น กรุงเทพมหานคร"
                value={projectData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="budget">งบประมาณ (บาท)</Label>
              <Input
                id="budget"
                type="number"
                placeholder="เช่น 500000"
                value={projectData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="clientName">ชื่อลูกค้า</Label>
              <Input
                id="clientName"
                placeholder="เช่น บริษัท ABC จำกัด"
                value={projectData.clientName}
                onChange={(e) => handleInputChange('clientName', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="clientEmail">อีเมลลูกค้า</Label>
              <Input
                id="clientEmail"
                type="email"
                placeholder="เช่น contact@abc.com"
                value={projectData.clientEmail}
                onChange={(e) => handleInputChange('clientEmail', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="description">รายละเอียดโปรเจ็กต์</Label>
              <Textarea
                id="description"
                placeholder="อธิบายความต้องการและรายละเอียดเพิ่มเติม"
                value={projectData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">เลือกแม่แบบโปรเจ็กต์</h2>
        <p className="text-gray-600 mb-6">เลือกแม่แบบที่เหมาะสมกับโปรเจ็กต์ของคุณ</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PROJECT_TEMPLATES.map((template) => (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                projectData.template === template.id 
                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">{template.icon}</div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge variant={
                  template.difficulty === 'เริ่มต้น' ? 'default' :
                  template.difficulty === 'ปานกลาง' ? 'secondary' : 'destructive'
                }>
                  {template.difficulty}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-700">อุปกรณ์ที่รวม:</p>
                  {template.devices.map((device, index) => (
                    <p key={index} className="text-xs text-gray-600">• {device}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">ข้อมูลอาคารและชั้น</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* รายการอาคาร */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                อาคารและชั้น
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {buildings.map((building, index) => (
                <div key={building.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <Building className="w-5 h-5 text-gray-500" />
                  <div className="flex-1">
                    <Input
                      value={building.name}
                      onChange={(e) => {
                        const newBuildings = [...buildings];
                        newBuildings[index].name = e.target.value;
                        setBuildings(newBuildings);
                      }}
                      placeholder="ชื่ออาคาร"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>ชั้น:</Label>
                    <Input
                      type="number"
                      value={building.floors}
                      onChange={(e) => {
                        const newBuildings = [...buildings];
                        newBuildings[index].floors = parseInt(e.target.value) || 1;
                        setBuildings(newBuildings);
                      }}
                      className="w-20"
                      min="1"
                    />
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={handleAddBuilding}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มอาคาร
              </Button>
            </CardContent>
          </Card>

          {/* อัปโหลดแบบผัง */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileImage className="w-5 h-5" />
                แบบผังอาคาร
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  ลากไฟล์มาวางหรือคลิกเพื่อเลือกไฟล์
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  รองรับ PNG, JPG, PDF, DWG (ขนาดไม่เกิน 10MB)
                </p>
                <Input
                  type="file"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf,.dwg"
                  onChange={handleFloorPlanUpload}
                  className="hidden"
                  id="floorplan-upload"
                />
                <Label htmlFor="floorplan-upload">
                  <Button type="button" variant="outline" asChild>
                    <span>เลือกไฟล์</span>
                  </Button>
                </Label>
              </div>
              
              {floorPlans.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">ไฟล์ที่อัปโหลด:</p>
                  {floorPlans.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <FileImage className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/projects')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">สร้างโปรเจ็กต์ใหม่</h1>
              <p className="text-gray-600">ออกแบบระบบ CCTV สำหรับโปรเจ็กต์ของคุณ</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`
                    w-16 h-1 mx-2
                    ${currentStep > step ? 'bg-blue-500' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center mb-4">
          <div className="text-sm text-gray-600">
            {currentStep === 1 && 'ขั้นตอนที่ 1: ข้อมูลพื้นฐาน'}
            {currentStep === 2 && 'ขั้นตอนที่ 2: เลือกแม่แบบ'}
            {currentStep === 3 && 'ขั้นตอนที่ 3: ข้อมูลอาคาร'}
          </div>
        </div>

        {/* Content */}
        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 max-w-6xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            ย้อนกลับ
          </Button>

          <div className="flex gap-4">
            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={currentStep === 1 && !projectData.name.trim()}
              >
                ถัดไป
              </Button>
            ) : (
              <Button
                onClick={handleCreateProject}
                disabled={isCreating}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isCreating ? 'กำลังสร้าง...' : 'สร้างโปรเจ็กต์'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
