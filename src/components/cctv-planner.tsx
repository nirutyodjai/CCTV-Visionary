
'use client';

import React, { useReducer, useState, useMemo, useEffect, useCallback } from 'react';
import { createInitialState } from '@/lib/demo-data';
import type { ProjectState, AnyDevice, CablingMode, Point, ArchitecturalElementType, ArchitecturalElement, Floor, Connection, Building, DeviceType, RackContainer, SelectableItem } from '@/lib/types';
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
import { Sun, Moon, Network, Save, Loader2, FolderKanban, ChevronDown, PanelRightClose, PanelRightOpen } from 'lucide-react';
import { createDevice } from '@/lib/device-config';
import { analyzeCctvPlanAction, suggestDevicePlacementsAction, runPlanDiagnosticsAction, listProjectsAction } from '@/app/actions';
import type { DiagnosticResult } from '@/ai/flows/run-plan-diagnostics';
import { LogicalTopologyView } from '@/components/topology/logical-topology-view';
import { RackElevationView } from '@/components/rack/rack-elevation-view';
import { SystemStatusPanel, type SystemCheck } from './sidebar/system-status-panel';
import { Sidebar, SidebarProvider, SidebarContent, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ProjectManager } from './sidebar/project-manager';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PropertiesToggleButton from '@/components/ui/properties-toggle-button';
import SaharaButton from '@/components/sahara-button';


type Action =
    | { type: 'LOAD_PROJECT', payload: ProjectState }
    | { type: 'UPDATE_PROJECT_NAME', payload: string }
    | { type: 'UPDATE_BUILDING_NAME', payload: { buildingId: string, name: string } }
    | { type: 'SET_ACTIVE_FLOOR', payload: { buildingId: string, floorId: string } }
    | { type: 'ADD_DEVICE', payload: { device: AnyDevice, buildingId: string, floorId: string } }
    | { type: 'UPDATE_DEVICE', payload: { device: AnyDevice, buildingId: string, floorId: string } }
    | { type: 'REMOVE_DEVICE', payload: { deviceId: string, buildingId: string, floorId: string } }
    | { type: 'ADD_CONNECTION', payload: { connection: Connection, buildingId: string, floorId: string } }
    | { type: 'SET_FLOOR_PLAN', payload: { url: string, buildingId: string, floorId: string } }
    | { type: 'ADD_ARCH_ELEMENT', payload: { element: ArchitecturalElement, buildingId: string, floorId: string } }
    | { type: 'UPDATE_ARCH_ELEMENT', payload: { element: ArchitecturalElement, buildingId: string, floorId: string } }
    | { type: 'REMOVE_ARCH_ELEMENT', payload: { elementId: string, buildingId: string, floorId: string } }
    | { type: 'SET_DIAGNOSTICS', payload: { diagnostics: DiagnosticResult['diagnostics'], buildingId: string, floorId: string } }
    | { type: 'ADD_FLOOR', payload: { buildingId: string } }
    | { type: 'UPDATE_RACK', payload: { rack: RackContainer, buildingId: string, floorId: string } };


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
        case 'UPDATE_PROJECT_NAME':
            return {
                ...state,
                projectName: action.payload,
            };
        case 'UPDATE_BUILDING_NAME':
            return {
                ...state,
                buildings: state.buildings.map(b => 
                    b.id === action.payload.buildingId 
                        ? { ...b, name: action.payload.name } 
                        : b
                )
            };
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
        case 'UPDATE_ARCH_ELEMENT':
             return {
                ...state,
                buildings: updateFloor(state.buildings, action.payload.buildingId, action.payload.floorId, f => ({
                    ...f, architecturalElements: f.architecturalElements.map(el => el.id === action.payload.element.id ? action.payload.element : el)
                }))
            };
        case 'REMOVE_ARCH_ELEMENT':
            return {
                ...state,
                buildings: updateFloor(state.buildings, action.payload.buildingId, action.payload.floorId, f => ({
                    ...f, architecturalElements: f.architecturalElements.filter(el => el.id !== action.payload.elementId)
                }))
            };
        case 'SET_DIAGNOSTICS':
             return {
                ...state,
                buildings: updateFloor(state.buildings, action.payload.buildingId, action.payload.floorId, f => ({
                    ...f, diagnostics: action.payload.diagnostics
                }))
            };
        case 'ADD_FLOOR': {
            const { buildingId } = action.payload;
            return {
                ...state,
                buildings: state.buildings.map(b => {
                    if (b.id !== buildingId) {
                        return b;
                    }
                    const newFloorNumber = b.floors.length + 1;
                    const newFloor: Floor = {
                        id: `floor_${b.id}_${Date.now()}`,
                        name: `ชั้น ${newFloorNumber}`,
                        floorPlanUrl: null,
                        devices: [],
                        connections: [],
                        architecturalElements: [],
                        diagnostics: [],
                    };
                    return { ...b, floors: [...b.floors, newFloor] };
                })
            };
        }
        default:
            return state;
    }
}


const initialChecks: SystemCheck[] = [
    { id: 'diag', name: 'การวินิจฉัยแบบแปลน', status: 'pending' },
    { id: 'analyze', name: 'การวิเคราะห์ภาพรวม', status: 'pending' },
    { id: 'suggest', name: 'การแนะนำตำแหน่ง', status: 'pending' },
    { id: 'topology', name: 'การสร้างผังเครือข่าย', status: 'pending' },
    { id: 'report', name: 'การสร้างรายงาน', status: 'pending' },
];


export function CCTVPlanner() {
    const [projectState, dispatch] = useReducer(projectReducer, {
        id: 'loading',
        projectName: 'Loading...',
        buildings: [],
        vlans: [],
        subnets: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [activeIds, setActiveIds] = useState<{ buildingId: string | null; floorId: string | null }>({ buildingId: null, floorId: null });
    const { toast } = useToast();
    const { theme, setTheme } = useTheme();
    const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);
    const [cablingMode, setCablingMode] = useState<CablingMode>({ enabled: false, fromDeviceId: null });
    const [selectedArchTool, setSelectedArchTool] = useState<ArchitecturalElementType | null>(null);
    const [drawingState, setDrawingState] = useState<{ isDrawing: boolean, startPoint: Point | null }>({ isDrawing: false, startPoint: null });
    const [floorPlanRect, setFloorPlanRect] = useState<DOMRect | null>(null);
    const [isTopologyViewOpen, setTopologyViewOpen] = useState(false);
    const [isProjectManagerOpen, setProjectManagerOpen] = useState(false);
    const [isRackViewOpen, setRackViewOpen] = useState(false);
    const [isPropertiesPanelOpen, setPropertiesPanelOpen] = useState(true);
    const isMobile = useIsMobile();
    
    // AI states
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [projectList, setProjectList] = useState<Pick<ProjectState, 'id' | 'projectName'>[]>([]);


    // System Status states
    const [systemStatuses, setSystemStatuses] = useState<SystemCheck[]>(initialChecks);
    const [isCheckingSystem, setIsCheckingSystem] = useState(false);

    useEffect(() => {
        // Defer state initialization to the client to prevent hydration mismatch
        if (projectState.id === 'loading') {
            dispatch({ type: 'LOAD_PROJECT', payload: createInitialState() });
            setIsLoading(false);
        }
    }, [projectState.id]);

    const fetchProjectList = useCallback(async () => {
        const result = await listProjectsAction();
        if (result.success) {
            setProjectList(result.data);
        } else {
            toast({
                title: 'Could not fetch project list',
                description: result.error,
                variant: 'destructive',
            });
        }
    }, [toast]);

    useEffect(() => {
        fetchProjectList();
    }, [fetchProjectList]);


    useEffect(() => {
        if (!isLoading && projectState.id !== 'loading' && !activeIds.buildingId && projectState.buildings.length > 0) {
            const firstBuilding = projectState.buildings[0];
            if (firstBuilding && firstBuilding.floors.length > 0) {
                const firstFloor = firstBuilding.floors[0];
                setActiveIds({ buildingId: firstBuilding.id, floorId: firstFloor.id });
            }
        }
    }, [isLoading, projectState, activeIds.buildingId]);

    const activeBuilding = useMemo(() => projectState.buildings.find(b => b.id === activeIds.buildingId), [projectState.buildings, activeIds.buildingId]);
    const activeFloor = useMemo(() => activeBuilding?.floors.find(f => f.id === activeIds.floorId), [activeBuilding, activeIds.floorId]);

    const handleFloorSelect = (buildingId: string, floorId: string) => {
        setFloorPlanRect(null); // Reset canvas rect when floor changes
        setActiveIds({ buildingId, floorId });
        setSelectedItem(null);
    };

    const handleAddDevice = (type: DeviceType) => {
        if (!activeFloor || !activeIds.buildingId || !activeIds.floorId) {
            toast({ title: "ไม่สามารถเพิ่มอุปกรณ์ได้", description: "กรุณาเลือกชั้นก่อน", variant: "destructive" });
            return;
        }
        
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

    const handleUpdateArchElement = useCallback((element: ArchitecturalElement) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'UPDATE_ARCH_ELEMENT', payload: { element, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
    }, [activeIds.buildingId, activeIds.floorId]);


    const handleRemoveDevice = (deviceId: string) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'REMOVE_DEVICE', payload: { deviceId, buildingId: activeIds.buildingId, floorId: activeIds.floorId }});
        setSelectedItem(null);
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
    
    const handleRemoveArchElement = (elementId: string) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'REMOVE_ARCH_ELEMENT', payload: { elementId, buildingId: activeIds.buildingId, floorId: activeIds.floorId }});
        setSelectedItem(null);
        toast({ title: "ลบส่วนประกอบแล้ว", variant: "destructive" });
    };

    const handleAddFloor = (buildingId: string) => {
        dispatch({
            type: 'ADD_FLOOR',
            payload: { buildingId }
        });
        toast({ title: 'เพิ่มชั้นใหม่แล้ว' });
    };

    const handleUpdateBuildingName = (buildingId: string, name: string) => {
        dispatch({
            type: 'UPDATE_BUILDING_NAME',
            payload: { buildingId, name }
        });
        toast({ title: 'อัปเดตชื่ออาคารแล้ว' });
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
            const currentDevices = activeFloor?.devices || [];
            result.data.forEach(suggestion => {
                const newDevice = createDevice(suggestion.type, suggestion.x, suggestion.y, currentDevices);
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

    const handleRunAllChecks = async () => {
        if (!activeFloor) {
            toast({ title: "No Active Floor", description: "Please select a floor to run checks.", variant: "destructive" });
            return;
        }
        setIsCheckingSystem(true);

        const updateStatus = (id: string, status: SystemCheck['status'], message?: string) => {
            setSystemStatuses(prev => prev.map(c => c.id === id ? { ...c, status, message } : c));
        };

        // Reset all to running
        setSystemStatuses(prev => prev.map(c => ({...c, status: 'running', message: undefined })));

        // --- Run checks sequentially ---
        
        // 1. Diagnostics Check
        try {
            const planData = {
                devices: activeFloor.devices.map(d => ({ id: d.id, label: d.label, type: d.type, channels: d.channels, ports: d.ports })),
                connections: activeFloor.connections.map(c => ({ fromDeviceId: c.fromDeviceId, toDeviceId: c.toDeviceId })),
            };
            const result = await runPlanDiagnosticsAction(planData);
            if (result.success) {
                 dispatch({ type: 'SET_DIAGNOSTICS', payload: { diagnostics: result.data.diagnostics, buildingId: activeIds.buildingId!, floorId: activeIds.floorId! } });
                 const errors = result.data.diagnostics.filter(d => d.severity === 'error').length;
                 const warnings = result.data.diagnostics.filter(d => d.severity === 'warning').length;
                 updateStatus('diag', 'success', `พบ ${errors} ข้อผิดพลาด, ${warnings} คำเตือน`);
            } else {
                updateStatus('diag', 'error', result.error);
            }
        } catch (e: any) {
            updateStatus('diag', 'error', e.message);
        }

        // 2. Plan Analysis Check
        try {
            const deviceSummary = activeFloor.devices.map(d => d.label).join(', ');
            const result = await analyzeCctvPlanAction({ deviceSummary, totalFloors: 1 });
             if (result.success) {
                updateStatus('analyze', 'success', result.data.analysis);
            } else {
                updateStatus('analyze', 'error', result.error);
            }
        } catch (e: any) {
            updateStatus('analyze', 'error', e.message);
        }
        
        // --- Mock other checks for now ---
        updateStatus('suggest', 'success', 'สามารถแนะนำตำแหน่งได้');
        updateStatus('topology', 'success', 'สามารถสร้าง Topology ได้');
        updateStatus('report', 'success', 'สามารถสร้างรายงานได้');


        setIsCheckingSystem(false);
    };

    const handleSaveProject = async () => {
        setIsSaving(true);
        const projectToSave = JSON.parse(JSON.stringify(projectState));
        try {
            await setDoc(doc(db, "projects", projectToSave.id), projectToSave);
            toast({
                title: "บันทึกโครงการสำเร็จ",
                description: `โครงการ "${projectToSave.projectName}" (ID: ${projectToSave.id}) ถูกบันทึกแล้ว`,
            });
            fetchProjectList();
        } catch (error: any) {
            console.error("Error saving project:", error);
            toast({
                title: "เกิดข้อผิดพลาดในการบันทึก",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoadProject = useCallback(async (projectId: string) => {
        if (!projectId) return;

        setIsLoading(true);
        try {
            const docRef = doc(db, "projects", projectId.trim());
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const loadedProject = docSnap.data() as ProjectState;
                dispatch({ type: 'LOAD_PROJECT', payload: loadedProject });
                
                const firstBuilding = loadedProject.buildings?.[0];
                const firstFloor = firstBuilding?.floors?.[0];

                if (firstBuilding && firstFloor) {
                    setActiveIds({ buildingId: firstBuilding.id, floorId: firstFloor.id });
                } else {
                    setActiveIds({ buildingId: null, floorId: null });
                }

                setSelectedItem(null);
                setFloorPlanRect(null); // Reset canvas rect
                toast({
                    title: "โหลดโครงการสำเร็จ",
                    description: `โครงการ "${loadedProject.projectName}" ถูกโหลดแล้ว`,
                });
            } else {
                toast({
                    title: "ไม่พบโครงการ",
                    description: `ไม่พบโครงการที่มี ID: ${projectId}`,
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            console.error("Error loading project:", error);
            toast({
                title: "เกิดข้อผิดพลาดในการโหลด",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const handleSelectItem = (item: SelectableItem | null) => {
        setSelectedItem(item);
        if (!item || ('x' in item && 'y' in item)) { // It is a device
            setCablingMode({ enabled: false, fromDeviceId: null });
            if (!isMobile && item?.type.startsWith('rack')) {
                setRackViewOpen(true);
            }
        }
    };

    if (isLoading && projectState.id === 'loading') {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }

    const propertiesPanel = (
         <PropertiesPanel 
            selectedItem={selectedItem}
            onUpdateDevice={handleUpdateDevice}
            onRemoveDevice={handleRemoveDevice}
            onStartCabling={(deviceId) => setCablingMode({ enabled: true, fromDeviceId: deviceId })}
            onViewRack={() => setRackViewOpen(true)}
            onRemoveArchElement={handleRemoveArchElement}
            onUpdateArchElement={handleUpdateArchElement}
        />
    );

    return (
        <SidebarProvider>
            <div className="w-full h-screen flex bg-background text-foreground dark:text-white">
                <Sidebar className="flex flex-col border-r border-border bg-card text-card-foreground shadow-lg">
                    <SidebarContent className="p-0 flex flex-col">
                         <div className="p-4 border-b border-border flex justify-center items-center flex-shrink-0">
                            <h1 className="text-xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">CCTV Visionary</h1>
                        </div>
                        <div className="p-2 space-y-4 overflow-y-auto flex-1">
                             <Card>
                                <CardHeader className="p-3 border-b">
                                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <FolderKanban className="w-4 h-4"/>
                                        การจัดการโครงการ
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3 space-y-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="project-name" className="text-xs">ชื่อโครงการ</Label>
                                        <Input 
                                            id="project-name"
                                            value={projectState.projectName}
                                            onChange={(e) => dispatch({ type: 'UPDATE_PROJECT_NAME', payload: e.target.value })}
                                            className="h-9"
                                        />
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" className="w-full justify-between">
                                                <span>สลับโครงการ</span>
                                                <ChevronDown className="h-4 w-4 opacity-50" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-[250px]">
                                            <DropdownMenuLabel>โครงการที่บันทึกไว้</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            {projectList.map((p) => (
                                                <DropdownMenuItem
                                                    key={p.id}
                                                    disabled={p.id === projectState.id || isLoading}
                                                    onSelect={() => handleLoadProject(p.id)}
                                                >
                                                    {p.projectName}
                                                </DropdownMenuItem>
                                            ))}
                                             <DropdownMenuSeparator />
                                             <DropdownMenuItem onSelect={() => setProjectManagerOpen(true)}>
                                                <FolderKanban className="mr-2 h-4 w-4" />
                                                <span>จัดการโครงการทั้งหมด</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    <SaharaButton onClick={handleSaveProject} disabled={isSaving || isLoading}>
                                        {isSaving ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-5 w-5 transition-transform duration-500 group-hover:rotate-12" />
                                                <span className="transition-all duration-300 group-hover:tracking-wider">บันทึกโครงการ</span>
                                            </>
                                        )}
                                    </SaharaButton>
                                </CardContent>
                            </Card>
                            
                            <ProjectNavigator 
                                buildings={projectState.buildings}
                                activeBuildingId={activeIds.buildingId}
                                activeFloorId={activeIds.floorId}
                                onFloorSelect={handleFloorSelect}
                                onAddFloor={handleAddFloor}
                                onUpdateBuildingName={handleUpdateBuildingName}
                            />
                            
                            <DevicesToolbar onSelectDevice={handleAddDevice} />
                            <ArchitectureToolbar selectedTool={selectedArchTool} onSelectTool={setSelectedArchTool} />
                            
                            <FloorPlanUpload onSetFloorPlan={handleSetFloorPlan} />

                             <Card>
                                <CardHeader className="p-3 border-b">
                                     <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                        <Network className="w-4 h-4" />
                                        มุมมองและรายงาน
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-3">
                                    <Button variant="outline" className="w-full" onClick={() => setTopologyViewOpen(true)}><Network /> ดูผังเครือข่าย</Button>
                                </CardContent>
                            </Card>
                            
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
                            <SystemStatusPanel
                                statuses={systemStatuses}
                                onRunChecks={handleRunAllChecks}
                                isLoading={isCheckingSystem}
                            />
                            <BillOfMaterials project={projectState} />
                        </div>
                    </SidebarContent>
                </Sidebar>
                
                <div className="flex-1 flex min-w-0">
                    <SidebarInset className="flex-1 flex flex-col">
                        <div className="h-16 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
                            <div className="flex items-center gap-2 min-w-0">
                                <SidebarTrigger className="md:hidden" />
                                 <h2 className="text-lg font-semibold hidden md:block truncate">
                                    {activeFloor ? `${activeBuilding?.name} - ${activeFloor?.name}` : "กรุณาเลือกแบบแปลน"}
                                </h2>
                            </div>
                            <PropertiesToggleButton 
                                isOpen={isPropertiesPanelOpen}
                                onClick={() => setPropertiesPanelOpen(!isPropertiesPanelOpen)}
                            />
                        </div>

                        <div className="flex-1 w-full h-full relative">
                            {activeFloor ? (
                                <PlannerCanvas
                                    floor={activeFloor}
                                    selectedItem={selectedItem}
                                    onSelectItem={handleSelectItem}
                                    onUpdateDevice={handleUpdateDevice}
                                    onCanvasClick={() => handleSelectItem(null)}
                                    cablingMode={cablingMode}
                                    onSetCablingMode={setCablingMode}
                                    onAddConnection={handleAddConnection}
                                    selectedArchTool={selectedArchTool}
                                    drawingState={drawingState}
                                    onSetDrawingState={setDrawingState}
                                    onAddArchElement={handleAddArchElement}
                                    onUpdateArchElement={handleUpdateArchElement}
                                    floorPlanRect={floorPlanRect}
                                    onUpdateFloorPlanRect={handleUpdateFloorPlanRect}
                                />
                            ) : (
                                <div className="flex-1 w-full h-full flex items-center justify-center bg-muted/20">
                                    <p className="text-muted-foreground text-center px-4">
                                        กรุณาเลือกอาคารและชั้นจากเมนูด้านซ้ายเพื่อเริ่มต้น
                                    </p>
                                </div>
                            )}
                        </div>
                    </SidebarInset>
                    {!isMobile && isPropertiesPanelOpen && (
                        <aside className="w-96 h-full flex flex-col flex-shrink-0 bg-[#e0e0e0] shadow-[20px_20px_60px_#bebebe,_-20px_-20px_60px_#ffffff] dark:bg-[#2a2a2a] dark:shadow-[20px_20px_60px_#1f1f1f,_-20px_-20px_60px_#353535]">
                            {propertiesPanel}
                        </aside>
                    )}
                </div>
            </div>

            {isMobile && (
                 <Sheet open={!!selectedItem} onOpenChange={(isOpen) => !isOpen && setSelectedItem(null)}>
                    <SheetContent className="w-[85vw] p-0 border-l">
                         <SheetHeader className="p-4 border-b">
                            <SheetTitle>Item Properties</SheetTitle>
                         </SheetHeader>
                        {propertiesPanel}
                    </SheetContent>
                </Sheet>
            )}

            <LogicalTopologyView
                devices={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.devices))}
                connections={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.connections))}
                isOpen={isTopologyViewOpen}
                onClose={() => setTopologyViewOpen(false)}
            />

            <RackElevationView
                rack={selectedItem?.type.startsWith('rack') ? selectedItem as RackContainer : null}
                isOpen={isRackViewOpen}
                onClose={() => setRackViewOpen(false)}
                onUpdateRack={handleUpdateRack}
             />

            <ProjectManager
                isOpen={isProjectManagerOpen}
                onClose={() => {
                    setProjectManagerOpen(false);
                    fetchProjectList();
                }}
                onLoadProject={handleLoadProject}
                currentProjectId={projectState.id}
            />
        </SidebarProvider>
    );
}
