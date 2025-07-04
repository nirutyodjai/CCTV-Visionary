'use server';
/**
 * @fileOverview Generates a 2D layout for a network topology diagram.
 *
 * - generateLogicalTopologyLayout - A function that arranges device nodes for clear visualization.
 * - LayoutInputSchema - The input type for the generateLogicalTopologyLayout function.
 * - LayoutOutputSchema - The return type for the generateLogicalTopologyLayout function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const DeviceNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.string(),
});

const ConnectionEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
});

export const LayoutInputSchema = z.object({
  devices: z.array(DeviceNodeSchema),
  connections: z.array(ConnectionEdgeSchema),
});
export type LayoutInput = z.infer<typeof LayoutInputSchema>;

const PointSchema = z.object({ x: z.number(), y: z.number() });

export const LayoutOutputSchema = z.object({
  positions: z.record(z.string(), PointSchema), // Record<deviceId, {x, y}>
});
export type LayoutOutput = z.infer<typeof LayoutOutputSchema>;


export async function generateLogicalTopologyLayout(input: LayoutInput): Promise<LayoutOutput> {
    return generateLogicalTopologyLayoutFlow(input);
}

const generateLayoutPrompt = ai.definePrompt({
    name: 'generateLayoutPrompt',
    input: { schema: LayoutInputSchema },
    output: { schema: LayoutOutputSchema },
    prompt: `
      You are an expert in graph visualization. Your task is to generate a 2D layout for a network topology diagram.
      Arrange the nodes (devices) on a 1000x1000 canvas so that the diagram is clean, easy to read, and has minimal edge (connection) crossings.

      Here is the network graph data:
      Nodes (Devices): {{{json devices}}}
      Edges (Connections): {{{json connections}}}

      Rules:
      1.  Create a hierarchical layout. Core devices like NVRs and main Switches should be at the top or center.
      2.  Edge devices like cameras should be grouped around the switch they connect to.
      3.  Spread the nodes out to avoid clutter.
      4.  The output MUST be a valid JSON object with a single key "positions".
      5.  The "positions" value must be an object where each key is a device ID from the input, and its value is an object with "x" and "y" coordinates (between 0 and 1000).

      Example Response:
      {
        "positions": {
          "nvr-1": { "x": 500, "y": 100 },
          "switch-1": { "x": 500, "y": 300 },
          "cam-1": { "x": 200, "y": 500 },
          "cam-2": { "x": 800, "y": 500 }
        }
      }
    `,
});


const generateLogicalTopologyLayoutFlow = ai.defineFlow(
  {
    name: 'generateLogicalTopologyLayoutFlow',
    inputSchema: LayoutInputSchema,
    outputSchema: LayoutOutputSchema,
  },
  async (input) => {
    try {
        const { output } = await generateLayoutPrompt(input);
        return output!;
    } catch(e) {
        console.error("Failed to parse layout response, generating random layout:", e);
        const positions: Record<string, { x: number; y: number }> = {};
        input.devices.forEach(d => {
            positions[d.id] = { x: Math.random() * 1000, y: Math.random() * 1000 };
        });
        return { positions };
    }
  }
);
