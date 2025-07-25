# ButtonMove Component

Un componente reutilizable de Astro para crear botones de navegación/scroll con posicionamiento flexible.

## Características

- ✅ Posicionamiento absoluto opcional (coordenadas del 1 al 100)
- ✅ Scroll automático hacia arriba o abajo
- ✅ Soporte para contenedores específicos o ventana principal
- ✅ Iconos flexibles (texto, Material Icons, SVG)
- ✅ Estilos CSS personalizables
- ✅ Clases de Tailwind CSS
- ✅ Efectos hover y animaciones
- ✅ Responsive design

## Props

| Prop | Tipo | Requerido | Default | Descripción |
|------|------|-----------|---------|-------------|
| `position` | `{x: number, y: number}` | No | `undefined` | Posición absoluta en porcentajes (1-100) |
| `styles` | `string` | No | `''` | Estilos CSS personalizados |
| `clases` | `string` | No | `''` | Clases CSS adicionales (ej: Tailwind) |
| `id` | `string` | No | `undefined` | ID del elemento al que afectar el scroll |
| `icono` | `string` | No | `'▲'` | Icono a mostrar (texto, Material Icons, SVG) |
| `direction` | `'up' \| 'down'` | No | `'up'` | Dirección del scroll |

## Ejemplos de uso

### 1. Botón básico (sin posición absoluta)
```astro
<ButtonMove 
  icono="▲"
  clases="p-2 m-2"
/>
```

### 2. Botón con posición fija
```astro
<ButtonMove 
  position={{x: 90, y: 85}}
  icono="▲"
  clases="shadow-lg"
/>
```

### 3. Botón para contenedor específico
```astro
<ButtonMove 
  id="table-container"
  icono="▲"
  clases="mt-2"
/>
```

### 4. Botón con Material Icons
```astro
<ButtonMove 
  icono="material-icons:keyboard_arrow_up"
  styles="background: #28a745;"
/>
```

### 5. Botón con SVG personalizado
```astro
<ButtonMove 
  icono='<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>'
  styles="background: #dc3545;"
/>
```

### 6. Botón para bajar
```astro
<ButtonMove 
  icono="▼"
  direction="down"
  styles="background: #6f42c1;"
/>
```

## Lógica de funcionamiento

### Posicionamiento
- **Con `position`**: El botón se posiciona de forma absoluta usando las coordenadas proporcionadas
- **Sin `position`**: El botón respeta el flujo normal del contenedor padre

### Target del scroll
- **Con `id`**: Hace scroll en el elemento con ese ID específico
- **Sin `id`**: Hace scroll en la ventana principal (`window`)

### Tipos de iconos soportados

1. **Texto simple**: `"▲"`, `"▼"`, `"↑"`, `"↓"`
2. **Material Icons**: `"material-icons:keyboard_arrow_up"`
3. **SVG inline**: `'<svg>...</svg>'`

## Estilos por defecto

El componente incluye estilos base que crean un botón circular con:
- Tamaño: 50px x 50px
- Color de fondo: #007bff
- Sombra y efectos hover
- Transiciones suaves
- Z-index alto para estar siempre visible

## Personalización

Puedes sobrescribir cualquier estilo usando la prop `styles`:

```astro
<ButtonMove 
  styles="background: red; width: 60px; height: 60px; border-radius: 10px;"
/>
```

## Dependencias

- Material Icons (si usas iconos de Material): Ya incluido en `LayoutMenu.astro`
- Tailwind CSS (opcional, para las clases)
