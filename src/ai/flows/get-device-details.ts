'use server';
/**
 * @fileOverview Simulates fetching detailed status from a network device.
 *
 * - getDeviceDetails - A function that generates plausible status data for a given device.
 * - DeviceInfo - The input type for the getDeviceDetails function.
 * - DeviceDetails - The output type for the getDeviceDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DeviceInfoSchema = z.object({
  ip: z.string().ip().optional().describe('The IP address of the device'),
  username: z.string().optional().describe('The username for the device'),
  deviceType: z.enum(['cctv-dome', 'cctv-bullet', 'cctv-ptz', 'nvr', 'switch']).describe('The type of device'),
});
export type DeviceInfo = z.infer<typeof DeviceInfoSchema>;

const DeviceDetailsSchema = z.object({
    success: z.boolean(),
    status: z.string().optional(),
    details: z.record(z.any()).optional(),
    message: z.string().optional(),
});
export type DeviceDetails = z.infer<typeof DeviceDetailsSchema>;


export async function getDeviceDetails(deviceInfo: DeviceInfo): Promise<DeviceDetails> {
    return getDeviceDetailsFlow(deviceInfo);
}

const getDeviceDetailsPrompt = ai.definePrompt({
    name: 'getDeviceDetailsPrompt',
    input: { schema: DeviceInfoSchema },
    output: { schema: z.object({
        status: z.string(),
        details: z.record(z.any()),
    }) },
    prompt: `
        Simulate a response from a {{deviceType}} device at IP {{ip}}.
        Generate realistic but fictional status details.
        - For a 'cctv-dome', 'cctv-bullet', or 'cctv-ptz', include status (e.g., Online, Offline), stream_url, resolution, and current_fps.
        - For an 'nvr', include status, available_channels, used_channels, and storage_capacity, used_storage.
        - For a 'switch', include status, port_count, and a list of active_ports with their speed (e.g., 1Gbps).
        The output should be a JSON object.
    `,
});

const getDeviceDetailsFlow = ai.defineFlow({
    name: 'getDeviceDetailsFlow',
    inputSchema: DeviceInfoSchema,
    outputSchema: DeviceDetailsSchema,
}, async (deviceInfo) => {
    // In a real scenario, this would use device-specific APIs (e.g., ONVIF, SNMP).
    // Here, we simulate the connection with an LLM.
    try {
        const { output } = await getDeviceDetailsPrompt(deviceInfo);
        return {
            success: true,
            ...output!,
        };
    } catch (error) {
        console.error('Error in getDeviceDetails flow:', error);
        return {
            success: false,
            message: 'Failed to simulate device connection.',
        };
    }
});
