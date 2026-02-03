export interface MovementRequest {
  date?: string;
  movementType: string;
  value: number;
  accountId: number;
}

export interface MovementResponse {
  id: number;
  date: string;
  movementType: string;
  value: number;
  balance: number;
  accountId: number;
  accountNumber?: string;
}
