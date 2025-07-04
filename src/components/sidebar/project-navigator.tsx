
import type { Building } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

interface ProjectNavigatorProps {
  buildings: Building[];
  activeFloorId: string | null;
  onFloorSelect: (buildingId: string, floorId: string) => void;
}

export function ProjectNavigator({ buildings, activeFloorId, onFloorSelect }: ProjectNavigatorProps) {
  return (
    <div className="p-2">
      <h3 className="text-lg font-semibold mb-2">Project Navigator</h3>
      <Accordion type="multiple" defaultValue={buildings.map(b => b.id)}>
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
