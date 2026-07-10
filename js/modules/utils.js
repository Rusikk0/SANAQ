import { EAN_PARITY, EAN_L, EAN_G, EAN_R, CODE39, EXCEL_SECTIONS, DEFAULT_PERMISSIONS, PERMISSION_GROUPS } from './constants.js';
import { _pendingPerms, currentStoreId, _bulkSelected, scannerStream, confirmCallback, _scannerAutoClose, setStore } from './store.js';
import { get as ctx } from './app-context.js';
import { getCategories, getCustomers, setCustomers, getDebtors, getExpenses, setExpenses, getProducts, setProducts, getSales } from './api-bridge.js';
import { _auditSession } from './auth.js';
import { _importState, setImportState } from './statistics.js';
import { currentUser } from './users.js';
import { saleCart } from './cart.js';
import { PAY_LABELS, currentPayment, setCurrentPayment } from './sales.js';
import { _discountItemId, setDiscountItemId, _qtyPopupProductId, setQtyPopupProductId } from './products.js';
import { _uiSettings, getUISettings, saveUISettings, applyUISettings } from './settings.js';
import { _pendingSwitchUserId } from './users.js';
import { getPromotions, setPromotions } from './promotions.js';
import { getCustomerTier } from './customers.js';

function wrap(n, fb) { return function () { var s = ctx(n); return s ? s.apply(null, arguments) : (typeof fb === 'function' ? fb.apply(null, arguments) : undefined); }; }

const toast = wrap('toast');
const openModal = wrap('openModal');
const refreshAll = wrap('refreshAll');
const _reopenParentModal = wrap('_reopenParentModal');
const goPage = wrap('goPage');
const renderNotifications = wrap('renderNotifications');
const renderDashboard = wrap('renderDashboard');
const isSaleActive = wrap('isSaleActive');
const togglePaymentSection = wrap('togglePaymentSection');
const calcMixedRemainder = wrap('calcMixedRemainder');
const addAuditLog = wrap('addAuditLog');
const renderAuditSessionTable = wrap('renderAuditSessionTable');
const isExpenseActive = wrap('isExpenseActive');
const renderProducts = wrap('renderProducts');
const renderUnsoldProducts = wrap('renderUnsoldProducts');
const getOpenShiftForCashier = wrap('getOpenShiftForCashier');
const checkPermission = wrap('checkPermission');
const requireAdminPin = wrap('requireAdminPin');
const isAdmin = wrap('isAdmin');
const getUserMaxDiscount = wrap('getUserMaxDiscount');
const _permUserId = wrap('_permUserId');
const getUserData = wrap('getUserData');
const setUserPermissions = wrap('setUserPermissions');
const renderPermissionsEditor = wrap('renderPermissionsEditor');
const doSwitchUser = wrap('doSwitchUser');
const _findUserAnywhere = wrap('_findUserAnywhere');
const getSelectedCartItem = wrap('getSelectedCartItem');
const updateCartQty = wrap('updateCartQty');
const removeFromCart = wrap('removeFromCart');
const renderSaleCart = wrap('renderSaleCart');
const saveUserPin = wrap('saveUserPin');
const getUserPin = wrap('getUserPin');
// onWoSearch, updateAuditQty, switchAuditsTab, switchUnsoldPeriod, stopTracks, focusSearch — defined locally below

function getCurrentStoreName() {
    const m = window.ApAuth && window.ApAuth.getCurrentStore();
    return m ? m.storeName : 'Магазин';
}

function normalizeCode(str) {
    return (str || '').trim().toUpperCase();
}

function levenshtein(a, b) {
    const m = [], i, j;
    for (i = 0; i <= b.length; i++)
        m[i] = [i];
    for (j = 0; j <= a.length; j++)
        m[0][j] = j;
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            m[i][j] = b[i - 1] === a[j - 1] ? m[i - 1][j - 1] : Math.min(m[i - 1][j - 1] + 1, Math.min(m[i][j - 1] + 1, m[i - 1][j] + 1));
        }
    }
    return m[b.length][a.length];
}

function generateSearchVariations(term) {
    const t = term.trim().toLowerCase();
    const results = [t];
    const ruToEn = {
        'й': 'q',
        'ц': 'w',
        'у': 'e',
        'к': 'r',
        'е': 't',
        'н': 'y',
        'г': 'u',
        'ш': 'i',
        'щ': 'o',
        'з': 'p',
        'х': '[',
        'ъ': ']',
        'ф': 'a',
        'ы': 's',
        'в': 'd',
        'а': 'f',
        'п': 'g',
        'р': 'h',
        'о': 'j',
        'л': 'k',
        'д': 'l',
        'ж': ';',
        'э': '\'',
        'я': 'z',
        'ч': 'x',
        'с': 'c',
        'м': 'v',
        'и': 'b',
        'т': 'n',
        'ь': 'm',
        'б': ',',
        'ю': '.',
        'ё': '`',
        ' ': ' '
    };
    const enToRu = {
        'q': 'й',
        'w': 'ц',
        'e': 'у',
        'r': 'к',
        't': 'е',
        'y': 'н',
        'u': 'г',
        'i': 'ш',
        'o': 'щ',
        'p': 'з',
        '[': 'х',
        ']': 'ъ',
        'a': 'ф',
        's': 'ы',
        'd': 'в',
        'f': 'а',
        'g': 'п',
        'h': 'р',
        'j': 'о',
        'k': 'л',
        'l': 'д',
        ';': 'ж',
        '\'': 'э',
        'z': 'я',
        'x': 'ч',
        'c': 'с',
        'v': 'м',
        'b': 'и',
        'n': 'т',
        'm': 'ь',
        ',': 'б',
        '.': 'ю',
        '`': 'ё',
        ' ': ' '
    };
    const hasEnglish = /[a-zA-Z]/.test(t);
    const hasRussian = /[а-яА-ЯёЁ]/.test(t);
    if (hasEnglish && !hasRussian) {
        const translit = '';
        for (var i = 0; i < t.length; i++) {
            translit += enToRu[t[i]] || t[i];
        }
        if (translit !== t)
            results.push(translit);
    }
    if (hasRussian && !hasEnglish) {
        const translit2 = '';
        for (var j = 0; j < t.length; j++) {
            translit2 += ruToEn[t[j]] || t[j];
        }
        if (translit2 !== t)
            results.push(translit2);
    }
    const mixed = '';
    const mixedMap = {
        'c': 'к',
        'e': 'е',
        'o': 'о',
        'a': 'а',
        'k': 'к',
        'm': 'м',
        't': 'т'
    };
    for (var k = 0; k < t.length; k++) {
        mixed += mixedMap[t[k]] || t[k];
    }
    if (mixed !== t)
        results.push(mixed);
    return results;
}

function generateEAN13(seed) {
    const s = String(200000000000 + seed % 99999999999);
    while (s.length < 12)
        s = '0' + s;
    const sum = 0;
    for (var i = 0; i < 12; i++) {
        sum += parseInt(s[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    const check = (10 - sum % 10) % 10;
    return s + check;
}

function drawEan13Svg(text, modW, barH) {
    modW = modW || 2;
    barH = barH || 60;
    const guardH = barH + Math.round(barH * 0.1);
    const digits = String(text).replace(/\D/g, '');
    while (digits.length < 13)
        digits = '0' + digits;
    digits = digits.substring(0, 13);
    const bits = '101';
    const firstDigit = parseInt(digits[0]);
    const parity = EAN_PARITY[firstDigit];
    for (var i = 0; i < 6; i++) {
        const d = parseInt(digits[i + 1]);
        bits += parity[i] === 'L' ? EAN_L[d] : EAN_G[d];
    }
    bits += '01010';
    for (var i = 0; i < 6; i++) {
        const d = parseInt(digits[i + 7]);
        bits += EAN_R[d];
    }
    bits += '101';
    const totalW = bits.length * modW;
    const quiet = modW * 10;
    const svgW = totalW + quiet * 2;
    const svgH = barH + 18;
    const rects = [];
    for (var i = 0; i < bits.length; i++) {
        if (bits[i] === '1') {
            const isGuard = i < 3 || i >= 45 && i < 50 || i >= 92;
            const h = isGuard ? guardH : barH;
            rects.push('<rect x="' + (quiet + i * modW) + '" y="0" width="' + modW + '" height="' + h + '" fill="#000"/>');
        }
    }
    const textY = barH + 10;
    const fontSize = Math.max(8, modW * 6);
    const smallFontSize = Math.max(6, modW * 5);
    const x1 = quiet - modW * 2;
    const leftStart = quiet + 3 * modW;
    const leftSpan = 42 * modW;
    const rightStart = quiet + 50 * modW;
    const rightSpan = 42 * modW;
    const textHtml = '';
    textHtml += '<text x="' + x1 + '" y="' + textY + '" font-size="' + fontSize + '" font-family="Arial,sans-serif" text-anchor="end">' + digits[0] + '</text>';
    for (var i = 0; i < 6; i++) {
        const cx = leftStart + (i * 7 + 3.5) * modW;
        textHtml += '<text x="' + cx + '" y="' + textY + '" font-size="' + smallFontSize + '" font-family="Arial,sans-serif" text-anchor="middle">' + digits[i + 1] + '</text>';
    }
    for (var i = 0; i < 6; i++) {
        const cx = rightStart + (i * 7 + 3.5) * modW;
        textHtml += '<text x="' + cx + '" y="' + textY + '" font-size="' + smallFontSize + '" font-family="Arial,sans-serif" text-anchor="middle">' + digits[i + 7] + '</text>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '" shape-rendering="crispEdges">' + '<rect x="0" y="0" width="' + svgW + '" height="' + svgH + '" fill="#fff"/>' + rects.join('') + textHtml + '</svg>';
}

function drawCode39Svg(text, scale, heightScale) {
    scale = scale || 1;
    heightScale = heightScale || scale;
    const enc = '*' + String(text).toUpperCase().replace(/[^0-9A-Z\-\.\ \$\/\+\%]/g, '') + '*';
    const narrow = 2 * scale, wide = 6 * scale, height = 40 * heightScale, x = 2 * scale, rects = [];
    for (var i = 0; i < enc.length; i++) {
        const pat = CODE39[enc[i]];
        if (!pat)
            continue;
        for (var j = 0; j < 9; j++) {
            const w = pat[j] === 'w' ? wide : narrow;
            if (j % 2 === 0)
                rects.push('<rect x="' + x + '" y="' + 1 * heightScale + '" width="' + w + '" height="' + (height - 2 * heightScale) + '" fill="#000"/>');
            x += w;
        }
        x += narrow;
    }
    const totalW = x + 2 * scale;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + totalW + '" height="' + height + '" viewBox="0 0 ' + totalW + ' ' + height + '" shape-rendering="crispEdges">' + rects.join('') + '</svg>';
}

function updateMarkup() {
    const purchase = parseFloat(document.getElementById('product-purchase').value) || 0;
    const price = parseFloat(document.getElementById('product-price').value) || 0;
    const el = document.getElementById('markup-display');
    if (!el)
        return;
    if (purchase <= 0) {
        el.textContent = price > 0 ? 'Наценка: \u221E' : 'Наценка: \u2014';
        el.style.color = 'var(--muted)';
        return;
    }
    const pct = ((price - purchase) / purchase * 100).toFixed(1);
    const isNeg = pct < 0;
    el.textContent = 'Наценка: ' + (isNeg ? '' : '+') + pct + '%';
    el.style.color = isNeg ? 'var(--err)' : 'var(--ok)';
    el.style.background = isNeg ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.1)';
}

function fmt(n) {
    return (Number(n) || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtShort(n) {
    return (Number(n) || 0).toLocaleString('ru-RU');
}

function fmtDate(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDateTime(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function esc(s) {
    return escapeHtml(s);
}

function todayStr() {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
}

function getFieldValue(obj, field) {
    if (!obj || field == null) return '';
    if (field === '_categoryName') {
        const cat = getCategories().find(c => c.id === obj.category;
        });
        return cat ? cat.name : '';
    }
    if (field === '_status') return obj.status === 'cancelled' || obj.status === 'returned' ? 'Отменён' : 'Активен';
    if (field === '_saleStatus') return isSaleActive(obj) ? 'Завершена' : 'Отменена';
    if (field === '_expenseStatus') return isExpenseActive(obj) ? 'Активен' : 'Отменён';
    if (field === '_docNum') return (obj.receiptId || obj.id || '').slice(-6);
    if (field === '_customerName') {
        if (obj.customerName) return obj.customerName;
        if (obj.customerId) {
            const c = getCustomers().find(x => x.id === obj.customerId;
            });
            return c ? c.name : '';
        }
        return '';
    }
    if (field === '_paymentLabel') return PAY_LABELS[obj.payment] || obj.payment || '';
    if (field === '_docType') return obj.docType === 'invoice' ? 'Счёт' : obj.docType === 'z2' ? 'З-2' : obj.docType || '';
    if (field === '_docStatus') return obj.status === 'pending' ? 'Ожидает' : obj.status === 'paid' ? 'Оплачено' : obj.status === 'issued' ? 'Выписано' : 'Отменено';
    if (field === '_createdByName') return obj.createdByName || obj.userName || '';
    if (field === '_tierName') {
        const t = getCustomerTier(Number(obj.spent) || 0);
        return t ? t.name : '';
    }
    if (field === '_lastPurchase') {
        if (!obj.id) return '';
        const lastSale = getSales().filter(isSaleActive).filter(s => s.customerId === obj.id;
        }).sort(a, b => (b.date || '').localeCompare(a.date || '');
        });
        return lastSale.length ? lastSale[0].date : '';
    }
    if (field === '_debtorPhone' || field === '_debtorRating') {
        const debtors = window.getDebtors ? getDebtors() : [];
        const debtor = debtors.find(d => d.id === obj.debtorId;
        });
        if (field === '_debtorPhone') return debtor ? debtor.phone : '';
        return debtor ? debtor.rating : '';
    }
    if (field === '_profit') return Number(obj.revenue || 0) - Number(obj.cogs || 0);
    if (field === '_share') {
        const share = window._cashierShare || 5;
        return (Number(obj.revenue || 0) * share / 100).toFixed(0);
    }
    if (field === 'supplier') return obj.supplier || '';
    const val = obj[field];
    return val !== null && val !== undefined ? val : '';
}

async function createExcelWorkbook(headers, rows, widths, sheetName, numFmts) {
    if (typeof ExcelJS !== 'undefined') {
        const wb = new ExcelJS.Workbook();
        wb.creator = 'SANAQ';
        wb.created = new Date();
        const ws = wb.addWorksheet(sheetName || 'Данные', { views: [{ showGridLines: false }] });
        ws.properties.defaultRowHeight = 20;
        const headerStyle = {
            font: {
                name: 'Arial',
                size: 10,
                bold: true,
                color: { argb: 'FFFFFFFF' }
            },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1F2937' }
            },
            alignment: {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true
            },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };
        const headerRow = ws.addRow(headers);
        headerRow.height = 28;
        headerRow.eachCell(function (cell) {
            styleExcelCell(cell, headerStyle);
        });
        const alt = false;
        rows.forEach(rowData => {
            const row = ws.addRow(rowData);
            row.eachCell(function (cell, colIdx) {
                const fmt = numFmts && numFmts[colIdx - 1];
                const isNum = fmt === '#,##0' || fmt === '#,##0.00' || fmt === '#,##0.0';
                styleExcelCell(cell, {
                    font: {
                        name: 'Arial',
                        size: 10
                    },
                    alignment: {
                        vertical: 'middle',
                        wrapText: true,
                        horizontal: isNum ? 'right' : 'left'
                    },
                    fill: alt ? {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF9FAFB' }
                    } : {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFFFF' }
                    },
                    border: {
                        top: {
                            style: 'thin',
                            color: { argb: 'FFE5E7EB' }
                        },
                        left: {
                            style: 'thin',
                            color: { argb: 'FFE5E7EB' }
                        },
                        bottom: {
                            style: 'thin',
                            color: { argb: 'FFE5E7EB' }
                        },
                        right: {
                            style: 'thin',
                            color: { argb: 'FFE5E7EB' }
                        }
                    }
                });
                if (fmt && fmt.indexOf('dd.') !== 0 && fmt !== 's') {
                    cell.numFmt = fmt;
                }
            });
            alt = !alt;
        });
        widths.forEach(w, i => {
            ws.getColumn(i + 1).width = w;
        });
        const buffer;
        try { buffer = await wb.xlsx.writeBuffer(); } catch (e) { throw new Error('Excel write failed: ' + e.message); }
        return buffer;
    }
    if (typeof XLSX !== 'undefined') {
        const data = [headers].concat(rows);
        const ws2 = XLSX.utils.aoa_to_sheet(data);
        ws2['!cols'] = widths.map(w => { wch: w };
        });
        const wb2 = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb2, ws2, sheetName || 'Данные');
        const out = XLSX.write(wb2, {
            bookType: 'xlsx',
            type: 'buffer'
        });
        return out;
    }
    throw new Error('Excel библиотеки не загружены');
}

function styleExcelCell(cell, opts) {
    if (opts.font)
        cell.font = opts.font;
    if (opts.fill)
        cell.fill = opts.fill;
    if (opts.alignment)
        cell.alignment = opts.alignment;
    if (opts.border)
        cell.border = opts.border;
    if (opts.numFmt)
        cell.numFmt = opts.numFmt;
}

function saveExcelBuffer(buffer, filename) {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function downloadExcelTemplate(section) {
    const cfg = EXCEL_SECTIONS[section];
    if (!cfg) {
        toast('Неизвестный раздел', 'err');
        return;
    }
    const emptyRow = cfg.fields.map( => '';
    });
    try {
        const buffer = await createExcelWorkbook(cfg.headers, [emptyRow], cfg.widths, cfg.label);
        saveExcelBuffer(buffer, 'Шаблон_' + cfg.label + '_' + todayStr() + '.xlsx');
        toast('Шаблон скачан', 'ok');
    } catch (e) { toast('Ошибка скачивания шаблона: ' + e.message, 'err'); }
}

function readExcelFile(file, section) {
    if (!file)
        return;
    if (_importState && _importState.section) {
        toast('Импорт уже выполняется. Дождитесь завершения.', 'err');
        return;
    }
    const cfg = EXCEL_SECTIONS[section];
    if (!cfg) {
        toast('Неизвестный раздел', 'err');
        return;
    }
    setImportState({ section: section, rawData: null, colMap: null, rows: null, fileName: file.name });
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const opts = { type: 'array' };
            const name = file.name.toLowerCase();
            if (name.endsWith('.csv')) {
                const text = new TextDecoder('utf-8').decode(e.target.result);
                const wb = XLSX.read(text, {
                    type: 'string',
                    raw: true
                });
            } else {
                const wb = XLSX.read(e.target.result, opts);
            }
            const ws = wb.Sheets[wb.SheetNames[0]];
            if (!ws) {
                toast('Файл не содержит листов', 'err');
                _importState.section = null;
                return;
            }
            const raw = XLSX.utils.sheet_to_json(ws, {
                header: 1,
                defval: ''
            });
            if (raw.length < 2) {
                toast('Файл не содержит данных', 'err');
                _importState.section = null;
                return;
            }
            showImportPreview(section, raw, file.name);
        } catch (err) {
            toast('Ошибка чтения файла: ' + (err.message || err), 'err');
            _importState.section = null;
        }
    };
    if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function showImportPreview(section, rawData, fileName) {
    const cfg = EXCEL_SECTIONS[section];
    if (!cfg) {
        _importState.section = null;
        return;
    }
    const headers = rawData[0] || [];
    const dataRows = rawData.slice(1).filter(r => r.some(c => c !== '';
        });
    });
    if (dataRows.length === 0) {
        toast('Нет данных для импорта', 'err');
        _importState.section = null;
        return;
    }
    const colMap = {};
    const missing = [];
    cfg.fields.forEach(field => {
        const fieldIdx = cfg.fields.indexOf(field);
        if (fieldIdx < 0)
            return;
        const expected = cfg.headers[fieldIdx] || '';
        const hdrIdx = -1;
        headers.forEach(h, i => {
            if (String(h).toLowerCase().trim() === expected.toLowerCase().trim())
                hdrIdx = i;
        });
        if (hdrIdx < 0) {
            headers.forEach(h, i => {
                if (hdrIdx >= 0)
                    return;
                if (String(h).toLowerCase().indexOf(expected.toLowerCase().slice(0, 4)) >= 0)
                    hdrIdx = i;
            });
        }
        if (hdrIdx >= 0)
            colMap[field] = hdrIdx;
    });
    cfg.required.forEach(field => {
        if (colMap[field] === undefined)
            missing.push(cfg.headers[cfg.fields.indexOf(field)] || field);
    });
    if (missing.length) {
        toast('Не найдены обязательные колонки: ' + missing.join(', '), 'err');
        return;
    }
    setImportState({
        section: section,
        rawData: rawData,
        colMap: colMap,
        headers: headers,
        rows: dataRows,
        fileName: fileName
    });
    const previewHtml = '<div style="max-height:400px;overflow-y:auto">';
    previewHtml += '<table><thead><tr>';
    cfg.headers.forEach(h => {
        previewHtml += '<th>' + escapeHtml(h) + '</th>';
    });
    previewHtml += '</tr></thead><tbody>';
    const maxPreview = Math.min(dataRows.length, 20);
    for (var i = 0; i < maxPreview; i++) {
        previewHtml += '<tr>';
        cfg.fields.forEach(field => {
            const colIdx = colMap[field];
            previewHtml += '<td>' + escapeHtml(colIdx >= 0 ? dataRows[i][colIdx] : '') + '</td>';
        });
        previewHtml += '</tr>';
    }
    if (dataRows.length > maxPreview)
        previewHtml += '<tr><td colspan="' + cfg.headers.length + '" style="text-align:center;color:var(--muted)">... и ещё ' + (dataRows.length - maxPreview) + ' строк</td></tr>';
    previewHtml += '</tbody></table></div>';
    document.getElementById('import-preview-title').textContent = 'Импорт: ' + cfg.label;
    document.getElementById('import-preview-info').textContent = 'Файл: ' + fileName + ' | Найдено строк: ' + dataRows.length;
    document.getElementById('import-preview-table').innerHTML = previewHtml;
    document.getElementById('import-preview-confirm').onclick = function () {
        confirmImport();
    };
    openModal('modal-import-preview');
}

function confirmImport() {
    const state = _importState;
    if (!state || !state.section) {
        toast('Нет данных для импорта', 'err');
        return;
    }
    const cfg = EXCEL_SECTIONS[state.section];
    if (!cfg)
        return;
    const colMap = state.colMap;
    const dataRows = state.rows;
    const success = 0, errors = 0;
    dataRows.forEach(row => {
        try {
            const item = {};
            Object.keys(colMap).forEach(field => {
                const colIdx = colMap[field];
                if (colIdx >= 0)
                    item[field] = row[colIdx] !== undefined && row[colIdx] !== null ? String(row[colIdx]).trim() : '';
            });
            if (state.section === 'products') {
                if (!item.barcode && !item.code && !item.name) {
                    errors++;
                    return;
                }
                const existing = getProducts();
                const dup = null;
                if (item.barcode)
                    dup = existing.find(p => p.barcode === item.barcode;
                    });
                if (!dup && item.code)
                    dup = existing.find(p => p.code === item.code;
                    });
                if (dup) {
                    if (item.name)
                        dup.name = item.name;
                    if (item.category)
                        dup.category = item.category;
                    if (item.unit)
                        dup.unit = item.unit;
                    if (item.quantity !== '')
                        dup.quantity = Number(item.quantity) || 0;
                    if (item.price !== '')
                        dup.price = Number(item.price) || 0;
                    if (item.purchasePrice !== '')
                        dup.purchasePrice = Number(item.purchasePrice) || 0;
                    if (item.minStock !== '')
                        dup.minStock = Number(item.minStock) || 0;
                    if (item.supplier)
                        dup.supplier = item.supplier;
                    if (item.description)
                        dup.description = item.description;
                    if (item.barcode)
                        dup.barcode = item.barcode;
                    if (item.code)
                        dup.code = item.code;
                    setProducts(existing);
                } else {
                    existing.push({
                        id: uid(),
                        barcode: item.barcode || '',
                        code: item.code || '',
                        name: item.name || '',
                        category: item.category || '',
                        unit: item.unit || 'шт',
                        quantity: Number(item.quantity) || 0,
                        minStock: Number(item.minStock) || 0,
                        purchasePrice: Number(item.purchasePrice) || 0,
                        price: Number(item.price) || 0,
                        supplier: item.supplier || '',
                        description: item.description || '',
                        favorite: false
                    });
                    setProducts(existing);
                }
                success++;
            } else if (state.section === 'customers') {
                if (!item.phone) {
                    errors++;
                    return;
                }
                const customers = getCustomers();
                const dupC = customers.find(c => (c.phone || '').replace(/\D/g, '') === item.phone.replace(/\D/g, '');
                });
                if (!dupC) {
                    customers.push({
                        id: uid(),
                        name: item.name || '',
                        phone: item.phone,
                        spent: 0,
                        bonusBalance: 0
                    });
                    setCustomers(customers);
                }
                success++;
            } else if (state.section === 'expenses') {
                if (!item.category || !item.amount) {
                    errors++;
                    return;
                }
                const expenses = getExpenses();
                expenses.push({
                    id: uid(),
                    category: item.category,
                    amount: Number(item.amount),
                    date: new Date().toISOString(),
                    description: item.description || '',
                    userName: currentUser ? currentUser.name : '',
                    status: 'active'
                });
                setExpenses(expenses);
                success++;
            } else {
                toast('Импорт для раздела "' + cfg.label + '" в разработке', 'warn');
                return;
            }
        } catch (e) {
            errors++;
        }
    });
    closeModal('modal-import-preview');
    toast('Импорт завершён: ' + success + ' успешно' + (errors ? ', ' + errors + ' ошибок' : ''), errors ? 'warn' : 'ok');
    refreshAll();
    setImportState({
        section: null,
        rawData: null,
        rows: null
    });
}

function isToday(iso) {
    return iso && iso.slice(0, 10) === todayStr();
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
    if (id === 'modal-confirm') {
        document.getElementById('confirm-ok').textContent = 'Удалить';
        document.getElementById('confirm-ok').className = 'btn btn-danger';
    }
    if (id === 'modal-doc-templates' && typeof _reopenParentModal === 'function') {
        _reopenParentModal();
    }
}

function toggleSidebar() {
    const s = document.querySelector('.sidebar');
    const btn = document.getElementById('sidebar-collapse-btn');
    if (!s)
        return;
    s.classList.toggle('collapsed');
    const collapsed = s.classList.contains('collapsed');
    if (btn)
        btn.innerHTML = collapsed ? '<i data-lucide="panel-left"></i>' : '<i data-lucide="panel-left-close"></i>';
    if (typeof lucide !== 'undefined')
        lucide.createIcons();
    if (window.ApDb)
        window.ApDb.set('sidebarCollapsed', collapsed);
}

function toggleDashLowStock() {
    const el = document.getElementById('dash-lowstock');
    const btn = document.querySelector('#panel-dash-lowstock .collapse-btn');
    if (!el)
        return;
    const hidden = el.style.display === 'none';
    el.style.display = hidden ? '' : 'none';
    if (btn)
        btn.innerHTML = hidden ? '\u25B2' : '\u25BC';
    if (window.ApDb)
        window.ApDb.set('dashLowStockHidden', !hidden);
}

function confirmAction(title, msg, onOk) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').textContent = msg;
    setStore('confirmCallback', onOk);
    openModal('modal-confirm');
}

function showSupabaseLogin() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    window.ApScreens.showScreen('auth-login');
}

function getPeriodDateRange(period) {
    const now = new Date();
    const start;
    if (period === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
        const d = now.getDay();
        const diff = d === 0 ? 6 : d - 1;
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
    } else if (period === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
        start = new Date(0);
    }
    return {
        start: start,
        end: now
    };
}

function filterByPeriod(arr, dateField, period) {
    if (period === 'all') return arr;
    const range = getPeriodDateRange(period);
    return (arr || []).filter(function (x) {
        const d = new Date(x[dateField] || x.date || 0);
        return d >= range.start && d <= range.end;
    });
}

function card(label, value, cls) {
    return '<div class="card ' + cls + '"><div class="card-label">' + label + '</div><div class="card-value">' + value + '</div></div>';
}

function finCard(label, value, cls) {
    return '<div class="card ' + cls + '" style="text-align:center"><div class="card-label">' + label + '</div><div style="font-size:20px;font-weight:700;margin-top:8px">' + value + '</div></div>';
}

function setPayment(btn) {
    document.querySelectorAll('.pay-btn, .pos-pay-btn, .pos-pay-strip button').forEach(b => {
        b.classList.remove('active');
    });
    btn.classList.add('active');
    setCurrentPayment(btn.dataset.pay);
    togglePaymentSection('cash-change-wrap', currentPayment === 'cash');
    togglePaymentSection('mixed-payment-wrap', currentPayment === 'mixed');
    togglePaymentSection('debt-payment-wrap', currentPayment === 'debt');
    const totalEl = document.getElementById('sale-total');
    const finalTotal = totalEl ? parseFloat(totalEl.dataset.value || totalEl.value || 0) : 0;
    if (currentPayment === 'cash') {
        const cg = document.getElementById('cash-given');
        if (cg)
            cg.value = '';
        const cc = document.getElementById('cash-change');
        if (cc)
            cc.value = '';
    }
    if (currentPayment === 'mixed') {
        const mc = document.getElementById('mixed-cash');
        const mk = document.getElementById('mixed-kaspi');
        const mt = document.getElementById('mixed-transfer');
        const mcg = document.getElementById('mixed-cash-given');
        const mcc = document.getElementById('mixed-cash-change');
        if (mc)
            mc.value = finalTotal;
        if (mk)
            mk.value = 0;
        if (mt)
            mt.value = 0;
        if (mcg)
            mcg.value = '';
        if (mcc)
            mcc.value = '';
        calcMixedRemainder();
    }
}

function adjustSelectedQty(delta) {
    const item = getSelectedCartItem();
    if (!item) {
        toast('Выберите товар в таблице', 'warn');
        return;
    }
    updateCartQty(item.id, delta);
}

function removeSelectedItem() {
    const item = getSelectedCartItem();
    if (!item) {
        toast('Выберите товар в таблице', 'warn');
        return;
    }
    if (!confirm('Удалить "' + item.name + '" из чека?'))
        return;
    removeFromCart(item.id);
}

function checkSelectedPrice() {
    const item = getSelectedCartItem();
    if (!item) {
        toast('Выберите товар в таблице', 'warn');
        return;
    }
    toast('\uD83D\uDCB0 ' + item.name + ': ' + fmt(item.price) + ' \u20B8 \xD7 ' + item.qty + ' = ' + fmt(item.price * item.qty) + ' \u20B8', 'ok');
}

function focusSearch() {
    const el = document.getElementById('sale-search');
    if (el) {
        el.focus();
        el.select();
    }
}

function toggleFavoriteFromTable(productId, e) {
    if (e)
        e.stopPropagation();
    const products = getProducts();
    const p = products.find(x => x.id === productId;
    });
    if (!p)
        return;
    p.favorite = !p.favorite;
    setProducts(products);
    renderProducts();
    posRefreshFavorites();
}

function posRefreshFavorites() {
    const grid = document.getElementById('pos-fav-grid');
    if (!grid)
        return;
    const favs = getProducts().filter(p => p.favorite;
    });
    if (!favs.length) {
        grid.innerHTML = '<div style="font-size:12px;color:#9ca3af;text-align:center;padding:8px">Нет быстрых товаров</div>';
    } else {
        grid.innerHTML = favs.map(p => '<div class="pos-quick-item" onclick="addToCart(\'' + p.id + '\')">' + esc(p.name) + '<div class="qp-price">' + fmt(p.price) + '</div></div>';
        }).join('');
    }
}

function openPaymentModal() {
    if (!saleCart.length) {
        toast('Корзина пуста', 'err');
        return;
    }
    const shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    if (!shift) {
        toast('Смена (касса) не открыта. Сначала откройте смену.', 'err');
        goPage('myshift');
        return;
    }
    const totalEl = document.getElementById('sale-total');
    const total = totalEl ? parseFloat(totalEl.dataset.value || totalEl.value || 0) : 0;
    if (total <= 0) {
        toast('Сумма чека 0', 'err');
        return;
    }
    const payBtns = document.querySelectorAll('#modal-pos-payment .pos-pay-strip button');
    if (payBtns.length) {
        setPayment(payBtns[0]);
    }
    openModal('modal-pos-payment');
    setTimeout(function () {
        const cg = document.getElementById('cash-given');
        if (cg)
            cg.focus();
    }, 200);
}

function openItemDiscount(cartItemId) {
    setDiscountItemId(cartItemId);
    const item = saleCart.find(c => c.id === cartItemId;
    });
    if (!item) {
        toast('Товар не найден', 'err');
        return;
    }
    document.getElementById('item-discount-product').textContent = 'Товар: ' + item.name;
    document.getElementById('item-discount-type').value = 'percent';
    document.getElementById('item-discount-value').value = '';
    document.getElementById('item-discount-reason').value = '';
    toggleItemDiscountValue();
    function doOpen() {
        openModal('modal-item-discount');
        setTimeout(function () {
            document.getElementById('item-discount-value').focus();
        }, 200);
    }
    if (!checkPermission('canManualItemDiscount')) {
        requireAdminPin('Ручная скидка на товар (нет прав)', doOpen);
    } else {
        doOpen();
    }
}

function toggleItemDiscountValue() {
    const type = document.getElementById('item-discount-type').value;
    const input = document.getElementById('item-discount-value');
    if (type === 'percent') {
        input.max = 100;
        input.placeholder = 'Например: 10';
    } else {
        input.max = 999999;
        input.placeholder = 'Например: 500';
    }
}

function applyItemDiscount() {
    const type = document.getElementById('item-discount-type').value;
    const value = parseFloat(document.getElementById('item-discount-value').value);
    const reason = document.getElementById('item-discount-reason').value.trim();
    if (!value || value <= 0) {
        toast('Введите значение скидки', 'err');
        return;
    }
    const item = saleCart.find(c => c.id === _discountItemId;
    });
    if (!item) {
        toast('Товар не найден', 'err');
        return;
    }
    const maxAllowed = isAdmin() ? 25 : getUserMaxDiscount(currentUser.id);
    const effectiveDisc = type === 'percent' ? value : value / item.price * 100;
    if (effectiveDisc > 25) {
        toast('Максимальная скидка в системе \u2014 25%', 'err');
        return;
    }
    if (effectiveDisc > maxAllowed) {
        requireAdminPin('Скидка ' + effectiveDisc.toFixed(0) + '% превышает лимит (' + maxAllowed + '%)', function () {
            item.discount = type === 'percent' ? item.price * value / 100 : value;
            item.discountReason = reason;
            item.discountType = type;
            item.discountValue = value;
            closeModal('modal-item-discount');
            renderSaleCart();
            addAuditLog('Ручная скидка на товар', item.name + ': -' + value + (type === 'percent' ? '%' : '\u20B8') + (reason ? ' (' + reason + ')' : ''), '\uD83C\uDFF7');
            toast('Скидка применена', 'ok');
        });
        return;
    }
    item.discount = type === 'percent' ? item.price * value / 100 : value;
    item.discountReason = reason;
    item.discountType = type;
    item.discountValue = value;
    closeModal('modal-item-discount');
    renderSaleCart();
    addAuditLog('Ручная скидка на товар', item.name + ': -' + value + (type === 'percent' ? '%' : '\u20B8') + (reason ? ' (' + reason + ')' : ''), '\uD83C\uDFF7');
    toast('Скидка применена на ' + item.name, 'ok');
}

function stopTracks(stream) {
    try {
        stream.getTracks().forEach(t => {
            t.stop();
        });
    } catch (e) {
    }
}

function switchUnsoldPeriod(days) {
    document.querySelectorAll('[data-unsold]').forEach(b => {
        b.classList.toggle('active', parseInt(b.dataset.unsold) === days);
    });
    renderUnsoldProducts(days);
}

function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

function switchAuditsTab(tab) {
    document.querySelectorAll('#page-audits .tabs .tab').forEach(b => {
        b.classList.toggle('active', b.dataset.atab === tab);
    });
    const wo = document.getElementById('atab-writeoffs');
    const rec = document.getElementById('atab-reconciliation');
    if (wo)
        wo.classList.toggle('hidden', tab !== 'writeoffs');
    if (rec)
        rec.classList.toggle('hidden', tab !== 'reconciliation');
}

function onWoSearch() {
    const q = document.getElementById('wo-product-search').value.trim().toLowerCase();
    const results = document.getElementById('wo-search-results');
    if (!q || q.length < 1) {
        results.classList.add('hidden');
        return;
    }
    const products = getProducts().filter(p => p.name.toLowerCase().indexOf(q) >= 0 || (p.code || '').toLowerCase().indexOf(q) >= 0 || (p.barcode || '').indexOf(q) >= 0;
    }).slice(0, 10);
    if (!products.length) {
        results.innerHTML = '<div class="sale-result-item" style="color:var(--muted)">Ничего не найдено</div>';
        results.classList.remove('hidden');
        return;
    }
    results.innerHTML = products.map(p => '<div class="sale-result-item" onclick="selectWoProduct(\'' + p.id + '\')">' + '<span class="code-tag">' + (p.code || '') + '</span> ' + p.name + ' <span style="color:var(--muted);font-size:12px">(ост: ' + p.quantity + ')</span></div>';
    }).join('');
    results.classList.remove('hidden');
}

function updateAuditQty(idx, val) {
    if (!_auditSession)
        return;
    _auditSession.items[idx].qtyFact = parseFloat(val) || 0;
    renderAuditSessionTable();
}

function tableHTML(headers, rows) {
    let h = '<table><thead><tr>';
    headers.forEach(c => {
        h += '<th>' + c + '</th>';
    });
    h += '</tr></thead><tbody>';
    rows.forEach(row => {
        h += '<tr>';
        row.forEach(c => {
            h += '<td>' + c + '</td>';
        });
        h += '</tr>';
    });
    return h + '</tbody></table>';
}

function showPaymentMethodModal(callback) {
    const existing = document.getElementById('payment-method-modal');
    if (existing)
        existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'payment-method-modal';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = '<div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:24px 32px;box-shadow:0 8px 30px rgba(0,0,0,0.3);max-width:400px;width:90%">' + '<div style="font-size:16px;font-weight:600;margin-bottom:16px">Выберите способ оплаты</div>' + '<div style="display:flex;flex-direction:column;gap:8px">' + '<button class="btn btn-success btn-lg" onclick="window.selectPaymentMethod(\'cash\')" style="padding:14px;font-size:16px">\uD83D\uDCB5 Наличные</button>' + '<button class="btn btn-lg" onclick="window.selectPaymentMethod(\'kaspi\')" style="padding:14px;font-size:16px;background:#E53935;color:#fff">\uD83D\uDCF1 Kaspi QR</button>' + '<button class="btn btn-primary btn-lg" onclick="window.selectPaymentMethod(\'transfer\')" style="padding:14px;font-size:16px">\uD83C\uDFE6 Банк</button>' + '</div>' + '<button class="btn btn-secondary" style="width:100%;margin-top:12px" onclick="document.getElementById(\'payment-method-modal\').remove()">Отмена</button>' + '</div>';
    document.body.appendChild(overlay);
    window.selectPaymentMethod = function (method) {
        document.getElementById('payment-method-modal').remove();
        delete window.selectPaymentMethod;
        callback(method);
    };
}

function classicAmountWords(n) {
    const w = Math.floor(Math.abs(n || 0));
    const units = [
        '',
        'один',
        'два',
        'три',
        'четыре',
        'пять',
        'шесть',
        'семь',
        'восемь',
        'девять'
    ];
    const teens = [
        'десять',
        'одиннадцать',
        'двенадцать',
        'тринадцать',
        'четырнадцать',
        'пятнадцать',
        'шестнадцать',
        'семнадцать',
        'восемнадцать',
        'девятнадцать'
    ];
    const tens = [
        '',
        '',
        'двадцать',
        'тридцать',
        'сорок',
        'пятьдесят',
        'шестьдесят',
        'семьдесят',
        'восемьдесят',
        'девяносто'
    ];
    const hundreds = [
        '',
        'сто',
        'двести',
        'триста',
        'четыреста',
        'пятьсот',
        'шестьсот',
        'семьсот',
        'восемьсот',
        'девятьсот'
    ];
    function numWords(num) {
        if (num === 0) return '';
        const res = '';
        if (num >= 1000) {
            res += numWords(Math.floor(num / 1000)) + ' тысяча ';
            num %= 1000;
        }
        if (num >= 100) {
            res += hundreds[Math.floor(num / 100)] + ' ';
            num %= 100;
        }
        if (num >= 20) {
            res += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        } else if (num >= 10) {
            res += teens[num - 10] + ' ';
            return res;
        }
        if (num > 0)
            res += units[num] + ' ';
        return res;
    }
    const t = w % 100, f = t >= 11 && t <= 14 ? 'тенге' : w % 10 === 1 ? 'тенге' : w % 10 >= 2 && w % 10 <= 4 ? 'тенге' : 'тенге';
    const text = (w === 0 ? 'ноль ' : numWords(w)) + f;
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function _setPerm(permName, val) {
    const uid = _permUserId();
    if (!uid) {
        if (!_pendingPerms)
            setStore('_pendingPerms', Object.assign({}, DEFAULT_PERMISSIONS));
        _pendingPerms[permName] = val;
        return;
    }
    const data = getUserData(uid);
    data.permissions[permName] = val;
    setUserPermissions(uid, data);
}

function selectAllInGroup(group, on) {
    const keys = PERMISSION_GROUPS[group] || [];
    keys.forEach(k => {
        _setPerm(k, on);
    });
    renderPermissionsEditor(_permUserId());
}

function applyTemplateIndex(idx) {
    closeModal('modal-custom');
    try {
        const templates = JSON.parse(localStorage.getItem('sanaq_perm_templates_' + (currentStoreId || '')) || '[]');
        const tpl = templates[idx];
        if (!tpl)
            return;
        const targetId = _permUserId();
        if (!targetId) {
            setStore('_pendingPerms', Object.assign({}, tpl.permissions));
            renderPermissionsEditor(null);
            toast('Шаблон "' + tpl.name + '" применён (будет при создании)', 'ok');
            return;
        }
        const data = getUserData(targetId);
        data.permissions = Object.assign({}, tpl.permissions);
        setUserPermissions(targetId, data);
        renderPermissionsEditor(targetId);
        toast('Шаблон "' + tpl.name + '" применён', 'ok');
    } catch (e) {
        toast('Ошибка применения шаблона', 'err');
    }
}

function togglePromoDiscountType() {
}

function toggleNotifCenter() {
    const panel = document.getElementById('notif-panel');
    if (panel.style.display === 'flex') {
        panel.style.display = 'none';
        return;
    }
    panel.style.display = 'flex';
    renderNotifications();
}

function restoreSidebar() {
    getUISettings();
    if (!_uiSettings.visibility)
        _uiSettings.visibility = {};
    _uiSettings.visibility.sidebar = true;
    saveUISettings();
    applyUISettings();
    toast('Боковое меню восстановлено', 'ok');
}

function toggleBulkSelectAll(cb) {
    document.querySelectorAll('.bulk-item').forEach(el => {
        el.checked = cb.checked;
        if (cb.checked)
            _bulkSelected.add(el.dataset.id);
        else
            _bulkSelected.delete(el.dataset.id);
    });
    updateBulkBar();
}

function updateBulkBar() {
    const count = _bulkSelected.size;
    const bar = document.getElementById('bulk-bar');
    const counter = document.getElementById('bulk-count');
    if (counter)
        counter.textContent = count;
    if (bar)
        bar.style.display = count > 0 ? 'flex' : 'none';
}

function clearBulkSelection() {
    _bulkSelected.clear();
    document.querySelectorAll('.bulk-item').forEach(el => {
        el.checked = false;
    });
    const selAll = document.getElementById('bulk-select-all');
    if (selAll)
        selAll.checked = false;
    updateBulkBar();
}

function bulkChangePrice() {
    if (_bulkSelected.size === 0) {
        toast('Нет выбранных товаров', 'err');
        return;
    }
    document.getElementById('bulk-price-count').textContent = _bulkSelected.size;
    document.getElementById('bulk-price-value').value = '';
    openModal('modal-bulk-price');
}

function applyBulkPrice() {
    const type = document.getElementById('bulk-price-type').value;
    const value = parseFloat(document.getElementById('bulk-price-value').value);
    if (isNaN(value) || value < 0) {
        toast('Введите корректное значение', 'err');
        return;
    }
    const list = getProducts();
    const changed = 0;
    list = list.map(function (p) {
        if (_bulkSelected.has(p.id)) {
            const oldPrice = Number(p.price) || 0;
            switch (type) {
            case 'set':
                p.price = value;
                break;
            case 'percent':
                p.price = oldPrice * (1 + value / 100);
                break;
            case 'increase':
                p.price = oldPrice + value;
                break;
            case 'decrease':
                p.price = Math.max(0, oldPrice - value);
                break;
            }
            p.price = Math.round(p.price * 100) / 100;
            changed++;
        }
        return p;
    });
    setProducts(list);
    closeModal('modal-bulk-price');
    clearBulkSelection();
    renderProducts();
    toast('Цена обновлена у ' + changed + ' товаров', 'ok');
}

function bulkDelete() {
    if (_bulkSelected.size === 0) {
        toast('Нет выбранных товаров', 'err');
        return;
    }
    confirmAction('Массовое удаление', 'Удалить ' + _bulkSelected.size + ' товаров?', function () {
        const list = getProducts();
        const deleted = 0;
        list = list.filter(function (p) {
            if (_bulkSelected.has(p.id)) {
                deleted++;
                return false;
            }
            return true;
        });
        setProducts(list);
        clearBulkSelection();
        renderProducts();
        renderDashboard();
        toast('Удалено ' + deleted + ' товаров', 'ok');
    });
}

function bulkApplyDiscount() {
    if (_bulkSelected.size === 0) {
        toast('Нет выбранных товаров', 'err');
        return;
    }
    document.getElementById('bulk-discount-count').textContent = _bulkSelected.size;
    document.getElementById('bulk-discount-value').value = '';
    openModal('modal-bulk-discount');
}

function applyBulkDiscount() {
    const value = parseFloat(document.getElementById('bulk-discount-value').value);
    if (isNaN(value) || value <= 0 || value > 100) {
        toast('Введите скидку от 1 до 100%', 'err');
        return;
    }
    const type = document.getElementById('bulk-discount-type').value;
    const promos = getPromotions();
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const endStr = endOfMonth.toISOString().slice(0, 10);
    const added = 0;
    getProducts().forEach(p => {
        if (_bulkSelected.has(p.id)) {
            const existing = promos.findIndex(function (pr) {
                return pr.productId === p.id && pr.active !== false;
            });
            if (existing >= 0) {
                promos[existing].discountType = type;
                promos[existing].discountValue = value;
                promos[existing].endDate = endStr;
            } else {
                promos.push({
                    id: uid(),
                    productId: p.id,
                    productName: p.name,
                    discountType: type,
                    discountValue: value,
                    startDate: now.toISOString().slice(0, 10),
                    startTime: '00:00',
                    endDate: endStr,
                    endTime: '23:59',
                    active: true
                });
            }
            added++;
        }
    });
    setPromotions(promos);
    closeModal('modal-bulk-discount');
    clearBulkSelection();
    renderProducts();
    toast('Скидка применена к ' + added + ' товарам', 'ok');
}

function bulkRemoveDiscount() {
    if (_bulkSelected.size === 0) {
        toast('Нет выбранных товаров', 'err');
        return;
    }
    confirmAction('Удаление скидок', 'Удалить скидки для ' + _bulkSelected.size + ' товаров?', function () {
        const promos = getPromotions();
        const selectedIds = new Set();
        _bulkSelected.forEach(id => {
            selectedIds.add(id);
        });
        const before = promos.length;
        promos = promos.filter(pr => !selectedIds.has(pr.productId);
        });
        setPromotions(promos);
        clearBulkSelection();
        renderProducts();
        toast('Скидки удалены у ' + (before - promos.length) + ' товаров', 'ok');
    });
}

function openPinSetup() {
    document.getElementById('pin-setup-code').value = '';
    document.getElementById('pin-setup-confirm').value = '';
    openModal('modal-pin-setup');
}

function savePinCode() {
    const pin = document.getElementById('pin-setup-code').value;
    const confirm = document.getElementById('pin-setup-confirm').value;
    if (pin.length < 4 || pin.length > 6) {
        toast('PIN должен быть 4\u20136 цифр', 'err');
        return;
    }
    if (pin !== confirm) {
        toast('PIN-коды не совпадают', 'err');
        return;
    }
    saveUserPin(currentUser.id, pin);
    currentUser.pin = pin;
    closeModal('modal-pin-setup');
    toast('PIN-код сохранён', 'ok');
    addAuditLog('PIN-код установлен', 'Пользователь: ' + currentUser.name, '\uD83D\uDD10');
}

function checkPinLogin() {
    const entered = document.getElementById('pin-login-code').value;
    const userId = _pendingSwitchUserId;
    if (!userId)
        return;
    const userPin = getUserPin(userId);
    if (!userPin) {
        closeModal('modal-pin-login');
        doSwitchUser(_findUserAnywhere(userId));
        return;
    }
    const target = _findUserAnywhere(userId);
    if (!target) {
        return;
    }
    if (entered === userPin) {
        closeModal('modal-pin-login');
        doSwitchUser(target);
    } else if (entered.length >= userPin.length) {
        document.getElementById('pin-login-error').style.display = 'block';
        document.getElementById('pin-login-code').value = '';
    }
}

function toggleScannerAutoClose(cb) {
    setStore('_scannerAutoClose', cb.checked);
}

function toggleScannerTorch() {
    if (!scannerStream)
        return;
    const track = scannerStream.getVideoTracks()[0];
    if (!track)
        return;
    const capabilities = track.getCapabilities && track.getCapabilities();
    if (capabilities && capabilities.torch) {
        const currentlyOn = track.getConstraints && track.getConstraints().torch;
        track.applyConstraints({ advanced: [{ torch: !currentlyOn }] }).catch(function (e) {
            console.warn('[Scanner] Torch error:', e);
        });
    }
}

function openQtyPopup(productId) {
    const item = saleCart.find(c => c.id === productId;
    });
    if (!item)
        return;
    setQtyPopupProductId(productId);
    document.getElementById('qty-popup-product').textContent = item.name;
    document.getElementById('qty-popup-input').value = item.qty;
    document.getElementById('qty-popup-input').max = item.maxQty || 9999;
    openModal('modal-qty-popup');
    setTimeout(function () {
        const inp = document.getElementById('qty-popup-input');
        inp.focus();
        inp.select();
    }, 150);
}

function confirmQtyPopup() {
    const qty = parseInt(document.getElementById('qty-popup-input').value) || 1;
    const item = saleCart.find(c => c.id === _qtyPopupProductId;
    });
    if (!item) {
        closeModal('modal-qty-popup');
        return;
    }
    const maxQty = item.maxQty || 9999;
    if (qty > maxQty) {
        toast('На складе всего ' + maxQty + ' шт.', 'err');
        return;
    }
    if (qty < 1)
        qty = 1;
    item.qty = qty;
    renderSaleCart();
    closeModal('modal-qty-popup');
}

export { getCurrentStoreName, normalizeCode, levenshtein, generateSearchVariations, generateEAN13, drawEan13Svg, drawCode39Svg, updateMarkup, fmt, fmtShort, fmtDate, fmtDateTime, escapeHtml, esc, todayStr, getFieldValue, createExcelWorkbook, styleExcelCell, saveExcelBuffer, downloadExcelTemplate, readExcelFile, showImportPreview, confirmImport, isToday, closeModal, toggleSidebar, toggleDashLowStock, confirmAction, showSupabaseLogin, getPeriodDateRange, filterByPeriod, card, finCard, setPayment, adjustSelectedQty, removeSelectedItem, checkSelectedPrice, focusSearch, toggleFavoriteFromTable, posRefreshFavorites, openPaymentModal, openItemDiscount, toggleItemDiscountValue, applyItemDiscount, stopTracks, switchUnsoldPeriod, downloadFile, switchAuditsTab, onWoSearch, updateAuditQty, tableHTML, showPaymentMethodModal, classicAmountWords, _setPerm, selectAllInGroup, applyTemplateIndex, togglePromoDiscountType, toggleNotifCenter, restoreSidebar, toggleBulkSelectAll, updateBulkBar, clearBulkSelection, bulkChangePrice, applyBulkPrice, bulkDelete, bulkApplyDiscount, applyBulkDiscount, bulkRemoveDiscount, openPinSetup, savePinCode, checkPinLogin, toggleScannerAutoClose, toggleScannerTorch, openQtyPopup, confirmQtyPopup };
