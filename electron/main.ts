import { app, BrowserWindow, protocol, net } from 'electron';
import path from 'path';
import fs from 'fs';

import { registerIpcHandlers } from './ipc';

const OUT_DIR = path.join(__dirname, '../../out');

app.setName('FileSight');
app.setAppUserModelId('com.filesight.app');

const isDev = process.env.NODE_ENV === 'development';

registerSchemes();

let mainWindow: BrowserWindow | null = null;

function registerSchemes(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true,
      },
    },
  ]);
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'FileSight',
    icon: path.join(__dirname, '../assets/icons/filesight.png'),
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools({ mode: 'bottom' });
  } else {
    mainWindow.loadURL('app://-/index.html');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function registerProtocol(): void {
  protocol.handle('app', (request) => {
    const url = new URL(request.url);
    let relativePath = url.pathname.replace(/^\//, '');

    if (!relativePath || relativePath === '/') {
      relativePath = 'index.html';
    } else if (!path.extname(relativePath)) {
      const routeHtml = relativePath + '.html';
      if (fs.existsSync(path.join(OUT_DIR, routeHtml))) {
        relativePath = routeHtml;
      }
    }

    const fullPath = path.join(OUT_DIR, relativePath);
    return net.fetch(`file://${fullPath}`);
  });
}

app.whenReady().then(() => {
  registerProtocol();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
