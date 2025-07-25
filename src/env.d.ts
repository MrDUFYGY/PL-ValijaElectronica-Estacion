/// <reference types="astro/client" />

declare namespace App {
  // Define la estructura del objeto Rol
  interface RolObject {
    n_IdRol: number;
    c_Nombre: string;
  }

  // Define la estructura del objeto de Usuario
  interface UserObject {
    n_IdUsuario: number;
    c_NickName: string;
    c_Nombre: string;
    c_ApellidoPat: string;
    c_ApellidoMat: string;
    c_CorreoElectronico: string;
    RolObject: RolObject;
  }

  // Define la estructura del resultado validado que viene de la API
  interface ResultValidated {
    success: boolean;
    sessionId: number;
    role: string;
    stations: string;
    userObj: UserObject;
  }

  // Define la estructura completa de los datos de sesión
  interface SessionTotal {
    Exitoso: boolean;
    resultValidated: ResultValidated;
  }

  // Actualiza la interfaz Locals para usar el nuevo tipo de sesión
  interface Locals {
    SessionTotal?: SessionTotal;
  }
}
