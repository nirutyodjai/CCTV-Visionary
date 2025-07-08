'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Settings, 
  Bot, 
  BarChart2, 
  Clock, 
  Upload,
  Menu,
  X,
  Undo,
  Redo
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historyCount: number;
  isConnected?: boolean;
  batteryLevel?: number;
  networkSpeed?: 'slow' | 'fast' | 'offline';
}

export function MobileNav({ 
  activeTab, 
  onTabChange, 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo, 
  historyCount,
  isConnected = true,
  batteryLevel,
  networkSpeed = 'fast'
}: MobileNavProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { id: 'tools', label: 'Tools', icon: Home },
    { id: 'ai', label: 'AI', icon: Bot },
    { id: 'project', label: 'Project', icon: BarChart2 },
    { id: 'files', label: 'Files', icon: Upload },
    { id: 'history', label: 'History', icon: Clock, badge: historyCount > 0 ? historyCount : undefined },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-between px-2 py-1">
          {/* Main navigation items */}
          <div className="flex items-center space-x-1 flex-1">
            {navItems.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 text-xs rounded-lg transition-all",
                  activeTab === item.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-4 h-4 mb-1" />
                <span className="text-xs">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {item.badge}
                  </Badge>
                )}
              </button>
            ))}
          </div>

          {/* Undo/Redo Controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onUndo}
              disabled={!canUndo}
              className="flex flex-col items-center px-2 py-1"
            >
              <Undo className="w-4 h-4" />
              <span className="text-xs">Undo</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRedo}
              disabled={!canRedo}
              className="flex flex-col items-center px-2 py-1"
            >
              <Redo className="w-4 h-4" />
              <span className="text-xs">Redo</span>
            </Button>
          </div>

          {/* Expand button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex flex-col items-center px-2 py-1"
          >
            {isExpanded ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span className="text-xs">More</span>
          </Button>
        </div>

        {/* Expanded menu */}
        {isExpanded && (
          <div className="border-t border-border bg-background">
            <div className="grid grid-cols-3 gap-2 p-3">
              {navItems.slice(4).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsExpanded(false);
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 text-xs rounded-lg transition-all",
                    activeTab === item.id 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5 mb-2" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {item.badge}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function MobileHeader({ 
  title, 
  onMenuToggle, 
  canUndo, 
  canRedo, 
  onUndo, 
  onRedo 
}: {
  title: string;
  onMenuToggle: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-background border-b border-border md:hidden">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" onClick={onMenuToggle}>
          <Menu className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold truncate">{title}</h1>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
