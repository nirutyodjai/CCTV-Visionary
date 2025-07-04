import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateReportLayoutAction } from './actions'; // We'll create this action next
import type { ProjectState } from './types';

// ... constants

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
    // The 'splitTextToSize' is crucial for handling paragraphs.
    const textLines = this.doc.splitTextToSize(section.content, A4_WIDTH - MARGIN * 2);
    this.doc.text(textLines, MARGIN, MARGIN + 90);
  }
  
  // ... other draw methods for BUDGET, BOM etc. would be here
  
  public async generateReport() {
    const projectInfo = {
      projectName: this.project.projectName,
      buildingCount: this.project.buildings.length,
      deviceCount: this.project.buildings.flatMap(b => b.floors.flatMap(f => f.devices)).length,
      totalBudget: 100000, // This would be calculated from a helper
      criticalAlerts: 5,   // This would be calculated too
    };

    // 1. Get the layout from AI
    const { layout } = await generateReportLayoutAction(projectInfo);

    if (!layout || layout.length === 0) {
      throw new Error("AI failed to generate a report layout.");
    }
    
    let pageCount = 1;

    // 2. Follow the AI's layout
    for (const section of layout) {
        if (pageCount > 1) {
            this.doc.addPage();
        }
        
        // Add header and footer for all pages except title
        if (section.type !== 'TITLE') {
            // this.addHeader(); 
        }

        switch (section.type) {
            case 'TITLE':
                this.drawTitlePage(section);
                break;
            case 'SUMMARY':
                this.drawSummaryPage(section);
                break;
            // case 'BUDGET': await this.drawBudgetPage(section); break;
            // case 'FLOORPLAN': await this.drawFloorplanPage(section); break;
            default:
                this.doc.text(`Unsupported section type: ${section.type}`, MARGIN, MARGIN);
        }
        
        // this.addFooter(pageCount);
        pageCount++;
    }

    this.doc.save(`${this.project.projectName}_AI_Report.pdf`);
  }
}
