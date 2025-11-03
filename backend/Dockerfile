FROM php:8.3-fpm-alpine

RUN apk add --no-cache git unzip libpq-dev oniguruma-dev icu-dev bash \
 && docker-php-ext-install pdo_pgsql intl mbstring exif pcntl bcmath

RUN apk add --no-cache $PHPIZE_DEPS \
 && pecl install redis \
 && docker-php-ext-enable redis \

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
