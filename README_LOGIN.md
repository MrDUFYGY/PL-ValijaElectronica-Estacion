# Ruta de Desarrollo y Propuesta para el Módulo de Login

Este documento describe el plan de desarrollo, las características de la API y la lógica de negocio para la funcionalidad de inicio de sesión de la Estación de Valija Electrónica.

## 1. API de Autenticación

La autenticación de usuarios se realizará a través del siguiente endpoint:

- **URL:** `https://www.hidrosina.com.mx/serviciosHD/api/ws_LoginEst/LoginHD`
- **Método:** `POST`
- **Headers:** `Content-Type: application/json`

### Formato de la Petición (Request)

Se debe enviar un objeto JSON con la siguiente estructura:

```json
{
  "cUsuario": "valor_del_input_usuario",
  "cPSS": "Q0dQY2dwMDE=",
  "Token": ""
}
```

- `cUsuario`: Corresponde al número de empleado ingresado por el usuario.
- `cPSS`: Es la **contraseña del usuario codificada en Base64**. El frontend se encarga de esta codificación antes de enviar la petición.
- `Token`: Se envía vacío, según especificación.

### Formato de la Respuesta (Response)

**Respuesta Exitosa:**

```json
{
    "CodError": 0,
    "Mensaje": "",
    "Exitoso": true,
    "Estaciones": "2,22,29,31,35,39,53,54,59,101,115,116,119,139,174,303,401,402,951,998,999"
}
```

**Respuesta de Error:**

```json
{
    "CodError": 0, // Puede variar
    "Mensaje": "Error en la petición",
    "Exitoso": false,
    "Estaciones": ""
}
```

## 2. Lógica de Roles de Usuario

Una vez que el usuario inicia sesión exitosamente, su rol se determinará a partir del campo `Estaciones` en la respuesta de la API:

- **Rol `Gerente`**: Si el campo `Estaciones` contiene un solo número (ej. `"3"`).
- **Rol `Supervisor`**: Si el campo `Estaciones` contiene múltiples números separados por comas (ej. `"2,22,29..."`).

Este rol se almacenará en la sesión del usuario para controlar el acceso a diferentes funcionalidades de la aplicación.

## 3. Propuesta de Implementación y Ruta de Desarrollo

La implementación se realizará siguiendo estos pasos:

1.  **Modificar `LoginForm.svelte`**: Integrar la llamada a la API usando `fetch` en la función `handleSubmit`.
2.  **Manejo de Estado**: Añadir variables de estado para controlar la carga (`isLoading`), errores (`error`), y los datos del usuario (`userData`). Esto permitirá mostrar feedback visual al usuario (spinners de carga, mensajes de error, etc.).
3.  **Almacenamiento de Sesión**: Utilizar `sessionStorage` o `localStorage` para guardar los datos del usuario y el token (si la API lo proporcionara en el futuro). Esto mantendrá al usuario autenticado mientras navega por la aplicación.
4.  **Redirección**: Después de un inicio de sesión exitoso, redirigir al usuario a un panel principal o dashboard (`/dashboard`).
5.  **Rutas Protegidas**: Implementar un sistema de rutas que verifique si el usuario está autenticado antes de permitir el acceso a páginas protegidas.

## 4. Gestión de Sesión y Seguridad (Propuestas)

Una vez que el usuario inicia sesión, es crucial mantener su estado de autenticación de forma segura mientras navega por la aplicación. A continuación se presentan varias alternativas comunes en entornos corporativos.

### Propuesta 1: Token de Sesión Temporal (Recomendada)

Esta es la estrategia más equilibrada y segura para nuestro caso de uso.

- **Cómo funciona**:
    1.  Tras un login exitoso, nuestro backend (el endpoint `/api/login`) genera un **token único y aleatorio** (ej. un UUID).
    2.  Este token se asocia con los datos del usuario (ID, rol, estaciones) y se almacena de forma segura en el servidor (en una base de datos o caché como Redis).
    3.  El token se envía de vuelta al frontend.
    4.  El frontend (nuestro componente Svelte) guarda este token en `sessionStorage`.
    5.  Para cada petición a un endpoint protegido, el frontend envía el token en el encabezado `Authorization: Bearer <token>`.
    6.  Un middleware en el backend verifica el token contra el almacén del servidor. Si es válido, permite el acceso.

- **Ventajas**:
    - **Alta Seguridad**: El token en sí no contiene datos sensibles. Si es robado, no revela información del usuario.
    - **Control Centralizado**: La sesión puede ser invalidada en cualquier momento desde el servidor (ej. al cerrar sesión o por inactividad), simplemente eliminando el token del almacén.
    - **Ideal para Astro**: Se integra perfectamente con los endpoints de servidor de Astro.

- **Desventajas**:
    - Requiere un almacenamiento en el servidor para los tokens de sesión.

### Propuesta 2: JSON Web Tokens (JWT)

Un estándar muy popular, pero puede ser excesivo para esta aplicación.

- **Cómo funciona**:
    1.  Tras el login, el backend crea un `JWT`, que es un objeto JSON con los datos del usuario (rol, ID) firmado con una clave secreta que solo el servidor conoce.
    2.  El JWT se envía al frontend y se almacena en `sessionStorage`.
    3.  El cliente envía el JWT en cada petición.
    4.  El backend verifica la firma del JWT. Si es válida, confía en la información que contiene sin necesidad de consultar una base de datos.

- **Ventajas**:
    - **Stateless**: El servidor no necesita almacenar el estado de la sesión, lo que facilita la escalabilidad.

- **Desventajas**:
    - **Difícil de invalidar**: Un JWT es válido hasta que expira. Revocar un token antes de su expiración (ej. si un usuario cambia su contraseña) es complejo y requiere soluciones adicionales como listas de bloqueo.

### Propuesta 3: Comunicación con Windows Forms (Avanzado)

Dado que la app corre en un WebView, se podría delegar la gestión de la sesión a la aplicación de escritorio anfitriona.

- **Cómo funciona**: El frontend se comunica con el código C# de la aplicación de Windows Forms para guardar y recuperar la información de la sesión. La aplicación de escritorio se convierte en la única fuente de verdad.

- **Ventajas**:
    - **Seguridad Centralizada**: Aprovecha el contexto de seguridad de la aplicación de escritorio.

- **Desventajas**:
    - **Alta Complejidad**: Requiere una implementación compleja de interoperabilidad entre JavaScript y C#.

---

**Conclusión y Propuesta Más Viable:**

Para este proyecto, la **Propuesta 1 (Token de Sesión Temporal)** es la más adecuada. Ofrece un alto nivel de seguridad y control, es fácil de implementar con Astro y se ajusta perfectamente a las necesidades de una aplicación corporativa que se ejecuta en un entorno controlado como un WebView.
