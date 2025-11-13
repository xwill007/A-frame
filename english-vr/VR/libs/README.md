# Librería A-Frame local

Este directorio está pensado para contener la copia local de A-Frame (`aframe.min.js`) para que la escena funcione sin depender de conexión a Internet.

Ruta objetivo (relativa al proyecto): `VR/libs/aframe.min.js`

### Comando PowerShell (Windows)
Ejecuta esto desde PowerShell en la carpeta `english-vr/VR` o ajusta la ruta absoluta si prefieres:

# Si estás en `c:\xampp\htdocs\A-frame\english-vr\VR`
Invoke-WebRequest -Uri "https://aframe.io/releases/1.4.0/aframe.min.js" -OutFile "libs\aframe.min.js"

# Alternativa usando curl (PowerShell también soporta curl alias en algunas versiones):
curl -L -o .\libs\aframe.min.js https://aframe.io/releases/1.4.0/aframe.min.js

### Comando con ruta absoluta (si ejecutas desde cualquier carpeta) (elegido)
Invoke-WebRequest -Uri "https://aframe.io/releases/1.4.0/aframe.min.js" -OutFile "C:\xampp\htdocs\A-frame\english-vr\VR\libs\aframe.min.js"

### Verificación
1. Abre `VR/index.html` en un navegador (local o mediante tu servidor XAMPP).
2. Abre la consola del navegador (F12) y comprueba que no hay errores de carga relacionados con `aframe.min.js`.
3. Verifica que la red (Network) muestra que `libs/aframe.min.js` se cargó correctamente (200 OK).

### Notas y fallback
- Si en algún momento no quieres depender del archivo local, puedes revertir el `script` a la URL CDN original.
- Mantén la versión en la URL de descarga (aquí 1.4.0). Si actualizas A-Frame, descarga la nueva versión y actualiza comentarios/README si es necesario.
