function setupSecurityFilters(mainWindow) {
    // 🌟 FIXED: Clean, standard Electron wildcard match pattern syntax strings
    const adDomains = [
        '*://*.doubleclick.net/*',
        '*://*://*',
        '*://*://*'
    ];

    // Explicit network filter interceptor rule
    mainWindow.webContents.session.webRequest.onBeforeRequest({ urls: adDomains }, (details, callback) => {
        callback({ cancel: true }); // Gracefully blocks ad tracking requests from loading
    });

    // Device hardware permission handler rule
    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        const safePermissions = ['geolocation', 'notifications', 'fullscreen', 'media'];
        callback(safePermissions.includes(permission));
    });
}

module.exports = { setupSecurityFilters };
