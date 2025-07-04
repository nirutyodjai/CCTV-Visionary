'use client';

import React, { useReducer, useState, useMemo, useEffect, useCallback } from 'react';
import { generateDemoProject } from '@/lib/demo-data';
import type { ProjectState, AnyDevice, CablingMode, Point, ArchitecturalElementType, ArchitecturalElement, Floor, Connection, Building, DeviceType, RackContainer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { PlannerCanvas } from '@/components/canvas/planner-canvas';
import { ProjectNavigator } from './sidebar/project-navigator';
import { PropertiesPanel } from './sidebar/properties-panel';
import { DevicesToolbar } from './sidebar/devices-toolbar';
import { BillOfMaterials } from './sidebar/bill-of-materials';
import { FloorPlanUpload } from './sidebar/floor-plan-upload';
import { AiAssistant } from './sidebar/ai-assistant';
import { DiagnosticsPanel } from './sidebar/diagnostics-panel';
import { ArchitectureToolbar } from './sidebar/architecture-toolbar';
import { useToast } from '@/hooks/use-toast';
import { Sun, Moon, Network, Save, FolderOpen, AlertTriangle } from 'lucide-react';
import { createDevice } from '@/lib/device-config';
import { analyzeCctvPlanAction, suggestDevicePlacementsAction, runPlanDiagnosticsAction, generateLogicalTopologyLayoutAction } from '@/app/actions';
import type { DiagnosticResult } from '@/ai/flows/run-plan-diagnostics';
import { LogicalTopologyView } from '@/components/topology/logical-topology-view';
import { RackElevationView } from '@/components/rack/rack-elevation-view';

type Action =
    | { type: 'LOAD_PROJECT', payload: ProjectState }
    | { type: 'SET_ACTIVE_FLOOR', payload: { buildingId: string, floorId: string } }
    | { type: 'ADD_DEVICE', payload: { device: AnyDevice, buildingId: string, floorId: string } }
    | { type: 'UPDATE_DEVICE', payload: { device: AnyDevice, buildingId: string, floorId: string } }
    | { type: 'REMOVE_DEVICE', payload: { deviceId: string, buildingId: string, floorId: string } }
    | { type: 'ADD_CONNECTION', payload: { connection: Connection, buildingId: string, floorId: string } }
    | { type: 'SET_FLOOR_PLAN', payload: { url: string, buildingId: string, floorId: string } }
    | { type: 'ADD_ARCH_ELEMENT', payload: { element: ArchitecturalElement, buildingId: string, floorId: string } }
    | { type: 'SET_DIAGNOSTICS', payload: { diagnostics: DiagnosticResult['diagnostics'], buildingId: string, floorId: string } }
    | { type: 'UPDATE_RACK', payload: { rack: RackContainer, buildingId: string, floorId: string } };

const initialState: ProjectState = {
    projectName: 'New CCTV Plan',
    buildings: [],
    vlans: [],
    subnets: [],
};

function projectReducer(state: ProjectState, action: Action): ProjectState {
     // Helper function to update a specific floor
    const updateFloor = (
      buildings: Building[], 
      bId: string, 
      fId: string, 
      updateFn: (floor: Floor) => Floor
    ) => {
        return buildings.map(b => b.id === bId ? {
            ...b,
            floors: b.floors.map(f => f.id === fId ? updateFn(f) : f)
        } : b);
    };

    switch (action.type) {
        case 'LOAD_PROJECT':
            return action.payload;
        case 'SET_ACTIVE_FLOOR':
            return state; // No state change needed, handled by setActiveIds
        case 'ADD_DEVICE':
            return {
                ...state,
                buildings: updateFloor(state.buildings, action.payload.buildingId, action.payload.floorId, f => ({
                    ...f, devices: [...f.devices, action.payload.device]
                }))
            };
        case 'UPDATE_DEVICE':
            return {
                ...state,
                buildings: updateFloor(state.buildings, action.payload.buildingId, action.payload.floorId, f => ({
                    ...f, devices: f.devices.map(d => d.id === action.payload.device.id ? action.payload.device : d)
                }))
            };
        case 'UPDATE_RACK':
             return {
                ...state,
                buildings: updateFloor(state.buildings, action.payload.buildingId, action.payload.floorId, f => ({
                    ...f, devices: f.devices.map(d => d.id === action.payload.rack.id ? action.payload.rack : d)
                }))
            };
        case 'REMOVE_DEVICE':
            return {
                ...state,
                buildings: updateFloor(state.buildings, action.payload.buildingId, action.payload.floorId, f => ({
                    ...f, 
                    devices: f.devices.filter(d => d.id !== action.payload.deviceId),
                    connections: f.connections.filter(c => c.fromDeviceId !== action.payload.deviceId && c.toDeviceId !== action.payload.deviceId)
                }))
            };
        case 'ADD_CONNECTION':
             return {
                ...state,
                buildings: updateFloor(state.buildings, action.payload.buildingId, action.payload.floorId, f => ({
                    ...f, connections: [...f.connections, action.payload.connection]
                }))
            };
        case 'SET_FLOOR_PLAN':
             return {
                ...state,
                buildings: updateFloor(state.buildings, action.payload.buildingId, action.payload.floorId, f => ({
                    ...f, floorPlanUrl: action.payload.url
                }))
            };
        case 'ADD_ARCH_ELEMENT':
             return {
                ...state,
                buildings: updateFloor(state.buildings, action.payload.buildingId, action.payload.floorId, f => ({
                    ...f, architecturalElements: [...f.architecturalElements, action.payload.element]
                }))
            };
        case 'SET_DIAGNOSTICS':
             return {
                ...state,
                buildings: updateFloor(state.buildings, action.payload.buildingId, action.payload.floorId, f => ({
                    ...f, diagnostics: action.payload.diagnostics
                }))
            };
        default:
            return state;
    }
}

export function CCTVPlanner() {
    const [projectState, dispatch] = useReducer(projectReducer, initialState);
    const [activeIds, setActiveIds] = useState<{ buildingId: string | null; floorId: string | null }>({ buildingId: null, floorId: null });
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const demoProject = generateDemoProject();
        dispatch({ type: 'LOAD_PROJECT', payload: demoProject });
        if (demoProject.buildings.length > 0 && demoProject.buildings[0].floors.length > 0) {
            setActiveIds({
                buildingId: demoProject.buildings[0].id,
                floorId: demoProject.buildings[0].floors[0].id
            });
        }
    }, []);

    const activeBuilding = useMemo(() => projectState.buildings.find(b => b.id === activeIds.buildingId), [projectState.buildings, activeIds.buildingId]);
    const activeFloor = useMemo(() => activeBuilding?.floors.find(f => f.id === activeIds.floorId), [activeBuilding, activeIds.floorId]);

    const [selectedDevice, setSelectedDevice] = useState<AnyDevice | null>(null);
    const [cablingMode, setCablingMode] = useState<CablingMode>({ enabled: false, fromDeviceId: null });
    const [selectedArchTool, setSelectedArchTool] = useState<ArchitecturalElementType | null>(null);
    const [drawingState, setDrawingState] = useState<{ isDrawing: boolean, startPoint: Point | null }>({ isDrawing: false, startPoint: null });
    const [floorPlanRect, setFloorPlanRect] = useState<DOMRect | null>(null);
    const [isTopologyViewOpen, setTopologyViewOpen] = useState(false);
    const [isRackViewOpen, setRackViewOpen] = useState(false);
    
    // AI states
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isDiagnosing, setIsDiagnosing] = useState(false);

    const handleFloorSelect = (buildingId: string, floorId: string) => {
        setActiveIds({ buildingId, floorId });
        setSelectedDevice(null);
        setFloorPlanRect(null); // Reset rect on floor change
    };

    const handleAddDevice = (type: DeviceType) => {
        if (!activeFloor || !activeIds.buildingId || !activeIds.floorId) return;
        
        const newDevice = createDevice(type, 0.5, 0.5, activeFloor.devices);
        dispatch({
            type: 'ADD_DEVICE',
            payload: { device: newDevice, buildingId: activeIds.buildingId, floorId: activeIds.floorId }
        });
        toast({ title: "เพิ่มอุปกรณ์แล้ว", description: `เพิ่ม ${newDevice.label} ลงในแผนผัง` });
    };
    
    const handleSetFloorPlan = (file: File) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
                dispatch({
                    type: 'SET_FLOOR_PLAN',
                    payload: { url: e.target.result, buildingId: activeIds.buildingId!, floorId: activeIds.floorId! }
                });
                toast({ title: "อัปโหลดแผนผังสำเร็จ" });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateDevice = useCallback((device: AnyDevice) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'UPDATE_DEVICE', payload: { device, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
    }, [activeIds.buildingId, activeIds.floorId]);

    const handleUpdateRack = useCallback((rack: RackContainer) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'UPDATE_RACK', payload: { rack, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
    }, [activeIds.buildingId, activeIds.floorId]);


    const handleRemoveDevice = (deviceId: string) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'REMOVE_DEVICE', payload: { deviceId, buildingId: activeIds.buildingId, floorId: activeIds.floorId }});
        setSelectedDevice(null);
        toast({ title: "ลบอุปกรณ์แล้ว", variant: "destructive" });
    };

    const handleAddConnection = (connection: Connection) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'ADD_CONNECTION', payload: { connection, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
        toast({ title: "สร้างการเชื่อมต่อแล้ว" });
    };
    
    const handleAddArchElement = (elem: ArchitecturalElement) => {
       if (!activeIds.buildingId || !activeIds.floorId) return;
       dispatch({ type: 'ADD_ARCH_ELEMENT', payload: { element: elem, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
    };
    
    const handleUpdateFloorPlanRect = useCallback((rect: DOMRect) => {
        setFloorPlanRect(rect);
    }, []);

    const handleAnalyzePlan = async () => {
        if (!activeFloor) return;
        setIsAnalyzing(true);
        const deviceSummary = activeFloor.devices.map(d => d.label).join(', ');
        const result = await analyzeCctvPlanAction({ deviceSummary, totalFloors: 1 });

        if (result.success) {
            toast({
                title: "AI Analysis Complete",
                description: result.data.analysis,
                duration: 9000,
            });
        } else {
            toast({ title: "Analysis Failed", description: result.error, variant: 'destructive' });
        }
        setIsAnalyzing(false);
    };

    const handleSuggestPlacements = async () => {
        if (!activeFloor?.floorPlanUrl) {
            toast({ title: "No Floor Plan", description: "Please upload a floor plan before suggesting placements.", variant: 'destructive' });
            return;
        }
        setIsSuggesting(true);
        const result = await suggestDevicePlacementsAction({ floorPlanDataUri: activeFloor.floorPlanUrl });
        
        if (result.success && activeIds.buildingId && activeIds.floorId) {
            const bId = activeIds.buildingId;
            const fId = activeIds.floorId;
            result.data.forEach(suggestion => {
                const newDevice = createDevice(suggestion.type, suggestion.x, suggestion.y, activeFloor.devices);
                dispatch({ type: 'ADD_DEVICE', payload: { device: newDevice, buildingId: bId, floorId: fId }});
            });
            toast({ title: "AI Suggestions Added", description: `Added ${result.data.length} new devices to the plan.` });
        } else if (!result.success) {
            toast({ title: "Suggestion Failed", description: result.error, variant: 'destructive' });
        }
        setIsSuggesting(false);
    };
    
    const handleRunDiagnostics = async () => {
        if (!activeFloor || !activeIds.buildingId || !activeIds.floorId) return;
        setIsDiagnosing(true);
        
        const planData = {
            devices: activeFloor.devices.map(d => ({
                id: d.id, label: d.label, type: d.type,
                channels: d.channels, ports: d.ports
            })),
            connections: activeFloor.connections.map(c => ({
                fromDeviceId: c.fromDeviceId, toDeviceId: c.toDeviceId
            })),
        };

        const result = await runPlanDiagnosticsAction(planData);
        if (result.success) {
            dispatch({
                type: 'SET_DIAGNOSTICS',
                payload: { diagnostics: result.data.diagnostics, buildingId: activeIds.buildingId, floorId: activeIds.floorId }
            });
            toast({ title: 'Diagnostics Complete' });
        } else {
            toast({ title: "Diagnostics Failed", description: result.error, variant: 'destructive' });
        }
        setIsDiagnosing(false);
    };

    const handleSelectDevice = (device: AnyDevice | null) => {
        setSelectedDevice(device);
        setCablingMode({ enabled: false, fromDeviceId: null });
        if (device?.type.startsWith('rack')) {
            setRackViewOpen(true);
        }
    }

    return (
        <div className="w-full h-screen flex bg-background text-foreground">
            <aside className="w-96 h-full flex flex-col border-r border-border bg-card shadow-lg overflow-y-auto">
                <div className="p-4 border-b border-border flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">CCTV Visionary</h1>
                        <p className="text-muted-foreground text-sm">{projectState.projectName}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                </div>
                <div className="p-2 space-y-4">
                    <ProjectNavigator 
                        buildings={projectState.buildings}
                        activeFloorId={activeIds.floorId}
                        onFloorSelect={handleFloorSelect}
                    />
                    <FloorPlanUpload onSetFloorPlan={handleSetFloorPlan} />
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
                     <BillOfMaterials project={projectState} />
                </div>
            </aside>
            
            <main className="flex-1 w-full h-full flex flex-col">
                 <div className="h-16 border-b border-border flex items-center justify-between px-4">
                    <DevicesToolbar onSelectDevice={handleAddDevice} />
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setTopologyViewOpen(true)}><Network /> View Topology</Button>
                        <Button variant="outline" disabled><FolderOpen/> Load</Button>
                        <Button disabled><Save /> Save</Button>
                    </div>
                </div>

                <div className="flex-1 w-full h-full relative">
                    {activeFloor ? (
                        <PlannerCanvas
                            floor={activeFloor}
                            selectedDevice={selectedDevice}
                            onSelectDevice={handleSelectDevice}
                            onUpdateDevice={handleUpdateDevice}
                            onCanvasClick={() => setSelectedDevice(null)}
                            cablingMode={cablingMode}
                            onSetCablingMode={setCablingMode}
                            onAddConnection={handleAddConnection}
                            selectedArchTool={selectedArchTool}
                            drawingState={drawingState}
                            onSetDrawingState={setDrawingState}
                            onAddArchElement={handleAddArchElement}
                            floorPlanRect={floorPlanRect}
                            onUpdateFloorPlanRect={handleUpdateFloorPlanRect}
                        />
                    ) : (
                        <div className="flex-1 w-full h-full flex items-center justify-center bg-muted/20">
                            <p className="text-muted-foreground">Please select a building and floor to begin.</p>
                        </div>
                    )}
                </div>
            </main>

            <aside className="w-96 h-full flex flex-col border-l border-border bg-card shadow-lg">
                <PropertiesPanel 
                    selectedDevice={selectedDevice}
                    onUpdateDevice={handleUpdateDevice}
                    onRemoveDevice={handleRemoveDevice}
                    onStartCabling={(deviceId) => setCablingMode({ enabled: true, fromDeviceId: deviceId })}
                    onViewRack={() => setRackViewOpen(true)}
                />
            </aside>

            <LogicalTopologyView
                devices={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.devices))}
                connections={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.connections))}
                isOpen={isTopologyViewOpen}
                onClose={() => setTopologyViewOpen(false)}
            />

            <RackElevationView
                rack={selectedDevice?.type.startsWith('rack') ? selectedDevice as RackContainer : null}
                isOpen={isRackViewOpen}
                onClose={() => setRackViewOpen(false)}
                onUpdateRack={handleUpdateRack}
             />
        </div>
    );
}

    