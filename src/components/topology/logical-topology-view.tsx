'use client';

import React, { useEffect, useState, useMemo } from 'react';
import ReactFlow, { ReactFlowProvider, MiniMap, Controls, Background } from 'react-flow-renderer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { generateLogicalTopologyLayoutAction } from '@/app/actions';
import type { AnyDevice, Connection } from '@/lib/types';
import { useTheme } from 'next-themes';

interface LogicalTopologyViewProps {
  devices: AnyDevice[];
  connections: Connection[];
  isOpen: boolean;
  onClose: () => void;
}


export function LogicalTopologyView({ devices, connections, isOpen, onClose }: LogicalTopologyViewProps) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { resolvedTheme } = useTheme();

  const generateFlowElements = async () => {
    if (devices.length === 0) return;
    
    setIsLoading(true);
    const deviceNodes = devices.map(d => ({ id: d.id, label: d.label, type: d.type }));
    const connectionEdges = connections.map(c => ({ from: c.fromDeviceId, to: c.toDeviceId }));

    const result = await generateLogicalTopologyLayoutAction({ devices: deviceNodes, connections: connectionEdges });
    
    if (result.success) {
        const { positions } = result.data;
        const primaryColor = resolvedTheme === 'dark' ? 'hsl(207 90% 68%)' : 'hsl(217 91% 65%)';
        const fgColor = resolvedTheme === 'dark' ? 'hsl(210 40% 98%)' : 'hsl(210 40% 98%)';

        setNodes(devices.map(d => ({
            id: d.id,
            data: { label: `${d.label} (${d.ipAddress || 'N/A'})` },
            position: positions[d.id] || { x: Math.random() * 800, y: Math.random() * 600 },
            style: {
                background: primaryColor,
                color: fgColor,
                border: 'none',
                borderRadius: '8px',
                padding: '10px 15px',
                fontSize: '12px'
            },
        })));

        setEdges(connections.map(c => ({
            id: c.id,
            source: c.fromDeviceId,
            target: c.toDeviceId,
            animated: true,
            style: { stroke: 'hsl(var(--accent))', strokeWidth: 2 },
        })));
    } else {
        console.error("Failed to generate layout:", result.error);
        // Basic fallback layout
        setNodes(devices.map((d, i) => ({
            id: d.id,
            data: { label: d.label },
            position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 150 },
        })));
         setEdges(connections.map(c => ({
            id: c.id,
            source: c.fromDeviceId,
            target: c.toDeviceId,
        })));
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      generateFlowElements();
    }
  }, [isOpen, devices, connections, resolvedTheme]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Logical Network Topology</DialogTitle>
          <DialogDescription>An AI-generated visual representation of your network connections.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 w-full border rounded-md relative min-h-0">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                    <p>AI is generating the layout...</p>
                </div>
            )}
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    nodesDraggable={true}
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
