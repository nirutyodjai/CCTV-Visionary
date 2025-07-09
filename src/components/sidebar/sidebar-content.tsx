import { CalibrationManager } from './calibration-manager';
import { CalibrationData } from '@/lib/calibration';
import { PlanManagement } from './plan-management';
import { ProjectManager } from './project-manager';
import { NetworkSettings } from './network-settings';
import { BillOfMaterials } from './bill-of-materials';
import { FloorPlanUploadAdvanced } from './floor-plan-upload-advanced';
import type { Floor, VLAN, Subnet } from '@/lib/types';

interface SidebarContentProps {
  activeView: string;
  floor: Floor;
  onCloseSheet: () => void;
  currentCalibration?: CalibrationData;
  onCalibrationUpdate?: (calibrationData: CalibrationData) => void;
  planName?: string;
  isSaving?: boolean;
  onPlanNameChange?: (name: string) => void;
  onSave?: () => void;
  onOpenManager?: () => void;
  onExport?: () => void;
  project?: any;
  vlans?: VLAN[];
  subnets?: Subnet[];
  onAddVlan?: (vlan: Omit<VLAN, 'id'>) => void;
  onAddSubnet?: (subnet: Omit<Subnet, 'id'>) => void;
  onDeleteVlan?: (id: string) => void;
  onDeleteSubnet?: (id: string) => void;
  onTestConnection?: () => Promise<boolean>;
  onFloorPlanUpload?: (file: File, metadata: any) => void;
  currentFloorPlan?: string;
}

export function SidebarContent({ 
  activeView, 
  floor, 
  onCloseSheet,
  currentCalibration,
  onCalibrationUpdate,
  planName,
  isSaving,
  onPlanNameChange,
  onSave,
  onOpenManager,
  onExport,
  project,
  vlans,
  subnets,
  onAddVlan,
  onAddSubnet,
  onDeleteVlan,
  onDeleteSubnet,
  onTestConnection,
  onFloorPlanUpload,
  currentFloorPlan
}: SidebarContentProps) {
  
  if (activeView === 'calibration') {
    return (
      <CalibrationManager
        floor={floor}
        devices={floor?.devices || []}
        connections={floor?.connections || []}
        onCalibrationUpdate={onCalibrationUpdate || (() => {})}
        currentCalibration={currentCalibration}
      />
    );
  }

  if (activeView === 'plan-management' && onPlanNameChange && onSave && onOpenManager) {
    return (
      <PlanManagement
        planName={planName || ''}
        isSaving={isSaving || false}
        onPlanNameChange={onPlanNameChange}
        onSave={onSave}
        onOpenManager={onOpenManager}
        onExport={onExport}
      />
    );
  }

  if (activeView === 'project-manager') {
    return (
      <ProjectManager
        isOpen={true}
        onClose={onCloseSheet}
        onLoadProject={() => {}}
        currentProjectId={''}
      />
    );
  }

  if (activeView === 'network-settings' && vlans && subnets && onAddVlan && onAddSubnet) {
    return (
      <NetworkSettings
        vlans={vlans}
        subnets={subnets}
        onAddVlan={onAddVlan}
        onAddSubnet={onAddSubnet}
        onDeleteVlan={onDeleteVlan}
        onDeleteSubnet={onDeleteSubnet}
        onTestConnection={onTestConnection}
      />
    );
  }

  if (activeView === 'bom' && project) {
    return (
      <BillOfMaterials project={project} />
    );
  }

  if (activeView === 'floor-plan' && onFloorPlanUpload) {
    return (
      <FloorPlanUploadAdvanced
        onUpload={onFloorPlanUpload}
        currentFloorPlan={currentFloorPlan}
      />
    );
  }

  return null;
}