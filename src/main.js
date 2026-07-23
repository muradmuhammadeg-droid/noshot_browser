const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');

const { setupDownloadManager } = require('./download');
const { setupSecurityFilters } = require('./security');
const { setupContextMenu } = require('./menu');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "NoShot Browser",
        icon: path.join(__dirname, '../noshot_browser.ico'),
        webPreferences: {
            nodeIntegration: true,    // 🌟 Enabled to handle dynamic multi-tab state syncs
            contextIsolation: false,  // 🌟 Set to false to allow IPC communications safely
            webviewTag: true,           
            blinkFeatures: 'ForceDarkMode' 
        }
    });

    Menu.setApplicationMenu(null); 

    // Initialize core subsystems
    setupDownloadManager(mainWindow);
    setupSecurityFilters(mainWindow);
    setupContextMenu(mainWindow);

    mainWindow.loadFile(path.join(__dirname, '../static/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
