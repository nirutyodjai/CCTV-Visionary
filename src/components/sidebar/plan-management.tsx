'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, FolderUp, Download } from 'lucide-react';

interface PlanManagementProps {
  planName: string;
  isSaving: boolean;
  onPlanNameChange: (name: string) => void;
  onSave: () => void;
  onOpenManager: () => void;
  onExport?: () => void;
}

export function PlanManagement({ planName, onPlanNameChange, onSave, isSaving, onOpenManager, onExport }: PlanManagementProps) {
  return (
    <Card>
      <CardHeader className="p-3 border-b">
         <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Project Control</CardTitle>
              <CardDescription className="text-xs pt-1">
                Name and save your current project
              </CardDescription>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="outline" onClick={onExport}>
                <Download className="w-4 h-4" />
                <span className="sr-only">Export Project</span>
              </Button>
              <Button size="icon" variant="outline" onClick={onOpenManager}>
                <FolderUp className="w-4 h-4" />
                <span className="sr-only">Open Project Manager</span>
              </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex items-center space-x-2">
          <Input
            id="planName"
            placeholder="Enter project name"
            className="h-9"
            value={planName}
            onChange={(e) => onPlanNameChange(e.target.value)}
          />
          <Button onClick={onSave} disabled={isSaving || !planName} className="h-9 whitespace-nowrap">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Project'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
