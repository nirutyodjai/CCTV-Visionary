import * as React from 'react';
import type { Building } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

interface ProjectNavigatorProps {
  buildings: Building[];
  activeFloorId: string | null;
  onFloorSelect: (buildingId: string, floorId: string) => void;
}

export function ProjectNavigator({ buildings, activeFloorId, onFloorSelect }: ProjectNavigatorProps) {
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  // When buildings are loaded or change, update the open accordion items
  React.useEffect(() => {
    setOpenItems(buildings.map(b => b.id));
  }, [buildings]);

  return (
    <div className="p-2">
      <h3 className="text-lg font-semibold mb-2">Project Navigator</h3>
      <Accordion 
        type="multiple" 
        value={openItems}
        onValueChange={setOpenItems}
        className="w-full"
      >
        {buildings.map((building) => (
          <AccordionItem key={building.id} value={building.id}>
            <AccordionTrigger>{building.name}</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col space-y-1">
                {building.floors.map((floor) => (
                  <Button
                    key={floor.id}
                    variant={floor.id === activeFloorId ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => onFloorSelect(building.id, floor.id)}
                  >
                    {floor.name}
                  </Button>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
