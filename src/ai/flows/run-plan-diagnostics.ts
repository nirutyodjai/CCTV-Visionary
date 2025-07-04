'use server';
/**
 * @fileOverview Reviews a network and CCTV plan for potential issues and provides recommendations.
 *
 * - runPlanDiagnostics - A function that analyzes a plan for errors and warnings.
 * - PlanSchema - The input type for the runPlanDiagnostics function.
 * - DiagnosticResultSchema - The return type for the runPlanDiagnostics function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DeviceInfoSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
  channels: z.number().optional(),
  ports: z.number().optional(),
});

const ConnectionInfoSchema = z.object({
  fromDeviceId: z.string(),
  toDeviceId: z.string(),
});

export const PlanSchema = z.object({
  devices: z.array(DeviceInfoSchema),
  connections: z.array(ConnectionInfoSchema),
});
export type Plan = z.infer<typeof PlanSchema>;


export const DiagnosticResultSchema = z.object({
  diagnostics: z.array(z.object({
    severity: z.enum(['error', 'warning', 'info']),
    message: z.string(),
    relatedDevices: z.array(z.string()),
  })),
});
export type DiagnosticResult = z.infer<typeof DiagnosticResultSchema>;


export async function runPlanDiagnostics(plan: Plan): Promise<DiagnosticResult> {
    return runPlanDiagnosticsFlow(plan);
}


const runPlanDiagnosticsPrompt = ai.definePrompt({
    name: 'runPlanDiagnosticsPrompt',
    input: { schema: PlanSchema },
    output: { schema: DiagnosticResultSchema },
    prompt: `
      You are a world-class senior systems engineer reviewing a network and CCTV plan.
      Your task is to identify potential issues, errors, and provide recommendations for improvement.

      Here is the plan data:
      Devices: {{{json devices}}}
      Connections: {{{json connections}}}

      Analyze the plan and check for the following issues:
      1.  **NVR Channel Limits:** Check if any NVR has more cameras connected to it than its 'channels' property allows. An NVR is connected to cameras via a switch.
      2.  **Switch Port Limits:** Check if any Switch has more devices connected to it than its 'ports' property allows.
      3.  **Connectivity Issues:** Identify any devices that are not connected to anything. Ignore top-level devices like NVRs if they are connected to a switch.
      4.  **General Recommendations:** Provide any other useful advice, like suggesting a central switch if many devices are daisy-chained, or checking for PoE budget if not specified.

      Your response MUST be a valid JSON object that conforms to the specified output schema.
      - Use 'error' for critical issues like resource limits being exceeded.
      - Use 'warning' for potential problems or un-connected devices.
      - Use 'info' for general recommendations.
    `,
});


const runPlanDiagnosticsFlow = ai.defineFlow(
  {
    name: 'runPlanDiagnosticsFlow',
    inputSchema: PlanSchema,
    outputSchema: DiagnosticResultSchema,
  },
  async (plan) => {
    try {
        const { output } = await runPlanDiagnosticsPrompt(plan);
        return output!;
    } catch (e) {
      console.error("Failed to parse diagnostics response:", e);
      return {
        diagnostics: [{
          severity: 'error',
          message: 'Failed to run AI diagnostics. The AI response was not in the expected format.',
          relatedDevices: [],
        }],
      };
    }
  }
);
