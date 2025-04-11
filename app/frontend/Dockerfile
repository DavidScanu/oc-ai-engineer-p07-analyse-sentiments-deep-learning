FROM node:20-alpine AS base

WORKDIR /app

# Copier les fichiers nécessaires pour installer les dépendances
COPY package.json package-lock.json* ./
RUN npm ci

# Copier le reste des fichiers
COPY . .

# Construire l'application
RUN npm run build

# Définir les variables d'environnement
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Exposer le port
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]