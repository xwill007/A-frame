// Funcionalidad de la lista de canciones
document.addEventListener('DOMContentLoaded', function() {
    console.log('Lista de canciones cargada');
    
    // Agregar efectos de sonido o animaciones si es necesario
    const canciones = document.querySelectorAll('.cancion');
    
    canciones.forEach(cancion => {
        cancion.addEventListener('click', function(e) {
            // Si no se hizo clic en el botón, redirigir al karaoke
            if (!e.target.classList.contains('boton')) {
                const boton = this.querySelector('.boton');
                if (boton) {
                    window.location.href = boton.href;
                }
            }
        });
    });
    
    // Agregar efecto de hover con cursor pointer
    canciones.forEach(cancion => {
        cancion.style.cursor = 'pointer';
    });
});
