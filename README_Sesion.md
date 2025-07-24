# Plan de Implementación: Registro de Sesiones de Usuario

## 1. Objetivo

Registrar cada inicio de sesión exitoso en la tabla `Cat_SesionDiaHistorico` para auditar y monitorear la actividad de los usuarios en el sistema. Esto se logrará creando un nuevo flujo que se dispara inmediatamente después de una autenticación correcta.

## 2. Flujo de Datos y Componentes Involucrados

El proceso se ejecutará en el backend para garantizar la seguridad y la integridad de los datos, siguiendo estos pasos:

1.  **Endpoint de Login de Astro (`src/pages/api/login.ts`):**
    *   El flujo actual que llama a la API externa (`serviciosHD`) para validar las credenciales del usuario se mantiene sin cambios.
    *   **NUEVO PASO:** Después de que la API externa confirma que el login es exitoso y devuelve el `nickname`, este mismo endpoint de Astro realizará una segunda llamada `fetch`.
    *   Esta nueva llamada apuntará a un **nuevo endpoint en la API de .NET** diseñado específicamente para registrar la sesión (ej. `api/Valija/RegistrarSesion`).
    *   Se le enviará el `nickname` del usuario que acaba de iniciar sesión.

2.  **API Backend (.NET):**
    *   Se creará un nuevo método en el `ValijaController` que escuchará en la ruta `[POST] api/Valija/RegistrarSesion`.
    *   Este método recibirá el `nickname` como parámetro.

3.  **Capa de Negocio (.NET - BL):**
    *   El controlador llamará a un nuevo método en la capa de negocio (ej. `BL.Corporativo.RegistrarSesionDeUsuario(string nickname)`).
    *   Esta capa contendrá la lógica principal:
        *   Obtener el `n_IdLogin` correspondiente al `nickname` desde la tabla `Op_Login`.
        *   Preparar los datos para la inserción en `Cat_SesionDiaHistorico`.
        *   Llamar a un Stored Procedure en la base de datos para realizar el `INSERT`.

4.  **Base de Datos (SQL Server):**
    *   Se creará un **Stored Procedure** (ej. `sp_RegistrarSesion`) que recibirá los parámetros necesarios (`nickname` o `idLogin`, `idEstacion`, etc.).
    *   El SP se encargará de realizar la inserción atómica en la tabla `Cat_SesionDiaHistorico`, manejando la lógica de fechas (`GETDATE()`) y valores por defecto.

## 3. Estructura de la Base de Datos Relevante

```sql
-- Tabla donde se validan las credenciales iniciales
CREATE TABLE Op_Login (
    n_IdLogin INT IDENTITY(1,1) PRIMARY KEY,
    c_UserName NVARCHAR(255) NOT NULL, -- H# ó NApellido
    c_Contrasena NVARCHAR(255) NOT NULL,
    c_jwt_token NVARCHAR(255) NULL,
    bool_Success BIT NOT NULL DEFAULT 0,
    n_Intentos INT NOT NULL DEFAULT 0
);

-- Tabla de catálogo de estaciones
CREATE TABLE Cat_Estacion (
    n_IdEstacion INT PRIMARY KEY IDENTITY(1,1),
    c_RazonSocial NVARCHAR(100) NOT NULL,
    c_NumeroEstacion NVARCHAR(50) NOT NULL
);

-- Tabla principal para el registro histórico de sesiones
CREATE TABLE Cat_SesionDiaHistorico (
    n_IdSesionDiaHist INT IDENTITY(1,1) PRIMARY KEY,
    dt_FechaHora DATETIME NOT NULL,
    c_UsuarioJSON NVARCHAR(MAX) NOT NULL, -- JSON con datos del usuario
    d_TiempoSesion DATETIME NULL, --tiempo en sesion
    n_PasosRealizados INT NULL, --procesos realizados en el tiempo de la sesion
    d_Horalngreso DATETIME NULL, --Hora en la que entro el usuario o se realizo el primero intento.
    d_HoraSalida DATETIME NULL, --Ultima vez visto desde el servidor
    n_Turno INT NULL, --Turno en el que fue ingresado 
    b_SesionConcluida BIT NOT NULL DEFAULT 0, --Cerro la sesion correctamente 
    n_IdLogin INT NULL, -- FK a Op_Login
    n_IdEstacion INT NULL,
    CONSTRAINT FK_SesionDiaHistorico_Login FOREIGN KEY (n_IdLogin) REFERENCES Op_Login(n_IdLogin),
    FOREIGN KEY (n_IdEstacion) REFERENCES Cat_Estacion(n_IdEstacion)
);
```

## 4. Próximos Pasos

1.  **Confirmar y arreglar** el problema actual de la llamada a `GetUsuarioByNickname`.
2.  **Crear el Stored Procedure** `sp_RegistrarSesion` en SQL Server.
3.  **Implementar el método** en la capa de negocio y de datos de .NET para llamar al SP.
4.  **Crear el nuevo endpoint** `api/Valija/RegistrarSesion` en el controlador de .NET.
5.  **Modificar el endpoint** `/api/login.ts` en Astro para que llame al nuevo endpoint de .NET tras un login exitoso.
