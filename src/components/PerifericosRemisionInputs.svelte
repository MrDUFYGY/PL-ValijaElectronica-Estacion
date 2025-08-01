<script>
  import CustomPdfInput from "./customInput/CustomPdfInput.svelte";
  import { fade } from 'svelte/transition';

  let remisiones = [
    { id: Date.now(), observaciones: "", pdf: null }
  ];

  function addRemision() {
    remisiones = [...remisiones, { id: Date.now() + Math.random(), observaciones: "", pdf: null }];
  }

  function removeRemision(idx) {
    if (remisiones.length > 1) {
      remisiones = remisiones.filter((_, i) => i !== idx);
    }
  }

  function handlePdfChange(idx, file) {
    remisiones[idx].pdf = file;
  }
</script>

<div class="remisiones-grid">
  {#each remisiones as remision, i (remision.id)}
    <div class="remision-card" transition:fade>
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-semibold text-blue-700">Remisión #{i + 1}</h3>
        {#if remisiones.length > 1}
          <button type="button" class="text-red-600 text-sm font-bold hover:underline" on:click={() => removeRemision(i)} title="Eliminar esta remisión">✕</button>
        {/if}
      </div>
      <div class="mb-4">
        <label for={`observaciones-periferico-${remision.id}`} class="block text-base font-semibold text-gray-700 mb-2">Observaciones</label>
        <textarea
          id={`observaciones-periferico-${remision.id}`}
          rows="4"
          maxlength="500"
          class="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-base resize-none shadow-sm"
          placeholder="Escriba aquí las observaciones relevantes..."
          bind:value={remision.observaciones}
        ></textarea>
      </div>
      <div>
        <label for={`input-periferico-${remision.id}`} class="block text-base font-semibold text-blue-700 mb-2">Archivo de remisión (PDF)</label>
        <CustomPdfInput
          inputId={`input-periferico-${remision.id}`}
          id={`input-periferico-${remision.id}`}
          label="Remisión PDF"
          confirmado={true}
          class="w-full"
          on:fileSelected={(e) => handlePdfChange(i, e.detail)}
        />
        <p class="mt-2 text-xs text-blue-600">Solo se acepta un archivo PDF.</p>
      </div>
    </div>
  {/each}
  <button type="button" class="add-remision-btn" on:click={addRemision}>+ Agregar otra remisión</button>
</div>

<style>
  .remisiones-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  @media (min-width: 900px) {
    .remisiones-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
  .remision-card {
    background: #f0f6ff;
    border: 1.5px solid #c9e2ff;
    border-radius: 1rem;
    box-shadow: 0 2px 8px 0 #e0e7ef33;
    padding: 2rem 1.5rem 1.5rem 1.5rem;
    min-width: 0;
    display: flex;
    flex-direction: column;
    min-height: 350px;
  }
  .add-remision-btn {
    margin-top: 1rem;
    width: 100%;
    padding: 1rem;
    background: #e0f2fe;
    color: #0369a1;
    font-weight: 600;
    border-radius: 0.75rem;
    border: 1.5px solid #7dd3fc;
    transition: background 0.2s;
    font-size: 1.1rem;
    box-shadow: 0 1px 4px #e0e7ef44;
  }
  .add-remision-btn:hover {
    background: #bae6fd;
  }
</style>
