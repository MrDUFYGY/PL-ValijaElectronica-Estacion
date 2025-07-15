<script>
  // Valores por defecto para facilitar las pruebas
  let employeeId = 'HD003';
  let password = 'CGPcgp01';
  
  let isLoading = false;
  let errorMessage = '';

  async function handleSubmit() {
    isLoading = true;
    errorMessage = '';

    try {
      // Codificamos la contraseña a Base64 antes de enviarla
      const encodedPassword = btoa(password);

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cUsuario: employeeId,
          cPSS: encodedPassword,
          Token: ""
        })
      });

      const data = await response.json();

      // Verificamos si el login fue exitoso Y si recibimos un token de sesión
      if (data.Exitoso && data.sessionId) {
        // Guardamos el token en el almacenamiento de la sesión del navegador
        sessionStorage.setItem('sessionId', data.sessionId);

        // Redirigimos al usuario al panel de control
        window.location.href = '/dashboard';

      } else {
        errorMessage = data.Mensaje || 'Error en la petición. Por favor, inténtalo de nuevo.';
      }

    } catch (error) {
      errorMessage = 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
  <div class="max-w-md w-full mx-auto bg-white p-8 border border-gray-300 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-8">Valija Electrónica - Inicio de Sesión</h2>
    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <div>
        <label for="employeeId" class="text-sm font-medium text-gray-700">Número de Empleado</label>
        <input 
          type="text" 
          id="employeeId" 
          bind:value={employeeId} 
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Tu número de empleado"
          required
        >
      </div>
      <div>
        <label for="password" class="text-sm font-medium text-gray-700">Contraseña</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password} 
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Tu contraseña"
          required
        >
      </div>
      <div>
        <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Iniciar Sesión
        </button>
      </div>
    </form>
  </div>
</div>
