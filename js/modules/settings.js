import { applyUIVisibility, applyUIPosMode, openModal } from './ui.js';
import { currentStoreId } from './store.js';
import { toast } from './notifications.js';
import { closeModal } from './utils.js';

const _uiSettings = null;

function getUISettings() {
    if (_uiSettings) return _uiSettings;
    const v = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('ui_settings') : null;
    if (v && typeof v === 'object') {
        _uiSettings = v;
        return _uiSettings;
    }
    try {
        _uiSettings = JSON.parse(localStorage.getItem('sanaq_ui_settings') || '{}');
    } catch (e) {
        _uiSettings = {};
    }
    return _uiSettings;
}

function saveUISettings() {
    localStorage.setItem('sanaq_ui_settings', JSON.stringify(_uiSettings));
    if (window.ApDb && window.ApDb.setAppData)
        window.ApDb.setAppData('ui_settings', _uiSettings);
}

function applyUISettings() {
    const s = getUISettings();
    const scale = s.scale || 1;
    const cardSize = s.cardSize || 1;
    const cols = s.cols || 4;
    const btnSize = s.buttonSize || 1;
    const colsCss = cols;
    if (window.innerWidth < 768)
        colsCss = Math.min(cols, 3);
    if (window.innerWidth < 480)
        colsCss = Math.min(cols, 2);
    const styleEl = document.getElementById('ui-dynamic-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'ui-dynamic-style';
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = 'html { font-size: ' + 14 * scale + 'px !important; }' + '.card { padding: ' + 20 * cardSize + 'px !important; }' + '.card-value { font-size: ' + 1.8 * cardSize + 'em !important; }' + '.panel { padding: ' + 16 * cardSize + 'px !important; }' + '.modal { padding: ' + 4 * cardSize + 'px !important; }' + '.modal-body { padding: ' + 16 * cardSize + 'px !important; }' + '#pos-products { --grid-cols: ' + colsCss + '; }' + '.btn, button:not(.icon-btn):not(.nav-btn):not(.pos-btm-btn):not(.tab):not(.modal-close) { ' + '  padding: ' + 8 * btnSize + 'px ' + 14 * btnSize + 'px !important; ' + '  font-size: ' + 13 * btnSize + 'px !important; ' + '  border-radius: ' + 6 * btnSize + 'px !important; ' + '}';
    applyUIVisibility();
    applyUIPosMode(s.posMode || 'standard');
}

function openStoreSettings() {
    const ds = window.DataService;
    document.getElementById('store-bin').value = (ds ? ds.getAppData('store_bin') : null) || localStorage.getItem('ap_store_bin') || '';
    document.getElementById('store-address').value = (ds ? ds.getAppData('store_address') : null) || localStorage.getItem('ap_store_address') || '';
    document.getElementById('store-nds-cert').value = (ds ? ds.getAppData('store_nds_cert') : null) || localStorage.getItem('ap_store_nds_cert') || '';
    document.getElementById('store-bank-name').value = (ds ? ds.getAppData('store_bank_name') : null) || localStorage.getItem('ap_store_bank_name') || '';
    document.getElementById('store-iik').value = (ds ? ds.getAppData('store_iik') : null) || localStorage.getItem('ap_store_iik') || '';
    document.getElementById('store-bik').value = (ds ? ds.getAppData('store_bik') : null) || localStorage.getItem('ap_store_bik') || '';
    const savedLimit = (ds ? ds.getAppData('return_limit') : null) || parseInt(localStorage.getItem('sanaq_return_limit_' + (currentStoreId || '')) || '3');
    const limitInput = document.getElementById('setting-return-limit');
    if (limitInput)
        limitInput.value = savedLimit;
    openModal('modal-store-settings');
}

function saveStoreSettings() {
    const ds = window.DataService;
    const bin = document.getElementById('store-bin').value.trim();
    const addr = document.getElementById('store-address').value.trim();
    const nds = document.getElementById('store-nds-cert').value.trim();
    const bank = document.getElementById('store-bank-name').value.trim();
    const iik = document.getElementById('store-iik').value.trim();
    const bik = document.getElementById('store-bik').value.trim();
    const returnLimit = parseInt(document.getElementById('setting-return-limit').value) || 3;
    localStorage.setItem('ap_store_bin', bin);
    localStorage.setItem('ap_store_address', addr);
    localStorage.setItem('ap_store_nds_cert', nds);
    localStorage.setItem('ap_store_bank_name', bank);
    localStorage.setItem('ap_store_iik', iik);
    localStorage.setItem('ap_store_bik', bik);
    try {
        localStorage.setItem('sanaq_return_limit_' + (currentStoreId || ''), returnLimit);
    } catch (e) {
    }
    if (ds) {
        ds.setAppData('store_bin', bin);
        ds.setAppData('store_address', addr);
        ds.setAppData('store_nds_cert', nds);
        ds.setAppData('store_bank_name', bank);
        ds.setAppData('store_iik', iik);
        ds.setAppData('store_bik', bik);
        ds.setAppData('return_limit', returnLimit);
    }
    toast('Настройки сохранены', 'ok');
    closeModal('modal-store-settings');
}

export { _uiSettings, getUISettings, saveUISettings, applyUISettings, openStoreSettings, saveStoreSettings };
