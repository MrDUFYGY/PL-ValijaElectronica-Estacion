import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const ebody = await request.json();

  if (!ebody.cUsuario || !ebody.cPSS) {
    return new Response(JSON.stringify({ Exitoso: false, Mensaje: 'Faltan los campos cUsuario o cPSS.' }), { status: 400 });
  }

  try {
    // 1. Login externo
    const apiResponse = await fetch('https://www.hidrosina.com.mx/serviciosHD/api/ws_LoginEst/LoginHD', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ebody),
    });

    if (!apiResponse.ok) {
      throw new Error(`La API externa respondió con el estado: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();

    // Devuelve la respuesta tal cual al frontend
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en el proxy de la API:', error);
    return new Response(JSON.stringify({ Exitoso: false, Mensaje: 'No se pudo conectar con el servicio de autenticación.' }), { status: 500 });
  }
};