# Деплой фронта в Docker

## 1. Сборка образа

```bash
# Локально (для тестирования)
docker build -t mts-cloud-frontend:latest .

# Запуск контейнера
docker run -d -p 3000:3000 --name mts-cloud-frontend mts-cloud-frontend:latest
```

Контейнер слушает на порту **3000** и раздаёт статику через nginx.

## 2. Обновление nginx на хосте

На сервере замените `location /` в `/etc/nginx/sites-enabled/*` с заглушки на проксирование:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Затем проверьте и перезагрузите nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 3. Docker Compose (опционально)

Если хотите управлять фронт + бэк + nginx через compose, создайте `docker-compose.yml`:

```yaml
version: '3.9'

services:
  frontend:
    build: ./mts-cloud-website
    container_name: mts-cloud-frontend
    ports:
      - "3000:3000"
    restart: unless-stopped

  backend:
    build: ./spacehack-mts-cloud-backend
    container_name: mts-cloud-backend
    ports:
      - "8080:8080"
    restart: unless-stopped
    # Добавьте env переменные если нужны

  # Nginx на хосте остаётся как есть (слушает 80/443)
```

## 4. Структура на сервере

```
/home/user/docker/
  ├── mts-cloud-website/          # Этот репозиторий с Dockerfile
  ├── spacehack-mts-cloud-backend/ # Backend репозиторий
  └── docker-compose.yml          # Если используете compose
```

Затем:
```bash
cd /home/user/docker
docker-compose up -d
```

## 5. Проверка

```bash
# Логи фронта
docker logs mts-cloud-frontend

# Статус
docker ps

# Тестирование локально
curl http://localhost:3000/
```

## 6. HTTPS/SSL

На хосте остаётся как есть:
- Let's Encrypt сертификаты в nginx
- Nginx проксирует HTTPS запросы → HTTP контейнер (внутри сети)
- Контейнер слушает только 3000 (не нужен SSL)

## Переменные окружения (если нужны)

Если API URL нужно менять — используйте **build args** или **env substitution** в HTML:

```bash
docker build --build-arg API_URL=https://api.example.com .
```

Или просто изменяйте `src/api/client.ts` перед сборкой.
