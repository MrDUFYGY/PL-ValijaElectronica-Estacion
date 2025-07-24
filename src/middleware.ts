import { defineMiddleware } from 'astro:middleware';

// Rutas que requieren una sesión de usuario válida.
const protectedRoutes = ['/dashboard', '/menuProcesosEstacion', '/procesosPages'];

// Valida la sesión contra el backend remoto
async function validarSesionRemota(sessionId: string | undefined): Promise<any | null> {
  console.log('Session ID antes de comprobar la sesion:', sessionId);

  if (!sessionId) return null;
  try {
    console.log('Session ID antes de llamar al api:', sessionId);

    const resp = await fetch('https://localhost:44345/api/Valija/ValidarSesion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ SessionId: sessionId })
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    // Esperamos que el backend devuelva { Exitoso: true, ...datosUsuario }
    return data.Exitoso ? data : null;
  } catch (error) {
    console.error('[ERROR en middleware] La llamada fetch a la API de validación falló:', error);
    return null;
  }
}

export const onRequest = defineMiddleware(async ({ locals, request, cookies, redirect }, next) => {
  const url = new URL(request.url);

  // IMPORTANTE: Ignoramos todas las rutas de API en el middleware de sesión.
  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  // Comprueba si la ruta actual está en la lista de protegidas.
  if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
    const sessionId = cookies.get('sessionId')?.value;
    console.log('Session ID en middleware:', sessionId);

    const userData = await validarSesionRemota(sessionId);
    if (!userData) {
      return redirect('/');
    }
    // Si la sesión es válida, adjunta la respuesta COMPLETA de la API a Astro.locals.
    // Esto asegura que la estructura coincida con el tipo `SessionData` definido en `env.d.ts`.
    locals.user = userData;
  }

  return next();
});
