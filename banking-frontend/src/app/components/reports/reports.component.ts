import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../services/report.service';
import { ClientService } from '../../services/client.service';
import { AccountStatementReport, ReportParams } from '../../models/report.model';
import { ClientResponse } from '../../models/client.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent {
  clients: ClientResponse[] = [];
  reportParams: ReportParams = {
    clientId: 0,
    startDate: this.getDefaultStartDate(),
    endDate: this.getDefaultEndDate(),
    format: 'json'
  };
  reportData?: AccountStatementReport[];
  filteredReportData?: AccountStatementReport[];
  pdfData?: string;
  searchTerm: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  parseFloat(value: string): number {
    return parseFloat(value);
  }

  filterReportData(): void {
    if (!this.reportData) return;
    
    const term = this.searchTerm.toLowerCase();
    this.filteredReportData = this.reportData.filter(item =>
      item.accountNumber.toLowerCase().includes(term) ||
      item.type.toLowerCase().includes(term) ||
      item.client.toLowerCase().includes(term)
    );
  }

  constructor(
    private reportService: ReportService,
    private clientService: ClientService
  ) {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  private extractErrorMessage(error: any): string {
    if (error.error?.errors) {
      const errors = error.error.errors;
      const errorMessages = Object.keys(errors).map(key => `${errors[key]}`).join('<br>');
      return errorMessages;
    }
    return error.error?.message || error.error?.error || 'Error al procesar la solicitud';
  }

  generateReport(): void {
    if (this.reportParams.clientId === 0) {
      this.errorMessage = 'Debe seleccionar un cliente';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.reportData = undefined;
    this.pdfData = undefined;

    const params = {
      ...this.reportParams,
      startDate: this.formatDateForApi(this.reportParams.startDate),
      endDate: this.formatDateForApi(this.reportParams.endDate)
    };

    this.reportService.generateAccountStatement(params).subscribe({
      next: (data) => {
        if (this.reportParams.format === 'pdf') {
          this.pdfData = data;
        } else {
          this.reportData = data;
          this.filteredReportData = data;
          this.searchTerm = '';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.errorMessage = this.extractErrorMessage(error);
        this.isLoading = false;
      }
    });
  }

  downloadPdf(): void {
    if (!this.pdfData) return;

    try {
      const byteCharacters = atob(this.pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estado-cuenta-${this.reportParams.clientId}-${Date.now()}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      this.errorMessage = 'Error al descargar el PDF';
    }
  }

  private formatDateForApi(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19);
  }

  private getDefaultStartDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().slice(0, 16);
  }

  private getDefaultEndDate(): string {
    const date = new Date();
    return date.toISOString().slice(0, 16);
  }
}
