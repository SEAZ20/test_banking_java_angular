import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MovementService } from '../../services/movement.service';
import { AccountService } from '../../services/account.service';
import { NotificationService } from '../../services/notification.service';
import { MovementRequest, MovementResponse } from '../../models/movement.model';
import { AccountResponse } from '../../models/account.model';

/**
 * Componente para gestión de movimientos
 * Implementa OnDestroy para prevenir memory leaks
 */
@Component({
  selector: 'app-movements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movements.component.html',
  styleUrls: ['./movements.component.css']
})
export class MovementsComponent implements OnInit, OnDestroy {
  movements: MovementResponse[] = [];
  filteredMovements: MovementResponse[] = [];
  accounts: AccountResponse[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedMovement: MovementRequest = this.getEmptyMovement();
  selectedMovementId?: number;
  errorMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private movementService: MovementService,
    private accountService: AccountService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadMovements();
    this.loadAccounts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMovements(): void {
    this.movementService.getAllMovements()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.movements = data;
          this.filteredMovements = data;
          this.enrichMovementsWithAccountNumbers();
        },
        error: (error) => {
          const errorMsg = this.notificationService.extractErrorMessage(error);
          this.notificationService.error(errorMsg);
          this.errorMessage = 'Error al cargar los movimientos';
        }
      });
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.accounts = data;
          this.enrichMovementsWithAccountNumbers();
        },
        error: (error) => {
          const errorMsg = this.notificationService.extractErrorMessage(error);
          this.notificationService.error(errorMsg);
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

  saveMovement(): void {
    if (this.isEditMode && this.selectedMovementId) {
      this.movementService.updateMovement(this.selectedMovementId, this.selectedMovement)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Movimiento actualizado exitosamente');
            this.loadMovements();
            this.closeModal();
          },
          error: (error) => {
            this.errorMessage = this.notificationService.extractErrorMessage(error);
            this.notificationService.error(this.errorMessage);
          }
        });
    } else {
      this.movementService.createMovement(this.selectedMovement)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Movimiento creado exitosamente');
            this.loadMovements();
            this.closeModal();
          },
          error: (error) => {
            this.errorMessage = this.notificationService.extractErrorMessage(error);
            this.notificationService.error(this.errorMessage);
          }
        });
    }
  }

  deleteMovement(movement: MovementResponse): void {
    if (this.notificationService.confirm(`¿Está seguro de eliminar este movimiento?`)) {
      this.movementService.deleteMovement(movement.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Movimiento eliminado exitosamente');
            this.loadMovements();
          },
          error: (error) => {
            const errorMsg = this.notificationService.extractErrorMessage(error);
            this.notificationService.error(errorMsg);
            this.notificationService.alert(errorMsg);
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
