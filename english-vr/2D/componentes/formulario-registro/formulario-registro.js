// Funcionalidad del formulario de registro
document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('registro-form');
    
    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obtener valores del formulario
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const nivel = document.getElementById('nivel').value;
            
            // Validación básica
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }
            
            if (password.length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            // Aquí puedes agregar la lógica para enviar los datos al servidor
            console.log('Datos del registro:', {
                nombre,
                email,
                password,
                nivel
            });
            
            alert(`¡Bienvenido ${nombre}! Tu registro ha sido exitoso.`);
            
            // Opcional: redirigir a otra página
            // window.location.href = 'canciones.html';
        });
    }
});
