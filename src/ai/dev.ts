import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-cctv-plan.ts';
import '@/ai/flows/suggest-device-placements.ts';
import '@/ai/flows/find-cable-path.ts';
import '@/ai/flows/generate-logical-topology-layout.ts';
import '@/ai/flows/generate-report-layout.ts';
import '@/ai/flows/get-device-details.ts';
import '@/ai/flows/run-plan-diagnostics.ts';
