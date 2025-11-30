FROM php:8.3-fpm-alpine

RUN apk add --no-cache git unzip libpq-dev oniguruma-dev icu-dev bash \
 && docker-php-ext-install pdo_pgsql intl mbstring exif pcntl bcmath

RUN apk add --no-cache $PHPIZE_DEPS \
 && pecl install redis \
 && docker-php-ext-enable redis

RUN apk add --no-cache \
    imagemagick \
    imagemagick-dev \
    ghostscript \
    $PHPIZE_DEPS

RUN pecl install imagick \
    && docker-php-ext-enable imagick

RUN sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml \
    || sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF"/' /etc/ImageMagick-7/policy.xml

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
