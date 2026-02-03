import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { ClientRequest, ClientResponse } from '../../models/client.model';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  clients: ClientResponse[] = [];
  filteredClients: ClientResponse[] = [];
  searchTerm: string = '';
  showModal: boolean = false;
  isEditMode: boolean = false;
  selectedClient: ClientRequest = this.getEmptyClient();
  errorMessage: string = '';

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAllClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.filteredClients = data;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
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

  private extractErrorMessage(error: any): string {
    if (error.error?.errors) {
      const errors = error.error.errors;
      const errorMessages = Object.keys(errors).map(key => `${errors[key]}`).join('<br>');
      return errorMessages;
    }
    return error.error?.message || error.error?.error || 'Error al procesar la solicitud';
  }

  saveClient(): void {
    if (this.isEditMode) {
      const clientToUpdate = this.clients.find(c => c.clientId === this.selectedClient.clientId);
      if (clientToUpdate) {
        this.clientService.updateClient(clientToUpdate.id, this.selectedClient).subscribe({
          next: () => {
            this.loadClients();
            this.closeModal();
          },
          error: (error) => {
            console.error('Error updating client:', error);
            this.errorMessage = this.extractErrorMessage(error);
          }
        });
      }
    } else {
      this.clientService.createClient(this.selectedClient).subscribe({
        next: () => {
          this.loadClients();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating client:', error);
          this.errorMessage = this.extractErrorMessage(error);
        }
      });
    }
  }

  deleteClient(client: ClientResponse): void {
    if (confirm(`¿Está seguro de eliminar el cliente ${client.name}?`)) {
      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          this.loadClients();
        },
        error: (error) => {
          console.error('Error deleting client:', error);
          const errorMsg = this.extractErrorMessage(error);
          alert(errorMsg);
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
