'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  FileText, 
  TrendingUp, 
  Shield, 
  Zap,
  Download,
  Eye,
  Wand2,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ProjectState, Floor, AnyDevice, Connection } from '@/lib/types';

interface AIReportGeneratorProps {
  project: ProjectState;
  floors: Floor[];
  devices: AnyDevice[];
  connections: Connection[];
  onGenerateReport: (config: ReportConfig) => Promise<void>;
}

interface ReportConfig {
  type: 'comprehensive' | 'security' | 'performance' | 'compliance' | 'technical';
  includeAIAnalysis: boolean;
  includeRecommendations: boolean;
  includeRiskAssessment: boolean;
  includeOptimization: boolean;
  customPrompt?: string;
  language: 'th' | 'en';
  format: 'pdf' | 'docx' | 'html';
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  sections: string[];
  estimatedTime: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'comprehensive',
    name: 'รายงานโครงการแบบครบถ้วน',
    description: 'รายงานที่ครอบคลุมทุกด้านของโครงการ CCTV พร้อมการวิเคราะห์ AI',
    icon: FileText,
    sections: ['Executive Summary', 'System Architecture', 'Security Analysis', 'Performance Metrics', 'Recommendations'],
    estimatedTime: '15-20 นาที',
    complexity: 'advanced'
  },
  {
    id: 'security',
    name: 'รายงานการประเมินความปลอดภัย',
    description: 'การวิเคราะห์ความปลอดภัยและจุดเสี่ยงของระบบ CCTV',
    icon: Shield,
    sections: ['Security Overview', 'Risk Assessment', 'Vulnerability Analysis', 'Mitigation Strategies'],
    estimatedTime: '10-15 นาที',
    complexity: 'intermediate'
  },
  {
    id: 'performance',
    name: 'รายงานประสิทธิภาพระบบ',
    description: 'การวิเคราะห์ประสิทธิภาพและการใช้งานของระบบ',
    icon: TrendingUp,
    sections: ['Performance Metrics', 'Bandwidth Analysis', 'Storage Requirements', 'Optimization Tips'],
    estimatedTime: '8-12 นาที',
    complexity: 'intermediate'
  },
  {
    id: 'compliance',
    name: 'รายงานการปฏิบัติตามมาตรฐาน',
    description: 'การตรวจสอบความสอดคล้องกับมาตรฐานและระเบียบต่างๆ',
    icon: CheckCircle,
    sections: ['Compliance Overview', 'Standards Check', 'Gap Analysis', 'Action Plan'],
    estimatedTime: '12-18 นาที',
    complexity: 'advanced'
  },
  {
    id: 'technical',
    name: 'รายงานทางเทคนิค',
    description: 'รายละเอียดทางเทคนิคสำหรับทีมงานและนักพัฒนา',
    icon: Zap,
    sections: ['Technical Specifications', 'Network Topology', 'Configuration Details', 'Troubleshooting Guide'],
    estimatedTime: '5-10 นาที',
    complexity: 'basic'
  }
];

export function AIReportGenerator({ 
  project, 
  floors, 
  devices, 
  connections, 
  onGenerateReport 
}: AIReportGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('comprehensive');
  const [config, setConfig] = useState<ReportConfig>({
    type: 'comprehensive',
    includeAIAnalysis: true,
    includeRecommendations: true,
    includeRiskAssessment: true,
    includeOptimization: true,
    language: 'th',
    format: 'pdf'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const { toast } = useToast();

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    setConfig(prev => ({ ...prev, type: templateId as any }));
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) {
      toast({
        title: 'เลือกเทมเพลตรายงาน',
        description: 'กรุณาเลือกเทมเพลตรายงานที่ต้องการสร้าง',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const reportConfig = {
        ...config,
        customPrompt: customPrompt || undefined
      };

      await onGenerateReport(reportConfig);

      clearInterval(progressInterval);
      setGenerationProgress(100);

      toast({
        title: 'สร้างรายงานสำเร็จ',
        description: 'รายงาน AI ได้ถูกสร้างเรียบร้อยแล้ว',
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถสร้างรายงานได้ กรุณาลองใหม่อีกครั้ง',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const getComplexityBadge = (complexity: string) => {
    const colors = {
      basic: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      basic: 'พื้นฐาน',
      intermediate: 'ปานกลาง',
      advanced: 'ขั้นสูง'
    };

    return (
      <Badge className={colors[complexity as keyof typeof colors]}>
        {labels[complexity as keyof typeof labels]}
      </Badge>
    );
  };

  const selectedTemplateData = reportTemplates.find(t => t.id === selectedTemplate);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <CardTitle>AI Report Generator</CardTitle>
        </div>
        <CardDescription>
          สร้างรายงานโครงการแบบอัตโนมัติด้วย AI ที่ครอบคลุมและมีคุณภาพสูง
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="templates">เทมเพลต</TabsTrigger>
            <TabsTrigger value="options">ตัวเลือก</TabsTrigger>
            <TabsTrigger value="advanced">ขั้นสูง</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="space-y-4">
            <div className="grid gap-4">
              {reportTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id 
                      ? 'ring-2 ring-primary border-primary' 
                      : 'border-muted hover:border-border'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <template.icon className="w-6 h-6 text-muted-foreground mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{template.name}</h4>
                          {getComplexityBadge(template.complexity)}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>⏱️ {template.estimatedTime}</span>
                          <span>📄 {template.sections.length} หัวข้อ</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.sections.slice(0, 3).map((section, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                          {template.sections.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.sections.length - 3} อื่นๆ
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="options" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ai-analysis">รวมการวิเคราะห์ AI</Label>
                <Switch
                  id="ai-analysis"
                  checked={config.includeAIAnalysis}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeAIAnalysis: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="recommendations">คำแนะนำและข้อเสนอแนะ</Label>
                <Switch
                  id="recommendations"
                  checked={config.includeRecommendations}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeRecommendations: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="risk-assessment">การประเมินความเสี่ยง</Label>
                <Switch
                  id="risk-assessment"
                  checked={config.includeRiskAssessment}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeRiskAssessment: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="optimization">ข้อเสนอแนะการปรับปรุง</Label>
                <Switch
                  id="optimization"
                  checked={config.includeOptimization}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, includeOptimization: checked }))
                  }
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>ภาษา</Label>
                  <Select 
                    value={config.language} 
                    onValueChange={(value: 'th' | 'en') => 
                      setConfig(prev => ({ ...prev, language: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="th">ไทย</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>รูปแบบไฟล์</Label>
                  <Select 
                    value={config.format} 
                    onValueChange={(value: 'pdf' | 'docx' | 'html') => 
                      setConfig(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="docx">Word Document</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">คำสั่ง AI แบบกำหนดเอง</Label>
                <Textarea
                  id="custom-prompt"
                  placeholder="เพิ่มคำสั่งเฉพาะสำหรับ AI เช่น 'เน้นการวิเคราะห์ด้านความปลอดภัย' หรือ 'รวมข้อมูลการคำนวณค่าใช้จ่าย'"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  คำสั่งนี้จะช่วยให้ AI เข้าใจความต้องการเฉพาะของคุณมากขึ้น
                </p>
              </div>

              {selectedTemplateData && (
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      พรีวิวรายงานที่เลือก
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>เทมเพลต:</strong> {selectedTemplateData.name}</p>
                      <p><strong>หัวข้อหลัก:</strong></p>
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        {selectedTemplateData.sections.map((section, index) => (
                          <li key={index}>{section}</li>
                        ))}
                      </ul>
                      <p><strong>เวลาโดยประมาณ:</strong> {selectedTemplateData.estimatedTime}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>กำลังสร้างรายงาน...</span>
              <span>{Math.round(generationProgress)}%</span>
            </div>
            <Progress value={generationProgress} className="w-full" />
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating || !selectedTemplate}
            className="flex-1"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {isGenerating ? 'กำลังสร้าง...' : 'สร้างรายงาน AI'}
          </Button>
          
          {selectedTemplateData && (
            <Button variant="outline" size="icon">
              <Eye className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
