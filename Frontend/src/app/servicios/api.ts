import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class Api {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, {
      email,
      password
    });
  }

  obtenerWorkflows(): Observable<any> {
    return this.http.get(`${this.apiUrl}/workflows`);
  }

  crearWorkflow(datos: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/workflows`, datos);
  }

  obtenerTareasPorRol(rol: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/tareas/rol/${rol}`);
  }

  obtenerInstancias(): Observable<any> {
    return this.http.get(`${this.apiUrl}/instancias`);
  }

  crearInstancia(workflowId: number): Observable<any> {
  return this.http.post(`${this.apiUrl}/instancias`, {
    workflow_id: workflowId
  });
  }

  completarTarea(tareaId: number, respuesta: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/tareas/${tareaId}/completar`, {
    respuesta
  });
  }
  
  eliminarInstancia(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/instancias/${id}`, {
    headers: this.obtenerHeadersAuth()
  });
  }

  eliminarWorkflow(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/workflows/${id}`, {
    headers: this.obtenerHeadersAuth()
  });
  }

  private obtenerHeadersAuth(): HttpHeaders {
  const token = localStorage.getItem('token') || '';

  return new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
  }

}