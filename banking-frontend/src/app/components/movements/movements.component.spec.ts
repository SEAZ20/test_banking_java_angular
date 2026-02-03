import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovementsComponent } from './movements.component';
import { MovementService } from '../../services/movement.service';
import { AccountService } from '../../services/account.service';
import { of, throwError } from 'rxjs';
import { MovementResponse } from '../../models/movement.model';
import { AccountResponse } from '../../models/account.model';

describe('MovementsComponent', () => {
  let component: MovementsComponent;
  let fixture: ComponentFixture<MovementsComponent>;
  let mockMovementService: jest.Mocked<MovementService>;
  let mockAccountService: jest.Mocked<AccountService>;

  const mockMovements: MovementResponse[] = [
    {
      id: 1,
      date: '2026-02-01T10:00:00',
      movementType: 'Deposito',
      value: 500,
      balance: 1500,
      accountId: 1
    },
    {
      id: 2,
      date: '2026-02-01T11:00:00',
      movementType: 'Retiro',
      value: -200,
      balance: 1300,
      accountId: 1
    }
  ];

  beforeEach(async () => {
    mockMovementService = {
      getAllMovements: jest.fn(),
      getMovementById: jest.fn(),
      createMovement: jest.fn(),
      updateMovement: jest.fn(),
      deleteMovement: jest.fn()
    } as any;

    mockAccountService = {
      getAllAccounts: jest.fn().mockReturnValue(of([])),
      getAccountById: jest.fn(),
      createAccount: jest.fn(),
      updateAccount: jest.fn(),
      deleteAccount: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [MovementsComponent],
      providers: [
        { provide: MovementService, useValue: mockMovementService },
        { provide: AccountService, useValue: mockAccountService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovementsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load movements on initialization', () => {
      mockMovementService.getAllMovements.mockReturnValue(of(mockMovements));
      
      component.ngOnInit();

      expect(mockMovementService.getAllMovements).toHaveBeenCalled();
      expect(component.movements).toEqual(mockMovements);
      expect(component.filteredMovements).toEqual(mockMovements);
    });

    it('should handle error when loading movements', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorResponse = { status: 500, message: 'Server error' };
      mockMovementService.getAllMovements.mockReturnValue(throwError(() => errorResponse));
      
      component.ngOnInit();

      expect(component.errorMessage).toBe('Error al cargar los movimientos');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('filterMovements', () => {
    beforeEach(() => {
      component.movements = mockMovements;
      component.filteredMovements = mockMovements;
    });

    it('should filter movements by type', () => {
      component.searchTerm = 'deposito';
      component.filterMovements();

      expect(component.filteredMovements.length).toBe(1);
      expect(component.filteredMovements[0].movementType).toBe('Deposito');
    });

    it('should return all movements when search term is empty', () => {
      component.searchTerm = '';
      component.filterMovements();

      expect(component.filteredMovements.length).toBe(2);
    });
  });

  describe('openCreateModal', () => {
    it('should open modal for creating new movement', () => {
      component.openCreateModal();

      expect(component.showModal).toBe(true);
      expect(component.isEditMode).toBe(false);
      expect(component.errorMessage).toBe('');
    });
  });

  describe('openEditModal', () => {
    it('should open modal for editing existing movement', () => {
      component.openEditModal(mockMovements[0]);

      expect(component.showModal).toBe(true);
      expect(component.isEditMode).toBe(true);
      expect(component.selectedMovement.movementType).toBe(mockMovements[0].movementType);
    });
  });

  describe('saveMovement', () => {
    it('should create new movement successfully', () => {
      mockMovementService.createMovement.mockReturnValue(of(mockMovements[0]));
      mockMovementService.getAllMovements.mockReturnValue(of(mockMovements));
      component.isEditMode = false;

      component.saveMovement();

      expect(mockMovementService.createMovement).toHaveBeenCalled();
      expect(component.showModal).toBe(false);
    });

    it('should update existing movement successfully', () => {
      mockMovementService.updateMovement.mockReturnValue(of(mockMovements[0]));
      mockMovementService.getAllMovements.mockReturnValue(of(mockMovements));
      component.isEditMode = true;
      component.selectedMovementId = mockMovements[0].id;
      component.movements = mockMovements;
      component.selectedMovement = { ...mockMovements[0] };

      component.saveMovement();

      expect(mockMovementService.updateMovement).toHaveBeenCalled();
      expect(component.showModal).toBe(false);
    });

    it('should handle error when creating movement', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorResponse = { 
        error: { 
          errors: { value: 'Value is required' } 
        } 
      };
      mockMovementService.createMovement.mockReturnValue(throwError(() => errorResponse));
      component.isEditMode = false;

      component.saveMovement();

      expect(component.errorMessage).toContain('Value is required');
      consoleErrorSpy.mockRestore();
    });

    it('should handle insufficient balance error', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorResponse = { 
        error: { 
          message: 'Saldo no disponible' 
        } 
      };
      mockMovementService.createMovement.mockReturnValue(throwError(() => errorResponse));
      component.isEditMode = false;

      component.saveMovement();

      expect(component.errorMessage).toContain('Saldo no disponible');
      consoleErrorSpy.mockRestore();
    });
  });

  describe('deleteMovement', () => {
    it('should delete movement successfully', () => {
      mockMovementService.deleteMovement.mockReturnValue(of(void 0));
      mockMovementService.getAllMovements.mockReturnValue(of([mockMovements[1]]));
      window.confirm = jest.fn(() => true);

      component.deleteMovement(mockMovements[0]);

      expect(mockMovementService.deleteMovement).toHaveBeenCalledWith(mockMovements[0].id);
    });

    it('should not delete movement when user cancels', () => {
      window.confirm = jest.fn(() => false);

      component.deleteMovement(mockMovements[0]);

      expect(mockMovementService.deleteMovement).not.toHaveBeenCalled();
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
