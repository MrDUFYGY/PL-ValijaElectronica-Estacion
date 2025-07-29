<script>
  import CustomPdfInput from "./customInput/CustomPdfInput.svelte";
  let checked = false;
  let locked = false;
  // Por defecto, un set de documentos; se pueden añadir más
  let docs = [
    { id: Date.now(), cartaPorte: '', facturaVDM: '', ticketVeeder: '' }
  ];
  
  function handleCheck() {
    checked = true;
    locked = true;
  }
  function addDoc() {
    docs = [
      ...docs,
      { id: Date.now() + Math.random(), cartaPorte: '', facturaVDM: '', ticketVeeder: '' }
    ];
  }
</script>

<div class="flex flex-col md:flex-row md:items-start md:justify-between space-y-2 md:space-y-0 md:space-x-4 my-4">
  <div class="flex items-center space-x-4">
    <input
      type="checkbox"
      id="docs-check"
      class="w-5 h-5 text-amber-600 border-gray-300 rounded focus:ring-amber-500 transition"
      bind:checked={checked}
      disabled={locked}
      on:change={handleCheck}
    />
    <label for="docs-check" class="text-base font-medium text-gray-700 select-none">
      Documentación Combustible
    </label>
    <button
      class="px-4 py-2 bg-amber-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition cursor-pointer"
      disabled={!checked}
      on:click={addDoc}
    >
      Añadir +1 set
    </button>
  </div>
  {#if checked}
    <div class="w-full md:w-1/2 p-3 text-sm bg-amber-100 border border-amber-200 rounded-md md:ml-auto">
      <p class="font-medium text-amber-800">Requisitos para documentación:</p>
      <ul class="list-disc pl-5 mt-1 text-amber-700">
        <li>Carta Porte</li>
        <li>Factura VDM</li>
        <li>Ticket VeederRoot</li>
      </ul>
    </div>
  {/if}
</div>

{#if checked}
  <div class="flex flex-wrap gap-4 justify-start">
    {#each docs as doc, i (doc.id)}
      <div class="min-w-[300px] max-w-[400px] flex-1 p-4 bg-amber-50 border border-amber-400 rounded-lg shadow-sm animate-fade-in">
        <div class="flex flex-col gap-2">
          <label for="numRemision" class="text-sm font-medium text-gray-700">Numero de Remision</label>
          <input
            type="text"
            id="numRemision"
            class="px-3 py-2 text-sm border border-gray-300 rounded bg-white"
            disabled={!checked}
          />

        </div>
        <div class="flex flex-col gap-4 mb-4">
          <div>
            <CustomPdfInput
              inputId={`input-CartaPortePemex-${doc.id}`}
              label="Carta Porte"
              disabled={!checked}
            />
          </div>
          <div>
            <CustomPdfInput
              inputId={`input-FacturaVDM-${doc.id}`}
              label="Factura VDM"
              disabled={!checked}
            />
          </div>
          <div>
            <CustomPdfInput
              inputId={`input-TicketVeederRoot-${doc.id}`}
              label="Ticket VeederRoot"
              disabled={!checked}
            />
          </div>
        </div>
      </div>
    {/each}
  </div>
{/if}

<style>
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.4s ease;
  }
</style>
