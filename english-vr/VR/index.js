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

// Mostrar controles disponibles en consola
function showControls() {
    console.log('Controles VR:');
    console.log('- Click/VR: Interactuar con elementos');
}

// Inicialización principal
function initializeVRScene() {
    console.log('Escena VR cargada - Controles disponibles');

    // Inicializar todos los componentes
    initColorPicker();
    showControls();
}

// Event listeners principales
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('a-scene').addEventListener('loaded', function() {
        initializeVRScene();
    });
});
