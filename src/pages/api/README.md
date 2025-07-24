# Arquitectura de API Proxy en Astro

Este documento explica el patrón de diseño utilizado para las rutas de API dentro de `src/pages/api/`.

## 1. El Patrón de Proxy

Las rutas de API en este proyecto (ej. `/api/getUserData`, `/api/procesoDia`) no contienen la lógica de negocio principal. En su lugar, actúan como un **proxy seguro** entre el frontend (el navegador del cliente) y el backend de .NET.

**¿Por qué usar un proxy?**

- **Seguridad:** Las URLs reales del backend de .NET y cualquier credencial necesaria nunca se exponen al cliente.
- **CORS:** Evita problemas de Cross-Origin Resource Sharing (CORS), ya que el frontend y el proxy de API se ejecutan en el mismo dominio.
- **Abstracción:** Permite modificar la ubicación o la estructura del backend de .NET sin tener que cambiar el código del frontend.

El flujo es el siguiente:
`Cliente (Navegador) -> API Proxy de Astro -> API Backend (.NET)`

## 2. Manejo de Certificados SSL en Desarrollo

El backend de .NET en el entorno de desarrollo local se ejecuta en `https://localhost` con un **certificado SSL autofirmado**. Por defecto, Node.js rechaza estos certificados por seguridad.

**La Solución:**

Para permitir la comunicación entre el proxy de Astro y el backend de .NET en desarrollo, utilizamos un `https.Agent` personalizado que deshabilita la validación de certificados.

```typescript
const agent = process.env.NODE_ENV === 'development'
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined;
```

Este código es inteligente y seguro:
- **En `desarrollo` (`npm run dev`):** Crea un agente que permite la conexión con el certificado autofirmado.
- **En `producción` (`npm run build`):** La variable `agent` es `undefined`, por lo que `axios` utiliza su configuración por defecto, que **exige un certificado SSL válido y seguro**.

## 3. Uso de `axios`

Se eligió la librería `axios` en lugar de la función nativa `fetch` por su capacidad robusta y explícita para manejar el `https.Agent` personalizado por petición. Esto fue clave para resolver un error de conexión persistente durante el desarrollo.

Se recomienda mantener `axios` como dependencia para garantizar la estabilidad de la comunicación con el backend.
