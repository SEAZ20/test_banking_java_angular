export interface AccountRequest {
  accountNumber: string;
  accountType: string;
  initialBalance: number;
  status?: boolean;
  clientId: number;
}

export interface AccountResponse {
  id: number;
  accountNumber: string;
  accountType: string;
  initialBalance: number;
  currentBalance: number;
  status: boolean;
  clientId: number;
  clientName?: string;
}
