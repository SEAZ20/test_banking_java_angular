import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportsComponent } from './reports.component';
import { ReportService } from '../../services/report.service';
import { ClientService } from '../../services/client.service';
import { of, throwError } from 'rxjs';
import { AccountStatementReport } from '../../models/report.model';
import { ClientResponse } from '../../models/client.model';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;
  let mockReportService: jest.Mocked<ReportService>;
  let mockClientService: jest.Mocked<ClientService>;

  const mockReport: AccountStatementReport[] = [
    {
      date: '2026-02-01',
      client: 'Juan Perez',
      accountNumber: '123456',
      type: 'Ahorro',
      initialBalance: 1000,
      status: true,
      movement: "500",
      availableBalance: 1500
    },
    {
      date: '2026-02-01',
      client: 'Juan Perez',
      accountNumber: '123456',
      type: 'Ahorro',
      initialBalance: 1500,
      status: true,
      movement: "-200",
      availableBalance: 1300
    }
  ];

  beforeEach(async () => {
    mockReportService = {
      generateAccountStatement: jest.fn()
    } as any;

    mockClientService = {
      getAllClients: jest.fn().mockReturnValue(of([])),
      getClientById: jest.fn(),
      createClient: jest.fn(),
      updateClient: jest.fn(),
      deleteClient: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [ReportsComponent],
      providers: [
        { provide: ReportService, useValue: mockReportService },
        { provide: ClientService, useValue: mockClientService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('generateReport', () => {
    it('should generate report successfully', () => {
      mockReportService.generateAccountStatement.mockReturnValue(of(mockReport));
      component.reportParams.clientId = 1;
      component.reportParams.format = 'json';

      component.generateReport();

      expect(mockReportService.generateAccountStatement).toHaveBeenCalled();
      expect(component.reportData).toEqual(mockReport);
      expect(component.filteredReportData).toEqual(mockReport);
    });

    it('should handle error when generating report', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorResponse = { 
        error: { 
          message: 'Client not found' 
        } 
      };
      mockReportService.generateAccountStatement.mockReturnValue(throwError(() => errorResponse));
      component.reportParams.clientId = 1;

      component.generateReport();

      expect(component.errorMessage).toContain('Client not found');
      consoleErrorSpy.mockRestore();
    });

    it('should not generate report without client selected', () => {
      component.reportParams.clientId = 0;

      component.generateReport();

      expect(component.errorMessage).toBe('Debe seleccionar un cliente');
      expect(mockReportService.generateAccountStatement).not.toHaveBeenCalled();
    });
  });

  describe('downloadPdf', () => {
    it('should not download if no PDF data', () => {
      component.pdfData = undefined;
      
      component.downloadPdf();

      expect(component.pdfData).toBeUndefined();
    });

    it('should handle error when downloading PDF', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      component.pdfData = 'invalid-base64';

      component.downloadPdf();

      expect(component.errorMessage).toBe('Error al descargar el PDF');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('filterReportData', () => {
    beforeEach(() => {
      component.reportData = mockReport;
      component.filteredReportData = mockReport;
    });

    it('should filter by account number', () => {
      component.searchTerm = '123456';
      component.filterReportData();

      expect(component.filteredReportData?.length).toBe(2);
    });

    it('should filter by account type', () => {
      component.searchTerm = 'ahorro';
      component.filterReportData();

      expect(component.filteredReportData?.length).toBe(2);
      expect(component.filteredReportData?.[0].type).toBe('Ahorro');
    });

    it('should filter by client name', () => {
      component.searchTerm = 'juan';
      component.filterReportData();

      expect(component.filteredReportData?.length).toBe(2);
      expect(component.filteredReportData?.[0].client).toBe('Juan Perez');
    });

    it('should return all data when search term is empty', () => {
      component.searchTerm = '';
      component.filterReportData();

      expect(component.filteredReportData?.length).toBe(2);
    });

    it('should return all data when filter term does not match', () => {
      component.searchTerm = 'nonexistent';
      component.filterReportData();

      expect(component.filteredReportData?.length).toBe(0);
    });
  });
});
