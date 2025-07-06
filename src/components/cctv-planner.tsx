
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { produce } from 'immer';
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DevicesToolbar } from './sidebar/devices-toolbar';
import { ArchitectureToolbar } from './sidebar/architecture-toolbar';
import { AiAssistant } from './sidebar/ai-assistant';
import { DiagnosticsPanel } from './sidebar/diagnostics-panel';
import { ProjectNavigator } from './sidebar/project-navigator';
import { BillOfMaterials } from './sidebar/bill-of-materials';
import { PropertiesPanel } from './sidebar/properties-panel';
import { PlannerCanvas } from './canvas/planner-canvas';
import { PlanManagement } from './sidebar/plan-management';
import { ProjectManager } from './sidebar/project-manager';
import { RackElevationView } from './rack/rack-elevation-view';
import { LogicalTopologyView } from './topology/logical-topology-view';
import { SelectionProvider, useSelection } from '@/contexts/SelectionContext';
import { createDevice } from '@/lib/device-config';
import { createInitialState } from '@/lib/demo-data';
import type { ProjectState, AnyDevice, Floor, Building, ArchitecturalElement, ArchitecturalElementType, CablingMode, DeviceType, Connection, RackContainer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  saveProjectAction,
  loadProjectAction,
  deleteProjectAction,
  updateProjectNameAction,
  runPlanDiagnosticsAction,
  suggestDevicePlacementsAction,
  findCablePathAction,
} from '@/app/actions';
import { Map, Settings, Bot, Presentation, Network, BarChart2, Loader2, Eye } from 'lucide-react';

function CCTVPlannerInner() {
    const [projectState, setProjectState] = useState<ProjectState>(createInitialState());
    const [activeBuildingId, setActiveBuildingId] = useState<string | null>(projectState.buildings[0]?.id || null);
    const [activeFloorId, setActiveFloorId] = useState<string | null>(projectState.buildings[0]?.floors[0]?.id || null);
    
    const [cablingMode, setCablingMode] = useState<CablingMode>({ enabled: false, fromDeviceId: null });
    const [drawingTool, setDrawingTool] = useState<ArchitecturalElementType | null>(null);
    const [isPropertiesPanelOpen, setPropertiesPanelOpen] = useState(true);
    const [isMobilePropertiesSheetOpen, setMobilePropertiesSheetOpen] = useState(false);
    
    // UI states
    const [isProjectManagerOpen, setProjectManagerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTopologyViewOpen, setIsTopologyViewOpen] = useState(false);
    const [activeRack, setActiveRack] = useState<RackContainer | null>(null);
    const { toast } = useToast();

    // AI states
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isFindingPaths, setIsFindingPaths] = useState(false);
    const [isDiagnosticsLoading, setDiagnosticsLoading] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    
    const { selectedItem, setSelectedItem } = useSelection();
    
    const getActiveFloor = useCallback((): Floor | undefined => {
        const building = projectState.buildings.find(b => b.id === activeBuildingId);
        return building?.floors.find(f => f.id === activeFloorId);
    }, [projectState, activeBuildingId, activeFloorId]);

    const updateFloorData = (floorId: string, updates: Partial<Floor>) => {
        setProjectState(produce(draft => {
            for (const building of draft.buildings) {
                const floorIndex = building.floors.findIndex(f => f.id === floorId);
                if (floorIndex !== -1) {
                    building.floors[floorIndex] = { ...building.floors[floorIndex], ...updates };
                    break;
                }
            }
        }));
    };

    const handleAddDevice = (type: DeviceType) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;
        // For simplicity, add to center for now
        const newDevice = createDevice(type, 0.5, 0.5, activeFloor.devices);
        const updatedDevices = [...activeFloor.devices, newDevice];
        updateFloorData(activeFloor.id, { devices: updatedDevices });
        setSelectedItem(newDevice);
    };

    const handleUpdateDevice = (updatedDevice: AnyDevice) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;
        
        const updatedDevices = activeFloor.devices.map(d => d.id === updatedDevice.id ? updatedDevice : d);
        updateFloorData(activeFloor.id, { devices: updatedDevices });
        setSelectedItem(updatedDevice);
    };

    const handleRemoveDevice = (deviceId: string) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;

        const updatedDevices = activeFloor.devices.filter(d => d.id !== deviceId);
        const updatedConnections = activeFloor.connections.filter(c => c.fromDeviceId !== deviceId && c.toDeviceId !== deviceId);
        updateFloorData(activeFloor.id, { devices: updatedDevices, connections: updatedConnections });
        setSelectedItem(null);
    };

    const handleFloorSelect = (buildingId: string, floorId: string) => {
        setActiveBuildingId(buildingId);
        setActiveFloorId(floorId);
        setSelectedItem(null);
    };

    const handleDeviceClick = (device: AnyDevice) => {
        if (cablingMode.enabled && cablingMode.fromDeviceId) {
            if (cablingMode.fromDeviceId === device.id) {
                setCablingMode({ enabled: false, fromDeviceId: null });
                setSelectedItem(device);
            } else {
                handleCreateConnection(cablingMode.fromDeviceId, device.id);
            }
        } else {
            setSelectedItem(device);
            if (window.innerWidth < 768) { // Open sheet on mobile
                setMobilePropertiesSheetOpen(true);
            }
        }
    };
    
    const handleCreateConnection = (fromDeviceId: string, toDeviceId: string) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;
        
        const newConnection: Connection = {
            id: `conn_${Date.now()}`,
            fromDeviceId,
            toDeviceId,
            cableType: 'utp-cat6', // Default
        };

        const updatedConnections = [...activeFloor.connections, newConnection];
        updateFloorData(activeFloor.id, { connections: updatedConnections });
        
        setCablingMode({ enabled: false, fromDeviceId: null });
        setSelectedItem(null);
    };
    
    const handleDeviceMove = (deviceId: string, pos: { x: number; y: number }) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;

        setProjectState(
            produce(draft => {
                const floor = draft.buildings
                    .flatMap(b => b.floors)
                    .find(f => f.id === activeFloorId);
                
                if (floor) {
                    const deviceToMove = floor.devices.find(d => d.id === deviceId);
                    if (deviceToMove) {
                        const offsetX = (deviceToMove.connectionPoint?.x ?? deviceToMove.x) - deviceToMove.x;
                        const offsetY = (deviceToMove.connectionPoint?.y ?? deviceToMove.y) - deviceToMove.y;
                        
                        deviceToMove.x = pos.x;
                        deviceToMove.y = pos.y;
                        
                        if (deviceToMove.connectionPoint) {
                            deviceToMove.connectionPoint.x = pos.x + offsetX;
                            deviceToMove.connectionPoint.y = pos.y + offsetY;
                        } else {
                             deviceToMove.connectionPoint = { x: pos.x, y: pos.y };
                        }
                    }
                }
            })
        );
    };

    const handleConnectionPointMove = (deviceId: string, pos: { x: number; y: number }) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;
        const updatedDevices = activeFloor.devices.map(d => 
            d.id === deviceId ? { ...d, connectionPoint: pos } : d
        );
        updateFloorData(activeFloor.id, { devices: updatedDevices });
    };

    // Project Management Handlers
    const handleSaveProject = async () => {
        setIsSaving(true);
        const result = await saveProjectAction(projectState);
        if (result.success) {
            toast({ title: 'Project Saved Successfully!' });
        } else {
            toast({ title: 'Error Saving Project', description: result.error, variant: 'destructive' });
        }
        setIsSaving(false);
    };
    
    const handleLoadProject = async (projectId: string) => {
        const result = await loadProjectAction(projectId);
        if (result.success) {
            setProjectState(result.data);
            setActiveBuildingId(result.data.buildings[0]?.id || null);
            setActiveFloorId(result.data.buildings[0]?.floors[0]?.id || null);
            setSelectedItem(null);
            toast({ title: `Project "${result.data.projectName}" loaded.` });
        } else {
            toast({ title: 'Error Loading Project', description: result.error, variant: 'destructive' });
        }
    };

    const handlePlanNameChange = (name: string) => {
        setProjectState(produce(draft => {
            draft.projectName = name;
        }));
    };
    
     const handleRunDiagnostics = async () => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;

        setDiagnosticsLoading(true);

        const planData = {
            devices: activeFloor.devices.map(d => ({
                id: d.id,
                label: d.label,
                type: d.type,
                channels: d.channels,
                ports: d.ports,
            })),
            connections: activeFloor.connections.map(c => ({
                fromDeviceId: c.fromDeviceId,
                toDeviceId: c.toDeviceId
            })),
        };
        
        const result = await runPlanDiagnosticsAction(planData);
        if (result.success) {
            updateFloorData(activeFloor.id, { diagnostics: result.data.diagnostics });
        } else {
            toast({ title: "Diagnostics Failed", description: result.error, variant: 'destructive' });
        }
        setDiagnosticsLoading(false);
    };

    const handleUpdateRack = (rack: RackContainer) => {
        handleUpdateDevice(rack);
    };

    const handleFindAllCablePaths = async () => {
        const activeFloor = getActiveFloor();
        if (!activeFloor || activeFloor.connections.length === 0) {
            toast({ title: 'ไม่มีการเชื่อมต่อ', description: 'กรุณาเพิ่มการเชื่อมต่อก่อนค้นหาเส้นทาง' });
            return;
        }
    
        setIsFindingPaths(true);
        toast({ title: 'AI กำลังค้นหาเส้นทางเดินสาย...', description: 'กรุณารอสักครู่' });
    
        const updatedConnections: Connection[] = [...activeFloor.connections];
        let successCount = 0;
    
        for (let i = 0; i < updatedConnections.length; i++) {
            const conn = updatedConnections[i];
            const fromDevice = activeFloor.devices.find(d => d.id === conn.fromDeviceId);
            const toDevice = activeFloor.devices.find(d => d.id === conn.toDeviceId);
    
            if (!fromDevice || !toDevice) continue;
    
            const result = await findCablePathAction({
                startPoint: fromDevice.connectionPoint || { x: fromDevice.x, y: fromDevice.y },
                endPoint: toDevice.connectionPoint || { x: toDevice.x, y: toDevice.y },
                obstacles: activeFloor.architecturalElements.filter(el => el.type === 'wall'),
                gridSize: { width: 1, height: 1 } // Using relative coordinates
            });
    
            if (result.success && result.data.path.length > 0) {
                updatedConnections[i] = { ...conn, path: result.data.path };
                successCount++;
            } else {
                console.warn(`Failed to find path for connection ${conn.id}:`, result.error);
                if (!updatedConnections[i].path) {
                     updatedConnections[i] = { ...conn, path: [{x: fromDevice.x, y: fromDevice.y}, {x: toDevice.x, y: toDevice.y}] };
                }
            }
        }
        
        updateFloorData(activeFloor.id, { connections: updatedConnections });
    
        setIsFindingPaths(false);
        toast({ title: 'ค้นหาเส้นทางสำเร็จ', description: `AI พบเส้นทางสำหรับ ${successCount}/${updatedConnections.length} การเชื่อมต่อ` });
    };

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            const { ReportService } = await import('@/lib/report.service');
            const reportService = new ReportService(projectState);
            await reportService.generateReport();
            toast({ title: 'Report Generated', description: 'Your PDF report has been downloaded.' });
        } catch (error: any) {
            console.error("Failed to generate report:", error);
            toast({ title: 'Report Generation Failed', description: error.message, variant: 'destructive' });
        } finally {
            setIsGeneratingReport(false);
        }
    };


    const activeFloorData = getActiveFloor();
    if (!activeFloorData) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-background">
                <p>No floor selected or project is empty.</p>
                <Button onClick={() => setProjectState(createInitialState())}>Load Demo Project</Button>
            </div>
        );
    }
    
    const SidePanelContent = () => (
        <>
             <PlanManagement
                planName={projectState.projectName}
                isSaving={isSaving}
                onPlanNameChange={handlePlanNameChange}
                onSave={handleSaveProject}
                onOpenManager={() => setProjectManagerOpen(true)}
            />
            <Tabs defaultValue="tools" className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="tools"><Map className="w-4 h-4 mr-1"/> Tools</TabsTrigger>
                    <TabsTrigger value="ai"><Bot className="w-4 h-4 mr-1"/> AI</TabsTrigger>
                    <TabsTrigger value="project"><BarChart2 className="w-4 h-4 mr-1"/> Project</TabsTrigger>
                </TabsList>
                <TabsContent value="tools" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                    <ProjectNavigator 
                        buildings={projectState.buildings}
                        activeBuildingId={activeBuildingId}
                        activeFloorId={activeFloorId}
                        onFloorSelect={handleFloorSelect}
                        onAddFloor={() => { /* Implement */}}
                        onUpdateBuildingName={() => { /* Implement */}}
                    />
                    <DevicesToolbar onSelectDevice={handleAddDevice} />
                    <ArchitectureToolbar selectedTool={drawingTool} onSelectTool={setDrawingTool} />
                </TabsContent>
                 <TabsContent value="ai" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                    <AiAssistant 
                        onAnalyze={() => {}}
                        onSuggest={() => {}}
                        onFindCablePaths={handleFindAllCablePaths}
                        isAnalyzing={isAnalyzing}
                        isSuggesting={isSuggesting}
                        isFindingPaths={isFindingPaths}
                    />
                    <DiagnosticsPanel 
                        diagnostics={activeFloorData.diagnostics}
                        onRunDiagnostics={handleRunDiagnostics}
                        isLoading={isDiagnosticsLoading}
                    />
                     <Card>
                        <CardHeader className="p-3 border-b">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Network className="w-4 h-4" />Topology</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            <Button onClick={() => setIsTopologyViewOpen(true)} className="w-full">
                                <Eye className="w-4 h-4 mr-2" />View Network Topology
                            </Button>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="p-3 border-b">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Presentation className="w-4 h-4" />Generate Report</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            <Button onClick={handleGenerateReport} disabled={isGeneratingReport} className="w-full">
                                {isGeneratingReport ? <Loader2 className="animate-spin" /> : 'Create PDF Report'}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="project" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                    <BillOfMaterials project={projectState} />
                </TabsContent>
            </Tabs>
        </>
    );
    
    return (
        <div className="w-full h-screen bg-background text-foreground flex">
            <SidebarProvider>
                <Sidebar>
                    <SidebarContent>
                       <SidePanelContent />
                    </SidebarContent>
                </Sidebar>
                <SidebarInset className="flex flex-1 flex-col min-w-0">
                    <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6 sticky top-0 z-40">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger />
                            <h1 className="font-semibold text-lg truncate">{projectState.projectName}</h1>
                        </div>
                        <Button className="md:hidden" variant="outline" size="icon" onClick={() => setMobilePropertiesSheetOpen(true)}>
                            <Settings />
                            <span className="sr-only">Open Properties</span>
                        </Button>
                    </header>
                    <main className="flex-1 flex min-h-0">
                         <div className="flex-1 relative">
                             <PlannerCanvas 
                                floor={activeFloorData} 
                                cablingMode={cablingMode}
                                onDeviceClick={handleDeviceClick}
                                onArchElementClick={(el) => setSelectedItem(el)}
                                onCanvasClick={() => setSelectedItem(null)}
                                onDeviceMove={handleDeviceMove}
                                onConnectionPointMove={handleConnectionPointMove}
                             />
                        </div>
                        {isPropertiesPanelOpen && (
                            <div className="w-[350px] border-l bg-card hidden md:flex flex-col">
                                <PropertiesPanel 
                                    onUpdateDevice={handleUpdateDevice}
                                    onRemoveDevice={handleRemoveDevice}
                                    onStartCabling={(id) => setCablingMode({ enabled: true, fromDeviceId: id })}
                                    onViewRack={(rack) => setActiveRack(rack)}
                                    onUpdateArchElement={() => {}}
                                    onRemoveArchElement={() => {}}
                                />
                            </div>
                        )}
                    </main>
                </SidebarInset>
            </SidebarProvider>

            <Sheet open={isMobilePropertiesSheetOpen} onOpenChange={setMobilePropertiesSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Properties</SheetTitle>
                        <SheetDescription>
                            Edit the properties of the selected item.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="h-[calc(100%-4rem)]">
                        <PropertiesPanel
                            onUpdateDevice={handleUpdateDevice}
                            onRemoveDevice={handleRemoveDevice}
                            onStartCabling={(id) => {
                                setCablingMode({ enabled: true, fromDeviceId: id });
                                setMobilePropertiesSheetOpen(false);
                            }}
                            onViewRack={(rack) => setActiveRack(rack)}
                            onUpdateArchElement={() => {}}
                            onRemoveArchElement={() => {}}
                        />
                    </div>
                </SheetContent>
            </Sheet>
            
            <ProjectManager
                isOpen={isProjectManagerOpen}
                onClose={() => setProjectManagerOpen(false)}
                onLoadProject={handleLoadProject}
                currentProjectId={projectState.id}
            />
            {activeRack && (
                <RackElevationView 
                    isOpen={!!activeRack}
                    onClose={() => setActiveRack(null)}
                    rack={activeRack}
                    onUpdateRack={handleUpdateRack}
                />
            )}
             <LogicalTopologyView 
                isOpen={isTopologyViewOpen}
                onClose={() => setIsTopologyViewOpen(false)}
                devices={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.devices))}
                connections={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.connections))}
            />
        </div>
    );
}


export function CCTVPlanner() {
    return (
        <SelectionProvider>
            <CCTVPlannerInner />
        </SelectionProvider>
    )
}
