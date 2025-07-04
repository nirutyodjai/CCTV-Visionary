'use client';
import { useState, useReducer, useCallback } from 'react';
import {
  SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { PlanManagement } from './sidebar/plan-management';
import { BuildingSetup } from './sidebar/building-setup';
import { FloorPlanUpload } from './sidebar/floor-plan-upload';
import { DevicesToolbar } from './sidebar/devices-toolbar';
import { PropertiesPanel } from './sidebar/properties-panel';
import { BillOfMaterials } from './sidebar/bill-of-materials';
import { AiAssistant } from './sidebar/ai-assistant';
import { PlannerCanvas } from './canvas/planner-canvas';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import type { Device, DeviceType, PlanState, PlacementSuggestion } from '@/lib/types';
import { createDevice } from '@/lib/device-config';
import { analyzePlanAction, suggestPlacementsAction } from '@/app/actions';

type UiState = {
  selectedDeviceToAdd: DeviceType | null;
  selectedDeviceId: string | null;
  isLoading: false | 'analyzing' | 'suggesting';
  modalContent: { title: string; content: React.ReactNode } | null;
};

type Action =
  | { type: 'SET_TOTAL_FLOORS'; payload: number }
  | { type: 'SET_CURRENT_FLOOR'; payload: number }
  | { type: 'SET_PLAN_NAME'; payload: string }
  | { type: 'ADD_DEVICE'; payload: { floor: number; device: Device } }
  | { type: 'UPDATE_DEVICE'; payload: { floor: number; device: Device } }
  | { type: 'DELETE_DEVICE'; payload: { floor: number; deviceId: string } }
  | { type: 'SET_FLOOR_PLAN'; payload: { floor: number; dataUrl: string | null } }
  | { type: 'ADD_SUGGESTIONS'; payload: { floor: number; suggestions: PlacementSuggestion[] } };

const initialState: PlanState = {
  planName: 'แผนที่ไม่มีชื่อ',
  totalFloors: 1,
  currentFloor: 1,
  devicesByFloor: {},
  floorPlansByFloor: {},
};

function planReducer(state: PlanState, action: Action): PlanState {
  switch (action.type) {
    case 'SET_TOTAL_FLOORS':
      return { ...state, totalFloors: action.payload };
    case 'SET_CURRENT_FLOOR':
      return { ...state, currentFloor: action.payload };
    case 'SET_PLAN_NAME':
      return { ...state, planName: action.payload };
    case 'ADD_DEVICE': {
      const { floor, device } = action.payload;
      const devices = state.devicesByFloor[floor] ? [...state.devicesByFloor[floor], device] : [device];
      return { ...state, devicesByFloor: { ...state.devicesByFloor, [floor]: devices } };
    }
    case 'UPDATE_DEVICE': {
      const { floor, device } = action.payload;
      const devices = state.devicesByFloor[floor].map(d => d.id === device.id ? device : d);
      return { ...state, devicesByFloor: { ...state.devicesByFloor, [floor]: devices } };
    }
    case 'DELETE_DEVICE': {
      const { floor, deviceId } = action.payload;
      const devices = state.devicesByFloor[floor].filter(d => d.id !== deviceId);
      return { ...state, devicesByFloor: { ...state.devicesByFloor, [floor]: devices } };
    }
    case 'SET_FLOOR_PLAN': {
        const { floor, dataUrl } = action.payload;
        return { ...state, floorPlansByFloor: { ...state.floorPlansByFloor, [floor]: dataUrl } };
    }
    case 'ADD_SUGGESTIONS': {
      const { floor, suggestions } = action.payload;
      const existingDevices = state.devicesByFloor[floor] || [];
      const newDevices = suggestions.map(s => createDevice(s.type, s.x, s.y, existingDevices));
      return { ...state, devicesByFloor: { ...state.devicesByFloor, [floor]: [...existingDevices, ...newDevices] } };
    }
    default:
      return state;
  }
}

export function CCTVPlanner() {
  const [planState, dispatch] = useReducer(planReducer, initialState);
  const [uiState, setUiState] = useState<UiState>({
    selectedDeviceToAdd: null,
    selectedDeviceId: null,
    isLoading: false,
    modalContent: null,
  });
  const { toast } = useToast();

  const currentDevices = planState.devicesByFloor[planState.currentFloor] || [];
  const selectedDevice = currentDevices.find(d => d.id === uiState.selectedDeviceId) || null;

  const handleSelectDeviceToAdd = (type: DeviceType) => {
    setUiState(s => ({ ...s, selectedDeviceToAdd: type, selectedDeviceId: null }));
  };

  const handleAddDevice = (type: DeviceType, x: number, y: number) => {
    const newDevice = createDevice(type, x, y, currentDevices);
    dispatch({ type: 'ADD_DEVICE', payload: { floor: planState.currentFloor, device: newDevice } });
    setUiState(s => ({ ...s, selectedDeviceToAdd: null, selectedDeviceId: newDevice.id }));
  };
  
  const handleUpdateDevice = (device: Device) => {
    dispatch({ type: 'UPDATE_DEVICE', payload: { floor: planState.currentFloor, device } });
  };
  
  const handleDeleteDevice = (deviceId: string) => {
    dispatch({ type: 'DELETE_DEVICE', payload: { floor: planState.currentFloor, deviceId } });
    setUiState(s => ({ ...s, selectedDeviceId: null }));
  };
  
  const handleSelectDevice = (device: Device | null) => {
    setUiState(s => ({ ...s, selectedDeviceId: device?.id || null, selectedDeviceToAdd: null }));
  };

  const handleFloorPlanUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        dispatch({ type: 'SET_FLOOR_PLAN', payload: { floor: planState.currentFloor, dataUrl: event.target.result as string }});
      }
    };
    reader.readAsDataURL(file);
  };
  
  const handleAnalyze = async () => {
    setUiState(s => ({ ...s, isLoading: 'analyzing', modalContent: { title: '✨ กำลังวิเคราะห์แผนของคุณ...', content: <div className="spinner mx-auto" /> } }));
    const allDevices = Object.values(planState.devicesByFloor).flat();
    const result = await analyzePlanAction({ devices: allDevices, totalFloors: planState.totalFloors });
    if(result.analysis) {
        setUiState(s => ({ ...s, isLoading: false, modalContent: { title: '✨ ผลการวิเคราะห์แผนโดย AI', content: <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.analysis}</p> }}));
    } else {
        setUiState(s => ({...s, isLoading: false, modalContent: null }));
        toast({ variant: 'destructive', title: 'ข้อผิดพลาด', description: result.error });
    }
  };

  const handleSuggest = async () => {
    const floorPlan = planState.floorPlansByFloor[planState.currentFloor];
    if (!floorPlan) {
      toast({ variant: 'destructive', title: 'ข้อผิดพลาด', description: `กรุณาอัปโหลดรูปภาพแบบแปลนสำหรับชั้น ${planState.currentFloor} ก่อน` });
      return;
    }
    setUiState(s => ({ ...s, isLoading: 'suggesting', modalContent: { title: '✨ กำลังสร้างคำแนะนำ...', content: <div className="spinner mx-auto" /> }}));
    const result = await suggestPlacementsAction({ floorPlanDataUri: floorPlan });
    if (result.suggestions) {
      dispatch({ type: 'ADD_SUGGESTIONS', payload: { floor: planState.currentFloor, suggestions: result.suggestions }});
      setUiState(s => ({ ...s, isLoading: false, modalContent: null }));
      toast({ title: 'สำเร็จ', description: 'เพิ่มคำแนะนำการติดตั้งจาก AI เรียบร้อยแล้ว' });
    } else {
      setUiState(s => ({...s, isLoading: false, modalContent: null }));
      toast({ variant: 'destructive', title: 'ข้อผิดพลาด', description: result.error });
    }
  };

  return (
    <SidebarProvider>
      <Sidebar className="p-0 border-r" collapsible="icon">
        <SidebarHeader className="p-2">
            <h1 className="text-xl font-bold p-2 text-foreground group-data-[collapsible=icon]:hidden">CCTV Visionary</h1>
            <h1 className="text-xl font-bold p-2 text-foreground hidden group-data-[collapsible=icon]:block">CV</h1>
        </SidebarHeader>
        <SidebarContent className="p-2 space-y-4">
          {/* <PlanManagement planName={planState.planName} onPlanNameChange={name => dispatch({type: 'SET_PLAN_NAME', payload: name})} /> */}
          <BuildingSetup 
            totalFloors={planState.totalFloors}
            currentFloor={planState.currentFloor}
            onTotalFloorsChange={val => dispatch({type: 'SET_TOTAL_FLOORS', payload: val})}
            onCurrentFloorChange={val => dispatch({type: 'SET_CURRENT_FLOOR', payload: val})}
          />
          <AiAssistant onAnalyze={handleAnalyze} onSuggest={handleSuggest} isAnalyzing={uiState.isLoading === 'analyzing'} isSuggesting={uiState.isLoading === 'suggesting'} />
          <FloorPlanUpload currentFloor={planState.currentFloor} onUpload={handleFloorPlanUpload} />
          <DevicesToolbar selectedDeviceToAdd={uiState.selectedDeviceToAdd} onSelectDevice={handleSelectDeviceToAdd} />
          <PropertiesPanel selectedDevice={selectedDevice} onUpdateDevice={handleUpdateDevice} onDeleteDevice={handleDeleteDevice} />
          <BillOfMaterials devicesByFloor={planState.devicesByFloor} />
        </SidebarContent>
        <SidebarFooter/>
      </Sidebar>
      <main className="flex-1 flex flex-col h-screen">
        <header className="lg:hidden flex items-center justify-between p-2 border-b">
          <SidebarTrigger>
            <Menu />
          </SidebarTrigger>
          <h1 className="text-lg font-bold">ชั้น {planState.currentFloor}</h1>
          <div className="w-8"></div>
        </header>
        <PlannerCanvas
          currentFloor={planState.currentFloor}
          devices={currentDevices}
          floorPlan={planState.floorPlansByFloor[planState.currentFloor]}
          selectedDevice={selectedDevice}
          selectedDeviceToAdd={uiState.selectedDeviceToAdd}
          onAddDevice={handleAddDevice}
          onSelectDevice={handleSelectDevice}
          onUpdateDevice={handleUpdateDevice}
        />
      </main>
      <Dialog open={!!uiState.modalContent} onOpenChange={(isOpen) => !isOpen && setUiState(s => ({ ...s, modalContent: null, isLoading: false }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{uiState.modalContent?.title}</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="max-h-[60vh] overflow-y-auto pr-4">
              {uiState.modalContent?.content}
            </div>
          </DialogDescription>
          <DialogFooter>
            {uiState.isLoading === false && (
              <Button onClick={() => setUiState(s => ({...s, modalContent: null}))}>ปิด</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
