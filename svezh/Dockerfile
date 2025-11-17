# Dockerfile для React Frontend (Vite)

# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app

# Установка зависимостей
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Копируем исходный код
COPY . .

# Сборка production версии
RUN npm run build

# Stage 2: Production (nginx)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Удаляем дефолтные файлы nginx
RUN rm -rf ./*

# Копируем собранное приложение из build stage
COPY --from=build /app/dist .

# Копируем конфигурацию nginx для SPA (если нужно)
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Запуск nginx
CMD ["nginx", "-g", "daemon off;"]
