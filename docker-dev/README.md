# Entorno local (Docker) para el prototipo A-Frame

Levanta PHP + MySQL para que `english-vr/VR` funcione completo (login, lista de canciones,
palabras/frases para evaluación, guardar evaluaciones), sin instalar nada en el sistema salvo
Docker Desktop.

## 1. Requisito único: Docker Desktop

Instalar desde https://www.docker.com/products/docker-desktop/, abrirlo una vez (para que acepte
el helper privilegiado) y dejarlo corriendo.

## 2. Levantar el entorno

```bash
cd /Users/home/ARS-test/A-frame/docker-dev
docker compose up -d --build
```

La primera vez, el contenedor `db` importa automáticamente
`Proyecto/BaseDatos/english_vr.sql` (esquema + datos de ejemplo: canciones, frases, palabras,
usuarios, evaluaciones). En arranques siguientes reutiliza el volumen `db-data`, no reimporta.

## 3. Ver la app

http://localhost:8090/A-frame/english-vr/VR/index.html

(reemplaza al `python3 -m http.server 8080` que se usó antes: ese servidor solo servía archivos
estáticos y no podía ejecutar los `.php` del backend, por eso no aparecían las palabras a
evaluar).

## 4. Apagar

```bash
docker compose down       # detiene los contenedores, conserva los datos
docker compose down -v    # además borra el volumen db-data (reset total de la BD)
```

## Notas

- `Proyecto/backend/connDB.php` ahora lee `DB_HOST`/`DB_USER`/`DB_PASS`/`DB_NAME` de variables de
  entorno (con los valores por defecto de XAMPP como fallback), así que este mismo código sigue
  funcionando igual si en el futuro se corre sobre XAMPP en vez de Docker.
- Usuario/contraseña root sin clave es solo para desarrollo local; no exponer este contenedor
  fuera de tu máquina.
