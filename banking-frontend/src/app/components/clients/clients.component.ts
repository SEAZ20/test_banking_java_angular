import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification.service';
import { ClientRequest, ClientResponse } from '../../models/client.model';

/**
 * Componente para gestión de clientes
 * Implementa OnDestroy para prevenir memory leaks
 */
@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit, OnDestroy {
  clients: ClientResponse[] = [];
  filteredClients: ClientResponse[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedClient: ClientRequest = this.getEmptyClient();
  errorMessage: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private clientService: ClientService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadClients(): void {
    this.clientService.getAllClients()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.clients = data;
          this.filteredClients = data;
        },
        error: (error) => {
          const errorMsg = this.notificationService.extractErrorMessage(error);
          this.notificationService.error(errorMsg);
          this.errorMessage = 'Error al cargar los clientes';
        }
      });
  }

  filterClients(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client =>
      client.name.toLowerCase().includes(term) ||
      client.identification.toLowerCase().includes(term) ||
      client.clientId.toLowerCase().includes(term)
    );
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedClient = this.getEmptyClient();
    this.errorMessage = '';
    this.showModal = true;
  }

  openEditModal(client: ClientResponse): void {
    this.isEditMode = true;
    this.selectedClient = {
      name: client.name,
      gender: client.gender,
      age: client.age,
      identification: client.identification,
      address: client.address,
      phone: client.phone,
      clientId: client.clientId,
      password: '',
      status: client.status
    };
    this.errorMessage = '';
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedClient = this.getEmptyClient();
    this.errorMessage = '';
  }

  saveClient(): void {
    if (this.isEditMode) {
      const clientToUpdate = this.clients.find(c => c.clientId === this.selectedClient.clientId);
      if (clientToUpdate) {
        this.clientService.updateClient(clientToUpdate.id, this.selectedClient)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.notificationService.success('Cliente actualizado exitosamente');
              this.loadClients();
              this.closeModal();
            },
            error: (error) => {
              this.errorMessage = this.notificationService.extractErrorMessage(error);
              this.notificationService.error(this.errorMessage);
            }
          });
      }
    } else {
      this.clientService.createClient(this.selectedClient)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Cliente creado exitosamente');
            this.loadClients();
            this.closeModal();
          },
          error: (error) => {
            this.errorMessage = this.notificationService.extractErrorMessage(error);
            this.notificationService.error(this.errorMessage);
          }
        });
    }
  }

  deleteClient(client: ClientResponse): void {
    if (this.notificationService.confirm(`¿Está seguro de eliminar el cliente ${client.name}?`)) {
      this.clientService.deleteClient(client.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.notificationService.success('Cliente eliminado exitosamente');
            this.loadClients();
          },
          error: (error) => {
            const errorMsg = this.notificationService.extractErrorMessage(error);
            this.notificationService.error(errorMsg);
            this.notificationService.alert(errorMsg);
          }
        });
    }
  }

  private getEmptyClient(): ClientRequest {
    return {
      name: '',
      gender: '',
      age: undefined,
      identification: '',
      address: '',
      phone: '',
      clientId: '',
      password: '',
      status: true
    };
  }
}
