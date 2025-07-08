'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
import { useTouchGestures } from '@/hooks/use-touch-gestures';
import { cn } from '@/lib/utils';
import { FileUpload } from './ui/file-upload';
import { FloorPlanUploadAdvanced } from './sidebar/floor-plan-upload-advanced';
import { AppSettings } from './sidebar/app-settings';
import { SelectionProvider, useSelection } from '@/contexts/SelectionContext';
import { createDevice } from '@/lib/device-config';
import { createInitialState, generateDemoProject } from '@/lib/demo-data';
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
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const exportDialogRef = useRef<ExportDialogRef>(null);
    
    const { selectedItem, setSelectedItem } = useSelection();

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

    // Setup touch gestures for mobile undo/redo
    useEffect(() => {
        if (!isMobile || !touchSupport) return;

        const handleTouchGesture = (e: TouchEvent) => {
            // Three-finger swipe for undo/redo
            if (e.touches.length === 3) {
                e.preventDefault();
                
                const startX = e.touches[0].clientX;
                const endX = e.touches[0].clientX;
                const deltaX = endX - startX;
                
                if (Math.abs(deltaX) > 50) {
                    if (deltaX > 0 && canRedo) {
                        const nextState = historyManager.redo();
                        if (nextState) {
                            setProjectState(nextState);
                            setSelectedItem(null);
                            updateHistoryState();
                        }
                    } else if (deltaX < 0 && canUndo) {
                        const previousState = historyManager.undo();
                        if (previousState) {
                            setProjectState(previousState);
                            setSelectedItem(null);
                            updateHistoryState();
                        }
                    }
                }
            }
        };

        document.addEventListener('touchmove', handleTouchGesture, { passive: false });
        
        return () => {
            document.removeEventListener('touchmove', handleTouchGesture);
        };
    }, [isMobile, touchSupport, canUndo, canRedo]);

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

    const handleUndo = () => {
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
    };

    const handleRedo = () => {
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
    };
    
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
                devices: activeFloor.devices.map(d => ({ id: d.id, label: d.label, type: d.type, channels: d.channels, ports: d.ports })),
                connections: activeFloor.connections.map(c => ({ fromDeviceId: c.fromDeviceId, toDeviceId: c.toDeviceId })),
            };
            const result = await runPlanDiagnosticsAction(planData);
            
            if (result.success) {
                updateFloorData(
                    activeFloor.id, 
                    { diagnostics: result.data.diagnostics },
                    'Updated diagnostics',
                    'update',
                    { operation: 'diagnostics' }
                );
                ErrorHandler.handleSuccess(
                    'Diagnostics Complete', 
                    `Found ${result.data.diagnostics.length} items to review`
                );
            } else {
                ErrorHandler.handleAIError(new Error(result.error), 'plan diagnostics');
            }
        } catch (error) {
            ErrorHandler.handleAIError(error, 'plan diagnostics');
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
            ErrorHandler.handleWarning('ไม่มีการเชื่อมต่อ', 'กรุณาเพิ่มการเชื่อมต่อก่อนค้นหาเส้นทาง');
            return;
        }
        
        const stopTiming = PerformanceMonitor.startTiming('findCablePaths');
        setIsFindingPaths(true);
        
        try {
            ErrorHandler.handleInfo('AI กำลังค้นหาเส้นทางเดินสาย...', 'กรุณารอสักครู่');
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
                    obstacles: activeFloor.architecturalElements.filter(el => el.type === 'wall'),
                    gridSize: { width: 1, height: 1 }
                });
                
                if (result.success && result.data.path.length > 0) {
                    updatedConnections[i] = { ...conn, path: result.data.path };
                    successCount++;
                } else {
                    console.warn(`Failed to find path for connection ${conn.id}:`, 'error' in result ? result.error : 'Unknown error');
                    if (!updatedConnections[i].path) {
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
            ErrorHandler.handleSuccess(
                'ค้นหาเส้นทางสำเร็จ', 
                `AI พบเส้นทางสำหรับ ${successCount}/${updatedConnections.length} การเชื่อมต่อ`
            );
        } catch (error) {
            ErrorHandler.handleAIError(error, 'cable path finding');
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
            // Load the existing demo project data
            const demoProjectState = generateDemoProject();
            
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

    // AI Report Generation
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
                onExport={() => exportDialogRef.current?.open()}
            />
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-6">
                    <TabsTrigger value="tools"><Map className="w-4 h-4 mr-1"/> Tools</TabsTrigger>
                    <TabsTrigger value="files"><Upload className="w-4 h-4 mr-1"/> Files</TabsTrigger>
                    <TabsTrigger value="ai"><Bot className="w-4 h-4 mr-1"/> AI</TabsTrigger>
                    <TabsTrigger value="project"><BarChart2 className="w-4 h-4 mr-1"/> Project</TabsTrigger>
                    <TabsTrigger value="history"><Clock className="w-4 h-4 mr-1"/> History</TabsTrigger>
                    <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1"/> Settings</TabsTrigger>
                </TabsList>
                <TabsContent value="tools" className="p-2 space-y-3 mt-0 flex-1 overflow-y-auto">
                    <ProjectNavigator 
                        buildings={projectState.buildings}
                        activeBuildingId={activeBuildingId}
                        activeFloorId={activeFloorId}
                        onFloorSelect={handleFloorSelect}
                        onAddFloor={() => {}}
                        onUpdateBuildingName={() => {}}
                    />
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
                            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Box className="w-4 h-4" />3D View</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            <Button onClick={() => setIs3DViewOpen(true)} className="w-full">
                                <Box className="w-4 h-4 mr-2" />View in 3D
                            </Button>
                        </CardContent>
                    </Card>
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
                        onExportSettings={() => {}}
                        onImportSettings={() => {}}
                        onResetSettings={() => {}}
                    />
                </TabsContent>
            </Tabs>
        </>
    );
    
    return (
        <div className="w-full h-screen bg-background text-foreground flex flex-col">
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
                            <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6 sticky top-0 z-40">
                                <div className="flex items-center gap-2">
                                    <SidebarTrigger />
                                    <h1 className="font-semibold text-lg truncate">{projectState.projectName}</h1>
                                    {canUndo && (
                                        <Badge variant="outline" className="text-xs">
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
                                    >
                                        <Undo className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleRedo} 
                                        disabled={!canRedo}
                                        title="Redo (Ctrl+Y)"
                                    >
                                        <Redo className="w-4 h-4" />
                                    </Button>
                                     <Button variant="outline" size="icon" onClick={() => setPropertiesSheetOpen(true)}>
                                        <PanelRightOpen />
                                        <span className="sr-only">Open Properties</span>
                                    </Button>
                                </div>
                            </header>
                            <main className="flex-1 flex min-h-0">
                                 <div className="flex-1 relative">
                                     <PlannerCanvas 
                                        floor={activeFloorData} 
                                        cablingMode={cablingMode}
                                        onDeviceClick={handleDeviceClick}
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
                            "fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 transition-transform duration-300 ease-in-out",
                            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
                        )}>
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between p-4 border-b">
                                    <h2 className="font-semibold">Control Panel</h2>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setIsMobileSidebarOpen(false)}
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
                        <div className="flex-1 relative">
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
                    "w-full sm:max-w-lg",
                    isMobile && "h-[85vh] rounded-t-lg"
                )}>
                    <SheetHeader>
                        <SheetTitle>Properties</SheetTitle>
                        <SheetDescription>
                            Edit the properties of the selected item.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="h-[calc(100%-4rem)] overflow-y-auto">
                        <PropertiesPanel
                            onUpdateDevice={handleUpdateDevice}
                            onRemoveDevice={handleRemoveDevice}
                            onStartCabling={handleStartCabling}
                            onViewRack={(rack) => setActiveRack(rack as RackContainer)}
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
            <PerformanceDashboard />
        </SelectionProvider>
    );
}
