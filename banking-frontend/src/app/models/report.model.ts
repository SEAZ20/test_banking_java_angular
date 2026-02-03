export interface ReportParams {
  clientId: number;
  startDate: string;
  endDate: string;
  format?: 'json' | 'pdf';
}

export interface AccountStatementReport {
  date: string;
  client: string;
  accountNumber: string;
  type: string;
  initialBalance: number;
  status: boolean;
  movement: string;
  availableBalance: number;
}
