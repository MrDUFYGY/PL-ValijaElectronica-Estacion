import type { APIRoute } from 'astro';
export const prerender = false;
// Este endpoint se encarga de cerrar la sesión del usuario.
export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Eliminamos la cookie de sesión estableciendo su fecha de expiración en el pasado.
  cookies.delete('sessionId', {
    path: '/',
  });
  
  // Redirigimos al usuario a la página de inicio de sesión.
  return redirect('/');
};
