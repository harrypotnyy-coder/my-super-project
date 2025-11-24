# PowerShell скрипт для исправления ошибки компиляции Kotlin
$filePath = "C:\Users\Administrator\Downloads\my-super-project-main\my-super-project-main\FreshBackend\src\main\kotlin\com\example\probationbackend\controller\TraccarProxyController.kt"

Write-Host "Исправляем файл: $filePath" -ForegroundColor Yellow

# Проверяем существование файла
if (-not (Test-Path $filePath)) {
    Write-Host "Ошибка: Файл не найден!" -ForegroundColor Red
    exit 1
}

# Создаем резервную копию
$backupPath = "$filePath.backup"
Copy-Item $filePath $backupPath -Force
Write-Host "Создана резервная копия: $backupPath" -ForegroundColor Green

# Читаем файл
$content = Get-Content $filePath -Raw -Encoding UTF8

# Исправляем ошибку - заменяем параметризованный тип на простой
$originalPattern = 'Array<Map<String, Any>>::class\.java'
$replacement = 'Array<Any>::class.java'

if ($content -match $originalPattern) {
    $content = $content -replace $originalPattern, $replacement
    Write-Host "Найдено и исправлено: Array<Map<String, Any>>::class.java -> Array<Any>::class.java" -ForegroundColor Green
} else {
    Write-Host "Паттерн не найден. Пробуем альтернативные варианты..." -ForegroundColor Yellow

    # Пробуем другие возможные варианты
    $content = $content -replace 'Array<Map<String,\s*Any>>::class\.java', 'Array<Any>::class.java'
    $content = $content -replace 'Array<LinkedHashMap<\*,\s*\*>>::class\.java', 'Array<Any>::class.java'
}

# Сохраняем исправленный файл
$content | Set-Content $filePath -NoNewline -Encoding UTF8

Write-Host "`nФайл успешно исправлен!" -ForegroundColor Green
Write-Host "Теперь запустите: .\gradlew bootRun" -ForegroundColor Cyan

# Показываем измененные строки
Write-Host "`nПроверяем исправления..." -ForegroundColor Yellow
Get-Content $filePath | Select-String -Pattern "::class\.java" -Context 1,1 | Select-Object -First 5
