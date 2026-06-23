FROM php:8.2-fpm-alpine

WORKDIR /var/www/html

RUN apk add --no-cache \
    bash \
    curl \
    git \
    icu-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    mysql-client \
    oniguruma-dev \
    unzip \
    zlib-dev \
    freetype-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install \
    bcmath \
    exif \
    gd \
    mbstring \
    opcache \
    pdo_mysql \
    zip

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY backend/ ./
COPY template/ /var/www/html/template-source/
COPY docker/backend/entrypoint.sh /usr/local/bin/frilo-backend-entrypoint

RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader \
 && chmod +x /usr/local/bin/frilo-backend-entrypoint

EXPOSE 9000

CMD ["php-fpm"]
