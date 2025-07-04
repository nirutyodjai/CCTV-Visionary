'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface PlanManagementProps {
  planName: string;
  onPlanNameChange: (name: string) => void;
}

export function PlanManagement({ planName, onPlanNameChange }: PlanManagementProps) {
  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">การจัดการแผน</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2">
        <div className="flex items-center space-x-2">
          <Input
            id="planName"
            placeholder="ใส่ชื่อแผน"
            className="h-8"
            value={planName}
            onChange={(e) => onPlanNameChange(e.target.value)}
          />
          <Button size="sm" className="h-8 whitespace-nowrap" disabled>
            บันทึก
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Input id="planIdInput" placeholder="ใส่ ID แผนเพื่อโหลด" className="h-8" disabled />
          <Button size="sm" variant="secondary" className="h-8" disabled>
            โหลด
          </Button>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          ฟังก์ชันบันทึก/โหลดจะถูกนำมาใช้ในอนาคต
        </p>
      </CardContent>
    </Card>
  );
}
