
import React, { useImperativeHandle, useState } from 'react';
import type { ProjectState, Floor, AnyDevice, Connection } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './button';

export interface ExportDialogRef {
  open: () => void;
}

interface ExportDialogProps {
  project: ProjectState;
  floors: Floor[];
  devices: AnyDevice[];
  connections: Connection[];
  canvas?: HTMLCanvasElement;
}

export const ExportDialog = React.forwardRef<ExportDialogRef, ExportDialogProps>(
  (props, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
    }));

    const handleExport = (format: string) => {
      console.log(`Exporting to ${format}`, props);
      // Actual export logic would go here
      setIsOpen(false);
    };

    if (!isOpen) {
      return null;
    }

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Project</DialogTitle>
            <DialogDescription>
              Choose a format to export your project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button onClick={() => handleExport('pdf')}>Export as PDF</Button>
            <Button onClick={() => handleExport('excel')}>Export as Excel (BOM)</Button>
            <Button onClick={() => handleExport('png')}>Export as PNG</Button>
            <Button onClick={() => handleExport('json')}>Export as JSON</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
);

ExportDialog.displayName = 'ExportDialog';
