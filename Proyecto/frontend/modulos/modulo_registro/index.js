import FormularioRegistro from './formularioRegistro.js';

window.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');

    const formularioContainer1 = document.createElement('a-entity');
    const formulario1 = new FormularioRegistro(formularioContainer1, '0 0 -4');
    formulario1.render();
    scene.appendChild(formularioContainer1);
});

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