import type { APIRoute } from 'astro';
import { v4 as uuidv4 } from 'uuid';

export const prerender = false;

// NOTA: Este es un almacén de sesiones en memoria SOLO para desarrollo.
// En producción, esto debería ser reemplazado por una base de datos o una caché como Redis.
const sessions = new Map<string, { userId: string; role: string; stations: string }>();

export const POST: APIRoute = async ({ request }) => {
  const body = await request.json();

  if (!body.cUsuario || !body.cPSS) {
    return new Response(JSON.stringify({ Exitoso: false, Mensaje: 'Faltan los campos cUsuario o cPSS.' }), { status: 400 });
  }

  try {
    const apiResponse = await fetch('https://www.hidrosina.com.mx/serviciosHD/api/ws_LoginEst/LoginHD', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!apiResponse.ok) {
      throw new Error(`La API externa respondió con el estado: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    // Si el login en la API externa es exitoso, creamos nuestra propia sesión
    if (data.Exitoso) {
      const sessionId = uuidv4();
      const role = data.Estaciones.includes(',') ? 'Supervisor' : 'Gerente';

      const sessionData = {
        userId: body.cUsuario,
        role: role,
        stations: data.Estaciones,
      };

      sessions.set(sessionId, sessionData);

      // Devolvemos el token de sesión junto con la respuesta original
      return new Response(JSON.stringify({ ...data, sessionId }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Si la API externa devuelve un error, lo pasamos al frontend
      return new Response(JSON.stringify(data), {
        status: 200, // La petición al proxy fue exitosa, aunque el login fallara
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error en el proxy de la API:', error);
    return new Response(JSON.stringify({ Exitoso: false, Mensaje: 'No se pudo conectar con el servicio de autenticación.' }), { status: 500 });
  }
};
