// Script principal para la escena VR
// Manejo de selector de color para el cubo
function initColorPicker() {
    const picker = document.getElementById('colorPicker');
    const box = document.getElementById('colorBox');
    
    if (picker && box) {
        picker.addEventListener('input', event => {
            box.setAttribute('color', event.target.value);
        });
    }
}

// Configuración de navegación VR
function initVRNavigation() {
    // Navegación con componentes e imágenes
    const karaokeImg = document.querySelector('a-image[src="imagenes/karaoke.png"]');
    const listaImg = document.querySelector('a-image[src="imagenes/lista.png"]');
    
    // Navegación al karaoke VR
    if (karaokeImg) {
        karaokeImg.addEventListener('click', function() {
            console.log('Navegando al karaoke VR');
            window.location.href = 'views/karaoke-vr.html';
        });
    }
    
    // Navegación a lista de canciones VR
    if (listaImg) {
        listaImg.addEventListener('click', function() {
            console.log('Navegando a lista de canciones VR');
            window.location.href = 'views/canciones-vr.html';
        });
    }
}

// Configuración de controles de teclado
function initKeyboardControls() {
    document.addEventListener('keydown', function(e) {
        const registroComponent = document.getElementById('registro-vr-component');
        
        switch(e.key) {
            case '1':
                // El componente maneja todo internamente
                if (registroComponent) {
                    const formComponent = registroComponent.components['formulario-registro-vr'];
                    if (formComponent) {
                        formComponent.toggleForm();
                    }
                }
                break;
            case '2':
                const karaokeImg = document.querySelector('a-image[src="imagenes/karaoke.png"]');
                if (karaokeImg) karaokeImg.click();
                break;
            case '3':
                const listaImg = document.querySelector('a-image[src="imagenes/lista.png"]');
                if (listaImg) listaImg.click();
                break;
            case 'Escape':
                if (registroComponent) {
                    const formComponent = registroComponent.components['formulario-registro-vr'];
                    if (formComponent) {
                        formComponent.hideForm();
                    }
                }
                break;
        }
    });
}

// Mostrar controles disponibles en consola
function showControls() {
    console.log('Controles VR:');
    console.log('- 1: Mostrar/ocultar formulario de registro VR');
    console.log('- 2: Ir al karaoke VR');
    console.log('- 3: Ir a lista de canciones VR');
    console.log('- ESC: Cerrar formulario');
    console.log('- Click/VR: Interactuar con elementos');
}

// Inicialización principal
function initializeVRScene() {
    console.log('Escena VR cargada - Controles disponibles');
    
    // Inicializar todos los componentes
    initColorPicker();
    initVRNavigation();
    initKeyboardControls();
    showControls();
}

// Event listeners principales
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('a-scene').addEventListener('loaded', function() {
        initializeVRScene();
    });
});
