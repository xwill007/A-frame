// Componente A-Frame para formulario de registro VR
AFRAME.registerComponent('formulario-registro-vr', {
    schema: {
        position: {type: 'vec3', default: {x: 0, y: 1.5, z: -3}},
        visible: {type: 'boolean', default: false}
    },

    init: function () {
        const el = this.el;
        const data = this.data;

        // Crear el contenedor principal del formulario
        const formContainer = document.createElement('a-entity');
        formContainer.setAttribute('id', 'form-container-vr');
        formContainer.setAttribute('position', `${data.position.x} ${data.position.y} ${data.position.z}`);
        formContainer.setAttribute('visible', data.visible);

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
        el.appendChild(formContainer);

        // Configurar eventos
        this.setupEvents();

        // Efectos ambientales
        this.createAmbientEffects();

        console.log('Componente formulario-registro-vr inicializado');
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
        const levelLabel = document.createElement('a-text');
        levelLabel.setAttribute('value', 'NIVEL:');
        levelLabel.setAttribute('position', '-2.5 0.3 0');
        levelLabel.setAttribute('color', '#ffffff');
        levelLabel.setAttribute('scale', '0.8 0.8 1');

        // Contenedor de botones
        const buttonsContainer = document.createElement('a-entity');
        buttonsContainer.setAttribute('id', 'level-buttons');
        buttonsContainer.setAttribute('position', '0 -0.3 0');

        // Botones de nivel
        const levels = [
            {id: 'beginner-btn', text: 'PRINCIPIANTE', color: '#4CAF50', position: '-1.3 0 0'},
            {id: 'intermediate-btn', text: 'INTERMEDIO', color: '#2196F3', position: '0 0 0'},
            {id: 'advanced-btn', text: 'AVANZADO', color: '#FF5722', position: '1.3 0 0'}
        ];

        levels.forEach((level, index) => {
            const levelBtn = document.createElement('a-box');
            levelBtn.setAttribute('id', level.id);
            levelBtn.setAttribute('width', '1.2');
            levelBtn.setAttribute('height', '0.3');
            levelBtn.setAttribute('depth', '0.1');
            levelBtn.setAttribute('color', level.color);
            levelBtn.setAttribute('position', level.position);
            levelBtn.classList.add('level-btn', 'clickable');
            if (index === 0) levelBtn.classList.add('selected');

            const levelText = document.createElement('a-text');
            levelText.setAttribute('value', level.text);
            levelText.setAttribute('position', level.position.split(' ')[0] + ' 0 0.06');
            levelText.setAttribute('align', 'center');
            levelText.setAttribute('color', '#ffffff');
            levelText.setAttribute('scale', '0.4 0.4 1');

            buttonsContainer.appendChild(levelBtn);
            buttonsContainer.appendChild(levelText);
        });

        levelContainer.appendChild(levelLabel);
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
        button.setAttribute('depth', '0.15');
        button.setAttribute('color', color);
        button.classList.add('clickable');
        if (text === 'REGISTRARSE') {
            button.setAttribute('animation', 'property: rotation; to: 0 0 360; dur: 8000; loop: true');
        }

        const buttonText = document.createElement('a-text');
        buttonText.setAttribute('value', text);
        buttonText.setAttribute('position', '0 0 0.08');
        buttonText.setAttribute('align', 'center');
        buttonText.setAttribute('color', text === 'REGISTRARSE' ? '#000000' : '#ffffff');
        buttonText.setAttribute('scale', text === 'REGISTRARSE' ? '0.8 0.8 1' : '0.6 0.6 1');

        buttonContainer.appendChild(button);
        buttonContainer.appendChild(buttonText);

        return buttonContainer;
    },

    setupEvents: function() {
        const el = this.el;

        // Event listeners para campos de entrada
        el.querySelectorAll('.input-field').forEach(field => {
            field.addEventListener('click', () => {
                this.handleFieldClick(field);
            });
        });

        // Event listeners para botones de nivel
        el.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.selectLevel(btn);
            });
        });

        // Botón registrarse
        const registerBtn = el.querySelector('#register-btn');
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.handleRegister();
            });
        }

        // Botón cerrar
        const closeBtn = el.querySelector('#close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideForm();
            });
        }
    },

    handleFieldClick: function(field) {
        // Efecto visual
        field.setAttribute('color', '#3a3a6a');
        field.setAttribute('animation__focus', 'property: scale; to: 1.05 1.05 1.05; dur: 200');

        // Simular entrada de datos
        setTimeout(() => {
            const fieldId = field.parentElement.id;
            let sampleText = '';
            
            switch(fieldId) {
                case 'name-field':
                    sampleText = 'Juan Pérez';
                    break;
                case 'email-field':
                    sampleText = 'juan.perez@email.com';
                    break;
                case 'password-field':
                    sampleText = '••••••••';
                    break;
            }

            const textElement = field.parentElement.querySelector('a-text:last-child');
            if (textElement) {
                textElement.setAttribute('value', sampleText);
                textElement.setAttribute('color', '#ffffff');
            }

            field.setAttribute('color', '#2a2a4a');
            field.removeAttribute('animation__focus');
        }, 1000);
    },

    selectLevel: function(selectedBtn) {
        // Remover selección anterior
        this.el.querySelectorAll('.level-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.removeAttribute('animation__pulse');
        });

        // Seleccionar nuevo nivel
        selectedBtn.classList.add('selected');
        selectedBtn.setAttribute('animation__pulse', 'property: scale; to: 1.1 1.1 1.1; dur: 300; dir: alternate; loop: 2');
    },

    handleRegister: function() {
        const registerBtn = this.el.querySelector('#register-btn');
        
        // Efecto de procesamiento
        registerBtn.setAttribute('animation__processing', 'property: rotation; to: 0 720 0; dur: 2000');

        // Mostrar mensaje de éxito
        setTimeout(() => {
            this.showMessage('¡Registro exitoso!', '#00ff00');
            
            setTimeout(() => {
                this.hideForm();
                // Mensaje de bienvenida
                setTimeout(() => {
                    this.showMessage('Bienvenido al aprendizaje VR', '#00ffff');
                }, 600);
            }, 2000);
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

        // Agregar a la escena principal en lugar del componente
        const scene = document.querySelector('a-scene');
        if (scene) {
            scene.appendChild(messageEl);
        } else {
            this.el.appendChild(messageEl);
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
        const formContainer = this.el.querySelector('#form-container-vr');
        if (formContainer) {
            formContainer.setAttribute('visible', true);
            formContainer.setAttribute('animation__show', 'property: scale; from: 0 0 0; to: 1 1 1; dur: 500');
        }
    },

    hideForm: function() {
        const formContainer = this.el.querySelector('#form-container-vr');
        if (formContainer) {
            formContainer.setAttribute('animation__hide', 'property: scale; to: 0 0 0; dur: 500');
            setTimeout(() => {
                formContainer.setAttribute('visible', false);
                // Emitir evento de formulario cerrado
                this.el.emit('form-closed');
            }, 500);
        }
    }
});
