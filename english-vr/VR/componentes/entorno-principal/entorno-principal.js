// Funcionalidad del entorno VR principal
document.addEventListener('DOMContentLoaded', function() {
    console.log('Entorno VR principal cargado');
    
    // Esperar a que A-Frame esté listo
    document.querySelector('a-scene').addEventListener('loaded', function() {
        console.log('Escena A-Frame cargada');
        
        // Elementos interactivos
        const inicioBtn = document.getElementById('inicio-btn');
        const karaokeBtn = document.getElementById('karaoke-btn');
        const listaBtn = document.getElementById('lista-btn');
        const colorBox = document.getElementById('colorBox');
        
        // Navegación con los botones
        if (inicioBtn) {
            inicioBtn.addEventListener('click', function() {
                console.log('Navegando a inicio 2D');
                // En VR, podrías abrir un portal o cambiar la escena
                showPortal('../../2D/index.html');
            });
        }
        
        if (karaokeBtn) {
            karaokeBtn.addEventListener('click', function() {
                console.log('Navegando a karaoke VR');
                window.location.href = '../views/karaoke-vr.html';
            });
        }
        
        if (listaBtn) {
            listaBtn.addEventListener('click', function() {
                console.log('Navegando a lista de canciones VR');
                window.location.href = '../views/canciones-vr.html';
            });
        }
        
        // Interacción con el cubo
        if (colorBox) {
            colorBox.addEventListener('click', function() {
                console.log('Cubo clickeado');
                // Cambiar color aleatorio
                const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                this.setAttribute('color', randomColor);
                
                // Efecto de escala
                this.setAttribute('animation', 
                    'property: scale; to: 1.2 1.2 1.2; dur: 200; direction: alternate; loop: 2');
            });
        }
        
        // Función para mostrar portales de navegación
        function showPortal(url) {
            // Crear un portal visual
            const portal = document.createElement('a-entity');
            portal.setAttribute('geometry', 'primitive: ring; radiusInner: 0.5; radiusOuter: 1');
            portal.setAttribute('material', 'color: #00aaff; opacity: 0.7; side: double');
            portal.setAttribute('position', '0 2 -2');
            portal.setAttribute('animation', 'property: rotation; to: 0 0 360; loop: true; dur: 3000');
            
            // Agregar texto explicativo
            const text = document.createElement('a-text');
            text.setAttribute('value', 'Portal a 2D\nClick para entrar');
            text.setAttribute('position', '0 -1.5 0');
            text.setAttribute('align', 'center');
            text.setAttribute('color', '#ffffff');
            portal.appendChild(text);
            
            // Hacer clickeable
            portal.classList.add('clickable');
            portal.addEventListener('click', function() {
                window.open(url, '_blank');
            });
            
            document.querySelector('a-scene').appendChild(portal);
            
            // Remover portal después de 5 segundos
            setTimeout(() => {
                portal.remove();
            }, 5000);
        }
        
        // Efectos de sonido (opcional)
        function playClickSound() {
            // Aquí podrías agregar efectos de sonido
            console.log('*Click sound*');
        }
        
        // Agregar sonidos a todos los elementos clickeables
        document.querySelectorAll('.clickable').forEach(element => {
            element.addEventListener('click', playClickSound);
        });
        
        // Información de controles
        console.log('Controles VR:');
        console.log('- Mouse: Click para interactuar');
        console.log('- VR: Apunta y aprieta el gatillo');
        console.log('- Teclado: WASD para mover, mouse para mirar');
    });
    
    // Manejo del selector de color (si existe)
    const colorPicker = document.getElementById('colorPicker');
    if (colorPicker) {
        colorPicker.addEventListener('input', function(event) {
            const colorBox = document.getElementById('colorBox');
            if (colorBox) {
                colorBox.setAttribute('color', event.target.value);
            }
        });
    }
});
