'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2, Edit, Save, X } from 'lucide-react';
import { listProjectsAction, deleteProjectAction, updateProjectNameAction } from '@/app/actions';
import type { ProjectState } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from "@/components/ui/checkbox";

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadProject: (projectId: string) => void;
  currentProjectId: string;
}

type ProjectInfo = Pick<ProjectState, 'id' | 'projectName'>;

export function ProjectManager({ isOpen, onClose, onLoadProject, currentProjectId }: ProjectManagerProps) {
  const [projects, setProjects] = useState<ProjectInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [deletingProject, setDeletingProject] = useState<ProjectInfo | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [isConfirmingBulkDelete, setConfirmingBulkDelete] = useState(false);
  const { toast } = useToast();

  const fetchProjects = async () => {
    setIsLoading(true);
    const result = await listProjectsAction();
    if (result.success) {
      setProjects(result.data);
    } else {
      toast({ title: 'ไม่สามารถโหลดรายการโครงการ', description: result.error, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchProjects();
      setSelectedProjects(new Set()); // Reset selection on open
    }
  }, [isOpen]);

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    
    const result = await deleteProjectAction(deletingProject.id);
    if (result.success) {
      toast({ title: 'ลบโครงการสำเร็จ' });
      setDeletingProject(null);
      fetchProjects(); // Refresh list
    } else {
      toast({ title: 'เกิดข้อผิดพลาดในการลบ', description: result.error, variant: 'destructive' });
    }
  };

  const handleBulkDeleteConfirm = async () => {
    const idsToDelete = Array.from(selectedProjects);
    if (idsToDelete.length === 0) return;

    const results = await Promise.all(idsToDelete.map(id => deleteProjectAction(id)));
    const failures = results.filter(r => !r.success);

    if (failures.length > 0) {
        toast({ title: `เกิดข้อผิดพลาดในการลบ ${failures.length} โครงการ`, variant: 'destructive' });
    } else {
        toast({ title: `ลบ ${idsToDelete.length} โครงการสำเร็จ` });
    }

    setConfirmingBulkDelete(false);
    setSelectedProjects(new Set());
    fetchProjects(); // Refresh list
  };

  const handleStartEditing = (project: ProjectInfo) => {
    setEditingProjectId(project.id);
    setNewProjectName(project.projectName);
  };
  
  const handleCancelEditing = () => {
    setEditingProjectId(null);
    setNewProjectName('');
  };

  const handleSaveName = async () => {
    if (!editingProjectId || !newProjectName.trim()) return;

    const result = await updateProjectNameAction(editingProjectId, newProjectName.trim());
    if (result.success) {
      toast({ title: 'เปลี่ยนชื่อโครงการสำเร็จ' });
      handleCancelEditing();
      fetchProjects(); // Refresh list
    } else {
      toast({ title: 'เกิดข้อผิดพลาดในการเปลี่ยนชื่อ', description: result.error, variant: 'destructive' });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(projects.map(p => p.id));
      setSelectedProjects(allIds);
    } else {
      setSelectedProjects(new Set());
    }
  };

  const handleSelectOne = (projectId: string, isSelected: boolean) => {
    const newSelection = new Set(selectedProjects);
    if (isSelected) {
      newSelection.add(projectId);
    } else {
      newSelection.delete(projectId);
    }
    setSelectedProjects(newSelection);
  };

  const numSelected = selectedProjects.size;
  const rowCount = projects.length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>จัดการโครงการ</DialogTitle>
            <DialogDescription>
              {numSelected > 0
                ? `${numSelected} โครงการที่เลือก`
                : "โหลด, เปลี่ยนชื่อ, หรือลบโครงการที่บันทึกไว้"}
            </DialogDescription>
          </DialogHeader>

          {numSelected > 0 && (
            <div className="flex items-center justify-end px-1 py-2">
                <Button variant="destructive" size="sm" onClick={() => setConfirmingBulkDelete(true)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    ลบที่เลือก ({numSelected})
                </Button>
            </div>
          )}

          <div className="h-[400px] overflow-y-auto border rounded-md">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={rowCount > 0 && numSelected === rowCount ? true : (numSelected > 0 ? 'indeterminate' : false)}
                        onCheckedChange={(checked) => handleSelectAll(!!checked)}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead>ชื่อโครงการ</TableHead>
                    <TableHead>Project ID</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p.id} data-state={selectedProjects.has(p.id) ? "selected" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProjects.has(p.id)}
                          onCheckedChange={(checked) => handleSelectOne(p.id, !!checked)}
                          aria-label={`Select project ${p.projectName}`}
                        />
                      </TableCell>
                      <TableCell>
                        {editingProjectId === p.id ? (
                          <Input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="h-8"/>
                        ) : (
                          p.projectName
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{p.id}</TableCell>
                      <TableCell className="text-right">
                        {editingProjectId === p.id ? (
                          <div className="flex gap-2 justify-end">
                              <Button size="sm" onClick={handleSaveName}><Save className="w-4 h-4 mr-2"/>บันทึก</Button>
                              <Button size="sm" variant="ghost" onClick={handleCancelEditing}><X className="w-4 h-4"/></Button>
                          </div>
                        ) : (
                          <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="outline" onClick={() => {onLoadProject(p.id); onClose();}} disabled={p.id === currentProjectId}>โหลด</Button>
                              <Button size="icon" variant="ghost" onClick={() => handleStartEditing(p)}><Edit className="w-4 h-4" /></Button>
                              <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeletingProject(p)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {deletingProject && (
        <AlertDialog open={!!deletingProject} onOpenChange={(open) => !open && setDeletingProject(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการลบ?</AlertDialogTitle>
                  <AlertDialogDescription>
                      คุณแน่ใจหรือไม่ที่จะลบโครงการ "{deletingProject.projectName}" (ID: {deletingProject.id})? การกระทำนี้ไม่สามารถย้อนกลับได้
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeletingProject(null)}>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">ยืนยันการลบ</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {isConfirmingBulkDelete && (
        <AlertDialog open={isConfirmingBulkDelete} onOpenChange={(open) => !open && setConfirmingBulkDelete(false)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>ยืนยันการลบ?</AlertDialogTitle>
                  <AlertDialogDescription>
                      คุณแน่ใจหรือไม่ที่จะลบ {numSelected} โครงการที่เลือก? การกระทำนี้ไม่สามารถย้อนกลับได้
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmingBulkDelete(false)}>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkDeleteConfirm} className="bg-destructive hover:bg-destructive/90">ยืนยันการลบ</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
