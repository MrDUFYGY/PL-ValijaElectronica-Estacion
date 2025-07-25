<script>
  let employeeId = 'HD003';
  let password = 'CGPcgp01';
  
  let isLoading = false;
  let errorMessage = '';

  async function handleSubmit() {
    isLoading = true;
    errorMessage = '';

    try {
      const encodedPassword = btoa(password);

      // 1. LOGIN EXTERNO
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

      if (data.Exitoso) {
        // 2. LOGIN DIRECTO AL BACKEND C# PARA SESIÓN
        const responseSesion = await fetch('https://localhost:44345/api/Valija/AddLogin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            UserName: employeeId,
            Password: encodedPassword,
            Estaciones: data.Estaciones
          }),
          credentials: 'include'
        });

        const responseSesionJson = await responseSesion.json();

        if (responseSesion.ok && responseSesionJson.resultSession?.sessionId) {
          const sessionId = responseSesionJson.resultSession.sessionId;





          // Guardamos el sessionId en una cookie del lado del cliente.
          // Esto asegura que la cookie pertenece al dominio actual (localhost o el túnel)
          document.cookie = `sessionId=${sessionId}; path=/; SameSite=Lax`;
          window.location.href = '/dashboard'; // Redirige al dashboard
        } else {
          errorMessage = responseSesionJson.resultSession || 'Error al iniciar sesión. Verifique sus credenciales.';
        }
      } else {
        errorMessage = data.Mensaje || 'Error en la autenticación externa.';
      }
    } catch (error) {
      errorMessage = 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="min-h-screen  flex flex-col justify-center items-center">
  <div class="max-w-md w-full mx-auto bg-[#018E2E] p-8 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold text-center text-yellow-100 mb-8">Inicia Sesión</h2>
    <form on:submit|preventDefault={handleSubmit} class="space-y-6">
      <div>
        <label for="employeeId" class="text-sm font-medium text-white">Número de Empleado</label>
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
        <label for="password" class="text-sm font-medium text-white">Contraseña</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password} 
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Tu contraseña"
          required
        >
      </div>
      {#if errorMessage}
        <div class="text-red-600 text-sm">{errorMessage}</div>
      {/if}
      <div>
        <button type="submit" class="bg-[#FAEB30] w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black hover:bg-[#FAEB30]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" disabled={isLoading}>
          {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </div>
    </form>
  </div>
</div>