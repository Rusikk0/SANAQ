import { DEFAULT_PERMISSIONS } from './constants.js';

let currentStoreId = null;

let confirmCallback = null;

const scanBuffer = '';

const scanLastKey = 0;

const _catDragSrc = null;

const scannerTarget = null;

const scannerActive = false;

const scannerStream = null;

const scannerAnimFrame = null;

const _lastScanTime = 0;

const _scannerAutoClose = false;

const _scanLoopFn = null;

const _pendingPerms = null;

const _pendingMaxDisc = 0;

const _bulkSelected = new Set();

const _currentDocId = null;

const _currentReceiptId = null;

const _currentPrintReceiptId = null;

const _editingDocTemplateIdx = -1;

const _cashierStatsData = null;

const _shiftStatsData = null;

const _templateParentModal = '';

const _autoRefreshInterval = null;

export function setStore(name, value) {
    switch (name) {
        case 'currentStoreId': currentStoreId = value; break;
        case 'confirmCallback': confirmCallback = value; break;
        case 'scanBuffer': scanBuffer = value; break;
        case 'scanLastKey': scanLastKey = value; break;
        case '_catDragSrc': _catDragSrc = value; break;
        case 'scannerTarget': scannerTarget = value; break;
        case 'scannerActive': scannerActive = value; break;
        case 'scannerStream': scannerStream = value; break;
        case 'scannerAnimFrame': scannerAnimFrame = value; break;
        case '_lastScanTime': _lastScanTime = value; break;
        case '_scannerAutoClose': _scannerAutoClose = value; break;
        case '_scanLoopFn': _scanLoopFn = value; break;
        case '_pendingPerms': _pendingPerms = value; break;
        case '_pendingMaxDisc': _pendingMaxDisc = value; break;
    }
}

export { currentStoreId, confirmCallback, scanBuffer, scanLastKey, _catDragSrc, scannerTarget, scannerActive, scannerStream, scannerAnimFrame, _lastScanTime, _scannerAutoClose, _scanLoopFn, _pendingPerms, _pendingMaxDisc, _bulkSelected, _currentDocId, _currentReceiptId, _currentPrintReceiptId, _editingDocTemplateIdx, _cashierStatsData, _shiftStatsData, _templateParentModal, _autoRefreshInterval };
