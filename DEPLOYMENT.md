# Руководство по развертыванию системы мониторинга осужденных

## Архитектура

Система состоит из следующих компонентов:
- **Frontend**: React приложение на Vite (порт 80 через nginx)
- **Backend**: Spring Boot + Kotlin (порт 8083)
- **Database**: PostgreSQL (порт 5432)
- **Nginx**: Reverse proxy и статический веб-сервер

## Развертывание с Docker Compose

### Предварительные требования

- Docker Engine 20.10+
- Docker Compose 2.0+

### Быстрый старт

1. Соберите и запустите все сервисы:
```bash
docker-compose up -d --build
```

2. Проверьте статус сервисов:
```bash
docker-compose ps
```

3. Просмотр логов:
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f nginx
docker-compose logs -f backend
```

4. Остановка системы:
```bash
docker-compose down
```

5. Полная очистка (включая данные):
```bash
docker-compose down -v
```

## Ручное развертывание

### Backend (Spring Boot)

```bash
cd FreshBackend
./gradlew build
java -jar build/libs/*.jar
```

### Frontend (React + Vite)

```bash
cd svezh
npm install
npm run build
```

### Nginx

1. Установите nginx:
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nginx

# CentOS/RHEL
sudo yum install nginx
```

2. Скопируйте конфигурацию:
```bash
sudo cp nginx.conf /etc/nginx/nginx.conf
```

3. Скопируйте собранный frontend:
```bash
sudo cp -r svezh/dist/* /usr/share/nginx/html/
```

4. Проверьте конфигурацию:
```bash
sudo nginx -t
```

5. Перезапустите nginx:
```bash
sudo systemctl restart nginx
# или
sudo service nginx restart
```

## Конфигурация

### Переменные окружения Backend

Создайте файл `.env` в директории `FreshBackend`:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/probation_db
SPRING_DATASOURCE_USERNAME=probation_user
SPRING_DATASOURCE_PASSWORD=probation_pass
SERVER_PORT=8083
```

### Настройка nginx

Основные параметры в `nginx.conf`:

- **Порт**: По умолчанию 80 (можно изменить в `listen 80;`)
- **Backend URL**: `proxy_pass http://backend:8083/api/;` (замените `backend` на `localhost` при ручной установке)
- **Размер загружаемых файлов**: `client_max_body_size 20M;`

### Настройка HTTPS (опционально)

1. Получите SSL сертификат (Let's Encrypt):
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

2. Или добавьте в `nginx.conf`:
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Остальная конфигурация...
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Тестирование

1. **Проверка frontend**:
```bash
curl http://localhost/
```

2. **Проверка backend API**:
```bash
curl http://localhost/api/health
# или напрямую
curl http://localhost:8083/api/health
```

3. **Проверка базы данных**:
```bash
docker-compose exec postgres psql -U probation_user -d probation_db -c "SELECT 1;"
```

## Мониторинг

### Логи nginx

```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log

# В Docker
docker-compose logs -f nginx
```

### Логи backend

```bash
# В Docker
docker-compose logs -f backend

# Локально
tail -f FreshBackend/logs/spring-boot-application.log
```

## Производительность

### Оптимизация nginx

1. **Увеличение worker connections**:
```nginx
events {
    worker_connections 2048;
}
```

2. **Включение кэширования**:
```nginx
http {
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g;

    location /api/ {
        proxy_cache my_cache;
        proxy_cache_valid 200 10m;
    }
}
```

3. **HTTP/2**:
```nginx
listen 443 ssl http2;
```

### Оптимизация backend

Увеличьте память JVM в `docker-compose.yml`:
```yaml
environment:
  JAVA_OPTS: "-Xmx1024m -Xms512m"
```

## Резервное копирование

### База данных

```bash
# Создание backup
docker-compose exec postgres pg_dump -U probation_user probation_db > backup.sql

# Восстановление
docker-compose exec -T postgres psql -U probation_user -d probation_db < backup.sql
```

### Файлы загрузок

```bash
# Создание backup
docker run --rm --volumes-from probation-backend -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz /app/uploads

# Восстановление
docker run --rm --volumes-from probation-backend -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz
```

## Troubleshooting

### Проблема: Backend не доступен через nginx

1. Проверьте, что backend запущен:
```bash
docker-compose ps backend
```

2. Проверьте логи nginx:
```bash
docker-compose logs nginx | grep error
```

3. Проверьте, что backend отвечает:
```bash
curl http://localhost:8083/api/health
```

### Проблема: Frontend не загружается

1. Проверьте, что файлы собраны:
```bash
ls -la svezh/dist/
```

2. Проверьте права доступа:
```bash
chmod -R 755 svezh/dist/
```

### Проблема: CORS ошибки

Убедитесь, что CORS headers настроены в `nginx.conf` в секции `location /api/`.

## Безопасность

1. **Измените пароли по умолчанию** в `docker-compose.yml`
2. **Используйте HTTPS** в production
3. **Настройте firewall**:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```
4. **Регулярно обновляйте** Docker образы и зависимости

## Контакты и поддержка

Для получения поддержки обратитесь к документации проекта или команде разработки.
