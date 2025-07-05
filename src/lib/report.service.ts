import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { ProjectState } from './types';
import { DEVICE_CONFIG } from './device-config';

// Helper to format currency
const formatCurrency = (amount: number) => {
    return amount.toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
};

export class ReportService {
    private project: ProjectState;

    constructor(project: ProjectState) {
        this.project = project;
    }

    private getBomData() {
        const allDevices = this.project.buildings.flatMap(b => b.floors.flatMap(f => f.devices));
        const allConnections = this.project.buildings.flatMap(b => b.floors.flatMap(f => f.connections));

        const deviceSummary = allDevices.reduce((acc, device) => {
            const config = DEVICE_CONFIG[device.type];
            if (!acc[device.type]) {
                acc[device.type] = { count: 0, total_price: 0, name: config?.name || device.type };
            }
            acc[device.type].count++;
            acc[device.type].total_price += device.price || 0;
            return acc;
        }, {} as Record<string, { count: number; total_price: number; name: string }>);

        const cableSummary = allConnections.reduce((acc, conn) => {
            const config = DEVICE_CONFIG[conn.cableType];
             if (!acc[conn.cableType]) {
                acc[conn.cableType] = { length: 0, total_price: 0, name: config?.name || conn.cableType };
            }
            acc[conn.cableType].length += conn.length || 0;
            acc[conn.cableType].total_price += conn.price || 0;
            return acc;
        }, {} as Record<string, { length: number; total_price: number; name: string }>);

        const grandTotal = Object.values(deviceSummary).reduce((s, i) => s + i.total_price, 0) + 
                           Object.values(cableSummary).reduce((s, i) => s + i.total_price, 0);

        return {
            devices: Object.values(deviceSummary),
            cables: Object.values(cableSummary),
            grandTotal,
        };
    }
    
    private generateHtml(): string {
        const bom = this.getBomData();

        return `
            <div id="report" style="font-family: Sarabun, sans-serif; padding: 40px; color: #333;">
                <h1 style="font-size: 2.5em; color: #005A9C; border-bottom: 2px solid #005A9C; padding-bottom: 10px;">
                    Project Report: ${this.project.projectName}
                </h1>
                <h2 style="font-size: 1.8em; margin-top: 40px; color: #007B8A; border-bottom: 1px solid #ccc; padding-bottom: 5px;">
                    Bill of Materials (BOM)
                </h2>
                
                <h3 style="font-size: 1.4em; margin-top: 20px;">Devices</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead style="background-color: #f2f2f2;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Item</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Quantity</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bom.devices.map(item => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 10px;">${item.name}</td>
                                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${item.count}</td>
                                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(item.total_price)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <h3 style="font-size: 1.4em; margin-top: 20px;">Cabling</h3>
                 <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead style="background-color: #f2f2f2;">
                        <tr>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Cable Type</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Total Length</th>
                            <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bom.cables.map(item => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 10px;">${item.name}</td>
                                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${item.length.toLocaleString()} m</td>
                                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${formatCurrency(item.total_price)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="text-align: right; margin-top: 30px; font-size: 1.8em; font-weight: bold; padding-top: 15px; border-top: 2px solid #333;">
                    Grand Total: ${formatCurrency(bom.grandTotal)}
                </div>
            </div>
        `;
    }

    public async generateReport(): Promise<void> {
        const reportHtml = this.generateHtml();
        const container = document.createElement('div');
        container.innerHTML = reportHtml;
        document.body.appendChild(container);

        const reportElement = document.getElementById('report');
        if (!reportElement) {
            document.body.removeChild(container);
            throw new Error('Report element could not be found.');
        }

        try {
            const canvas = await html2canvas(reportElement, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            pdf.save(`${this.project.projectName.replace(/\s/g, '_')}_Report.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            throw new Error('Failed to generate PDF from HTML content.');
        } finally {
            document.body.removeChild(container);
        }
    }
}
