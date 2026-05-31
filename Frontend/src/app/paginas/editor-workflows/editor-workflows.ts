import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { Api } from '../../servicios/api';

@Component({
  selector: 'app-editor-workflows',
  imports: [CommonModule, FormsModule, RouterLink, DragDropModule],
  templateUrl: './editor-workflows.html',
  styleUrl: './editor-workflows.css'
})
export class EditorWorkflowsComponent {
  nombreWorkflow: string = 'Nuevo workflow';
  descripcionWorkflow: string = 'Workflow creado desde el editor visual';

  nodos: any[] = [];
  nodoSeleccionado: any = null;

  mensaje: string = '';
  error: string = '';

  constructor(private api: Api) {}

  agregarNodo(tipo: string): void {
    const numero = this.nodos.length + 1;

    const nuevoNodo: any = {
      id: `${tipo}${numero}`,
      tipo,
      nombre: this.obtenerNombrePorTipo(tipo),
      descripcion: '',
      rolAsignado: tipo === 'tarea' ? 'Usuario' : ''
    };

    if (tipo === 'tarea') {
      nuevoNodo.formulario = {
        campos: [
       
        ]
      };
    }

    this.nodos.push(nuevoNodo);
    this.nodoSeleccionado = nuevoNodo;
  }

  obtenerNombrePorTipo(tipo: string): string {
    if (tipo === 'inicio') return 'Inicio';
    if (tipo === 'tarea') return 'Nueva tarea';
    if (tipo === 'decision') return 'Decisión';
    if (tipo === 'fin') return 'Fin';

    return 'Nodo';
  }

  seleccionarNodo(nodo: any): void {
    this.nodoSeleccionado = nodo;
  }

  moverNodo(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.nodos, event.previousIndex, event.currentIndex);
  }

  eliminarNodo(nodo: any): void {
    this.nodos = this.nodos.filter(item => item !== nodo);

    if (this.nodoSeleccionado === nodo) {
      this.nodoSeleccionado = null;
    }
  }

  generarEnlaces(): any[] {
    const enlaces = [];

    for (let i = 0; i < this.nodos.length - 1; i++) {
      enlaces.push({
        origen: this.nodos[i].id,
        destino: this.nodos[i + 1].id
      });
    }

    return enlaces;
  }

  validarWorkflow(): boolean {
    const tieneInicio = this.nodos.some(nodo => nodo.tipo === 'inicio');
    const tieneFin = this.nodos.some(nodo => nodo.tipo === 'fin');
    const tieneTarea = this.nodos.some(nodo => nodo.tipo === 'tarea');

    if (!this.nombreWorkflow.trim()) {
      this.error = 'El workflow necesita un nombre';
      return false;
    }

    if (this.nodos.length < 3) {
      this.error = 'El workflow debe tener al menos inicio, una tarea y fin';
      return false;
    }

    if (!tieneInicio) {
      this.error = 'El workflow debe tener un nodo de inicio';
      return false;
    }

    if (!tieneTarea) {
      this.error = 'El workflow debe tener al menos una tarea';
      return false;
    }

    if (!tieneFin) {
      this.error = 'El workflow debe tener un nodo de fin';
      return false;
    }

    return true;
  }

  guardarWorkflow(): void {
    this.mensaje = '';
    this.error = '';

    if (!this.validarWorkflow()) {
      return;
    }

    const usuarioGuardado = localStorage.getItem('usuario');
    const usuario = usuarioGuardado ? JSON.parse(usuarioGuardado) : null;

    const datos = {
      nombre: this.nombreWorkflow,
      descripcion: this.descripcionWorkflow,
      creado_por: usuario?.id || null,
      estructura: {
        nodos: this.nodos,
        enlaces: this.generarEnlaces()
      }
    };

    this.api.crearWorkflow(datos).subscribe({
      next: () => {
        this.mensaje = 'Workflow guardado correctamente';
      },
      error: () => {
        this.error = 'Error al guardar el workflow';
      }
    });
  }

  crearPlantillaVacaciones(): void {
  this.nombreWorkflow = 'Solicitud de vacaciones con revisión';
  this.descripcionWorkflow = 'Proceso para solicitar vacaciones, registrar los datos del empleado y permitir la revisión por parte de un administrador.';

  this.nodos = [
    {
      id: 'inicio_vacaciones',
      tipo: 'inicio',
      nombre: 'Inicio',
      descripcion: 'Inicio del proceso de solicitud de vacaciones',
      rolAsignado: ''
    },
    {
      id: 'formulario_solicitud',
      tipo: 'tarea',
      nombre: 'Formulario de solicitud de vacaciones',
      descripcion: 'El usuario introduce los datos necesarios para solicitar vacaciones.',
      rolAsignado: 'Usuario',
      formulario: {
        campos: [
          {
            nombre: 'empleado',
            tipo: 'texto',
            etiqueta: 'Nombre del empleado',
            requerido: true
          },
          {
            nombre: 'departamento',
            tipo: 'texto',
            etiqueta: 'Departamento',
            requerido: true
          },
          {
            nombre: 'dias',
            tipo: 'numero',
            etiqueta: 'Número de días solicitados',
            requerido: true
          },
          {
            nombre: 'fecha_inicio',
            tipo: 'fecha',
            etiqueta: 'Fecha de inicio',
            requerido: true
          },
          {
            nombre: 'motivo',
            tipo: 'textarea',
            etiqueta: 'Motivo de la solicitud',
            requerido: false
          }
        ]
      }
    },
    {
      id: 'revision_admin',
      tipo: 'tarea',
      nombre: 'Revisión de solicitud de vacaciones',
      descripcion: 'El administrador revisa los datos enviados por el usuario y aprueba o rechaza la solicitud.',
      rolAsignado: 'Admin',
      formulario: {
        campos: [
          {
            nombre: 'decision',
            tipo: 'select',
            etiqueta: 'Decisión',
            requerido: true,
            opciones: ['Aprobada', 'Rechazada']
          },
          {
            nombre: 'comentario',
            tipo: 'textarea',
            etiqueta: 'Comentario del administrador',
            requerido: false
          }
        ]
      }
    },
    {
      id: 'fin_vacaciones',
      tipo: 'fin',
      nombre: 'Fin',
      descripcion: 'Finalización del proceso de vacaciones',
      rolAsignado: ''
    }
  ];

  this.nodoSeleccionado = this.nodos[1];
  this.mensaje = 'Plantilla de vacaciones cargada. Puedes revisarla y guardarla.';
  this.error = '';
  }


  agregarCampoFormulario(): void {
  if (!this.nodoSeleccionado || this.nodoSeleccionado.tipo !== 'tarea') {
    return;
  }

  if (!this.nodoSeleccionado.formulario) {
    this.nodoSeleccionado.formulario = {
      campos: []
    };
  }

  const numero = this.nodoSeleccionado.formulario.campos.length + 1;

  this.nodoSeleccionado.formulario.campos.push({
    nombre: `campo_${numero}`,
    etiqueta: `Campo ${numero}`,
    tipo: 'texto',
    requerido: false,
    opciones: []
    });
  }

  eliminarCampoFormulario(indice: number): void {
    if (!this.nodoSeleccionado?.formulario?.campos) {
      return;
    }

    this.nodoSeleccionado.formulario.campos.splice(indice, 1);
  }

  actualizarOpcionesCampo(campo: any, textoOpciones: string): void {
    campo.opciones = textoOpciones
      .split(',')
      .map((opcion: string) => opcion.trim())
      .filter((opcion: string) => opcion.length > 0);
    }
}