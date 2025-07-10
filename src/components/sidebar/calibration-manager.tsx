'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Calculator, 
  Settings, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Ruler,
  Zap
} from 'lucide-react';
import type { AnyDevice, Connection, Floor } from '@/lib/types';
import type { CalibrationData } from '@/lib/calibration';
import { CableCalibrationDialog } from '@/components/ui/cable-calibration-dialog';
import { calculateCablePathWithCalibration } from '@/lib/cable-calculation';

interface CalibrationManagerProps {
  floor: Floor;
  devices: AnyDevice[];
  connections: Connection[];
  onCalibrationUpdate: (calibrationData: CalibrationData) => void;
  currentCalibration?: CalibrationData;
}

export function CalibrationManager({
  floor,
  devices,
  connections,
  onCalibrationUpdate,
  currentCalibration
}: CalibrationManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getCalibrationStatus = () => {
    if (!currentCalibration) {
      return {
        status: 'none',
        color: 'bg-gray-500',
        text: 'No Calibration',
        description: 'ยังไม่มีการ calibrate ระบบ'
      };
    }

    const { confidence, deviation } = currentCalibration.accuracy;
    
    if (confidence === 'high' && deviation < 5) {
      return {
        status: 'excellent',
        color: 'bg-green-500',
        text: 'Excellent',
        description: `แม่นยำสูง (${(100 - deviation).toFixed(1)}%)`
      };
    } else if (confidence === 'medium' && deviation < 10) {
      return {
        status: 'good',
        color: 'bg-blue-500',
        text: 'Good',
        description: `แม่นยำดี (${(100 - deviation).toFixed(1)}%)`
      };
    } else if (confidence === 'low' || deviation >= 10) {
      return {
        status: 'needs-improvement',
        color: 'bg-yellow-500',
        text: 'Needs Improvement',
        description: `ต้องปรับปรุง (${(100 - deviation).toFixed(1)}%)`
      };
    }

    return {
      status: 'poor',
      color: 'bg-red-500',
      text: 'Poor',
      description: 'ความแม่นยำต่ำ'
    };
  };

  const calculateTotalEstimatedLength = () => {
    let totalLength = 0;
    let calibratedCount = 0;

    connections.forEach(conn => {
      const fromDevice = devices.find(d => d.id === conn.fromDeviceId);
      const toDevice = devices.find(d => d.id === conn.toDeviceId);
      
      if (fromDevice && toDevice) {
        const result = calculateCablePathWithCalibration(
          fromDevice,
          toDevice,
          conn,
          currentCalibration
        );
        
        totalLength += result.totalLength;
        if (result.calibrationUsed) calibratedCount++;
      }
    });

    return {
      totalLength: totalLength.toFixed(1),
      calibratedCount,
      totalConnections: connections.length,
      calibratedPercentage: connections.length > 0 ? (calibratedCount / connections.length) * 100 : 0
    };
  };

  const status = getCalibrationStatus();
  const estimates = calculateTotalEstimatedLength();

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Cable Calibration
            </div>
            <Badge className={status.color}>
              {status.text}
            </Badge>
          </CardTitle>
          <CardDescription>
            {status.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {currentCalibration ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Calibration Name</div>
                  <div className="text-muted-foreground">{currentCalibration.name}</div>
                </div>
                <div>
                  <div className="font-medium">Last Updated</div>
                  <div className="text-muted-foreground">
                    {currentCalibration.updatedAt.toLocaleDateString('th-TH')}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Base Scale</div>
                  <div className="text-muted-foreground">
                    {currentCalibration.baseScale.toFixed(1)} px/m
                  </div>
                </div>
                <div>
                  <div className="font-medium">Deviation</div>
                  <div className="text-muted-foreground">
                    {currentCalibration.accuracy.deviation.toFixed(1)}%
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Accuracy</span>
                  <span>{(100 - currentCalibration.accuracy.deviation).toFixed(1)}%</span>
                </div>
                <Progress value={100 - currentCalibration.accuracy.deviation} />
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  <span className="font-medium">Cable Estimates</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="font-medium">Total Length</div>
                    <div className="text-muted-foreground">{estimates.totalLength} meters</div>
                  </div>
                  <div>
                    <div className="font-medium">Calibrated Connections</div>
                    <div className="text-muted-foreground">
                      {estimates.calibratedCount}/{estimates.totalConnections} 
                      ({estimates.calibratedPercentage.toFixed(0)}%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-2">
              <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500" />
              <div className="font-medium">No Calibration Data</div>
              <div className="text-sm text-muted-foreground">
                การคำนวณระยะสายอาจไม่แม่นยำ ควรทำการ calibrate ระบบ
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="flex-1"
              variant={currentCalibration ? "outline" : "default"}
            >
              {currentCalibration ? (
                <>
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Calibration
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Start Calibration
                </>
              )}
            </Button>
            
            {currentCalibration && (
              <Button 
                variant="outline"
                onClick={() => {
                  // Run quick validation test
                  console.log('Running validation test...');
                }}
              >
                <Zap className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Quick Stats */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div className="font-medium text-lg">{devices.length}</div>
                <div className="text-muted-foreground">Devices</div>
              </div>
              <div>
                <div className="font-medium text-lg">{connections.length}</div>
                <div className="text-muted-foreground">Connections</div>
              </div>
              <div>
                <div className="font-medium text-lg">
                  {currentCalibration?.points.length || 0}
                </div>
                <div className="text-muted-foreground">Cal Points</div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {currentCalibration && currentCalibration.accuracy.deviation > 10 && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">
                    Recommendation
                  </div>
                  <div className="text-yellow-700 dark:text-yellow-300">
                    ค่าเบี่ยงเบนสูง ควรเพิ่ม reference points หรือ recalibrate ระบบ
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <CableCalibrationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        floor={floor}
        devices={devices}
        connections={connections}
        onCalibrationUpdate={onCalibrationUpdate}
        currentCalibration={currentCalibration}
      />
    </>
  );
}
