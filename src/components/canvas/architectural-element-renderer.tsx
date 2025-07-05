'use client';

import React from 'react';
import type { ArchitecturalElement } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useSelection } from '@/contexts/SelectionContext';

interface ArchitecturalElementRendererProps {
  element: ArchitecturalElement;
  containerRect: DOMRect | null;
  onElementClick: (e: React.PointerEvent, element: ArchitecturalElement) => void;
}

export function ArchitecturalElementRenderer({ element, containerRect, onElementClick }: ArchitecturalElementRendererProps) {
  const { selectedItem } = useSelection();

  if (!containerRect) {
    return null;
  }

  const isSelected = selectedItem?.id === element.id;

  if (element.type === 'wall' || element.type === 'door' || element.type === 'window') {
    const startX = element.start.x * containerRect.width;
    const startY = element.start.y * containerRect.height;
    const endX = element.end.x * containerRect.width;
    const endY = element.end.y * containerRect.height;

    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * (180 / Math.PI); // Angle in degrees

    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${startX}px`,
      top: `${startY}px`,
      width: `${length}px`,
      transformOrigin: '0 0',
      transform: `rotate(${angle}deg)`,
      pointerEvents: 'auto',
    };
    
    let elementClass = 'h-1.5 bg-slate-700 dark:bg-slate-300'; // Default wall style
    if(element.type === 'door'){
        elementClass = 'h-1.5 bg-yellow-600 dark:bg-yellow-400';
    } else if (element.type === 'window'){
        elementClass = 'h-1.5 bg-blue-500 dark:bg-blue-300';
    }

    return (
      <div
        style={style}
        onPointerDown={(e) => onElementClick(e, element)}
      >
        <div className={cn(
            'transition-all',
            elementClass,
            isSelected && 'ring-2 ring-offset-2 ring-primary ring-offset-background'
            )}
        />
      </div>
    );
  }
  
  // Placeholder for other types like 'area', 'tree', etc.
  return null;
}
