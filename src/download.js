const { app } = require('electron');
const path = require('path');

function setupDownloadManager(mainWindow) {
    app.on('web-contents-created', (createEvent, contents) => {
        contents.session.on('will-download', (downloadEvent, item) => {
            const downloadPath = path.join(app.getPath('downloads'), item.getFilename());
            item.setSavePath(downloadPath);

            const filename = item.getFilename();

            item.on('updated', (event, state) => {
                if (state === 'progressing' && !mainWindow.isDestroyed()) {
                    const received = item.getReceivedBytes();
                    const total = item.getTotalBytes();
                    const percent = total > 0 ? Math.round((received / total) * 100) : 0;
                    
                    // 🌟 Stream live metrics over to renderer.js
                    mainWindow.webContents.send('download-progress', { filename, percent, status: 'Downloading' });
                }
            });

            item.once('done', (event, state) => {
                if (!mainWindow.isDestroyed()) {
                    if (state === 'completed') {
                        mainWindow.flashFrame(true);
                        mainWindow.webContents.send('download-progress', { filename, percent: 100, status: 'Completed' });
                    } else {
                        mainWindow.webContents.send('download-progress', { filename, percent: 0, status: 'Failed' });
                    }
                }
            });
        });
    });
}

module.exports = { setupDownloadManager };
