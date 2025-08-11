# Usa la imagen oficial de Node.js como base
FROM node:20-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos de configuración de dependencias
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install --only=production

# Copia el código de tu aplicación al contenedor
COPY . .

# Expone el puerto que tu aplicación usa (por defecto 8080 en Cloud Run)
EXPOSE 8080

# Define el comando para iniciar tu aplicación
CMD [ "npm", "start" ]