import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ReportService } from '../../services/report.service';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification.service';
import { AccountStatementReport, ReportParams } from '../../models/report.model';
import { ClientResponse } from '../../models/client.model';

/**
 * Componente para generación de reportes
 * Implementa OnDestroy para prevenir memory leaks
 */
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy {
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

  private destroy$ = new Subject<void>();

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
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClients(): void {
    this.clientService.getAllClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.clients = data;
        },
        error: (error) => {
          const errorMsg = this.notificationService.extractErrorMessage(error);
          this.notificationService.error(errorMsg);
        }
      });
  }

  generateReport(): void {
    if (this.reportParams.clientId === 0) {
      this.errorMessage = 'Debe seleccionar un cliente';
      this.notificationService.warning(this.errorMessage);
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

    this.reportService.generateAccountStatement(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (this.reportParams.format === 'pdf') {
            this.pdfData = data;
            this.notificationService.success('Reporte PDF generado exitosamente');
          } else {
            this.reportData = data;
            this.filteredReportData = data;
            this.searchTerm = '';
            this.notificationService.success('Reporte generado exitosamente');
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.errorMessage = this.notificationService.extractErrorMessage(error);
          this.notificationService.error(this.errorMessage);
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
      this.notificationService.success('PDF descargado exitosamente');
    } catch (error) {
      const errorMsg = 'Error al descargar el PDF';
      this.errorMessage = errorMsg;
      this.notificationService.error(errorMsg);
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
