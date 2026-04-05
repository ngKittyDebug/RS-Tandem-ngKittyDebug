# Electron App с Angular Frontend

Десктопное приложение на базе Electron с Angular frontend и удаленным backend сервером.

## Установка

```bash
cd electron-app
npm install
```

## Запуск

1. Убедитесь что Angular приложение собрано с правильным baseHref:
```bash
cd ../frontend
npm run build -- --base-href ./
```

2. Запустите Electron:
```bash
cd ../electron-app
npm start
```

Приложение загрузит Angular из локальных файлов и будет работать с backend сервером по адресу https://meow-vault-pr-216.onrender.com

## Сборка

Для создания установочного файла:
```bash
npm run build
```

## Структура

- `main.js` - главный процесс Electron с custom protocol
- `preload.js` - скрипт предзагрузки
- `package.json` - конфигурация проекта

## Примечания

- Использует custom protocol `app://` для загрузки локальных файлов
- Backend работает на удаленном сервере
- Angular должен быть собран с `--base-href ./`
