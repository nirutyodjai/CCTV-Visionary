import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  calculateCameraBandwidth, 
  calculateNetworkBandwidthRequirements,
  recommendCableType,
  calculateNetworkUtilization,
  generateBandwidthReport,
  CameraSpec,
  BandwidthCalculationResult,
  CAMERA_BANDWIDTH_PRESETS
} from '@/lib/calibration';
import { AlertTriangle, CheckCircle, Wifi, Monitor, Database } from 'lucide-react';

interface BandwidthAnalysisProps {
  cameras: Array<{
    id: string;
    label: string;
    type: string;
    x: number;
    y: number;
  }>;
  connections: Array<{
    id: string;
    fromDeviceId: string;
    toDeviceId: string;
    distance: number;
    cableType: string;
  }>;
  onBandwidthCalculated?: (result: BandwidthCalculationResult) => void;
}

export default function BandwidthAnalysis({ 
  cameras, 
  connections, 
  onBandwidthCalculated 
}: BandwidthAnalysisProps) {
  const [cameraSpecs, setCameraSpecs] = useState<{ [cameraId: string]: CameraSpec }>({});
  const [analysisResult, setAnalysisResult] = useState<BandwidthCalculationResult | null>(null);
  const [availableBandwidth, setAvailableBandwidth] = useState(1000); // Mbps
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize camera specs with default values
  useEffect(() => {
    const initialSpecs: { [cameraId: string]: CameraSpec } = {};
    cameras.forEach(camera => {
      initialSpecs[camera.id] = {
        resolution: '1080p',
        compression: 'H.265',
        fps: 25,
        streams: 2
      };
    });
    setCameraSpecs(initialSpecs);
  }, [cameras]);

  const updateCameraSpec = (cameraId: string, spec: Partial<CameraSpec>) => {
    setCameraSpecs(prev => ({
      ...prev,
      [cameraId]: { ...prev[cameraId], ...spec }
    }));
  };

  const calculateBandwidth = async () => {
    setIsCalculating(true);
    
    try {
      // สร้างข้อมูลกล้องพร้อม specs
      const camerasWithSpecs = cameras.map(camera => ({
        id: camera.id,
        label: camera.label,
        specs: cameraSpecs[camera.id]
      }));

      // คำนวณ network requirements
      const networkRequirements = calculateNetworkBandwidthRequirements(camerasWithSpecs);

      // สร้างข้อมูล connections สำหรับ utilization analysis
      const connectionData = connections.map(conn => {
        const connectedCamera = cameras.find(c => c.id === conn.fromDeviceId || c.id === conn.toDeviceId);
        const bandwidth = connectedCamera ? calculateCameraBandwidth(cameraSpecs[connectedCamera.id]) : 0;
        
        return {
          id: conn.id,
          bandwidth,
          distance: conn.distance,
          cableType: conn.cableType
        };
      });

      // คำนวณ utilization
      const utilizationAnalysis = calculateNetworkUtilization(
        networkRequirements.totalRequired,
        availableBandwidth,
        connectionData
      );

      // สร้างรายงานเต็ม
      const result = generateBandwidthReport(
        camerasWithSpecs,
        networkRequirements,
        utilizationAnalysis
      );

      setAnalysisResult(result);
      onBandwidthCalculated?.(result);
    } catch (error) {
      console.error('Error calculating bandwidth:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const getStatusColor = (status: 'optimal' | 'warning' | 'critical') => {
    switch (status) {
      case 'optimal': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: 'optimal' | 'warning' | 'critical') => {
    switch (status) {
      case 'optimal': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="camera-config" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="camera-config">Camera Specs</TabsTrigger>
          <TabsTrigger value="analysis">Bandwidth Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Camera Configuration Tab */}
        <TabsContent value="camera-config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Camera Specifications
              </CardTitle>
              <CardDescription>
                Configure camera settings for bandwidth calculation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cameras.map(camera => (
                <div key={camera.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{camera.label}</h4>
                    <Badge variant="outline">{camera.type}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <Label htmlFor={`resolution-${camera.id}`}>Resolution</Label>
                      <Select 
                        value={cameraSpecs[camera.id]?.resolution || '1080p'}
                        onValueChange={(value) => updateCameraSpec(camera.id, { 
                          resolution: value as CameraSpec['resolution'] 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="720p">720p HD</SelectItem>
                          <SelectItem value="1080p">1080p Full HD</SelectItem>
                          <SelectItem value="4K">4K Ultra HD</SelectItem>
                          <SelectItem value="8K">8K Super HD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`compression-${camera.id}`}>Compression</Label>
                      <Select 
                        value={cameraSpecs[camera.id]?.compression || 'H.265'}
                        onValueChange={(value) => updateCameraSpec(camera.id, { 
                          compression: value as CameraSpec['compression'] 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="H.264">H.264</SelectItem>
                          <SelectItem value="H.265">H.265 (HEVC)</SelectItem>
                          <SelectItem value="MJPEG">MJPEG</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`fps-${camera.id}`}>FPS</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={cameraSpecs[camera.id]?.fps || 25}
                        onChange={(e) => updateCameraSpec(camera.id, { 
                          fps: parseInt(e.target.value) || 25 
                        })}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`streams-${camera.id}`}>Streams</Label>
                      <Input
                        type="number"
                        min="1"
                        max="4"
                        value={cameraSpecs[camera.id]?.streams || 2}
                        onChange={(e) => updateCameraSpec(camera.id, { 
                          streams: parseInt(e.target.value) || 2 
                        })}
                      />
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    Estimated bandwidth: {' '}
                    <span className="font-semibold">
                      {calculateCameraBandwidth(cameraSpecs[camera.id] || {
                        resolution: '1080p',
                        compression: 'H.265',
                        fps: 25,
                        streams: 2
                      }).toFixed(1)} Mbps
                    </span>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="available-bandwidth">Available Network Bandwidth (Mbps)</Label>
                    <Input
                      id="available-bandwidth"
                      type="number"
                      min="1"
                      value={availableBandwidth}
                      onChange={(e) => setAvailableBandwidth(parseInt(e.target.value) || 1000)}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={calculateBandwidth} 
                disabled={isCalculating}
                className="w-full"
              >
                {isCalculating ? 'Calculating...' : 'Calculate Bandwidth'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          {analysisResult ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wifi className="w-5 h-5" />
                    Network Utilization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Overall Utilization</span>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(analysisResult.utilizationAnalysis.overall.status)}
                        <span className={getStatusColor(analysisResult.utilizationAnalysis.overall.status)}>
                          {analysisResult.utilizationAnalysis.overall.utilization.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    
                    <Progress 
                      value={analysisResult.utilizationAnalysis.overall.utilization} 
                      className="w-full"
                    />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Cameras:</span>
                        <div className="font-semibold">{analysisResult.summary.totalCameras}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Bandwidth:</span>
                        <div className="font-semibold">{analysisResult.summary.totalBandwidth.toFixed(1)} Mbps</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Peak Usage:</span>
                        <div className="font-semibold">{analysisResult.summary.peakUsage.toFixed(1)} Mbps</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Avg per Camera:</span>
                        <div className="font-semibold">{analysisResult.summary.averagePerCamera.toFixed(1)} Mbps</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Camera Bandwidth Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisResult.cameras.map(camera => (
                      <div key={camera.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">{camera.label}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {camera.specs.resolution} {camera.specs.compression}
                          </Badge>
                          <span className="font-semibold">{camera.bandwidth.toFixed(1)} Mbps</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connection Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisResult.utilizationAnalysis.connections.map(conn => (
                      <div key={conn.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="font-medium">Connection {conn.id}</span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(conn.status)}
                          <span className={getStatusColor(conn.status)}>
                            {conn.utilization.toFixed(1)}%
                          </span>
                          {conn.bottleneck && (
                            <Badge variant="destructive" className="text-xs">
                              {conn.bottleneck}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Database className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Click "Calculate Bandwidth" to analyze your network</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {analysisResult ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>System Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResult.recommendations.map((rec, index) => (
                      <Alert key={index}>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>{rec}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cable Type Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connections.map(conn => {
                      const camera = cameras.find(c => c.id === conn.fromDeviceId || c.id === conn.toDeviceId);
                      const bandwidth = camera ? calculateCameraBandwidth(cameraSpecs[camera.id] || {
                        resolution: '1080p',
                        compression: 'H.265',
                        fps: 25,
                        streams: 2
                      }) : 0;

                      const recommendation = recommendCableType(bandwidth, conn.distance);

                      return (
                        <div key={conn.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Connection {conn.id}</span>
                            <Badge variant="outline">{recommendation.recommendedCable}</Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Distance: {conn.distance.toFixed(1)}m</div>
                            <div>Bandwidth: {bandwidth.toFixed(1)} Mbps</div>
                            <div>Current: {conn.cableType}</div>
                            <div className="text-blue-600">{recommendation.reasoning}</div>
                          </div>
                          
                          {recommendation.alternatives.length > 0 && (
                            <div className="mt-2">
                              <span className="text-sm font-medium">Alternatives:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {recommendation.alternatives.map((alt, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {alt.cableType}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-600">Calculate bandwidth analysis first to see recommendations</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
