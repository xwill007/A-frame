@echo off
setlocal
title English VR - Dev HTTPS

rem ============================================================
rem  English VR - Arranque del entorno de desarrollo (HTTPS)
rem
rem  Levanta, en orden:
rem    1. MariaDB   (XAMPP)  - base de datos english_vr
rem    2. Apache    (XAMPP)  - ejecuta los .php del backend
rem    3. Certificado TLS autofirmado (si no existe)
rem    4. Servidor HTTPS (Node) que sirve el repo y proxea PHP
rem
rem  El servidor HTTPS queda en primer plano: Ctrl+C lo detiene.
rem ============================================================

rem ---------- Rutas ----------
set "XAMPP=D:\PROGRAMAS\xampp"
set "MYSQLD=%XAMPP%\mysql\bin\mysqld.exe"
set "HTTPD=%XAMPP%\apache\bin\httpd.exe"
set "OPENSSL=%XAMPP%\apache\bin\openssl.exe"

rem Raiz servida (D:\APPS\GITHUB): 4 niveles por encima de "scripts"
for %%I in ("%~dp0..\..\..\..") do set "REPO_ROOT=%%~fI"

set "CERTS_DIR=%~dp0certs"
set "CERT_FILE=%CERTS_DIR%\cert.pem"
set "KEY_FILE=%CERTS_DIR%\key.pem"

rem openssl.exe de Apache busca su config en C:\Apache24 por defecto;
rem le indicamos la que trae XAMPP.
set "OPENSSL_CONF=%XAMPP%\apache\conf\openssl.cnf"

rem ---------- Dependencia: Node ----------
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js no esta en el PATH. Instalalo desde https://nodejs.org
    pause
    exit /b 1
)

rem ---------- 1) MariaDB ----------
tasklist /FI "IMAGENAME eq mysqld.exe" 2>nul | find /I "mysqld.exe" >nul
if errorlevel 1 (
    echo [1/3] Iniciando MariaDB...
    start "EnglishVR-MariaDB" /MIN /D "%XAMPP%\mysql\bin" "%MYSQLD%" --defaults-file="%XAMPP%\mysql\bin\my.ini" --standalone
    timeout /t 6 /nobreak >nul
) else (
    echo [1/3] MariaDB ya esta en ejecucion.
)

rem ---------- 2) Apache (PHP) ----------
tasklist /FI "IMAGENAME eq httpd.exe" 2>nul | find /I "httpd.exe" >nul
if errorlevel 1 (
    echo [2/3] Iniciando Apache...
    start "EnglishVR-Apache" /MIN /D "%XAMPP%\apache\bin" "%HTTPD%"
    timeout /t 4 /nobreak >nul
) else (
    echo [2/3] Apache ya esta en ejecucion.
)

rem ---------- 3) Certificado TLS ----------
if not exist "%CERT_FILE%" (
    echo [3/3] Generando certificado autofirmado...
    if not exist "%CERTS_DIR%" mkdir "%CERTS_DIR%"
    "%OPENSSL%" req -x509 -newkey rsa:2048 -nodes -days 3650 -keyout "%KEY_FILE%" -out "%CERT_FILE%" -subj "/CN=localhost" >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] No se pudo generar el certificado TLS. Revisa que openssl exista en XAMPP.
        pause
        exit /b 1
    )
) else (
    echo [3/3] Certificado TLS ya existente.
)

rem ---------- 4) Servidor HTTPS ----------
echo.
echo Iniciando servidor HTTPS...

set "ENV_SERVE_ROOT=%REPO_ROOT%"
set "ENV_HTTPS_PORT=8443"
set "ENV_CERT=%CERT_FILE%"
set "ENV_KEY=%KEY_FILE%"
set "ENV_PHP_HOST=127.0.0.1"
set "ENV_PHP_PORT=80"

node "%~dp0server.js"

echo.
echo El servidor HTTPS se detuvo.
pause
