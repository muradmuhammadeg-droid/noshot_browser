const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Import your custom application modules
const { setupDownloadManager } = require('./download');
const { setupSecurityFilters } = require('./security');
const { setupContextMenu } = require('./menu');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "NoShot Browser",
        icon: path.join(__dirname, '../noshot_browser.ico'), // Double dots look back into the root folder
        webPreferences: {
            nodeIntegration: false,    
            contextIsolation: true,    
            webviewTag: true,           
            blinkFeatures: 'ForceDarkMode' 
        }
    });

    Menu.setApplicationMenu(null); 

    // Initialize our modular components and link them to the active frame
    setupDownloadManager(mainWindow);
    setupSecurityFilters(mainWindow);
    setupContextMenu(mainWindow);

    // Mount the frontend template out of the static assets folder
    mainWindow.loadFile(path.join(__dirname, '../static/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
