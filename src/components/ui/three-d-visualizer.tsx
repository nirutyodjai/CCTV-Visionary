
import React from 'react';
import type { Floor, AnyDevice, Connection } from '@/lib/types';

interface ThreeDVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
  floor?: Floor;
  devices?: AnyDevice[];
  connections?: Connection[];
}

export const ThreeDVisualizer: React.FC<ThreeDVisualizerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">3D Visualizer</h2>
        <p>3D view of the floor plan will be displayed here.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Close</button>
      </div>
    </div>
  );
};
