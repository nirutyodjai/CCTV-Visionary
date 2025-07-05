'use client';

import React, { useReducer, useState, useMemo, useEffect, useCallback } from 'react';
import { createInitialState } from '@/lib/demo-data';
import type { ProjectState, AnyDevice, CablingMode, Point, ArchitecturalElementType, ArchitecturalElement, Floor, Connection, Building, DeviceType, RackContainer, SelectableItem } from '@/lib/types';
import { PlannerCanvas } from '@/components/canvas/planner-canvas';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter } from '@/components/ui/sidebar';
import PropertiesToggleButton from '@/components/ui/properties-toggle-button';
import { ProjectNavigator } from './sidebar/project-navigator';
import { PropertiesPanel } from './sidebar/properties-panel';
import { DevicesToolbar } from './sidebar/devices-toolbar';
import { BillOfMaterials } from './sidebar/bill-of-materials';
import { FloorPlanUpload } from './sidebar/floor-plan-upload';
import { AiAssistant } from './sidebar/ai-assistant';
import { DiagnosticsPanel } from './sidebar/diagnostics-panel';
import { ArchitectureToolbar } from './sidebar/architecture-toolbar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Milestone, Presentation } from 'lucide-react';
import { createDevice } from '@/lib/device-config';
import { saveProjectAction, loadProjectAction, analyzeCctvPlanAction, suggestDevicePlacementsAction, runPlanDiagnosticsAction } from '@/app/actions';
import type { DiagnosticResult } from '@/ai/flows/run-plan-diagnostics';
import { LogicalTopologyView } from '@/components/topology/logical-topology-view';
import { RackElevationView } from '@/components/rack/rack-elevation-view';
import { PlanManagement } from './sidebar/plan-management';
import { ProjectManager } from './sidebar/project-manager';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SidebarToggle } from '@/components/ui/sidebar-toggle';
import { SelectionProvider, useSelection } from '@/contexts/SelectionContext';
import { Separator } from '@/components/ui/separator';


type Action =
    | { type: 'LOAD_PROJECT', payload: ProjectState }
    | { type: 'UPDATE_PROJECT_NAME', payload: string }
    | { type: 'UPDATE_BUILDING_NAME', payload: { buildingId: string, name: string } }
    | { type: 'ADD_DEVICE', payload: { device: AnyDevice, buildingId: string, floorId: string } }
    | { type: 'UPDATE_DEVICE', payload: { device: AnyDevice, buildingId: string, floorId: string } }
    | { type: 'REMOVE_DEVICE', payload: { deviceId: string, buildingId: string, floorId: string } }
    | { type: 'ADD_CONNECTION', payload: { connection: Connection, buildingId: string, floorId: string } }
    | { type: 'SET_FLOOR_PLAN', payload: { url: string, buildingId: string, floorId: string, rect?: DOMRect | null } }
    | { type: 'SET_FLOOR_PLAN_RECT', payload: { buildingId: string, floorId: string, rect: DOMRect | null } }
    | { type: 'ADD_ARCH_ELEMENT', payload: { element: ArchitecturalElement, buildingId: string, floorId: string } }
    | { type: 'UPDATE_ARCH_ELEMENT', payload: { element: ArchitecturalElement, buildingId: string, floorId: string } }
    | { type: 'REMOVE_ARCH_ELEMENT', payload: { elementId: string, buildingId: string, floorId: string } }
    | { type: 'SET_DIAGNOSTICS', payload: { diagnostics: DiagnosticResult['diagnostics'], buildingId: string, floorId: string } }
    | { type: 'ADD_FLOOR', payload: { buildingId: string } }
    | { type: 'UPDATE_RACK', payload: { rack: RackContainer, buildingId: string, floorId: string } };

function projectReducer(state: ProjectState, action: Action): ProjectState {
    const updateFloor = (buildings: Building[], bId: string, fId: string, updateFn: (floor: Floor) => Floor): Building[] => {
        return buildings.map(b => 
            b.id === bId 
                ? { ...b, floors: b.floors.map(f => f.id === fId ? updateFn(f) : f) } 
                : b
        );
    };

    switch (action.type) {
        case 'LOAD_PROJECT':
            return action.payload;
        case 'UPDATE_PROJECT_NAME':
            return { ...state, projectName: action.payload };
        case 'UPDATE_BUILDING_NAME': {
            return {
                ...state,
                buildings: state.buildings.map(b => b.id === action.payload.buildingId ? { ...b, name: action.payload.name } : b)
            };
        }
        case 'ADD_DEVICE': {
            const { device, buildingId, floorId } = action.payload;
            return {
                ...state,
                buildings: updateFloor(state.buildings, buildingId, floorId, f => ({ ...f, devices: [...f.devices, device] }))
            };
        }
        case 'UPDATE_DEVICE': {
            const { device, buildingId, floorId } = action.payload;
            return {
                ...state,
                buildings: updateFloor(state.buildings, buildingId, floorId, f => ({
                    ...f,
                    devices: f.devices.map(d => d.id === device.id ? device : d)
                }))
            };
        }
        case 'REMOVE_DEVICE': {
            const { deviceId, buildingId, floorId } = action.payload;
            return {
                ...state,
                buildings: updateFloor(state.buildings, buildingId, floorId, f => ({
                    ...f,
                    devices: f.devices.filter(d => d.id !== deviceId)
                }))
            };
        }
        case 'ADD_CONNECTION': {
            const { connection, buildingId, floorId } = action.payload;
            return {
                ...state,
                buildings: updateFloor(state.buildings, buildingId, floorId, f => ({
                    ...f,
                    connections: [...f.connections, connection]
                }))
            };
        }
        case 'SET_FLOOR_PLAN': {
            const { url, buildingId, floorId, rect } = action.payload;
            return {
                ...state,
                buildings: updateFloor(state.buildings, buildingId, floorId, f => ({
                    ...f,
                    floorPlanUrl: url,
                }))
            };
        }
        case 'SET_FLOOR_PLAN_RECT': {
            const { buildingId, floorId, rect } = action.payload;
            const targetFloor = state.buildings.find(b => b.id === buildingId)?.floors.find(f => f.id === floorId);
            if (targetFloor) {
                targetFloor.floorPlanRect = rect;
            }
            return {...state};
        }
        case 'ADD_ARCH_ELEMENT': {
            const { element, buildingId, floorId } = action.payload;
            return {
                ...state,
                buildings: updateFloor(state.buildings, buildingId, floorId, f => ({
                    ...f,
                    architecturalElements: [...f.architecturalElements, element]
                }))
            };
        }
        case 'UPDATE_ARCH_ELEMENT': {
            const { element, buildingId, floorId } = action.payload;
            return {
                ...state,
                buildings: updateFloor(state.buildings, buildingId, floorId, f => ({
                    ...f,
                    architecturalElements: f.architecturalElements.map(el => el.id === element.id ? element : el)
                }))
            };
        }
        case 'REMOVE_ARCH_ELEMENT': {
            const { elementId, buildingId, floorId } = action.payload;
            return {
                ...state,
                buildings: updateFloor(state.buildings, buildingId, floorId, f => ({
                    ...f,
                    architecturalElements: f.architecturalElements.filter(el => el.id !== elementId)
                }))
            };
        }
        case 'SET_DIAGNOSTICS': {
            const { diagnostics, buildingId, floorId } = action.payload;
             return {
                ...state,
                buildings: updateFloor(state.buildings, buildingId, floorId, f => ({
                    ...f,
                    diagnostics: diagnostics
                }))
            };
        }
        case 'ADD_FLOOR': {
             const { buildingId } = action.payload;
             return {
                ...state,
                buildings: state.buildings.map(b => {
                    if (b.id === buildingId) {
                        const newFloorNumber = b.floors.length + 1;
                        const newFloor: Floor = {
                            id: `floor_${Date.now()}`,
                            name: `ชั้น ${newFloorNumber}`,
                            floorPlanUrl: null,
                            devices: [],
                            connections: [],
                            architecturalElements: [],
                            diagnostics: [],
                            floorPlanRect: null,
                        };
                        return { ...b, floors: [...b.floors, newFloor] };
                    }
                    return b;
                })
             }
        }
        case 'UPDATE_RACK': {
             const { rack, buildingId, floorId } = action.payload;
             return {
                ...state,
                buildings: updateFloor(state.buildings, buildingId, floorId, f => ({
                    ...f,
                    devices: f.devices.map(d => d.id === rack.id ? rack : d)
                }))
            };
        }
        default:
            return state;
    }
}


function CCTVPlannerInner() {
    const [projectState, dispatch] = useReducer(projectReducer, createInitialState());
    const { selectedItem, setSelectedItem } = useSelection();

    const [activeIds, setActiveIds] = useState<{ buildingId: string | null, floorId: string | null }>({ buildingId: null, floorId: null });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    
    const [cablingMode, setCablingMode] = useState<CablingMode>({ enabled: false, fromDeviceId: null });
    const [selectedArchTool, setSelectedArchTool] = useState<ArchitecturalElementType | null>(null);
    const [drawingState, setDrawingState] = useState<{ isDrawing: boolean; startPoint: Point | null }>({ isDrawing: false, startPoint: null });

    const [isTopologyOpen, setTopologyOpen] = useState(false);
    const [isRackViewOpen, setRackViewOpen] = useState(false);
    const [selectedRack, setSelectedRack] = useState<RackContainer | null>(null);
    const [isProjectManagerOpen, setProjectManagerOpen] = useState(false);

    const [showRightSidebar, setShowRightSidebar] = useState(true);

    const { toast } = useToast();

    useEffect(() => {
        if (projectState.id !== 'loading' && projectState.buildings.length > 0 && !activeIds.buildingId) {
            const firstBuilding = projectState.buildings[0];
            if (firstBuilding.floors.length > 0) {
                setActiveIds({ buildingId: firstBuilding.id, floorId: firstBuilding.floors[0].id });
            }
        }
        setIsLoading(false);
    }, [projectState, activeIds.buildingId]);
    

    const activeBuilding = useMemo(() => {
        if (!activeIds.buildingId) return null;
        return projectState.buildings.find(b => b.id === activeIds.buildingId) ?? null;
    }, [projectState.buildings, activeIds.buildingId]);

    const activeFloor = useMemo(() => {
        if (!activeBuilding || !activeIds.floorId) return null;
        return activeBuilding.floors.find(f => f.id === activeIds.floorId) ?? null;
    }, [activeBuilding, activeIds.floorId]);

    
    const handleAddDevice = (type: DeviceType) => {
        if (activeFloor && activeIds.buildingId) {
            const newDevice = createDevice(type, 0.5, 0.5, activeFloor.devices);
            dispatch({ type: 'ADD_DEVICE', payload: { device: newDevice, buildingId: activeIds.buildingId, floorId: activeFloor.id } });
            setSelectedItem(newDevice);
            toast({ title: "เพิ่มอุปกรณ์เรียบร้อย", description: `เพิ่ม ${newDevice.label} ลงในแผน` });
        } else {
            toast({ title: "ไม่สามารถเพิ่มอุปกรณ์", description: "กรุณาเลือกชั้นก่อน", variant: 'destructive' });
        }
    };

    const handleUpdateDevice = (device: AnyDevice) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'UPDATE_DEVICE', payload: { device, buildingId: activeIds.buildingId, floorId: activeIds.floorId }});
    };
    
    const handleUpdateArchElement = (element: ArchitecturalElement) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'UPDATE_ARCH_ELEMENT', payload: { element, buildingId: activeIds.buildingId, floorId: activeIds.floorId }});
    }
    
    const handleUpdateFloorPlanRect = (rect: DOMRect | null) => {
        if (activeFloor && activeIds.buildingId) {
            dispatch({ type: 'SET_FLOOR_PLAN_RECT', payload: { rect, buildingId: activeIds.buildingId, floorId: activeFloor.id }});
        }
    }


    const handleFloorSelect = (buildingId: string, floorId: string) => {
        setActiveIds({ buildingId, floorId });
        setSelectedItem(null);
    };

    const handleRemoveDevice = (deviceId: string) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'REMOVE_DEVICE', payload: { deviceId, buildingId: activeIds.buildingId, floorId: activeIds.floorId }});
        setSelectedItem(null);
        toast({ title: "ลบอุปกรณ์แล้ว", variant: "destructive" });
    };

    const handleRemoveArchElement = (elementId: string) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'REMOVE_ARCH_ELEMENT', payload: { elementId, buildingId: activeIds.buildingId, floorId: activeIds.floorId }});
        setSelectedItem(null);
        toast({ title: "ลบส่วนประกอบแล้ว", variant: "destructive" });
    };

    const handleSetFloorPlan = (file: File) => {
        if (!activeIds.buildingId || !activeIds.floorId) {
            toast({ title: 'Please select a floor first', variant: 'destructive' });
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
                dispatch({ type: 'SET_FLOOR_PLAN', payload: { url: e.target.result, buildingId: activeIds.buildingId!, floorId: activeIds.floorId! } });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAddConnection = (connection: Connection) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'ADD_CONNECTION', payload: { connection, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
    }
    
    const handleAddArchElement = (element: ArchitecturalElement) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'ADD_ARCH_ELEMENT', payload: { element, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
        setSelectedArchTool(null);
    };

    const handleProjectNameChange = (name: string) => {
        dispatch({ type: 'UPDATE_PROJECT_NAME', payload: name });
    };

    const handleSaveProject = async () => {
        setIsSaving(true);
        const result = await saveProjectAction(projectState);
        if (result.success) {
            toast({ title: "บันทึกโครงการสำเร็จ!", description: `โครงการ "${projectState.projectName}" ได้รับการบันทึกแล้ว` });
        } else {
            toast({ title: "เกิดข้อผิดพลาดในการบันทึก", description: result.error, variant: 'destructive' });
        }
        setIsSaving(false);
    };
    
    const handleLoadProject = async (projectId: string) => {
        setIsLoading(true);
        const result = await loadProjectAction(projectId);
        if (result.success) {
            dispatch({ type: 'LOAD_PROJECT', payload: result.data });
            const firstBuilding = result.data.buildings[0];
            if (firstBuilding && firstBuilding.floors.length > 0) {
                 setActiveIds({ buildingId: firstBuilding.id, floorId: firstBuilding.floors[0].id });
            } else {
                 setActiveIds({ buildingId: null, floorId: null });
            }
            toast({ title: "โหลดโครงการสำเร็จ", description: `โครงการ "${result.data.projectName}" ถูกโหลดแล้ว` });
        } else {
            toast({ title: "เกิดข้อผิดพลาดในการโหลด", description: result.error, variant: 'destructive' });
        }
        setIsLoading(false);
    };

    const handleAnalyzePlan = async () => {
        if (!activeFloor) return;
        setIsAnalyzing(true);
        const deviceSummary = activeFloor.devices.map(d => d.label).join(', ');
        const result = await analyzeCctvPlanAction({ deviceSummary, totalFloors: 1 });
        if (result.success) {
            toast({ title: "AI Analysis Complete", description: result.data.analysis });
        } else {
            toast({ title: "Analysis Failed", description: result.error, variant: 'destructive' });
        }
        setIsAnalyzing(false);
    };

    const handleSuggestPlacements = async () => {
        if (!activeFloor || !activeFloor.floorPlanUrl) {
            toast({ title: 'Suggestion Failed', description: 'Please upload a floor plan first.', variant: 'destructive' });
            return;
        }
        setIsSuggesting(true);
        const result = await suggestDevicePlacementsAction({ floorPlanDataUri: activeFloor.floorPlanUrl });
        if (result.success) {
            const suggestions = result.data;
            suggestions.forEach(suggestion => {
                const newDevice = createDevice(suggestion.type, suggestion.x, suggestion.y, activeFloor!.devices);
                newDevice.label = `${suggestion.reason}`;
                dispatch({ type: 'ADD_DEVICE', payload: { device: newDevice, buildingId: activeIds.buildingId!, floorId: activeIds.floorId! } });
            });
            toast({ title: 'AI Suggestions Added', description: `Added ${suggestions.length} devices to the plan.` });
        } else {
            toast({ title: 'Suggestion Failed', description: result.error, variant: 'destructive' });
        }
        setIsSuggesting(false);
    };

    const handleRunDiagnostics = async () => {
        if (!activeFloor || !activeIds.buildingId) return;

        setIsDiagnosing(true);
        const plan = {
            devices: activeFloor.devices.map(d => ({ id: d.id, label: d.label, type: d.type, channels: d.channels, ports: d.ports })),
            connections: activeFloor.connections.map(c => ({ fromDeviceId: c.fromDeviceId, toDeviceId: c.toDeviceId }))
        }
        const result = await runPlanDiagnosticsAction(plan);
        if (result.success) {
            dispatch({ type: 'SET_DIAGNOSTICS', payload: { diagnostics: result.data.diagnostics, buildingId: activeIds.buildingId, floorId: activeFloor.id }});
            toast({ title: 'Diagnostics Complete' });
        } else {
            toast({ title: 'Diagnostics Failed', description: result.error, variant: 'destructive' });
        }
        setIsDiagnosing(false);
    }
    
    const handleUpdateBuildingName = (buildingId: string, name: string) => {
        dispatch({ type: 'UPDATE_BUILDING_NAME', payload: { buildingId, name }});
    }
    
    const handleAddFloor = (buildingId: string) => {
        dispatch({ type: 'ADD_FLOOR', payload: { buildingId }});
    }

    const handleUpdateRack = (rack: RackContainer) => {
        if(activeFloor && activeIds.buildingId) {
            dispatch({type: 'UPDATE_RACK', payload: { rack, buildingId: activeIds.buildingId, floorId: activeFloor.id }});
        }
    }
    
    const handleViewRack = (rack: RackContainer) => {
        setSelectedRack(rack);
        setRackViewOpen(true);
    }
    
    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!selectedArchTool) {
             setSelectedItem(null);
        }
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <PlanManagement 
                        planName={projectState.projectName}
                        onPlanNameChange={handleProjectNameChange}
                        onSave={handleSaveProject}
                        isSaving={isSaving}
                        onOpenManager={() => setProjectManagerOpen(true)}
                    />
                </SidebarHeader>
                <SidebarContent className="p-0">
                    <div className="p-2 space-y-3">
                        <ProjectNavigator 
                            buildings={projectState.buildings}
                            activeBuildingId={activeIds.buildingId}
                            activeFloorId={activeIds.floorId}
                            onFloorSelect={handleFloorSelect}
                            onUpdateBuildingName={handleUpdateBuildingName}
                            onAddFloor={handleAddFloor}
                        />
                         <FloorPlanUpload onSetFloorPlan={handleSetFloorPlan} />
                        <DevicesToolbar onSelectDevice={handleAddDevice} />
                        <ArchitectureToolbar selectedTool={selectedArchTool} onSelectTool={setSelectedArchTool} />
                         <AiAssistant 
                            onAnalyze={handleAnalyzePlan}
                            onSuggest={handleSuggestPlacements}
                            isAnalyzing={isAnalyzing}
                            isSuggesting={isSuggesting}
                        />
                        <DiagnosticsPanel 
                            diagnostics={activeFloor?.diagnostics || []}
                            onRunDiagnostics={handleRunDiagnostics}
                            isLoading={isDiagnosing}
                        />
                    </div>
                    <Separator />
                    <BillOfMaterials project={projectState} />
                </SidebarContent>
                 <SidebarFooter>
                    {/* Footer content can go here if needed later */}
                </SidebarFooter>
            </Sidebar>

            <div className="flex-1 flex flex-col">
                <header className="flex items-center justify-between p-2 border-b h-14">
                    <div className="flex items-center gap-2">
                       <SidebarToggle />
                    </div>
                    
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <h1 className="text-lg font-semibold truncate">
                            {projectState.projectName}
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                         <Button variant="outline" size="sm" onClick={() => setTopologyOpen(true)}>
                            <Milestone className="w-4 h-4 mr-2"/>
                            Topology
                        </Button>
                         <Button variant="outline" size="sm" onClick={() => {}}>
                            <Presentation className="w-4 h-4 mr-2"/>
                            Report
                        </Button>
                        <ThemeToggle />
                        <PropertiesToggleButton isOpen={showRightSidebar} onChange={setShowRightSidebar} />
                    </div>
                </header>

                <main className="flex-1 flex">
                    <div className="flex-1 relative">
                        {activeFloor ? (
                            <PlannerCanvas
                                floor={activeFloor}
                                selectedItem={selectedItem}
                                onSelectItem={(item) => setSelectedItem(item)}
                                onUpdateDevice={handleUpdateDevice}
                                onCanvasClick={handleCanvasClick}
                                cablingMode={cablingMode}
                                onSetCablingMode={setCablingMode}
                                onAddConnection={handleAddConnection}
                                selectedArchTool={selectedArchTool}
                                drawingState={drawingState}
                                onSetDrawingState={setDrawingState}
                                onAddArchElement={handleAddArchElement}
                                onUpdateArchElement={handleUpdateArchElement}
                                floorPlanRect={activeFloor.floorPlanRect || null}
                                onUpdateFloorPlanRect={handleUpdateFloorPlanRect}
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">Please select a floor to begin.</p>
                            </div>
                        )}
                    </div>
                    
                    {showRightSidebar && (
                        <aside className="w-96 h-full flex flex-col border-l border-border bg-card shadow-lg">
                            <PropertiesPanel
                                selectedItem={selectedItem}
                                onUpdateDevice={handleUpdateDevice}
                                onRemoveDevice={handleRemoveDevice}
                                onStartCabling={(deviceId) => setCablingMode({ enabled: true, fromDeviceId: deviceId })}
                                onViewRack={handleViewRack}
                                onRemoveArchElement={handleRemoveArchElement}
                                onUpdateArchElement={handleUpdateArchElement}
                            />
                        </aside>
                    )}
                </main>
            </div>
            
            <LogicalTopologyView 
                isOpen={isTopologyOpen} 
                onClose={() => setTopologyOpen(false)}
                devices={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.devices))}
                connections={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.connections))}
            />
            
            <RackElevationView
                isOpen={isRackViewOpen}
                onClose={() => setRackViewOpen(false)}
                rack={selectedRack}
                onUpdateRack={handleUpdateRack}
            />

            <ProjectManager
                isOpen={isProjectManagerOpen}
                onClose={() => setProjectManagerOpen(false)}
                onLoadProject={handleLoadProject}
                currentProjectId={projectState.id}
            />
        </SidebarProvider>
    );
}

export function CCTVPlanner() {
    return (
        <SelectionProvider>
            <CCTVPlannerInner />
        </SelectionProvider>
    );
}
