# README: Integración con la API de Valija Electrónica

Este documento describe la configuración y los puntos clave para la integración de este proyecto Astro con la API backend de Valija Electrónica.

## Entornos

La aplicación se conecta a diferentes URLs de la API dependiendo del entorno en el que se ejecute.

### Entorno de Desarrollo (Local)

En el entorno de desarrollo, la aplicación se conecta a una instancia local de la API que se ejecuta en `https://localhost:44345`.

**Punto Crítico: Certificado Autofirmado (Self-Signed Certificate)**

La API local utiliza un certificado SSL autofirmado. Por defecto, Node.js (el entorno que ejecuta Astro en el servidor) rechaza las conexiones a servidores con certificados no confiables, lo que provoca el siguiente error:

```
Error: self-signed certificate
code: 'DEPTH_ZERO_SELF_SIGNED_CERT'
```

**Solución para Desarrollo:**

Para solucionar este problema **únicamente en el entorno de desarrollo**, es necesario indicarle a Node.js que ignore la validación de certificados. La forma estándar de hacerlo es estableciendo una variable de entorno antes de iniciar el servidor de desarrollo.

En el archivo `package.json`, el script `dev` se ha modificado para incluir esta variable:

```json
"scripts": {
  "dev": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 astro dev"
}
```

> **Nota:** Actualmente, esta solución no está funcionando como se esperaba y el error persiste. Se está investigando una solución alternativa, posiblemente a través de la configuración de Vite dentro de Astro.

### Entorno de Producción

En producción, la aplicación se conectará a la URL real de la API de Valija Electrónica, la cual deberá contar con un certificado SSL válido emitido por una Autoridad de Certificación (CA) reconocida.

**¡IMPORTANTE!**

La variable de entorno `NODE_TLS_REJECT_UNAUTHORIZED=0` **NUNCA** debe usarse en producción. Hacerlo representaría un grave riesgo de seguridad, ya que deshabilitaría la protección contra ataques de intermediario (man-in-the-middle).

## Puntos a Tener en Cuenta

1.  **Gestión de URLs de API:** Se recomienda utilizar variables de entorno (a través de archivos `.env`) para gestionar las URLs de la API. Esto permite cambiar fácilmente entre la URL de desarrollo y la de producción sin modificar el código.
    -   `PUBLIC_API_URL_DEV=https://localhost:44345/api`
    -   `PUBLIC_API_URL_PROD=https://api.valija-electronica.com/api`

2.  **Proxy de API:** Las rutas en `src/pages/api/` actúan como un proxy. En lugar de que el cliente (navegador) llame directamente a la API de Valija (lo que podría causar problemas de CORS), el cliente llama a nuestra API de Astro, y esta, desde el servidor, llama a la API de Valija. Esto es una buena práctica de seguridad y organización.
