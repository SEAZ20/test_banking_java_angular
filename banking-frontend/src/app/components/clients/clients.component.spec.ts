import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientsComponent } from './clients.component';
import { ClientService } from '../../services/client.service';
import { of, throwError } from 'rxjs';
import { ClientResponse } from '../../models/client.model';

describe('ClientsComponent', () => {
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;
  let mockClientService: jest.Mocked<ClientService>;

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

    await TestBed.configureTestingModule({
      imports: [ClientsComponent],
      providers: [
        { provide: ClientService, useValue: mockClientService }
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
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorResponse = { 
        error: { 
          errors: { name: 'Name is required' } 
        } 
      };
      mockClientService.createClient.mockReturnValue(throwError(() => errorResponse));
      component.isEditMode = false;

      component.saveClient();

      expect(component.errorMessage).toContain('Name is required');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteClient', () => {
    it('should delete client successfully', () => {
      mockClientService.deleteClient.mockReturnValue(of(void 0));
      mockClientService.getAllClients.mockReturnValue(of([mockClients[1]]));
      window.confirm = jest.fn(() => true);

      component.deleteClient(mockClients[0]);

      expect(mockClientService.deleteClient).toHaveBeenCalledWith(mockClients[0].id);
    });

    it('should not delete client when user cancels', () => {
      window.confirm = jest.fn(() => false);

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
});
