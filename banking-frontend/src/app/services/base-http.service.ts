import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Servicio base abstracto que implementa operaciones CRUD genéricas
 * Siguiendo el principio DRY (Don't Repeat Yourself)
 */
export abstract class BaseHttpService<TRequest, TResponse> {
  protected apiUrl: string;

  constructor(
    protected http: HttpClient,
    protected endpoint: string
  ) {
    this.apiUrl = `${environment.apiUrl}/${endpoint}`;
  }

  /**
   * Obtiene todos los registros
   */
  getAll(): Observable<TResponse[]> {
    return this.http.get<TResponse[]>(this.apiUrl);
  }

  /**
   * Obtiene un registro por ID
   */
  getById(id: number): Observable<TResponse> {
    return this.http.get<TResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo registro
   */
  create(entity: TRequest): Observable<TResponse> {
    return this.http.post<TResponse>(this.apiUrl, entity);
  }

  /**
   * Actualiza un registro existente
   */
  update(id: number, entity: TRequest): Observable<TResponse> {
    return this.http.put<TResponse>(`${this.apiUrl}/${id}`, entity);
  }

  /**
   * Elimina un registro
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
