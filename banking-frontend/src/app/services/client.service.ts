import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClientRequest, ClientResponse } from '../models/client.model';
import { BaseHttpService } from './base-http.service';

/**
 * Servicio para gestión de clientes
 * Hereda de BaseHttpService para reutilizar operaciones CRUD comunes
 */
@Injectable({
  providedIn: 'root'
})
export class ClientService extends BaseHttpService<ClientRequest, ClientResponse> {
  constructor(http: HttpClient) {
    super(http, 'clients');
  }

  // Métodos de conveniencia que delegan a la clase base
  getAllClients(): Observable<ClientResponse[]> {
    return this.getAll();
  }

  getClientById(id: number): Observable<ClientResponse> {
    return this.getById(id);
  }

  createClient(client: ClientRequest): Observable<ClientResponse> {
    return this.create(client);
  }

  updateClient(id: number, client: ClientRequest): Observable<ClientResponse> {
    return this.update(id, client);
  }

  deleteClient(id: number): Observable<void> {
    return this.delete(id);
  }
}
