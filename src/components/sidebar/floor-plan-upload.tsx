'use client';
import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FloorPlanUploadProps {
  currentFloor: number;
  onUpload: (file: File) => void;
}

export function FloorPlanUpload({ currentFloor, onUpload }: FloorPlanUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">แบบแปลน (สำหรับชั้น {currentFloor})</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => inputRef.current?.click()}
        >
          อัปโหลดรูปภาพ
        </Button>
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
      </CardContent>
    </Card>
  );
}
