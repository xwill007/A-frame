import FormularioRegistro from './formularioRegistro.js';

window.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');

    const formularioContainer1 = document.createElement('a-entity');
    const formulario1 = new FormularioRegistro(formularioContainer1, '0 0 -4');
    formulario1.render();
    scene.appendChild(formularioContainer1);

    const inputField = document.getElementById('input-field');

    document.querySelectorAll('[id$="-input"]').forEach(inputPlane => {
        inputPlane.addEventListener('click', () => {
            inputField.style.display = 'block';
            inputField.focus();

            inputField.oninput = () => {
                const textEntity = document.getElementById(`${inputPlane.id.replace('-input', '-text')}`);
                textEntity.setAttribute('value', inputField.value);
            };

            inputField.onblur = () => {
                inputField.style.display = 'none';
            };
        });
    });
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