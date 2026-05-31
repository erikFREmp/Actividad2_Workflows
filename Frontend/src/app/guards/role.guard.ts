import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);

  const usuarioGuardado = localStorage.getItem('usuario');

  if (!usuarioGuardado) {
    router.navigate(['/login']);
    return false;
  }

  const usuario = JSON.parse(usuarioGuardado);
  const rolesPermitidos = route.data?.['roles'] as string[];

  if (!rolesPermitidos || rolesPermitidos.includes(usuario.rol)) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};