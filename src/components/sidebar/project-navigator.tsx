import * as React from 'react';
import type { Building } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';

interface ProjectNavigatorProps {
  buildings: Building[];
  activeFloorId: string | null;
  onFloorSelect: (buildingId: string, floorId: string) => void;
  onMasterPlanSelect: () => void;
  isMasterPlanActive: boolean;
}

export function ProjectNavigator({ buildings, activeFloorId, onFloorSelect, onMasterPlanSelect, isMasterPlanActive }: ProjectNavigatorProps) {
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  // When buildings are loaded or change, update the open accordion items
  React.useEffect(() => {
    setOpenItems(buildings.map(b => b.id));
  }, [buildings]);

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2 px-2 uppercase text-muted-foreground">Project Navigator</h3>
      <div className="px-2 pb-2">
        <Button
            variant={isMasterPlanActive ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={onMasterPlanSelect}
        >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Master Plan
        </Button>
      </div>
      <Accordion 
        type="multiple" 
        value={openItems}
        onValueChange={setOpenItems}
        className="w-full"
      >
        {buildings.map((building) => (
          <AccordionItem key={building.id} value={building.id}>
            <AccordionTrigger className="px-2">{building.name}</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col space-y-1 pl-2">
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
