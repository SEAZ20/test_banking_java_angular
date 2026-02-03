import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportParams, AccountStatementReport } from '../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = 'http://localhost:8080/reportes';

  constructor(private http: HttpClient) {}

  generateAccountStatement(params: ReportParams): Observable<any> {
    let httpParams = new HttpParams()
      .set('clientId', params.clientId.toString())
      .set('startDate', params.startDate)
      .set('endDate', params.endDate)
      .set('format', params.format || 'json');

    if (params.format === 'pdf') {
      return this.http.get(this.apiUrl, { 
        params: httpParams,
        responseType: 'text'
      });
    } else {
      return this.http.get<AccountStatementReport[]>(this.apiUrl, { params: httpParams });
    }
  }
}
