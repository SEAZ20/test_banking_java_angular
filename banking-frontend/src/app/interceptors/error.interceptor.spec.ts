import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { errorInterceptor } from './error.interceptor';
import { NotificationService } from '../services/notification.service';

describe('ErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let notificationService: NotificationService;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        NotificationService
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    notificationService = TestBed.inject(NotificationService);
    
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    httpMock.verify();
    consoleErrorSpy.mockRestore();
  });

  it('should log error and propagate it', (done) => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const testUrl = '/api/test';
    const errorMessage = 'Server error';

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed'),
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(500);
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
        done();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(errorMessage, { status: 500, statusText: 'Internal Server Error' });
  });

  it('should extract error message using NotificationService', (done) => {
    const extractErrorSpy = jest.spyOn(notificationService, 'extractErrorMessage');
    const testUrl = '/api/test';
    const errorResponse = {
      error: {
        message: 'Custom error message'
      }
    };

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed'),
      error: (error: HttpErrorResponse) => {
        expect(extractErrorSpy).toHaveBeenCalled();
        extractErrorSpy.mockRestore();
        done();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle client-side errors', (done) => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const testUrl = '/api/test';

    // Simular error del cliente mediante timeout
    httpClient.get(testUrl, { observe: 'response' }).subscribe({
      next: () => fail('should have failed'),
      error: (error) => {
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
        done();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.error(new ProgressEvent('error'), { status: 0, statusText: 'Unknown Error' });
  });

  it('should log error details including status and URL', (done) => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const testUrl = '/api/test';

    httpClient.get(testUrl).subscribe({
      next: () => fail('should have failed'),
      error: (error: HttpErrorResponse) => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('HTTP Error:', expect.objectContaining({
          status: 404,
          url: expect.stringContaining(testUrl)
        }));
        consoleErrorSpy.mockRestore();
        done();
      }
    });

    const req = httpMock.expectOne(testUrl);
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
  });

  it('should pass through successful responses', (done) => {
    const testUrl = '/api/test';
    const testData = { id: 1, name: 'Test' };

    httpClient.get(testUrl).subscribe({
      next: (data) => {
        expect(data).toEqual(testData);
        done();
      },
      error: () => fail('should not have failed')
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(testData);
  });
});
