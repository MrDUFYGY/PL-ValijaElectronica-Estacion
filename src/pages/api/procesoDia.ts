import type { APIRoute } from 'astro';
import axios from 'axios';
import https from 'https';

export const prerender = false;

// El agente HTTPS solo se usa en desarrollo para aceptar certificados autofirmados.
// En producción, `agent` será `undefined` y se usará la configuración segura por defecto.
const agent = process.env.NODE_ENV === 'development'
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;

// Este endpoint actúa como un proxy para la API de procesos del día.
export const GET: APIRoute = async ({ url }) => {
  const station = url.searchParams.get('station');
  const date = url.searchParams.get('date');

  if (!station || !date) {
    return new Response(JSON.stringify({ 
      Correct: false, 
      ErrorMessage: 'Faltan los parámetros de estación o fecha.' 
    }), { status: 400 });
  }

  try {
    const apiUrl = `https://localhost:44345/api/Valija/GetIdProcesoDiaByFechaHD?fecha=${date}&idEstacion=${station}&clienteId=true`;
    
    const response = await axios.get(apiUrl, { httpsAgent: agent });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error en el proxy de la API procesoDia:', error);

    // Axios envuelve el error. Si es un error de red o de la API, lo manejamos.
    if (axios.isAxiosError(error) && error.response) {
      // Reenviar el estado y el cuerpo del error de la API externa
      return new Response(JSON.stringify(error.response.data), {
        status: error.response.status
      });
    }

    // Si es otro tipo de error (ej. de red, certificado, etc.)
    return new Response(JSON.stringify({ 
      Correct: false, 
      ErrorMessage: 'No se pudo conectar con el servicio de procesos.' 
    }), { status: 500 });
  }
};
