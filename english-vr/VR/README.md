# English Learning VR - Arquitectura de Componentes

## Estructura del Proyecto VR

Este proyecto VR utiliza la misma arquitectura de componentes que la versión 2D, organizando el código en **vistas** y **componentes** para mantener consistencia y reutilización.

### Estructura de Directorios

```
VR/
├── index.html                  # Punto de entrada principal
├── views/                      # Contenedores de página (wrappers)
│   ├── entorno-principal.html  # Vista del entorno principal VR
│   ├── canciones-vr.html      # Vista de lista de canciones VR
│   └── karaoke-vr.html        # Vista de karaoke VR
├── componentes/               # Componentes reutilizables
│   ├── entorno-principal/     # Componente del entorno principal
│   │   ├── entorno-principal.html
│   │   ├── entorno-principal.css
│   │   └── entorno-principal.js
│   ├── canciones-vr/          # Componente de lista de canciones
│   │   ├── canciones-vr.html
│   │   ├── canciones-vr.css
│   │   └── canciones-vr.js
│   └── karaoke-vr/           # Componente de karaoke VR
│       ├── karaoke-vr.html
│       ├── karaoke-vr.css
│       └── karaoke-vr.js
└── imagenes/                 # Recursos de imagen
    ├── cielo.jpg
    ├── pasto.jpg
    ├── inicio.png
    ├── karaoke.png
    └── lista.png
```

## Componentes VR

### 1. Entorno Principal (`entorno-principal`)
- **Propósito**: Escena principal VR con navegación
- **Tecnología**: A-Frame 1.4.0
- **Características**:
  - Entorno 3D con cielo, terreno y vegetación
  - Modelos 3D interactivos (casco, zorro)
  - Navegación clickeable a otros componentes
  - Controles VR y de teclado
  - Efectos de iluminación ambiente

### 2. Lista de Canciones VR (`canciones-vr`)
- **Propósito**: Selección interactiva de canciones en 3D
- **Características**:
  - Tarjetas de canciones flotantes en círculo
  - Efectos de partículas y animaciones
  - Información de dificultad y artista
  - Botones de práctica individual
  - Efectos de hover y selección
  - Navegación con teclado (1,2,3)

### 3. Karaoke VR (`karaoke-vr`)
- **Propósito**: Experiencia de karaoke inmersiva
- **Características**:
  - Letras flotantes en 3D
  - Efectos de disco y luces coloridas
  - Controles de reproducción 3D
  - Iluminación dinámica
  - Retroalimentación visual de progreso

## Navegación

### Flujo de Navegación
```
index.html (Principal VR)
    ├── views/entorno-principal.html → componentes/entorno-principal/
    ├── views/canciones-vr.html → componentes/canciones-vr/
    ├── views/karaoke-vr.html → componentes/karaoke-vr/
    └── ../2D/index.html (Cambio a versión 2D)
```

### Controles

#### VR/Ratón
- **Click**: Interactuar con elementos
- **Hover**: Efectos visuales y información
- **VR Controllers**: Soporte completo para controles VR

#### Teclado
- **1**: Ir al entorno 2D
- **2**: Ir al karaoke VR  
- **3**: Ir a lista de canciones VR
- **ESC**: Volver (donde aplique)
- **1,2,3**: Seleccionar canciones (en lista)

## Tecnologías Utilizadas

- **A-Frame 1.4.0**: Framework VR para WebXR
- **HTML5/CSS3**: Estructura y estilos
- **JavaScript**: Lógica interactiva y navegación
- **WebGL**: Renderizado 3D
- **WebXR**: Compatibilidad VR

## Características Técnicas

### Optimizaciones VR
- Renderizado eficiente con A-Frame
- Geometrías optimizadas para VR
- Sistema de LOD (Level of Detail)
- Iluminación balanceada para rendimiento

### Interactividad
- Sistema de raycast para selección
- Animaciones suaves con easing
- Efectos de retroalimentación inmediata
- Soporte multi-dispositivo (VR, desktop, móvil)

### Arquitectura de Componentes
- Separación clara entre vistas y lógica
- Componentes reutilizables y modulares
- Navegación iframe para encapsulación
- Consistencia con arquitectura 2D

## Instrucciones de Uso

1. **Inicio**: Abrir `VR/index.html` en navegador compatible
2. **Navegación**: Usar click/VR o teclado para navegar
3. **VR**: Usar casco compatible para experiencia inmersiva
4. **Desktop**: Usar WASD + ratón para moverse en 3D

## Compatibilidad

- **Navegadores**: Chrome, Firefox, Edge, Safari
- **VR**: Oculus, HTC Vive, Windows Mixed Reality
- **Desktop**: Todos los sistemas operativos
- **Móvil**: Compatible con cardboard y navegadores móviles

## Desarrollo

Para añadir nuevos componentes VR:

1. Crear carpeta en `componentes/`
2. Incluir HTML, CSS y JS del componente
3. Crear vista wrapper en `views/`
4. Actualizar navegación en componentes relevantes

Esta arquitectura mantiene la consistencia con la versión 2D mientras aprovecha las capacidades únicas de la realidad virtual.