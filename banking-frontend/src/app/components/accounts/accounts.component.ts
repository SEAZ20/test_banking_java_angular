import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { ClientService } from '../../services/client.service';
import { AccountRequest, AccountResponse } from '../../models/account.model';
import { ClientResponse } from '../../models/client.model';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.component.html',
  styleUrls: ['./accounts.component.css']
})
export class AccountsComponent implements OnInit {
  accounts: AccountResponse[] = [];
  filteredAccounts: AccountResponse[] = [];
  clients: ClientResponse[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedAccount: AccountRequest = this.getEmptyAccount();
  selectedAccountId?: number;
  errorMessage: string = '';

  constructor(
    private accountService: AccountService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
    this.loadClients();
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.filteredAccounts = data;
        this.enrichAccountsWithClientNames();
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
        this.errorMessage = 'Error al cargar las cuentas';
      }
    });
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.enrichAccountsWithClientNames();
      },
      error: (error) => {
        console.error('Error loading clients:', error);
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

  private extractErrorMessage(error: any): string {
    if (error.error?.errors) {
      const errors = error.error.errors;
      const errorMessages = Object.keys(errors).map(key => `${errors[key]}`).join('<br>');
      return errorMessages;
    }
    return error.error?.message || error.error?.error || 'Error al procesar la solicitud';
  }

  saveAccount(): void {
    if (this.isEditMode && this.selectedAccountId) {
      this.accountService.updateAccount(this.selectedAccountId, this.selectedAccount).subscribe({
        next: () => {
          this.loadAccounts();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating account:', error);
          this.errorMessage = this.extractErrorMessage(error);
        }
      });
    } else {
      this.accountService.createAccount(this.selectedAccount).subscribe({
        next: () => {
          this.loadAccounts();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating account:', error);
          this.errorMessage = this.extractErrorMessage(error);
        }
      });
    }
  }

  deleteAccount(account: AccountResponse): void {
    if (confirm(`¿Está seguro de eliminar la cuenta ${account.accountNumber}?`)) {
      this.accountService.deleteAccount(account.id).subscribe({
        next: () => {
          this.loadAccounts();
        },
        error: (error) => {
          console.error('Error deleting account:', error);
          const errorMsg = this.extractErrorMessage(error);
          alert(errorMsg);
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
