// Componente A-Frame para formulario de login VR
AFRAME.registerComponent('formulario-login-vr', {
    schema: {
        formPosition: {type: 'vec3', default: {x: 0, y: 1.5, z: -3}},
        buttonPosition: {type: 'vec3', default: {x: 0, y: 1.5, z: 3}},
        visible: {type: 'boolean', default: false}
    },

    init: function () {
        // Estados del componente
        this.isFormVisible = false;
        this.isButtonVisible = true;

        // Crear el botón de activación del formulario
        this.createTriggerButton();

        // Crear el contenedor principal del formulario
        this.createFormContainer();

        // Configurar eventos
        this.setupEvents();

        // Efectos ambientales
        this.createAmbientEffects();

        console.log('Componente formulario-login-vr inicializado');
    },

    createTriggerButton: function() {
        const data = this.data;
        
        // Contenedor del botón
        const buttonContainer = document.createElement('a-entity');
        buttonContainer.setAttribute('id', 'login-trigger-button');
        buttonContainer.setAttribute('position', `${data.buttonPosition.x} ${data.buttonPosition.y} ${data.buttonPosition.z}`);

        // Fondo del botón
        const buttonPlane = document.createElement('a-plane');
        buttonPlane.setAttribute('width', '2.2');
        buttonPlane.setAttribute('height', '2.2');
        buttonPlane.setAttribute('color', '#2a5d4a');
        buttonPlane.setAttribute('opacity', '0.9');
        buttonPlane.classList.add('clickable');

        // Borde brillante
        const border = document.createElement('a-ring');
        border.setAttribute('radius-inner', '1.05');
        border.setAttribute('radius-outer', '1.15');
        border.setAttribute('color', '#00ff88');
        border.setAttribute('opacity', '0.8');
        border.setAttribute('position', '0 0 0.01');
        border.setAttribute('animation', 'property: rotation; to: 0 0 360; dur: 8000; loop: true');

        // Ícono de candado
        const lockBase = document.createElement('a-box');
        lockBase.setAttribute('width', '0.4');
        lockBase.setAttribute('height', '0.3');
        lockBase.setAttribute('depth', '0.1');
        lockBase.setAttribute('color', '#ffffff');
        lockBase.setAttribute('position', '0 0.1 0.02');

        const lockRing = document.createElement('a-ring');
        lockRing.setAttribute('radius-inner', '0.12');
        lockRing.setAttribute('radius-outer', '0.18');
        lockRing.setAttribute('color', '#ffffff');
        lockRing.setAttribute('position', '0 0.3 0.02');

        // Texto del botón
        const buttonText = document.createElement('a-text');
        buttonText.setAttribute('value', 'LOGIN VR');
        buttonText.setAttribute('position', '0 -0.4 0.02');
        buttonText.setAttribute('align', 'center');
        buttonText.setAttribute('color', '#00ff88');
        buttonText.setAttribute('scale', '0.6 0.6 1');
        buttonText.setAttribute('animation', 'property: scale; to: 0.7 0.7 1; dur: 2000; dir: alternate; loop: true');

        // Subtítulo
        const subtitle = document.createElement('a-text');
        subtitle.setAttribute('value', 'Inicia sesión');
        subtitle.setAttribute('position', '0 -0.7 0.02');
        subtitle.setAttribute('align', 'center');
        subtitle.setAttribute('color', '#ffffff');
        subtitle.setAttribute('scale', '0.4 0.4 1');

        // Efectos de partículas
        const particle1 = document.createElement('a-sphere');
        particle1.setAttribute('radius', '0.02');
        particle1.setAttribute('color', '#00ff88');
        particle1.setAttribute('position', '0.8 0.8 0.1');
        particle1.setAttribute('animation', 'property: position; to: -0.8 -0.8 0.1; dur: 3500; loop: true; dir: alternate');

        const particle2 = document.createElement('a-sphere');
        particle2.setAttribute('radius', '0.015');
        particle2.setAttribute('color', '#ffffff');
        particle2.setAttribute('position', '-0.8 0.6 0.1');
        particle2.setAttribute('animation', 'property: position; to: 0.8 -0.6 0.1; dur: 2800; loop: true; dir: alternate');

        // Ensamblar el botón
        buttonContainer.appendChild(buttonPlane);
        buttonContainer.appendChild(border);
        buttonContainer.appendChild(lockBase);
        buttonContainer.appendChild(lockRing);
        buttonContainer.appendChild(buttonText);
        buttonContainer.appendChild(subtitle);
        buttonContainer.appendChild(particle1);
        buttonContainer.appendChild(particle2);

        // Agregar al elemento principal
        this.el.appendChild(buttonContainer);

        // Guardar referencias
        this.buttonContainer = buttonContainer;
        this.buttonPlane = buttonPlane;
    },

    createFormContainer: function() {
        const data = this.data;

        // Crear el contenedor principal del formulario
        const formContainer = document.createElement('a-entity');
        formContainer.setAttribute('id', 'login-container-vr');
        formContainer.setAttribute('position', `${data.formPosition.x} ${data.formPosition.y} ${data.formPosition.z}`);
        formContainer.setAttribute('visible', false);

        // Panel principal del formulario
        const mainPanel = document.createElement('a-plane');
        mainPanel.setAttribute('width', '5');
        mainPanel.setAttribute('height', '6');
        mainPanel.setAttribute('color', '#2a5d4a');
        mainPanel.setAttribute('opacity', '0.9');
        mainPanel.setAttribute('material', 'shader: flat');
        mainPanel.classList.add('clickable');

        // Borde brillante
        const border = document.createElement('a-ring');
        border.setAttribute('radius-inner', '2.4');
        border.setAttribute('radius-outer', '2.6');
        border.setAttribute('color', '#00ff88');
        border.setAttribute('opacity', '0.6');
        border.setAttribute('position', '0 0 0.01');
        border.setAttribute('animation', 'property: rotation; to: 0 0 360; dur: 10000; loop: true');

        // Título
        const title = document.createElement('a-text');
        title.setAttribute('value', 'INICIAR SESIÓN');
        title.setAttribute('position', '0 2.5 0.1');
        title.setAttribute('align', 'center');
        title.setAttribute('color', '#ffffff');
        title.setAttribute('font', 'roboto');
        title.setAttribute('material', 'color: #00ff88; shader: msdf');
        title.setAttribute('scale', '1.3 1.3 1');
        title.setAttribute('animation', 'property: scale; to: 1.4 1.4 1; dir: alternate; dur: 2000; loop: true');

        // Campo Email/Usuario
        const emailField = this.createInputField('EMAIL:', 'usuario@ejemplo.com', '0 1.5 0.1', 'email-field');
        
        // Campo Contraseña
        const passwordField = this.createInputField('CONTRASEÑA:', '••••••••', '0 0.5 0.1', 'password-field');

        // Checkbox "Recordarme"
        const rememberCheckbox = this.createCheckbox('RECORDARME', '0 -0.5 0.1', 'remember-checkbox');

        // Botón Iniciar Sesión
        const loginButton = this.createButton('INICIAR SESIÓN', '#00ff88', '0 -1.5 0.1', 'login-btn');

        // Botón Cerrar
        const closeButton = this.createButton('CERRAR', '#666666', '0 -2.3 0.1', 'close-btn');

        // Agregar todos los elementos al contenedor
        formContainer.appendChild(mainPanel);
        formContainer.appendChild(border);
        formContainer.appendChild(title);
        formContainer.appendChild(emailField);
        formContainer.appendChild(passwordField);
        formContainer.appendChild(rememberCheckbox);
        formContainer.appendChild(loginButton);
        formContainer.appendChild(closeButton);

        // Agregar el contenedor a la escena
        this.el.appendChild(formContainer);

        // Guardar referencia
        this.formContainer = formContainer;
    },

    createInputField: function(label, placeholder, position, id) {
        const fieldContainer = document.createElement('a-entity');
        fieldContainer.setAttribute('id', id);
        fieldContainer.setAttribute('position', position);

        // Etiqueta
        const labelText = document.createElement('a-text');
        labelText.setAttribute('value', label);
        labelText.setAttribute('position', '-2 0.3 0');
        labelText.setAttribute('color', '#ffffff');
        labelText.setAttribute('scale', '0.8 0.8 1');

        // Campo de entrada
        const inputBox = document.createElement('a-box');
        inputBox.setAttribute('width', '3.5');
        inputBox.setAttribute('height', '0.4');
        inputBox.setAttribute('depth', '0.1');
        inputBox.setAttribute('color', '#1a3d2a');
        inputBox.classList.add('input-field', 'clickable');
        inputBox.setAttribute('position', '0 0 0');

        // Texto placeholder
        const placeholderText = document.createElement('a-text');
        placeholderText.setAttribute('value', placeholder);
        placeholderText.setAttribute('position', '-1.6 0 0.06');
        placeholderText.setAttribute('color', '#888888');
        placeholderText.setAttribute('scale', '0.6 0.6 1');

        fieldContainer.appendChild(labelText);
        fieldContainer.appendChild(inputBox);
        fieldContainer.appendChild(placeholderText);

        return fieldContainer;
    },

    createCheckbox: function(label, position, id) {
        const checkboxContainer = document.createElement('a-entity');
        checkboxContainer.setAttribute('id', id);
        checkboxContainer.setAttribute('position', position);

        // Checkbox
        const checkbox = document.createElement('a-box');
        checkbox.setAttribute('width', '0.3');
        checkbox.setAttribute('height', '0.3');
        checkbox.setAttribute('depth', '0.1');
        checkbox.setAttribute('color', '#1a3d2a');
        checkbox.classList.add('checkbox', 'clickable');
        checkbox.setAttribute('position', '-1.5 0 0');

        // Check mark (inicialmente oculto)
        const checkMark = document.createElement('a-text');
        checkMark.setAttribute('value', '✓');
        checkMark.setAttribute('position', '-1.5 0 0.06');
        checkMark.setAttribute('align', 'center');
        checkMark.setAttribute('color', '#00ff88');
        checkMark.setAttribute('scale', '0.8 0.8 1');
        checkMark.setAttribute('visible', false);

        // Etiqueta
        const labelText = document.createElement('a-text');
        labelText.setAttribute('value', label);
        labelText.setAttribute('position', '-1 0 0');
        labelText.setAttribute('color', '#ffffff');
        labelText.setAttribute('scale', '0.7 0.7 1');

        checkboxContainer.appendChild(checkbox);
        checkboxContainer.appendChild(checkMark);
        checkboxContainer.appendChild(labelText);

        return checkboxContainer;
    },

    createButton: function(text, color, position, id) {
        const buttonContainer = document.createElement('a-entity');
        buttonContainer.setAttribute('position', position);

        const button = document.createElement('a-box');
        button.setAttribute('id', id);
        button.setAttribute('width', text === 'INICIAR SESIÓN' ? '3' : '2');
        button.setAttribute('height', text === 'INICIAR SESIÓN' ? '0.6' : '0.4');
        button.setAttribute('depth', text === 'INICIAR SESIÓN' ? '0.15' : '0.1');
        button.setAttribute('color', color);
        button.classList.add('clickable');

        if (text === 'INICIAR SESIÓN') {
            button.setAttribute('animation', 'property: rotation; to: 0 0 360; dur: 8000; loop: true');
        }

        const buttonText = document.createElement('a-text');
        buttonText.setAttribute('value', text);
        buttonText.setAttribute('position', '0 0 ' + (text === 'INICIAR SESIÓN' ? '0.08' : '0.06'));
        buttonText.setAttribute('align', 'center');
        buttonText.setAttribute('color', text === 'INICIAR SESIÓN' ? '#000000' : '#ffffff');
        buttonText.setAttribute('scale', text === 'INICIAR SESIÓN' ? '0.7 0.7 1' : '0.6 0.6 1');

        buttonContainer.appendChild(button);
        buttonContainer.appendChild(buttonText);

        return buttonContainer;
    },

    setupEvents: function() {
        const self = this;

        // Evento de clic en el botón principal
        this.buttonPlane.addEventListener('click', function() {
            self.showForm();
        });

        // Efectos de hover en el botón
        this.buttonPlane.addEventListener('mouseenter', function() {
            this.setAttribute('animation__hover', 'property: scale; to: 1.05 1.05 1.05; dur: 200');
        });

        this.buttonPlane.addEventListener('mouseleave', function() {
            this.setAttribute('animation__hover', 'property: scale; to: 1 1 1; dur: 200');
        });

        // Eventos del formulario
        this.el.addEventListener('click', function(e) {
            const target = e.target;
            
            if (target.classList.contains('input-field')) {
                self.handleFieldClick(target);
            } else if (target.classList.contains('checkbox')) {
                self.toggleCheckbox(target);
            } else if (target.id === 'login-btn') {
                self.handleLogin();
            } else if (target.id === 'close-btn') {
                self.hideForm();
            }
        });
    },

    handleFieldClick: function(field) {
        // Simulación de entrada de texto con teclado virtual
        const fieldId = field.parentElement.id;
        const textElement = field.parentElement.querySelector('a-text:last-child');
        
        // Cambiar color del campo activo
        field.setAttribute('color', '#3a6d5a');
        field.setAttribute('animation__focus', 'property: scale; to: 1.05 1.05 1.05; dur: 200');
        
        // Efecto de brillo
        field.setAttribute('animation__glow', 'property: rotation; to: 0 0 2; dur: 100; dir: alternate; loop: 2');
        
        let sampleText = '';
        switch(fieldId) {
            case 'email-field':
                sampleText = 'usuario@vrapp.com';
                break;
            case 'password-field':
                sampleText = '••••••••••';
                break;
        }

        // Efecto de escritura gradual
        this.typeText(textElement, sampleText, 100);
        
        // Restaurar color después de la animación
        setTimeout(() => {
            field.setAttribute('color', '#1a3d2a');
        }, 2000);
    },

    typeText: function(element, text, delay) {
        element.setAttribute('value', '');
        element.setAttribute('color', '#ffffff');
        let i = 0;
        
        const typing = setInterval(() => {
            if (i < text.length) {
                element.setAttribute('value', text.substring(0, i + 1));
                i++;
            } else {
                clearInterval(typing);
            }
        }, delay);
    },

    toggleCheckbox: function(checkbox) {
        const checkMark = checkbox.parentElement.querySelector('a-text');
        const isChecked = checkMark.getAttribute('visible');
        
        if (isChecked) {
            checkMark.setAttribute('visible', false);
            checkbox.setAttribute('color', '#1a3d2a');
        } else {
            checkMark.setAttribute('visible', true);
            checkbox.setAttribute('color', '#2a5d4a');
            checkbox.setAttribute('animation__check', 'property: scale; to: 1.1 1.1 1.1; dur: 200; dir: alternate; loop: 2');
        }
    },

    handleLogin: function() {
        console.log('Login VR iniciado');
        
        // Validación básica (simulada)
        const emailField = this.el.querySelector('#email-field a-text:last-child');
        const passwordField = this.el.querySelector('#password-field a-text:last-child');
        
        const email = emailField ? emailField.getAttribute('value') : '';
        const password = passwordField ? passwordField.getAttribute('value') : '';
        
        if (!email || email === 'usuario@ejemplo.com' || 
            !password || password === '••••••••') {
            this.showMessage('Por favor completa todos los campos', '#ff0000');
            return;
        }
        
        // Efecto de procesamiento en el botón
        const loginBtn = this.el.querySelector('#login-btn');
        if (loginBtn) {
            loginBtn.setAttribute('animation__processing', 'property: rotation; to: 0 360 0; dur: 2000; loop: 3');
        }
        
        // Simular login exitoso
        setTimeout(() => {
            this.showMessage('¡Bienvenido de vuelta!', '#00ff88');
            
            setTimeout(() => {
                this.hideForm();
                console.log('Login completado exitosamente');
                // Aquí podrías redirigir a la aplicación principal
            }, 2000);
        }, 3000);
    },

    showMessage: function(message, color) {
        const messageEl = document.createElement('a-text');
        messageEl.setAttribute('value', message);
        messageEl.setAttribute('position', '0 3 -1');
        messageEl.setAttribute('align', 'center');
        messageEl.setAttribute('color', color);
        messageEl.setAttribute('scale', '1.5 1.5 1');
        messageEl.setAttribute('animation__appear', 'property: scale; from: 0 0 0; to: 1.5 1.5 1; dur: 500');

        const scene = document.querySelector('a-scene');
        if (scene) {
            scene.appendChild(messageEl);
        }

        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 3000);
    },

    createAmbientEffects: function() {
        const colors = ['#00ff88', '#ffffff', '#88ff88', '#aaffaa'];
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('a-sphere');
            particle.setAttribute('radius', Math.random() * 0.015 + 0.008);
            particle.setAttribute('color', colors[Math.floor(Math.random() * colors.length)]);
            
            const x = (Math.random() - 0.5) * 8;
            const y = Math.random() * 5 + 1;
            const z = (Math.random() - 0.5) * 6 - 3;
            
            particle.setAttribute('position', `${x} ${y} ${z}`);
            particle.setAttribute('animation__float', 
                `property: position; to: ${-x} ${y + 1} ${z - 1}; dur: ${Math.random() * 8000 + 4000}; loop: true; dir: alternate`);
            
            this.el.appendChild(particle);
        }
    },

    showForm: function() {
        this.isFormVisible = true;
        this.isButtonVisible = false;

        // Ocultar botón con animación
        this.buttonContainer.setAttribute('animation__hide', 'property: scale; to: 0 0 0; dur: 500');
        setTimeout(() => {
            this.buttonContainer.setAttribute('visible', false);
        }, 500);

        // Mostrar formulario con animación
        setTimeout(() => {
            this.formContainer.setAttribute('visible', true);
            this.formContainer.setAttribute('animation__show', 'property: scale; from: 0 0 0; to: 1 1 1; dur: 500');
        }, 600);
    },

    hideForm: function() {
        this.isFormVisible = false;
        this.isButtonVisible = true;

        // Ocultar formulario con animación
        this.formContainer.setAttribute('animation__hide', 'property: scale; to: 0 0 0; dur: 500');
        setTimeout(() => {
            this.formContainer.setAttribute('visible', false);
        }, 500);

        // Mostrar botón con animación
        setTimeout(() => {
            this.buttonContainer.setAttribute('visible', true);
            this.buttonContainer.setAttribute('animation__show', 'property: scale; from: 0 0 0; to: 1 1 1; dur: 500');
        }, 600);
    },

    toggleForm: function() {
        if (this.isFormVisible) {
            this.hideForm();
        } else {
            this.showForm();
        }
    },

    // Función para cambiar posiciones dinámicamente
    updatePositions: function(formPos, buttonPos) {
        if (formPos) {
            this.data.formPosition = formPos;
            this.formContainer.setAttribute('position', `${formPos.x} ${formPos.y} ${formPos.z}`);
        }
        if (buttonPos) {
            this.data.buttonPosition = buttonPos;
            this.buttonContainer.setAttribute('position', `${buttonPos.x} ${buttonPos.y} ${buttonPos.z}`);
        }
    }
});

// Funcionalidad adicional para controles de teclado globales del login
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de login VR cargado');
    
    // Controles de teclado para el formulario de login VR
    document.addEventListener('keydown', function(e) {
        const loginComponent = document.getElementById('login-vr-component');
        
        if (loginComponent) {
            const formComponent = loginComponent.components['formulario-login-vr'];
            
            if (formComponent) {
                switch(e.key) {
                    case 'Enter':
                        if (formComponent.isFormVisible) {
                            formComponent.handleLogin();
                        }
                        break;
                    case 'Escape':
                        if (formComponent.isFormVisible) {
                            formComponent.hideForm();
                        }
                        break;
                    case ' ': // Espacio para toggle checkbox
                        if (formComponent.isFormVisible) {
                            const checkbox = loginComponent.querySelector('#remember-checkbox .checkbox');
                            if (checkbox) formComponent.toggleCheckbox(checkbox);
                        }
                        break;
                }
            }
        }
    });
    
    console.log('Controles del formulario de login VR disponibles:');
    console.log('- Click: Interactuar con campos y botones');
    console.log('- Espacio: Toggle checkbox "Recordarme" (cuando formulario esté abierto)');
    console.log('- Enter: Iniciar sesión (cuando formulario esté abierto)');
    console.log('- ESC: Cerrar formulario');
});
