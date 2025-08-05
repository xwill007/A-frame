# Views

Esta carpeta contiene las vistas principales de la aplicación "Aprende inglés con canciones".

Las vistas son páginas completas que utilizan los componentes para crear interfaces de usuario completas.

## Estructura

```
views/
├── canciones.html          # Vista de lista de canciones
├── karaoke.html           # Vista del karaoke
└── README.md              # Este archivo
```

## Diferencia entre Views y Componentes

### Views (Vistas)
- **Propósito**: Páginas completas de la aplicación
- **Contenido**: Wrappers que cargan componentes completos
- **Navegación**: URLs principales para el usuario final
- **Ejemplo**: `views/canciones.html` → Página completa de lista de canciones

### Components (Componentes)
- **Propósito**: Elementos reutilizables y modulares
- **Contenido**: Funcionalidad específica autocontenida
- **Navegación**: Cargados por las vistas o otros componentes
- **Ejemplo**: `componentes/lista-canciones/` → Lógica y UI del listado

## Vistas disponibles

### canciones.html
- **Descripción**: Vista principal para seleccionar canciones
- **Componente usado**: `componentes/lista-canciones/`
- **Acceso desde**: Botón "Ver canciones" en la página principal

### karaoke.html  
- **Descripción**: Vista del reproductor de karaoke educativo
- **Componente usado**: `componentes/karaoke/`
- **Acceso desde**: Botones "Practicar" en la lista de canciones

## Navegación

```
index.html
    ↓
views/canciones.html (usa componentes/lista-canciones/)
    ↓
views/karaoke.html (usa componentes/karaoke/)
    ↓
views/canciones.html (vuelta)
    ↓
index.html (vuelta al inicio)
```
