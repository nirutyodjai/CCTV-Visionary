
import React from 'react';
import { Button } from './button';
import { Map, Upload, Bot, BarChart2, Clock, Settings, X, Undo, Redo } from 'lucide-react';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historyCount: number;
}

export const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { name: 'tools', icon: Map, label: 'เครื่องมือ' },
    { name: 'files', icon: Upload, label: 'ไฟล์' },
    { name: 'ai', icon: Bot, label: 'AI' },
    { name: 'project', icon: BarChart2, label: 'โปรเจกต์' },
    { name: 'history', icon: Clock, label: 'ประวัติ' },
    { name: 'settings', icon: Settings, label: 'ตั้งค่า' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t h-16 flex justify-around items-center">
      {tabs.map(tab => (
        <button
          key={tab.name}
          onClick={() => onTabChange(tab.name)}
          className={`flex flex-col items-center justify-center h-full w-full ${
            activeTab === tab.name ? 'text-primary' : 'text-muted-foreground'
          }`}
        >
          <tab.icon className="w-5 h-5" />
          <span className="text-xs mt-1">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

interface MobileHeaderProps {
    title: string;
    onMenuToggle: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ title, onMenuToggle, canUndo, canRedo, onUndo, onRedo }) => {
    return (
        <div className="flex justify-between items-center p-4 bg-background border-b h-14">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            <div className="flex items-center gap-2">
                 <Button variant="outline" size="sm" onClick={onUndo} disabled={!canUndo}><Undo className="w-4 h-4" /></Button>
                 <Button variant="outline" size="sm" onClick={onRedo} disabled={!canRedo}><Redo className="w-4 h-4" /></Button>
                 <Button variant="outline" size="icon" onClick={onMenuToggle}><X className="w-4 h-4" /></Button>
            </div>
        </div>
    )
}
