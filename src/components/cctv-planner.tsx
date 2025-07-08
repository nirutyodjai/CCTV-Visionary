
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { produce } from 'immer';
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DevicesToolbar } from './sidebar/devices-toolbar';
import { ArchitectureToolbar } from './sidebar/architecture-toolbar';
import { AiAssistant } from './sidebar/ai-assistant';
import { DiagnosticsPanel } from './sidebar/diagnostics-panel';
import { ProjectNavigator } from './sidebar/project-navigator';
import { PropertiesPanel } from './sidebar/properties-panel';
import { PlannerCanvas } from './canvas/planner-canvas';
import { PlanManagement } from './sidebar/plan-management';
import { ProjectManager } from './sidebar/project-manager';
import { RackElevationView } from './rack/rack-elevation-view';
import { LogicalTopologyView } from './topology/logical-topology-view';
import { PerformanceDashboard } from './ui/performance-dashboard';
import { HistoryPanel } from './ui/history-panel';
import { ExportDialog, type ExportDialogRef } from './ui/export-dialog';
import { ThreeDVisualizer } from './ui/three-d-visualizer';
import { SelectionProvider, useSelection } from '@/contexts/SelectionContext';
import { createDevice } from '@/lib/device-config';
import { createInitialState } from '@/lib/demo-data';
import type { ProjectState, AnyDevice, Floor, ArchitecturalElement, ArchitecturalElementType, CablingMode, DeviceType, Connection, RackContainer, CableType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts, defaultShortcuts, ShortcutEventHandler } from '@/hooks/use-keyboard-shortcuts';
import { saveProjectAction, loadProjectAction, runPlanDiagnosticsAction, suggestDevicePlacementsAction, findCablePathAction } from '@/app/actions';
import { Map, Settings, Bot, Presentation, Network, Eye, PanelRightOpen } from 'lucide-react';
import { StateHistoryManager } from '@/lib/state-history';
import { AppSettings } from './sidebar/app-settings';

function CCTVPlannerInner() {
    const [projectState, setProjectState] = useState<ProjectState>(createInitialState());
    const [activeBuildingId, setActiveBuildingId] = useState<string | null>(projectState.buildings[0]?.id || null);
    const [activeFloorId, setActiveFloorId] = useState<string | null>(projectState.buildings[0]?.floors[0]?.id || null);
    
    const [cablingMode, setCablingMode] = useState<CablingMode>({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
    const [drawingTool, setDrawingTool] = useState<ArchitecturalElementType | null>(null);
    
    const [isProjectManagerOpen, setProjectManagerOpen] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTopologyViewOpen, setIsTopologyViewOpen] = useState(false);
    const [is3DViewOpen, setIs3DViewOpen] = useState(false);
    const [activeRack, setActiveRack] = useState<RackContainer | null>(null);
    const { toast } = useToast();

    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isFindingPaths, setIsFindingPaths] = useState(false);
    const [isDiagnosticsLoading, setDiagnosticsLoading] = useState(false);
    
    const [historyManager] = useState(() => new StateHistoryManager(setProjectState));
    
    const { selectedItem, setSelectedItem } = useSelection();
    const exportDialogRef = useRef<ExportDialogRef>(null);

    useKeyboardShortcuts(defaultShortcuts);

    const updateProjectState = useCallback((updater: (draft: ProjectState) => void, description: string, action: 'add' | 'remove' | 'update' | 'move' | 'connect' | 'disconnect' = 'update') => {
        const newState = produce(projectState, updater);
        historyManager.pushState(newState, description, action);
    }, [projectState, historyManager]);

    useEffect(() => {
        historyManager.pushState(projectState, 'Initial State', 'add');
    }, []);

    const getActiveFloor = useCallback((): Floor | undefined => {
        const building = projectState.buildings.find(b => b.id === activeBuildingId);
        return building?.floors.find(f => f.id === activeFloorId);
    }, [projectState, activeBuildingId, activeFloorId]);

    const handleSaveProject = useCallback(async () => {
        setIsSaving(true);
        const result = await saveProjectAction(projectState);
        if (result.success) {
            toast({ title: 'Project saved!' });
        } else {
            toast({ title: 'Error saving project', description: result.error, variant: 'destructive' });
        }
        setIsSaving(false);
    }, [projectState, toast]);

    const handleRemoveItem = useCallback((itemId: string) => {
        updateProjectState(draft => {
            const floor = draft.buildings.flatMap(b => b.floors).find(f => f.id === activeFloorId);
            if (floor) {
                const deviceIndex = floor.devices.findIndex(d => d.id === itemId);
                if (deviceIndex > -1) floor.devices.splice(deviceIndex, 1);
                else {
                    const archIndex = floor.architecturalElements.findIndex(a => a.id === itemId);
                    if (archIndex > -1) floor.architecturalElements.splice(archIndex, 1);
                }
                floor.connections = floor.connections.filter(c => c.fromDeviceId !== itemId && c.toDeviceId !== itemId);
            }
        }, `Remove item ${itemId}`, 'remove');
        setSelectedItem(null);
    }, [activeFloorId, updateProjectState, setSelectedItem]);

    const handleDeleteSelectedItem = useCallback(() => {
        if (selectedItem) handleRemoveItem(selectedItem.id);
    }, [selectedItem, handleRemoveItem]);

    const handleCancelAction = () => {
        setCablingMode({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
        setDrawingTool(null);
        setSelectedItem(null);
    };

    const handleUndo = useCallback(() => {
        historyManager.undo();
        toast({ title: 'Undo', description: historyManager.getLastUndoDescription(), duration: 2000 });
    }, [historyManager, toast]);

    const handleRedo = useCallback(() => {
        historyManager.redo();
        toast({ title: 'Redo', description: historyManager.getLastRedoDescription(), duration: 2000 });
    }, [historyManager, toast]);
    
    useEffect(() => {
        const events = { 'save-project': handleSaveProject, 'delete-selected': handleDeleteSelectedItem, 'cancel-action': handleCancelAction, 'undo': handleUndo, 'redo': handleRedo };
        Object.entries(events).forEach(([event, handler]) => ShortcutEventHandler.on(event, handler));
        return () => Object.entries(events).forEach(([event, handler]) => ShortcutEventHandler.off(event, handler));
    }, [handleSaveProject, handleDeleteSelectedItem, handleCancelAction, handleUndo, handleRedo]);

    const handleStartCabling = (deviceId: string, cableType: CableType) => {
        setCablingMode({ enabled: true, fromDeviceId: deviceId, cableType: cableType });
        toast({ title: 'Cabling Mode', description: `Select a device to connect to with ${cableType}`});
    };

    const handleAddDevice = (type: DeviceType, x: number, y: number) => {
        const newDevice = createDevice(type, x, y, getActiveFloor()?.devices || []);
        updateProjectState(draft => {
            draft.buildings.flatMap(b => b.floors).find(f => f.id === activeFloorId)?.devices.push(newDevice);
        }, `Add ${type}`, 'add');
        setSelectedItem(newDevice);
    };
    
    const handleUpdateItem = (updatedItem: AnyDevice | ArchitecturalElement) => {
        updateProjectState(draft => {
            const floor = draft.buildings.flatMap(b => b.floors).find(f => f.id === activeFloorId);
            if (floor) {
                const list: (AnyDevice[] | ArchitecturalElement[]) = 'points' in updatedItem ? floor.architecturalElements : floor.devices;
                const index = list.findIndex(item => item.id === updatedItem.id);
                if (index !== -1) (list as any[])[index] = updatedItem;
            }
        }, `Update ${updatedItem.type}`, 'update');
        setSelectedItem(updatedItem);
    };

    const handleFloorSelect = (buildingId: string, floorId: string) => {
        setActiveBuildingId(buildingId);
        setActiveFloorId(floorId);
        setSelectedItem(null);
    };

    const handleItemClick = (item: AnyDevice | ArchitecturalElement) => {
        if (cablingMode.enabled && cablingMode.fromDeviceId && 'x' in item && item.id !== cablingMode.fromDeviceId) {
            const newConnection: Connection = { id: `conn_${Date.now()}`, fromDeviceId: cablingMode.fromDeviceId, toDeviceId: item.id, cableType: cablingMode.cableType };
            updateProjectState(draft => {
                draft.buildings.flatMap(b => b.floors).find(f => f.id === activeFloorId)?.connections.push(newConnection);
            }, 'Connect devices', 'connect');
            setCablingMode({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
            setSelectedItem(null);
        } else {
            setSelectedItem(item);
            setCablingMode({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
        }
    };
    
    const handleDeviceMove = (deviceId: string, newPos: { x: number; y: number }) => {
        updateProjectState(draft => {
            const device = draft.buildings.flatMap(b => b.floors).find(f => f.id === activeFloorId)?.devices.find(d => d.id === deviceId);
            if (device) {
                device.x = newPos.x;
                device.y = newPos.y;
            }
        }, `Move device ${deviceId}`, 'move');
    };

    const handleLoadProject = async (projectId: string) => {
        setProjectManagerOpen(false);
        const result = await loadProjectAction(projectId);
        if (result.success) {
            historyManager.clear();
            setProjectState(result.data);
            historyManager.pushState(result.data, 'Project Loaded', 'add');
            setActiveBuildingId(result.data.buildings[0]?.id || null);
            setActiveFloorId(result.data.buildings[0]?.floors[0]?.id || null);
        } else {
            toast({ title: "Failed to load project", description: result.error, variant: 'destructive' });
            setProjectManagerOpen(true);
        }
    };

    const handleAiSuggest = async () => {
        const floor = getActiveFloor();
        if(!floor?.floorPlanUrl) {
            toast({ title: "Missing Floor Plan", description: "Please upload a floor plan before using AI suggestions.", variant: "destructive"});
            return;
        }
        setIsSuggesting(true);
        const result = await suggestDevicePlacementsAction({ floorPlanDataUri: floor.floorPlanUrl });
        if(result.success) {
            const newDevices = result.data as AnyDevice[];
            updateProjectState(draft => {
                const currentFloor = draft.buildings.flatMap(b => b.floors).find(f => f.id === activeFloorId);
                if(currentFloor) currentFloor.devices.push(...newDevices);
            }, "AI Suggest Placements", 'add');
        }
        setIsSuggesting(false);
    };

    const handleAiAnalyze = async () => setIsAnalyzing(true);
    const handleAiFindCablePaths = async () => setIsFindingPaths(true);

    const activeFloorData = getActiveFloor();
    if (!activeFloorData) return <ProjectManager isOpen={isProjectManagerOpen} onClose={() => setProjectManagerOpen(false)} onLoadProject={handleLoadProject} currentProjectId={projectState.id} />;

    return (
        <SidebarProvider>
            <div className="w-full h-screen bg-background text-foreground flex">
                <Sidebar>
                    <SidebarContent>
                        <SidebarInset><Card><CardHeader><CardTitle>CCTV Visionary</CardTitle></CardHeader></Card></SidebarInset>
                        <Tabs defaultValue="tools" className="flex-1 flex flex-col overflow-hidden">
                            <TabsList className="grid grid-cols-4 w-full"><TabsTrigger value="tools"><Map/></TabsTrigger><TabsTrigger value="ai"><Bot/></TabsTrigger><TabsTrigger value="views"><Presentation/></TabsTrigger><TabsTrigger value="settings"><Settings/></TabsTrigger></TabsList>
                            <TabsContent value="tools" className="flex-1 overflow-auto p-2">
                                <DevicesToolbar onSelectDevice={(type) => handleAddDevice(type, 0.5, 0.5)} />
                                <ArchitectureToolbar onSelectTool={setDrawingTool} selectedTool={drawingTool} />
                                <PlanManagement onSave={handleSaveProject} isSaving={isSaving} onExport={() => exportDialogRef.current?.open()} onOpenProjectManager={() => setProjectManagerOpen(true)} />
                            </TabsContent>
                            <TabsContent value="ai" className="flex-1 overflow-auto p-2">
                                <AiAssistant onAnalyze={handleAiAnalyze} onSuggest={handleAiSuggest} onFindCablePaths={handleAiFindCablePaths} isAnalyzing={isAnalyzing} isSuggesting={isSuggesting} isFindingPaths={isFindingPaths} />
                            </TabsContent>
                            <TabsContent value="views" className="flex-1 overflow-auto p-2">
                                <ProjectNavigator buildings={projectState.buildings} activeBuildingId={activeBuildingId} activeFloorId={activeFloorId} onFloorSelect={handleFloorSelect} onAddFloor={() => {}} onUpdateBuildingName={() => {}} />
                                <Card className="mt-4"><CardHeader><CardTitle>Other Views</CardTitle></CardHeader><CardContent className="space-y-2"><Button variant="outline" className="w-full justify-start" onClick={() => setIsTopologyViewOpen(true)}><Network className="mr-2 h-4 w-4" /> Network View</Button><Button variant="outline" className="w-full justify-start" onClick={() => setIs3DViewOpen(true)}><Eye className="mr-2 h-4 w-4" /> 3D View</Button></CardContent></Card>
                            </TabsContent>
                            <TabsContent value="settings" className="flex-1 overflow-auto p-2"><AppSettings /></TabsContent>
                        </Tabs>
                    </SidebarContent>
                </Sidebar>

                <main className="flex-1 flex flex-col min-w-0 relative">
                    <PlannerCanvas
                        floor={activeFloorData}
                        cablingMode={cablingMode}
                        drawingTool={drawingTool}
                        onItemClick={handleItemClick}
                        onCanvasClick={handleCancelAction}
                        onDeviceMove={handleDeviceMove}
                        onArchElementComplete={(el: ArchitecturalElement) => {
                            updateProjectState(draft => {
                                draft.buildings.flatMap(b => b.floors).find(f => f.id === activeFloorId)?.architecturalElements.push(el);
                            }, 'Add architectural element', 'add');
                            setDrawingTool(null);
                        }}
                    />
                    <div className="absolute bottom-4 left-4 flex gap-2">
                        <HistoryPanel onUndo={handleUndo} onRedo={handleRedo} canUndo={historyManager.canUndo()} canRedo={historyManager.canRedo()} historyManager={historyManager} />
                    </div>
                </main>

                <Sidebar side="right">
                    <SidebarContent>
                        <Tabs defaultValue="properties" className="flex-1 flex flex-col overflow-hidden">
                            <TabsList className="grid grid-cols-2 w-full"><TabsTrigger value="properties">Properties</TabsTrigger><TabsTrigger value="diagnostics">Diagnostics</TabsTrigger></TabsList>
                            <TabsContent value="properties" className="flex-1 overflow-auto p-2">
                                {selectedItem ? <PropertiesPanel selectedItem={selectedItem} onUpdate={handleUpdateItem} onRemove={handleRemoveItem} onStartCabling={handleStartCabling} onViewRack={() => { if (selectedItem?.type === 'rack') setActiveRack(selectedItem as RackContainer); }} /> : <p className="text-center text-muted-foreground p-4">Select an item</p>}
                            </TabsContent>
                            <TabsContent value="diagnostics" className="flex-1 overflow-auto p-2">
                                <DiagnosticsPanel 
                                    diagnostics={activeFloorData.diagnostics || []} 
                                    isLoading={isDiagnosticsLoading}
                                    onRunDiagnostics={async () => {
                                        setDiagnosticsLoading(true);
                                        const result = await runPlanDiagnosticsAction(activeFloorData);
                                        if (result.success) {
                                            updateProjectState(draft => {
                                                const floor = draft.buildings.flatMap(b => b.floors).find(f => f.id === activeFloorId);
                                                if (floor) floor.diagnostics = result.data as any[];
                                            }, 'Run diagnostics', 'update');
                                        }
                                        setDiagnosticsLoading(false);
                                    }}
                                />
                            </TabsContent>
                        </Tabs>
                    </SidebarContent>
                    <SidebarTrigger><PanelRightOpen /></SidebarTrigger>
                </Sidebar>
                
                <ProjectManager isOpen={isProjectManagerOpen} onClose={() => setProjectManagerOpen(false)} onLoadProject={handleLoadProject} currentProjectId={projectState.id}/>
                <LogicalTopologyView isOpen={isTopologyViewOpen} onOpenChange={setIsTopologyViewOpen} project={projectState} />
                <ThreeDVisualizer isOpen={is3DViewOpen} onOpenChange={setIs3DViewOpen} floor={activeFloorData} />
                {activeRack && <RackElevationView isOpen={!!activeRack} onOpenChange={(open: boolean) => !open && setActiveRack(null)} rack={activeRack} onUpdateRack={handleUpdateItem} />}
                <ExportDialog ref={exportDialogRef} project={projectState} />
            </div>
        </SidebarProvider>
    );
}

export function CCTVPlanner() {
    return (
        <SelectionProvider>
            <CCTVPlannerInner />
            <PerformanceDashboard />
        </SelectionProvider>
    );
}
