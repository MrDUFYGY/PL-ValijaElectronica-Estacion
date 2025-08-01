import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
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

    if (!data.Exitoso) {
      return new Response(JSON.stringify({ Exitoso: false, Mensaje: data.Mensaje || 'Error en la autenticación externa.' }), { status: 401 });
    }

    // 2. Si el login externo es exitoso, creamos la sesión en la API de C#
    const responseSesion = await fetch('https://localhost:44345/api/Valija/AddLogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          UserName: ebody.cUsuario,
          Password: ebody.cPSS, // La contraseña ya viene en base64 desde el cliente
          Estaciones: data.Estaciones
        }),
      });

    if (!responseSesion.ok) {
        const errorData = await responseSesion.text();
        console.error('Error de la API de sesión C#:', errorData);
        throw new Error(`La API de sesión C# respondió con el estado: ${responseSesion.status}`);
    }

    const responseSesionJson = await responseSesion.json();

    if (responseSesionJson.resultSession?.sessionId) {
        const sessionId = responseSesionJson.resultSession.sessionId;
        // Guardamos el sessionId en una cookie HttpOnly y segura
        cookies.set('sessionId', sessionId, {
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD, // true en producción
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 // 1 día
        });

        return new Response(JSON.stringify({ Exitoso: true, Mensaje: 'Inicio de sesión correcto.' }), { status: 200 });
    } else {
        return new Response(JSON.stringify({ Exitoso: false, Mensaje: responseSesionJson.resultSession || 'No se pudo crear la sesión.' }), { status: 401 });
    }

  } catch (error) {
    console.error('Error en el proxy de la API:', error);
    return new Response(JSON.stringify({ Exitoso: false, Mensaje: 'No se pudo conectar con el servicio de autenticación.' }), { status: 500 });
  }
};