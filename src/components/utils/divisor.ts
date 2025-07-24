interface DividerOptions {
    resizerId: string;
    leftPanelId: string;
    containerId: string;
    minWidth?: number;
    maxWidth?: number;
    storageKey?: string;
  }
  
  export function initializeDivider(options: DividerOptions): void {
    const {
      resizerId,
      leftPanelId,
      containerId,
      minWidth = 20,
      maxWidth = 80,
      storageKey = `divider-${leftPanelId}`
    } = options;
  
    const resizer = document.getElementById(resizerId) as HTMLElement | null;
    const leftPanel = document.getElementById(leftPanelId) as HTMLElement | null;
    const container = document.getElementById(containerId) as HTMLElement | null;
    
    if (!resizer || !leftPanel || !container) {
      console.error('No se pudieron encontrar todos los elementos necesarios para el divisor');
      return;
    }
  
    // Cargar el ancho guardado o usar 50% por defecto
    const savedWidth = localStorage.getItem(storageKey);
    if (savedWidth && leftPanel && container) {
      leftPanel.style.width = `${savedWidth}%`;
      container.style.setProperty('--divider-pos', `${savedWidth}%`);
    }
  
    let isResizing = false;
    let lastDownX = 0;
    let leftPanelWidth = 0;
  
    // Función para manejar el redimensionamiento
    const handleMouseMove = (e: MouseEvent) => {
      if (!leftPanel || !container) return;
      
      // Calcular el nuevo ancho basado en la posición del mouse
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Aplicar límites de ancho
      const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);
      
      // Aplicar el nuevo ancho
      leftPanel.style.width = `${clampedWidth}%`;
      container.style.setProperty('--divider-pos', `${clampedWidth}%`);
      
      // Guardar el ancho actualizado
      localStorage.setItem(storageKey, clampedWidth.toString());
    };
  
    // Función para detener el redimensionamiento
    const stopResizing = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
      if (leftPanel) leftPanel.classList.remove('no-transition');
      if (container) container.classList.remove('resizing');
      document.body.style.userSelect = '';
    };
  
    const startResize = (e: MouseEvent) => {
      e.preventDefault();
      if (!leftPanel || !container) return;
      
      // Configurar eventos
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopResizing);
      
      // Estilos iniciales
      document.body.style.userSelect = 'none';
      leftPanel.classList.add('no-transition');
      container.classList.add('resizing');
    };
  
    const handleResize = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const containerRect = container.getBoundingClientRect();
      const dx = e.clientX - lastDownX;
      let newLeftWidth = ((leftPanelWidth + dx) * 100) / containerRect.width;
      
      newLeftWidth = Math.max(minWidth, Math.min(maxWidth, newLeftWidth));
      
      leftPanel.style.width = `${newLeftWidth}%`;
      
      // Forzar repintado para mejor rendimiento
      leftPanel.style.display = 'block';
      void leftPanel.offsetHeight;
    };
  
    const stopResize = () => {
      if (leftPanel) leftPanel.classList.remove('no-transition');
      if (container) container.classList.remove('resizing');
      document.body.style.userSelect = '';
    };
  
    // Agregar estilos si no existen
    if (!document.getElementById('divider-styles')) {
      const style = document.createElement('style');
      style.id = 'divider-styles';
      style.textContent = `
        .no-transition {
          transition: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  
    // Inicializar el redimensionamiento
    resizer.addEventListener('mousedown', startResize);
    window.addEventListener('blur', stopResize);
  
    // No retornamos la función de limpieza, ya que TypeScript espera void
  }
  