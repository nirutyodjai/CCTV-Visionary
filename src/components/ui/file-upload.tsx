'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileImage, 
  FileText, 
  FileSpreadsheet, 
  FileVideo,
  FileCode,
  Trash2,
  Eye,
  Download,
  FileCheck,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFilesUpload: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in MB
  multiple?: boolean;
  title?: string;
  description?: string;
  enablePreview?: boolean;
  enableCompression?: boolean;
  autoUpload?: boolean;
  cloudStorage?: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  preview?: string;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return FileImage;
  if (type.startsWith('video/')) return FileVideo;
  if (type.includes('text') || type.includes('json') || type.includes('xml')) return FileText;
  if (type.includes('sheet') || type.includes('csv') || type.includes('excel')) return FileSpreadsheet;
  if (type.includes('pdf')) return FileText;
  if (type.includes('dwg') || type.includes('dxf') || type.includes('cad')) return FileCode;
  return FileText;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUpload({
  onFilesUpload,
  acceptedTypes = [
    'image/*',
    'application/pdf',
    'text/*',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
    '.dwg',
    '.dxf',
    '.csv'
  ],
  maxFiles = 10,
  maxSize = 10, // 10MB
  multiple = true,
  title = 'อัพโหลดไฟล์',
  description = 'ลากไฟล์มาวางหรือคลิกเพื่อเลือกไฟล์'
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((files: FileList) => {
    const newFiles = Array.from(files).slice(0, maxFiles);
    
    // Validate files
    const validFiles = newFiles.filter(file => {
      const sizeInMB = file.size / (1024 * 1024);
      if (sizeInMB > maxSize) {
        toast({
          title: 'ไฟล์ใหญ่เกินไป',
          description: `${file.name} มีขนาด ${formatFileSize(file.size)} ซึ่งเกินกำหนด ${maxSize}MB`,
          variant: 'destructive'
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const fileObjects: UploadedFile[] = validFiles.map(file => ({
      file,
      id: `${file.name}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      progress: 0,
      status: 'uploading'
    }));

    setUploadedFiles(prev => [...prev, ...fileObjects]);

    // Simulate upload process
    fileObjects.forEach(fileObj => {
      simulateUpload(fileObj.id);
    });

    onFilesUpload(validFiles);
  }, [maxFiles, maxSize, onFilesUpload, toast]);

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: 100, status: 'success' } : f
        ));
      } else {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: Math.round(progress) } : f
        ));
      }
    }, 200);
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
      handleFileSelect(files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">ลากไฟล์มาวางที่นี่</p>
          <p className="text-sm text-muted-foreground mb-4">
            หรือคลิกเพื่อเลือกไฟล์
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline">รูปภาพ</Badge>
            <Badge variant="outline">PDF</Badge>
            <Badge variant="outline">Excel</Badge>
            <Badge variant="outline">CSV</Badge>
            <Badge variant="outline">DWG/DXF</Badge>
            <Badge variant="outline">JSON</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            สูงสุด {maxFiles} ไฟล์, ขนาดไฟล์ละไม่เกิน {maxSize}MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Upload Progress */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">ไฟล์ที่อัพโหลด ({uploadedFiles.length})</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFiles}
                className="h-8"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                ล้างทั้งหมด
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadedFiles.map(fileObj => {
                const Icon = getFileIcon(fileObj.file.type);
                return (
                  <div
                    key={fileObj.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                  >
                    <Icon className="w-8 h-8 text-muted-foreground flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{fileObj.file.name}</p>
                        <Badge 
                          variant={fileObj.status === 'success' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {fileObj.status === 'uploading' && 'อัพโหลด'}
                          {fileObj.status === 'success' && 'สำเร็จ'}
                          {fileObj.status === 'error' && 'ข้อผิดพลาด'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(fileObj.file.size)}</span>
                        <span>•</span>
                        <span>{fileObj.file.type || 'ไม่ระบุประเภท'}</span>
                      </div>
                      
                      {fileObj.status === 'uploading' && (
                        <Progress value={fileObj.progress} className="mt-2 h-2" />
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {fileObj.status === 'success' && (
                        <FileCheck className="w-5 h-5 text-green-500" />
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileObj.id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* File Type Support */}
        <div className="space-y-3">
          <Separator />
          <div>
            <h4 className="font-medium mb-2">ประเภทไฟล์ที่รองรับ</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <p className="font-medium">รูปภาพ</p>
                <p className="text-muted-foreground">JPG, PNG, GIF, SVG</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">เอกสาร</p>
                <p className="text-muted-foreground">PDF, TXT, JSON</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">ตารางคำนวณ</p>
                <p className="text-muted-foreground">Excel, CSV</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium">CAD</p>
                <p className="text-muted-foreground">DWG, DXF</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
