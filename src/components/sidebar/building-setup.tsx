'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BuildingSetupProps {
  totalFloors: number;
  currentFloor: number;
  onTotalFloorsChange: (floors: number) => void;
  onCurrentFloorChange: (floor: number) => void;
}

export function BuildingSetup({
  totalFloors,
  currentFloor,
  onTotalFloorsChange,
  onCurrentFloorChange,
}: BuildingSetupProps) {
  const floorTabs = Array.from({ length: totalFloors }, (_, i) => i + 1);

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle className="text-base">ตั้งค่าอาคาร</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-4">
        <div className="flex items-center space-x-2">
          <Label htmlFor="totalFloors" className="text-sm whitespace-nowrap">
            จำนวนชั้น:
          </Label>
          <Input
            type="number"
            id="totalFloors"
            min="1"
            max="20"
            value={totalFloors}
            onChange={(e) => onTotalFloorsChange(parseInt(e.target.value, 10))}
            className="w-20 h-8 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {floorTabs.map((floor) => (
            <Button
              key={floor}
              variant={currentFloor === floor ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCurrentFloorChange(floor)}
              className="px-3 py-1 text-sm h-auto"
            >
              ชั้น {floor}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
