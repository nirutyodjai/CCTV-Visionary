import * as React from 'react';
import type { Building } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProjectNavigatorProps {
  buildings: Building[];
  activeFloorId: string | null;
  onFloorSelect: (buildingId: string, floorId: string) => void;
}

export function ProjectNavigator({ buildings, activeFloorId, onFloorSelect }: ProjectNavigatorProps) {
  const [openItems, setOpenItems] = React.useState<string[]>([]);

  // When buildings are loaded or change, keep the accordions open
  React.useEffect(() => {
    setOpenItems(buildings.map(b => b.id));
  }, [buildings]);

  return (
    <Card>
        <CardHeader className="p-3 border-b">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4"/>
                Building Plan
            </CardTitle>
        </CardHeader>
        <CardContent className="p-1">
             <Accordion 
                type="multiple" 
                value={openItems}
                onValueChange={setOpenItems}
                className="w-full"
            >
                {buildings.map((building) => (
                <AccordionItem key={building.id} value={building.id} className="border-none">
                    <AccordionTrigger className="px-2 py-1.5 text-sm hover:no-underline font-semibold rounded-md hover:bg-muted">
                        {building.name}
                    </AccordionTrigger>
                    <AccordionContent className="pb-1 pt-1">
                    <div className="flex flex-col space-y-1 pl-4">
                        {building.floors.map((floor) => (
                        <Button
                            key={floor.id}
                            variant={floor.id === activeFloorId ? 'secondary' : 'ghost'}
                            className="w-full justify-start h-8 text-xs font-normal"
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
        </CardContent>
    </Card>
  );
}
