import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MovementRequest, MovementResponse } from '../models/movement.model';

@Injectable({
  providedIn: 'root'
})
export class MovementService {
  private apiUrl = 'http://localhost:8080/movements';

  constructor(private http: HttpClient) {}

  getAllMovements(): Observable<MovementResponse[]> {
    return this.http.get<MovementResponse[]>(this.apiUrl);
  }

  getMovementById(id: number): Observable<MovementResponse> {
    return this.http.get<MovementResponse>(`${this.apiUrl}/${id}`);
  }

  createMovement(movement: MovementRequest): Observable<MovementResponse> {
    return this.http.post<MovementResponse>(this.apiUrl, movement);
  }

  updateMovement(id: number, movement: MovementRequest): Observable<MovementResponse> {
    return this.http.put<MovementResponse>(`${this.apiUrl}/${id}`, movement);
  }

  deleteMovement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
