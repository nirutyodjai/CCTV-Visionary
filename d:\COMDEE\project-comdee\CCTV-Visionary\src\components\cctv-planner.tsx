'use client';

import React, { useState, useCallback } from 'react';
import { produce } from 'immer';
import { IconMenuSidebar } from './sidebar/icon-menu-sidebar';
import { DevicesToolbar } from './sidebar/devices-toolbar';
import { ArchitectureToolbar } from './sidebar/architecture-toolbar';
import { AiAssistant } from './sidebar/ai-assistant';
import { DiagnosticsPanel } from './sidebar/diagnostics-panel';
import { ProjectNavigator } from './sidebar/project-navigator';
import { BillOfMaterials } from './sidebar/bill-of-materials';
import { AppSettings } from './sidebar/app-settings';
import { PropertiesPanel } from './sidebar/properties-panel';
import { PlannerCanvas } from './canvas/planner-canvas';
import { SelectionProvider, useSelection } from '@/contexts/SelectionContext';
import type { Floor, AnyDevice, ArchitecturalElement, DeviceType, Connection, CableType, ProjectState, ArchitecturalElementType } from '@/lib/types';
import { generateDemoProject } from '@/lib/demo-data';
import { createDevice } from '@/lib/DEVICE_CONFIG';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

function CCTVPlannerInner() {
  const [projectState, setProjectState] = useState<ProjectState>(generateDemoProject());
  const [activeBuildingId, setActiveBuildingId] = useState<string | null>(projectState.buildings[0]?.id || null);
  const [activeFloorId, setActiveFloorId] = useState<string | null>(projectState.buildings[0]?.floors[0]?.id || null);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [cablingMode, setCablingMode] = useState<{ enabled: boolean; fromDeviceId: string | null; cableType: CableType }>({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
  const { selectedItem, setSelectedItem } = useSelection();
  const { toast } = useToast();

  const getActiveFloor = useCallback((): Floor | undefined => {
    const building = projectState.buildings.find(b => b.id === activeBuildingId);
    return building?.floors.find(f => f.id === activeFloorId);
  }, [projectState, activeBuildingId, activeFloorId]);

  const updateFloorData = (updates: Partial<Floor>) => {
    if (!activeFloorId) return;
    const newState = produce(projectState, draft => {
        const building = draft.buildings.find(b => b.id === activeBuildingId);
        if (building) {
            const floorIndex = building.floors.findIndex(f => f.id === activeFloorId);
            if (floorIndex !== -1) {
                building.floors[floorIndex] = { ...building.floors[floorIndex], ...updates };
            }
        }
    });
    setProjectState(newState);
  };

  const handleAddDevice = (type: DeviceType) => {
    const activeFloor = getActiveFloor();
    if (!activeFloor) return;
    const newDevice = createDevice(type, 0.5, 0.5, activeFloor.devices);
    const updatedDevices = [...activeFloor.devices, newDevice];
    updateFloorData({ devices: updatedDevices });
    setSelectedItem(newDevice);
  };

  const handleUpdateDevice = (updatedDevice: AnyDevice) => {
    const activeFloor = getActiveFloor();
    if (!activeFloor) return;
    const updatedDevices = activeFloor.devices.map(d => d.id === updatedDevice.id ? updatedDevice : d);
    updateFloorData({ devices: updatedDevices });
    setSelectedItem(updatedDevice);
  };
  
  const handleRemoveDevice = (deviceId: string) => {
    const activeFloor = getActiveFloor();
    if (!activeFloor) return;
    const updatedDevices = activeFloor.devices.filter(d => d.id !== deviceId);
    const updatedConnections = activeFloor.connections.filter(c => c.fromDeviceId !== deviceId && c.toDeviceId !== deviceId);
    updateFloorData({ devices: updatedDevices, connections: updatedConnections });
    setSelectedItem(null);
  };

  const handleDeviceClick = (device: AnyDevice) => {
    if (cablingMode.enabled && cablingMode.fromDeviceId && cablingMode.fromDeviceId !== device.id) {
        handleCreateConnection(cablingMode.fromDeviceId, device.id);
    } else {
        setSelectedItem(device);
    }
  };

  const handleCreateConnection = (fromDeviceId: string, toDeviceId: string) => {
      const activeFloor = getActiveFloor();
      if (!activeFloor) return;
      
      const newConnection: Connection = {
          id: `conn_${Date.now()}`,
          fromDeviceId,
          toDeviceId,
          cableType: cablingMode.cableType,
      };

      const updatedConnections = [...activeFloor.connections, newConnection];
      updateFloorData({ connections: updatedConnections });
      setCablingMode({ enabled: false, fromDeviceId: null, cableType: 'utp-cat6' });
  };
  
  const handleDeviceMove = (deviceId: string, pos: { x: number; y: number }) => {
    const activeFloor = getActiveFloor();
    if (!activeFloor) return;
    const device = activeFloor.devices.find(d => d.id === deviceId);
    if (!device) return;

    const newState = produce(projectState, draft => {
        const floor = draft.buildings.flatMap(b => b.floors).find(f => f.id === activeFloorId);
        if (floor) {
            const deviceToMove = floor.devices.find(d => d.id === deviceId);
            if (deviceToMove) {
                deviceToMove.x = pos.x;
                deviceToMove.y = pos.y;
            }
        }
    });
    setProjectState(newState);
  };
  
    const handleUpdateArchElement = (element: ArchitecturalElement) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;

        const updatedElements = activeFloor.architecturalElements.map(e => 
            e.id === element.id ? element : e
        );
        updateFloorData({ architecturalElements: updatedElements });
        setSelectedItem(element);
    };

    const handleRemoveArchElement = (elementId: string) => {
        const activeFloor = getActiveFloor();
        if (!activeFloor) return;

        const updatedElements = activeFloor.architecturalElements.filter(e => e.id !== elementId);
        updateFloorData({ architecturalElements: updatedElements });
        setSelectedItem(null);
    };

  const handleStartCabling = (deviceId: string, cableType: CableType) => {
    setCablingMode({ enabled: true, fromDeviceId: deviceId, cableType });
    toast({ title: 'Cabling Mode', description: `Select a device to connect to with ${cableType}` });
  };

  const renderSidebarContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="p-4">
             <Card>
                <CardHeader>
                    <CardTitle>Welcome to CCTV Visionary</CardTitle>
                    <CardDescription>Select a tool from the sidebar to begin designing your project.</CardDescription>
                </CardHeader>
             </Card>
          </div>
        );
      case 'devices':
        return (
          <div className="p-4 space-y-4">
            <DevicesToolbar onSelectDevice={handleAddDevice} />
          </div>
        );
      case 'architecture':
        return <div className="p-4"><ArchitectureToolbar selectedTool={null} onSelectTool={(tool: ArchitecturalElementType | null) => console.log('Selected tool:', tool)} /></div>;
      case 'ai':
        return <div className="p-4"><AiAssistant onAnalyze={() => {}} onSuggest={() => {}} onFindCablePaths={() => {}} isAnalyzing={false} isSuggesting={false} isFindingPaths={false} /></div>;
      case 'diagnostics':
        return <div className="p-4"><DiagnosticsPanel diagnostics={[]} onRunDiagnostics={() => {}} isLoading={false} /></div>;
      case 'project':
        return (
          <div className="p-4 space-y-4">
            <ProjectNavigator
              buildings={projectState.buildings}
              activeBuildingId={activeBuildingId}
              activeFloorId={activeFloorId}
              onFloorSelect={(bId, fId) => { setActiveBuildingId(bId); setActiveFloorId(fId); }}
              onAddFloor={(bId) => {}}
              onUpdateBuildingName={(bId, name) => {}}
            />
          </div>
        );
      case 'report':
        return <div className="p-4"><BillOfMaterials project={projectState} /></div>;
      case 'settings':
        return <div className="p-4"><AppSettings onImportDemo={()=>{}} onExportSettings={()=>{}} onImportSettings={()=>{}} onResetSettings={()=>{}} /></div>;
      default:
         return (
          <div className="p-4 space-y-4">
             <ProjectNavigator
              buildings={projectState.buildings}
              activeBuildingId={activeBuildingId}
              activeFloorId={activeFloorId}
              onFloorSelect={(bId, fId) => { setActiveBuildingId(bId); setActiveFloorId(fId); }}
              onAddFloor={(bId) => {}}
              onUpdateBuildingName={(bId, name) => {}}
            />
            <DevicesToolbar onSelectDevice={handleAddDevice} />
          </div>
        );
    }
  };

  const renderPropertiesPanel = () => {
    if (!selectedItem) return null;

    return (
      <PropertiesPanel
        onUpdateDevice={handleUpdateDevice}
        onRemoveDevice={handleRemoveDevice}
        onStartCabling={handleStartCabling}
        onViewRack={() => {}}
        onRemoveArchElement={handleRemoveArchElement}
        onUpdateArchElement={handleUpdateArchElement}
      />
    );
  };
  
  const activeFloorData = getActiveFloor();

  if (!activeFloorData) {
      return (
          <div className="flex h-screen w-screen items-center justify-center bg-background">
              <Card className="w-96">
                  <CardHeader>
                      <CardTitle>No Active Floor</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p>Please select a floor or create a new project.</p>
                      <Button className="mt-4" onClick={() => setProjectState(generateDemoProject())}>Load Demo Project</Button>
                  </CardContent>
              </Card>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-background">
      <IconMenuSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div className={'transition-all duration-300 ' + (isCollapsed ? 'w-0' : 'w-80')}>
        {!isCollapsed && <div className="h-full overflow-y-auto border-r">{renderSidebarContent()}</div>}
      </div>
      <main className="flex-1 relative">
        <PlannerCanvas
          floor={activeFloorData}
          cablingMode={cablingMode}
          onDeviceClick={handleDeviceClick}
          onArchElementClick={(el) => setSelectedItem(el)}
          onCanvasClick={() => setSelectedItem(null)}
          onDeviceMove={handleDeviceMove}
          onDeviceUpdate={handleUpdateDevice}
        />
      </main>
      {selectedItem && (
        <aside className="w-80 border-l bg-background overflow-y-auto">
            {renderPropertiesPanel()}
        </aside>
      )}
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
