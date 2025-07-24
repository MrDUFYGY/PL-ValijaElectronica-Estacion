<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import CustomPdfInput from './CustomPdfInput.svelte';

  // Types
  interface InputState {
    id: string;
    label: string;
    confirmed: boolean;
    file: File | null;
    soloConsulta: boolean;
  }

  interface InputItem {
    id: number;
    label: string;
  }

  // Component props
  export let groupId: string;
  export let title: string;
  export let isSealed = false; // Control sealed state from parent
  
  // State
  const inputs: InputItem[] = [
    { id: 1, label: 'Turno 1' },
    { id: 2, label: 'Turno 2' },
    { id: 3, label: 'Turno 3' }
  ];
  
  const inputStates = new Map<string, InputState>();
  let allConfirmed = false;
  let showSealModal = false;
  const borderColor = 'border-yellow-400';
  
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    sealed: { groupId: string; sealed: boolean };
  }>();

  // Helper to get input state safely
  function getInputState(inputId: string): InputState {
    const existingState = inputStates.get(inputId);
    if (existingState) {
      return existingState;
    }
    
    // Create a new state for this input
    const labelMatch = inputId.match(/turno-(\d+)$/);
    const label = labelMatch ? `Turno ${labelMatch[1]}` : 'Nuevo Turno';
    
    const newState: InputState = {
      id: inputId,
      label,
      confirmed: false,
      file: null,
      soloConsulta: isSealed
    };
    
    inputStates.set(inputId, newState);
    return newState;
  }
  
  // Helper to get input state by index
  function getInputStateByIndex(index: number): InputState {
    const inputId = `${groupId}-turno-${index + 1}`;
    return getInputState(inputId);
  }

  // Check if all inputs are confirmed
  function checkAllConfirmed() {
    allConfirmed = inputs.every((input) => {
      const state = inputStates.get(`${groupId}-turno-${input.id}`);
      return state?.confirmed === true;
    });
  }

  // Handle PDF confirmation
  function handlePdfConfirmed(event: CustomEvent<{ inputId: string; file: File | null }>) {
    const { inputId, file } = event.detail;
    if (!file) return; // Skip if no file was provided
    
    const currentState = getInputState(inputId);
    
    const newState: InputState = {
      ...currentState,
      confirmed: true,
      file,
      soloConsulta: isSealed || currentState.soloConsulta
    };
    
    inputStates.set(inputId, newState);
    checkAllConfirmed();
  }

  // Handle seal confirmation
  function confirmSeal() {
    isSealed = true;
    showSealModal = false;
    
    // Update all inputs to be in soloConsulta mode
    inputs.forEach((input) => {
      const inputId = `${groupId}-turno-${input.id}`;
      const currentState = getInputState(inputId);
      
      inputStates.set(inputId, { 
        ...currentState, 
        soloConsulta: true 
      });
    });
    
    dispatch('sealed', { groupId, sealed: true });
  }

  function cancelSeal() {
    showSealModal = false;
  }

  // Initialize input states
  onMount(() => {
    inputs.forEach((input) => {
      const inputId = `${groupId}-turno-${input.id}`;
      const existingState = inputStates.get(inputId);
      
      const newState: InputState = {
        id: inputId,
        label: input.label,
        confirmed: existingState?.confirmed || false,
        file: existingState?.file || null,
        soloConsulta: isSealed || (existingState?.soloConsulta ?? false)
      };
      
      inputStates.set(inputId, newState);
    });
    
    checkAllConfirmed();
  });

  // Update soloConsulta state when isSealed changes
  $: if (isSealed) {
    inputs.forEach((input) => {
      const inputId = `${groupId}-turno-${input.id}`;
      const currentState = getInputState(inputId);
      
      if (!currentState.soloConsulta) {
        inputStates.set(inputId, { 
          ...currentState,
          soloConsulta: true 
        });
      }
    });
  }

  function handleSeal() {
    showSealModal = true;
  }
</script>

<div class="pdf-input-group p-4 rounded-md mb-6 shadow-md border-2 {isSealed ? borderColor : 'border-gray-200'} transition-colors duration-300">
  <h2 class="text-xl font-semibold mb-4 text-gray-700">{title}</h2>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
    {#each inputs as input, i (input.id)}
      {@const inputState = getInputStateByIndex(i)}
      <CustomPdfInput
        inputId={inputState.id}
        label={inputState.label}
        on:pdfConfirmed={handlePdfConfirmed}
        isConfirmed={inputState.confirmed}
        soloConsulta={inputState.soloConsulta}
        borderColor={borderColor}
      />
    {/each}
  </div>
  
  {#if !isSealed}
    <button 
      class="w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-150 ease-in-out mb-2"
      disabled={!allConfirmed}
      on:click={handleSeal}
    >
      Sellar
    </button>
  {/if}
  
  {#if showSealModal}
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
         on:click|self={cancelSeal}
         on:keydown={(e) => e.key === 'Escape' && cancelSeal()}
         role="dialog"
         tabindex="-1"
         aria-modal="true"
         aria-labelledby="seal-modal-title">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[97vh] flex flex-col">
        <div class="px-6 py-4 border-b flex justify-between items-center">
          <h3 id="seal-modal-title" class="text-lg font-semibold">Confirmar Sellado de Documentos</h3>
          <button
            type="button"
            on:click={cancelSeal}
            class="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {#each inputs as input (input.id)}
            <div class="overflow-hidden h-96">
              <h4 class=" text-center p-2 bg-gray-100 font-medium">{input.label}</h4>
              <iframe
                src="/assets/simulacion.pdf"
                class="w-full h-full"
                title={`Vista previa ${input.label}`}
              ></iframe>
            </div>
          {/each}
        </div>
        
        <div class="px-6 py-4 border-t flex justify-end space-x-3">
          <button
            type="button"
            on:click={cancelSeal}
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="button"
            on:click={confirmSeal}
            class="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded hover:bg-yellow-600"
          >
            Sellar los 3 turnos
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
