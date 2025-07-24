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

## 3. Flujo limpio de Login y Persistencia de Sesión

La implementación actual y recomendada para la gestión de sesión es la siguiente:

1. El usuario ingresa sus credenciales en el frontend.
2. El frontend envía las credenciales al API externo (`/ws_LoginEst/LoginHD`).
3. Si el login es exitoso:
   - El frontend determina el rol según el campo `Estaciones`.
   - El frontend llama a `/api/Valija/AddLogin` enviando usuario, contraseña y rol.
   - El backend crea la sesión y responde con un `sessionId` (n_IdSesionDiaHist generado por la base de datos).
   - El frontend guarda el `sessionId` en una cookie (preferentemente httpOnly, usando Set-Cookie desde el backend si es posible).
4. El middleware valida la sesión en cada request usando el `sessionId` de la cookie y la base de datos.
5. **No se usa almacenamiento local ni sesiones en memoria en el backend ni en el frontend.**

### Notas importantes:
- El `sessionId` nunca debe generarse en el frontend, siempre lo genera y controla el backend.
- El backend es el único responsable de crear y validar sesiones.
- El frontend nunca debe guardar datos sensibles de sesión fuera de la cookie.
- El middleware y las rutas protegidas consultan la base de datos para validar la sesión.
- El rol del usuario se determina y persiste en la base de datos, y se puede devolver al frontend como referencia visual.

### Ejemplo de flujo en código (TypeScript, API de login):

```typescript
export const POST: APIRoute = async ({ request }) => {
  const ebody = await request.json();

  if (!ebody.cUsuario || !ebody.cPSS) {
    return new Response(JSON.stringify({ Exitoso: false, Mensaje: 'Faltan los campos cUsuario o cPSS.' }), { status: 400 });
  }

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
  const role = data.Estaciones.includes(',') ? 'Supervisor' : 'Gerente';

  // 2. Registro de sesión en backend propio
  const apiResponseSesion = await fetch('https://localhost:44345/api/Valija/AddLogin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      UserName: ebody.cUsuario,
      Password: ebody.cPSS,
      role: role
    })
  });

  if (!apiResponseSesion.ok) {
    throw new Error(`La API interna respondió con el estado: ${apiResponseSesion.status}`);
  }

  const resultApiValija = await apiResponseSesion.json();

  // 3. Guardar sessionId en cookie (solo si backend no lo hace con httpOnly)
  // if (resultApiValija.success && resultApiValija.sessionId) {
  //   document.cookie = `sessionId=${resultApiValija.sessionId}; path=/; SameSite=Strict`;
  // }

  // 4. Retornar resultado al frontend
  return new Response(JSON.stringify({
    Exitoso: data.Exitoso,
    Mensaje: data.Mensaje,
    sessionId: resultApiValija.sessionId,
    role: role,
    estaciones: data.Estaciones
  }), { status: 200 });
};
```

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

---

## Arquitectura de Autenticación (Actual)

Para centralizar y robustecer la lógica de autenticación, el proyecto ha adoptado el uso de **Middleware de Astro**. Este enfoque nos permite proteger rutas de manera centralizada, segura y eficiente.

### ¿Cómo Funciona?

1.  **Middleware (`src/middleware.ts`):**
    - Se ha creado un archivo `middleware.ts` que actúa como un guardián para rutas específicas.
    - Antes de que un usuario pueda acceder a una ruta protegida (ej. `/dashboard`), el middleware intercepta la petición.
    - Verifica la existencia y validez de la cookie `sessionId` contra el almacén de sesiones en `src/lib/session.ts`.
    - Si la sesión no es válida, redirige al usuario a la página de inicio (`/`) de forma inmediata.
    - Si la sesión es válida, extrae los datos del usuario (ID, rol, estaciones) y los adjunta al objeto global `Astro.locals.user`.

2.  **Acceso en Páginas (`.astro`):**
    - Las páginas protegidas, como `dashboard.astro`, ahora tienen un código mucho más limpio. Ya no necesitan verificar la sesión.
    - Simplemente acceden a los datos del usuario a través de `Astro.locals.user`, que ya ha sido validado y poblado por el middleware.

3.  **Tipado Seguro (`src/env.d.ts`):**
    - Para que TypeScript entienda la estructura de nuestro objeto `Astro.locals.user` personalizado, se ha definido en `src/env.d.ts`.
    - Esto proporciona autocompletado y seguridad de tipos en todo el proyecto al acceder a los datos de la sesión.

### Ventajas de este Enfoque

-   **Centralizado y DRY (Don't Repeat Yourself):** Toda la lógica de autenticación reside en un único lugar, facilitando su mantenimiento y evitando la duplicación de código.
-   **Seguridad Mejorada:** La verificación se realiza en el servidor antes de que cualquier código de la página se ejecute, previniendo la exposición de contenido protegido.
-   **Código Limpio:** Las páginas y layouts se centran exclusivamente en su contenido y funcionalidad, sin preocuparse por la lógica de autenticación.
