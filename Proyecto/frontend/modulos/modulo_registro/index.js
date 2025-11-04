document.getElementById('registro-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const contrasena = document.getElementById('contrasena').value;
    const nivel = document.getElementById('nivel').value;

    const datos = {
        nombre,
        correo,
        contrasena,
        nivel
    };

    console.log('Datos enviados:', datos);

    alert('Registro exitoso');
});