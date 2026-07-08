(function (global) {
  'use strict';
  var DB_NAME = 'SANAQ_Cache';
  var DB_VERSION = 2;

  function openDB() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('collections')) {
          db.createObjectStore('collections', { keyPath: 'key' });
        }
      };
      req.onsuccess = function (e) { resolve(e.target.result); };
      req.onerror = function (e) { reject(e.target.error); };
    });
  }

  var _dbPromise = null;

  function getDb() {
    if (!_dbPromise) _dbPromise = openDB();
    return _dbPromise;
  }

  function store(key, value) {
    return getDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('cache', 'readwrite');
        tx.objectStore('cache').put({ key: key, value: value, ts: Date.now() });
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function (e) { reject(e.target.error); };
      });
    });
  }

  function load(key) {
    return getDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('cache', 'readonly');
        var req = tx.objectStore('cache').get(key);
        req.onsuccess = function (e) { resolve(e.target.result ? e.target.result.value : null); };
        req.onerror = function (e) { reject(e.target.error); };
      });
    });
  }

  function remove(key) {
    return getDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('cache', 'readwrite');
        tx.objectStore('cache').delete(key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function (e) { reject(e.target.error); };
      });
    });
  }

  function storeCollection(key, items) {
    return getDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('collections', 'readwrite');
        tx.objectStore('collections').put({ key: key, value: items, ts: Date.now() });
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function (e) { reject(e.target.error); };
      });
    });
  }

  function loadCollection(key) {
    return getDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('collections', 'readonly');
        var req = tx.objectStore('collections').get(key);
        req.onsuccess = function (e) { resolve(e.target.result ? e.target.result.value : null); };
        req.onerror = function (e) { reject(e.target.error); };
      });
    });
  }

  function removeCollection(key) {
    return getDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction('collections', 'readwrite');
        tx.objectStore('collections').delete(key);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function (e) { reject(e.target.error); };
      });
    });
  }

  function clearAll() {
    return getDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(['cache', 'collections'], 'readwrite');
        tx.objectStore('cache').clear();
        tx.objectStore('collections').clear();
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function (e) { reject(e.target.error); };
      });
    });
  }

  function estimateSize(key) {
    return load(key).then(function (v) {
      if (v === null) return 0;
      return new Blob([JSON.stringify(v)]).size;
    });
  }

  function estimateCollectionSize(key) {
    return loadCollection(key).then(function (v) {
      if (v === null) return 0;
      return new Blob([JSON.stringify(v)]).size;
    });
  }

  global.ApIndexedDB = {
    store: store,
    load: load,
    remove: remove,
    storeCollection: storeCollection,
    loadCollection: loadCollection,
    removeCollection: removeCollection,
    clearAll: clearAll,
    estimateSize: estimateSize,
    estimateCollectionSize: estimateCollectionSize
  };
})(typeof window !== 'undefined' ? window : globalThis);
