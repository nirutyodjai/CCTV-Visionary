
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CameraFovRendererProps {
  deviceId: string;
  rotation: number;
  fov: number;
  rangeInPixels: number;
  isSelected: boolean;
}

// Helper to calculate points for the FOV arc, assuming rotation is handled by CSS
const getArcPath = (fov: number, range: number): string => {
  if (range <= 0 || fov <= 0) return '';
  
  // Start from angle 0, let CSS handle rotation
  const startAngle = 0 - fov / 2;
  const endAngle = 0 + fov / 2;

  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;

  const x1 = range * Math.cos(startRad);
  const y1 = range * Math.sin(startRad);
  const x2 = range * Math.cos(endRad);
  const y2 = range * Math.sin(endRad);

  const largeArcFlag = fov > 180 ? 1 : 0;

  // Path: Move to origin, Line to start of arc, Arc to end, close path
  return `M 0 0 L ${x1} ${y1} A ${range} ${range} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
};


export const CameraFovRenderer: React.FC<CameraFovRendererProps> = ({ deviceId, rotation, fov, rangeInPixels, isSelected }) => {
  if (!fov || !rangeInPixels) return null;
  
  const arcPath = getArcPath(fov, rangeInPixels);
  const filterId = `neon-glow-${deviceId.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
        <div
            className="origin-center transition-transform duration-200"
            style={{ 
                transform: `rotate(${rotation}deg)`,
                opacity: isSelected ? 1 : 0.5,
            }}
        >
            <svg
                width={rangeInPixels * 2}
                height={rangeInPixels * 2}
                viewBox={`-${rangeInPixels} -${rangeInPixels} ${rangeInPixels * 2} ${rangeInPixels * 2}`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <path
                    d={arcPath}
                    fill="hsl(var(--primary) / 0.2)"
                    stroke="hsl(var(--primary))"
                    strokeWidth="1.5"
                    className={cn("transition-all duration-300", isSelected && "animate-pulse")}
                    style={{ filter: `url(#${filterId})` }}
                />
            </svg>
        </div>
    </div>
  );
};
