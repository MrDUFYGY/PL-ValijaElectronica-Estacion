<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  export let inputId: string;
  export let label: string;
  export let isConfirmed = false;
  export let borderColor = 'border-green-500'; // Default to green, can be overridden
  export let soloConsulta = false; // When true, disables file upload
  
  // Internal state for the confirmation status
  $: isConfirmedInternal = isConfirmed;

  const dispatch = createEventDispatcher<{
    pdfConfirmed: { inputId: string; file: File | null };
  }>();

  let dropArea: HTMLDivElement;
  let fileInput: HTMLInputElement;
  let isModalOpen = false;
  let uploadedFile: File | null = null;
  let pdfUrl: string | null = null; // For creating object URL of the uploaded PDF
  let showBlockIcon = false;

  function openModal() {
    if (soloConsulta) {
      // In view-only mode, open the modal with the existing PDF or default one
      if (!pdfUrl) {
        // If no PDF is uploaded, use the default one
        pdfUrl = '/assets/simulacion.pdf';
      }
      isModalOpen = true;
      document.body.style.overflow = 'hidden';
    } else if (fileInput?.files?.[0]) {
      // In edit mode, create a new URL for the selected file
      if (pdfUrl && !pdfUrl.startsWith('/assets/')) {
        URL.revokeObjectURL(pdfUrl);
      }
      pdfUrl = URL.createObjectURL(fileInput.files[0]);
      isModalOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    isModalOpen = false;
    document.body.style.overflow = 'auto';
    
    // Only reset if not in soloConsulta mode and not confirmed
    if (!soloConsulta && !isConfirmedInternal) {
      if (fileInput) {
        fileInput.value = '';
      }
      if (pdfUrl && !pdfUrl.startsWith('/assets/')) {
        URL.revokeObjectURL(pdfUrl);
        pdfUrl = null;
      }
    }
  }
  
  function handleCancel() {
    closeModal();
  }

  function openPdfViewer() {
    if (pdfUrl) {
      isModalOpen = true;
      document.body.style.overflow = 'hidden';
    }
  }

  function confirmSelection() {
    const file = fileInput?.files?.[0] || null;
    if (file) {
      // If there was a previous URL, clean it up if it's not the default PDF
      if (pdfUrl && !pdfUrl.startsWith('/assets/')) {
        URL.revokeObjectURL(pdfUrl);
      }
      // Create a new URL for the confirmed file
      pdfUrl = file ? URL.createObjectURL(file) : '/assets/simulacion.pdf';
      uploadedFile = file;
      isConfirmedInternal = true;
      dispatch('pdfConfirmed', { inputId, file });
      closeModal();
    } else if (soloConsulta) {
      // In soloConsulta mode, use the default PDF if no file is selected
      pdfUrl = '/assets/simulacion.pdf';
      isConfirmedInternal = true;
      closeModal();
    }
  }

  function handleReplaceClick() {
    // Trigger file input click to select a new file
    if (!soloConsulta) {
      fileInput?.click();
    }
  }

  function handleFileChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      const file = files[0];
      uploadedFile = file;
      pdfUrl = URL.createObjectURL(file);
      isConfirmedInternal = false;
      if (!soloConsulta) {
        openModal();
      }
    }
  }

  // Clean up object URLs when component is destroyed
  onDestroy(() => {
    if (pdfUrl && !pdfUrl.startsWith('/assets/')) {
      URL.revokeObjectURL(pdfUrl);
    }
  });

  function handleDrop(e: DragEvent) {
    if (soloConsulta) return;
    
    e.preventDefault();
    dropArea.classList.remove('border-blue-500', 'bg-blue-50');
    if (e.dataTransfer?.files?.length) {
      fileInput.files = e.dataTransfer.files;
      const event = { target: { files: e.dataTransfer.files } } as unknown as Event;
      handleFileChange(event);
    }
  }

  function handleDragOver(e: DragEvent) {
    if (soloConsulta) return;
    e.preventDefault();
    dropArea.classList.add('border-blue-500', 'bg-blue-50');
  }

  function handleDragLeave() {
    if (soloConsulta) return;
    dropArea.classList.remove('border-blue-500', 'bg-blue-50');
  }

  onMount(() => {
    const handleDragOverFn = (e: DragEvent) => handleDragOver(e);
    const handleDragLeaveFn = handleDragLeave;
    const handleDropFn = (e: DragEvent) => handleDrop(e);

    dropArea.addEventListener('dragover', handleDragOverFn);
    dropArea.addEventListener('dragleave', handleDragLeaveFn);
    dropArea.addEventListener('drop', handleDropFn);
    dropArea.addEventListener('click', () => {
      if (!soloConsulta) fileInput?.click();
    });
    
    // Cleanup function
    return () => {
      dropArea.removeEventListener('dragover', handleDragOverFn);
      dropArea.removeEventListener('dragleave', handleDragLeaveFn);
      dropArea.removeEventListener('drop', handleDropFn);
      dropArea.removeEventListener('click', () => fileInput?.click());
    };


  });
</script>

<div class="w-full relative max-h-[180px]">
  <div class="flex justify-between items-center mb-2">
    <label for={inputId} class="block text-sm font-medium text-gray-700">
      {label}
    </label>
    {#if soloConsulta && pdfUrl}
      <button
        on:click={openModal}
        class="text-blue-600 hover:text-blue-800 text-sm flex items-center"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        <span class="ml-1">Ver documento</span>
      </button>
    {/if}
  </div>
  
  <div
    bind:this={dropArea}
    role="button"
    aria-label="Seleccionar archivo PDF"
    tabindex={soloConsulta ? -1 : 0}
    class="rounded-lg p-1 text-center transition-colors border-2 border-dashed bg-cyan-50
      {isConfirmedInternal ? borderColor : 'border-gray-300'}
      {soloConsulta 
        ? 'bg-gray-50 cursor-not-allowed' 
        : 'bg-white hover:bg-blue-50 cursor-pointer'}
      relative"
    class:opacity-50={soloConsulta}
    on:mouseenter={() => soloConsulta && (showBlockIcon = true)}
    on:mouseleave={() => showBlockIcon = false}
  >
    {#if showBlockIcon && soloConsulta}
      <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
    {/if}
    {#if !isConfirmedInternal}
    <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 576 512"><path fill="#2d2d2d" d="M208 48H96c-8.8 0-16 7.2-16 16v384c0 8.8 7.2 16 16 16h80v48H96c-35.3 0-64-28.7-64-64V64C32 28.7 60.7 0 96 0h133.5c17 0 33.3 6.7 45.3 18.7l122.5 122.6c12 12 18.7 28.3 18.7 45.3v149.5h-48v-128h-88c-39.8 0-72-32.2-72-72v-88zm140.1 112L256 67.9V136c0 13.3 10.7 24 24 24zM240 380h32c33.1 0 60 26.9 60 60s-26.9 60-60 60h-12v28c0 11-9 20-20 20s-20-9-20-20V400c0-11 9-20 20-20m32 80c11 0 20-9 20-20s-9-20-20-20h-12v40zm96-80h32c28.7 0 52 23.3 52 52v64c0 28.7-23.3 52-52 52h-32c-11 0-20-9-20-20V400c0-11 9-20 20-20m32 128c6.6 0 12-5.4 12-12v-64c0-6.6-5.4-12-12-12h-12v88zm76-108c0-11 9-20 20-20h48c11 0 20 9 20 20s-9 20-20 20h-28v24h28c11 0 20 9 20 20s-9 20-20 20h-28v44c0 11-9 20-20 20s-20-9-20-20z"/></svg>      
      <p class="mt-2 text-gray-700">
        Arrastra y suelta un archivo PDF o haz clic para seleccionar
      </p>
    {:else}
      <div class="flex flex-col items-center">
        <svg class="h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="mt-2 text-gray-700">Documento cargado</p>
        <p class="text-sm text-gray-500">{uploadedFile?.name}</p>
        <button
          on:click|stopPropagation={openPdfViewer}
          class="mt-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
          type="button"
        >
          Ver documento
        </button>
      </div>
    {/if}
    <input
      bind:this={fileInput}
      type="file"
      accept=".pdf"
      class="hidden"
      id={inputId}
      on:change={handleFileChange}
      disabled={soloConsulta}
    />
  </div>

  {#if isModalOpen}
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      on:click|self={closeModal}
      tabindex="-1"
      on:keydown={(e) => e.key === 'Escape' && closeModal()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div class="bg-white  shadow-xl w-full h-[100vh] flex flex-col">
        <div class="px-6 py-4 border-b flex justify-between items-center">
          <h3 id="modal-title" class="text-lg font-semibold">Vista previa del documento</h3>
          <button
            type="button"
            on:click={closeModal}
            class="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="flex-1 overflow-auto p-1 h-full">
          {#if pdfUrl}
            <iframe
              src={pdfUrl}
              class="w-full h-full min-h-[60vh] border rounded"
              title="Vista previa del documento"
            ></iframe>
          {:else}
            <div class="flex items-center justify-center h-64 text-gray-500">
              No hay documento para mostrar
            </div>
          {/if}
        </div>
        
        <div class="px-6 py-4 border-t flex justify-end space-x-3">
          <button
            type="button"
            on:click={handleCancel}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            {soloConsulta && isConfirmedInternal ? 'Cerrar' : 'Cancelar'}
          </button>
          {#if !soloConsulta || !isConfirmedInternal}
            <button
              type="button"
              on:click={handleReplaceClick}
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={soloConsulta}
            >
              Reemplazar
            </button>
            <button
              type="button"
              on:click={confirmSelection}
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={soloConsulta || !fileInput?.files?.[0]}
            >
              Confirmar
            </button>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>
