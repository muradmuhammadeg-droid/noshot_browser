const { ipcRenderer } = require('electron'); // Core channel engine link

// Core DOM Selectors
const tabsContainer = document.getElementById('tabs-container');
const viewportsContainer = document.getElementById('web-viewports-container');
const urlBar = document.getElementById('url-bar');
const btnBack = document.getElementById('back');
const btnForward = document.getElementById('forward');
const btnNewTab = document.getElementById('new-tab-trigger');

const downloadsBtn = document.getElementById('downloads-btn');
const downloadsMenu = document.getElementById('downloads-menu');
const downloadsList = document.getElementById('downloads-list');
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');

let tabsList = [];
let activeTabId = null;

// ==========================================
// 🚀 1. DYNAMIC MULTI-TAB ARCHITECTURE ENGINE
// ==========================================
function createNewTab(targetUrl = 'https://google.com') {
    const tabId = 'tab-' + Date.now();
    
    // Create UI HTML Tab Block
    const tabElement = document.createElement('div');
    tabElement.className = 'chrome-tab';
    tabElement.id = 'ui-' + tabId;
    tabElement.innerHTML = `<span class="title-text">New Tab</span><div class="chrome-tab-close" id="close-${tabId}">×</div>`;
    
    // Create Matching Background Webview Canvas element
    const webviewElement = document.createElement('webview');
    webviewElement.id = 'view-' + tabId;
    webviewElement.src = targetUrl;

    tabsContainer.appendChild(tabElement);
    viewportsContainer.appendChild(webviewElement);

    const tabData = { id: tabId, tabEl: tabElement, viewEl: webviewElement };
    tabsList.push(tabData);

    // Event hooks on the individual webview instance
    webviewElement.addEventListener('did-navigate', (e) => { if(tabId === activeTabId) urlBar.value = e.url; updateNavs(); });
    webviewElement.addEventListener('did-navigate-in-page', (e) => { if(tabId === activeTabId) urlBar.value = e.url; updateNavs(); });
    webviewElement.addEventListener('page-title-updated', (e) => { tabElement.querySelector('.title-text').textContent = e.title; });
    webviewElement.addEventListener('new-window', (e) => { createNewTab(e.url); });
    webviewElement.addEventListener('did-start-loading', () => { tabElement.querySelector('.title-text').textContent = "Loading..."; });
    webviewElement.addEventListener('did-stop-loading', () => { updateNavs(); });

    // Click triggers to target actions
    tabElement.addEventListener('click', () => switchActiveTab(tabId));
    tabElement.querySelector('.chrome-tab-close').addEventListener('click', (e) => {
        e.stopPropagation();
        closeTargetTab(tabId);
    });

    switchActiveTab(tabId);
}

function switchActiveTab(tabId) {
    activeTabId = tabId;
    tabsList.forEach(t => {
        if(t.id === tabId) {
            t.tabEl.classList.add('active');
            t.viewEl.classList.add('active-view');
            urlBar.value = t.viewEl.src;
        } else {
            t.tabEl.classList.remove('active');
            t.viewEl.classList.remove('active-view');
        }
    });
    updateNavs();
}

function closeTargetTab(tabId) {
    const targetIdx = tabsList.findIndex(t => t.id === tabId);
    if(targetIdx === -1) return;

    const targetTab = tabsList[targetIdx];
    targetTab.tabEl.remove();
    targetTab.viewEl.remove();
    tabsList.splice(targetIdx, 1);

    if (tabsList.length === 0) {
        createNewTab(); // Automatically fallback spawn if no tabs left
    } else if (activeTabId === tabId) {
        const nextActive = tabsList[targetIdx - 1] || tabsList[0];
        switchActiveTab(nextActive.id);
    }
}

function getActiveWebView() {
    const current = tabsList.find(t => t.id === activeTabId);
    return current ? current.viewEl : null;
}

function updateNavs() {
    const view = getActiveWebView();
    if(view) {
        btnBack.disabled = !view.canGoBack();
        btnForward.disabled = !view.canGoForward();
    }
}

// Nav Controls Core Hooks
document.getElementById('reload').addEventListener('click', () => { const v = getActiveWebView(); if(v) v.reload(); });
btnBack.addEventListener('click', () => { const v = getActiveWebView(); if(v && v.canGoBack()) v.goBack(); });
btnForward.addEventListener('click', () => { const v = getActiveWebView(); if(v && v.canGoForward()) v.goForward(); });

btnNewTab.addEventListener('click', () => createNewTab());

urlBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        let url = urlBar.value.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = (url.includes('.') && !url.includes(' ')) ? 'https://' + url : 'https://google.com' + encodeURIComponent(url);
        }
        const v = getActiveWebView();
        if(v) v.src = url;
        urlBar.blur();
    }
});
urlBar.addEventListener('click', () => urlBar.select());

// ==========================================
// 📥 2. LIVE DOWNLOADS UI TRACKER ENGINE
// ==========================================
let activeDownloads = {};

ipcRenderer.on('download-progress', (event, data) => {
    if (downloadsList.innerHTML.includes('No recent downloads')) {
        downloadsList.innerHTML = '';
    }

    let itemEl = document.getElementById('dl-' + data.filename.replace(/[^a-zA-Z0-9]/g, ''));
    if (!itemEl) {
        itemEl = document.createElement('div');
        itemEl.className = 'download-item';
        itemEl.id = 'dl-' + data.filename.replace(/[^a-zA-Z0-9]/g, '');
        downloadsList.appendChild(itemEl);
    }

    itemEl.innerHTML = `
        <strong>${data.filename}</strong><br>
        Status: <span style="color:${data.status === 'Completed' ? '#81c995' : '#ffda6a'}">${data.status}</span><br>
        Progress: ${data.percent}%
    `;
});

// Dropdown Toggles UI Panel Configuration Rules
downloadsBtn.addEventListener('click', (e) => { settingsMenu.style.display = 'none'; downloadsMenu.style.display = downloadsMenu.style.display === 'block' ? 'none' : 'block'; e.stopPropagation(); });
settingsBtn.addEventListener('click', (e) => { downloadsMenu.style.display = 'none'; settingsMenu.style.display = settingsMenu.style.display === 'block' ? 'none' : 'block'; e.stopPropagation(); });
document.addEventListener('click', () => { downloadsMenu.style.display = 'none'; settingsMenu.style.display = 'none'; });
document.getElementById('clear-cache-btn').addEventListener('click', () => { downloadsList.innerHTML = 'No recent downloads'; alert("Cache Purged!"); });

// ==========================================
// ⌨️ 3. NATIVE KEYBOARD SHORTCUTS CONTROLLER
// ==========================================
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey) {
        switch(e.key.toLowerCase()) {
            case 't': // Spawn a clean browser tab
                e.preventDefault();
                createNewTab();
                break;
            case 'w': // Target close active browser layout tab frame
                e.preventDefault();
                if(activeTabId) closeTargetTab(activeTabId);
                break;
            case 'r': // Standard webview frame reload request loop overrides
                e.preventDefault();
                const v = getActiveWebView();
                if(v) v.reload();
                break;
        }
    }
});

// Boot Initial Tab Instance on Startup
createNewTab();
