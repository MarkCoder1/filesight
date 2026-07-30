"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const ipc_1 = require("./ipc");
const OUT_DIR = path_1.default.join(__dirname, '../../out');
electron_1.app.setName('FileSight');
electron_1.app.setAppUserModelId('com.filesight.app');
const isDev = process.env.NODE_ENV === 'development';
registerSchemes();
let mainWindow = null;
function registerSchemes() {
    electron_1.protocol.registerSchemesAsPrivileged([
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
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: 'FileSight',
        icon: path_1.default.join(__dirname, '../assets/icons/filesight.png'),
        titleBarStyle: 'hiddenInset',
        trafficLightPosition: { x: 16, y: 16 },
        webPreferences: {
            preload: path_1.default.join(__dirname, 'preload.js'),
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
    }
    else {
        mainWindow.loadURL('app://-/index.html');
    }
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}
function registerProtocol() {
    electron_1.protocol.handle('app', (request) => {
        const url = new URL(request.url);
        let relativePath = url.pathname.replace(/^\//, '');
        if (!relativePath || relativePath === '/') {
            relativePath = 'index.html';
        }
        else if (!path_1.default.extname(relativePath)) {
            const routeHtml = relativePath + '.html';
            if (fs_1.default.existsSync(path_1.default.join(OUT_DIR, routeHtml))) {
                relativePath = routeHtml;
            }
        }
        const fullPath = path_1.default.join(OUT_DIR, relativePath);
        return electron_1.net.fetch(`file://${fullPath}`);
    });
}
electron_1.app.whenReady().then(() => {
    registerProtocol();
    (0, ipc_1.registerIpcHandlers)();
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map