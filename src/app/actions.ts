'use server';

import { analyzeCctvPlan } from '@/ai/flows/analyze-cctv-plan';
import { suggestDevicePlacements } from '@/ai/flows/suggest-device-placements';
import { z } from 'zod';
import { action } from '@/lib/safe-action';
import type { Device } from '@/lib/types';

const analyzePlanSchema = z.object({
  devices: z.array(z.any()),
  totalFloors: z.number(),
});

export const analyzePlanAction = action(analyzePlanSchema, async ({ devices, totalFloors }) => {
  if (devices.length === 0) {
    return { error: 'No devices to analyze.' };
  }
  
  const deviceSummary = (devices as Device[]).map(d => `- ${d.label} (${d.type})`).join('\\n');

  try {
    const result = await analyzeCctvPlan({
      deviceSummary,
      totalFloors,
    });
    return { analysis: result.analysis };
  } catch (error) {
    console.error('Error analyzing plan:', error);
    return { error: 'Failed to analyze the plan.' };
  }
});


const suggestPlacementsSchema = z.object({
  floorPlanDataUri: z.string(),
});

export const suggestPlacementsAction = action(suggestPlacementsSchema, async ({ floorPlanDataUri }) => {
  if (!floorPlanDataUri) {
    return { error: 'No floor plan image provided.' };
  }

  try {
    const suggestions = await suggestDevicePlacements({ floorPlanDataUri });
    return { suggestions };
  } catch (error) {
    console.error('Error suggesting placements:', error);
    return { error: 'Failed to get placement suggestions.' };
  }
});
