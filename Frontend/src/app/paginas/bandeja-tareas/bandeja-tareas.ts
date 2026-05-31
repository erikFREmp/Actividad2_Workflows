import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Api } from '../../servicios/api';

@Component({
  selector: 'app-bandeja-tareas',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './bandeja-tareas.html',
  styleUrl: './bandeja-tareas.css'
})
export class BandejaTareasComponent implements OnInit {
  usuario: any = null;
  tareas: any[] = [];
  cargando: boolean = true;
  error: string = '';
  mensaje: string = '';
  respuestasFormulario: any = {};

  constructor(private api: Api) {}

  ngOnInit(): void {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
      this.cargarTareas();
    } else {
      this.error = 'No hay usuario autenticado';
      this.cargando = false;
    }
  }

  cargarTareas(): void {
    this.cargando = true;
    this.error = '';

    this.api.obtenerTareasPorRol(this.usuario.rol).subscribe({
      next: (respuesta) => {
        this.tareas = respuesta;

        this.tareas.forEach((tarea) => {
          if (!this.respuestasFormulario[tarea.id]) {
            this.respuestasFormulario[tarea.id] = {};
          }
        });

        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar las tareas';
        this.cargando = false;
      }
    });
  }

  validarFormularioTarea(tarea: any): boolean {
  if (!tarea.datos_formulario || !tarea.datos_formulario.campos) {
    return true;
  }

  const respuestaFormulario = this.respuestasFormulario[tarea.id] || {};

  for (const campo of tarea.datos_formulario.campos) {
    if (campo.requerido) {
      const valor = respuestaFormulario[campo.nombre];

      if (valor === undefined || valor === null || valor === '') {
        this.error = `El campo "${campo.etiqueta}" es obligatorio`;
        return false;
      }
    }
  }

  return true;
  }

  completarTarea(tarea: any): void {
    this.mensaje = '';
    this.error = '';
    if (!this.validarFormularioTarea(tarea)) {
      return;
    }
    const respuestaFormulario = this.respuestasFormulario[tarea.id];

    const respuesta = respuestaFormulario && Object.keys(respuestaFormulario).length > 0
      ? respuestaFormulario
      : {
          comentario: 'Tarea completada desde la interfaz Angular',
          usuario: this.usuario?.nombre || 'Usuario'
        };

    this.api.completarTarea(tarea.id, respuesta).subscribe({
      next: () => {
        this.mensaje = 'Tarea completada correctamente';
        this.cargarTareas();
      },
      error: () => {
        this.error = 'No se pudo completar la tarea';
      }
    });
  }
}