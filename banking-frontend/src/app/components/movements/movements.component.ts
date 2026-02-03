import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovementService } from '../../services/movement.service';
import { AccountService } from '../../services/account.service';
import { MovementRequest, MovementResponse } from '../../models/movement.model';
import { AccountResponse } from '../../models/account.model';

@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movements.component.html',
  styleUrls: ['./movements.component.css']
})
export class MovementsComponent implements OnInit {
  movements: MovementResponse[] = [];
  filteredMovements: MovementResponse[] = [];
  accounts: AccountResponse[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedMovement: MovementRequest = this.getEmptyMovement();
  selectedMovementId?: number;
  errorMessage: string = '';

  constructor(
    private movementService: MovementService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.loadMovements();
    this.loadAccounts();
  }

  loadMovements(): void {
    this.movementService.getAllMovements().subscribe({
      next: (data) => {
        this.movements = data;
        this.filteredMovements = data;
        this.enrichMovementsWithAccountNumbers();
      },
      error: (error) => {
        console.error('Error loading movements:', error);
        this.errorMessage = 'Error al cargar los movimientos';
      }
    });
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data;
        this.enrichMovementsWithAccountNumbers();
      },
      error: (error) => {
        console.error('Error loading accounts:', error);
      }
    });
  }

  enrichMovementsWithAccountNumbers(): void {
    if (this.accounts.length > 0 && this.movements.length > 0) {
      this.movements.forEach(movement => {
        const account = this.accounts.find(a => a.id === movement.accountId);
        if (account) {
          movement.accountNumber = account.accountNumber;
        }
      });
      this.filteredMovements = [...this.movements];
    }
  }

  filterMovements(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredMovements = this.movements.filter(movement =>
      movement.movementType.toLowerCase().includes(term) ||
      (movement.accountNumber && movement.accountNumber.toLowerCase().includes(term))
    );
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedMovement = this.getEmptyMovement();
    this.selectedMovementId = undefined;
    this.errorMessage = '';
    this.showModal = true;
  }

  openEditModal(movement: MovementResponse): void {
    this.isEditMode = true;
    this.selectedMovementId = movement.id;
    this.selectedMovement = {
      date: movement.date,
      movementType: movement.movementType,
      value: movement.value,
      accountId: movement.accountId
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedMovement = this.getEmptyMovement();
    this.selectedMovementId = undefined;
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

  saveMovement(): void {
    if (this.isEditMode && this.selectedMovementId) {
      this.movementService.updateMovement(this.selectedMovementId, this.selectedMovement).subscribe({
        next: () => {
          this.loadMovements();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating movement:', error);
          this.errorMessage = this.extractErrorMessage(error);
        }
      });
    } else {
      this.movementService.createMovement(this.selectedMovement).subscribe({
        next: () => {
          this.loadMovements();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating movement:', error);
          this.errorMessage = this.extractErrorMessage(error);
        }
      });
    }
  }

  deleteMovement(movement: MovementResponse): void {
    if (confirm(`¿Está seguro de eliminar este movimiento?`)) {
      this.movementService.deleteMovement(movement.id).subscribe({
        next: () => {
          this.loadMovements();
        },
        error: (error) => {
          console.error('Error deleting movement:', error);
          const errorMsg = this.extractErrorMessage(error);
          alert(errorMsg);
        }
      });
    }
  }

  getAccountNumber(accountId: number): string {
    const account = this.accounts.find(a => a.id === accountId);
    return account ? account.accountNumber : 'Desconocido';
  }

  private getEmptyMovement(): MovementRequest {
    return {
      date: new Date().toISOString(),
      movementType: '',
      value: 0,
      accountId: 0
    };
  }
}
