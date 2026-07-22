const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    // 1. Core Browser Window Configuration
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        title: "NoShot Browser",
        icon: path.join(__dirname, 'noshot_browser.ico'),
        webPreferences: {
            nodeIntegration: false,    // Safe architecture for web browsing
            contextIsolation: true,    // Sandbox structure to avoid crashes
            webviewTag: true           // Allows the HTML <webview> to work
        }
    });

    // 2. Remove Default Windows Menu Strip
    Menu.setApplicationMenu(null); 

    // 3. File Download Manager Logic
    mainWindow.webContents.session.on('will-download', (event, item) => {
        // Automatically save files into the system's local Downloads folder
        const downloadPath = path.join(app.getPath('downloads'), item.getFilename());
        item.setSavePath(downloadPath);

        item.once('done', (e, state) => {
            if (state === 'completed') {
                mainWindow.flashFrame(true); // Alert user on taskbar when done
            }
        });
    });

    // 4. Permission Privileges Controller
    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        // Safe permissions allowed natively by default
        const safePermissions = ['geolocation', 'notifications', 'fullscreen', 'media'];
        callback(safePermissions.includes(permission));
    });

    // 5. Right-Click Context Menu Logic
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

    // 6. Mount Frontend Layer
    mainWindow.loadFile('index.html');
}

// App Lifecycles
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
