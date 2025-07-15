# Proyecto: Estación de Valija Electrónica

Este proyecto es una aplicación web desarrollada con [Astro](https://astro.build/), [Svelte](https://svelte.dev/) y [Tailwind CSS](https://tailwindcss.com/).

## Propósito

El objetivo principal de esta aplicación es proporcionar una interfaz de usuario para el sistema de "Valija Electrónica". La funcionalidad inicial se centra en la implementación de un formulario de inicio de sesión que se comunicará con una API para la autenticación de usuarios.

Posteriormente, se desarrollarán más características en el frontend que realizarán peticiones a un backend para obtener y mostrar datos, gestionando así toda la operativa de la estación.

## Entorno de Ejecución

Esta aplicación está diseñada para ser consumida a través de un control `WebView` dentro de una aplicación de escritorio de Windows Forms. Este enfoque permite la integración y comunicación con periféricos y hardware específico de la estación de trabajo, como lectores de huellas dactilares, facilitando una experiencia de usuario segura y eficiente.

## Funcionalidad de Autenticación

El sistema de inicio de sesión se conecta a un endpoint para validar las credenciales del usuario y asignar un rol (`Gerente` o `Supervisor`) basado en las estaciones asociadas.

Para una descripción técnica detallada de la API, la lógica de roles y la ruta de desarrollo, consulta el archivo [README_LOGIN.md](./README_LOGIN.md).

---

*Este es un proyecto en desarrollo.*
