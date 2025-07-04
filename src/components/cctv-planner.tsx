
'use client';

import React, { useReducer, useState, useMemo, useEffect } from 'react';
import { generateDemoProject } from '@/lib/demo-data';
import type { ProjectState, AnyDevice, CablingMode, Point, ArchitecturalElementType, ArchitecturalElement, Floor, Connection, Building, DeviceType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { PlannerCanvas } from '@/components/canvas/planner-canvas';
import { ProjectNavigator } from './sidebar/project-navigator';
import { PropertiesPanel } from './sidebar/properties-panel';
import { DevicesToolbar } from './sidebar/devices-toolbar';
import { BillOfMaterials } from './sidebar/bill-of-materials';
import { FloorPlanUpload } from './sidebar/floor-plan-upload';
import { useToast } from '@/hooks/use-toast';
import { Sun, Moon } from 'lucide-react';
import { createDevice } from '@/lib/device-config';

type Action =
    | { type: 'LOAD_PROJECT', payload: ProjectState }
    | { type: 'SET_ACTIVE_FLOOR', payload: { buildingId: string, floorId: string } }
    | { type: 'ADD_DEVICE', payload: { device: AnyDevice, buildingId: string, floorId: string } }
    | { type: 'UPDATE_DEVICE', payload: { device: AnyDevice, buildingId: string, floorId: string } }
    | { type: 'REMOVE_DEVICE', payload: { deviceId: string, buildingId: string, floorId: string } }
    | { type: 'ADD_CONNECTION', payload: { connection: Connection, buildingId: string, floorId: string } }
    | { type: 'SET_FLOOR_PLAN', payload: { url: string, buildingId: string, floorId: string } };

const initialState: ProjectState = {
    projectName: 'New CCTV Plan',
    buildings: [],
    vlans: [],
    subnets: [],
};

function projectReducer(state: ProjectState, action: Action): ProjectState {
    switch (action.type) {
        case 'LOAD_PROJECT':
            return action.payload;
        case 'SET_ACTIVE_FLOOR':
            return state;
        case 'ADD_DEVICE':
             return {
                ...state,
                buildings: state.buildings.map(b => b.id === action.payload.buildingId ? {
                    ...b,
                    floors: b.floors.map(f => f.id === action.payload.floorId ? {
                        ...f,
                        devices: [...f.devices, action.payload.device]
                    } : f)
                } : b)
            };
        case 'UPDATE_DEVICE':
            return {
                ...state,
                buildings: state.buildings.map(b => b.id === action.payload.buildingId ? {
                    ...b,
                    floors: b.floors.map(f => f.id === action.payload.floorId ? {
                        ...f,
                        devices: f.devices.map(d => d.id === action.payload.device.id ? action.payload.device : d)
                    } : f)
                } : b)
            };
        case 'REMOVE_DEVICE':
            return {
                ...state,
                buildings: state.buildings.map(b => b.id === action.payload.buildingId ? {
                    ...b,
                    floors: b.floors.map(f => f.id === action.payload.floorId ? {
                        ...f,
                        devices: f.devices.filter(d => d.id !== action.payload.deviceId),
                        connections: f.connections.filter(c => c.fromDeviceId !== action.payload.deviceId && c.toDeviceId !== action.payload.deviceId)
                    } : f)
                } : b)
            };
        case 'ADD_CONNECTION':
             return {
                ...state,
                buildings: state.buildings.map(b => b.id === action.payload.buildingId ? {
                    ...b,
                    floors: b.floors.map(f => f.id === action.payload.floorId ? {
                        ...f,
                        connections: [...f.connections, action.payload.connection]
                    } : f)
                } : b)
            };
        case 'SET_FLOOR_PLAN':
             return {
                ...state,
                buildings: state.buildings.map(b => b.id === action.payload.buildingId ? {
                    ...b,
                    floors: b.floors.map(f => f.id === action.payload.floorId ? {
                        ...f,
                        floorPlanUrl: action.payload.url
                    } : f)
                } : b)
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
    
    const handleFloorSelect = (buildingId: string, floorId: string) => {
        setActiveIds({ buildingId, floorId });
        setSelectedDevice(null);
    };

    const handleAddDevice = (type: DeviceType) => {
        if (!activeFloor || !activeIds.buildingId || !activeIds.floorId) {
            toast({
                title: "ไม่สามารถเพิ่มอุปกรณ์ได้",
                description: "กรุณาเลือกชั้นก่อน",
                variant: "destructive",
            });
            return;
        }
        const newDevice = createDevice(type, 0.5, 0.5, activeFloor.devices);
        dispatch({
            type: 'ADD_DEVICE',
            payload: { device: newDevice, buildingId: activeIds.buildingId, floorId: activeIds.floorId }
        });
        toast({
            title: "เพิ่มอุปกรณ์แล้ว",
            description: `เพิ่ม ${newDevice.label} ลงในแผนผัง`,
        });
    };
    
    const handleSetFloorPlan = (file: File) => {
        if (!activeIds.buildingId || !activeIds.floorId) {
             toast({
                title: "ไม่สามารถอัปโหลดได้",
                description: "กรุณาเลือกชั้นก่อนตั้งค่าแผนผัง",
                variant: "destructive",
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
                dispatch({
                    type: 'SET_FLOOR_PLAN',
                    payload: {
                        url: e.target.result,
                        buildingId: activeIds.buildingId as string,
                        floorId: activeIds.floorId as string,
                    }
                });
                toast({
                    title: "อัปโหลดแผนผังสำเร็จ",
                    description: `แผนผังสำหรับ ${activeFloor?.name} ได้รับการอัปเดตแล้ว`,
                });
            }
        };
        reader.readAsDataURL(file);
    };

    const handleUpdateDevice = (device: AnyDevice) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'UPDATE_DEVICE', payload: { device, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
    };

    const handleRemoveDevice = (deviceId: string) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;

        dispatch({
            type: 'REMOVE_DEVICE',
            payload: { deviceId, buildingId: activeIds.buildingId, floorId: activeIds.floorId }
        });
        
        setSelectedDevice(null);

        toast({
            title: "ลบอุปกรณ์แล้ว",
            description: `อุปกรณ์ถูกนำออกจากแผนผังเรียบร้อยแล้ว`,
            variant: "destructive"
        });
    }

    const handleAddConnection = (connection: Connection) => {
        if (!activeIds.buildingId || !activeIds.floorId) return;
        dispatch({ type: 'ADD_CONNECTION', payload: { connection, buildingId: activeIds.buildingId, floorId: activeIds.floorId } });
        toast({ title: "สร้างการเชื่อมต่อแล้ว", description: `เชื่อมต่ออุปกรณ์เรียบร้อย` });
    };
    
    const handleAddArchElement = (elem: ArchitecturalElement) => {};
    const handleUpdateFloorPlanRect = (rect: any) => {};


    return (
        <div className="w-full h-screen flex bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-96 h-full flex flex-col border-r border-sidebar-border bg-card shadow-lg">
                <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">CCTV Visionary</h1>
                        <p className="text-muted-foreground text-sm">{projectState.projectName}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <ProjectNavigator 
                        buildings={projectState.buildings}
                        activeFloorId={activeIds.floorId}
                        onFloorSelect={handleFloorSelect}
                    />
                    <FloorPlanUpload 
                        onSetFloorPlan={handleSetFloorPlan}
                        currentFloorPlanUrl={activeFloor?.floorPlanUrl || null}
                    />
                     <BillOfMaterials project={projectState} />
                </div>
            </aside>
            
            {/* Main Content */}
            <main className="flex-1 w-full h-full flex flex-col">
                 <div className="h-16 border-b border-border flex items-center px-4">
                    <DevicesToolbar onSelectDevice={handleAddDevice} />
                </div>

                <div className="flex-1 w-full h-full relative">
                    {projectState.buildings.length === 0 ? (
                        <div className="flex-1 w-full h-full flex items-center justify-center bg-muted/20">
                            <div className="text-center space-y-4">
                                <h2 className="text-2xl font-bold">Welcome to CCTV Visionary</h2>
                                <p className="text-muted-foreground">
                                    Loading demo project...
                                </p>
                            </div>
                        </div>
                    ) : activeFloor ? (
                        <PlannerCanvas
                            floor={activeFloor}
                            selectedDevice={selectedDevice}
                            onSelectDevice={setSelectedDevice}
                            onUpdateDevice={handleUpdateDevice}
                            onCanvasClick={() => setSelectedDevice(null)}
                            cablingMode={cablingMode}
                            onSetCablingMode={setCablingMode}
                            onAddConnection={handleAddConnection}
                            selectedArchTool={selectedArchTool}
                            drawingState={drawingState}
                            onSetDrawingState={setDrawingState}
                            onAddArchElement={handleAddArchElement}
                            onUpdateFloorPlanRect={handleUpdateFloorPlanRect}
                        />
                    ) : (
                        <div className="flex-1 w-full h-full flex items-center justify-center bg-muted/20">
                            <div className="text-center">
                                <p className="text-muted-foreground">Please select a building and floor to begin.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Right Sidebar */}
            <aside className="w-96 h-full flex flex-col border-l border-sidebar-border bg-card shadow-lg">
                <PropertiesPanel 
                    selectedDevice={selectedDevice}
                    onUpdateDevice={handleUpdateDevice}
                    onRemoveDevice={handleRemoveDevice}
                />
            </aside>
        </div>
    );
}
