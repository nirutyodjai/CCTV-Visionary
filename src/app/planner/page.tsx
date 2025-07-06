'use client';

import React from 'react';
import { CCTVPlanner } from "@/components/cctv-planner";
import PlannerLayout from './layout';

export default function PlannerPage() {
  return (
    <PlannerLayout>
        <div className="bg-background">
        <CCTVPlanner />
        </div>
    </PlannerLayout>
  );
}
