import { action } from '@genkit-ai/core';
import { z } from 'zod';
import { geminiPro } from '@genkit-ai/googleai';
import { generate } from '@genkit-ai/ai';

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

const PlanSchema = z.object({
  devices: z.array(DeviceInfoSchema),
  connections: z.array(ConnectionInfoSchema),
});

const DiagnosticResultSchema = z.object({
  diagnostics: z.array(z.object({
    severity: z.enum(['error', 'warning', 'info']),
    message: z.string(),
    relatedDevices: z.array(z.string()),
  })),
});

export const runPlanDiagnostics = action(
  {
    name: 'runPlanDiagnostics',
    inputSchema: PlanSchema,
    outputSchema: DiagnosticResultSchema,
  },
  async (plan) => {
    const prompt = `
      You are a world-class senior systems engineer reviewing a network and CCTV plan.
      Your task is to identify potential issues, errors, and provide recommendations for improvement.

      Here is the plan data:
      Devices: ${JSON.stringify(plan.devices, null, 2)}
      Connections: ${JSON.stringify(plan.connections, null, 2)}

      Analyze the plan and check for the following issues:
      1.  **NVR Channel Limits:** Check if any NVR has more cameras connected to it than its 'channels' property allows.
      2.  **Switch Port Limits:** Check if any Switch has more devices connected to it than its 'ports' property allows.
      3.  **Connectivity Issues:** Identify any devices that are not connected to anything.
      4.  **General Recommendations:** Provide any other useful advice, like suggesting a central switch if many devices are daisy-chained.

      Your response MUST be a valid JSON object that conforms to this structure:
      {
        "diagnostics": [
          {
            "severity": "error" | "warning" | "info",
            "message": "A clear description of the issue or recommendation.",
            "relatedDevices": ["device_id_1", "device_id_2"]
          }
        ]
      }
      
      - Use 'error' for critical issues like resource limits being exceeded.
      - Use 'warning' for potential problems or un-connected devices.
      - Use 'info' for general recommendations.
    `;

    const llmResponse = await generate({
      model: geminiPro,
      prompt,
      config: { temperature: 0.2 },
    });

    try {
      return JSON.parse(llmResponse.text());
    } catch (e) {
      console.error("Failed to parse diagnostics response:", e);
      return {
        diagnostics: [{
          severity: 'error',
          message: 'Failed to run AI diagnostics. The response was not valid JSON.',
          relatedDevices: [],
        }],
      };
    }
  }
);
