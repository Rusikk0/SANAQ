import { DEFAULT_PERMISSIONS } from './constants.js';


let currentStoreId = null;

let confirmCallback = null;

var scanBuffer = '';

var scanLastKey = 0;

var _catDragSrc = null;

var scannerTarget = null;

var scannerActive = false;

var scannerStream = null;

var scannerAnimFrame = null;

var _lastScanTime = 0;

var _scannerAutoClose = false;

var _scanLoopFn = null;

var _pendingPerms = null;

var _pendingMaxDisc = 0;

var _bulkSelected = new Set();

var _currentDocId = null;

var _currentReceiptId = null;

var _currentPrintReceiptId = null;

var _editingDocTemplateIdx = -1;

var _cashierStatsData = null;

var _shiftStatsData = null;

var _templateParentModal = '';

var _autoRefreshInterval = null;

export { currentStoreId, confirmCallback, scanBuffer, scanLastKey, _catDragSrc, scannerTarget, scannerActive, scannerStream, scannerAnimFrame, _lastScanTime, _scannerAutoClose, _scanLoopFn, _pendingPerms, _pendingMaxDisc, _bulkSelected, _currentDocId, _currentReceiptId, _currentPrintReceiptId, _editingDocTemplateIdx, _cashierStatsData, _shiftStatsData, _templateParentModal, _autoRefreshInterval };
