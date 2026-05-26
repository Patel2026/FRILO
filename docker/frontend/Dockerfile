FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ ./
COPY template/ ./template-source/

COPY docker/frontend/entrypoint.sh /usr/local/bin/frilo-frontend-entrypoint
RUN chmod +x /usr/local/bin/frilo-frontend-entrypoint

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
