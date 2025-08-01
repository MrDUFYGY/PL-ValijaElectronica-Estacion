import type { APIRoute } from 'astro';
import axios from 'axios';
import https from 'https';

export const prerender = false;

// El agente HTTPS solo se usa en desarrollo para aceptar certificados autofirmados.
const agent = process.env.NODE_ENV === 'development'
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;

// Este endpoint actúa como un proxy para la API de procesos del día.
export const GET: APIRoute = async ({ url }) => {
  const station = url.searchParams.get('station');
  const date = url.searchParams.get('date');
  const nickname = url.searchParams.get('nickname');

  if (!station || !date || !nickname) {
    return new Response(JSON.stringify({ 
      Correct: false, 
      ErrorMessage: 'Faltan los parámetros de estación, fecha o nickname.' 
    }), { status: 400 });
  }

  try {
    // Ajusta la URL según los parámetros que espera tu backend
    const apiUrl = `https://localhost:44345/api/Valija/GetIdProcesoDiaByFechaHD?fecha=${date}&idEstacion=${station}&clienteId=true&nickname=${nickname}`;
    
    const response = await axios.get(apiUrl, { httpsAgent: agent });

    return new Response(JSON.stringify(response.data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error en el proxy de la API procesoDia:', error);

    if (axios.isAxiosError(error) && error.response) {
      return new Response(JSON.stringify(error.response.data), {
        status: error.response.status
      });
    }

    return new Response(JSON.stringify({ 
      Correct: false, 
      ErrorMessage: 'No se pudo conectar con el servicio de procesos.' 
    }), { status: 500 });
  }
};