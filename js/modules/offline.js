function updateOfflineBanner() {
    var banner = document.getElementById('offline-banner');
    if (!banner)
        return;
    var pending = window.ApDb ? window.ApDb.getOfflineQueueCount() : 0;
    if (!navigator.onLine) {
        banner.style.display = 'flex';
        banner.innerHTML = '<span>\uD83D\uDD34 Нет интернета. Данные сохраняются локально.</span>' + (pending ? '<button class="btn btn-sm btn-warning" onclick="window.ApDb.processOfflineQueue()">\uD83D\uDD04 Синхронизировать (' + pending + ')</button>' : '');
    } else if (pending > 0) {
        banner.style.display = 'flex';
        banner.innerHTML = '<span>\uD83D\uDD04 Ожидает синхронизации: ' + pending + ' операций</span>' + '<button class="btn btn-sm btn-primary" onclick="window.ApDb.processOfflineQueue()">Синхронизировать</button>';
    } else {
        banner.style.display = 'none';
    }
}




export { updateOfflineBanner };
