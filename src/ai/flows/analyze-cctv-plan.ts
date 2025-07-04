// 'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a CCTV plan and providing recommendations.
 *
 * The flow takes a summary of devices in the plan and returns an analysis with suggestions for improvements.
 * It checks for aspects like NVR capacity, switch port availability, and missing components.
 *
 * - analyzeCctvPlan - The main function to analyze the CCTV plan.
 * - AnalyzeCctvPlanInput - The input type for the analyzeCctvPlan function.
 * - AnalyzeCctvPlanOutput - The output type for the analyzeCctvPlan function.
 */

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeCctvPlanInputSchema = z.object({
  deviceSummary: z
    .string()
    .describe(
      'A summary of the devices in the CCTV plan, including their types and quantities.'
    ),
  totalFloors: z.number().describe('The total number of floors in the building.'),
});
export type AnalyzeCctvPlanInput = z.infer<typeof AnalyzeCctvPlanInputSchema>;

const AnalyzeCctvPlanOutputSchema = z.object({
  analysis: z.string().describe('An analysis of the CCTV plan with recommendations for improvements.'),
});
export type AnalyzeCctvPlanOutput = z.infer<typeof AnalyzeCctvPlanOutputSchema>;

export async function analyzeCctvPlan(input: AnalyzeCctvPlanInput): Promise<AnalyzeCctvPlanOutput> {
  return analyzeCctvPlanFlow(input);
}

const analyzeCctvPlanPrompt = ai.definePrompt({
  name: 'analyzeCctvPlanPrompt',
  input: {schema: AnalyzeCctvPlanInputSchema},
  output: {schema: AnalyzeCctvPlanOutputSchema},
  prompt: `You are a professional CCTV and IT system installer.

Please analyze the following list of devices for a CCTV installation in a {{{totalFloors}}} floor building.  Provide actionable recommendations and point out any potential issues.

Write concisely and be helpful.

My list of devices:

{{{deviceSummary}}}

Please consider: Is there a recording device (NVR/Server)? Are there enough switch ports? Are there any missing necessary components?

Summarize potential improvements briefly.
`,
});

const analyzeCctvPlanFlow = ai.defineFlow(
  {
    name: 'analyzeCctvPlanFlow',
    inputSchema: AnalyzeCctvPlanInputSchema,
    outputSchema: AnalyzeCctvPlanOutputSchema,
  },
  async input => {
    const {output} = await analyzeCctvPlanPrompt(input);
    return output!;
  }
);
