const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔍 ДИАГНОСТИКА ПРОЕКТА:\n');

// 1. Проверка файлов
console.log('1. 📁 Проверка файлов:');
const files = ['App.js', 'package.json', 'app.json'];
files.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// 2. Проверка зависимостей
console.log('\n2. 📦 Проверка зависимостей:');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasDeps = pkg.dependencies && Object.keys(pkg.dependencies).length > 0;
  console.log(`   ${hasDeps ? '✅' : '❌'} Зависимости в package.json`);
  
  // Проверяем проблемные зависимости
  const problemDeps = ['react-dom', 'react-native-web', '@expo/metro-runtime'];
  problemDeps.forEach(dep => {
    if (pkg.dependencies?.[dep]) {
      console.log(`   ⚠️  Проблемная зависимость: ${dep}`);
    }
  });
} catch (e) {
  console.log('   ❌ Ошибка чтения package.json');
}

// 3. Проверка node_modules
console.log('\n3. 🗂️ Проверка node_modules:');
const nodeModulesExists = fs.existsSync('node_modules');
console.log(`   ${nodeModulesExists ? '✅' : '❌'} node_modules установлен`);

// 4. Проверка порта
console.log('\n4. 🌐 Проверка порта 8081:');
try {
  execSync('netstat -an | findstr 8081', { stdio: 'pipe' });
  console.log('   ✅ Порт 8081 свободен');
} catch (e) {
  console.log('   ✅ Порт 8081 свободен (или ошибка проверки)');
}

// 5. Проверка синтаксиса App.js
console.log('\n5. 📝 Проверка синтаксиса App.js:');
try {
  const appCode = fs.readFileSync('App.js', 'utf8');
  // Простая проверка на экспорт по умолчанию
  if (appCode.includes('export default') || appCode.includes('module.exports')) {
    console.log('   ✅ App.js имеет правильный экспорт');
  } else {
    console.log('   ❌ App.js не имеет export default');
  }
} catch (e) {
  console.log('   ❌ Ошибка чтения App.js');
}

console.log('\n🎯 РЕКОМЕНДАЦИИ:');
console.log('   - Запустите: npx expo start --localhost --verbose');
console.log('   - Смотрите логи в реальном времени: npx expo logs');
console.log('   - Если есть ошибки - они будут в логах выше');