'use client';

import * as React from 'react';
import type { Building } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Save } from 'lucide-react';
import { NavigatorIcon } from '@/components/icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface ProjectNavigatorProps {
  buildings: Building[];
  activeBuildingId: string | null;
  activeFloorId: string | null;
  onFloorSelect: (buildingId: string, floorId: string) => void;
  onAddFloor: (buildingId: string) => void;
  onUpdateBuildingName: (buildingId: string, newName: string) => void;
}

export function ProjectNavigator({
  buildings,
  activeBuildingId,
  activeFloorId,
  onFloorSelect,
  onAddFloor,
  onUpdateBuildingName,
}: ProjectNavigatorProps) {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [buildingName, setBuildingName] = React.useState('');

  const activeBuilding = React.useMemo(() => buildings.find(b => b.id === activeBuildingId), [buildings, activeBuildingId]);

  React.useEffect(() => {
    if (activeBuilding) {
      setBuildingName(activeBuilding.name);
    }
  }, [activeBuilding]);

  const handleBuildingSelect = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    if (building?.floors.length) {
      onFloorSelect(building.id, building.floors[0].id);
    }
    setIsEditingName(false);
  };
  
  const handleSaveName = () => {
      if(activeBuildingId && buildingName.trim()){
          onUpdateBuildingName(activeBuildingId, buildingName.trim());
          setIsEditingName(false);
      }
  }

  return (
    <Card>
        <CardHeader className="p-3 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <NavigatorIcon className="w-4 h-4"/>
                Building Plan
            </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
             {buildings.length > 1 ? (
                <Select onValueChange={handleBuildingSelect} value={activeBuildingId ?? ''}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select a building" />
                    </SelectTrigger>
                    <SelectContent>
                        {buildings.map(b => (
                            <SelectItem key={b.id} value={b.id}>
                                {b.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
             ) : null}

            {activeBuilding && (
                <>
                    {isEditingName ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={buildingName}
                                onChange={e => setBuildingName(e.target.value)}
                                className="h-9"
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                            />
                            <Button size="icon" className="h-9 w-9" onClick={handleSaveName}><Save className="w-4 h-4"/></Button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between h-9 px-2">
                           <h3 className="font-semibold text-sm truncate">{activeBuilding.name}</h3>
                           <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsEditingName(true)}>
                                <Edit className="w-4 h-4" />
                           </Button>
                        </div>
                    )}
                    
                    <Separator />

                    <div className="flex flex-col space-y-1">
                        {activeBuilding.floors.map((floor) => (
                        <Button
                            key={floor.id}
                            variant={floor.id === activeFloorId ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-8 text-xs font-normal"
                            onClick={() => onFloorSelect(activeBuilding.id, floor.id)}
                        >
                            {floor.name}
                        </Button>
                        ))}
                         <Button
                            variant="ghost"
                            className="w-full justify-start h-8 text-xs font-normal text-muted-foreground"
                            onClick={() => onAddFloor(activeBuilding.id)}
                        >
                            <PlusCircle className="w-3 h-3 mr-2" />
                            เพิ่มชั้น
                        </Button>
                    </div>
                </>
            )}

             {buildings.length === 0 && (
                <div className="text-center text-xs text-muted-foreground py-4">
                    ยังไม่มีอาคารในโครงการนี้
                </div>
            )}
        </CardContent>
    </Card>
  );
}
