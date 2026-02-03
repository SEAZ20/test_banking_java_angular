import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface Notification {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

/**
 * Servicio centralizado para manejo de notificaciones y diálogos
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  public notification$ = this.notificationSubject.asObservable();

  success(message: string): void {
    this.notificationSubject.next({ type: 'success', message });
    console.log('SUCCESS:', message);
  }


  error(message: string): void {
    this.notificationSubject.next({ type: 'error', message });
    console.error('ERROR:', message);
  }


  info(message: string): void {
    this.notificationSubject.next({ type: 'info', message });
    console.info('INFO:', message);
  }


  warning(message: string): void {
    this.notificationSubject.next({ type: 'warning', message });
    console.warn('WARNING:', message);
  }


  confirm(message: string): boolean {
    return window.confirm(message);
  }


  alert(message: string): void {
    window.alert(message);
  }

  extractErrorMessage(error: any): string {
    if (!error) {
      return 'Error al procesar la solicitud';
    }
    if (error.error?.errors) {
      const errors = error.error.errors;
      return Object.keys(errors)
        .map(key => errors[key])
        .join(', ');
    }
    return error.error?.message || error.error?.error || 'Error al procesar la solicitud';
  }
}
