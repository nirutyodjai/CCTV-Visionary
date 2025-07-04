'use client';

import React, { useEffect, useState } from 'react';
import ReactFlow, { ReactFlowProvider, MiniMap, Controls, Background } from 'react-flow-renderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { generateLogicalTopologyLayout } from '@/app/actions'; // Assuming action is created
import type { AnyDevice, Connection } from '@/lib/types';

interface LogicalTopologyViewProps {
  devices: AnyDevice[];
  connections: Connection[];
  isOpen: boolean;
  onClose: () => void;
}

const generateFlowElements = async (devices, connections) => {
    const deviceNodes = devices.map(d => ({ id: d.id, label: d.label, type: d.type }));
    const connectionEdges = connections.map(c => ({ from: c.fromDeviceId, to: c.toDeviceId }));

    const { positions } = await generateLogicalTopologyLayout({ devices: deviceNodes, connections: connectionEdges });
    
    const nodes = devices.map(d => ({
        id: d.id,
        data: { label: `${d.label} (${d.ipAddress || ''})` },
        position: positions[d.id] || { x: 0, y: 0 },
        style: {
            background: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            border: 'none',
        },
    }));

    const edges = connections.map(c => ({
        id: c.id,
        source: c.fromDeviceId,
        target: c.toDeviceId,
        animated: true,
        style: { stroke: 'hsl(var(--accent))' },
    }));

    return { nodes, edges };
};

export function LogicalTopologyView({ devices, connections, isOpen, onClose }: LogicalTopologyViewProps) {
  const [elements, setElements] = useState<{ nodes: any[], edges: any[] }>({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && devices.length > 0) {
      setIsLoading(true);
      generateFlowElements(devices, connections)
        .then(els => setElements(els))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, devices, connections]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Logical Network Topology</DialogTitle>
        </DialogHeader>
        <div className="w-full h-full">
            {isLoading && <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">Loading Layout...</div>}
            <ReactFlowProvider>
                <ReactFlow
                    nodes={elements.nodes}
                    edges={elements.edges}
                    fitView
                >
                    <MiniMap />
                    <Controls />
                    <Background />
                </ReactFlow>
            </ReactFlowProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
