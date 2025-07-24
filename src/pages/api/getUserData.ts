import type { APIRoute } from 'astro';
import { Agent as UndiciAgent, fetch } from 'undici';

export const prerender = false;

// Para usar `fetch` con certificados autofirmados en desarrollo, necesitamos un `dispatcher` de `undici`.
// En producción, `dispatcher` será `undefined` y `fetch` usará su configuración segura por defecto.
const dispatcher = process.env.NODE_ENV === 'development'
  ? new UndiciAgent({ connect: { rejectUnauthorized: false } })
  : undefined;

// Este endpoint actua como un proxy para obtener los datos del usuario de forma segura
// sin exponer la URL del API de .NET al cliente.
export const GET: APIRoute = async ({ url }) => {
  const nickname = url.searchParams.get('nickname');

  if (!nickname) {
    return new Response(JSON.stringify({ message: 'El nickname es requerido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const apiUrl = `https://localhost:44345/api/Valija/GetUsuarioByNickname?nickname=${nickname}`;
    console.log(`[PROXY] Intentando llamar a la API de .NET con fetch: ${apiUrl}`);

    /* --- IMPLEMENTACIÓN ANTERIOR CON AXIOS (COMENTADA) ---
    // const response = await axios.get(apiUrl, { httpsAgent: agent });
    // const finalData = JSON.parse(response.data);
    */

    // --- NUEVA IMPLEMENTACIÓN CON FETCH ---
    const response = await fetch(apiUrl, { dispatcher });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[PROXY] Error desde la API de .NET: ${errorText}`);
      return new Response(errorText, { status: response.status });
    }

    const rawData = await response.json();
    const finalData = JSON.parse(rawData as string); // El backend devuelve un string JSON

    if (!finalData.Success) {
      throw new Error(finalData.Message || 'El backend indicó un fallo.');
    }

    // Devolvemos solo el objeto Data, que es lo que el frontend espera.
    return new Response(JSON.stringify(finalData.Data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
    console.error('[API Proxy GetUserData] Error:', message);
    if (error instanceof Error) {
      console.error('[API Proxy GetUserData] Error:', error.message);
    } else {
      console.error('[API Proxy GetUserData] An unknown error occurred:', error);
    }

    // Si es otro tipo de error (red, certificado, etc.)
    return new Response(JSON.stringify({ message: 'No se pudo conectar con el servicio de usuarios.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
