import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Api } from '../../servicios/api';

@Component({
  selector: 'app-workflows',
  imports: [CommonModule, RouterLink],
  templateUrl: './workflows.html',
  styleUrl: './workflows.css'
})
export class WorkflowsComponent implements OnInit {
  workflows: any[] = [];
  cargando: boolean = true;
  error: string = '';
  mensaje: string = '';
  usuario: any = null;

  workflowPendienteEliminar: any = null;
  mostrarModalEliminar: boolean = false;

  constructor(private api: Api) {}

  ngOnInit(): void {
    const usuarioGuardado = localStorage.getItem('usuario');

    if (usuarioGuardado) {
      this.usuario = JSON.parse(usuarioGuardado);
    }

    this.cargarWorkflows();
  }

  cargarWorkflows(): void {
    this.api.obtenerWorkflows().subscribe({
      next: (respuesta) => {
        this.workflows = respuesta;
        this.cargando = false;
      },
      error: () => {
        this.error = 'No se pudieron cargar los workflows';
        this.cargando = false;
      }
    });
  }

  iniciarWorkflow(workflowId: number): void {
    this.mensaje = '';
    this.error = '';

    this.api.crearInstancia(workflowId).subscribe({
      next: () => {
        this.mensaje = 'Instancia creada correctamente';
      },
      error: () => {
        this.error = 'No se pudo iniciar el workflow';
      }
    });
  }

  abrirModalEliminar(workflow: any): void {
    this.workflowPendienteEliminar = workflow;
    this.mostrarModalEliminar = true;
  }

  cerrarModalEliminar(): void {
    this.workflowPendienteEliminar = null;
    this.mostrarModalEliminar = false;
  }

  confirmarEliminarWorkflow(): void {
    if (!this.workflowPendienteEliminar) {
      return;
    }

    this.mensaje = '';
    this.error = '';

    this.api.eliminarWorkflow(this.workflowPendienteEliminar.id).subscribe({
      next: () => {
        this.mensaje = 'Workflow eliminado correctamente';
        this.cerrarModalEliminar();
        this.cargarWorkflows();
      },
      error: () => {
        this.error = 'No se pudo eliminar el workflow';
        this.cerrarModalEliminar();
      }
    });
  }
}