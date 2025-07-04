
'use client';

import React, { useReducer, useState, useMemo } from 'react';
import { generateDemoProject } from '@/lib/demo-data';
import type { ProjectState, AnyDevice, CablingMode, Point, ArchitecturalElementType, ArchitecturalElement, Floor, Connection } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlannerCanvas } from '@/components/canvas/planner-canvas';

// This is a minimal set of types to make the component work.
// A full implementation would have more actions.
type Action = 
    | { type: 'LOAD_PROJECT', payload: ProjectState };

const initialState: ProjectState = {
  projectName: 'New CCTV Plan',
  buildings: [],
  vlans: [],
  subnets: [],
};

function projectReducer(state: ProjectState, action: Action): ProjectState {
    switch(action.type) {
        case 'LOAD_PROJECT':
            return action.payload;
        default:
            return state;
    }
}

// In CCTVPlanner component
export function CCTVPlanner() {
  const [projectState, dispatch] = useReducer(projectReducer, initialState);
  const [activeIds, setActiveIds] = useState<{ buildingId: string | null; floorId: string | null }>({ buildingId: null, floorId: null });
  
  const activeBuilding = useMemo(() => projectState.buildings.find(b => b.id === activeIds.buildingId), [projectState.buildings, activeIds.buildingId]);
  const activeFloor = useMemo(() => activeBuilding?.floors.find(f => f.id === activeIds.floorId), [activeBuilding, activeIds.floorId]);

  // Dummy state and handlers to satisfy PlannerCanvas props.
  // In a real app, these would be connected to the reducer and other state.
  const [selectedDevice, setSelectedDevice] = useState<AnyDevice | null>(null);
  const [cablingMode, setCablingMode] = useState<CablingMode>({ enabled: false, fromDeviceId: null });
  const [selectedArchTool, setSelectedArchTool] = useState<ArchitecturalElementType | null>(null);
  const [drawingState, setDrawingState] = useState<{ isDrawing: boolean, startPoint: Point | null }>({ isDrawing: false, startPoint: null });
  const handleUpdateDevice = (device: AnyDevice) => {};
  const handleAddConnection = (conn: Connection) => {};
  const handleAddArchElement = (elem: ArchitecturalElement) => {};
  const handleUpdateFloorPlanRect = (rect: any) => {};


  const handleLoadDemo = () => {
    const demoProject = generateDemoProject();
    dispatch({ type: 'LOAD_PROJECT', payload: demoProject });
    if (demoProject.buildings.length > 0 && demoProject.buildings[0].floors.length > 0) {
        setActiveIds({
            buildingId: demoProject.buildings[0].id,
            floorId: demoProject.buildings[0].floors[0].id
        });
    }
  };
  
  return (
      <main className="flex-1 w-full h-full flex items-center justify-center">
          {projectState.buildings.length === 0 ? (
              <div className="flex-1 w-full h-full flex items-center justify-center bg-muted/20">
                  <div className="text-center space-y-4">
                      <div>
                          <h2 className="text-2xl font-bold">Welcome to CCTV Visionary</h2>
                          <p className="text-muted-foreground">
                              Start by adding a building or load our demo project.
                          </p>
                      </div>
                      <Button onClick={handleLoadDemo}>Load "กรมพัฒนาที่ดิน" Demo Project</Button>
                  </div>
              </div>
          ) : activeFloor ? (
              <PlannerCanvas 
                floor={activeFloor} 
                selectedDevice={selectedDevice} 
                onSelectDevice={setSelectedDevice} 
                onUpdateDevice={handleUpdateDevice}
                onCanvasClick={() => {}}
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
                      <p className="text-muted-foreground">Please select a floor from the Project Navigator.</p>
                  </div>
              </div>
          )}
      </main>
  );
}
