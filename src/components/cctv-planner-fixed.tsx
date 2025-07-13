'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef, useReducer } from 'react';
import { produce } from 'immer';
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

// ===== MISSING IMPORTS =====
import { useToast } from '@/hooks/use-toast';
import { useSelection } from '@/contexts/SelectionContext';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Button } from '@/components/ui/button';
import { StateHistoryManager } from '@/lib/state-history';
// Commenting out imports that don't exist in the utils file
// import { ShortcutEventHandler } from '@/lib/utils';
// import { ErrorHandler } from '@/lib/utils';
// import { PerformanceMonitor } from '@/lib/utils';
import { createInitialState } from '@/lib/demo-data';
import { createDevice } from '@/lib/device-config';
import { saveProjectAction, loadProjectAction, runPlanDiagnosticsAction, findCablePathAction } from '@/app/actions';

// ===== TYPE IMPORTS =====
import type { 
  ProjectState, 
  Building, 
  Floor, 
  AnyDevice, 
  Connection, 
  CableType, 
  DeviceType, 
  CablingMode,
  ArchitecturalElement,
  ArchitecturalElementType,
  RackContainer
} from '@/lib/types';

// Define CalibrationData interface as it's not exported from types
interface CalibrationData {
  id?: string;
  width?: number;
  height?: number;
  pixelsPerMeter?: number;
  calibrationPoints?: {x: number, y: number, realX: number, realY: number}[];
}

// ===== COMPONENT IMPORTS =====
import { ProjectManager } from '@/components/sidebar/project-manager';
import { DevicesToolbar } from '@/components/sidebar/devices-toolbar';
// Comment out missing components
// import { PlanCanvas } from '@/components/canvas/plan-canvas';
// import { PropertiesSheet } from '@/components/sidebar/properties-sheet';
import { LogicalTopologyView } from '@/components/topology/logical-topology-view';
// import { View3D } from '@/components/simulation/view-3d';
// import { RackView } from '@/components/rack/rack-view';
import { ExportDialog, type ExportDialogRef } from '@/components/ui/export-dialog';
import { ThermalCameraCalibration } from '@/components/thermal-camera-calibration';

// ===== MISSING TOAST HANDLERS =====
const handleSuccess = (title: string, description?: string) => {
  const { toast } = useToast();
  toast({ title, description });
};

const handleWarning = (title: string, description?: string) => {
  const { toast } = useToast();
  toast({ title, description, variant: 'destructive' });
};

const handleInfo = (title: string, description?: string) => {
  const { toast } = useToast();
  toast({ title, description });
};

function CCTVPlannerInner() {
    const [projectState, setProjectState] = useState<ProjectState>(createInitialState());
    const [activeBuildingId, setActiveBuildingId] = useState<string | null>(projectState.buildings[0]?.id || null);
    const [activeFloorId, setActiveFloorId] = useState<string | null>(projectState.buildings[0]?.floors[0]?.id || null);
    
    const [cablingMode, setCablingMode] = useState<CablingMode>({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
    const [drawingTool, setDrawingTool] = useState<ArchitecturalElementType | null>(null);
    const [isPropertiesSheetOpen, setPropertiesSheetOpen] = useState(false);
    
    // UI states
    const [isProjectManagerOpen, setProjectManagerOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isTopologyViewOpen, setIsTopologyViewOpen] = useState(false);
    const [is3DViewOpen, setIs3DViewOpen] = useState(false);
    const [activeRack, setActiveRack] = useState<RackContainer | null>(null);
    const { toast } = useToast();

    // AI states
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isFindingPaths, setIsFindingPaths] = useState(false);
    const [isOptimizingCoverage, setIsOptimizingCoverage] = useState(false);
    const [isDiagnosticsLoading, setDiagnosticsLoading] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    
    // Undo/Redo system
    const [historyManager] = useState(() => new StateHistoryManager());
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    
    // Mobile detection
    const { isMobile, isTablet, touchSupport } = useMobileDetection();
    const [activeTab, setActiveTab] = useState('tools');
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    
    // Export Dialog
    const exportDialogRef = useRef<ExportDialogRef>(null);
    
    const { selectedItem, setSelectedItem } = useSelection();
    
    // Calibration state
    const [currentCalibration, setCurrentCalibration] = useState<CalibrationData>();
    const [showCalibrationDialog, setShowCalibrationDialog] = useState(false);

    // Initialize keyboard shortcuts
    // Define a type for shortcuts since ShortcutEventHandler isn't available
    type Shortcut = {
        key: string;
        ctrlKey?: boolean;
        shiftKey?: boolean;
        action: () => void;
        description: string;
    };
    
    const defaultShortcuts: Shortcut[] = []; // Add your default shortcuts here
    const exportShortcut: Shortcut = {
        key: 'e',
        ctrlKey: true,
        shiftKey: true,
        action: () => exportDialogRef.current?.open(),
        description: 'Export project'
    };
    
    useKeyboardShortcuts([...defaultShortcuts, exportShortcut]);

    // Initialize history with initial state
    useEffect(() => {
        historyManager.pushState(projectState, 'Initial state', 'add');
        updateHistoryState();
        
        // แสดงคำแนะนำคุณสมบัติการส่งออก
        setTimeout(() => {
            toast({
                title: "คุณสมบัติการส่งออกใหม่พร้อมใช้งาน!",
                description: "ส่งออกโครงการของคุณเป็น PDF, Excel, CAD และอื่นๆ กด Ctrl+Shift+E หรือใช้ปุ่มส่งออก",
                duration: 5000,
            });
        }, 3000);
    }, []);

    // Update history state indicators
    const updateHistoryState = () => {
        setCanUndo(historyManager.canUndo());
        setCanRedo(historyManager.canRedo());
    };

    // Enhanced state update function with history tracking
    const updateProjectState = (newState: ProjectState, description: string, action: 'add' | 'remove' | 'update' | 'move' | 'connect' | 'disconnect', metadata?: any) => {
        setProjectState(newState);
        historyManager.pushState(newState, description, action, metadata);
        updateHistoryState();
    };

    // Helper functions for keyboard shortcuts
    const handleDeleteSelectedItem = () => {
        if (selectedItem) {
            handleRemoveDevice(selectedItem.id);
        }
    };

    const handleCancelAction = () => {
        setCablingMode({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
        setDrawingTool(null);
        setSelectedItem(null);
    };

    const handleUndo = useCallback(() => {
        const previousState = historyManager.undo();
        if (previousState) {
            setProjectState(previousState);
            setSelectedItem(null); // Clear selection on undo
            updateHistoryState();
            
            const description = historyManager.getLastUndoDescription();
            toast({ 
                title: '↶ Undo', 
                description: description || 'Reverted last change',
                duration: 2000
            });
        }
    }, [historyManager, setSelectedItem, toast]);

    const handleRedo = useCallback(() => {
        const nextState = historyManager.redo();
        if (nextState) {
            setProjectState(nextState);
            setSelectedItem(null); // Clear selection on redo
            updateHistoryState();
            
            const description = historyManager.getLastRedoDescription();
            toast({ 
                title: '↷ Redo', 
                description: description || 'Restored next change',
                duration: 2000
            });
        }
    }, [historyManager, setSelectedItem, toast]);

    // Setup keyboard shortcut event handlers
    useEffect(() => {
        // Comment out ShortcutEventHandler as it's not available
        /*
        const unsubscribers = [
            ShortcutEventHandler.on('save-project', handleSaveProject),
            ShortcutEventHandler.on('delete-selected', handleDeleteSelectedItem),
            ShortcutEventHandler.on('cancel-action', handleCancelAction),
            ShortcutEventHandler.on('undo', handleUndo),
            ShortcutEventHandler.on('redo', handleRedo),
        ];
        */

        // Add additional keyboard shortcuts for history management
        const handleKeydown = (e: KeyboardEvent) => {
            // Alt+H to show history panel
            if (e.altKey && e.key === 'h') {
                e.preventDefault();
                setActiveTab('history');
            }
        };

        window.addEventListener('keydown', handleKeydown);
        
        return () => {
            // unsubscribers.forEach(unsub => unsub()); // Commented out as ShortcutEventHandler isn't available
            window.removeEventListener('keydown', handleKeydown);
        };
    }, []);

    // Setup touch gestures for mobile undo/redo
    useEffect(() => {
        if (!isMobile || !touchSupport) return;

        let startX = 0;
        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length === 3) {
                startX = e.touches[0].clientX;
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            // Three-finger swipe for undo/redo
            if (e.changedTouches.length === 1 && startX !== 0) {
                const endX = e.changedTouches[0].clientX;
                const deltaX = endX - startX;
                
                if (Math.abs(deltaX) > 50) {
                    if (deltaX > 0 && canRedo) {
                        handleRedo();
                    } else if (deltaX < 0 && canUndo) {
                        handleUndo();
                    }
                }
                startX = 0; // Reset startX
            }
        };

        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });
        
        return () => {
            document.removeEventListener('touchstart', handleTouchStart);
            document.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isMobile, touchSupport, canUndo, canRedo, handleUndo, handleRedo]);
    
    const getActiveFloor = useCallback((): Floor | undefined => {
        const building = projectState.buildings.find(b => b.id === activeBuildingId);
        return building?.floors.find(f => f.id === activeFloorId);
    }, [projectState, activeBuildingId, activeFloorId]);

    const updateFloorData = (floorId: string, updates: Partial<Floor>, description: string, action: 'add' | 'remove' | 'update' | 'move' | 'connect' | 'disconnect', metadata?: any) => {
        const newState = produce(projectState, draft => {
            for (const building of draft.buildings) {
                const floorIndex = building.floors.findIndex(f => f.id === floorId);
                if (floorIndex !== -1) {
                    building.floors[floorIndex] = { ...building.floors[floorIndex], ...updates };
                    break;
                }
            }
        });
        updateProjectState(newState, description, action, metadata);
    };

    const handleStartCabling = (deviceId: string, cableType: CableType) => {
        setCablingMode({ enabled: true, fromDeviceId: deviceId, cableType: cableType });
        setPropertiesSheetOpen(false); // Close sheet to start cabling on canvas
        toast({ title: 'เริ่มโหมดการเชื่อมต่อสายแล้ว', description: `เลือกอุปกรณ์อื่นเพื่อเชื่อมต่อด้วย ${cableType}`});
    };

    const handleAddDevice = (type: DeviceType) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;
        const newDevice = createDevice(type, 0.5, 0.5, activeFloor.devices);
        const updatedDevices = [...activeFloor.devices, newDevice];
        updateFloorData(
            activeFloor.id, 
            { devices: updatedDevices },
            `Added ${type} device`,
            'add',
            { deviceType: type, deviceId: newDevice.id }
        );
        setSelectedItem(newDevice);
        setPropertiesSheetOpen(true);
    };

    const handleUpdateDevice = (updatedDevice: AnyDevice) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;
        const updatedDevices = activeFloor.devices.map(d => d.id === updatedDevice.id ? updatedDevice : d);
        updateFloorData(
            activeFloor.id,
            { devices: updatedDevices },
            `Updated ${updatedDevice.type} device`,
            'update',
            { deviceType: updatedDevice.type, deviceId: updatedDevice.id }
        );
        setSelectedItem(updatedDevice);
    };

    const handleRemoveDevice = (deviceId: string) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;

        const deviceToRemove = activeFloor.devices.find(d => d.id === deviceId);
        const updatedDevices = activeFloor.devices.filter(d => d.id !== deviceId);
        const updatedConnections = activeFloor.connections.filter(c => c.fromDeviceId !== deviceId && c.toDeviceId !== deviceId);
        
        updateFloorData(
            activeFloor.id,
            { devices: updatedDevices, connections: updatedConnections },
            `Removed ${deviceToRemove?.type || 'device'}`,
            'remove',
            { deviceType: deviceToRemove?.type, deviceId: deviceId }
        );
        setSelectedItem(null);
        setPropertiesSheetOpen(false);
    };

    const handleFloorSelect = (buildingId: string, floorId: string) => {
        setActiveBuildingId(buildingId);
        setActiveFloorId(floorId);
        setSelectedItem(null);
    };

    const handleDeviceClick = (device: AnyDevice) => {
        if (cablingMode.enabled && cablingMode.fromDeviceId) {
            if (cablingMode.fromDeviceId === device.id) {
                setCablingMode({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
                setSelectedItem(device);
            } else {
                handleCreateConnection(cablingMode.fromDeviceId, device.id);
            }
        } else {
            setSelectedItem(device);
            setPropertiesSheetOpen(true);
        }
    };
    
    const handleCreateConnection = (fromDeviceId: string, toDeviceId: string) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;
        
        const newConnection: Connection = {
            id: `conn_${Date.now()}`,
            fromDeviceId,
            toDeviceId,
            cableType: cablingMode.cableType, // Use cable type from cablingMode
        };

        const updatedConnections = [...activeFloor.connections, newConnection];
        updateFloorData(
            activeFloor.id,
            { connections: updatedConnections },
            `Connected devices with ${cablingMode.cableType}`,
            'connect',
            { cableType: cablingMode.cableType, fromDeviceId, toDeviceId }
        );
        
        setCablingMode({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
        setSelectedItem(null);
    };
    
    const handleDeviceMove = (deviceId: string, newPos: { x: number; y: number }) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;
        
        const device = activeFloor.devices.find(d => d.id === deviceId);
        if (!device) return;
        
        const newState = produce(projectState, draft => {
            const floor = draft.buildings
                .flatMap(b => b.floors)
                .find(f => f.id === activeFloorId);
            if (floor) {
                const deviceToMove = floor.devices.find(d => d.id === deviceId);
                if (deviceToMove) {
                    deviceToMove.x = newPos.x;
                    deviceToMove.y = newPos.y;
                }
            }
        });
        
        updateProjectState(
            newState,
            `Moved ${device.type} device`,
            'move',
            { deviceType: device.type, deviceId: deviceId }
        );
    };

    const handleSaveProject = async () => {
        setIsSaving(true);
        const result = await saveProjectAction(projectState);
        if (result.success) {
            toast({ title: 'บันทึกโครงการสำเร็จ!' });
        } else {
            toast({ title: 'ข้อผิดพลาดในการบันทึกโครงการ', description: result.error, variant: 'destructive' });
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
            
            // Reset history when loading new project
            historyManager.clear();
            historyManager.pushState(result.data, 'Project loaded', 'add');
            updateHistoryState();
            
            toast({ title: `โครงการ "${result.data.projectName}" โหลดเสร็จแล้ว` });
        } else {
            toast({ title: 'ข้อผิดพลาดในการโหลดโครงการ', description: result.error, variant: 'destructive' });
        }
    };

    const handlePlanNameChange = (name: string) => {
        const newState = produce(projectState, draft => {
            draft.projectName = name;
        });
        updateProjectState(newState, `Changed project name to "${name}"`, 'update', { operation: 'rename-project' });
    };

    // ===== REMAINING HANDLER FUNCTIONS =====
    
    const handleRunDiagnostics = async () => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;
        
        // const stopTiming = PerformanceMonitor.startTiming('runDiagnostics'); // PerformanceMonitor not available
        setDiagnosticsLoading(true);
        
        try {
            const planData = {
                devices: activeFloor.devices.map(d => ({ 
                    id: d.id, 
                    label: d.label, 
                    type: d.type, 
                    channels: (d as any).channels || 0, 
                    ports: (d as any).ports || [] 
                })),
                connections: activeFloor.connections.map(c => ({ fromDeviceId: c.fromDeviceId, toDeviceId: c.toDeviceId })),
            };
            const result = await runPlanDiagnosticsAction(planData);
            
            if (result.success) {
                updateFloorData(
                    activeFloor.id, 
                    { diagnostics: (result.data as any).diagnostics },
                    'Updated diagnostics',
                    'update',
                    { operation: 'diagnostics' }
                );
                handleSuccess(
                    'Diagnostics Complete', 
                    `Found ${(result.data as any).diagnostics.length} items to review`
                );
            } else {
                console.error('Plan diagnostics error:', result.error);
            }
        } catch (error) {
            console.error('Plan diagnostics error:', error);
        } finally {
            setDiagnosticsLoading(false);
            // stopTiming(); // PerformanceMonitor not available
        }
    };

    const handleUpdateRack = (rack: RackContainer) => {
        const newState = produce(projectState, draft => {
            for (const building of draft.buildings) {
                for (const floor of building.floors) {
                    const rackIndex = floor.devices.findIndex(d => d.id === rack.id);
                    if (rackIndex !== -1) {
                        floor.devices[rackIndex] = rack;
                        if (selectedItem?.id === rack.id) {
                            setSelectedItem(rack);
                        }
                        return;
                    }
                }
            }
        });
        updateProjectState(newState, 'Updated rack configuration', 'update', { deviceType: 'rack', deviceId: rack.id });
    };

    const handleFindAllCablePaths = async () => {
        const activeFloor = getActiveFloor();
        if (!activeFloor || activeFloor.connections.length === 0) {
            handleWarning('ไม่มีการเชื่อมต่อ', 'กรุณาเพิ่มการเชื่อมต่อก่อนค้นหาเส้นทาง');
            return;
        }
        
        // const stopTiming = PerformanceMonitor.startTiming('findCablePaths'); // PerformanceMonitor not available
        setIsFindingPaths(true);
        
        try {
            handleInfo('AI กำลังค้นหาเส้นทางเดินสาย...', 'กรุณารอสักครู่');
            const updatedConnections: Connection[] = [...activeFloor.connections];
            let successCount = 0;
            
            for (let i = 0; i < updatedConnections.length; i++) {
                const conn = updatedConnections[i];
                const fromDevice = activeFloor.devices.find(d => d.id === conn.fromDeviceId);
                const toDevice = activeFloor.devices.find(d => d.id === conn.toDeviceId);
                if (!fromDevice || !toDevice) continue;
                
                const result = await findCablePathAction({
                    startPoint: { x: fromDevice.x, y: fromDevice.y },
                    endPoint: { x: toDevice.x, y: toDevice.y },
                    obstacles: activeFloor.architecturalElements.filter(el => el.type === 'wall').map(el => ({
                        id: el.id,
                        type: el.type,
                        start: { x: (el as any).x || 0, y: (el as any).y || 0 },
                        end: { x: (el as any).x + ((el as any).width || 0), y: (el as any).y + ((el as any).height || 0) }
                    })),
                    gridSize: { width: 1, height: 1 }
                });
                
                if (result.success && (result.data as any).path.length > 0) {
                    updatedConnections[i] = { ...conn, path: (result.data as any).path };
                    successCount++;
                } else {
                    console.warn(`Failed to find path for connection ${conn.id}:`, 'error' in result ? result.error : 'Unknown error');
                    // If path finding fails, create a direct line as a fallback if no path exists
                    if (!conn.path) {
                         updatedConnections[i] = { ...conn, path: [{x: fromDevice.x, y: fromDevice.y}, {x: toDevice.x, y: toDevice.y}] };
                    }
                }
            }
            
            updateFloorData(
                activeFloor.id, 
                { connections: updatedConnections },
                'Updated cable paths',
                'update',
                { operation: 'cable-path-finding' }
            );
            handleSuccess(
                'ค้นหาเส้นทางสำเร็จ', 
                `AI พบเส้นทางสำหรับ ${successCount}/${updatedConnections.length} การเชื่อมต่อ`
            );
        } catch (error) {
            console.error('Cable path finding error:', error);
        } finally {
            setIsFindingPaths(false);
            // stopTiming(); // PerformanceMonitor not available
        }
    };

    const handleGenerateReport = async () => {
        setIsGeneratingReport(true);
        try {
            const { ReportService } = await import('@/lib/report.service');
            const reportService = new ReportService(projectState);
            await reportService.generateReport();
            toast({ title: 'สร้างรายงานเสร็จแล้ว', description: 'ไฟล์ PDF รายงานของคุณได้ถูกดาวน์โหลดแล้ว' });
        } catch (error: any) {
            console.error("Failed to generate report:", error);
            toast({ title: 'การสร้างรายงานล้มเหลว', description: error.message, variant: 'destructive' });
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // ===== ADDITIONAL HANDLERS =====
    
    const handleFilesUpload = (files: File[]) => {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                toast({
                    title: 'รูปภาพแบบผัง',
                    description: `อัพโหลด ${file.name} สำเร็จ - ใช้ในแท็บแบบผังเพื่อตั้งค่า`,
                });
            } else if (file.type.includes('pdf')) {
                toast({
                    title: 'เอกสาร PDF',
                    description: `อัพโหลด ${file.name} สำเร็จ`,
                });
            } else if (file.type.includes('excel') || file.type.includes('csv')) {
                toast({
                    title: 'ไฟล์ข้อมูล',
                    description: `อัพโหลด ${file.name} สำเร็จ - พร้อมนำเข้าข้อมูลอุปกรณ์`,
                });
            } else if (file.name.toLowerCase().includes('.dwg') || file.name.toLowerCase().includes('.dxf')) {
                toast({
                    title: 'ไฟล์ CAD',
                    description: `อัพโหลด ${file.name} สำเร็จ - พร้อมแปลงเป็นแบบผัง`,
                });
            } else {
                toast({
                    title: 'อัพโหลดไฟล์สำเร็จ',
                    description: file.name,
                });
            }
        });
    };

    const handleFloorPlanUpload = (file: File, metadata: any) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;

        toast({
            title: 'แบบผังอัพโหลดสำเร็จ',
            description: `${file.name} พร้อมใช้งาน ขนาด ${metadata.width}×${metadata.height}m`,
        });
    };

    const handleLoadDemoSystem = () => {
        try {
            const demoProjectState = createInitialState();
            
            updateProjectState(
                demoProjectState,
                'Loaded demo project',
                'add',
                { 
                    operation: 'load-demo',
                    buildingCount: demoProjectState.buildings.length,
                    deviceCount: demoProjectState.buildings.reduce((total: number, building: Building) => 
                        total + building.floors.reduce((floorTotal: number, floor: Floor) => 
                            floorTotal + floor.devices.length, 0), 0
                    )
                }
            );

            if (demoProjectState.buildings.length > 0) {
                setActiveBuildingId(demoProjectState.buildings[0].id);
                if (demoProjectState.buildings[0].floors.length > 0) {
                    setActiveFloorId(demoProjectState.buildings[0].floors[0].id);
                }
            }
            setSelectedItem(null);

            const totalDevices = demoProjectState.buildings.reduce((total: number, building: Building) => 
                total + building.floors.reduce((floorTotal: number, floor: Floor) => 
                    floorTotal + floor.devices.length, 0), 0
            );

            toast({
                title: 'โหลดโปรเจ็กต์ตัวอย่างสำเร็จ',
                description: `โหลด ${demoProjectState.buildings.length} อาคาร และ ${totalDevices} อุปกรณ์`,
                duration: 5000,
            });

        } catch (error) {
            console.error('Error loading demo system:', error);
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถโหลดโปรเจ็กต์ตัวอย่างได้',
                variant: 'destructive',
            });
        }
    };

    const handleCalibrationUpdate = (calibrationData: CalibrationData) => {
        setCurrentCalibration(calibrationData);
        const projectWithCalibration = {
            ...projectState,
            calibration: calibrationData
        };
        updateProjectState(projectWithCalibration, 'Updated calibration settings', 'update');
    };

    // Get active floor data
    const activeFloorData = getActiveFloor();

    if (!activeFloorData) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 text-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-bold mb-4">ไม่พบข้อมูลชั้น</h2>
                    <p className="text-muted-foreground mb-6">กรุณาสร้างโปรเจ็กต์ใหม่หรือโหลดโปรเจ็กต์ที่มีอยู่</p>
                    <Button 
                        onClick={() => setProjectState(createInitialState())} 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                        สร้างโปรเจ็กต์ใหม่
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <SidebarProvider className="min-h-screen">
            <Sidebar>
                <SidebarContent>
                    {/* ProjectManager component commented out due to prop interface mismatch
                    <ProjectManager
                        projectState={projectState}
                        onFloorSelect={handleFloorSelect}
                        onPlanNameChange={handlePlanNameChange}
                        onSaveProject={handleSaveProject}
                        onLoadProject={handleLoadProject}
                        onLoadDemoSystem={handleLoadDemoSystem}
                        isProjectManagerOpen={isProjectManagerOpen}
                        setProjectManagerOpen={setProjectManagerOpen}
                        isSaving={isSaving}
                        activeBuildingId={activeBuildingId}
                        activeFloorId={activeFloorId}
                    />
                    */}
                    
                    {/* DevicesToolbar component commented out due to prop interface mismatch
                    <DevicesToolbar
                        onAddDevice={handleAddDevice}
                        cablingMode={cablingMode}
                        drawingTool={drawingTool}
                        setDrawingTool={setDrawingTool}
                        onFilesUpload={handleFilesUpload}
                        onFloorPlanUpload={handleFloorPlanUpload}
                        isMobile={isMobile}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        isAnalyzing={isAnalyzing}
                        isSuggesting={isSuggesting}
                        isFindingPaths={isFindingPaths}
                        isOptimizingCoverage={isOptimizingCoverage}
                        isDiagnosticsLoading={isDiagnosticsLoading}
                        isGeneratingReport={isGeneratingReport}
                        onRunDiagnostics={handleRunDiagnostics}
                        onFindCablePaths={handleFindAllCablePaths}
                        onGenerateReport={handleGenerateReport}
                        canUndo={canUndo}
                        canRedo={canRedo}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        historyManager={historyManager}
                    />
                    */}
                </SidebarContent>
            </Sidebar>

            <SidebarInset className="flex flex-col overflow-hidden">
                <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger />
                    <div className="flex-1" />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportDialogRef.current?.open()}
                    >
                        Export Project
                    </Button>
                </header>

                <div className="flex-1 overflow-hidden relative">
                    {/* PlanCanvas component is missing - commented out
                    <PlanCanvas
                        floorData={activeFloorData}
                        onDeviceClick={handleDeviceClick}
                        onDeviceMove={handleDeviceMove}
                        cablingMode={cablingMode}
                        onCreateConnection={handleCreateConnection}
                        selectedItem={selectedItem}
                        drawingTool={drawingTool}
                    /> */}
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <p>PlanCanvas component is missing</p>
                    </div>
                </div>
            </SidebarInset>

            {/* PropertiesSheet component is missing - commented out
            <PropertiesSheet
                isOpen={isPropertiesSheetOpen}
                onOpenChange={setPropertiesSheetOpen}
                selectedItem={selectedItem}
                onUpdateDevice={handleUpdateDevice}
                onRemoveDevice={handleRemoveDevice}
                onStartCabling={handleStartCabling}
                onUpdateRack={handleUpdateRack}
            /> */}

            <LogicalTopologyView
                isOpen={isTopologyViewOpen}
                onClose={() => setIsTopologyViewOpen(false)}
                devices={activeFloorData?.devices || []}
                connections={activeFloorData?.connections || []}
            />

            {/* View3D component is missing - commented out
            <View3D
                isOpen={is3DViewOpen}
                onOpenChange={setIs3DViewOpen}
                floorData={activeFloorData}
            /> */}

            {/* RackView component is missing - commented out
            <RackView
                rack={activeRack}
                isOpen={!!activeRack}
                onClose={() => setActiveRack(null)}
                onUpdateRack={handleUpdateRack}
            /> */}

            {/* ExportDialog component commented out due to prop interface mismatch
            <ExportDialog
                ref={exportDialogRef}
                projectState={projectState}
            />
            */}

            {/* ThermalCameraCalibration component commented out due to prop interface mismatch
            <ThermalCameraCalibration
                isOpen={showCalibrationDialog}
                onOpenChange={setShowCalibrationDialog}
                onCalibrationUpdate={handleCalibrationUpdate}
                currentCalibration={currentCalibration}
            />
            */}
        </SidebarProvider>
    );
}

export default function CCTVPlanner() {
    return <CCTVPlannerInner />;
}
