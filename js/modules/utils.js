import { EAN_PARITY, EAN_L, EAN_G, EAN_R, CODE39, EXCEL_SECTIONS, DEFAULT_PERMISSIONS, PERMISSION_GROUPS } from './constants.js';
import { _pendingPerms, currentStoreId, _bulkSelected, scannerStream, confirmCallback, _scannerAutoClose, setStore } from './store.js';
import { get as ctx } from './app-context.js';
import { getCategories, getCustomers, setCustomers, getDebtors, getExpenses, setExpenses, getProducts, setProducts, getSales } from './api-bridge.js';
import { _auditSession } from './auth.js';
import { _importState, setImportState } from './statistics.js';
import { currentUser } from './users.js';
import { saleCart } from './cart.js';
import { PAY_LABELS, currentPayment, setCurrentPayment } from './sales.js';
import { _qtyPopupProductId, setQtyPopupProductId } from './products.js';
import { _uiSettings, getUISettings, saveUISettings, applyUISettings } from './settings.js';
import { _pendingSwitchUserId } from './users.js';
import { getPromotions, setPromotions } from './promotions.js';
import { getCustomerTier } from './customers.js';

function wrap(n, fb) { return function () { var s = ctx(n); return s ? s.apply(null, arguments) : (typeof fb === 'function' ? fb.apply(null, arguments) : undefined); }; }

var toast = wrap('toast');
var openModal = wrap('openModal');
var refreshAll = wrap('refreshAll');
var _reopenParentModal = wrap('_reopenParentModal');
var goPage = wrap('goPage');
var renderNotifications = wrap('renderNotifications');
var renderDashboard = wrap('renderDashboard');
var isSaleActive = wrap('isSaleActive');
var togglePaymentSection = wrap('togglePaymentSection');
var calcMixedRemainder = wrap('calcMixedRemainder');
var addAuditLog = wrap('addAuditLog');
var renderAuditSessionTable = wrap('renderAuditSessionTable');
var isExpenseActive = wrap('isExpenseActive');
var renderProducts = wrap('renderProducts');
var renderUnsoldProducts = wrap('renderUnsoldProducts');
var getOpenShiftForCashier = wrap('getOpenShiftForCashier');
var checkPermission = wrap('checkPermission');
var requireAdminPin = wrap('requireAdminPin');
var isAdmin = wrap('isAdmin');
var getUserMaxDiscount = wrap('getUserMaxDiscount');
var _permUserId = wrap('_permUserId');
var getUserData = wrap('getUserData');
var setUserPermissions = wrap('setUserPermissions');
var renderPermissionsEditor = wrap('renderPermissionsEditor');
var doSwitchUser = wrap('doSwitchUser');
var _findUserAnywhere = wrap('_findUserAnywhere');
var getSelectedCartItem = wrap('getSelectedCartItem');
var updateCartQty = wrap('updateCartQty');
var removeFromCart = wrap('removeFromCart');
var renderSaleCart = wrap('renderSaleCart');
var saveUserPin = wrap('saveUserPin');
var getUserPin = wrap('getUserPin');
// onWoSearch, updateAuditQty, switchAuditsTab, switchUnsoldPeriod, stopTracks, focusSearch — defined locally below

function getCurrentStoreName() {
    var m = window.ApAuth && window.ApAuth.getCurrentStore();
    return m ? m.storeName : 'Магазин';
}

function normalizeCode(str) {
    return (str || '').trim().toUpperCase();
}

function levenshtein(a, b) {
    var m = [], i, j;
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
    var t = term.trim().toLowerCase();
    var results = [t];
    var ruToEn = {
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
    var enToRu = {
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
    var hasEnglish = /[a-zA-Z]/.test(t);
    var hasRussian = /[а-яА-ЯёЁ]/.test(t);
    if (hasEnglish && !hasRussian) {
        var translit = '';
        for (var i = 0; i < t.length; i++) {
            translit += enToRu[t[i]] || t[i];
        }
        if (translit !== t)
            results.push(translit);
    }
    if (hasRussian && !hasEnglish) {
        var translit2 = '';
        for (var j = 0; j < t.length; j++) {
            translit2 += ruToEn[t[j]] || t[j];
        }
        if (translit2 !== t)
            results.push(translit2);
    }
    var mixed = '';
    var mixedMap = {
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
    var s = String(200000000000 + seed % 99999999999);
    while (s.length < 12)
        s = '0' + s;
    var sum = 0;
    for (var i = 0; i < 12; i++) {
        sum += parseInt(s[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    var check = (10 - sum % 10) % 10;
    return s + check;
}

function drawEan13Svg(text, modW, barH) {
    modW = modW || 2;
    barH = barH || 60;
    var guardH = barH + Math.round(barH * 0.1);
    var digits = String(text).replace(/\D/g, '');
    while (digits.length < 13)
        digits = '0' + digits;
    digits = digits.substring(0, 13);
    var bits = '101';
    var firstDigit = parseInt(digits[0]);
    var parity = EAN_PARITY[firstDigit];
    for (var i = 0; i < 6; i++) {
        var d = parseInt(digits[i + 1]);
        bits += parity[i] === 'L' ? EAN_L[d] : EAN_G[d];
    }
    bits += '01010';
    for (var i = 0; i < 6; i++) {
        var d = parseInt(digits[i + 7]);
        bits += EAN_R[d];
    }
    bits += '101';
    var totalW = bits.length * modW;
    var quiet = modW * 10;
    var svgW = totalW + quiet * 2;
    var svgH = barH + 18;
    var rects = [];
    for (var i = 0; i < bits.length; i++) {
        if (bits[i] === '1') {
            var isGuard = i < 3 || i >= 45 && i < 50 || i >= 92;
            var h = isGuard ? guardH : barH;
            rects.push('<rect x="' + (quiet + i * modW) + '" y="0" width="' + modW + '" height="' + h + '" fill="#000"/>');
        }
    }
    var textY = barH + 10;
    var fontSize = Math.max(8, modW * 6);
    var smallFontSize = Math.max(6, modW * 5);
    var x1 = quiet - modW * 2;
    var leftStart = quiet + 3 * modW;
    var leftSpan = 42 * modW;
    var rightStart = quiet + 50 * modW;
    var rightSpan = 42 * modW;
    var textHtml = '';
    textHtml += '<text x="' + x1 + '" y="' + textY + '" font-size="' + fontSize + '" font-family="Arial,sans-serif" text-anchor="end">' + digits[0] + '</text>';
    for (var i = 0; i < 6; i++) {
        var cx = leftStart + (i * 7 + 3.5) * modW;
        textHtml += '<text x="' + cx + '" y="' + textY + '" font-size="' + smallFontSize + '" font-family="Arial,sans-serif" text-anchor="middle">' + digits[i + 1] + '</text>';
    }
    for (var i = 0; i < 6; i++) {
        var cx = rightStart + (i * 7 + 3.5) * modW;
        textHtml += '<text x="' + cx + '" y="' + textY + '" font-size="' + smallFontSize + '" font-family="Arial,sans-serif" text-anchor="middle">' + digits[i + 7] + '</text>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '" shape-rendering="crispEdges">' + '<rect x="0" y="0" width="' + svgW + '" height="' + svgH + '" fill="#fff"/>' + rects.join('') + textHtml + '</svg>';
}

function drawCode39Svg(text, scale, heightScale) {
    scale = scale || 1;
    heightScale = heightScale || scale;
    var enc = '*' + String(text).toUpperCase().replace(/[^0-9A-Z\-\.\ \$\/\+\%]/g, '') + '*';
    var narrow = 2 * scale, wide = 6 * scale, height = 40 * heightScale, x = 2 * scale, rects = [];
    for (var i = 0; i < enc.length; i++) {
        var pat = CODE39[enc[i]];
        if (!pat)
            continue;
        for (var j = 0; j < 9; j++) {
            var w = pat[j] === 'w' ? wide : narrow;
            if (j % 2 === 0)
                rects.push('<rect x="' + x + '" y="' + 1 * heightScale + '" width="' + w + '" height="' + (height - 2 * heightScale) + '" fill="#000"/>');
            x += w;
        }
        x += narrow;
    }
    var totalW = x + 2 * scale;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + totalW + '" height="' + height + '" viewBox="0 0 ' + totalW + ' ' + height + '" shape-rendering="crispEdges">' + rects.join('') + '</svg>';
}

function updateMarkup() {
    var purchase = parseFloat(document.getElementById('product-purchase').value) || 0;
    var price = parseFloat(document.getElementById('product-price').value) || 0;
    var el = document.getElementById('markup-display');
    if (!el)
        return;
    if (purchase <= 0) {
        el.textContent = price > 0 ? 'Наценка: \u221E' : 'Наценка: \u2014';
        el.style.color = 'var(--muted)';
        return;
    }
    var pct = ((price - purchase) / purchase * 100).toFixed(1);
    var isNeg = pct < 0;
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
    var dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDateTime(d) {
    if (!d) return '';
    var dt = new Date(d);
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
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
}

function getFieldValue(obj, field) {
    if (!obj || field == null)
        return '';
    if (field === '_categoryName') {
        var cat = getCategories().find(function (c) {
            return c.id === obj.category;
        });
        return cat ? cat.name : '';
    }
    if (field === '_status')
        return obj.status === 'cancelled' || obj.status === 'returned' ? 'Отменён' : 'Активен';
    if (field === '_saleStatus')
        return isSaleActive(obj) ? 'Завершена' : 'Отменена';
    if (field === '_expenseStatus')
        return isExpenseActive(obj) ? 'Активен' : 'Отменён';
    if (field === '_docNum')
        return (obj.receiptId || obj.id || '').slice(-6);
    if (field === '_customerName') {
        if (obj.customerName)
            return obj.customerName;
        if (obj.customerId) {
            var c = getCustomers().find(function (x) {
                return x.id === obj.customerId;
            });
            return c ? c.name : '';
        }
        return '';
    }
    if (field === '_paymentLabel')
        return PAY_LABELS[obj.payment] || obj.payment || '';
    if (field === '_docType')
        return obj.docType === 'invoice' ? 'Счёт' : obj.docType === 'z2' ? 'З-2' : obj.docType || '';
    if (field === '_docStatus')
        return obj.status === 'pending' ? 'Ожидает' : obj.status === 'paid' ? 'Оплачено' : obj.status === 'issued' ? 'Выписано' : 'Отменено';
    if (field === '_createdByName')
        return obj.createdByName || obj.userName || '';
    if (field === '_tierName') {
        var t = getCustomerTier(Number(obj.spent) || 0);
        return t ? t.name : '';
    }
    if (field === '_lastPurchase') {
        if (!obj.id)
            return '';
        var lastSale = getSales().filter(isSaleActive).filter(function (s) {
            return s.customerId === obj.id;
        }).sort(function (a, b) {
            return (b.date || '').localeCompare(a.date || '');
        });
        return lastSale.length ? lastSale[0].date : '';
    }
    if (field === '_debtorPhone' || field === '_debtorRating') {
        var debtors = window.getDebtors ? getDebtors() : [];
        var debtor = debtors.find(function (d) {
            return d.id === obj.debtorId;
        });
        if (field === '_debtorPhone')
            return debtor ? debtor.phone : '';
        return debtor ? debtor.rating : '';
    }
    if (field === '_profit')
        return Number(obj.revenue || 0) - Number(obj.cogs || 0);
    if (field === '_share') {
        var share = window._cashierShare || 5;
        return (Number(obj.revenue || 0) * share / 100).toFixed(0);
    }
    if (field === 'supplier')
        return obj.supplier || '';
    var val = obj[field];
    return val !== null && val !== undefined ? val : '';
}

async function createExcelWorkbook(headers, rows, widths, sheetName, numFmts) {
    if (typeof ExcelJS !== 'undefined') {
        var wb = new ExcelJS.Workbook();
        wb.creator = 'SANAQ';
        wb.created = new Date();
        var ws = wb.addWorksheet(sheetName || 'Данные', { views: [{ showGridLines: false }] });
        ws.properties.defaultRowHeight = 20;
        var headerStyle = {
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
        var headerRow = ws.addRow(headers);
        headerRow.height = 28;
        headerRow.eachCell(function (cell) {
            styleExcelCell(cell, headerStyle);
        });
        var alt = false;
        rows.forEach(function (rowData) {
            var row = ws.addRow(rowData);
            row.eachCell(function (cell, colIdx) {
                var fmt = numFmts && numFmts[colIdx - 1];
                var isNum = fmt === '#,##0' || fmt === '#,##0.00' || fmt === '#,##0.0';
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
        widths.forEach(function (w, i) {
            ws.getColumn(i + 1).width = w;
        });
        var buffer;
        try { buffer = await wb.xlsx.writeBuffer(); } catch (e) { throw new Error('Excel write failed: ' + e.message); }
        return buffer;
    }
    if (typeof XLSX !== 'undefined') {
        var data = [headers].concat(rows);
        var ws2 = XLSX.utils.aoa_to_sheet(data);
        ws2['!cols'] = widths.map(function (w) {
            return { wch: w };
        });
        var wb2 = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb2, ws2, sheetName || 'Данные');
        var out = XLSX.write(wb2, {
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
    var blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function downloadExcelTemplate(section) {
    var cfg = EXCEL_SECTIONS[section];
    if (!cfg) {
        toast('Неизвестный раздел', 'err');
        return;
    }
    var emptyRow = cfg.fields.map(function () {
        return '';
    });
    try {
        var buffer = await createExcelWorkbook(cfg.headers, [emptyRow], cfg.widths, cfg.label);
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
    var cfg = EXCEL_SECTIONS[section];
    if (!cfg) {
        toast('Неизвестный раздел', 'err');
        return;
    }
    setImportState({ section: section, rawData: null, colMap: null, rows: null, fileName: file.name });
    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var opts = { type: 'array' };
            var name = file.name.toLowerCase();
            if (name.endsWith('.csv')) {
                var text = new TextDecoder('utf-8').decode(e.target.result);
                var wb = XLSX.read(text, {
                    type: 'string',
                    raw: true
                });
            } else {
                var wb = XLSX.read(e.target.result, opts);
            }
            var ws = wb.Sheets[wb.SheetNames[0]];
            if (!ws) {
                toast('Файл не содержит листов', 'err');
                _importState.section = null;
                return;
            }
            var raw = XLSX.utils.sheet_to_json(ws, {
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
    var cfg = EXCEL_SECTIONS[section];
    if (!cfg) {
        _importState.section = null;
        return;
    }
    var headers = rawData[0] || [];
    var dataRows = rawData.slice(1).filter(function (r) {
        return r.some(function (c) {
            return c !== '';
        });
    });
    if (dataRows.length === 0) {
        toast('Нет данных для импорта', 'err');
        _importState.section = null;
        return;
    }
    var colMap = {};
    var missing = [];
    cfg.fields.forEach(function (field) {
        var fieldIdx = cfg.fields.indexOf(field);
        if (fieldIdx < 0)
            return;
        var expected = cfg.headers[fieldIdx] || '';
        var hdrIdx = -1;
        headers.forEach(function (h, i) {
            if (String(h).toLowerCase().trim() === expected.toLowerCase().trim())
                hdrIdx = i;
        });
        if (hdrIdx < 0) {
            headers.forEach(function (h, i) {
                if (hdrIdx >= 0)
                    return;
                if (String(h).toLowerCase().indexOf(expected.toLowerCase().slice(0, 4)) >= 0)
                    hdrIdx = i;
            });
        }
        if (hdrIdx >= 0)
            colMap[field] = hdrIdx;
    });
    cfg.required.forEach(function (field) {
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
    var previewHtml = '<div style="max-height:400px;overflow-y:auto">';
    previewHtml += '<table><thead><tr>';
    cfg.headers.forEach(function (h) {
        previewHtml += '<th>' + escapeHtml(h) + '</th>';
    });
    previewHtml += '</tr></thead><tbody>';
    var maxPreview = Math.min(dataRows.length, 20);
    for (var i = 0; i < maxPreview; i++) {
        previewHtml += '<tr>';
        cfg.fields.forEach(function (field) {
            var colIdx = colMap[field];
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
    var state = _importState;
    if (!state || !state.section) {
        toast('Нет данных для импорта', 'err');
        return;
    }
    var cfg = EXCEL_SECTIONS[state.section];
    if (!cfg)
        return;
    var colMap = state.colMap;
    var dataRows = state.rows;
    var success = 0, errors = 0;
    dataRows.forEach(function (row) {
        try {
            var item = {};
            Object.keys(colMap).forEach(function (field) {
                var colIdx = colMap[field];
                if (colIdx >= 0)
                    item[field] = row[colIdx] !== undefined && row[colIdx] !== null ? String(row[colIdx]).trim() : '';
            });
            if (state.section === 'products') {
                if (!item.barcode && !item.code && !item.name) {
                    errors++;
                    return;
                }
                var existing = getProducts();
                var dup = null;
                if (item.barcode)
                    dup = existing.find(function (p) {
                        return p.barcode === item.barcode;
                    });
                if (!dup && item.code)
                    dup = existing.find(function (p) {
                        return p.code === item.code;
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
                var customers = getCustomers();
                var dupC = customers.find(function (c) {
                    return (c.phone || '').replace(/\D/g, '') === item.phone.replace(/\D/g, '');
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
                var expenses = getExpenses();
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
    var s = document.querySelector('.sidebar');
    var btn = document.getElementById('sidebar-collapse-btn');
    if (!s)
        return;
    s.classList.toggle('collapsed');
    var collapsed = s.classList.contains('collapsed');
    if (btn)
        btn.innerHTML = collapsed ? '<i data-lucide="panel-left"></i>' : '<i data-lucide="panel-left-close"></i>';
    if (typeof lucide !== 'undefined')
        lucide.createIcons();
    if (window.ApDb)
        window.ApDb.set('sidebarCollapsed', collapsed);
}

function toggleDashLowStock() {
    var el = document.getElementById('dash-lowstock');
    var btn = document.querySelector('#panel-dash-lowstock .collapse-btn');
    if (!el)
        return;
    var hidden = el.style.display === 'none';
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
    var now = new Date();
    var start;
    if (period === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
        var d = now.getDay();
        var diff = d === 0 ? 6 : d - 1;
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
    if (period === 'all')
        return arr;
    var range = getPeriodDateRange(period);
    return (arr || []).filter(function (x) {
        var d = new Date(x[dateField] || x.date || 0);
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
    document.querySelectorAll('.pay-btn, .pos-pay-btn, .pos-pay-strip button').forEach(function (b) {
        b.classList.remove('active');
    });
    btn.classList.add('active');
    setCurrentPayment(btn.dataset.pay);
    togglePaymentSection('cash-change-wrap', currentPayment === 'cash');
    togglePaymentSection('mixed-payment-wrap', currentPayment === 'mixed');
    togglePaymentSection('debt-payment-wrap', currentPayment === 'debt');
    var totalEl = document.getElementById('sale-total');
    var finalTotal = totalEl ? parseFloat(totalEl.dataset.value || totalEl.value || 0) : 0;
    if (currentPayment === 'cash') {
        var cg = document.getElementById('cash-given');
        if (cg)
            cg.value = '';
        var cc = document.getElementById('cash-change');
        if (cc)
            cc.value = '';
    }
    if (currentPayment === 'mixed') {
        var mc = document.getElementById('mixed-cash');
        var mk = document.getElementById('mixed-kaspi');
        var mt = document.getElementById('mixed-transfer');
        var mcg = document.getElementById('mixed-cash-given');
        var mcc = document.getElementById('mixed-cash-change');
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
    var item = getSelectedCartItem();
    if (!item) {
        toast('Выберите товар в таблице', 'warn');
        return;
    }
    updateCartQty(item.id, delta);
}

function removeSelectedItem() {
    var item = getSelectedCartItem();
    if (!item) {
        toast('Выберите товар в таблице', 'warn');
        return;
    }
    if (!confirm('Удалить "' + item.name + '" из чека?'))
        return;
    removeFromCart(item.id);
}

function checkSelectedPrice() {
    var item = getSelectedCartItem();
    if (!item) {
        toast('Выберите товар в таблице', 'warn');
        return;
    }
    toast('\uD83D\uDCB0 ' + item.name + ': ' + fmt(item.price) + ' \u20B8 \xD7 ' + item.qty + ' = ' + fmt(item.price * item.qty) + ' \u20B8', 'ok');
}

function focusSearch() {
    var el = document.getElementById('sale-search');
    if (el) {
        el.focus();
        el.select();
    }
}

function toggleFavoriteFromTable(productId, e) {
    if (e)
        e.stopPropagation();
    var products = getProducts();
    var p = products.find(function (x) {
        return x.id === productId;
    });
    if (!p)
        return;
    p.favorite = !p.favorite;
    setProducts(products);
    renderProducts();
    posRefreshFavorites();
}

function posRefreshFavorites() {
    // In new layout, favorites are shown as a category via filterCategory('__favorites__')
    // If category sidebar shows favorites, re-render
    var container = document.getElementById('pos-cat-strip');
    if (!container) return;
    var favBtn = container.querySelector('button[data-cat-id="__favorites__"]');
    // Re-render category list to update counts
    renderPosCatBrowser();
    // If favorites category is active, re-render products
    if (favBtn && favBtn.classList.contains('active')) {
        filterCategory('__favorites__');
    }
}

function openPaymentModal() {
    if (!saleCart.length) {
        toast('Корзина пуста', 'err');
        return;
    }
    var shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    if (!shift) {
        toast('Смена (касса) не открыта. Сначала откройте смену.', 'err');
        goPage('myshift');
        return;
    }
    var totalEl = document.getElementById('sale-total');
    var total = totalEl ? parseFloat(totalEl.dataset.value || totalEl.value || 0) : 0;
    if (total <= 0) {
        toast('Сумма чека 0', 'err');
        return;
    }
    var payBtns = document.querySelectorAll('#modal-pos-payment .pos-pay-strip button');
    if (payBtns.length) {
        setPayment(payBtns[0]);
    }
    openModal('modal-pos-payment');
    setTimeout(function () {
        var cg = document.getElementById('cash-given');
        if (cg)
            cg.focus();
    }, 200);
}

function toggleItemDiscountValue() {
    var type = document.getElementById('item-discount-type').value;
    var input = document.getElementById('item-discount-value');
    if (type === 'percent') {
        input.max = 100;
        input.placeholder = 'Например: 10';
    } else {
        input.max = 999999;
        input.placeholder = 'Например: 500';
    }
}

function stopTracks(stream) {
    try {
        stream.getTracks().forEach(function (t) {
            t.stop();
        });
    } catch (e) {
    }
}

function switchUnsoldPeriod(days) {
    document.querySelectorAll('[data-unsold]').forEach(function (b) {
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
    document.querySelectorAll('#page-audits .tabs .tab').forEach(function (b) {
        b.classList.toggle('active', b.dataset.atab === tab);
    });
    var wo = document.getElementById('atab-writeoffs');
    var rec = document.getElementById('atab-reconciliation');
    if (wo)
        wo.classList.toggle('hidden', tab !== 'writeoffs');
    if (rec)
        rec.classList.toggle('hidden', tab !== 'reconciliation');
}

function onWoSearch() {
    var q = document.getElementById('wo-product-search').value.trim().toLowerCase();
    var results = document.getElementById('wo-search-results');
    if (!q || q.length < 1) {
        results.classList.add('hidden');
        return;
    }
    var products = getProducts().filter(function (p) {
        return p.name.toLowerCase().indexOf(q) >= 0 || (p.code || '').toLowerCase().indexOf(q) >= 0 || (p.barcode || '').indexOf(q) >= 0;
    }).slice(0, 10);
    if (!products.length) {
        results.innerHTML = '<div class="sale-result-item" style="color:var(--muted)">Ничего не найдено</div>';
        results.classList.remove('hidden');
        return;
    }
    results.innerHTML = products.map(function (p) {
        return '<div class="sale-result-item" onclick="selectWoProduct(\'' + p.id + '\')">' + '<span class="code-tag">' + (p.code || '') + '</span> ' + p.name + ' <span style="color:var(--muted);font-size:12px">(ост: ' + p.quantity + ')</span></div>';
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
    headers.forEach(function (c) {
        h += '<th>' + c + '</th>';
    });
    h += '</tr></thead><tbody>';
    rows.forEach(function (row) {
        h += '<tr>';
        row.forEach(function (c) {
            h += '<td>' + c + '</td>';
        });
        h += '</tr>';
    });
    return h + '</tbody></table>';
}

function showPaymentMethodModal(callback) {
    var existing = document.getElementById('payment-method-modal');
    if (existing)
        existing.remove();
    var overlay = document.createElement('div');
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
    var w = Math.floor(Math.abs(n || 0));
    var units = [
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
    var teens = [
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
    var tens = [
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
    var hundreds = [
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
        if (num === 0)
            return '';
        var res = '';
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
    var t = w % 100, f = t >= 11 && t <= 14 ? 'тенге' : w % 10 === 1 ? 'тенге' : w % 10 >= 2 && w % 10 <= 4 ? 'тенге' : 'тенге';
    var text = (w === 0 ? 'ноль ' : numWords(w)) + f;
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function _setPerm(permName, val) {
    var uid = _permUserId();
    if (!uid) {
        if (!_pendingPerms)
            setStore('_pendingPerms', Object.assign({}, DEFAULT_PERMISSIONS));
        _pendingPerms[permName] = val;
        return;
    }
    var data = getUserData(uid);
    data.permissions[permName] = val;
    setUserPermissions(uid, data);
}

function selectAllInGroup(group, on) {
    var keys = PERMISSION_GROUPS[group] || [];
    keys.forEach(function (k) {
        _setPerm(k, on);
    });
    renderPermissionsEditor(_permUserId());
}

function applyTemplateIndex(idx) {
    closeModal('modal-custom');
    try {
        var templates = (window.ApDb && window.ApDb.getAppData && window.ApDb.getAppData('perm_templates')) || JSON.parse(localStorage.getItem('sanaq_perm_templates_' + (currentStoreId || '')) || '[]');
        var tpl = templates[idx];
        if (!tpl)
            return;
        var targetId = _permUserId();
        if (!targetId) {
            setStore('_pendingPerms', Object.assign({}, tpl.permissions));
            renderPermissionsEditor(null);
            toast('Шаблон "' + tpl.name + '" применён (будет при создании)', 'ok');
            return;
        }
        var data = getUserData(targetId);
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
    var panel = document.getElementById('notif-panel');
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
    document.querySelectorAll('.bulk-item').forEach(function (el) {
        el.checked = cb.checked;
        if (cb.checked)
            _bulkSelected.add(el.dataset.id);
        else
            _bulkSelected.delete(el.dataset.id);
    });
    updateBulkBar();
}

function updateBulkBar() {
    var count = _bulkSelected.size;
    var bar = document.getElementById('bulk-bar');
    var counter = document.getElementById('bulk-count');
    if (counter)
        counter.textContent = count;
    if (bar)
        bar.style.display = count > 0 ? 'flex' : 'none';
}

function clearBulkSelection() {
    _bulkSelected.clear();
    document.querySelectorAll('.bulk-item').forEach(function (el) {
        el.checked = false;
    });
    var selAll = document.getElementById('bulk-select-all');
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
    var type = document.getElementById('bulk-price-type').value;
    var value = parseFloat(document.getElementById('bulk-price-value').value);
    if (isNaN(value) || value < 0) {
        toast('Введите корректное значение', 'err');
        return;
    }
    var list = getProducts();
    var changed = 0;
    list = list.map(function (p) {
        if (_bulkSelected.has(p.id)) {
            var oldPrice = Number(p.price) || 0;
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
        var list = getProducts();
        var deleted = 0;
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
    var value = parseFloat(document.getElementById('bulk-discount-value').value);
    if (isNaN(value) || value <= 0 || value > 100) {
        toast('Введите скидку от 1 до 100%', 'err');
        return;
    }
    var type = document.getElementById('bulk-discount-type').value;
    var promos = getPromotions();
    var now = new Date();
    var endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    var endStr = endOfMonth.toISOString().slice(0, 10);
    var added = 0;
    getProducts().forEach(function (p) {
        if (_bulkSelected.has(p.id)) {
            var existing = promos.findIndex(function (pr) {
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
        var promos = getPromotions();
        var selectedIds = new Set();
        _bulkSelected.forEach(function (id) {
            selectedIds.add(id);
        });
        var before = promos.length;
        promos = promos.filter(function (pr) {
            return !selectedIds.has(pr.productId);
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

async function savePinCode() {
    var pin = document.getElementById('pin-setup-code').value;
    var confirm = document.getElementById('pin-setup-confirm').value;
    if (pin.length < 4 || pin.length > 6) {
        toast('PIN должен быть 4\u20136 цифр', 'err');
        return;
    }
    if (pin !== confirm) {
        toast('PIN-коды не совпадают', 'err');
        return;
    }
    await saveUserPin(currentUser.id, pin);
    closeModal('modal-pin-setup');
    toast('PIN-код сохранён', 'ok');
    addAuditLog('PIN-код установлен', 'Пользователь: ' + currentUser.name, '\uD83D\uDD10');
}

async function checkPinLogin() {
    var entered = document.getElementById('pin-login-code').value;
    var userId = _pendingSwitchUserId;
    if (!userId) return;
    var has = getUserPin(userId);
    if (!has) {
        closeModal('modal-pin-login');
        doSwitchUser(_findUserAnywhere(userId));
        return;
    }
    var target = _findUserAnywhere(userId);
    if (!target) return;
    if (_isLegacyPlain(has)) {
        if (entered === has) {
            closeModal('modal-pin-login');
            await saveUserPin(userId, entered);
            doSwitchUser(target);
        } else if (entered.length >= has.length) {
            document.getElementById('pin-login-error').style.display = 'block';
            document.getElementById('pin-login-code').value = '';
        }
    } else {
        if (entered.length >= 4 && (await hashPin(entered)) === has) {
            closeModal('modal-pin-login');
            doSwitchUser(target);
        } else if (entered.length >= 4) {
            document.getElementById('pin-login-error').style.display = 'block';
            document.getElementById('pin-login-code').value = '';
        }
    }
}

function toggleScannerAutoClose(cb) {
    setStore('_scannerAutoClose', cb.checked);
}

function toggleScannerTorch() {
    if (!scannerStream)
        return;
    var track = scannerStream.getVideoTracks()[0];
    if (!track)
        return;
    var capabilities = track.getCapabilities && track.getCapabilities();
    if (capabilities && capabilities.torch) {
        var currentlyOn = track.getConstraints && track.getConstraints().torch;
        track.applyConstraints({ advanced: [{ torch: !currentlyOn }] }).catch(function (e) {
            console.warn('[Scanner] Torch error:', e);
        });
    }
}

function openQtyPopup(productId) {
    var item = saleCart.find(function (c) {
        return c.id === productId;
    });
    if (!item)
        return;
    setQtyPopupProductId(productId);
    document.getElementById('qty-popup-product').textContent = item.name;
    document.getElementById('qty-popup-input').value = item.qty;
    document.getElementById('qty-popup-input').max = item.maxQty || 9999;
    openModal('modal-qty-popup');
    setTimeout(function () {
        var inp = document.getElementById('qty-popup-input');
        inp.focus();
        inp.select();
    }, 150);
}

function confirmQtyPopup() {
    var qty = parseInt(document.getElementById('qty-popup-input').value) || 1;
    var item = saleCart.find(function (c) {
        return c.id === _qtyPopupProductId;
    });
    if (!item) {
        closeModal('modal-qty-popup');
        return;
    }
    var maxQty = item.maxQty || 9999;
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



export { getCurrentStoreName, normalizeCode, levenshtein, generateSearchVariations, generateEAN13, drawEan13Svg, drawCode39Svg, updateMarkup, fmt, fmtShort, fmtDate, fmtDateTime, escapeHtml, esc, todayStr, getFieldValue, createExcelWorkbook, styleExcelCell, saveExcelBuffer, downloadExcelTemplate, readExcelFile, showImportPreview, confirmImport, isToday, closeModal, toggleSidebar, toggleDashLowStock, confirmAction, showSupabaseLogin, getPeriodDateRange, filterByPeriod, card, finCard, setPayment, adjustSelectedQty, removeSelectedItem, checkSelectedPrice, focusSearch, toggleFavoriteFromTable, posRefreshFavorites, openPaymentModal, toggleItemDiscountValue, stopTracks, switchUnsoldPeriod, downloadFile, switchAuditsTab, onWoSearch, updateAuditQty, tableHTML, showPaymentMethodModal, classicAmountWords, _setPerm, selectAllInGroup, applyTemplateIndex, togglePromoDiscountType, toggleNotifCenter, restoreSidebar, toggleBulkSelectAll, updateBulkBar, clearBulkSelection, bulkChangePrice, applyBulkPrice, bulkDelete, bulkApplyDiscount, applyBulkDiscount, bulkRemoveDiscount, openPinSetup, savePinCode, checkPinLogin, toggleScannerAutoClose, toggleScannerTorch, openQtyPopup, confirmQtyPopup };
