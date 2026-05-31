import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Api } from '../../servicios/api';

@Component({
  selector: 'app-monitor-procesos',
  imports: [CommonModule, RouterLink],
  templateUrl: './monitor-procesos.html',
  styleUrl: './monitor-procesos.css'
})
export class MonitorProcesosComponent implements OnInit {
  instancias: any[] = [];
  cargando: boolean = true;
  error: string = '';
  mensaje: string = '';
  usuario: any = null;

  instanciaPendienteEliminar: any = null;
  mostrarModalEliminar: boolean = false;

  constructor(private api: Api) {}

  ngOnInit(): void {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
    }

    this.cargarInstancias();
  }

  cargarInstancias(): void {
    this.api.obtenerInstancias().subscribe({
      next: (respuesta) => {
        this.instancias = respuesta;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las instancias';
        this.cargando = false;
      }
    });
  }

  abrirModalEliminar(instancia: any): void {
    this.instanciaPendienteEliminar = instancia;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.instanciaPendienteEliminar = null;
    this.mostrarModalEliminar = false;
  }

  confirmarEliminarInstancia(): void {
    if (!this.instanciaPendienteEliminar) {
      return;
    }

    this.mensaje = '';
    this.error = '';

    this.api.eliminarInstancia(this.instanciaPendienteEliminar.id).subscribe({
      next: () => {
        this.mensaje = 'Instancia eliminada correctamente';
        this.cerrarModalEliminar();
        this.cargarInstancias();
      },
      error: () => {
        this.error = 'No se pudo eliminar la instancia';
        this.cerrarModalEliminar();
      }
    });
  }
}