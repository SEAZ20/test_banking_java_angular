import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ClientService } from './client.service';
import { ClientRequest, ClientResponse } from '../models/client.model';

describe('ClientService', () => {
  let service: ClientService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/clients';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ClientService]
    });
    service = TestBed.inject(ClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllClients', () => {
    it('should return an array of clients', () => {
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
        }
      ];

      service.getAllClients().subscribe(clients => {
        expect(clients).toEqual(mockClients);
        expect(clients.length).toBe(1);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockClients);
    });
  });

  describe('createClient', () => {
    it('should create a client', () => {
      const newClient: ClientRequest = {
        name: 'Maria Lopez',
        gender: 'Femenino',
        age: 25,
        identification: '87654321',
        address: 'Avenida 456',
        phone: '0912345678',
        clientId: 'maria456',
        password: 'password123',
        status: true
      };

      const createdClient: ClientResponse = {
        id: 2,
        name: newClient.name,
        gender: newClient.gender,
        age: newClient.age,
        identification: newClient.identification,
        address: newClient.address,
        phone: newClient.phone,
        clientId: newClient.clientId,
        status: newClient.status!
      };

      service.createClient(newClient).subscribe(client => {
        expect(client.name).toBe(newClient.name);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      req.flush(createdClient);
    });
  });

  describe('deleteClient', () => {
    it('should delete a client', () => {
      service.deleteClient(1).subscribe();

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
