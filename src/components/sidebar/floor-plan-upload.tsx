'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


interface FloorPlanUploadProps {
  onSetFloorPlan: (file: File) => void;
}

export function FloorPlanUpload({ onSetFloorPlan }: FloorPlanUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        // Automatically trigger upload on file selection
        onSetFloorPlan(file);
        setSelectedFile(null); 
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file (e.g., PNG, JPG).',
          variant: 'destructive',
        });
      }
    }
  };
  
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
      <Accordion type="single" collapsible defaultValue="floorplan">
        <AccordionItem value="floorplan">
            <AccordionTrigger className="text-base px-2">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Floor Plan
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                        <div 
                            className="flex flex-col items-center justify-center p-4 space-y-2 cursor-pointer"
                            onClick={triggerFileSelect}
                        >
                            <UploadCloud className="w-8 h-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                                {selectedFile ? selectedFile.name : 'Click to upload a floor plan image'}
                            </p>
                            <Input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                        </div>
                    </CardContent>
                </Card>
            </AccordionContent>
        </AccordionItem>
      </Accordion>
  );
}
