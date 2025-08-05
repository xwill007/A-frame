// Componente A-Frame para formulario de registro VR
AFRAME.registerComponent('formulario-registro-vr', {
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

        console.log('Componente formulario-registro-vr inicializado');
    },

    createTriggerButton: function() {
        const data = this.data;
        
        // Contenedor del botón
        const buttonContainer = document.createElement('a-entity');
        buttonContainer.setAttribute('id', 'form-trigger-button');
        buttonContainer.setAttribute('position', `${data.buttonPosition.x} ${data.buttonPosition.y} ${data.buttonPosition.z}`);

        // Fondo del botón
        const buttonPlane = document.createElement('a-plane');
        buttonPlane.setAttribute('width', '2.2');
        buttonPlane.setAttribute('height', '2.2');
        buttonPlane.setAttribute('color', '#1e3c72');
        buttonPlane.setAttribute('opacity', '0.9');
        buttonPlane.classList.add('clickable');

        // Borde brillante
        const border = document.createElement('a-ring');
        border.setAttribute('radius-inner', '1.05');
        border.setAttribute('radius-outer', '1.15');
        border.setAttribute('color', '#00ffff');
        border.setAttribute('opacity', '0.8');
        border.setAttribute('position', '0 0 0.01');
        border.setAttribute('animation', 'property: rotation; to: 0 0 360; dur: 8000; loop: true');

        // Ícono de usuario
        const iconCylinder = document.createElement('a-cylinder');
        iconCylinder.setAttribute('height', '0.4');
        iconCylinder.setAttribute('radius', '0.3');
        iconCylinder.setAttribute('color', '#ffffff');
        iconCylinder.setAttribute('position', '0 0.4 0.02');

        const iconSphere = document.createElement('a-sphere');
        iconSphere.setAttribute('radius', '0.2');
        iconSphere.setAttribute('color', '#ffffff');
        iconSphere.setAttribute('position', '0 0.1 0.02');

        // Texto del botón
        const buttonText = document.createElement('a-text');
        buttonText.setAttribute('value', 'REGISTRO VR');
        buttonText.setAttribute('position', '0 -0.4 0.02');
        buttonText.setAttribute('align', 'center');
        buttonText.setAttribute('color', '#00ffff');
        buttonText.setAttribute('scale', '0.6 0.6 1');
        buttonText.setAttribute('animation', 'property: scale; to: 0.7 0.7 1; dur: 2000; dir: alternate; loop: true');

        // Subtítulo
        const subtitle = document.createElement('a-text');
        subtitle.setAttribute('value', 'Crea tu cuenta');
        subtitle.setAttribute('position', '0 -0.7 0.02');
        subtitle.setAttribute('align', 'center');
        subtitle.setAttribute('color', '#ffffff');
        subtitle.setAttribute('scale', '0.4 0.4 1');

        // Efectos de partículas
        const particle1 = document.createElement('a-sphere');
        particle1.setAttribute('radius', '0.02');
        particle1.setAttribute('color', '#00ffff');
        particle1.setAttribute('position', '0.8 0.8 0.1');
        particle1.setAttribute('animation', 'property: position; to: -0.8 -0.8 0.1; dur: 4000; loop: true; dir: alternate');

        const particle2 = document.createElement('a-sphere');
        particle2.setAttribute('radius', '0.015');
        particle2.setAttribute('color', '#ffffff');
        particle2.setAttribute('position', '-0.8 0.6 0.1');
        particle2.setAttribute('animation', 'property: position; to: 0.8 -0.6 0.1; dur: 3000; loop: true; dir: alternate');

        // Ensamblar el botón
        buttonContainer.appendChild(buttonPlane);
        buttonContainer.appendChild(border);
        buttonContainer.appendChild(iconCylinder);
        buttonContainer.appendChild(iconSphere);
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
        formContainer.setAttribute('id', 'form-container-vr');
        formContainer.setAttribute('position', `${data.formPosition.x} ${data.formPosition.y} ${data.formPosition.z}`);
        formContainer.setAttribute('visible', false);

        // Panel principal del formulario
        const mainPanel = document.createElement('a-plane');
        mainPanel.setAttribute('width', '6');
        mainPanel.setAttribute('height', '8');
        mainPanel.setAttribute('color', '#1e3c72');
        mainPanel.setAttribute('opacity', '0.9');
        mainPanel.setAttribute('material', 'shader: flat');
        mainPanel.classList.add('clickable');

        // Borde brillante
        const border = document.createElement('a-ring');
        border.setAttribute('radius-inner', '2.9');
        border.setAttribute('radius-outer', '3.1');
        border.setAttribute('color', '#00ffff');
        border.setAttribute('opacity', '0.6');
        border.setAttribute('position', '0 0 0.01');
        border.setAttribute('animation', 'property: rotation; to: 0 0 360; dur: 10000; loop: true');

        // Título
        const title = document.createElement('a-text');
        title.setAttribute('value', 'REGISTRO VR');
        title.setAttribute('position', '0 3.5 0.1');
        title.setAttribute('align', 'center');
        title.setAttribute('color', '#ffffff');
        title.setAttribute('font', 'roboto');
        title.setAttribute('material', 'color: #00ffff; shader: msdf');
        title.setAttribute('scale', '1.5 1.5 1');
        title.setAttribute('animation', 'property: scale; to: 1.6 1.6 1; dir: alternate; dur: 2000; loop: true');

        // Campo Nombre
        const nameField = this.createInputField('NOMBRE:', 'Ingresa tu nombre...', '0 2.5 0.1', 'name-field');
        
        // Campo Email
        const emailField = this.createInputField('EMAIL:', 'ejemplo@correo.com', '0 1.5 0.1', 'email-field');
        
        // Campo Contraseña
        const passwordField = this.createInputField('CONTRASEÑA:', '••••••••', '0 0.5 0.1', 'password-field');

        // Selector de Nivel
        const levelSelector = this.createLevelSelector();

        // Botón Registrarse
        const registerButton = this.createButton('REGISTRARSE', '#00ffff', '0 -1.8 0.1', 'register-btn');

        // Botón Cerrar
        const closeButton = this.createButton('CERRAR', '#666666', '0 -2.8 0.1', 'close-btn');

        // Agregar todos los elementos al contenedor
        formContainer.appendChild(mainPanel);
        formContainer.appendChild(border);
        formContainer.appendChild(title);
        formContainer.appendChild(nameField);
        formContainer.appendChild(emailField);
        formContainer.appendChild(passwordField);
        formContainer.appendChild(levelSelector);
        formContainer.appendChild(registerButton);
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
        labelText.setAttribute('position', '-2.5 0.3 0');
        labelText.setAttribute('color', '#ffffff');
        labelText.setAttribute('scale', '0.8 0.8 1');

        // Campo de entrada
        const inputBox = document.createElement('a-box');
        inputBox.setAttribute('width', '4');
        inputBox.setAttribute('height', '0.4');
        inputBox.setAttribute('depth', '0.1');
        inputBox.setAttribute('color', '#2a2a4a');
        inputBox.classList.add('input-field', 'clickable');
        inputBox.setAttribute('position', '0 0 0');

        // Texto placeholder
        const placeholderText = document.createElement('a-text');
        placeholderText.setAttribute('value', placeholder);
        placeholderText.setAttribute('position', '-1.8 0 0.06');
        placeholderText.setAttribute('color', '#888888');
        placeholderText.setAttribute('scale', '0.6 0.6 1');

        fieldContainer.appendChild(labelText);
        fieldContainer.appendChild(inputBox);
        fieldContainer.appendChild(placeholderText);

        return fieldContainer;
    },

    createLevelSelector: function() {
        const levelContainer = document.createElement('a-entity');
        levelContainer.setAttribute('id', 'level-field');
        levelContainer.setAttribute('position', '0 -0.5 0.1');

        // Etiqueta
        const label = document.createElement('a-text');
        label.setAttribute('value', 'NIVEL:');
        label.setAttribute('position', '-2.5 0.3 0');
        label.setAttribute('color', '#ffffff');
        label.setAttribute('scale', '0.8 0.8 1');

        // Contenedor de botones
        const buttonsContainer = document.createElement('a-entity');
        buttonsContainer.setAttribute('position', '0 -0.3 0');

        // Botón Principiante
        const beginnerBtn = document.createElement('a-box');
        beginnerBtn.setAttribute('id', 'beginner-btn');
        beginnerBtn.setAttribute('width', '1.2');
        beginnerBtn.setAttribute('height', '0.3');
        beginnerBtn.setAttribute('depth', '0.1');
        beginnerBtn.setAttribute('color', '#4CAF50');
        beginnerBtn.classList.add('level-btn', 'clickable', 'selected');
        beginnerBtn.setAttribute('position', '-1.3 0 0');

        const beginnerText = document.createElement('a-text');
        beginnerText.setAttribute('value', 'PRINCIPIANTE');
        beginnerText.setAttribute('position', '-1.3 0 0.06');
        beginnerText.setAttribute('align', 'center');
        beginnerText.setAttribute('color', '#ffffff');
        beginnerText.setAttribute('scale', '0.4 0.4 1');

        // Botón Intermedio
        const intermediateBtn = document.createElement('a-box');
        intermediateBtn.setAttribute('id', 'intermediate-btn');
        intermediateBtn.setAttribute('width', '1.2');
        intermediateBtn.setAttribute('height', '0.3');
        intermediateBtn.setAttribute('depth', '0.1');
        intermediateBtn.setAttribute('color', '#2196F3');
        intermediateBtn.classList.add('level-btn', 'clickable');
        intermediateBtn.setAttribute('position', '0 0 0');

        const intermediateText = document.createElement('a-text');
        intermediateText.setAttribute('value', 'INTERMEDIO');
        intermediateText.setAttribute('position', '0 0 0.06');
        intermediateText.setAttribute('align', 'center');
        intermediateText.setAttribute('color', '#ffffff');
        intermediateText.setAttribute('scale', '0.4 0.4 1');

        // Botón Avanzado
        const advancedBtn = document.createElement('a-box');
        advancedBtn.setAttribute('id', 'advanced-btn');
        advancedBtn.setAttribute('width', '1.2');
        advancedBtn.setAttribute('height', '0.3');
        advancedBtn.setAttribute('depth', '0.1');
        advancedBtn.setAttribute('color', '#FF5722');
        advancedBtn.classList.add('level-btn', 'clickable');
        advancedBtn.setAttribute('position', '1.3 0 0');

        const advancedText = document.createElement('a-text');
        advancedText.setAttribute('value', 'AVANZADO');
        advancedText.setAttribute('position', '1.3 0 0.06');
        advancedText.setAttribute('align', 'center');
        advancedText.setAttribute('color', '#ffffff');
        advancedText.setAttribute('scale', '0.4 0.4 1');

        // Ensamblar
        buttonsContainer.appendChild(beginnerBtn);
        buttonsContainer.appendChild(beginnerText);
        buttonsContainer.appendChild(intermediateBtn);
        buttonsContainer.appendChild(intermediateText);
        buttonsContainer.appendChild(advancedBtn);
        buttonsContainer.appendChild(advancedText);

        levelContainer.appendChild(label);
        levelContainer.appendChild(buttonsContainer);

        return levelContainer;
    },

    createButton: function(text, color, position, id) {
        const buttonContainer = document.createElement('a-entity');
        buttonContainer.setAttribute('position', position);

        const button = document.createElement('a-box');
        button.setAttribute('id', id);
        button.setAttribute('width', text === 'REGISTRARSE' ? '3' : '2');
        button.setAttribute('height', text === 'REGISTRARSE' ? '0.6' : '0.4');
        button.setAttribute('depth', text === 'REGISTRARSE' ? '0.15' : '0.1');
        button.setAttribute('color', color);
        button.classList.add('clickable');

        if (text === 'REGISTRARSE') {
            button.setAttribute('animation', 'property: rotation; to: 0 0 360; dur: 8000; loop: true');
        }

        const buttonText = document.createElement('a-text');
        buttonText.setAttribute('value', text);
        buttonText.setAttribute('position', '0 0 ' + (text === 'REGISTRARSE' ? '0.08' : '0.06'));
        buttonText.setAttribute('align', 'center');
        buttonText.setAttribute('color', text === 'REGISTRARSE' ? '#000000' : '#ffffff');
        buttonText.setAttribute('scale', text === 'REGISTRARSE' ? '0.8 0.8 1' : '0.6 0.6 1');

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

        // Eventos del formulario (se configuran cuando se crea)
        this.el.addEventListener('click', function(e) {
            const target = e.target;
            
            if (target.classList.contains('input-field')) {
                self.handleFieldClick(target);
            } else if (target.classList.contains('level-btn')) {
                self.selectLevel(target);
            } else if (target.id === 'register-btn') {
                self.handleRegister();
            } else if (target.id === 'close-btn') {
                self.hideForm();
            }
        });
    },

    handleFieldClick: function(field) {
        // Simulación de entrada de texto
        const fieldId = field.parentElement.id;
        const textElement = field.parentElement.querySelector('a-text:last-child');
        
        switch(fieldId) {
            case 'name-field':
                textElement.setAttribute('value', 'Usuario VR');
                textElement.setAttribute('color', '#ffffff');
                break;
            case 'email-field':
                textElement.setAttribute('value', 'usuario@vr.com');
                textElement.setAttribute('color', '#ffffff');
                break;
            case 'password-field':
                textElement.setAttribute('value', '••••••••••');
                textElement.setAttribute('color', '#ffffff');
                break;
        }

        // Efecto visual
        field.setAttribute('animation__click', 'property: scale; to: 1.05 1.05 1.05; dur: 300; dir: alternate; loop: 2');
    },

    selectLevel: function(selectedBtn) {
        // Remover selección de todos los botones
        const levelBtns = this.el.querySelectorAll('.level-btn');
        levelBtns.forEach(btn => btn.classList.remove('selected'));
        
        // Seleccionar el botón clickeado
        selectedBtn.classList.add('selected');
        selectedBtn.setAttribute('animation__select', 'property: scale; to: 1.1 1.1 1.1; dur: 300; dir: alternate; loop: 2');
    },

    handleRegister: function() {
        console.log('Registro VR iniciado');
        this.showMessage('¡Registro exitoso! Bienvenido a VR English', '#00ff00');
        
        setTimeout(() => {
            this.hideForm();
        }, 2000);
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
        const colors = ['#00ffff', '#ffffff', '#00ff00'];
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('a-sphere');
            particle.setAttribute('radius', Math.random() * 0.02 + 0.01);
            particle.setAttribute('color', colors[Math.floor(Math.random() * colors.length)]);
            
            const x = (Math.random() - 0.5) * 8;
            const y = Math.random() * 6 + 1;
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
