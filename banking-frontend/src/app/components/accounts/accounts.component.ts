import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification.service';
import { AccountRequest, AccountResponse } from '../../models/account.model';
import { ClientResponse } from '../../models/client.model';

/**
 * Componente para gestión de cuentas
 * Implementa OnDestroy para prevenir memory leaks
 */
@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit, OnDestroy {
  accounts: AccountResponse[] = [];
  filteredAccounts: AccountResponse[] = [];
  clients: ClientResponse[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedAccount: AccountRequest = this.getEmptyAccount();
  selectedAccountId?: number;
  errorMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private accountService: AccountService,
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.accounts = data;
          this.filteredAccounts = data;
          this.enrichAccountsWithClientNames();
        },
        error: (error) => {
          const errorMsg = this.notificationService.extractErrorMessage(error);
          this.notificationService.error(errorMsg);
          this.errorMessage = 'Error al cargar las cuentas';
        }
      });
  }

  loadClients(): void {
    this.clientService.getAllClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.clients = data;
          this.enrichAccountsWithClientNames();
        },
        error: (error) => {
          const errorMsg = this.notificationService.extractErrorMessage(error);
          this.notificationService.error(errorMsg);
        }
      });
  }

  enrichAccountsWithClientNames(): void {
    if (this.clients.length > 0 && this.accounts.length > 0) {
      this.accounts.forEach(account => {
        const client = this.clients.find(c => c.id === account.clientId);
        if (client) {
          account.clientName = client.name;
        }
      });
      this.filteredAccounts = [...this.accounts];
    }
  }

  filterAccounts(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredAccounts = this.accounts.filter(account =>
      account.accountNumber.toLowerCase().includes(term) ||
      account.accountType.toLowerCase().includes(term) ||
      (account.clientName && account.clientName.toLowerCase().includes(term))
    );
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedAccount = this.getEmptyAccount();
    this.selectedAccountId = undefined;
    this.errorMessage = '';
    this.showModal = true;
  }

  openEditModal(account: AccountResponse): void {
    this.isEditMode = true;
    this.selectedAccountId = account.id;
    this.selectedAccount = {
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      initialBalance: account.initialBalance,
      status: account.status,
      clientId: account.clientId
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedAccount = this.getEmptyAccount();
    this.selectedAccountId = undefined;
    this.errorMessage = '';
  }

  saveAccount(): void {
    if (this.isEditMode && this.selectedAccountId) {
      this.accountService.updateAccount(this.selectedAccountId, this.selectedAccount)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Cuenta actualizada exitosamente');
            this.loadAccounts();
            this.closeModal();
          },
          error: (error) => {
            this.errorMessage = this.notificationService.extractErrorMessage(error);
            this.notificationService.error(this.errorMessage);
          }
        });
    } else {
      this.accountService.createAccount(this.selectedAccount)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Cuenta creada exitosamente');
            this.loadAccounts();
            this.closeModal();
          },
          error: (error) => {
            this.errorMessage = this.notificationService.extractErrorMessage(error);
            this.notificationService.error(this.errorMessage);
          }
        });
    }
  }

  deleteAccount(account: AccountResponse): void {
    if (this.notificationService.confirm(`¿Está seguro de eliminar la cuenta ${account.accountNumber}?`)) {
      this.accountService.deleteAccount(account.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Cuenta eliminada exitosamente');
            this.loadAccounts();
          },
          error: (error) => {
            const errorMsg = this.notificationService.extractErrorMessage(error);
            this.notificationService.error(errorMsg);
            this.notificationService.alert(errorMsg);
          }
        });
    }
  }

  getClientName(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? client.name : 'Desconocido';
  }

  private getEmptyAccount(): AccountRequest {
    return {
      accountNumber: '',
      accountType: '',
      initialBalance: 0,
      status: true,
      clientId: 0
    };
  }
}
