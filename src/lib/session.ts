// NOTA: Este es un almacén de sesiones en memoria SOLO para desarrollo.
// En producción, esto debería ser reemplazado por una base de datos o una caché como Redis.

export interface SessionData {
  userId: string;
  role: string;
  stations: string;
}

export const sessions = new Map<string, SessionData>();
