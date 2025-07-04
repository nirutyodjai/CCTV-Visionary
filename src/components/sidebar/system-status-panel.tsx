'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, XCircle, Loader, HelpCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type CheckStatus = 'pending' | 'running' | 'success' | 'error';

export interface SystemCheck {
    id: string;
    name: string;
    status: CheckStatus;
    message?: string;
}

interface SystemStatusPanelProps {
    statuses: SystemCheck[];
    onRunChecks: () => void;
    isLoading: boolean;
}

const STATUS_CONFIG: Record<CheckStatus, { icon: React.ReactNode; color: string; label: string }> = {
    pending: { icon: <HelpCircle className="h-4 w-4" />, color: 'text-muted-foreground', label: 'รอตรวจสอบ' },
    running: { icon: <Loader className="h-4 w-4 animate-spin" />, color: 'text-blue-500', label: 'กำลังทำงาน' },
    success: { icon: <CheckCircle className="h-4 w-4" />, color: 'text-green-500', label: 'สำเร็จ' },
    error: { icon: <XCircle className="h-4 w-4" />, color: 'text-destructive', label: 'ล้มเหลว' },
};

export function SystemStatusPanel({ statuses, onRunChecks, isLoading }: SystemStatusPanelProps) {
    return (
        <Accordion type="single" collapsible className="w-full" defaultValue="system-status">
            <AccordionItem value="system-status">
                <AccordionTrigger className="text-base px-2">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        สถานะระบบ
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between p-4">
                             <div>
                                <CardTitle className="text-base">ตรวจสอบระบบทั้งหมด</CardTitle>
                                <CardDescription className="text-xs">
                                    รันการตรวจสอบเพื่อเช็คความสมบูรณ์ของระบบ
                                </CardDescription>
                            </div>
                             <Button size="icon" variant="outline" onClick={onRunChecks} disabled={isLoading}>
                                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2">
                            <TooltipProvider>
                                {statuses.map((check) => (
                                    <Tooltip key={check.id} delayDuration={100}>
                                        <TooltipTrigger asChild>
                                             <div className="flex items-center justify-between p-2 rounded-md bg-muted/50 cursor-default">
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(STATUS_CONFIG[check.status].color)}>
                                                        {STATUS_CONFIG[check.status].icon}
                                                    </span>
                                                    <span className="text-sm">{check.name}</span>
                                                </div>
                                                <span className={cn("text-xs font-medium", STATUS_CONFIG[check.status].color)}>
                                                    {STATUS_CONFIG[check.status].label}
                                                </span>
                                            </div>
                                        </TooltipTrigger>
                                        {check.message && (
                                            <TooltipContent side="top" align="start" className="max-w-xs z-50">
                                                <p>{check.message}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                ))}
                            </TooltipProvider>
                        </CardContent>
                    </Card>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}
