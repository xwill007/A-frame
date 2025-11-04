export default class FormularioRegistro {
    constructor(container) {
        this.container = container;
    }

    render() {
        const formulario = document.createElement('a-entity');

        const titulo = document.createElement('a-text');
        titulo.setAttribute('value', 'Registro');
        titulo.setAttribute('align', 'center');
        titulo.setAttribute('color', '#FFF');
        titulo.setAttribute('width', '4');
        titulo.setAttribute('position', '0 3.2 0');
        formulario.appendChild(titulo);

        const campos = [
            { label: 'Nombre:', id: 'nombre', position: '0 2.8 0' },
            { label: 'Correo:', id: 'correo', position: '0 2.1 0' },
            { label: 'Contraseña:', id: 'contrasena', position: '0 1.4 0' },
            { label: 'Nivel de inglés:', id: 'nivel', position: '0 0.7 0' },
        ];

        campos.forEach(campo => {
            const label = document.createElement('a-text');
            label.setAttribute('value', campo.label);
            label.setAttribute('color', '#FFF');
            label.setAttribute('width', '4');
            label.setAttribute('position', `-1.5 0 0`);

            const input = document.createElement('a-plane');
            input.setAttribute('id', campo.id);
            input.setAttribute('position', '0 -0.1 0');
            input.setAttribute('width', '3');
            input.setAttribute('height', '0.5');
            input.setAttribute('color', '#007BFF');
            input.setAttribute('shadow', 'cast: true');

            const fieldContainer = document.createElement('a-entity');
            fieldContainer.setAttribute('position', campo.position);
            fieldContainer.appendChild(label);
            fieldContainer.appendChild(input);

            formulario.appendChild(fieldContainer);
        });

        const boton = document.createElement('a-entity');
        boton.setAttribute('position', '0 -0.2 0');

        const botonTexto = document.createElement('a-text');
        botonTexto.setAttribute('value', 'Registrarse');
        botonTexto.setAttribute('align', 'center');
        botonTexto.setAttribute('color', '#FFF');
        botonTexto.setAttribute('width', '4');
        botonTexto.setAttribute('position', '0 0 0');

        const botonPlano = document.createElement('a-plane');
        botonPlano.setAttribute('id', 'submit');
        botonPlano.setAttribute('position', '0 0 0');
        botonPlano.setAttribute('width', '2');
        botonPlano.setAttribute('height', '0.5');
        botonPlano.setAttribute('color', '#0056b3');
        botonPlano.setAttribute('shadow', 'cast: true');

        boton.appendChild(botonTexto);
        boton.appendChild(botonPlano);

        formulario.appendChild(boton);

        this.container.appendChild(formulario);
    }
}
