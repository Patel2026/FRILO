FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm install

COPY . ./
COPY docker-entrypoint.sh /usr/local/bin/frilo-frontend-entrypoint
RUN chmod +x /usr/local/bin/frilo-frontend-entrypoint

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]
