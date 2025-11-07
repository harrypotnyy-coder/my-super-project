// Скрипт для проверки сборки без запуска
const fs = require('fs');

console.log('🔍 Проверка проекта...');

// Проверяем основные файлы
const filesToCheck = [
  'App.js',
  'package.json',
  'src/services/api.js',
  'src/screens/LoginScreen.js'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - существует`);
  } else {
    console.log(`❌ ${file} - не найден`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('🎉 Все файлы на месте! Можно тестировать на телефоне.');
  console.log('Запуск: npx expo start --localhost');
} else {
  console.log('⚠️  Некоторые файлы отсутствуют');
}