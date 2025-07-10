
import React from 'react';
import type { ArchitecturalElement } from '@/lib/types';

interface ArchitecturalElementRendererProps {
  element: ArchitecturalElement;
}

export const ArchitecturalElementRenderer: React.FC<ArchitecturalElementRendererProps> = ({ element }) => {
  if (element.type === 'wall') {
    if (!element.points || element.points.length < 2) {
      return null;
    }
    const [start, end] = element.points;
    
    // Calculate position and dimensions
    const x1 = start.x * 100;
    const y1 = start.y * 100;
    const x2 = end.x * 100;
    const y2 = end.y * 100;

    const left = Math.min(x1, x2);
    const top = Math.min(y1, y2);
    const width = Math.abs(x1 - x2);
    const height = Math.abs(y1 - y2);

    // This is a simplification. For true diagonal walls, SVG or a rotated div would be better.
    // For now, we handle horizontal and vertical walls.
    if (width > height) { // Horizontal wall
         return (
            <div
            className="absolute bg-gray-400 dark:bg-gray-600"
            style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: '4px', // wall thickness
                transform: `translateY(-2px)`,
            }}
            />
        );
    } else { // Vertical wall
         return (
            <div
            className="absolute bg-gray-400 dark:bg-gray-600"
            style={{
                left: `${left}%`,
                top: `${top}%`,
                width: '4px', // wall thickness
                height: `${height}%`,
                transform: `translateX(-2px)`,
            }}
            />
        );
    }
  }

  return null;
};
