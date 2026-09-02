FROM php:8.2-apache

# La app usa mysqli (ver Proyecto/backend/connDB.php)
RUN docker-php-ext-install mysqli

# Evita que warnings de "deprecated" (código escrito para PHP 7.x) se cuelen
# dentro de las respuestas JSON de los endpoints.
COPY php-dev.ini /usr/local/etc/php/conf.d/zz-dev.ini
