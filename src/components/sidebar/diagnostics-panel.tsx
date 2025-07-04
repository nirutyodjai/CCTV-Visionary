'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, Info, RefreshCw } from 'lucide-react';
import React from 'react';

type Diagnostic = {
  severity: 'error' | 'warning' | 'info';
  message: string;
  relatedDevices: string[];
};

interface DiagnosticsPanelProps {
  diagnostics: Diagnostic[];
  onRunDiagnostics: () => void;
  isLoading: boolean;
}

const ICONS = {
  error: <AlertCircle className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  info: <Info className="h-4 w-4" />,
};

const SEVERITY_MAP = {
    error: { variant: 'destructive', title: 'ข้อผิดพลาดร้ายแรง' },
    warning: { variant: 'default', title: 'คำเตือน' },
    info: { variant: 'default', title: 'ข้อมูล/ข้อเสนอแนะ' },
};

export function DiagnosticsPanel({ diagnostics, onRunDiagnostics, isLoading }: DiagnosticsPanelProps) {
  
  const sortedDiagnostics = React.useMemo(() => {
    return [...diagnostics].sort((a, b) => {
      const order = { error: 0, warning: 1, info: 2 };
      return order[a.severity] - order[b.severity];
    });
  }, [diagnostics]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
        <div>
          <CardTitle className="text-sm font-semibold">AI ตรวจสอบแบบแปลน</CardTitle>
          <CardDescription className="text-xs pt-1">
            วิเคราะห์ความถูกต้องของระบบ
          </CardDescription>
        </div>
        <Button size="icon" variant="outline" onClick={onRunDiagnostics} disabled={isLoading}>
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
        </Button>
      </CardHeader>
      <CardContent className="p-3 space-y-2">
        {sortedDiagnostics.length === 0 && (
            <div className="text-sm text-center text-muted-foreground py-4">
                กดปุ่มรีเฟรชเพื่อเริ่มการวิเคราะห์
            </div>
        )}
        {sortedDiagnostics.map((diag, index) => (
          <Alert key={index} variant={SEVERITY_MAP[diag.severity].variant as any}>
            {ICONS[diag.severity]}
            <AlertTitle className="text-sm">{SEVERITY_MAP[diag.severity].title}</AlertTitle>
            <AlertDescription className="text-xs">
              {diag.message}
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
}
