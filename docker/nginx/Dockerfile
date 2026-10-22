FROM nginx:1.30.6-alpine

COPY backend/ /var/www/html/
RUN chmod -R a+rX /var/www/html/public
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
