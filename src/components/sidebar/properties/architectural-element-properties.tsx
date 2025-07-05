'use client';
import type { ArchitecturalElement, ArchitecturalElementType } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface ArchitecturalElementProps {
  element: ArchitecturalElement;
  onUpdate: (element: ArchitecturalElement) => void;
  onRemove: (elementId: string) => void;
}

const ARCH_ELEMENT_NAMES: Record<ArchitecturalElementType, string> = {
    'wall': 'Wall',
    'door': 'Door',
    'window': 'Window',
    'table': 'Table',
    'chair': 'Chair',
    'elevator': 'Elevator',
    'fire-escape': 'Fire Escape',
    'shaft': 'Shaft',
    'tree': 'Tree',
    'motorcycle': 'Motorcycle',
    'car': 'Car',
    'supercar': 'Supercar',
    'area': 'Area'
};

export function ArchitecturalElementProperties({ element, onUpdate, onRemove }: ArchitecturalElementProps) {
    const handleArchChange = (key: string, value: any) => {
        if (key.startsWith('shadow.')) {
            const shadowKey = key.split('.')[1];
            const updatedElement = {
                ...element,
                shadow: {
                    ...(element.shadow || {}),
                    [shadowKey]: value,
                }
            };
            onUpdate(updatedElement);
        } else {
            const updatedElement = { ...element, [key]: value };
            onUpdate(updatedElement);
        }
    };
    
    return (
        <>
            <div className="flex-1 overflow-y-auto p-4">
                <Accordion type="multiple" defaultValue={['general', 'appearance', 'shadow']} className="w-full">
                    <AccordionItem value="general">
                        <AccordionTrigger>General</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="element-type">Element Type</Label>
                                <Input id="element-type" value={ARCH_ELEMENT_NAMES[element.type as ArchitecturalElementType]} disabled />
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="appearance">
                        <AccordionTrigger>Appearance</AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label>Scale ({((element.scale ?? 1) * 100).toFixed(0)}%)</Label>
                                <Slider
                                    value={[element.scale ?? 1]}
                                    onValueChange={([val]) => handleArchChange('scale', val)}
                                    min={0.25}
                                    max={3}
                                    step={0.05}
                                />
                            </div>
                            {element.type === 'area' && (
                            <div className="space-y-2">
                                <Label htmlFor="element-color">Area Color</Label>
                                <Input
                                    id="element-color"
                                    type="color"
                                    value={element.color || '#3b82f6'}
                                    onChange={(e) => handleArchChange('color', e.target.value)}
                                    className="h-10 p-1 w-full"
                                />
                            </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    
                    {element.type === 'area' && (
                         <AccordionItem value="shadow">
                            <AccordionTrigger>Shadow</AccordionTrigger>
                            <AccordionContent className="space-y-4 pt-2">
                                <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="shadow-enabled">Enable Shadow</Label>
                                        <p className="text-[0.8rem] text-muted-foreground">
                                            Add a drop shadow to the area.
                                        </p>
                                    </div>
                                    <Switch
                                        id="shadow-enabled"
                                        checked={element.shadow?.enabled ?? false}
                                        onCheckedChange={(checked) => handleArchChange('shadow.enabled', checked)}
                                    />
                                </div>
                                {element.shadow?.enabled && (
                                    <div className="space-y-4 pt-4 border-t">
                                        <div className="space-y-2">
                                            <Label>Offset X ({element.shadow?.offsetX ?? 0}px)</Label>
                                            <Slider
                                                value={[element.shadow?.offsetX ?? 0]}
                                                onValueChange={([val]) => handleArchChange('shadow.offsetX', val)}
                                                min={-50} max={50} step={1}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Offset Y ({element.shadow?.offsetY ?? 4}px)</Label>
                                            <Slider
                                                value={[element.shadow?.offsetY ?? 4]}
                                                onValueChange={([val]) => handleArchChange('shadow.offsetY', val)}
                                                min={-50} max={50} step={1}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Blur ({element.shadow?.blur ?? 8}px)</Label>
                                            <Slider
                                                value={[element.shadow?.blur ?? 8]}
                                                onValueChange={([val]) => handleArchChange('shadow.blur', val)}
                                                min={0} max={100} step={1}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Opacity ({ (element.shadow?.opacity ?? 0.1).toFixed(2) })</Label>
                                            <Slider
                                                value={[element.shadow?.opacity ?? 0.1]}
                                                onValueChange={([val]) => handleArchChange('shadow.opacity', val)}
                                                min={0} max={1} step={0.01}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="shadow-color">Shadow Color</Label>
                                            <Input
                                                id="shadow-color"
                                                type="color"
                                                value={element.shadow?.color || '#000000'}
                                                onChange={(e) => handleArchChange('shadow.color', e.target.value)}
                                                className="h-10 p-1 w-full"
                                            />
                                        </div>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    )}

                </Accordion>
            </div>
            <div className="p-4 border-t border-border space-y-2">
                <Button variant="destructive" className="w-full" onClick={() => onRemove(element.id)}>
                    <Trash2/> Delete Element
                </Button>
            </div>
        </>
    );
}
