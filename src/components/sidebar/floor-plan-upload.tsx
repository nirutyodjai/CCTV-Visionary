
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FloorPlanUploadProps {
  onSetFloorPlan: (file: File) => void;
  currentFloorPlanUrl: string | null;
}

export function FloorPlanUpload({ onSetFloorPlan, currentFloorPlanUrl }: FloorPlanUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file (e.g., PNG, JPG, GIF).',
          variant: 'destructive',
        });
      }
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onSetFloorPlan(selectedFile);
      setSelectedFile(null); // Reset after upload
    } else {
       toast({
          title: 'No File Selected',
          description: 'Please choose a floor plan image to upload.',
          variant: 'destructive',
       });
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-2">
       <h3 className="text-lg font-semibold mb-2">Floor Plan</h3>
        <Card className="border-dashed">
            <CardContent className="p-4 text-center">
                 <div 
                    className="flex flex-col items-center justify-center p-6 space-y-2 cursor-pointer"
                    onClick={triggerFileSelect}
                 >
                    <UploadCloud className="w-10 h-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                        {selectedFile ? selectedFile.name : 'Click or drag to upload'}
                    </p>
                    <Input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </div>
                <Button onClick={handleUploadClick} disabled={!selectedFile} className="w-full mt-2">
                    Set Floor Plan
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}
