import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateReportLayoutAction } from '@/app/actions';
import type { ProjectState } from './types';

const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const MARGIN = 40;


export class ReportService {
  private doc: jsPDF;
  private project: ProjectState;

  constructor(project: ProjectState) {
    this.doc = new jsPDF('p', 'pt', 'a4');
    this.project = project;
  }
  
  private drawTitlePage(section: any) {
    this.doc.setFontSize(36);
    this.doc.text(this.project.projectName, A4_WIDTH / 2, A4_HEIGHT / 2, { align: 'center' });
    this.doc.setFontSize(14);
    this.doc.text(`Project Documentation`, A4_WIDTH / 2, A4_HEIGHT / 2 + 30, { align: 'center' });
  }
  
  private drawSummaryPage(section: any) {
    this.doc.setFontSize(22);
    this.doc.text(section.title, MARGIN, MARGIN + 60);
    this.doc.setFontSize(12);
    const textLines = this.doc.splitTextToSize(section.content, A4_WIDTH - MARGIN * 2);
    this.doc.text(textLines, MARGIN, MARGIN + 90);
  }
  
  private addHeader() {
    this.doc.setFontSize(10);
    this.doc.setTextColor(150);
    this.doc.text(this.project.projectName, MARGIN, MARGIN / 2);
    this.doc.text('AI Generated Report', A4_WIDTH - MARGIN, MARGIN / 2, { align: 'right' });
    this.doc.line(MARGIN, MARGIN / 2 + 10, A4_WIDTH - MARGIN, MARGIN / 2 + 10);
  }

  private addFooter(pageNumber: number) {
    this.doc.setFontSize(10);
    this.doc.setTextColor(150);
    this.doc.text(`Page ${pageNumber}`, A4_WIDTH / 2, A4_HEIGHT - MARGIN / 2, { align: 'center' });
  }

  public async generateReport() {
    const projectInfo = {
      projectName: this.project.projectName,
      buildingCount: this.project.buildings.length,
      deviceCount: this.project.buildings.flatMap(b => b.floors.flatMap(f => f.devices)).length,
      totalBudget: 100000, 
      criticalAlerts: 5,   
    };

    const result = await generateReportLayoutAction(projectInfo);

    if (!result.success || !result.data.layout || result.data.layout.length === 0) {
      throw new Error("AI failed to generate a report layout.");
    }
    
    const layout = result.data.layout;
    let pageCount = 1;

    for (const section of layout) {
        if (pageCount > 1) {
            this.doc.addPage();
        }
        
        if (section.type !== 'TITLE') {
            this.addHeader(); 
        }

        switch (section.type) {
            case 'TITLE':
                this.drawTitlePage(section);
                break;
            case 'SUMMARY':
                this.drawSummaryPage(section);
                break;
            default:
                this.doc.text(`Unsupported section type: ${section.type}`, MARGIN, MARGIN);
        }
        
        this.addFooter(pageCount);
        pageCount++;
    }

    this.doc.save(`${this.project.projectName}_AI_Report.pdf`);
  }
}
