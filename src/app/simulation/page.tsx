'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SimulationDashboard } from '@/components/simulation/simulation-dashboard';

export default function SimulationPage() {
  const router = useRouter();

  // Create dummy data for the simulation dashboard
  const dummyProjectState = {
    id: 'demo-project',
    projectName: 'Demo Project',
    buildings: [{
      id: 'building-1',
      name: 'Building 1',
      floors: [{
        id: 'floor-1',
        name: 'Floor 1',
        devices: [],
        connections: [],
        architecturalElements: []
      }]
    }]
  };

  const dummyActiveFloor = {
    id: 'floor-1',
    name: 'Floor 1',
    devices: [],
    connections: [],
    architecturalElements: []
  };

  return (
    <div className="h-full">
      <SimulationDashboard projectState={dummyProjectState} activeFloor={dummyActiveFloor} />
    </div>
  );
}
