import { action } from '@genkit-ai/core';
import { z } from 'zod';
import { geminiPro } from '@genkit-ai/googleai';
import {
  generatePrompt,
  generateOutputSchema,
} from 'genkitx-zod';

export const DeviceInfoSchema = z.object({
  ip: z.string().ip().optional().describe('The IP address of the device'),
  username: z.string().optional().describe('The username for the device'),
  deviceType: z.enum(['cctv', 'nvr', 'switch']).describe('The type of device'),
});

export const getDeviceDetails = action(
  {
    name: 'getDeviceDetails',
    inputSchema: DeviceInfoSchema,
    outputSchema: z.any(),
  },
  async (deviceInfo) => {
    // In a real scenario, you would use device-specific APIs or protocols
    // (e.g., ONVIF for CCTV, SNMP for switches) to connect to the device.
    // Here, we'll simulate this by generating plausible data with an LLM.

    const prompt = generatePrompt({
      prompt: `Simulate a response from a ${deviceInfo.deviceType} device at IP ${deviceInfo.ip}.
        Generate realistic but fictional status details.
        - For a 'cctv', include status (e.g., Online, Offline), stream_url, resolution, and current_fps.
        - For an 'nvr', include status, available_channels, used_channels, and storage_capacity, used_storage.
        - For a 'switch', include status, port_count, and a list of active_ports with their speed (e.g., 1Gbps).
        The output should be a JSON object.`,
      schema: z.object({
        status: z.string(),
        details: z.record(z.any()),
      }),
    });

    const llmResponse = await generate({
      model: geminiPro,
      prompt: prompt.prompt,
      config: {
        temperature: 0.8
      },
    });

    try {
      const simulatedData = JSON.parse(llmResponse.text());
      return {
        success: true,
        ...simulatedData,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to simulate device connection.',
      };
    }
  }
);
