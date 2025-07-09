import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ThermalCameraService } from '@/services';
import { getThermalCameraService } from '@/services';
import { ThermalCalibrationData } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ThermalCameraCalibrationProps {
  deviceId: string;
}

export function ThermalCameraCalibration({ deviceId }: ThermalCameraCalibrationProps) {
  const [calibrationData, setCalibrationData] = useState<ThermalCalibrationData | null>(null);
  const [calibrationMode, setCalibrationMode] = useState<'auto' | 'manual' | 'scheduled'>('auto');
  const [interval, setInterval] = useState(24);
  const [referencePoints, setReferencePoints] = useState<Array<{
    x: number;
    y: number;
    expectedTemp: number;
    description: string;
  }>>([]);
  const { toast } = useToast();
  const thermalService = getThermalCameraService();

  useEffect(() => {
    // โหลดข้อมูล calibration เมื่อ component โหลด
    const data = thermalService.getCalibrationStatus(deviceId);
    if (data) {
      setCalibrationData(data);
      setCalibrationMode(data.status.calibrationMode);
    }
  }, [deviceId]);

  const handleAddReferencePoint = () => {
    setReferencePoints([
      ...referencePoints,
      {
        x: 0,
        y: 0,
        expectedTemp: 25,
        description: `จุดอ้างอิงที่ ${referencePoints.length + 1}`
      }
    ]);
  };

  const handleUpdateReferencePoint = (index: number, field: string, value: any) => {
    const updatedPoints = [...referencePoints];
    updatedPoints[index] = {
      ...updatedPoints[index],
      [field]: value
    };
    setReferencePoints(updatedPoints);
  };

  const handleSetupCalibration = async () => {
    try {
      await thermalService.setupCalibration(deviceId, {
        mode: calibrationMode,
        interval: calibrationMode === 'scheduled' ? interval : undefined,
        referencePoints: referencePoints.length > 0 ? referencePoints : undefined
      });

      toast({
        title: 'ตั้งค่าการคาลิเบทสำเร็จ',
        description: 'ระบบได้บันทึกการตั้งค่าการคาลิเบทแล้ว'
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถตั้งค่าการคาลิเบทได้',
        variant: 'destructive'
      });
    }
  };

  const handleStartCalibration = async () => {
    try {
      await thermalService.startCalibration(deviceId);
      
      // รีโหลดข้อมูลหลังจาก calibrate
      const updatedData = thermalService.getCalibrationStatus(deviceId);
      if (updatedData) {
        setCalibrationData(updatedData);
      }

      toast({
        title: 'คาลิเบทสำเร็จ',
        description: 'ระบบได้ทำการคาลิเบทกล้องเรียบร้อยแล้ว'
      });
    } catch (error) {
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถคาลิเบทกล้องได้',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>การตั้งค่าการคาลิเบท</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>โหมดการคาลิเบท</Label>
            <Select value={calibrationMode} onValueChange={(value: 'auto' | 'manual' | 'scheduled') => setCalibrationMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">อัตโนมัติ</SelectItem>
                <SelectItem value="manual">ตั้งค่าเอง</SelectItem>
                <SelectItem value="scheduled">ตามกำหนดเวลา</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {calibrationMode === 'scheduled' && (
            <div className="space-y-2">
              <Label>ช่วงเวลาคาลิเบท (ชั่วโมง)</Label>
              <Input
                type="number"
                min={1}
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value))}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>จุดอ้างอิง</Label>
            <Button onClick={handleAddReferencePoint}>เพิ่มจุดอ้างอิง</Button>

            {referencePoints.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>พิกัด X</TableHead>
                    <TableHead>พิกัด Y</TableHead>
                    <TableHead>อุณหภูมิที่คาดหวัง (°C)</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referencePoints.map((point, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Input
                          type="number"
                          value={point.x}
                          onChange={(e) => handleUpdateReferencePoint(index, 'x', parseInt(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={point.y}
                          onChange={(e) => handleUpdateReferencePoint(index, 'y', parseInt(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={point.expectedTemp}
                          onChange={(e) => handleUpdateReferencePoint(index, 'expectedTemp', parseFloat(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={point.description}
                          onChange={(e) => handleUpdateReferencePoint(index, 'description', e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <Button onClick={handleSetupCalibration}>บันทึกการตั้งค่า</Button>
        </CardContent>
      </Card>

      {calibrationData && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>สถานะการคาลิเบท</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label>คาลิเบทครั้งล่าสุด</Label>
                <p>{calibrationData.status.lastCalibration.toLocaleString('th-TH')}</p>
              </div>
              {calibrationData.status.calibrationMode === 'scheduled' && (
                <div>
                  <Label>คาลิเบทครั้งถัดไป</Label>
                  <p>{calibrationData.status.nextScheduledCalibration.toLocaleString('th-TH')}</p>
                </div>
              )}
              <div>
                <Label>ความแม่นยำปัจจุบัน</Label>
                <p>{calibrationData.status.currentAccuracy.toFixed(2)}%</p>
              </div>
              {calibrationData.status.requiresCalibration && (
                <div className="text-red-500">
                  * จำเป็นต้องทำการคาลิเบทใหม่
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ประวัติการคาลิเบท</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>ค่าชดเชยอุณหภูมิ</TableHead>
                    <TableHead>อุณหภูมิแวดล้อม</TableHead>
                    <TableHead>สถานะ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calibrationData.calibrationHistory.map((history, index) => (
                    <TableRow key={index}>
                      <TableCell>{history.timestamp.toLocaleString('th-TH')}</TableCell>
                      <TableCell>{history.temperatureOffset.toFixed(2)}°C</TableCell>
                      <TableCell>{history.ambientTemp}°C</TableCell>
                      <TableCell>
                        {history.success ? (
                          <span className="text-green-500">สำเร็จ</span>
                        ) : (
                          <span className="text-red-500">ไม่สำเร็จ</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Button onClick={handleStartCalibration} className="w-full">
            เริ่มการคาลิเบท
          </Button>
        </>
      )}
    </div>
  );
}
