import { defineMiddleware } from 'astro:middleware';

// ✅ Control para activar/desactivar el middleware.
// Cambia a 'false' para desactivar completamente el middleware.
const MIDDLEWARE_ENABLED = true;

// ✅ Modo desarrollo: recolecta datos pero NO redirige
// Cambia a 'false' para activar redirecciones normales
const DEVELOPMENT_MODE = true;

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
      headers: { 
        'Content-Type': 'application/json', },
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
  // Si el middleware está desactivado, se salta toda la lógica de validación.
  console.log('Middleware ejecutado');
  if (!MIDDLEWARE_ENABLED) {
    // Opcional: Si necesitas simular un usuario para desarrollo, puedes añadirlo aquí.
    locals.SessionTotal = {
      Exitoso: true,
      resultValidated: {
        success: true,
        sessionId: 999, // ID de sesión de prueba
        role: 'Gerente', // Rol de prueba
        stations: '3,4,5,6,7',
        userObj: {
          n_IdUsuario: 1,
          c_NickName: 'dev_user',
          c_Nombre: 'Desarrollador',
          c_ApellidoPat: 'Simulado',
          c_ApellidoMat: '',
          c_CorreoElectronico: 'dev@test.com',
          RolObject: {
            n_IdRol: 1,
            c_Nombre: 'Admin'
          }
        }
      }
    };
    console.log('Middleware ejecutado 2');
    return next();
  }
  const url = new URL(request.url);

  // IMPORTANTE: Ignoramos todas las rutas de API en el middleware de sesión.
  if (url.pathname.startsWith('/api/')) {
   return next();
  }
  // if (url.pathname.startsWith('/procesosPages/')) {
  //   return next();
  //  }

  try{
    // Comprueba si la ruta actual está en la lista de protegidas.
    if (protectedRoutes.some(route => url.pathname.startsWith(route))) {
      const sessionId = cookies.get('sessionId')?.value;
      console.log('Session ID en middleware:', sessionId);
      
      const userData = await validarSesionRemota(sessionId);
      // console.log("userData",userData);
      
      if (!userData) {
        console.log("No hay sesion");
        
        if (DEVELOPMENT_MODE) {
          // En modo desarrollo: crear datos simulados pero NO redirigir
          console.log('⚠️ MODO DESARROLLO: Sesión inválida pero continuando sin redirección');
          locals.SessionTotal = {
            Exitoso: true,
            resultValidated: {
              success: true,
              sessionId: 999,
              role: 'Desarrollador',
              stations: '1,2,3,4,5',
              userObj: {
                n_IdUsuario: 999,
                c_NickName: 'dev_user',
                c_Nombre: 'Desarrollador',
                c_ApellidoPat: 'Modo',
                c_ApellidoMat: 'Dev',
                c_CorreoElectronico: 'dev@localhost.com',
                RolObject: {
                  n_IdRol: 1,
                  c_Nombre: 'Admin'
                }
              }
            }
          };
        } else {
          // En modo producción: redirigir normalmente
          return redirect('/');
        }
      } else {
        // Si la sesión es válida, adjunta la respuesta COMPLETA de la API a Astro.locals.
        locals.SessionTotal = userData;
      }
      
    }
  }catch(e){
    console.log('Error en middleware:', e);
    
    if (DEVELOPMENT_MODE) {
      console.log('⚠️ MODO DESARROLLO: Error en middleware pero continuando sin redirección');
      // Crear datos simulados en caso de error
      locals.SessionTotal = {
        Exitoso: true,
        resultValidated: {
          success: true,
          sessionId: 999,
          role: 'Desarrollador',
          stations: '1,2,3,4,5',
          userObj: {
            n_IdUsuario: 999,
            c_NickName: 'dev_user',
            c_Nombre: 'Desarrollador',
            c_ApellidoPat: 'Error',
            c_ApellidoMat: 'Recovery',
            c_CorreoElectronico: 'dev@localhost.com',
            RolObject: {
              n_IdRol: 1,
              c_Nombre: 'Admin'
            }
          }
        }
      };
    } else {
      return redirect('/');
    }
  }



  return next();
});
