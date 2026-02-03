import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MovementService } from './movement.service';
import { MovementRequest, MovementResponse } from '../models/movement.model';
import { environment } from '../../environments/environment';

describe('MovementService', () => {
  let service: MovementService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/movements`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MovementService]
    });
    service = TestBed.inject(MovementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all movements', () => {
    const mockMovements: MovementResponse[] = [
      {
        id: 1,
        date: '2026-02-01T10:00:00',
        movementType: 'Deposito',
        value: 500,
        balance: 1500,
        accountId: 1
      }
    ];

    service.getAllMovements().subscribe(movements => {
      expect(movements.length).toBe(1);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockMovements);
  });

  it('should create a movement', () => {
    const newMovement: MovementRequest = {
      date: '2026-02-01T11:00:00',
      movementType: 'Retiro',
      value: -200,
      accountId: 1
    };

    service.createMovement(newMovement).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({id: 2, ...newMovement, balance: 1300});
  });
});
