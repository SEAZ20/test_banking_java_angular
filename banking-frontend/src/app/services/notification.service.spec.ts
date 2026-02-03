import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService]
    });
    service = TestBed.inject(NotificationService);

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('success', () => {
    it('should emit success notification', (done) => {
      const message = 'Operation successful';

      service.notification$.subscribe(notification => {
        expect(notification.type).toBe('success');
        expect(notification.message).toBe(message);
        done();
      });

      service.success(message);
      expect(consoleLogSpy).toHaveBeenCalledWith('SUCCESS:', message);
    });
  });

  describe('error', () => {
    it('should emit error notification', (done) => {
      const message = 'Operation failed';

      service.notification$.subscribe(notification => {
        expect(notification.type).toBe('error');
        expect(notification.message).toBe(message);
        done();
      });

      service.error(message);
      expect(consoleErrorSpy).toHaveBeenCalledWith('ERROR:', message);
    });
  });

  describe('info', () => {
    it('should emit info notification', (done) => {
      const message = 'Information message';

      service.notification$.subscribe(notification => {
        expect(notification.type).toBe('info');
        expect(notification.message).toBe(message);
        done();
      });

      service.info(message);
      expect(consoleInfoSpy).toHaveBeenCalledWith('INFO:', message);
    });
  });

  describe('warning', () => {
    it('should emit warning notification', (done) => {
      const message = 'Warning message';

      service.notification$.subscribe(notification => {
        expect(notification.type).toBe('warning');
        expect(notification.message).toBe(message);
        done();
      });

      service.warning(message);
      expect(consoleWarnSpy).toHaveBeenCalledWith('WARNING:', message);
    });
  });

  describe('confirm', () => {
    it('should call window.confirm', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
      const message = 'Are you sure?';

      const result = service.confirm(message);

      expect(confirmSpy).toHaveBeenCalledWith(message);
      expect(result).toBe(true);

      confirmSpy.mockRestore();
    });
  });

  describe('alert', () => {
    it('should call window.alert', () => {
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      const message = 'Alert message';

      service.alert(message);

      expect(alertSpy).toHaveBeenCalledWith(message);

      alertSpy.mockRestore();
    });
  });

  describe('extractErrorMessage', () => {
    it('should extract message from error.error.errors object', () => {
      const error = {
        error: {
          errors: {
            field1: 'Error in field 1',
            field2: 'Error in field 2'
          }
        }
      };

      const message = service.extractErrorMessage(error);

      expect(message).toContain('Error in field 1');
      expect(message).toContain('Error in field 2');
    });

    it('should extract message from error.error.message', () => {
      const error = {
        error: {
          message: 'Custom error message'
        }
      };

      const message = service.extractErrorMessage(error);

      expect(message).toBe('Custom error message');
    });

    it('should extract message from error.error.error', () => {
      const error = {
        error: {
          error: 'Simple error'
        }
      };

      const message = service.extractErrorMessage(error);

      expect(message).toBe('Simple error');
    });

    it('should return default message for unknown error format', () => {
      const error = {};

      const message = service.extractErrorMessage(error);

      expect(message).toBe('Error al procesar la solicitud');
    });

    it('should handle null or undefined errors', () => {
      const message1 = service.extractErrorMessage(null);
      const message2 = service.extractErrorMessage(undefined);

      expect(message1).toBe('Error al procesar la solicitud');
      expect(message2).toBe('Error al procesar la solicitud');
    });
  });
});
