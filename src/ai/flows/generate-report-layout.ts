'use server';
/**
 * @fileOverview Designs a professional report structure based on project summary data.
 *
 * - generateReportLayout - A function that creates a logical layout for a technical report.
 * - ReportInfo - The input type for the generateReportLayout function.
 * - ReportLayout - The return type for the generateReportLayout function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ReportInfoSchema = z.object({
  projectName: z.string(),
  buildingCount: z.number(),
  deviceCount: z.number(),
  totalBudget: z.number(),
  criticalAlerts: z.number(),
});
export type ReportInfo = z.infer<typeof ReportInfoSchema>;


const SectionSchema = z.object({
    type: z.enum(['TITLE', 'SUMMARY', 'BUDGET', 'DIAGRAM', 'FLOORPLAN', 'BOM']),
    title: z.string().optional(),
    content: z.string().optional(),
    targetId: z.string().optional(), // e.g. floor.id for FLOORPLAN
});

const ReportLayoutSchema = z.object({
  layout: z.array(SectionSchema),
});
export type ReportLayout = z.infer<typeof ReportLayoutSchema>;


export async function generateReportLayout(info: ReportInfo): Promise<ReportLayout> {
    return generateReportLayoutFlow(info);
}

const generateReportLayoutPrompt = ai.definePrompt({
    name: 'generateReportLayoutPrompt',
    input: { schema: ReportInfoSchema },
    output: { schema: ReportLayoutSchema },
    prompt: `
      You are a professional technical writer and report designer.
      Based on the following project summary, design a professional and beautiful report structure.
      
      Project Summary:
      - Name: "{{projectName}}"
      - Buildings: {{buildingCount}}
      - Devices: {{deviceCount}}
      - Budget: {{totalBudget}} THB
      - Critical Alerts: {{criticalAlerts}}

      Design a report structure as a JSON object with a "layout" key, which is an array of sections.
      Available section types are: TITLE, SUMMARY, BUDGET, DIAGRAM, FLOORPLAN, BOM.
      - A TITLE section should be the cover page.
      - A SUMMARY section should have a title and a compelling 'content' text you write yourself based on the summary.
      - For FLOORPLAN, you can use a placeholder for targetId like "floor_1", "floor_2".
      
      Make it flow logically. Start with a title, a summary, then key information like budget, and the bill of materials (BOM), before diving into diagrams.
    `,
});

const generateReportLayoutFlow = ai.defineFlow(
  {
    name: 'generateReportLayoutFlow',
    inputSchema: ReportInfoSchema,
    outputSchema: ReportLayoutSchema,
  },
  async (info) => {
     try {
      const { output } = await generateReportLayoutPrompt(info);
      return output!;
    } catch (e) {
      console.error('Failed to generate report layout from AI:', e);
      return { layout: [] };
    }
  }
);
