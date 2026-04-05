const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const url = require('url');

// Регистрируем протокол как привилегированный до запуска приложения
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
    },
  },
]);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true, // Скрывает меню (File, Edit, View и т.д.)
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Отключаем для работы с удаленным API без CORS
    },
  });

  // Загружаем Angular приложение через custom protocol
  mainWindow.loadURL('app://./index.html');

  // Открываем DevTools
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  // Регистрируем custom protocol для загрузки файлов
  protocol.registerFileProtocol('app', (request, callback) => {
    let filePath = request.url.replace('app://./', '');
    
    // В production файлы находятся в resources/app
    // В development - в ../frontend/dist
    const isDev = !app.isPackaged;
    const basePath = isDev 
      ? path.join(__dirname, '../frontend/dist/frontend/browser')
      : path.join(process.resourcesPath, 'app/frontend/dist/frontend/browser');
    
    filePath = path.normalize(path.join(basePath, filePath));
    callback({ path: filePath });
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
