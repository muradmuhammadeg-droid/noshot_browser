const { Menu } = require('electron');

function setupContextMenu(mainWindow) {
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
}

module.exports = { setupContextMenu };
