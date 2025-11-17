# Dockerfile для Spring Boot Backend

# Stage 1: Build
FROM gradle:8.5-jdk17 AS build
WORKDIR /app

# Копируем gradle файлы
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle

# Скачиваем зависимости (кэшируется отдельно)
RUN gradle dependencies --no-daemon

# Копируем исходный код
COPY src ./src

# Собираем приложение
RUN gradle build --no-daemon -x test

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Копируем собранный jar из build stage
COPY --from=build /app/build/libs/*.jar app.jar

# Создаем директорию для загрузок
RUN mkdir -p /app/uploads

# Переменные окружения
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8083/actuator/health || exit 1

# Expose port
EXPOSE 8083

# Запуск приложения
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
