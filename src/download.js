const { app } = require('electron');
const path = require('path');

function setupDownloadManager(mainWindow) {
    app.on('web-contents-created', (createEvent, contents) => {
        contents.session.on('will-download', (downloadEvent, item) => {
            const downloadPath = path.join(app.getPath('downloads'), item.getFilename());
            item.setSavePath(downloadPath);

            item.once('done', (event, state) => {
                if (state === 'completed' && !mainWindow.isDestroyed()) {
                    mainWindow.flashFrame(true);
                }
            });
        });
    });
}

module.exports = { setupDownloadManager };
