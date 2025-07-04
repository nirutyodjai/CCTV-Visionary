import { action } from '@genkit-ai/core';
import { z } from 'zod';
import { geminiPro } from '@genkit-ai/googleai';
import { generate } from '@genkit-ai/ai';

export const GRID_SIZE = 100;

const PointSchema = z.object({
  x: z.number().int().min(0).max(GRID_SIZE),
  y: z.number().int().min(0).max(GRID_SIZE),
});

const WallSchema = z.object({
  startX: z.number().int(),
  startY: z.number().int(),
  endX: z.number().int(),
  endY: z.number().int(),
});

export const CablePathSchema = z.object({
  start: PointSchema,
  end: PointSchema,
  walls: z.array(WallSchema),
});

export const findCablePath = action(
  {
    name: 'findCablePath',
    inputSchema: CablePathSchema,
    outputSchema: z.object({ path: z.array(PointSchema) }),
  },
  async ({ start, end, walls }) => {
    const prompt = `
      You are an expert network and CCTV installer. Your task is to find the most realistic and efficient path 
      for a cable between two points on a ${GRID_SIZE}x${GRID_SIZE} grid, avoiding obstacles.

      Start Point: (${start.x}, ${start.y})
      End Point: (${end.x}, ${end.y})

      Obstacles (Walls):
      ${walls.map(w => `- Wall from (${w.startX}, ${w.startY}) to (${w.endX}, ${w.endY})`).join('
')}

      Rules:
      1. The path consists of a sequence of (x, y) coordinates.
      2. The primary goal is to run the cable along the walls whenever possible. This is more realistic than crossing open spaces.
      3. Movement is cardinal (horizontal/vertical only).
      4. The path MUST NOT intersect any walls.
      5. The path should be as short as possible, while still following the primary goal of hugging the walls.
      6. The output must be a valid JSON object containing a "path" key, which is an array of coordinate objects [{x, y}, ...].
      
      Think step-by-step: First, find a route to the nearest wall from the start point. Then, trace along the walls towards the end point. Finally, route from the wall to the end point.

      Example Response:
      {
        "path": [
          {"x": 10, "y": 10},
          {"x": 10, "y": 20},
          {"x": 30, "y": 20},
          {"x": 30, "y": 45}
        ]
      }
    `;

    const llmResponse = await generate({
      model: geminiPro,
      prompt: prompt,
      config: { temperature: 0.1 },
    });
    
    try {
      return JSON.parse(llmResponse.text());
    } catch(e) {
      console.error("Failed to parse AI response for cable path:", e);
      // Fallback to a direct line if AI fails
      return { path: [start, end] };
    }
  }
);
