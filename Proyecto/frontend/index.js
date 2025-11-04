import FormularioRegistro from './modulos/modulo_registro/formularioRegistro.js';

window.addEventListener('DOMContentLoaded', () => {
    const registroEntity = document.getElementById('registro');
    const formulario = new FormularioRegistro(registroEntity, '0 1.5 -6');
    formulario.render();
});