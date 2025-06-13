# --- Etapa de Build (construcción) ---
# Usamos una imagen oficial de Node.js para construir la aplicación React
FROM node:20-alpine AS build

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos package.json y package-lock.json (o yarn.lock) para instalar dependencias
# Se hace esto en un paso separado para aprovechar el cache de Docker
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copiamos el resto del código de la aplicación
COPY . .

# Construimos la aplicación React para producción
# 'dist' será el directorio de salida por defecto de Vite
RUN npm run build


# --- Etapa de Servido (producción) ---
# Usamos una imagen ligera de Nginx para servir los archivos estáticos de la aplicación
FROM nginx:stable-alpine

# Copiamos la configuración de Nginx personalizada (ver siguiente paso)
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos de la aplicación construida desde la etapa de build al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expone el puerto 80, que es el puerto por defecto de Nginx
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]