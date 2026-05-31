import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Api } from '../../servicios/api';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email: string = 'admin@workflow.com';
  password: string = '123456';
  mensajeError: string = '';

  constructor(
    private api: Api,
    private router: Router
  ) {}

  iniciarSesion(): void {
    this.mensajeError = '';

    this.api.login(this.email, this.password).subscribe({
      next: (respuesta) => {
        localStorage.setItem('token', respuesta.token);
        localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));

        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.mensajeError = 'Credenciales incorrectas';
      }
    });
  }
}