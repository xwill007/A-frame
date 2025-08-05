# Componentes

Esta carpeta contiene todos los componentes reutilizables de la aplicación "Aprende inglés con canciones".

## Estructura

```
componentes/
├── formulario-registro/
│   ├── formulario-registro.html    # HTML del componente
│   ├── formulario-registro.css     # Estilos del componente
│   └── formulario-registro.js      # Funcionalidad del componente
├── lista-canciones/
│   ├── lista-canciones.html        # HTML del componente
│   ├── lista-canciones.css         # Estilos del componente
│   └── lista-canciones.js          # Funcionalidad del componente
├── karaoke/
│   ├── karaoke.html                # HTML del componente
│   ├── karaoke.css                 # Estilos del componente
│   └── karaoke.js                  # Funcionalidad del componente
└── README.md                       # Este archivo
```

## Cómo usar los componentes

### Formulario de Registro
Para usar el formulario de registro en cualquier página:

```html
<iframe src="componentes/formulario-registro/formulario-registro.html" 
        frameborder="0" 
        width="500px" 
        height="450px"
        style="border-radius: 15px; overflow: auto;">
</iframe>
```

### Lista de Canciones
Para usar la lista de canciones:

```html
<iframe src="componentes/lista-canciones/lista-canciones.html" 
        frameborder="0" 
        width="100%" 
        height="600px"
        style="border-radius: 15px; overflow: auto;">
</iframe>
```

### Karaoke
Para usar el karaoke:

```html
<iframe src="componentes/karaoke/karaoke.html" 
        frameborder="0" 
        width="100%" 
        height="700px"
        style="border-radius: 15px; overflow: auto;">
</iframe>
```

## Convenciones

- Cada componente debe estar en su propia carpeta
- Los archivos deben tener el mismo nombre que la carpeta
- Cada componente debe ser autocontenido (HTML, CSS, JS en la misma carpeta)
- Usar nombres descriptivos en kebab-case (palabras-separadas-por-guiones)

## Componentes disponibles

1. **formulario-registro**: Formulario de registro de usuarios con validaciones
2. **lista-canciones**: Lista interactiva de canciones disponibles para practicar
3. **karaoke**: Reproductor de karaoke con letras sincronizadas en inglés y español

## Características de cada componente

### Formulario de Registro
- Validación de campos en tiempo real
- Confirmación de contraseña
- Selector de nivel de inglés
- Diseño responsive

### Lista de Canciones
- Cards interactivas con efecto hover
- Navegación intuitiva
- Información descriptiva de cada canción
- Enlaces directos al karaoke

### Karaoke
- Reproductor de audio integrado
- Letras bilingües (inglés/español)
- Sincronización automática
- Resaltado de línea actual
- Navegación con teclado (flechas arriba/abajo)
- Click en líneas para saltar
