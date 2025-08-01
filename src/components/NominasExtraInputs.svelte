<script>
  import CustomPdfInput from "./customInput/CustomPdfInput.svelte";
  let nominas = [{ id: Date.now(), nota: "" }];
  const minLength = 30;

  function addNomina() {
    nominas = [...nominas, { id: Date.now() + Math.random(), nota: "" }];
  }
  function removeNomina(idx) {
    if (nominas.length > 1) {
      nominas = nominas.filter((_, i) => i !== idx);
    }
  }
</script>

<div class="mt-8">
  <div class="flex items-center mb-4 gap-2">
    <h4 class="text-base font-semibold text-blue-700">Nóminas adicionales</h4>
    <button
      class="ml-auto px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm font-medium shadow"
      on:click={addNomina}
      type="button"
    >
      + Añadir nómina
    </button>
  </div>
  <div class="flex flex-wrap gap-4">
    {#each nominas as nomina, i (nomina.id)}
      <div class="min-w-[300px] max-w-[400px] flex-1 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm animate-fade-in relative">
        <button
          class="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full px-2 py-0.5 text-xs hover:bg-red-200 transition"
          on:click={() => removeNomina(i)}
          type="button"
          aria-label="Eliminar"
          disabled={nominas.length === 1}
        >✕</button>
        <label class="block text-sm font-medium text-blue-700 mb-1" for={`input-nomina-extra-${nomina.id}`}>Archivo de nómina (PDF)</label>
        <CustomPdfInput id={`input-nomina-extra-${nomina.id}`} groupId={`nomina-extra-${nomina.id}`} title="Nómina Extra" confirmado={true} />
        <div class="mt-3">
          <label class="block text-xs text-gray-600 mb-1" for={`nota-nomina-extra-${nomina.id}`}>Nota</label>
          <textarea
            id={`nota-nomina-extra-${nomina.id}`}
            class="w-full h-20 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            placeholder="Agrega una nota para esta nómina extra..."
            minlength={minLength}
            bind:value={nominas[i].nota}
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">Mínimo {minLength} caracteres ({nominas[i].nota.length || 0}/{minLength})</p>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.4s ease;
  }
</style>
