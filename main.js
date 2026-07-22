const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "NoShot Browser",
        icon: path.join(__dirname, 'noshot_browser.ico'),
        webPreferences: {
            nodeIntegration: false,    
            contextIsolation: true,    
            webviewTag: true,           
            blinkFeatures: 'ForceDarkMode' // Enforces global dark mode rendering engine
        }
    });

    Menu.setApplicationMenu(null); 

    // 📥 CORE FIX: Listen to all active web contents sessions (including guest webviews)
    app.on('web-contents-created', (createEvent, contents) => {
        
        // Target the individual guest webview's session layer directly
        contents.session.on('will-download', (downloadEvent, item, webContents) => {
            
            // Automatically establish save paths to the user's local Downloads path
            const downloadPath = path.join(app.getPath('downloads'), item.getFilename());
            item.setSavePath(downloadPath);

            console.log(`Intercepted WebView Download: ${item.getFilename()}`);

            item.once('done', (event, state) => {
                if (state === 'completed') {
                    console.log('Download successfully completed!');
                    if (!mainWindow.isDestroyed()) {
                        mainWindow.flashFrame(true); // Flashes operating system taskbar highlight
                    }
                } else {
                    console.error(`Download failed or canceled: ${state}`);
                }
            });
        });
    });

    // Hardware Permission Privileges Controller
    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        const safePermissions = ['geolocation', 'notifications', 'fullscreen', 'media'];
        callback(safePermissions.includes(permission));
    });

    // Right-Click Canvas Context Menu Structure
    mainWindow.webContents.on('context-menu', (event, params) => {
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Cut', role: 'cut', enabled: params.editFlags.canCut },
            { label: 'Copy', role: 'copy', enabled: params.editFlags.canCopy },
            { label: 'Paste', role: 'paste', enabled: params.editFlags.canPaste },
            { type: 'separator' },
            { 
                label: 'Inspect Element', 
                click: () => mainWindow.webContents.inspectElement(params.x, params.y) 
            }
        ]);
        contextMenu.popup();
    });

    mainWindow.loadFile('index.html');
}

// System Life Cycles
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
