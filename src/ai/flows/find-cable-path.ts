'use server';
/**
 * @fileOverview Finds the optimal path for a cable on a 2D floor plan.
 *
 * - findCablePath - A function that calculates the route for a cable between two points, avoiding obstacles.
 * - CablePathInput - The input type for the findCablePath function.
 * - CablePathOutput - The return type for the findCablePath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PointSchema = z.object({x: z.number(), y: z.number()});

const ObstacleSchema = z.object({
  id: z.string(),
  type: z.string(),
  start: PointSchema,
  end: PointSchema,
});

export const CablePathInputSchema = z.object({
  startPoint: PointSchema,
  endPoint: PointSchema,
  obstacles: z.array(ObstacleSchema),
  gridSize: z.object({width: z.number(), height: z.number()}),
});
export type CablePathInput = z.infer<typeof CablePathInputSchema>;

export const CablePathOutputSchema = z.object({
  path: z.array(PointSchema),
});
export type CablePathOutput = z.infer<typeof CablePathOutputSchema>;

export async function findCablePath(input: CablePathInput): Promise<CablePathOutput> {
  return findCablePathFlow(input);
}

const findCablePathPrompt = ai.definePrompt({
  name: 'findCablePathPrompt',
  input: {schema: CablePathInputSchema},
  output: {schema: CablePathOutputSchema},
  prompt: `You are an expert system engineer designing a cable layout for a building.
Your task is to find the most efficient and logical path for a cable between two points on a 2D grid, while avoiding obstacles.

The grid size is {{{gridSize.width}}}x{{{gridSize.height}}}.
The starting point is at ({{{startPoint.x}}}, {{{startPoint.y}}}).
The ending point is at ({{{endPoint.x}}}, {{{endPoint.y}}}).

The obstacles are defined as lines. You must not cross these lines. The obstacles are:
{{#each obstacles}}
- A {{this.type}} from ({{this.start.x}}, {{this.start.y}}) to ({{this.end.x}}, {{this.end.y}})
{{/each}}

Rules for pathfinding:
1. The path must consist of a series of connected points.
2. The path should primarily consist of horizontal and vertical segments.
3. The path should run parallel to the main axes and obstacles (walls). Avoid diagonal lines unless absolutely necessary for short connections.
4. The path must not intersect any of the provided obstacle lines.
5. The final output must be a valid JSON object. The first point must be the startPoint and the last point must be the endPoint.
6. The path should be the shortest possible route adhering to these rules.
`,
});

const findCablePathFlow = ai.defineFlow(
  {
    name: 'findCablePathFlow',
    inputSchema: CablePathInputSchema,
    outputSchema: CablePathOutputSchema,
  },
  async (input: CablePathInput) => {
    try {
      const {output} = await findCablePathPrompt(input);
      if (output?.path && output.path.length > 0) {
        return output;
      }
      throw new Error('AI response did not contain a valid path.');
    } catch (error) {
      console.error('Failed to get cable path from AI, returning fallback.', error);
      // Fallback to a direct line if AI fails
      return {path: [input.startPoint, input.endPoint]};
    }
  },
);
