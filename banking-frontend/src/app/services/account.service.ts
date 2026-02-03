import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountRequest, AccountResponse } from '../models/account.model';
import { BaseHttpService } from './base-http.service';

/**
 * Servicio para gestión de cuentas
 * Hereda de BaseHttpService para reutilizar operaciones CRUD comunes
 */
@Injectable({
  providedIn: 'root'
})
export class AccountService extends BaseHttpService<AccountRequest, AccountResponse> {
  constructor(http: HttpClient) {
    super(http, 'accounts');
  }

  getAllAccounts(): Observable<AccountResponse[]> {
    return this.getAll();
  }

  getAccountById(id: number): Observable<AccountResponse> {
    return this.getById(id);
  }

  createAccount(account: AccountRequest): Observable<AccountResponse> {
    return this.create(account);
  }

  updateAccount(id: number, account: AccountRequest): Observable<AccountResponse> {
    return this.update(id, account);
  }

  deleteAccount(id: number): Observable<void> {
    return this.delete(id);
  }
}
