'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Undo, Redo, GitBranch, Activity } from 'lucide-react';
import { StateHistoryManager } from '@/lib/state-history';

interface HistoryPanelProps {
  historyManager: StateHistoryManager;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'add': return '➕';
    case 'remove': return '🗑️';
    case 'update': return '✏️';
    case 'move': return '📍';
    case 'connect': return '🔗';
    case 'disconnect': return '🔌';
    default: return '📝';
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'add': return 'bg-green-100 text-green-800 border-green-200';
    case 'remove': return 'bg-red-100 text-red-800 border-red-200';
    case 'update': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'move': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'connect': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'disconnect': return 'bg-gray-100 text-gray-800 border-gray-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function HistoryPanel({ 
  historyManager, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo 
}: HistoryPanelProps) {
  const history = historyManager.getHistory();
  const currentIndex = historyManager.getCurrentIndex();
  const stats = historyManager.getStats();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          History
          <Badge variant="outline" className="ml-auto">
            {history.length} entries
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex-1"
          >
            <Undo className="w-4 h-4 mr-2" />
            Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex-1"
          >
            <Redo className="w-4 h-4 mr-2" />
            Redo
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Total Actions</div>
            <div className="text-2xl font-bold">{stats.totalEntries}</div>
          </div>
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm text-muted-foreground">Current Position</div>
            <div className="text-2xl font-bold">{currentIndex + 1}</div>
          </div>
        </div>

        {/* Action Type Breakdown */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Action Breakdown</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(stats.actionTypes).map(([action, count]) => (
              <div key={action} className="text-center">
                <div className="text-lg">{getActionIcon(action)}</div>
                <div className="font-medium">{count}</div>
                <div className="text-muted-foreground capitalize">{action}</div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* History Timeline */}
        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Timeline
          </div>
          <ScrollArea className="h-64 w-full">
            <div className="space-y-2">
              {history.map((entry, index) => {
                const isCurrent = index === currentIndex;
                const isPast = index < currentIndex;
                const isFuture = index > currentIndex;

                return (
                  <div
                    key={entry.id}
                    className={`
                      relative p-3 rounded-lg border transition-all
                      ${isCurrent ? 'bg-primary/10 border-primary' : ''}
                      ${isPast ? 'bg-muted/30 border-muted' : ''}
                      ${isFuture ? 'bg-background border-dashed opacity-50' : ''}
                    `}
                  >
                    {/* Timeline connector */}
                    {index > 0 && (
                      <div className="absolute left-6 -top-2 w-0.5 h-2 bg-border" />
                    )}
                    
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                        ${isCurrent ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
                      `}>
                        {index + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getActionColor(entry.action)}`}
                          >
                            {getActionIcon(entry.action)} {entry.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <div className="text-sm font-medium text-foreground">
                          {entry.description}
                        </div>
                        
                        {entry.metadata && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {entry.metadata.deviceType && `Device: ${entry.metadata.deviceType}`}
                            {entry.metadata.operation && ` • ${entry.metadata.operation}`}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isCurrent && (
                      <div className="absolute right-2 top-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Branch Information */}
        <div className="bg-muted/50 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <GitBranch className="w-4 h-4" />
            Branch: main
          </div>
          <div className="text-xs text-muted-foreground">
            All changes are saved automatically to your current branch
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
