'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Building, Plus, Trash2, FilePlus } from 'lucide-react';

interface ProjectNavigatorProps {
  buildings: any[]; // Replace with Building[] from types
  activeFloorId: string | null;
  onSelectFloor: (floorId: string, buildingId: string) => void;
  onAddBuilding: () => void;
  onAddFloor: (buildingId: string) => void;
  // Add onDelete handlers later
}

export function ProjectNavigator({
  buildings,
  activeFloorId,
  onSelectFloor,
  onAddBuilding,
  onAddFloor
}: ProjectNavigatorProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-base">Project Navigator</CardTitle>
        <Button size="sm" variant="outline" onClick={onAddBuilding}>
          <Building className="h-4 w-4 mr-2" />
          เพิ่มอาคาร
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <Accordion type="multiple" collapsible className="w-full">
          {buildings.map(building => (
            <AccordionItem key={building.id} value={building.id}>
              <AccordionTrigger>{building.name}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {building.floors.map(floor => (
                    <Button
                      key={floor.id}
                      variant={activeFloorId === floor.id ? 'secondary' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => onSelectFloor(floor.id, building.id)}
                    >
                      {floor.name}
                    </Button>
                  ))}
                  <Button size="sm" variant="outline" className="w-full" onClick={() => onAddFloor(building.id)}>
                    <FilePlus className="h-4 w-4 mr-2" />
                    เพิ่มชั้น
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
