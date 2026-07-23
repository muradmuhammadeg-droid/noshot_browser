function setupSecurityFilters(mainWindow) {
    // Blocks common tracking and ad domains
    const adDomains = ['*://*.doubleclick.net/*', '*://*://*', '*://*://*'];
    mainWindow.webContents.session.webRequest.onBeforeRequest({ urls: adDomains }, (details, callback) => {
        callback({ cancel: true });
    });

    // Manages device hardware and site permissions
    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        const safePermissions = ['geolocation', 'notifications', 'fullscreen', 'media'];
        callback(safePermissions.includes(permission));
    });
}

module.exports = { setupSecurityFilters };
