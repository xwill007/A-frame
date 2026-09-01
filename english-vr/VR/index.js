// Script principal para la escena VR

// Movimiento de la cámara solo con flechas (WASD queda libre para escribir en formularios
// como el del componente new-song, en vez de mover la escena mientras se tipea).
AFRAME.registerComponent('arrow-controls', {
    schema: {
        acceleration: { type: 'number', default: 15 },
        enabled: { type: 'boolean', default: true }
    },
    init: function () {
        this.keys = {};
        this._onKeyDown = (evt) => { this.keys[evt.code] = true; };
        this._onKeyUp = (evt) => { this.keys[evt.code] = false; };
        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    },
    remove: function () {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    },
    tick: function (time, delta) {
        if (!this.data.enabled || !delta) return;

        const keys = this.keys;
        const forward = (keys.ArrowUp ? 1 : 0) - (keys.ArrowDown ? 1 : 0);
        const strafe = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0);
        if (!forward && !strafe) return;

        const THREE = AFRAME.THREE;
        const distance = this.data.acceleration * (delta / 1000);
        const yaw = this.el.object3D.rotation.y;

        const dir = new THREE.Vector3(strafe, 0, -forward);
        dir.normalize();
        dir.multiplyScalar(distance);
        dir.applyEuler(new THREE.Euler(0, yaw, 0, 'YXZ'));

        const pos = this.el.getAttribute('position');
        this.el.setAttribute('position', {
            x: pos.x + dir.x,
            y: pos.y,
            z: pos.z + dir.z
        });
    }
});

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
