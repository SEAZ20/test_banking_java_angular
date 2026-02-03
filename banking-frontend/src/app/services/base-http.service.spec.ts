import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { BaseHttpService } from './base-http.service';
import { environment } from '../../environments/environment';

// Interfaces de prueba
interface TestEntityRequest {
  name: string;
}

interface TestEntityResponse {
  id: number;
  name: string;
}

// Clase de prueba concreta que extiende BaseHttpService
class TestService extends BaseHttpService<TestEntityRequest, TestEntityResponse> {
  constructor(http: HttpClient) {
    super(http, 'test-entities');
  }
}

describe('BaseHttpService', () => {
  let service: TestService;
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  const apiUrl = `${environment.apiUrl}/test-entities`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    httpClient = TestBed.inject(HttpClient);
    service = new TestService(httpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAll', () => {
    it('should return an array of entities', () => {
      const mockEntities: TestEntityResponse[] = [
        { id: 1, name: 'Entity 1' },
        { id: 2, name: 'Entity 2' }
      ];

      service.getAll().subscribe(entities => {
        expect(entities).toEqual(mockEntities);
        expect(entities.length).toBe(2);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockEntities);
    });
  });

  describe('getById', () => {
    it('should return a single entity', () => {
      const mockEntity: TestEntityResponse = { id: 1, name: 'Entity 1' };

      service.getById(1).subscribe(entity => {
        expect(entity).toEqual(mockEntity);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEntity);
    });
  });

  describe('create', () => {
    it('should create a new entity', () => {
      const newEntity: TestEntityRequest = { name: 'New Entity' };
      const createdEntity: TestEntityResponse = { id: 1, name: 'New Entity' };

      service.create(newEntity).subscribe(entity => {
        expect(entity).toEqual(createdEntity);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newEntity);
      req.flush(createdEntity);
    });
  });

  describe('update', () => {
    it('should update an existing entity', () => {
      const updatedEntity: TestEntityRequest = { name: 'Updated Entity' };
      const responseEntity: TestEntityResponse = { id: 1, name: 'Updated Entity' };

      service.update(1, updatedEntity).subscribe(entity => {
        expect(entity).toEqual(responseEntity);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedEntity);
      req.flush(responseEntity);
    });
  });

  describe('delete', () => {
    it('should delete an entity', () => {
      service.delete(1).subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  it('should construct correct API URL from environment and endpoint', () => {
    expect(service['apiUrl']).toBe(`${environment.apiUrl}/test-entities`);
  });
});
