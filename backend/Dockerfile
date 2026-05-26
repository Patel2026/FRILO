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
COPY . /var/www/html
COPY docker-entrypoint.sh /usr/local/bin/frilo-backend-entrypoint

RUN chmod +x /usr/local/bin/frilo-backend-entrypoint

EXPOSE 8080

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
