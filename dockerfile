# Etapa 1: 'builder' - Compila el código de TypeScript a JavaScript.
# Usamos una imagen de Node.js ligera para mantener los costos de almacenamiento bajos.
# Usar 'node:20-slim' en lugar de 'node:20' reduce el tamaño base de la imagen.
FROM node:20-slim AS builder

WORKDIR /usr/src/app

# Copia solo los archivos de dependencias y las fuentes.
# Este paso minimiza la reconstrucción de la capa 'npm install' si solo cambias el código.
COPY package*.json ./
COPY . .

# Instala TODAS las dependencias, ya que necesitamos 'typescript' para compilar.
# Si tus dependencias no cambian, esta capa se cachea y no se reconstruye.
RUN npm install

# Compila el código de TypeScript.
RUN npm run build

# ---

# Etapa 2: 'production' - Crea la imagen final, más ligera para Cloud Run.
# Usamos la imagen más ligera posible que incluya Node.js para ejecutar la aplicación.
FROM node:20-slim

WORKDIR /usr/src/app

# Copia solo los archivos esenciales de la etapa 'builder'.
# Esto incluye los archivos compilados en 'dist' y el 'package.json' para las dependencias de producción.
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist

# Instala solo las dependencias de producción.
# Esto reduce drásticamente el tamaño de la imagen final, lo cual es clave para el ahorro.
RUN npm install --omit=dev

# Cambia la propiedad de los archivos como usuario 'root'
RUN chown -R node:node /usr/src/app

# Establece el usuario y los permisos de forma no privilegiada.
# Esto es una buena práctica de seguridad que también es recomendada por Cloud Run.
USER node

# Expone el puerto donde tu aplicación escuchará.
EXPOSE 8080

# El comando de inicio debe ser lo más directo posible para iniciar rápidamente.
CMD [ "node", "dist/server.js" ]