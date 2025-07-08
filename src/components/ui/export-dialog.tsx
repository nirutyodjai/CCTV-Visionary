'use client';

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ExportService, type ExportOptions, type ExportData } from '@/lib/export.service';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileImage, 
  Code,
  Cog,
  Printer,
  Check
} from 'lucide-react';
import type { ProjectState, Floor, AnyDevice, Connection } from '@/lib/types';

interface ExportDialogProps {
  project: ProjectState;
  floors: Floor[];
  devices: AnyDevice[];
  connections: Connection[];
  canvas?: HTMLCanvasElement;
}

export interface ExportDialogRef {
  open: () => void;
  close: () => void;
}

const exportFormats = [
  { 
    id: 'pdf', 
    name: 'PDF Report', 
    description: 'Professional PDF report with floor plans and device lists',
    icon: FileText,
    badge: 'Popular'
  },
  { 
    id: 'excel', 
    name: 'Excel Spreadsheet', 
    description: 'Detailed spreadsheet with devices, connections, and BOM',
    icon: FileSpreadsheet,
    badge: 'Business'
  },
  { 
    id: 'image', 
    name: 'Floor Plan Image', 
    description: 'High-quality PNG image of the floor plan',
    icon: FileImage,
    badge: 'Quick'
  },
  { 
    id: 'json', 
    name: 'Project Data', 
    description: 'Complete project data in JSON format',
    icon: Code,
    badge: 'Technical'
  },
  { 
    id: 'csv', 
    name: 'CSV Data', 
    description: 'Device and connection data in CSV format',
    icon: FileSpreadsheet,
    badge: null
  },
  { 
    id: 'dxf', 
    name: 'CAD Drawing', 
    description: 'Basic DXF file for CAD applications',
    icon: Cog,
    badge: 'CAD'
  }
];

export const ExportDialog = forwardRef<ExportDialogRef, ExportDialogProps>(({ project, floors, devices, connections, canvas }, ref) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [options, setOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeDevices: true,
    includeConnections: true,
    includeFloorPlan: true,
    includeBOM: true,
    includeReport: true,
    quality: 'high',
    paperSize: 'A4',
    orientation: 'portrait'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [exportHistory, setExportHistory] = useState<Array<{
    id: string;
    format: string;
    timestamp: Date;
    filename: string;
    size: string;
  }>>([]);
  const [exportSuccess, setExportSuccess] = useState(false);
  const { toast } = useToast();

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }));

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportProgress(0);

      const exportData: ExportData = {
        project,
        floors,
        devices,
        connections,
        canvas,
        timestamp: new Date().toISOString().split('T')[0],
        version: '1.0'
      };

      const finalOptions = { ...options, format: selectedFormat as any };
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      await ExportService.getInstance().exportProject(exportData, finalOptions);
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      toast({
        title: "Export Successful!",
        description: `${exportFormats.find(f => f.id === selectedFormat)?.name} has been downloaded.`,
        duration: 3000,
      });

      setTimeout(() => {
        setIsOpen(false);
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);

    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your project. Please try again.",
        variant: "destructive",
      });
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const selectedFormatData = exportFormats.find(f => f.id === selectedFormat);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Project
          </DialogTitle>
          <DialogDescription>
            Export your CCTV project in various formats for documentation, analysis, or sharing.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Format Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Export Format</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exportFormats.map((format) => (
                <Card 
                  key={format.id}
                  className={`cursor-pointer transition-all ${
                    selectedFormat === format.id 
                      ? 'border-primary bg-primary/5' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedFormat(format.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between text-base">
                      <div className="flex items-center gap-2">
                        <format.icon className="w-4 h-4" />
                        {format.name}
                      </div>
                      {format.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {format.badge}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {format.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Export Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Content Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Content</CardTitle>
                  <CardDescription>Choose what to include in your export</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeDevices"
                      checked={options.includeDevices}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeDevices: checked as boolean }))}
                    />
                    <Label htmlFor="includeDevices">Device List</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeConnections"
                      checked={options.includeConnections}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeConnections: checked as boolean }))}
                    />
                    <Label htmlFor="includeConnections">Connections</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeFloorPlan"
                      checked={options.includeFloorPlan}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeFloorPlan: checked as boolean }))}
                    />
                    <Label htmlFor="includeFloorPlan">Floor Plan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeBOM"
                      checked={options.includeBOM}
                      onCheckedChange={(checked) => setOptions(prev => ({ ...prev, includeBOM: checked as boolean }))}
                    />
                    <Label htmlFor="includeBOM">Bill of Materials</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Format Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Format Settings</CardTitle>
                  <CardDescription>Configure export format options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(selectedFormat === 'pdf' || selectedFormat === 'image') && (
                    <div className="space-y-2">
                      <Label>Quality</Label>
                      <Select value={options.quality} onValueChange={(value) => setOptions(prev => ({ ...prev, quality: value as any }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {selectedFormat === 'pdf' && (
                    <>
                      <div className="space-y-2">
                        <Label>Paper Size</Label>
                        <Select value={options.paperSize} onValueChange={(value) => setOptions(prev => ({ ...prev, paperSize: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A4">A4</SelectItem>
                            <SelectItem value="A3">A3</SelectItem>
                            <SelectItem value="Letter">Letter</SelectItem>
                            <SelectItem value="Legal">Legal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Orientation</Label>
                        <Select value={options.orientation} onValueChange={(value) => setOptions(prev => ({ ...prev, orientation: value as any }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Export Preview */}
          {selectedFormatData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <selectedFormatData.icon className="w-4 h-4" />
                  Export Preview
                </CardTitle>
                <CardDescription>
                  {selectedFormatData.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Project:</span>
                    <span className="font-medium">{project.projectName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Devices:</span>
                    <span className="font-medium">{devices.length} devices</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connections:</span>
                    <span className="font-medium">{connections.length} connections</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Format:</span>
                    <span className="font-medium">{selectedFormatData.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Progress */}
          {isExporting && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Exporting...</span>
                    <span className="text-sm text-muted-foreground">{exportProgress}%</span>
                  </div>
                  <Progress value={exportProgress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isExporting}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport} 
              disabled={isExporting || exportProgress === 100}
              className="min-w-24"
            >
              {isExporting ? (
                exportProgress === 100 ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Printer className="w-4 h-4 animate-pulse" />
                )
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? (exportProgress === 100 ? 'Complete' : 'Exporting...') : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

ExportDialog.displayName = 'ExportDialog';
