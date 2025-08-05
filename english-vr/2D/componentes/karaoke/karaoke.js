// Funcionalidad del karaoke
document.addEventListener('DOMContentLoaded', function() {
    const audio = document.getElementById('audio');
    const lineas = document.querySelectorAll('.linea');
    let lineaActual = 0;
    
    console.log('Karaoke cargado');
    
    // Función para resaltar la línea actual
    function resaltarLinea(indice) {
        // Remover clase active de todas las líneas
        lineas.forEach(linea => linea.classList.remove('active'));
        
        // Agregar clase active a la línea actual
        if (lineas[indice]) {
            lineas[indice].classList.add('active');
            // Scroll suave hacia la línea actual
            lineas[indice].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }
    
    // Eventos del reproductor de audio
    if (audio) {
        audio.addEventListener('play', function() {
            console.log('Reproducción iniciada');
            iniciarKaraoke();
        });
        
        audio.addEventListener('pause', function() {
            console.log('Reproducción pausada');
        });
        
        audio.addEventListener('ended', function() {
            console.log('Canción terminada');
            // Remover todas las clases active
            lineas.forEach(linea => linea.classList.remove('active'));
            lineaActual = 0;
        });
    }
    
    // Función para iniciar el karaoke sincronizado
    function iniciarKaraoke() {
        // Simular sincronización (en una aplicación real, tendrías timestamps)
        const intervalos = [0, 4000, 8000, 12000, 16000, 20000]; // Milisegundos
        
        intervalos.forEach((tiempo, indice) => {
            setTimeout(() => {
                if (!audio.paused) {
                    resaltarLinea(indice);
                    lineaActual = indice;
                }
            }, tiempo);
        });
    }
    
    // Click en las líneas para saltar a esa parte (funcionalidad adicional)
    lineas.forEach((linea, indice) => {
        linea.addEventListener('click', function() {
            resaltarLinea(indice);
            lineaActual = indice;
            
            // En una aplicación real, aquí saltarías a la posición correspondiente del audio
            console.log(`Saltando a la línea ${indice + 1}`);
        });
        
        // Agregar cursor pointer
        linea.style.cursor = 'pointer';
    });
    
    // Función para avanzar manualmente (opcional)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' && lineaActual < lineas.length - 1) {
            lineaActual++;
            resaltarLinea(lineaActual);
        } else if (e.key === 'ArrowUp' && lineaActual > 0) {
            lineaActual--;
            resaltarLinea(lineaActual);
        }
    });
});
