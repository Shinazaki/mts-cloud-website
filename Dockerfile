# Stage 1: Build React приложения
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package.json package-lock.json ./
RUN npm ci

# Копируем исходники и собираем приложение
COPY . .
RUN npm run build

# Stage 2: Nginx контейнер для раздачи статики
FROM nginx:alpine

# Удаляем default конфиг
RUN rm /etc/nginx/conf.d/default.conf

# Копируем nginx конфиг для контейнера
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Копируем собранное приложение из builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Портом в контейнере будет 3000 (проксируется через основной nginx на хосте)
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
