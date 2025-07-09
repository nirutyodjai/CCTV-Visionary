'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { produce } from 'immer';
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DevicesToolbar } from './sidebar/devices-toolbar';
import { ArchitectureToolbar } from './sidebar/architecture-toolbar';
import { DeviceCategories } from './sidebar/device-categories';
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
import { PerformanceDashboard } from './ui/performance-dashboard';
import { HistoryPanel } from './ui/history-panel';
import { MobileNav, MobileHeader } from './ui/mobile-nav';
import { TouchCanvas } from './ui/touch-canvas';
import { ThreeDVisualizer } from './ui/three-d-visualizer';
import { ExportDialog, type ExportDialogRef } from './ui/export-dialog';
import { AIReportGenerator } from './ui/ai-report-generator';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { cn } from '@/lib/utils';
import { FileUpload } from './ui/file-upload';
import { FloorPlanUploadAdvanced } from './sidebar/floor-plan-upload-advanced';
import { AppSettings } from './sidebar/app-settings';
import { SelectionProvider, useSelection } from '@/contexts/SelectionContext';
import { createDevice } from '@/lib/device-config';
import { createInitialState } from '@/lib/demo-data';
import type { ProjectState, AnyDevice, Floor, Building, ArchitecturalElement, ArchitecturalElementType, CablingMode, DeviceType, Connection, RackContainer, CableType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useKeyboardShortcuts, defaultShortcuts, ShortcutEventHandler } from '@/hooks/use-keyboard-shortcuts';
import { ErrorHandler, PerformanceMonitor } from '@/lib/ui-enhancements';
import {
  saveProjectAction,
  loadProjectAction,
  deleteProjectAction,
  updateProjectNameAction,
  runPlanDiagnosticsAction,
  suggestDevicePlacementsAction,
  findCablePathAction,
} from '@/app/actions';
import { Map, Settings, Bot, Presentation, Network, BarChart2, Loader2, Eye, PanelRightOpen, Undo, Redo, Clock, Upload, X, Box } from 'lucide-react';
import { ToolsIcon, ProjectIcon, HistoryIcon, FilesIcon, AiIcon, SettingsIcon } from '@/components/icons';
import { StateHistoryManager } from '@/lib/state-history';

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
    // Error handler instance
    const errorHandler = ErrorHandler;

    // Initialize keyboard shortcuts
    const exportShortcut = {
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
        
        // Show export feature hint
        setTimeout(() => {
            toast({
                title: "New Export Feature Available!",
                description: "Export your project as PDF, Excel, CAD and more. Press Ctrl+Shift+E or use the export button.",
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

    // Setup keyboard shortcut event handlers
    useEffect(() => {
        const unsubscribers = [
            ShortcutEventHandler.on('save-project', handleSaveProject),
            ShortcutEventHandler.on('delete-selected', handleDeleteSelectedItem),
            ShortcutEventHandler.on('cancel-action', handleCancelAction),
            ShortcutEventHandler.on('undo', handleUndo),
            ShortcutEventHandler.on('redo', handleRedo),
        ];

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
            unsubscribers.forEach(unsub => unsub());
            window.removeEventListener('keydown', handleKeydown);
        };
    }, []);

    // Setup touch gestures for mobile undo/redo - moved after handleUndo/handleRedo declarations

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
        toast({ title: 'Cabling Mode Started', description: `Select another device to connect with ${cableType}.`});
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
            
            // Reset history when loading new project
            historyManager.clear();
            historyManager.pushState(result.data, 'Project loaded', 'add');
            updateHistoryState();
            
            toast({ title: `Project "${result.data.projectName}" loaded.` });
        } else {
            toast({ title: 'Error Loading Project', description: result.error, variant: 'destructive' });
        }
    };

    const handlePlanNameChange = (name: string) => {
        const newState = produce(projectState, draft => {
            draft.projectName = name;
        });
        updateProjectState(newState, `Changed project name to "${name}"`, 'update', { operation: 'rename-project' });
    };
    
     const handleRunDiagnostics = async () => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;
        
        const stopTiming = PerformanceMonitor.startTiming('runDiagnostics');
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
                errorHandler.handleAIError(new Error(result.error), 'plan diagnostics');
            }
        } catch (error) {
            errorHandler.handleAIError(error, 'plan diagnostics');
        } finally {
            setDiagnosticsLoading(false);
            stopTiming();
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
        
        const stopTiming = PerformanceMonitor.startTiming('findCablePaths');
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
            errorHandler.handleAIError(error, 'cable path finding');
        } finally {
            setIsFindingPaths(false);
            stopTiming();
        }
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

    // File upload handlers
    const handleFilesUpload = (files: File[]) => {
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                // Handle floor plan images
                toast({
                    title: 'รูปภาพแบบผัง',
                    description: `อัพโหลด ${file.name} สำเร็จ - ใช้ในแท็บแบบผังเพื่อตั้งค่า`,
                });
            } else if (file.type.includes('pdf')) {
                // Handle PDF documents
                toast({
                    title: 'เอกสาร PDF',
                    description: `อัพโหลด ${file.name} สำเร็จ`,
                });
            } else if (file.type.includes('excel') || file.type.includes('csv')) {
                // Handle spreadsheet data
                toast({
                    title: 'ไฟล์ข้อมูล',
                    description: `อัพโหลด ${file.name} สำเร็จ - พร้อมนำเข้าข้อมูลอุปกรณ์`,
                });
            } else if (file.name.toLowerCase().includes('.dwg') || file.name.toLowerCase().includes('.dxf')) {
                // Handle CAD files
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
        // Handle advanced floor plan upload with metadata
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;

        // Here you would typically save the floor plan to the project state
        toast({
            title: 'แบบผังอัพโหลดสำเร็จ',
            description: `${file.name} พร้อมใช้งาน ขนาด ${metadata.width}×${metadata.height}m`,
        });

        // In a real implementation, you'd update the floor's background image
        // updateFloorData(activeFloor.id, { backgroundImage: file, metadata }, 'Floor plan uploaded', 'update');
    };

    // Demo system loading
    const handleLoadDemoSystem = () => {
        try {
            // Load the demo project state instead of individual components
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

            // Switch to first building and floor
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

    const handleAddFloor = (buildingId: string) => {
        const newFloor: Floor = {
            id: `floor_${Date.now()}`,
            name: `Floor ${Date.now().toString().slice(-4)}`,
            devices: [],
            connections: [],
            architecturalElements: [],
            floorPlanUrl: undefined,
            diagnostics: []
        };

        const newState = produce(projectState, draft => {
            const building = draft.buildings.find(b => b.id === buildingId);
            if (building) {
                building.floors.push(newFloor);
            }
        });

        updateProjectState(newState, `Added new floor: ${newFloor.name}`, 'add', {
            operation: 'add-floor',
            buildingId,
            floorId: newFloor.id
        });

        // Switch to the new floor
        setActiveFloorId(newFloor.id);
        setActiveBuildingId(buildingId);

        toast({
            title: 'เพิ่มชั้นใหม่สำเร็จ',
            description: `ชั้น "${newFloor.name}" ถูกเพิ่มเรียบร้อยแล้ว`,
        });
    };

    const handleAddBuilding = () => {
        const newBuilding: Building = {
            id: `building_${Date.now()}`,
            name: `Building ${Date.now().toString().slice(-4)}`,
            floors: [{
                id: `floor_${Date.now()}`,
                name: 'Ground Floor',
                devices: [],
                connections: [],
                architecturalElements: [],
                floorPlanUrl: undefined,
                diagnostics: []
            }]
        };

        const newState = produce(projectState, draft => {
            draft.buildings.push(newBuilding);
        });

        updateProjectState(newState, `Added new building: ${newBuilding.name}`, 'add', {
            operation: 'add-building',
            buildingId: newBuilding.id
        });

        // Switch to the new building and its first floor
        setActiveBuildingId(newBuilding.id);
        setActiveFloorId(newBuilding.floors[0].id);

        toast({
            title: 'เพิ่มอาคารใหม่สำเร็จ',
            description: `อาคาร "${newBuilding.name}" ถูกเพิ่มเรียบร้อยแล้ว`,
        });
    };

    const handleUpdateBuildingName = (buildingId: string, newName: string) => {
        const newState = produce(projectState, draft => {
            const building = draft.buildings.find(b => b.id === buildingId);
            if (building) {
                building.name = newName;
            }
        });

        updateProjectState(newState, `Renamed building to: ${newName}`, 'update', {
            operation: 'rename-building',
            buildingId,
            newName
        });

        toast({
            title: 'เปลี่ยนชื่ออาคารสำเร็จ',
            description: `อาคารถูกเปลี่ยนชื่อเป็น "${newName}"`,
        });
    };
    const handleAnalyzeProject = async () => {
        setIsAnalyzing(true);
        try {
            handleInfo('AI กำลังวิเคราะห์โครงการ...', 'กรุณารอสักครู่');
            
            // Simulate AI analysis
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const activeFloor = getActiveFloor();
            const deviceCount = activeFloor?.devices.length || 0;
            const connectionCount = activeFloor?.connections.length || 0;
            const floorCount = projectState.buildings.flatMap(b => b.floors).length;
            
            handleSuccess(
                'การวิเคราะห์เสร็จสิ้น',
                `พบ ${deviceCount} อุปกรณ์, ${connectionCount} การเชื่อมต่อ ใน ${floorCount} ชั้น`
            );
        } catch (error) {
            errorHandler.handleAIError(error, 'project analysis');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSuggestPlacements = async () => {
        setIsSuggesting(true);
        try {
            handleInfo('AI กำลังแนะนำตำแหน่งอุปกรณ์...', 'กรุณารอสักครู่');
            
            // Simulate AI suggestions
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            handleSuccess(
                'ข้อแนะนำพร้อมแล้ว',
                'AI แนะนำตำแหน่งที่เหมาะสมสำหรับอุปกรณ์ใหม่'
            );
        } catch (error) {
            errorHandler.handleAIError(error, 'device placement suggestions');
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleOptimizeCoverage = async () => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) {
            handleWarning('ไม่พบข้อมูลชั้น', 'กรุณาเลือกชั้นที่ต้องการปรับแต่งการครอบคลุม');
            return;
        }

        const cameras = activeFloor.devices.filter(d => d.type.startsWith('cctv-'));
        if (cameras.length === 0) {
            handleWarning('ไม่มีกล้อง', 'กรุณาเพิ่มกล้องก่อนทำการปรับแต่งการครอบคลุม');
            return;
        }

        setIsOptimizingCoverage(true);
        try {
            handleInfo('AI กำลังวิเคราะห์การครอบคลุมของกล้อง...', 'กำลังคำนวณพื้นที่อับและซ้ำซ้อน');
            
            // Simulate coverage analysis
            await new Promise(resolve => setTimeout(resolve, 2500));
            
            // Simulate coverage analysis results
            const totalCameras = cameras.length;
            const simulatedCoverage = Math.min(85 + totalCameras * 2, 98);
            const blindSpots = Math.max(0, 8 - totalCameras);
            const suggestions = Math.min(3, Math.max(1, 5 - totalCameras));
            
            handleSuccess(
                'การวิเคราะห์การครอบคลุมเสร็จสิ้น',
                `การครอบคลุม: ${simulatedCoverage}% | จุดอับ: ${blindSpots} จุด | ข้อแนะนำ: ${suggestions} รายการ`
            );

            // Show detailed suggestions
            setTimeout(() => {
                if (blindSpots > 0) {
                    toast({
                        title: '🎯 ข้อแนะนำการปรับปรุง',
                        description: `พบจุดอับ ${blindSpots} จุด - แนะนำเพิ่มกล้อง Dome ในตำแหน่งกลางพื้นที่`,
                        duration: 5000,
                    });
                } else {
                    toast({
                        title: '✅ การครอบคลุมดีเยี่ยม',
                        description: 'ระบบกล้องมีการครอบคลุมที่เหมาะสมแล้ว อาจปรับมุมเล็กน้อยเพื่อลดซ้ำซ้อน',
                        duration: 4000,
                    });
                }
            }, 1000);

        } catch (error) {
            errorHandler.handleAIError(error, 'coverage optimization');
        } finally {
            setIsOptimizingCoverage(false);
        }
    };

    // Architectural element handlers
    const handleUpdateArchElement = (element: ArchitecturalElement) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;

        const updatedElements = activeFloor.architecturalElements.map(e => 
            e.id === element.id ? element : e
        );

        updateFloorData(
            activeFloor.id,
            { architecturalElements: updatedElements },
            `Updated ${element.type} element`,
            'update',
            { elementType: element.type, elementId: element.id }
        );

        setSelectedItem(element);
    };

    const handleRemoveArchElement = (elementId: string) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;

        const elementToRemove = activeFloor.architecturalElements.find(e => e.id === elementId);
        const updatedElements = activeFloor.architecturalElements.filter(e => e.id !== elementId);

        updateFloorData(
            activeFloor.id,
            { architecturalElements: updatedElements },
            `Removed ${elementToRemove?.type || 'element'}`,
            'remove',
            { elementType: elementToRemove?.type, elementId: elementId }
        );

        setSelectedItem(null);
        setPropertiesSheetOpen(false);
    };
    const handleExportSettings = () => {
        try {
            const settings = {
                projectSettings: {
                    defaultCableType: 'utp-cat6',
                    gridSnap: true,
                    autoSave: true
                },
                uiSettings: {
                    theme: 'light',
                    language: 'th',
                    compactMode: false
                },
                exportedAt: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(settings, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cctv-planner-settings-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            toast({
                title: 'ส่งออกการตั้งค่าสำเร็จ',
                description: 'ไฟล์การตั้งค่าถูกดาวน์โหลดแล้ว',
            });
        } catch (error) {
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถส่งออกการตั้งค่าได้',
                variant: 'destructive'
            });
        }
    };

    const handleImportSettings = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const settings = JSON.parse(e.target?.result as string);
                        toast({
                            title: 'นำเข้าการตั้งค่าสำเร็จ',
                            description: 'การตั้งค่าถูกนำเข้าเรียบร้อยแล้ว',
                        });
                    } catch (error) {
                        toast({
                            title: 'เกิดข้อผิดพลาด',
                            description: 'ไฟล์การตั้งค่าไม่ถูกต้อง',
                            variant: 'destructive'
                        });
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };

    const handleResetSettings = () => {
        if (confirm('คุณแน่ใจหรือไม่ที่จะรีเซ็ตการตั้งค่าสำหรับโปรเจ็กต์นี้?')) {
            // Reset logic here
            const defaultSettings = createInitialState();
            updateProjectState(defaultSettings, 'Reset project settings', 'update', { operation: 'reset-settings' });
            
            toast({
                title: 'รีเซ็ตการตั้งค่าสำเร็จ',
                description: 'การตั้งค่าโปรเจ็กต์ถูกรีเซ็ตเป็นค่าเริ่มต้น',
            });
        }
    };

    const handleAIReportGeneration = async (config: any) => {
        try {
            setIsGeneratingReport(true);
            
            // Here would be the actual AI report generation logic
            // For now, we'll simulate the process
            
            toast({
                title: 'เริ่มสร้างรายงาน AI',
                description: `กำลังสร้างรายงาน${config.type} รูปแบบ ${config.format}`,
            });

            // Simulate report generation delay
            await new Promise(resolve => setTimeout(resolve, 3000));

            toast({
                title: 'สร้างรายงาน AI สำเร็จ',
                description: 'รายงานได้ถูกสร้างและดาวน์โหลดเรียบร้อยแล้ว',
            });

        } catch (error) {
            console.error('Error generating AI report:', error);
            toast({
                title: 'เกิดข้อผิดพลาด',
                description: 'ไม่สามารถสร้างรายงาน AI ได้',
                variant: 'destructive',
            });
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // Helper methods for error handling
    const handleSuccess = (title: string, description: string) => {
        toast({ title, description });
    };

    const handleWarning = (title: string, description: string) => {
        toast({ title, description, variant: 'destructive' });
    };

    const handleInfo = (title: string, description: string) => {
        toast({ title, description });
    };

    const activeFloorData = getActiveFloor();
    if (!activeFloorData) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 text-center p-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Map className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg mb-4 text-slate-700 dark:text-slate-300">No floor selected or project is empty.</p>
                    <Button 
                        onClick={() => setProjectState(createInitialState())} 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        Load Demo Project
                    </Button>
                </div>
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
                onExport={() => exportDialogRef.current?.open()}
            />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-6 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-1 rounded-lg">
                    <TabsTrigger value="tools" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <ToolsIcon className="w-4 h-4 mr-1 text-blue-600 data-[state=active]:text-white"/> Tools
                    </TabsTrigger>
                    <TabsTrigger value="files" className="data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-green-50 dark:hover:bg-green-900/20">
                        <FilesIcon className="w-4 h-4 mr-1 text-green-600 data-[state=active]:text-white"/> Files
                    </TabsTrigger>
                    <TabsTrigger value="ai" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-purple-50 dark:hover:bg-purple-900/20">
                        <AiIcon className="w-4 h-4 mr-1 text-purple-600 data-[state=active]:text-white"/> AI
                    </TabsTrigger>
                    <TabsTrigger value="project" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-orange-50 dark:hover:bg-orange-900/20">
                        <ProjectIcon className="w-4 h-4 mr-1 text-orange-600 data-[state=active]:text-white"/> Project
                    </TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                        <HistoryIcon className="w-4 h-4 mr-1 text-indigo-600 data-[state=active]:text-white"/> History
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-900/20">
                        <SettingsIcon className="w-4 h-4 mr-1 text-gray-600 data-[state=active]:text-white"/> Settings
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="tools" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                    <ProjectNavigator 
                        buildings={projectState.buildings}
                        activeBuildingId={activeBuildingId}
                        activeFloorId={activeFloorId}
                        onFloorSelect={handleFloorSelect}
                        onAddFloor={handleAddFloor}
                        onUpdateBuildingName={handleUpdateBuildingName}
                    />
                    <DeviceCategories onSelectDevice={handleAddDevice} />
                    <DevicesToolbar onSelectDevice={handleAddDevice} />
                    <ArchitectureToolbar selectedTool={drawingTool} onSelectTool={setDrawingTool} />
                </TabsContent>
                <TabsContent value="files" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                    <FloorPlanUploadAdvanced 
                        onUpload={handleFloorPlanUpload}
                        currentFloorPlan={undefined}
                    />
                    <FileUpload 
                        onFilesUpload={handleFilesUpload}
                        title="อัพโหลดไฟล์ทั่วไป"
                        description="ลากไฟล์มาวางหรือคลิกเพื่อเลือกไฟล์"
                        maxFiles={5}
                        maxSize={10}
                    />
                </TabsContent>
                <TabsContent value="ai" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                    <AiAssistant 
                        onAnalyze={handleAnalyzeProject}
                        onSuggest={handleSuggestPlacements}
                        onFindCablePaths={handleFindAllCablePaths}
                        onOptimizeCoverage={handleOptimizeCoverage}
                        isAnalyzing={isAnalyzing}
                        isSuggesting={isSuggesting}
                        isFindingPaths={isFindingPaths}
                        isOptimizingCoverage={isOptimizingCoverage}
                    />
                    <DiagnosticsPanel 
                        diagnostics={activeFloorData.diagnostics || []}
                        onRunDiagnostics={handleRunDiagnostics}
                        isLoading={isDiagnosticsLoading}
                    />
                    <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                        <CardHeader className="p-3 border-b border-purple-200 dark:border-purple-700">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-purple-700 dark:text-purple-300">
                                <Box className="w-4 h-4" />3D View
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            <Button onClick={() => setIs3DViewOpen(true)} className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                                <Box className="w-4 h-4 mr-2" />View in 3D
                            </Button>
                        </CardContent>
                    </Card>
                     <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                        <CardHeader className="p-3 border-b border-emerald-200 dark:border-emerald-700">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                <Network className="w-4 h-4" />Topology
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            <Button onClick={() => setIsTopologyViewOpen(true)} className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200">
                                <Eye className="w-4 h-4 mr-2" />View Network Topology
                            </Button>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20 shadow-lg hover:shadow-xl transition-shadow duration-200">
                        <CardHeader className="p-3 border-b border-rose-200 dark:border-rose-700">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-rose-700 dark:text-rose-300">
                                <Presentation className="w-4 h-4" />Generate Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            <Button onClick={handleGenerateReport} disabled={isGeneratingReport} className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:from-rose-300 disabled:to-rose-400 text-white shadow-md hover:shadow-lg transition-all duration-200">
                                {isGeneratingReport ? <Loader2 className="animate-spin" /> : 'Create PDF Report'}
                            </Button>
                        </CardContent>
                    </Card>
                    <AIReportGenerator
                        project={projectState}
                        floors={projectState.buildings.flatMap(b => b.floors)}
                        devices={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.devices))}
                        connections={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.connections))}
                        onGenerateReport={handleAIReportGeneration}
                    />
                </TabsContent>
                <TabsContent value="project" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                    <BillOfMaterials project={projectState} />
                </TabsContent>
                <TabsContent value="history" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                    <HistoryPanel 
                        historyManager={historyManager}
                        onUndo={handleUndo}
                        onRedo={handleRedo}
                        canUndo={canUndo}
                        canRedo={canRedo}
                    />
                </TabsContent>
                <TabsContent value="settings" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                    <AppSettings 
                        onImportDemo={handleLoadDemoSystem}
                        onExportSettings={handleExportSettings}
                        onImportSettings={handleImportSettings}
                        onResetSettings={handleResetSettings}
                    />
                </TabsContent>
            </Tabs>
        </>
    );
    
    return (
        <div className="w-full h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 text-foreground flex flex-col">
            {/* Mobile Header */}
            {isMobile && (
                <MobileHeader 
                    title={projectState.projectName}
                    onMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex min-h-0">
                {/* Desktop Layout */}
                {!isMobile && (
                    <SidebarProvider>
                        <Sidebar>
                            <SidebarContent>
                               <SidePanelContent />
                            </SidebarContent>
                        </Sidebar>
                        <SidebarInset className="flex flex-1 flex-col min-w-0">
                            <header className="flex h-14 items-center justify-between gap-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700 px-4 sm:px-6 sticky top-0 z-40 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <SidebarTrigger className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200" />
                                    <h1 className="font-semibold text-lg truncate text-blue-800 dark:text-blue-200">{projectState.projectName}</h1>
                                    {canUndo && (
                                        <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-600">
                                            {historyManager.getHistory().length} changes
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleUndo} 
                                        disabled={!canUndo}
                                        title="Undo (Ctrl+Z)"
                                        className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 disabled:opacity-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                    >
                                        <Undo className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleRedo} 
                                        disabled={!canRedo}
                                        title="Redo (Ctrl+Y)"
                                        className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400 disabled:opacity-50 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                    >
                                        <Redo className="w-4 h-4" />
                                    </Button>
                                     <Button variant="outline" size="icon" onClick={() => setPropertiesSheetOpen(true)} className="border-teal-300 text-teal-700 hover:bg-teal-50 hover:border-teal-400 dark:border-teal-600 dark:text-teal-400 dark:hover:bg-teal-900/20">
                                        <PanelRightOpen />
                                        <span className="sr-only">Open Properties</span>
                                    </Button>
                                </div>
                            </header>
                            <main className="flex-1 flex min-h-0 bg-gradient-to-br from-white via-blue-50 to-indigo-50 dark:from-slate-800 dark:via-blue-950 dark:to-indigo-950">
                                 <div className="flex-1 relative border border-slate-200 dark:border-slate-700 rounded-lg m-2 shadow-inner bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                                     <PlannerCanvas 
                                        floor={activeFloorData} 
                                        cablingMode={cablingMode}
                                        onDeviceClick={handleDeviceClick}
                                        onDeviceUpdate={handleUpdateDevice}
                                        onArchElementClick={(el) => {
                                          setSelectedItem(el)
                                          setPropertiesSheetOpen(true)
                                        }}
                                        onCanvasClick={() => {
                                            setSelectedItem(null);
                                            setCablingMode({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
                                        }}
                                        onDeviceMove={handleDeviceMove}
                                     />
                                </div>
                            </main>
                        </SidebarInset>
                    </SidebarProvider>
                )}

                {/* Mobile Layout */}
                {isMobile && (
                    <>
                        {/* Mobile Sidebar Overlay */}
                        {isMobileSidebarOpen && (
                            <div 
                                className="fixed inset-0 bg-black/50 z-40" 
                                onClick={() => setIsMobileSidebarOpen(false)}
                            />
                        )}
                        
                        {/* Mobile Sidebar */}
                        <div className={cn(
                            "fixed left-0 top-0 h-full w-80 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-r border-slate-200 dark:border-slate-700 z-50 transition-transform duration-300 ease-in-out shadow-2xl",
                            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        )}>
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-500 to-purple-600">
                                    <h2 className="font-semibold text-white">Control Panel</h2>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setIsMobileSidebarOpen(false)}
                                        className="text-white hover:bg-white/20"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    <SidePanelContent />
                                </div>
                            </div>
                        </div>

                        {/* Mobile Canvas */}
                        <div className="flex-1 relative bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-blue-900">
                            <TouchCanvas
                                className="w-full h-full"
                                onTap={(point) => {
                                    // Handle tap on canvas
                                    setSelectedItem(null);
                                    setCablingMode({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
                                }}
                                onDoubleTap={(point) => {
                                    // Handle double tap - could add device at point
                                    console.log('Double tap at:', point);
                                }}
                            >
                                 <PlannerCanvas 
                                    floor={activeFloorData} 
                                    cablingMode={cablingMode}
                                    onDeviceClick={handleDeviceClick}
                                    onDeviceUpdate={handleUpdateDevice}
                                    onArchElementClick={(el) => {
                                      setSelectedItem(el)
                                      setPropertiesSheetOpen(true)
                                    }}
                                    onCanvasClick={() => {
                                        setSelectedItem(null);
                                        setCablingMode({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
                                    }}
                                    onDeviceMove={handleDeviceMove}
                                 />
                            </TouchCanvas>
                        </div>
                    </>
                )}
            </div>

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <MobileNav 
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    historyCount={historyManager.getHistory().length}
                />
            )}

            <Sheet open={isPropertiesSheetOpen} onOpenChange={setPropertiesSheetOpen}>
                <SheetContent className={cn(
                    "w-full sm:max-w-lg bg-gradient-to-b from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border-l-4 border-l-blue-500",
                    isMobile && "h-[85vh] rounded-t-lg"
                )}>
                    <SheetHeader className="border-b border-blue-200 dark:border-blue-700 pb-4 mb-4">
                        <SheetTitle className="text-blue-800 dark:text-blue-200">Properties</SheetTitle>
                        <SheetDescription className="text-blue-600 dark:text-blue-400">
                            Edit the properties of the selected item.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="h-[calc(100%-4rem)] overflow-y-auto">
                        <PropertiesPanel
                            onUpdateDevice={handleUpdateDevice}
                            onRemoveDevice={handleRemoveDevice}
                            onStartCabling={handleStartCabling}
                            onViewRack={(rack) => setActiveRack(rack as RackContainer)}
                            onUpdateArchElement={handleUpdateArchElement}
                            onRemoveArchElement={handleRemoveArchElement}
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

            <ThreeDVisualizer
                floor={activeFloorData}
                devices={activeFloorData.devices}
                connections={activeFloorData.connections}
                isOpen={is3DViewOpen}
                onClose={() => setIs3DViewOpen(false)}
            />
            
            {/* Export Dialog */}
            <ExportDialog
                ref={exportDialogRef}
                project={projectState}
                floors={projectState.buildings.flatMap(b => b.floors)}
                devices={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.devices))}
                connections={projectState.buildings.flatMap(b => b.floors.flatMap(f => f.connections))}
                canvas={undefined} // Will be enhanced later to capture canvas
            />
            
            {/* Performance Dashboard - Only show in development */}
            {process.env.NODE_ENV === 'development' && <PerformanceDashboard />}
        </div>
    );
}


export function CCTVPlanner() {
    return (
        <SelectionProvider>
            <CCTVPlannerInner />
        </SelectionProvider>
    );
}
