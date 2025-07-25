<script lang="ts">
  // Prop para recibir las estaciones desde Astro
    export let stations: string;
  // Prop para recibir los datos completos del usuario, que vienen de dashboard.astro
  export let userData: any = null;

  // --- Estado del Componente ---
  const stationList = stations.split(',').filter(s => s.trim() !== '');
  let selectedStation: string | null = null;
  let selectedDate: Date | null = null;
  let showCalendar = false;

  // --- Lógica de Inicialización ---
  // Si solo hay una estación, la seleccionamos automáticamente
  if (stationList.length === 1) {
    selectedStation = stationList[0];
    showCalendar = true;
  }

  // --- Manejadores de Eventos ---
  function handleStationSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedStation = target.value;
    selectedDate = null; // Reseteamos la fecha al cambiar de estación
    showCalendar = !!selectedStation;
  }

  function handleDateSelect(date: Date) {
    selectedDate = date;
  }

    function handleContinue() {
    if (!selectedStation || !selectedDate) return;

    // Guardamos los datos del usuario en sessionStorage para pasarlos a la siguiente página
    if (userData) {
      try {
        sessionStorage.setItem('userData', JSON.stringify(userData));
      } catch (error) {
        console.error('Error al guardar datos en sessionStorage:', error);
        // Aquí podrías mostrar una alerta al usuario si es crítico
        alert('No se pudieron guardar los datos de la sesión. Inténtalo de nuevo.');
        return;
      }
    }
    
    // Formateamos la fecha a YYYY-MM-DD para la URL
    const dateString = selectedDate.toISOString().split('T')[0];
    window.location.href = `/menuProcesosEstacion?station=${selectedStation}&date=${dateString}`;
  }

  // --- Lógica del Calendario ---
  let dates: Date[] = [];
  $: if (showCalendar) {
    const today = new Date();
    dates = Array.from({ length: 5 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - i);
      return date;
    }).reverse();
  }
</script>

<div class="w-full max-w-2xl mx-auto bg-[#018E2E] p-6 rounded-lg shadow-md">
  
  <!-- Selector de Estación -->
  {#if stationList.length > 1}
    <div class="mb-6">
      <label for="station-select" class="block text-lg font-medium text-gray-700 mb-2">Selecciona una Estación:</label>
      <select 
        id="station-select" 
        class="block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500 text-lg"
        on:change={handleStationSelect}
      >
        <option value="">-- Por favor, elige una opción --</option>
        {#each stationList as station}
          <option value={station}>{station}</option>
        {/each}
      </select>
    </div>
  {/if}

  <!-- Calendario -->
  {#if showCalendar}
    <div class="mt-4">
      <h2 class="text-xl font-semibold text-white mb-4">Selecciona una Fecha</h2>
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        {#each dates as date}
          <button 
            on:click={() => handleDateSelect(date)}
            class="p-4 border rounded-lg text-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            class:bg-yellow-600={selectedDate?.getTime() === date.getTime()}
            class:text-white={selectedDate?.getTime() === date.getTime()}
            class:hover:bg-yellow-100={selectedDate?.getTime() !== date.getTime()}
            class:bg-gray-50={selectedDate?.getTime() !== date.getTime()}
          >
            <span class="block font-bold text-lg">{date.getDate()}</span>
            <span class="block text-sm capitalize">{date.toLocaleDateString('es-MX', { weekday: 'short' })}</span>
          </button>
        {/each}
      </div>
      <div class="mt-6 text-center">
        <button 
          on:click={handleContinue}
          disabled={!selectedStation || !selectedDate}
          class="px-8 py-3 bg-yellow-100 text-gray-800 font-bold rounded-lg shadow-md hover:bg-yellow-700 hover:text-white transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continuar
        </button>
      </div>
    </div>
  {/if}

  {#if stationList.length === 1}
    <p class="text-white mt-4">Estación seleccionada por defecto: <strong>{selectedStation}</strong></p>
  {/if}

</div>
