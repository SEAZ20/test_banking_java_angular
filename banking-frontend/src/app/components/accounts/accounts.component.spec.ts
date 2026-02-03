import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccountsComponent } from './accounts.component';
import { AccountService } from '../../services/account.service';
import { ClientService } from '../../services/client.service';
import { of, throwError } from 'rxjs';
import { AccountResponse } from '../../models/account.model';
import { ClientResponse } from '../../models/client.model';

describe('AccountsComponent', () => {
  let component: AccountsComponent;
  let fixture: ComponentFixture<AccountsComponent>;
  let mockAccountService: jest.Mocked<AccountService>;
  let mockClientService: jest.Mocked<ClientService>;

  const mockAccounts: AccountResponse[] = [
    {
      id: 1,
      accountNumber: '123456',
      accountType: 'Ahorro',
      initialBalance: 1000,
      currentBalance: 1200,
      status: true,
      clientId: 1
    },
    {
      id: 2,
      accountNumber: '654321',
      accountType: 'Corriente',
      initialBalance: 2000,
      currentBalance: 2500,
      status: true,
      clientId: 2
    }
  ];

  beforeEach(async () => {
    mockAccountService = {
      getAllAccounts: jest.fn(),
      getAccountById: jest.fn(),
      createAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn()
    } as any;

    mockClientService = {
      getAllClients: jest.fn().mockReturnValue(of([])),
      getClientById: jest.fn(),
      createClient: jest.fn(),
      updateClient: jest.fn(),
      deleteClient: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [AccountsComponent],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: ClientService, useValue: mockClientService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load accounts on initialization', () => {
      mockAccountService.getAllAccounts.mockReturnValue(of(mockAccounts));
      
      component.ngOnInit();

      expect(mockAccountService.getAllAccounts).toHaveBeenCalled();
      expect(component.accounts).toEqual(mockAccounts);
      expect(component.filteredAccounts).toEqual(mockAccounts);
    });

    it('should handle error when loading accounts', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorResponse = { status: 500, message: 'Server error' };
      mockAccountService.getAllAccounts.mockReturnValue(throwError(() => errorResponse));
      
      component.ngOnInit();

      expect(component.errorMessage).toBe('Error al cargar las cuentas');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('filterAccounts', () => {
    beforeEach(() => {
      component.accounts = mockAccounts;
      component.filteredAccounts = mockAccounts;
    });

    it('should filter accounts by account number', () => {
      component.searchTerm = '123456';
      component.filterAccounts();

      expect(component.filteredAccounts.length).toBe(1);
      expect(component.filteredAccounts[0].accountNumber).toBe('123456');
    });

    it('should filter accounts by account type', () => {
      component.searchTerm = 'ahorro';
      component.filterAccounts();

      expect(component.filteredAccounts.length).toBe(1);
      expect(component.filteredAccounts[0].accountType).toBe('Ahorro');
    });

    it('should return all accounts when search term is empty', () => {
      component.searchTerm = '';
      component.filterAccounts();

      expect(component.filteredAccounts.length).toBe(2);
    });
  });

  describe('openCreateModal', () => {
    it('should open modal for creating new account', () => {
      component.openCreateModal();

      expect(component.showModal).toBe(true);
      expect(component.isEditMode).toBe(false);
      expect(component.errorMessage).toBe('');
    });
  });

  describe('openEditModal', () => {
    it('should open modal for editing existing account', () => {
      component.openEditModal(mockAccounts[0]);

      expect(component.showModal).toBe(true);
      expect(component.isEditMode).toBe(true);
      expect(component.selectedAccount.accountNumber).toBe(mockAccounts[0].accountNumber);
    });
  });

  describe('saveAccount', () => {
    it('should create new account successfully', () => {
      mockAccountService.createAccount.mockReturnValue(of(mockAccounts[0]));
      mockAccountService.getAllAccounts.mockReturnValue(of(mockAccounts));
      component.isEditMode = false;

      component.saveAccount();

      expect(mockAccountService.createAccount).toHaveBeenCalled();
      expect(component.showModal).toBe(false);
    });

    it('should update existing account successfully', () => {
      mockAccountService.updateAccount.mockReturnValue(of(mockAccounts[0]));
      mockAccountService.getAllAccounts.mockReturnValue(of(mockAccounts));
      component.isEditMode = true;
      component.selectedAccountId = mockAccounts[0].id;
      component.accounts = mockAccounts;
      component.selectedAccount = { ...mockAccounts[0] };

      component.saveAccount();

      expect(mockAccountService.updateAccount).toHaveBeenCalled();
      expect(component.showModal).toBe(false);
    });

    it('should handle error when creating account', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorResponse = { 
        error: { 
          errors: { accountNumber: 'Account number is required' } 
        } 
      };
      mockAccountService.createAccount.mockReturnValue(throwError(() => errorResponse));
      component.isEditMode = false;

      component.saveAccount();

      expect(component.errorMessage).toContain('Account number is required');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', () => {
      mockAccountService.deleteAccount.mockReturnValue(of(void 0));
      mockAccountService.getAllAccounts.mockReturnValue(of([mockAccounts[1]]));
      window.confirm = jest.fn(() => true);

      component.deleteAccount(mockAccounts[0]);

      expect(mockAccountService.deleteAccount).toHaveBeenCalledWith(mockAccounts[0].id);
    });

    it('should not delete account when user cancels', () => {
      window.confirm = jest.fn(() => false);

      component.deleteAccount(mockAccounts[0]);

      expect(mockAccountService.deleteAccount).not.toHaveBeenCalled();
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
