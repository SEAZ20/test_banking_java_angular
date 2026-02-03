import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovementRequest, MovementResponse } from '../models/movement.model';
import { BaseHttpService } from './base-http.service';

/**
 * Servicio para gestión de movimientos
 * Hereda de BaseHttpService para reutilizar operaciones CRUD comunes
 */
@Injectable({
  providedIn: 'root'
})
export class MovementService extends BaseHttpService<MovementRequest, MovementResponse> {
  constructor(http: HttpClient) {
    super(http, 'movements');
  }

  getAllMovements(): Observable<MovementResponse[]> {
    return this.getAll();
  }

  getMovementById(id: number): Observable<MovementResponse> {
    return this.getById(id);
  }

  createMovement(movement: MovementRequest): Observable<MovementResponse> {
    return this.create(movement);
  }

  updateMovement(id: number, movement: MovementRequest): Observable<MovementResponse> {
    return this.update(id, movement);
  }

  deleteMovement(id: number): Observable<void> {
    return this.delete(id);
  }
}
