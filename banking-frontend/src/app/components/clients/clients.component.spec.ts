import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientsComponent } from './clients.component';
import { ClientService } from '../../services/client.service';
import { NotificationService } from '../../services/notification.service';
import { of, throwError } from 'rxjs';
import { ClientResponse } from '../../models/client.model';

describe('ClientsComponent', () => {
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;
  let mockClientService: jest.Mocked<ClientService>;
  let mockNotificationService: jest.Mocked<NotificationService>;

  const mockClients: ClientResponse[] = [
    {
      id: 1,
      name: 'Juan Perez',
      gender: 'Masculino',
      age: 30,
      identification: '12345678',
      address: 'Calle 123',
      phone: '0987654321',
      clientId: 'juan123',
      status: true
    },
    {
      id: 2,
      name: 'Maria Lopez',
      gender: 'Femenino',
      age: 25,
      identification: '87654321',
      address: 'Avenida 456',
      phone: '0912345678',
      clientId: 'maria456',
      status: true
    }
  ];

  beforeEach(async () => {
    mockClientService = {
      getAllClients: jest.fn(),
      getClientById: jest.fn(),
      createClient: jest.fn(),
      updateClient: jest.fn(),
      deleteClient: jest.fn()
    } as any;

    mockNotificationService = {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
      confirm: jest.fn(),
      alert: jest.fn(),
      extractErrorMessage: jest.fn().mockReturnValue('Error message')
    } as any;

    await TestBed.configureTestingModule({
      imports: [ClientsComponent],
      providers: [
        { provide: ClientService, useValue: mockClientService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load clients on initialization', () => {
      mockClientService.getAllClients.mockReturnValue(of(mockClients));
      
      component.ngOnInit();

      expect(mockClientService.getAllClients).toHaveBeenCalled();
      expect(component.clients).toEqual(mockClients);
      expect(component.filteredClients).toEqual(mockClients);
    });

    it('should handle error when loading clients', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorResponse = { status: 500, message: 'Server error' };
      mockClientService.getAllClients.mockReturnValue(throwError(() => errorResponse));
      
      component.ngOnInit();

      expect(component.errorMessage).toBe('Error al cargar los clientes');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('filterClients', () => {
    beforeEach(() => {
      component.clients = mockClients;
      component.filteredClients = mockClients;
    });

    it('should filter clients by name', () => {
      component.searchTerm = 'juan';
      component.filterClients();

      expect(component.filteredClients.length).toBe(1);
      expect(component.filteredClients[0].name).toBe('Juan Perez');
    });

    it('should filter clients by identification', () => {
      component.searchTerm = '87654321';
      component.filterClients();

      expect(component.filteredClients.length).toBe(1);
      expect(component.filteredClients[0].identification).toBe('87654321');
    });

    it('should filter clients by clientId', () => {
      component.searchTerm = 'maria456';
      component.filterClients();

      expect(component.filteredClients.length).toBe(1);
      expect(component.filteredClients[0].clientId).toBe('maria456');
    });

    it('should return all clients when search term is empty', () => {
      component.searchTerm = '';
      component.filterClients();

      expect(component.filteredClients.length).toBe(2);
    });
  });

  describe('openCreateModal', () => {
    it('should open modal for creating new client', () => {
      component.openCreateModal();

      expect(component.showModal).toBe(true);
      expect(component.isEditMode).toBe(false);
      expect(component.errorMessage).toBe('');
    });
  });

  describe('openEditModal', () => {
    it('should open modal for editing existing client', () => {
      component.openEditModal(mockClients[0]);

      expect(component.showModal).toBe(true);
      expect(component.isEditMode).toBe(true);
      expect(component.selectedClient.name).toBe(mockClients[0].name);
    });
  });

  describe('saveClient', () => {
    it('should create new client successfully', () => {
      mockClientService.createClient.mockReturnValue(of(mockClients[0]));
      mockClientService.getAllClients.mockReturnValue(of(mockClients));
      component.isEditMode = false;

      component.saveClient();

      expect(mockClientService.createClient).toHaveBeenCalled();
      expect(component.showModal).toBe(false);
    });

    it('should update existing client successfully', () => {
      mockClientService.updateClient.mockReturnValue(of(mockClients[0]));
      mockClientService.getAllClients.mockReturnValue(of(mockClients));
      component.isEditMode = true;
      component.clients = mockClients;
      component.selectedClient = { ...mockClients[0], password: 'test' };

      component.saveClient();

      expect(mockClientService.updateClient).toHaveBeenCalled();
      expect(component.showModal).toBe(false);
    });

    it('should handle error when creating client', () => {
      const errorResponse = { 
        error: { 
          errors: { name: 'Name is required' } 
        } 
      };
      mockNotificationService.extractErrorMessage.mockReturnValue('Name is required');
      mockClientService.createClient.mockReturnValue(throwError(() => errorResponse));
      component.isEditMode = false;

      component.saveClient();

      expect(component.errorMessage).toContain('Name is required');
      expect(mockNotificationService.extractErrorMessage).toHaveBeenCalledWith(errorResponse);
    });
  });

  describe('deleteClient', () => {
    it('should delete client successfully', () => {
      mockNotificationService.confirm.mockReturnValue(true);
      mockClientService.deleteClient.mockReturnValue(of(void 0));
      mockClientService.getAllClients.mockReturnValue(of([mockClients[1]]));

      component.deleteClient(mockClients[0]);

      expect(mockClientService.deleteClient).toHaveBeenCalledWith(mockClients[0].id);
    });

    it('should not delete client when user cancels', () => {
      mockNotificationService.confirm.mockReturnValue(false);

      component.deleteClient(mockClients[0]);

      expect(mockClientService.deleteClient).not.toHaveBeenCalled();
    });
  });

  describe('closeModal', () => {
    it('should close modal and reset form', () => {
      component.showModal = true;
      component.errorMessage = 'Some error';

      component.closeModal();

      expect(component.showModal).toBe(false);
      expect(component.errorMessage).toBe('');
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy$ subject', () => {
      const destroySpy = jest.spyOn(component['destroy$'], 'next');
      const completeSpy = jest.spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should unsubscribe from observables on destroy', () => {
      mockClientService.getAllClients.mockReturnValue(of(mockClients));
      component.ngOnInit();

      const destroySpy = jest.spyOn(component['destroy$'], 'next');
      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
    });
  });

  describe('NotificationService integration', () => {
    it('should call notification service on successful create', () => {
      const newClient = { ...mockClients[0], id: 3 } as any;
      mockClientService.createClient.mockReturnValue(of(newClient));
      mockClientService.getAllClients.mockReturnValue(of([...mockClients, newClient]));

      component.selectedClient = newClient;
      component.isEditMode = false;
      component.saveClient();

      expect(mockNotificationService.success).toHaveBeenCalledWith('Cliente creado exitosamente');
    });

    it('should call notification service on successful update', () => {
      const updatedClient = { ...mockClients[0] };
      mockClientService.updateClient.mockReturnValue(of(updatedClient as any));
      mockClientService.getAllClients.mockReturnValue(of(mockClients));

      component.clients = mockClients;
      component.selectedClient = updatedClient as any;
      component.isEditMode = true;
      component.saveClient();

      expect(mockNotificationService.success).toHaveBeenCalledWith('Cliente actualizado exitosamente');
    });

    it('should call notification service on error', () => {
      const error = { error: { message: 'Validation error' } };
      mockClientService.createClient.mockReturnValue(throwError(() => error));

      component.selectedClient = mockClients[0] as any;
      component.isEditMode = false;
      component.saveClient();

      expect(mockNotificationService.error).toHaveBeenCalled();
      expect(mockNotificationService.extractErrorMessage).toHaveBeenCalledWith(error);
    });

    it('should use notification service confirm instead of window.confirm', () => {
      mockNotificationService.confirm.mockReturnValue(true);
      mockClientService.deleteClient.mockReturnValue(of(void 0));
      mockClientService.getAllClients.mockReturnValue(of(mockClients));

      component.deleteClient(mockClients[0]);

      expect(mockNotificationService.confirm).toHaveBeenCalledWith(
        `¿Está seguro de eliminar el cliente ${mockClients[0].name}?`
      );
    });

    it('should call notification service on successful delete', () => {
      mockNotificationService.confirm.mockReturnValue(true);
      mockClientService.deleteClient.mockReturnValue(of(void 0));
      mockClientService.getAllClients.mockReturnValue(of([mockClients[1]]));

      component.deleteClient(mockClients[0]);

      expect(mockNotificationService.success).toHaveBeenCalledWith('Cliente eliminado exitosamente');
    });

    it('should handle error when loading clients', () => {
      const error = { error: { message: 'Network error' } };
      mockClientService.getAllClients.mockReturnValue(throwError(() => error));

      component.loadClients();

      expect(mockNotificationService.error).toHaveBeenCalled();
      expect(mockNotificationService.extractErrorMessage).toHaveBeenCalledWith(error);
    });
  });
});
