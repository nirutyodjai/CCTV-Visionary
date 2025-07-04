'use server';

import { flow } from '@genkit-ai/flow';
import { z } from 'zod';
import { generateLogicalTopologyLayout as generateLayoutFlow } from '@/ai/flows/generate-logical-topology-layout';
import { generateReportLayout as generateReportLayoutFlow } from '@/ai/flows/generate-report-layout';
import { runPlanDiagnostics as runPlanDiagnosticsFlow } from '@/ai/flows/run-plan-diagnostics';
import { findCablePath as findCablePathFlow, CablePathSchema } from '@/ai/flows/find-cable-path';
import { getDeviceDetails as getDeviceDetailsFlow } from '@/ai/flows/get-device-details';


async function safeFlowInvoke(flowName: string, flowToRun: any, inputSchema: z.ZodType<any, any>, input: any) {
    try {
        const result = await flow({
            name: flowName,
            inputSchema: inputSchema,
            outputSchema: z.any(),
            flow: flowToRun,
        }).invoke(input);
        return { success: true, data: result };
    } catch (error) {
        console.error(`Error in ${flowName} action:`, error);
        return { success: false, error: error.message || 'An unexpected error occurred in the AI flow.' };
    }
}

export async function generateLogicalTopologyLayoutAction(input: any) {
    return await safeFlowInvoke('generateLogicalTopologyLayoutFlow', generateLayoutFlow, z.any(), input);
}

export async function generateReportLayoutAction(input: any) {
    return await safeFlowInvoke('generateReportLayoutFlow', generateReportLayoutFlow, z.any(), input);
}

export async function runPlanDiagnosticsAction(plan: any) {
    return await safeFlowInvoke('runPlanDiagnosticsFlow', runPlanDiagnosticsFlow, z.any(), plan);
}

export async function findCablePathAction(input: z.infer<typeof CablePathSchema>) {
    return await safeFlowInvoke('findCablePathFlow', findCablePathFlow, CablePathSchema, input);
}

export async function getDeviceDetails(prevState: any, formData: FormData) {
    // This action uses useFormState, so its return signature is different
    try {
        const parsed = z.object({
            ip: z.string().ip().optional(),
            username: z.string().optional(),
            deviceType: z.enum(['cctv', 'nvr', 'switch']),
        }).safeParse(Object.fromEntries(formData));

        if (!parsed.success) {
            return { success: false, message: 'Invalid input.' };
        }

        const result = await flow({
            name: 'getDeviceDetailsFlow',
            inputSchema: z.any(),
            outputSchema: z.any(),
            flow: getDeviceDetailsFlow,
        }).invoke(parsed.data);

        return { success: true, ...result };

    } catch (error) {
        console.error('Error in getDeviceDetails action:', error);
        return { success: false, message: error.message || 'Failed to connect to the device.' };
    }
}
