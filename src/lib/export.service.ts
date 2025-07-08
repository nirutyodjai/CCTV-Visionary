'use client';

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { AnyDevice, Floor, Connection, ProjectState } from '@/lib/types';

export interface ExportOptions {
  format: 'pdf' | 'excel' | 'json' | 'csv' | 'dxf' | 'image';
  includeDevices?: boolean;
  includeConnections?: boolean;
  includeFloorPlan?: boolean;
  includeBOM?: boolean;
  includeReport?: boolean;
  quality?: 'low' | 'medium' | 'high';
  paperSize?: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
}

export interface ExportData {
  project: ProjectState;
  floors: Floor[];
  devices: AnyDevice[];
  connections: Connection[];
  canvas?: HTMLCanvasElement;
  timestamp: string;
  version: string;
}

export class ExportService {
  private static instance: ExportService;
  
  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  async exportProject(data: ExportData, options: ExportOptions): Promise<void> {
    try {
      switch (options.format) {
        case 'pdf':
          await this.exportToPDF(data, options);
          break;
        case 'excel':
          await this.exportToExcel(data, options);
          break;
        case 'json':
          await this.exportToJSON(data, options);
          break;
        case 'csv':
          await this.exportToCSV(data, options);
          break;
        case 'dxf':
          await this.exportToDXF(data, options);
          break;
        case 'image':
          await this.exportToImage(data, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  private async exportToPDF(data: ExportData, options: ExportOptions): Promise<void> {
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'mm',
      format: options.paperSize || 'A4'
    });

    // Add title page
    pdf.setFontSize(20);
    pdf.text('CCTV System Design Report', 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Project: ${data.project.projectName}`, 20, 35);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
    pdf.text(`Total Devices: ${data.devices.length}`, 20, 55);
    pdf.text(`Total Connections: ${data.connections.length}`, 20, 65);

    // Add floor plan if canvas is available
    if (data.canvas && options.includeFloorPlan) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Floor Plan', 20, 20);
      
      const canvasData = data.canvas.toDataURL('image/jpeg', 0.8);
      pdf.addImage(canvasData, 'JPEG', 20, 30, 170, 120);
    }

    // Add devices list
    if (options.includeDevices) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Device List', 20, 20);
      
      let yPosition = 35;
      data.devices.forEach((device, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(12);
        pdf.text(`${index + 1}. ${device.name} (${device.type})`, 20, yPosition);
        pdf.setFontSize(10);
        pdf.text(`   Position: (${device.x}, ${device.y})`, 20, yPosition + 5);
        pdf.text(`   IP: ${device.ip || 'N/A'}`, 20, yPosition + 10);
        yPosition += 20;
      });
    }

    // Add BOM if requested
    if (options.includeBOM) {
      pdf.addPage();
      pdf.setFontSize(16);
      pdf.text('Bill of Materials', 20, 20);
      
      const bomData = this.generateBOM(data.devices);
      let yPosition = 35;
      
      bomData.forEach((item, index) => {
        if (yPosition > 270) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(12);
        pdf.text(`${index + 1}. ${item.name}`, 20, yPosition);
        pdf.setFontSize(10);
        pdf.text(`   Quantity: ${item.quantity}`, 20, yPosition + 5);
        pdf.text(`   Unit Price: $${item.unitPrice}`, 20, yPosition + 10);
        pdf.text(`   Total: $${item.total}`, 20, yPosition + 15);
        yPosition += 25;
      });
    }

    // Save the PDF
    pdf.save(`${data.project.projectName}_${data.timestamp}.pdf`);
  }

  private async exportToExcel(data: ExportData, options: ExportOptions): Promise<void> {
    const workbook = XLSX.utils.book_new();

    // Project Info Sheet
    const projectInfo = [
      ['Project Name', data.project.projectName],
      ['Generated', new Date().toLocaleDateString()],
      ['Total Devices', data.devices.length],
      ['Total Connections', data.connections.length],
      ['Version', data.version]
    ];
    const projectSheet = XLSX.utils.aoa_to_sheet(projectInfo);
    XLSX.utils.book_append_sheet(workbook, projectSheet, 'Project Info');

    // Devices Sheet
    if (options.includeDevices) {
      const deviceData = data.devices.map(device => ({
        'Device ID': device.id,
        'Name': device.name,
        'Type': device.type,
        'X Position': device.x,
        'Y Position': device.y,
        'IP Address': device.ip || 'N/A',
        'Status': 'Active'
      }));
      const deviceSheet = XLSX.utils.json_to_sheet(deviceData);
      XLSX.utils.book_append_sheet(workbook, deviceSheet, 'Devices');
    }

    // Connections Sheet
    if (options.includeConnections) {
      const connectionData = data.connections.map(conn => ({
        'Connection ID': conn.id,
        'From Device': conn.fromDeviceId,
        'To Device': conn.toDeviceId,
        'Cable Type': conn.cableType,
        'Cable Length': `${conn.length || 0}m`
      }));
      const connectionSheet = XLSX.utils.json_to_sheet(connectionData);
      XLSX.utils.book_append_sheet(workbook, connectionSheet, 'Connections');
    }

    // BOM Sheet
    if (options.includeBOM) {
      const bomData = this.generateBOM(data.devices);
      const bomSheet = XLSX.utils.json_to_sheet(bomData);
      XLSX.utils.book_append_sheet(workbook, bomSheet, 'Bill of Materials');
    }

    // Save the Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${data.project.projectName}_${data.timestamp}.xlsx`);
  }

  private async exportToJSON(data: ExportData, options: ExportOptions): Promise<void> {
    const exportData = {
      project: data.project,
      floors: data.floors,
      devices: options.includeDevices ? data.devices : [],
      connections: options.includeConnections ? data.connections : [],
      metadata: {
        timestamp: data.timestamp,
        version: data.version,
        exportOptions: options
      }
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, `${data.project.projectName}_${data.timestamp}.json`);
  }

  private async exportToCSV(data: ExportData, options: ExportOptions): Promise<void> {
    let csvContent = '';
    
    if (options.includeDevices) {
      csvContent += 'Device CSV Export\n';
      csvContent += 'ID,Name,Type,X,Y,IP\n';
      data.devices.forEach(device => {
        csvContent += `${device.id},${device.name},${device.type},${device.x},${device.y},${device.ip || 'N/A'}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${data.project.projectName}_devices_${data.timestamp}.csv`);
  }

  private async exportToDXF(data: ExportData, options: ExportOptions): Promise<void> {
    // Basic DXF export - simplified version
    let dxfContent = '';
    dxfContent += '0\nSECTION\n2\nHEADER\n';
    dxfContent += '0\nENDSEC\n';
    dxfContent += '0\nSECTION\n2\nENTITIES\n';

    // Add devices as circles
    data.devices.forEach(device => {
      dxfContent += '0\nCIRCLE\n';
      dxfContent += `10\n${device.x}\n`;
      dxfContent += `20\n${device.y}\n`;
      dxfContent += '40\n5\n'; // radius
    });

    // Add connections as lines
    data.connections.forEach(conn => {
      const fromDevice = data.devices.find(d => d.id === conn.fromDeviceId);
      const toDevice = data.devices.find(d => d.id === conn.toDeviceId);
      
      if (fromDevice && toDevice) {
        dxfContent += '0\nLINE\n';
        dxfContent += `10\n${fromDevice.x}\n`;
        dxfContent += `20\n${fromDevice.y}\n`;
        dxfContent += `11\n${toDevice.x}\n`;
        dxfContent += `21\n${toDevice.y}\n`;
      }
    });

    dxfContent += '0\nENDSEC\n';
    dxfContent += '0\nEOF\n';

    const blob = new Blob([dxfContent], { type: 'application/dxf' });
    saveAs(blob, `${data.project.projectName}_${data.timestamp}.dxf`);
  }

  private async exportToImage(data: ExportData, options: ExportOptions): Promise<void> {
    if (!data.canvas) {
      throw new Error('Canvas not available for image export');
    }

    const quality = options.quality === 'high' ? 1.0 : options.quality === 'medium' ? 0.8 : 0.6;
    
    data.canvas.toBlob((blob) => {
      if (blob) {
        saveAs(blob, `${data.project.projectName}_${data.timestamp}.png`);
      }
    }, 'image/png', quality);
  }

  private generateBOM(devices: AnyDevice[]): Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }> {
    const deviceCounts = devices.reduce((acc, device) => {
      const key = `${device.type}-${device.name}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bomItems = Object.entries(deviceCounts).map(([key, quantity]) => {
      const [type, name] = key.split('-');
      const unitPrice = this.getDevicePrice(type);
      return {
        name: `${type} - ${name}`,
        quantity,
        unitPrice,
        total: quantity * unitPrice
      };
    });

    return bomItems;
  }

  private getDevicePrice(deviceType: string): number {
    const prices: Record<string, number> = {
      'camera': 150,
      'nvr': 500,
      'switch': 100,
      'monitor': 200,
      'rack': 300,
      'accesspoint': 80
    };
    return prices[deviceType.toLowerCase()] || 100;
  }
}
