// Funcionalidad del formulario de registro VR
document.addEventListener('DOMContentLoaded', function() {
    console.log('Formulario de registro VR cargado');
    
    // Esperar a que A-Frame esté listo
    document.querySelector('a-scene').addEventListener('loaded', function() {
        console.log('Escena de formulario VR cargada');
        
        // Elementos del formulario
        const nameInput = document.getElementById('name-input');
        const emailInput = document.getElementById('email-input');
        const passwordInput = document.getElementById('password-input');
        const nameText = document.getElementById('name-text');
        const emailText = document.getElementById('email-text');
        const passwordText = document.getElementById('password-text');
        
        // Botones de nivel
        const beginnerBtn = document.getElementById('beginner-btn');
        const intermediateBtn = document.getElementById('intermediate-btn');
        const advancedBtn = document.getElementById('advanced-btn');
        
        // Botones de acción
        const registerBtn = document.getElementById('register-btn');
        const backBtn = document.getElementById('back-btn');
        
        // Estado del formulario
        let formData = {
            name: '',
            email: '',
            password: '',
            level: 'principiante'
        };
        
        let currentField = null;
        
        // Función para mostrar teclado virtual (simulado)
        function showVirtualKeyboard(field, textElement, placeholder) {
            console.log('Mostrando teclado virtual para:', field);
            currentField = { field, textElement, placeholder };
            
            // Cambiar color del campo activo
            field.setAttribute('color', '#3a3a6a');
            field.setAttribute('animation__focus', 
                'property: scale; to: 1.05 1.05 1.05; dur: 200');
            
            // Efecto de brillo
            field.setAttribute('animation__glow', 
                'property: rotation; to: 0 0 2; dur: 100; dir: alternate; loop: 2');
            
            // En VR real, aquí se abriría un teclado virtual 3D
            simulateTyping(field, textElement);
        }
        
        // Simulación de escritura (en VR real sería input del teclado virtual)
        function simulateTyping(field, textElement) {
            const fieldName = field.id.replace('-input', '');
            
            let sampleText = '';
            switch(fieldName) {
                case 'name':
                    sampleText = 'Juan Pérez';
                    break;
                case 'email':
                    sampleText = 'juan.perez@email.com';
                    break;
                case 'password':
                    sampleText = '••••••••';
                    break;
            }
            
            // Actualizar texto gradualmente
            typeText(textElement, sampleText, 100);
            formData[fieldName] = sampleText.replace(/•/g, 'password123');
        }
        
        // Efecto de escritura gradual
        function typeText(element, text, delay) {
            element.setAttribute('value', '');
            let i = 0;
            
            const typing = setInterval(() => {
                if (i < text.length) {
                    element.setAttribute('value', text.substring(0, i + 1));
                    i++;
                } else {
                    clearInterval(typing);
                    // Remover focus del campo
                    if (currentField) {
                        currentField.field.setAttribute('color', '#2a2a4a');
                        currentField.field.removeAttribute('animation__focus');
                    }
                }
            }, delay);
        }
        
        // Eventos de los campos de entrada
        if (nameInput) {
            nameInput.addEventListener('click', function() {
                showVirtualKeyboard(this, nameText, 'Ingresa tu nombre...');
            });
        }
        
        if (emailInput) {
            emailInput.addEventListener('click', function() {
                showVirtualKeyboard(this, emailText, 'ejemplo@correo.com');
            });
        }
        
        if (passwordInput) {
            passwordInput.addEventListener('click', function() {
                showVirtualKeyboard(this, passwordText, '••••••••');
            });
        }
        
        // Función para manejar selección de nivel
        function selectLevel(button, level) {
            // Remover selección anterior
            document.querySelectorAll('.level-btn').forEach(btn => {
                btn.classList.remove('selected');
                btn.setAttribute('animation__deselect', 
                    'property: scale; to: 1 1 1; dur: 200');
            });
            
            // Seleccionar nuevo nivel
            button.classList.add('selected');
            button.setAttribute('animation__select', 
                'property: scale; to: 1.1 1.1 1.1; dur: 300');
            
            formData.level = level;
            console.log('Nivel seleccionado:', level);
        }
        
        // Eventos de botones de nivel
        if (beginnerBtn) {
            beginnerBtn.addEventListener('click', function() {
                selectLevel(this, 'principiante');
            });
        }
        
        if (intermediateBtn) {
            intermediateBtn.addEventListener('click', function() {
                selectLevel(this, 'intermedio');
            });
        }
        
        if (advancedBtn) {
            advancedBtn.addEventListener('click', function() {
                selectLevel(this, 'avanzado');
            });
        }
        
        // Botón registrarse
        if (registerBtn) {
            registerBtn.addEventListener('click', function() {
                console.log('Intentando registrar usuario:', formData);
                
                // Validación básica
                if (!formData.name || !formData.email || !formData.password) {
                    showMessage('Por favor completa todos los campos', 'error');
                    return;
                }
                
                // Efecto de procesamiento
                this.setAttribute('animation__processing', 
                    'property: rotation; to: 0 360 0; dur: 2000; loop: 3');
                
                // Simular registro exitoso
                setTimeout(() => {
                    showMessage('¡Registro exitoso!', 'success');
                    
                    setTimeout(() => {
                        console.log('Redirigiendo a lista de canciones...');
                        window.location.href = '../views/canciones-vr.html';
                    }, 2000);
                }, 3000);
            });
        }
        
        // Botón volver
        if (backBtn) {
            backBtn.addEventListener('click', function() {
                console.log('Volviendo al entorno principal');
                
                // Efecto de salida
                this.setAttribute('animation__exit', 
                    'property: scale; to: 0.8 0.8 0.8; dur: 200');
                
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 300);
            });
        }
        
        // Función para mostrar mensajes
        function showMessage(message, type) {
            // Crear elemento de mensaje temporal
            const messageEntity = document.createElement('a-text');
            messageEntity.setAttribute('value', message);
            messageEntity.setAttribute('position', '0 0.5 -2');
            messageEntity.setAttribute('align', 'center');
            messageEntity.setAttribute('color', type === 'error' ? '#ff0000' : '#00ff00');
            messageEntity.setAttribute('scale', '1.2 1.2 1');
            
            // Animación de entrada
            messageEntity.setAttribute('animation__enter', 
                'property: scale; from: 0 0 0; to: 1.2 1.2 1; dur: 500');
            
            // Añadir a la escena
            document.querySelector('a-scene').appendChild(messageEntity);
            
            // Remover después de 3 segundos
            setTimeout(() => {
                messageEntity.setAttribute('animation__exit', 
                    'property: scale; to: 0 0 0; dur: 500');
                setTimeout(() => {
                    if (messageEntity.parentNode) {
                        messageEntity.parentNode.removeChild(messageEntity);
                    }
                }, 500);
            }, 3000);
        }
        
        // Controles de teclado
        document.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'Enter':
                    if (registerBtn) registerBtn.click();
                    break;
                case 'Escape':
                    if (backBtn) backBtn.click();
                    break;
                case '1':
                    if (beginnerBtn) beginnerBtn.click();
                    break;
                case '2':
                    if (intermediateBtn) intermediateBtn.click();
                    break;
                case '3':
                    if (advancedBtn) advancedBtn.click();
                    break;
            }
        });
        
        // Efectos ambientales
        function startAmbientEffects() {
            // Animación del borde del panel
            const ring = document.querySelector('a-ring');
            if (ring) {
                ring.setAttribute('animation__pulse', 
                    'property: scale; to: 1.1 1.1 1; dur: 3000; dir: alternate; loop: true');
            }
            
            // Efectos de partículas adicionales
            createFloatingParticles();
        }
        
        function createFloatingParticles() {
            const colors = ['#00ffff', '#ffffff', '#00ff00', '#ffff00'];
            
            for (let i = 0; i < 10; i++) {
                const particle = document.createElement('a-sphere');
                particle.setAttribute('radius', Math.random() * 0.02 + 0.01);
                particle.setAttribute('color', colors[Math.floor(Math.random() * colors.length)]);
                
                const x = (Math.random() - 0.5) * 10;
                const y = Math.random() * 5 + 1;
                const z = (Math.random() - 0.5) * 8 - 3;
                
                particle.setAttribute('position', `${x} ${y} ${z}`);
                particle.setAttribute('animation__float', 
                    `property: position; to: ${-x} ${y + 2} ${z - 2}; dur: ${Math.random() * 10000 + 5000}; loop: true; dir: alternate`);
                
                document.querySelector('a-scene').appendChild(particle);
            }
        }
        
        // Inicializar efectos
        setTimeout(startAmbientEffects, 1000);
        
        console.log('Controles del formulario VR:');
        console.log('- Click: Interactuar con campos y botones');
        console.log('- 1, 2, 3: Seleccionar nivel');
        console.log('- Enter: Registrarse');
        console.log('- ESC: Volver');
    });
});
