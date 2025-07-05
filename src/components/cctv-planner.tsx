'use client';

import React, { useReducer, useState, useMemo, useEffect, useCallback } from 'react';
import { createInitialState, generateDemoProject } from '@/lib/demo-data';
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
import { Loader2, Milestone, Presentation, Network, Settings, Files, Bot } from 'lucide-react';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { SystemStatusPanel, type SystemCheck } from './sidebar/system-status-panel';
import { ReportService } from '@/lib/report.service';
import { NetworkSettings } from './sidebar/network-settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


type Action =
  | { type: 'SET_PROJECT'; payload: ProjectState }
  | { type: 'UPDATE_PROJECT_NAME'; payload: string }
  | { type: 'ADD_DEVICE'; payload: { device: AnyDevice; buildingId: string; floorId: string } }
  | { type: 'UPDATE_DEVICE'; payload: { device: AnyDevice; buildingId: string; floorId: string } }
  | { type: 'REMOVE_DEVICE'; payload: { deviceId: string; buildingId: string; floorId: string } }
  | { type: 'ADD_CONNECTION'; payload: { connection: Connection; buildingId: string; floorId: string } }
  | { type: 'SET_FLOOR_PLAN'; payload: { url: string; rect: DOMRect; buildingId: string; floorId: string } }
  | { type: 'SET_DIAGNOSTICS'; payload: { diagnostics: DiagnosticResult['diagnostics']; buildingId: string; floorId: string } }
  | { type: 'ADD_ARCH_ELEMENT'; payload: { element: ArchitecturalElement; buildingId: string; floorId: string } }
  | { type: 'UPDATE_ARCH_ELEMENT'; payload: { element: ArchitecturalElement; buildingId: string; floorId: string } }
  | { type: 'REMOVE_ARCH_ELEMENT'; payload: { elementId: string; buildingId: string; floorId: string } }
  | { type: 'UPDATE_BUILDING_NAME'; payload: { buildingId: string; newName: string } }
  | { type: 'ADD_FLOOR'; payload: { buildingId: string } }
  | { type: 'UPDATE_RACK'; payload: { rack: RackContainer; buildingId: string; floorId: string } };

function projectReducer(state: ProjectState, action: Action): ProjectState {
  switch (action.type) {
    case 'SET_PROJECT':
      return action.payload;
    case 'UPDATE_PROJECT_NAME':
      return { ...state, projectName: action.payload };
    case 'ADD_DEVICE':
    case 'UPDATE_DEVICE':
    case 'REMOVE_DEVICE':
    case 'ADD_CONNECTION':
    case 'SET_FLOOR_PLAN':
    case 'SET_DIAGNOSTICS':
    case 'ADD_ARCH_ELEMENT':
    case 'UPDATE_ARCH_ELEMENT':
    case 'REMOVE_ARCH_ELEMENT':
    case 'UPDATE_RACK':
    case 'ADD_FLOOR':
    case 'UPDATE_BUILDING_NAME': {
        const { buildingId } = action.payload;
        return {
            ...state,
            buildings: state.buildings.map(b => {
                if (b.id !== buildingId) return b;

                if (action.type === 'UPDATE_BUILDING_NAME') {
                    return { ...b, name: action.payload.newName };
                }
                if (action.type === 'ADD_FLOOR') {
                    const newFloorNumber = b.floors.length + 1;
                    const newFloor: Floor = {
                        id: `flr_${Date.now()}`,
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

                const { floorId } = action.payload as any; // Action types with floorId
                return {
                    ...b,
                    floors: b.floors.map(f => {
                        if (f.id !== floorId) return f;

                        let newDevices = f.devices;
                        switch (action.type) {
                            case 'ADD_DEVICE': newDevices = [...f.devices, action.payload.device]; break;
                            case 'UPDATE_DEVICE': newDevices = f.devices.map(d => d.id === action.payload.device.id ? action.payload.device : d); break;
                            case 'REMOVE_DEVICE': newDevices = f.devices.filter(d => d.id !== action.payload.deviceId); break;
                            case 'UPDATE_RACK': newDevices = f.devices.map(d => d.id === action.payload.rack.id ? action.payload.rack : d); break;
                        }

                        let newConnections = f.connections;
                        if (action.type === 'ADD_CONNECTION') newConnections = [...f.connections, action.payload.connection];

                        let newArchElements = f.architecturalElements;
                        switch (action.type) {
                             case 'ADD_ARCH_ELEMENT': newArchElements = [...f.architecturalElements, action.payload.element]; break;
                             case 'UPDATE_ARCH_ELEMENT': newArchElements = f.architecturalElements.map(e => e.id === action.payload.element.id ? action.payload.element : e); break;
                             case 'REMOVE_ARCH_ELEMENT': newArchElements = f.architecturalElements.filter(e => e.id !== action.payload.elementId); break;
                        }

                        let newFloorPlanUrl = f.floorPlanUrl;
                        let newFloorPlanRect = f.floorPlanRect;
                        if (action.type === 'SET_FLOOR_PLAN') {
                            newFloorPlanUrl = action.payload.url;
                            newFloorPlanRect = action.payload.rect;
                        }
                        
                        let newDiagnostics = f.diagnostics;
                        if (action.type === 'SET_DIAGNOSTICS') newDiagnostics = action.payload.diagnostics;

                        return { ...f, devices: newDevices, connections: newConnections, architecturalElements: newArchElements, floorPlanUrl: newFloorPlanUrl, diagnostics: newDiagnostics, floorPlanRect: newFloorPlanRect };
                    })
                };
            })
        };
    }
    default:
      return state;
  }
}


function CCTVPlannerInner() {
    const [projectState, dispatch] = useReducer(projectReducer, createInitialState());
    const { selectedItem, setSelectedItem } = useSelection();
    const isMobile = useIsMobile();
    
    // UI State
    const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
    const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTopologyViewOpen, setIsTopologyViewOpen] = useState(false);
    const [activeRack, setActiveRack] = useState<RackContainer | null>(null);
    const { toast } = useToast();

    // Canvas/Floor State
    const [cablingMode, setCablingMode] = useState<CablingMode>({ enabled: false, fromDeviceId: null });
    const [selectedArchTool, setSelectedArchTool] = useState<ArchitecturalElementType | null>(null);
    const [drawingState, setDrawingState] = useState({ isDrawing: false, startPoint: null });
    const [floorPlanRect, setFloorPlanRect] = useState<DOMRect | null>(null);
    const [activeIds, setActiveIds] = useState(() => {
        const firstBuilding = projectState.buildings[0];
        const firstFloor = firstBuilding?.floors[0];
        return {
            buildingId: firstBuilding?.id || null,
            floorId: firstFloor?.id || null
        };
    });

    const activeBuilding = useMemo(() => {
        return projectState.buildings.find(b => b.id === activeIds.buildingId);
    }, [projectState.buildings, activeIds.buildingId]);

    const activeFloor = useMemo(() => {
        return activeBuilding?.floors.find(f => f.id === activeIds.floorId);
    }, [activeBuilding, activeIds.floorId]);


    // AI State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    
    const [systemChecks, setSystemChecks] = useState<SystemCheck[]>([
        { id: 'nvr-check', name: 'NVR Capacity Check', status: 'pending' },
        { id: 'switch-check', name: 'Switch Port Check', status: 'pending' },
        { id: 'connectivity-check', name: 'Connectivity Check', status: 'pending' },
        { id: 'power-check', name: 'Power Load Check', status: 'pending' },
    ]);


    const handleFloorSelect = (buildingId: string, floorId: string) => {
        setActiveIds({ buildingId, floorId });
        setSelectedItem(null); // Deselect item when changing floors
    };

    const handleUpdateProjectName = (name: string) => {
        dispatch({ type: 'UPDATE_PROJECT_NAME', payload: name });
    };

    const handleSaveProject = async () => {
        setIsSaving(true);
        const result = await saveProjectAction(projectState);
        if (result.success) {
            toast({ title: 'Project Saved!', description: `Project "${projectState.projectName}" has been successfully saved.` });
        } else {
            toast({ title: 'Save Failed', description: result.error, variant: 'destructive' });
        }
        setIsSaving(false);
    };
    
    const handleLoadProject = async (projectId: string) => {
        const result = await loadProjectAction(projectId);
        if (result.success) {
            dispatch({ type: 'SET_PROJECT', payload: result.data });
            const firstBuilding = result.data.buildings[0];
            const firstFloor = firstBuilding?.floors[0];
            setActiveIds({
                buildingId: firstBuilding?.id || null,
                floorId: firstFloor?.id || null
            });
            toast({ title: 'Project Loaded', description: `"${result.data.projectName}" is now active.` });
        } else {
            toast({ title: 'Load Failed', description: result.error, variant: 'destructive' });
        }
    };

    const handleSetFloorPlan = (file: File) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            if (url) {
                 const img = new Image();
                 img.onload = () => {
                    const rect = { x: 0, y: 0, width: img.width, height: img.height, top: 0, right: img.width, bottom: img.height, left: 0 } as DOMRect;
                    dispatch({ type: 'SET_FLOOR_PLAN', payload: { url, rect, buildingId: activeIds.buildingId!, floorId: activeIds.floorId! }});
                    toast({ title: 'Floor plan updated!' });
                 };
                 img.src = url;
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAddDevice = (type: DeviceType) => {
        if (!activeFloor || !floorPlanRect) {
            toast({ title: "Cannot Add Device", description: "Please upload and define a floor plan area first.", variant: 'destructive' });
            return;
        }
        const newDevice = createDevice(type, 0.5, 0.5, activeFloor.devices);
        dispatch({ type: 'ADD_DEVICE', payload: { device: newDevice, buildingId: activeIds.buildingId!, floorId: activeIds.floorId! } });
        setSelectedItem(newDevice);
    };
    
    const handleUpdateDevice = (device: AnyDevice) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'UPDATE_DEVICE', payload: { device, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
        setSelectedItem(device);
    };

    const handleRemoveDevice = (deviceId: string) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'REMOVE_DEVICE', payload: { deviceId, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
        setSelectedItem(null);
    };

    const handleAddArchElement = (element: ArchitecturalElement) => {
         if (!activeIds.buildingId || !activeIds.floorId) return;
         dispatch({ type: 'ADD_ARCH_ELEMENT', payload: { element, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
         setSelectedArchTool(null); // Deselect tool after drawing
    };
    
    const handleUpdateArchElement = (element: ArchitecturalElement) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'UPDATE_ARCH_ELEMENT', payload: { element, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
        setSelectedItem(element);
    }
    
    const handleRemoveArchElement = (elementId: string) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'REMOVE_ARCH_ELEMENT', payload: { elementId, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
        setSelectedItem(null);
    }

    const handleStartCabling = (deviceId: string) => {
        setCablingMode({ enabled: true, fromDeviceId: deviceId });
        toast({ title: 'Cabling Mode', description: 'Select another device to complete the connection.' });
    };

    const handleAddConnection = (connection: Connection) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'ADD_CONNECTION', payload: { connection, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
    };

    const handleAnalyzePlan = async () => {
        if (!activeFloor) return;
        setIsAnalyzing(true);
        const deviceSummary = activeFloor.devices.map(d => d.label).join(', ');
        const result = await analyzeCctvPlanAction({ deviceSummary, totalFloors: projectState.buildings.reduce((acc, b) => acc + b.floors.length, 0) });
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
            const currentDevices = activeFloor?.devices || [];
            result.data.forEach(suggestion => {
                const newDevice = createDevice(suggestion.type as DeviceType, suggestion.x, suggestion.y, currentDevices);
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

    const handleUpdateRack = (rack: RackContainer) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'UPDATE_RACK', payload: { rack, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
        setActiveRack(rack); // Keep the dialog updated
    };

    const handleAddFloor = (buildingId: string) => {
        dispatch({ type: 'ADD_FLOOR', payload: { buildingId } });
    };

    const handleUpdateBuildingName = (buildingId: string, newName: string) => {
        dispatch({ type: 'UPDATE_BUILDING_NAME', payload: { buildingId, newName } });
    }
    
    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            const reportService = new ReportService(projectState);
            await reportService.generateReport();
            toast({ title: 'Report Generated', description: 'Your PDF report has been downloaded.' });
        } catch (error: any) {
            toast({ title: 'Report Failed', description: error.message, variant: 'destructive' });
        }
        setIsGeneratingReport(false);
    };


    const SidePanelContent = () => (
        <>
            <SidebarHeader>
                 <PlanManagement
                    planName={projectState.projectName}
                    isSaving={isSaving}
                    onPlanNameChange={handleUpdateProjectName}
                    onSave={handleSaveProject}
                    onOpenManager={() => setIsProjectManagerOpen(true)}
                />
            </SidebarHeader>
             <SidebarContent className="p-0">
                <Tabs defaultValue="plan" className="flex flex-col h-full">
                    <TabsList className="grid w-full grid-cols-4 mx-auto max-w-sm rounded-none h-auto p-0 border-b">
                         <TabsTrigger value="plan" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary">
                             <Files className="w-4 h-4 mr-2"/> Plan
                         </TabsTrigger>
                         <TabsTrigger value="ai" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary">
                             <Bot className="w-4 h-4 mr-2"/> AI Tools
                         </TabsTrigger>
                         <TabsTrigger value="network" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary">
                              <Network className="w-4 h-4 mr-2"/> Network
                         </TabsTrigger>
                         <TabsTrigger value="settings" className="rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary">
                             <Settings className="w-4 h-4 mr-2"/> Settings
                         </TabsTrigger>
                    </TabsList>
                    <TabsContent value="plan" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                        <ProjectNavigator 
                            buildings={projectState.buildings}
                            activeBuildingId={activeIds.buildingId}
                            activeFloorId={activeIds.floorId}
                            onFloorSelect={handleFloorSelect}
                            onAddFloor={handleAddFloor}
                            onUpdateBuildingName={handleUpdateBuildingName}
                        />
                         <FloorPlanUpload onSetFloorPlan={handleSetFloorPlan} />
                         <DevicesToolbar onSelectDevice={handleAddDevice} />
                         <ArchitectureToolbar selectedTool={selectedArchTool} onSelectTool={setSelectedArchTool} />
                    </TabsContent>
                    <TabsContent value="ai" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
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
                         <Card>
                            <CardHeader className="p-3">
                                <CardTitle className="text-sm font-semibold">Generate Report</CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                <Button onClick={handleGenerateReport} disabled={isGeneratingReport} className="w-full">
                                    {isGeneratingReport ? <Loader2 className="animate-spin" /> : <Presentation />}
                                    {isGeneratingReport ? 'Generating...' : 'Create PDF Report'}
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="network" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                         <NetworkSettings vlans={projectState.vlans} subnets={projectState.subnets} onAddVlan={()=>{}} onAddSubnet={()=>{}}/>
                    </TabsContent>
                    <TabsContent value="settings" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                        <BillOfMaterials project={projectState} />
                        <SystemStatusPanel statuses={systemChecks} onRunChecks={() => {}} isLoading={false} />
                    </TabsContent>
                </Tabs>
            </SidebarContent>
        </>
    );

    return (
         <SidebarProvider>
            {isMobile ? (
                <Sheet open={isPropertiesPanelOpen} onOpenChange={setIsPropertiesPanelOpen}>
                    <SheetContent side="right" className="p-0 w-[85vw]">
                        <PropertiesPanel 
                            onUpdateDevice={handleUpdateDevice}
                            onRemoveDevice={handleRemoveDevice}
                            onStartCabling={handleStartCabling}
                            onViewRack={(rack) => setActiveRack(rack)}
                            onRemoveArchElement={handleRemoveArchElement}
                            onUpdateArchElement={handleUpdateArchElement}
                        />
                    </SheetContent>
                </Sheet>
            ) : (
                <div className={`transition-all duration-300 ${isPropertiesPanelOpen ? 'mr-[350px]' : 'mr-0'}`}></div>
            )}
            
            <Sidebar>
                <SidePanelContent />
            </Sidebar>

            <div className="flex-1 flex flex-col min-h-screen">
                 <header className="p-2 h-14 flex items-center justify-between border-b gap-4 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2">
                         <SidebarToggle />
                    </div>
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2">
                        <h1 className="text-lg font-semibold truncate px-4">{projectState.projectName}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" onClick={() => setIsTopologyViewOpen(true)}>
                            <Network className="mr-2"/> Topology
                        </Button>
                        <ThemeToggle />
                        <PropertiesToggleButton 
                           isOpen={isPropertiesPanelOpen}
                           onChange={setIsPropertiesPanelOpen}
                        />
                    </div>
                </header>
                <main className="flex-1 flex flex-col min-h-0 relative">
                    {activeFloor ? (
                        <PlannerCanvas
                            floor={activeFloor}
                            onUpdateDevice={handleUpdateDevice}
                            cablingMode={cablingMode}
                            onSetCablingMode={setCablingMode}
                            onAddConnection={handleAddConnection}
                            selectedArchTool={selectedArchTool}
                            drawingState={drawingState}
                            onSetDrawingState={setDrawingState}
                            onAddArchElement={handleAddArchElement}
                            onUpdateArchElement={handleUpdateArchElement}
                            floorPlanRect={floorPlanRect}
                            onUpdateFloorPlanRect={setFloorPlanRect}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted/50">
                            <div className="text-center text-muted-foreground p-4">
                                <p className="font-semibold text-lg">No active floor</p>
                                <p className="text-sm">Please select a floor from the navigator or load a project.</p>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            
             {!isMobile && (
                 <div className={`fixed top-0 right-0 h-screen bg-card border-l transition-transform duration-300 ease-in-out ${isPropertiesPanelOpen ? 'translate-x-0' : 'translate-x-full'}`} style={{ width: '350px' }}>
                    <PropertiesPanel 
                         onUpdateDevice={handleUpdateDevice}
                         onRemoveDevice={handleRemoveDevice}
                         onStartCabling={handleStartCabling}
                         onViewRack={(rack) => setActiveRack(rack)}
                         onRemoveArchElement={handleRemoveArchElement}
                         onUpdateArchElement={handleUpdateArchElement}
                    />
                 </div>
            )}


            <LogicalTopologyView 
                devices={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.devices))}
                connections={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.connections))}
                isOpen={isTopologyViewOpen}
                onClose={() => setIsTopologyViewOpen(false)}
            />

             <RackElevationView
                rack={activeRack}
                isOpen={!!activeRack}
                onClose={() => setActiveRack(null)}
                onUpdateRack={handleUpdateRack}
            />
            
            <ProjectManager 
                isOpen={isProjectManagerOpen}
                onClose={() => setIsProjectManagerOpen(false)}
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
