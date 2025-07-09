'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import './icon-menu-sidebar.css';
import {
  DevicesIcon,
  ArchitectureIcon,
  AiIcon,
  DashboardIcon,
  FilesIcon,
  HistoryIcon,
  DataCenterIcon,
  DiagnosticsIcon,
  SettingsIcon,
  HelpIcon,
  ExportIcon,
  ProjectIcon,
  AnalyticsIcon,
  SecurityIcon,
  NetworkIcon,
  MonitoringIcon,
  ReportIcon,
  ToolsIcon,
  LayersIcon,
  ConnectIcon
} from '@/components/icons';

interface MenuGroup {
  id: string;
  title: string;
  items: MenuItem[];
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  isActive?: boolean;
  onClick?: () => void;
  color?: string;
}

interface IconMenuSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function IconMenuSidebar({ 
  activeTab, 
  onTabChange, 
  isCollapsed = false,
  onToggleCollapse 
}: IconMenuSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['main', 'tools']);

  const menuGroups: MenuGroup[] = [
    {
      id: 'main',
      title: 'หลัก',
      items: [
        {
          id: 'dashboard',
          title: 'แดชบอร์ด',
          icon: DashboardIcon,
          color: 'text-blue-500',
          onClick: () => onTabChange('dashboard')
        },
        {
          id: 'project',
          title: 'โปรเจ็กต์',
          icon: ProjectIcon,
          color: 'text-green-500',
          onClick: () => onTabChange('project')
        },
        {
          id: 'files',
          title: 'ไฟล์',
          icon: FilesIcon,
          color: 'text-purple-500',
          onClick: () => onTabChange('files')
        }
      ]
    },
    {
      id: 'tools',
      title: 'เครื่องมือ',
      items: [
        {
          id: 'devices',
          title: 'อุปกรณ์ CCTV',
          icon: DevicesIcon,
          badge: '15',
          color: 'text-orange-500',
          onClick: () => onTabChange('devices')
        },
        {
          id: 'architecture',
          title: 'สถาปัตยกรรม',
          icon: ArchitectureIcon,
          color: 'text-cyan-500',
          onClick: () => onTabChange('architecture')
        },
        {
          id: 'network',
          title: 'เครือข่าย',
          icon: NetworkIcon,
          color: 'text-indigo-500',
          onClick: () => onTabChange('network')
        },
        {
          id: 'layers',
          title: 'เลเยอร์',
          icon: LayersIcon,
          color: 'text-teal-500',
          onClick: () => onTabChange('layers')
        }
      ]
    },
    {
      id: 'analysis',
      title: 'วิเคราะห์',
      items: [
        {
          id: 'ai',
          title: 'AI ผู้ช่วย',
          icon: AiIcon,
          badge: 'AI',
          color: 'text-pink-500',
          onClick: () => onTabChange('ai')
        },
        {
          id: 'diagnostics',
          title: 'การวินิจฉัย',
          icon: DiagnosticsIcon,
          badge: '3',
          color: 'text-red-500',
          onClick: () => onTabChange('diagnostics')
        },
        {
          id: 'analytics',
          title: 'การวิเคราะห์',
          icon: AnalyticsIcon,
          color: 'text-amber-500',
          onClick: () => onTabChange('analytics')
        },
        {
          id: 'monitoring',
          title: 'การตรวจสอบ',
          icon: MonitoringIcon,
          color: 'text-emerald-500',
          onClick: () => onTabChange('monitoring')
        }
      ]
    },
    {
      id: 'management',
      title: 'จัดการ',
      items: [
        {
          id: 'datacenter',
          title: 'ศูนย์ข้อมูล',
          icon: DataCenterIcon,
          color: 'text-slate-500',
          onClick: () => onTabChange('datacenter')
        },
        {
          id: 'security',
          title: 'ความปลอดภัย',
          icon: SecurityIcon,
          color: 'text-rose-500',
          onClick: () => onTabChange('security')
        },
        {
          id: 'connect',
          title: 'การเชื่อมต่อ',
          icon: ConnectIcon,
          color: 'text-violet-500',
          onClick: () => onTabChange('connect')
        }
      ]
    },
    {
      id: 'export',
      title: 'ส่งออก',
      items: [
        {
          id: 'report',
          title: 'รายงาน',
          icon: ReportIcon,
          color: 'text-blue-600',
          onClick: () => onTabChange('report')
        },
        {
          id: 'export',
          title: 'ส่งออกไฟล์',
          icon: ExportIcon,
          color: 'text-green-600',
          onClick: () => onTabChange('export')
        },
        {
          id: 'history',
          title: 'ประวัติ',
          icon: HistoryIcon,
          color: 'text-gray-500',
          onClick: () => onTabChange('history')
        }
      ]
    },
    {
      id: 'system',
      title: 'ระบบ',
      items: [
        {
          id: 'settings',
          title: 'การตั้งค่า',
          icon: SettingsIcon,
          color: 'text-gray-600',
          onClick: () => onTabChange('settings')
        },
        {
          id: 'help',
          title: 'ช่วยเหลือ',
          icon: HelpIcon,
          color: 'text-blue-400',
          onClick: () => onTabChange('help')
        }
      ]
    }
  ];

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const MenuItem = ({ item }: { item: MenuItem }) => (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={activeTab === item.id ? "default" : "ghost"}
            size={isCollapsed ? "icon" : "sm"}
            className={cn(
              "menu-item ripple-effect relative w-full justify-start transition-all duration-300",
              isCollapsed ? "px-2" : "px-3",
              activeTab === item.id && "active glass-effect",
              !isCollapsed && "text-left",
              item.color && `hover:${item.color.replace('text-', 'bg-').replace('-500', '-50')}`
            )}
            onClick={item.onClick}
          >
            <item.icon 
              className={cn(
                "menu-icon h-5 w-5 transition-all duration-300",
                activeTab === item.id ? "text-primary-foreground" : item.color,
                !isCollapsed && "mr-2"
              )} 
            />
            {!isCollapsed && (
              <>
                <span className="flex-1 text-sm font-medium sidebar-content">{item.title}</span>
                {item.badge && (
                  <Badge 
                    variant={activeTab === item.id ? "secondary" : "outline"}
                    className={cn(
                      "menu-badge h-5 px-1.5 text-xs transition-all duration-200",
                      typeof item.badge === 'string' && item.badge === 'AI' && "glow-purple",
                      typeof item.badge === 'number' && "glow-red"
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </>
            )}
            {isCollapsed && item.badge && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center menu-badge">
                <span className="text-xs text-white font-bold">
                  {typeof item.badge === 'number' && item.badge > 9 ? '9+' : item.badge}
                </span>
              </div>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          align="center"
          className={cn(
            "menu-tooltip z-50",
            !isCollapsed && "hidden"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.title}</span>
            {item.badge && (
              <Badge variant="outline" className="h-5 px-1.5 text-xs">
                {item.badge}
              </Badge>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const GroupHeader = ({ group }: { group: MenuGroup }) => {
    if (isCollapsed) {
      return <Separator className="my-2 opacity-30" />;
    }

    const isExpanded = expandedGroups.includes(group.id);
    
    return (
      <Button
        variant="ghost"
        size="sm"
        className="group-header w-full justify-between px-3 py-2 h-auto mb-1 hover:bg-muted/50 transition-all duration-200"
        onClick={() => toggleGroup(group.id)}
      >
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider sidebar-content">
          {group.title}
        </span>
        <div className={cn(
          "transition-transform duration-300 text-xs",
          isExpanded ? "rotate-90" : "rotate-0"
        )}>
          ▶
        </div>
      </Button>
    );
  };

  return (
    <div className={cn(
      "icon-menu-sidebar sidebar-collapse flex flex-col h-full custom-scrollbar",
      isCollapsed ? "w-16" : "w-64",
      isCollapsed && "sidebar-collapsed"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b glass-effect">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-foreground sidebar-content floating-menu">
            🎯 เมนูหลัก
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="h-8 w-8 hover:bg-muted ripple-effect menu-item"
        >
          <div className={cn(
            "transition-transform duration-300 text-lg",
            isCollapsed ? "rotate-0" : "rotate-180"
          )}>
            ◀
          </div>
        </Button>
      </div>

      {/* Menu Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {menuGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.id);
          
          return (
            <div key={group.id} className="space-y-1">
              <GroupHeader group={group} />
              
              <div className={cn(
                "space-y-1 transition-all duration-300 ease-in-out",
                !isCollapsed && !isExpanded && "hidden opacity-0",
                isCollapsed && "block opacity-100",
                !isCollapsed && isExpanded && "block opacity-100"
              )}>
                {group.items.map((item) => (
                  <MenuItem key={item.id} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t glass-effect">
        <div className={cn(
          "flex items-center gap-2 text-xs text-muted-foreground",
          isCollapsed && "justify-center"
        )}>
          {!isCollapsed && (
            <>
              <div className="status-indicator w-2 h-2 bg-green-500 rounded-full" />
              <span className="sidebar-content">ระบบพร้อมใช้งาน</span>
            </>
          )}
          {isCollapsed && (
            <div className="status-indicator w-2 h-2 bg-green-500 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}
