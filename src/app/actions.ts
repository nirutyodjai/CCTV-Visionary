'use server';

import { analyzeCctvPlan as analyzeCctvPlanFlow, type AnalyzeCctvPlanInput, type AnalyzeCctvPlanOutput } from '@/ai/flows/analyze-cctv-plan';
import { suggestDevicePlacements as suggestDevicePlacementsFlow, type SuggestDevicePlacementsInput, type SuggestDevicePlacementsOutput } from '@/ai/flows/suggest-device-placements';
import { findCablePath as findCablePathFlow, type CablePathInput, type CablePathOutput } from '@/ai/flows/find-cable-path';
import { generateLogicalTopologyLayout as generateLogicalTopologyLayoutFlow, type LayoutInput, type LayoutOutput } from '@/ai/flows/generate-logical-topology-layout';
import { generateReportLayout as generateReportLayoutFlow, type ReportInfo, type ReportLayout } from '@/ai/flows/generate-report-layout';
import { getDeviceDetails as getDeviceDetailsFlow, type DeviceInfo, type DeviceDetails } from '@/ai/flows/get-device-details';
import { runPlanDiagnostics as runPlanDiagnosticsFlow, type Plan, type DiagnosticResult } from '@/ai/flows/run-plan-diagnostics';
import type { ProjectState } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc, setDoc, getDoc } from 'firebase/firestore';


// Helper to wrap flow calls for consistent error handling
async function safeFlowCall<TInput, TOutput>(
  flowName: string,
  flow: (input: TInput) => Promise<TOutput>,
  input: TInput
): Promise<{ success: true; data: TOutput } | { success: false; error: string }> {
    try {
        const result = await flow(input);
        return { success: true, data: result };
    } catch (error: any) {
        console.error(`Error in ${flowName} action:`, error);
        return { success: false, error: error.message || `An unexpected error occurred in ${flowName}.` };
    }
}

// Exported Server Actions
export async function analyzeCctvPlanAction(input: AnalyzeCctvPlanInput) {
    return safeFlowCall('analyzeCctvPlan', analyzeCctvPlanFlow, input);
}

export async function suggestDevicePlacementsAction(input: SuggestDevicePlacementsInput) {
    return safeFlowCall('suggestDevicePlacements', suggestDevicePlacementsFlow, input);
}

export async function findCablePathAction(input: CablePathInput) {
    return safeFlowCall('findCablePath', findCablePathFlow, input);
}

export async function generateLogicalTopologyLayoutAction(input: LayoutInput) {
    return safeFlowCall('generateLogicalTopologyLayout', generateLogicalTopologyLayoutFlow, input);
}

export async function generateReportLayoutAction(input: ReportInfo) {
    return safeFlowCall('generateReportLayout', generateReportLayoutFlow, input);
}

export async function getDeviceDetailsAction(input: DeviceInfo) {
     return safeFlowCall('getDeviceDetails', getDeviceDetailsFlow, input);
}

export async function runPlanDiagnosticsAction(plan: Plan) {
    return safeFlowCall('runPlanDiagnostics', runPlanDiagnosticsFlow, plan);
}


// Project Management Actions
export async function listProjectsAction(): Promise<{ success: true; data: Pick<ProjectState, 'id' | 'projectName'>[] } | { success: false; error: string }> {
    try {
        const projectsCol = collection(db, 'projects');
        const projectSnapshot = await getDocs(projectsCol);
        const projectList = projectSnapshot.docs.map(doc => ({
            id: doc.id,
            projectName: doc.data().projectName || 'Untitled Project'
        }));
        return { success: true, data: projectList };
    } catch (error: any) {
        console.error(`Error in listProjectsAction:`, error);
        return { success: false, error: error.message || `An unexpected error occurred.` };
    }
}

export async function saveProjectAction(projectState: ProjectState): Promise<{ success: true; } | { success: false; error: string }> {
    try {
        const projectRef = doc(db, "projects", projectState.id);
        await setDoc(projectRef, projectState);
        return { success: true };
    } catch (error: any) {
        console.error(`Error in saveProjectAction:`, error);
        return { success: false, error: error.message || `An unexpected error occurred.` };
    }
}

export async function loadProjectAction(projectId: string): Promise<{ success: true; data: ProjectState } | { success: false; error: string }> {
    try {
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);
        if (!projectSnap.exists()) {
            return { success: false, error: "Project not found." };
        }
        return { success: true, data: projectSnap.data() as ProjectState };
    } catch (error: any) {
        console.error(`Error in loadProjectAction:`, error);
        return { success: false, error: error.message || `An unexpected error occurred.` };
    }
}

export async function deleteProjectAction(projectId: string): Promise<{ success: true } | { success: false; error: string }> {
    try {
        await deleteDoc(doc(db, "projects", projectId));
        return { success: true };
    } catch (error: any) {
        console.error(`Error in deleteProjectAction:`, error);
        return { success: false, error: error.message || `An unexpected error occurred.` };
    }
}

export async function updateProjectNameAction(projectId: string, newName: string): Promise<{ success: true } | { success: false; error: string }> {
    try {
        const projectRef = doc(db, "projects", projectId);
        await updateDoc(projectRef, {
            projectName: newName
        });
        return { success: true };
    } catch (error: any) {
        console.error(`Error in updateProjectNameAction:`, error);
        return { success: false, error: error.message || `An unexpected error occurred.` };
    }
}
