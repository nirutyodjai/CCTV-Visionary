import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BandwidthAnalysis from '@/components/ui/bandwidth-analysis';
import { CableCalibrationDialog } from '@/components/ui/cable-calibration-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Wifi, Cable, Calculator } from 'lucide-react';
import type { AnyDevice, Connection, Floor } from '@/lib/types';
import type { BandwidthCalculationResult } from '@/lib/calibration';

// Mock data สำหรับการทดสอบ
const mockFloor: Floor = {
  id: 'floor-1',
  name: 'Ground Floor',
  devices: [],
  connections: [],
  architecturalElements: []
};

const mockDevices: AnyDevice[] = [
  {
    id: 'cam-1',
    type: 'cctv-dome',
    label: 'Dome Camera 1',
    x: 0.2,
    y: 0.3,
    rotation: 0,
    specifications: {}
  },
  {
    id: 'cam-2', 
    type: 'cctv-bullet',
    label: 'Bullet Camera 2',
    x: 0.8,
    y: 0.3,
    rotation: 0,
    specifications: {}
  },
  {
    id: 'cam-3',
    type: 'cctv-ptz',
    label: 'PTZ Camera 3',
    x: 0.5,
    y: 0.7,
    rotation: 0,
    specifications: {}
  },
  {
    id: 'switch-1',
    type: 'switch',
    label: 'Main Switch',
    x: 0.5,
    y: 0.1,
    rotation: 0,
    specifications: {}
  },
  {
    id: 'nvr-1',
    type: 'nvr',
    label: 'Network Video Recorder',
    x: 0.1,
    y: 0.1,
    rotation: 0,
    specifications: {}
  }
];

const mockConnections: Connection[] = [
  {
    id: 'conn-1',
    fromDeviceId: 'cam-1',
    toDeviceId: 'switch-1',
    cableType: 'utp-cat6',
    path: []
  },
  {
    id: 'conn-2',
    fromDeviceId: 'cam-2', 
    toDeviceId: 'switch-1',
    cableType: 'utp-cat6',
    path: []
  },
  {
    id: 'conn-3',
    fromDeviceId: 'cam-3',
    toDeviceId: 'switch-1',
    cableType: 'utp-cat6',
    path: []
  },
  {
    id: 'conn-4',
    fromDeviceId: 'switch-1',
    toDeviceId: 'nvr-1',
    cableType: 'utp-cat6',
    path: []
  }
];

export default function BandwidthAnalysisDemo() {
  const [bandwidthResult, setBandwidthResult] = useState<BandwidthCalculationResult | null>(null);
  const [showCalibrationDialog, setShowCalibrationDialog] = useState(false);

  const handleBandwidthCalculated = (result: BandwidthCalculationResult) => {
    setBandwidthResult(result);
    console.log('Bandwidth Analysis Result:', result);
  };

  const getStatusColor = (status: 'optimal' | 'warning' | 'critical') => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CCTV Network Bandwidth Analysis Demo
          </h1>
          <p className="text-gray-600">
            ระบบวิเคราะห์ bandwidth ของกล้องและแนะนำประเภทสายที่เหมาะสม
          </p>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total Cameras</p>
                  <p className="text-2xl font-bold">{mockDevices.filter(d => d.type.includes('camera') || d.type.includes('cctv')).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Cable className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Connections</p>
                  <p className="text-2xl font-bold">{mockConnections.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Est. Bandwidth</p>
                  <p className="text-2xl font-bold">
                    {bandwidthResult ? `${bandwidthResult.summary.totalBandwidth.toFixed(1)}` : '---'} Mbps
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Network Status</p>
                  <div>
                    {bandwidthResult ? (
                      <Badge className={getStatusColor(bandwidthResult.utilizationAnalysis.overall.status)}>
                        {bandwidthResult.utilizationAnalysis.overall.status.toUpperCase()}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Not Calculated</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-6">
          <Button 
            onClick={() => setShowCalibrationDialog(true)}
            variant="outline"
          >
            Open Full Calibration Dialog
          </Button>
        </div>

        {/* Bandwidth Analysis Component */}
        <Card>
          <CardHeader>
            <CardTitle>Bandwidth Analysis System</CardTitle>
            <CardDescription>
              วิเคราะห์ bandwidth requirements และแนะนำประเภทสายที่เหมาะสม
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BandwidthAnalysis
              cameras={mockDevices.filter(d => d.type.includes('camera') || d.type.includes('cctv')).map(camera => ({
                id: camera.id,
                label: camera.label || `Camera ${camera.id}`,
                type: camera.type,
                x: camera.x,
                y: camera.y
              }))}
              connections={mockConnections.map(conn => {
                // Mock distance calculation - ในการใช้งานจริงจะคำนวณจาก calibration
                const fromDevice = mockDevices.find(d => d.id === conn.fromDeviceId);
                const toDevice = mockDevices.find(d => d.id === conn.toDeviceId);
                
                let distance = 10; // default 10 meters
                if (fromDevice && toDevice) {
                  const dx = Math.abs(toDevice.x - fromDevice.x) * 30; // 30m floor width
                  const dy = Math.abs(toDevice.y - fromDevice.y) * 20; // 20m floor height
                  distance = Math.sqrt(dx * dx + dy * dy);
                }
                
                return {
                  id: conn.id,
                  fromDeviceId: conn.fromDeviceId,
                  toDeviceId: conn.toDeviceId,
                  distance,
                  cableType: conn.cableType || 'cat6'
                };
              })}
              onBandwidthCalculated={handleBandwidthCalculated}
            />
          </CardContent>
        </Card>

        {/* Results Summary */}
        {bandwidthResult && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Network Overview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Bandwidth Required:</span>
                      <span className="font-medium">{bandwidthResult.summary.totalBandwidth.toFixed(1)} Mbps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network Utilization:</span>
                      <span className={`font-medium ${getStatusColor(bandwidthResult.utilizationAnalysis.overall.status).split(' ')[0]}`}>
                        {bandwidthResult.utilizationAnalysis.overall.utilization.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Peak Camera Usage:</span>
                      <span className="font-medium">{bandwidthResult.summary.peakUsage.toFixed(1)} Mbps</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">System Recommendations</h4>
                  <div className="space-y-1">
                    {bandwidthResult.recommendations.slice(0, 3).map((rec, index) => (
                      <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calibration Dialog */}
        <CableCalibrationDialog
          isOpen={showCalibrationDialog}
          onClose={() => setShowCalibrationDialog(false)}
          floor={mockFloor}
          devices={mockDevices}
          connections={mockConnections}
          onCalibrationUpdate={(calibrationData) => {
            console.log('Calibration updated:', calibrationData);
          }}
        />
      </div>
    </div>
  );
}
