import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AccountService } from './account.service';
import { AccountRequest, AccountResponse } from '../models/account.model';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/accounts';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AccountService]
    });
    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all accounts', () => {
    const mockAccounts: AccountResponse[] = [
      {
        id: 1,
        accountNumber: '123456',
        accountType: 'Ahorro',
        initialBalance: 1000,
        currentBalance: 1200,
        status: true,
        clientId: 1
      }
    ];

    service.getAllAccounts().subscribe(accounts => {
      expect(accounts.length).toBe(1);
      expect(accounts[0].accountNumber).toBe('123456');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockAccounts);
  });

  it('should create an account', () => {
    const newAccount: AccountRequest = {
      accountNumber: '654321',
      accountType: 'Corriente',
      initialBalance: 2000,
      status: true,
      clientId: 1
    };

    service.createAccount(newAccount).subscribe();

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({id: 2, ...newAccount});
  });
});
