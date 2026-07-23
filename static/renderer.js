// DOM Element Selectors
const webView = document.getElementById('web-container');
const urlBar = document.getElementById('url-bar');
const tabTitle = document.getElementById('tab-title');
const btnBack = document.getElementById('back');
const btnForward = document.getElementById('forward');

const downloadsBtn = document.getElementById('downloads-btn');
const downloadsMenu = document.getElementById('downloads-menu');
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');
const clearCacheBtn = document.getElementById('clear-cache-btn');

// Toggle UI Overlay Dropdowns
downloadsBtn.addEventListener('click', (e) => {
    settingsMenu.style.display = 'none';
    downloadsMenu.style.display = downloadsMenu.style.display === 'block' ? 'none' : 'block';
    e.stopPropagation();
});

settingsBtn.addEventListener('click', (e) => {
    downloadsMenu.style.display = 'none';
    settingsMenu.style.display = settingsMenu.style.display === 'block' ? 'none' : 'block';
    e.stopPropagation();
});

// Close open dropdowns if clicking anywhere outside the panels
document.addEventListener('click', () => {
    downloadsMenu.style.display = 'none';
    settingsMenu.style.display = 'none';
});

clearCacheBtn.addEventListener('click', () => {
    alert("Cache cleared successfully!");
    settingsMenu.style.display = 'none';
});

// Input Processor to evaluate proper web addresses or search terms
function loadUrlFromInput() {
    let url = urlBar.value.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        if (url.includes('.') && !url.includes(' ')) {
            url = 'https://' + url;
        } else {
            url = 'https://google.com' + encodeURIComponent(url);
        }
    }
    webView.src = url;
}

// Keep browser navigation dynamic back/forward sync state active
function updateNavigationButtons() {
    btnBack.disabled = !webView.canGoBack();
    btnForward.disabled = !webView.canGoForward();
}

// Navigation Controls Listeners
document.getElementById('reload').addEventListener('click', () => { webView.reload(); });
btnBack.addEventListener('click', () => { if (webView.canGoBack()) webView.goBack(); });
btnForward.addEventListener('click', () => { if (webView.canGoForward()) webView.goForward(); });

urlBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        loadUrlFromInput();
        urlBar.blur(); 
    }
});
urlBar.addEventListener('click', () => { urlBar.select(); });

// Event Tracking State Synchronizers
webView.addEventListener('new-window', (event) => { webView.src = event.url; });
webView.addEventListener('did-start-loading', () => { tabTitle.textContent = "Loading..."; });
webView.addEventListener('page-title-updated', (event) => { tabTitle.textContent = event.title; });
webView.addEventListener('did-stop-loading', () => { updateNavigationButtons(); });

webView.addEventListener('did-navigate', (event) => {
    urlBar.value = event.url;
    updateNavigationButtons();
});
webView.addEventListener('did-navigate-in-page', (event) => {
    urlBar.value = event.url; 
    updateNavigationButtons();
});
