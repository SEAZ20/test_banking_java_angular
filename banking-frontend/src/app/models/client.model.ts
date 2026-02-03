export interface ClientRequest {
  name: string;
  gender?: string;
  age?: number;
  identification: string;
  address?: string;
  phone?: string;
  clientId: string;
  password: string;
  status?: boolean;
}

export interface ClientResponse {
  id: number;
  name: string;
  gender?: string;
  age?: number;
  identification: string;
  address?: string;
  phone?: string;
  clientId: string;
  status: boolean;
}
