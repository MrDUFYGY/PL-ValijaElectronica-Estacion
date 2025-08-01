<script>
  import CustomPdfInput from "./customInput/CustomPdfInput.svelte";

  let jarreos = [
    {
      id: Date.now(),
      descripcion: '',
      pdfExtracciones: null,
      pdfRetornos: null,
      pdfVeeder: null,
    }
  ];

  function addJarreo() {
    jarreos = [
      ...jarreos,
      {
        id: Date.now() + Math.random(),
        descripcion: '',
        pdfExtracciones: null,
        pdfRetornos: null,
        pdfVeeder: null,
      }
    ];
  }

  function onPdfConfirm(idx, tipo, e) {
    jarreos[idx][tipo] = e.detail.file;
  }
</script>

<div class="mb-6 flex flex-col md:flex-row md:items-center md:space-x-6 space-y-2 md:space-y-0">
  <button
    class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold shadow"
    on:click={addJarreo}
    type="button"
  >
    Añadir +1 jarreo
  </button>
  <span class="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-3 py-1 font-medium">
    Datos necesarios: Cantidad, Por quién, Causa. Estos datos son esenciales para justificar correctamente la salida y entrada de producto.
  </span>
</div>

<div class="flex flex-wrap gap-6">
  {#each jarreos as jarreo, i (jarreo.id)}
    <div class="min-w-[320px] max-w-[400px] w-full flex-1 p-5 bg-gray-50 border border-blue-200 rounded-lg shadow animate-fade-in">
      <div class="mb-3">
        <label for="descripcion-jarreo" class="block text-sm font-medium text-blue-700 mb-1">Descripción del jarreo</label>
        <textarea
          id="descripcion-jarreo"
          class="h-48 w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 "
          placeholder={`Datos necesarios:\nCantidad\nPor quién\nCausa\nEstos datos son esenciales para justificar correctamente la salida y entrada de producto.`}
          bind:value={jarreo.descripcion}
        ></textarea>
      </div>
      <div class="mb-3">
        <CustomPdfInput
          inputId={`extracciones-${jarreo.id}`}
          label="PDF Extracciones"
          on:pdfConfirmed={e => onPdfConfirm(i, 'pdfExtracciones', e)}
        />
      </div>
      <div class="mb-3">
        <CustomPdfInput
          inputId={`retornos-${jarreo.id}`}
          label="PDF Retornos"
          on:pdfConfirmed={e => onPdfConfirm(i, 'pdfRetornos', e)}
        />
      </div>
      <div class="mb-3">
        <CustomPdfInput
          inputId={`veeder-${jarreo.id}`}
          label="Ticket Veeder Root de Jarreo"
          on:pdfConfirmed={e => onPdfConfirm(i, 'pdfVeeder', e)}
        />
      </div>
      <!-- Aquí irá la tabla tipo form -->
    </div>
  {/each}
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
