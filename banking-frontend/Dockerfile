# Etapa 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Etapa 2: Runtime con Nginx
FROM nginx:alpine
# Eliminar archivos por defecto de nginx
RUN rm -rf /usr/share/nginx/html/*
# Copiar archivos de Angular
COPY --from=build /app/dist/banking-frontend/browser /usr/share/nginx/html
# Renombrar index.csr.html a index.html si existe
RUN if [ -f /usr/share/nginx/html/index.csr.html ]; then \
        mv /usr/share/nginx/html/index.csr.html /usr/share/nginx/html/index.html; \
    fi
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
