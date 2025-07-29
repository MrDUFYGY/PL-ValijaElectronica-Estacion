<script>
  import CustomPdfInput from "./customInput/CustomPdfInput.svelte";
  let checked = false;
  let locked = false;
  let gastos = [{ id: Date.now(), emailText: "" }];
  const minLength = 50;

  function handleCheck() {
    checked = true;
    locked = true;
  }
  function addGasto() {
    gastos = [...gastos, { id: Date.now() + Math.random(), emailText: "" }];
  }
</script>

<div class="flex flex-col md:flex-row md:items-start md:justify-between space-y-2 md:space-y-0 md:space-x-4 my-4">
  <div class="flex items-center space-x-4">
    <input
      type="checkbox"
      id="gastos-check"
      class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 transition"
      bind:checked={checked}
      disabled={locked}
      on:change={handleCheck}
    />
    <label for="gastos-check" class="text-base font-medium text-gray-700 select-none">
      Gastos
    </label>
    <button
      class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed transition cursor-pointer"
      disabled={!checked}
      on:click={addGasto}
    >
      Añadir +1 gasto
    </button>
  </div>
  {#if checked}
    <div class="w-full md:w-1/2 p-3 text-sm bg-blue-100 border border-blue-200 rounded-md md:ml-auto">
      <p class="font-medium text-blue-800">Requisitos para gastos:</p>
      <ul class="list-disc pl-5 mt-1 text-blue-700">
        <li>Autorización por correo electrónico</li>
        <li>Factura PDF (menores a $2,000)</li>
      </ul>
    </div>
  {/if}
</div>

{#if checked}
  <div class="flex flex-wrap gap-4 justify-start">
    {#each gastos as gasto, i (gasto.id)}
      <div class="min-w-[300px] max-w-[400px] flex-1 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm animate-fade-in">
        <div class="flex flex-col gap-4 mb-4">
          <div>
            <label for={`input-gastos-${gasto.id}`} class="block text-sm font-medium text-blue-700 mb-1">Archivo de gasto (PDF)</label>
            <CustomPdfInput id={`input-gastos-${gasto.id}`} groupId={`gastos-${gasto.id}`} title="Gastos" confirmado={true} />
          </div>
          <div>
            <div class="bg-gray-100 px-3 py-2 rounded mb-2">
              <p class="text-xs text-gray-500">Asunto</p>
              <input type="text" value="gastos - HD [000]" readonly class="w-full bg-transparent text-sm font-medium text-gray-700" />
            </div>
            <div class="px-3 py-2">
              <p class="text-xs text-gray-500 mb-1">CC:</p>
              <div class="flex flex-wrap gap-1">
                <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">guillermo@hidrosina.com.mx</span>
                <span class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">benjamin@hidrosina.com.mx</span>
              </div>
            </div>
            <div class="p-3">
              <textarea
                placeholder="Redacte su correo de autorización..."
                minlength={minLength}
                bind:value={gastos[i].emailText}
                required
                class="w-full h-32 p-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              <p class="text-xs text-gray-500 mt-1">Mínimo {minLength} caracteres ({gastos[i].emailText.length || 0}/{minLength})</p>
            </div>
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