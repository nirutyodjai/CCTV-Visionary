import { action } from '@genkit-ai/core';
import { z } from 'zod';
import { geminiPro } from '@genkit-ai/googleai';
import { generate } from '@genkit-ai/ai';

const ReportInfoSchema = z.object({
  projectName: z.string(),
  buildingCount: z.number(),
  deviceCount: z.number(),
  totalBudget: z.number(),
  criticalAlerts: z.number(),
});

const SectionSchema = z.object({
    type: z.enum(['TITLE', 'SUMMARY', 'BUDGET', 'DIAGRAM', 'FLOORPLAN', 'BOM']),
    title: z.string().optional(),
    content: z.string().optional(),
    targetId: z.string().optional(), // e.g. floor.id for FLOORPLAN
});

const ReportLayoutSchema = z.object({
  layout: z.array(SectionSchema),
});

export const generateReportLayout = action(
  {
    name: 'generateReportLayout',
    inputSchema: ReportInfoSchema,
    outputSchema: ReportLayoutSchema,
  },
  async (info) => {
    const prompt = `
      You are a professional technical writer and report designer.
      Based on the following project summary, design a professional and beautiful report structure.
      
      Project Summary:
      - Name: "${info.projectName}"
      - Buildings: ${info.buildingCount}
      - Devices: ${info.deviceCount}
      - Budget: ${info.totalBudget.toFixed(2)} THB
      - Critical Alerts: ${info.criticalAlerts}

      Design a report structure as a JSON object with a "layout" key, which is an array of sections.
      Available section types are: TITLE, SUMMARY, BUDGET, DIAGRAM, FLOORPLAN, BOM.
      - A TITLE section should be the cover page.
      - A SUMMARY section should have a title and a compelling 'content' text you write yourself.
      - For FLOORPLAN, you can use a placeholder for targetId like "floor_1", "floor_2".
      
      Make it flow logically. Start with a title, a summary, then key information like budget, before diving into details.
    `;
    const llmResponse = await generate({
      model: geminiPro,
      prompt,
      config: { temperature: 0.3 },
    });

    try {
      return JSON.parse(llmResponse.text());
    } catch (e) {
      return { layout: [] };
    }
  }
);
