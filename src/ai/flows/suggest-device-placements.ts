'use server';
/**
 * @fileOverview AI-powered device placement suggestions for CCTV and IT infrastructure.
 *
 * - suggestDevicePlacements - A function that suggests optimal device placements on a floor plan.
 * - SuggestDevicePlacementsInput - The input type for the suggestDevicePlacements function.
 * - SuggestDevicePlacementsOutput - The return type for the suggestDevicePlacements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestDevicePlacementsInputSchema = z.object({
  floorPlanDataUri: z
    .string()
    .describe(
      "A floor plan image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SuggestDevicePlacementsInput = z.infer<typeof SuggestDevicePlacementsInputSchema>;

const SuggestDevicePlacementsOutputSchema = z.array(
  z.object({
    type: z.enum(['cctv-bullet', 'cctv-dome', 'wifi-ap']).describe('The type of device to place.'),
    x: z.number().min(0).max(1).describe('The x-coordinate of the placement (0.0-1.0).'),
    y: z.number().min(0).max(1).describe('The y-coordinate of the placement (0.0-1.0).'),
    reason: z.string().describe('A short explanation for the placement suggestion.'),
  })
);
export type SuggestDevicePlacementsOutput = z.infer<typeof SuggestDevicePlacementsOutputSchema>;

export async function suggestDevicePlacements(input: SuggestDevicePlacementsInput): Promise<SuggestDevicePlacementsOutput> {
  return suggestDevicePlacementsFlow(input);
}

const suggestDevicePlacementsPrompt = ai.definePrompt({
  name: 'suggestDevicePlacementsPrompt',
  input: {schema: SuggestDevicePlacementsInputSchema},
  output: {schema: SuggestDevicePlacementsOutputSchema},
  prompt: `Analyze this floor plan image. Your goal is to suggest optimal placements for CCTV cameras and WiFi access points.

    Identify key areas such as entrances, main rooms, hallways.

    Return your suggestions as a JSON array of valid objects ONLY, and no other text. Each object should have:
    - \"type\" (\"cctv-bullet\", \"cctv-dome\", or \"wifi-ap\")
    - \"x\" (0.0-1.0)
    - \"y\" (0.0-1.0)
    - \"reason\" (a short explanation)

    Here is the floor plan:

    {{media url=floorPlanDataUri}}
    `,
});

const suggestDevicePlacementsFlow = ai.defineFlow(
  {
    name: 'suggestDevicePlacementsFlow',
    inputSchema: SuggestDevicePlacementsInputSchema,
    outputSchema: SuggestDevicePlacementsOutputSchema,
  },
  async input => {
    const {output} = await suggestDevicePlacementsPrompt(input);
    return output!;
  }
);
