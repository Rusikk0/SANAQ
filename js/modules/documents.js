import { _closeParentModals, openModal, _reopenParentModal, buildInvoiceHTML, uid, renderPosCatBrowser } from './ui.js';
import { esc, closeModal, fmtShort, fmtDate, styleExcelCell, saveExcelBuffer, tableHTML, fmt, confirmAction, escapeHtml } from './utils.js';
import { toast } from './notifications.js';
import { getSales, isSaleActive, buildSalePKOHTML, PAY_LABELS, getDeferred, setDeferred, clearSaleSelection } from './sales.js';
import { exportAoAToExcel } from './statistics.js';
import { addDocItemRow, getDocItemsFromTable, getDocumentItems, setDocumentItems } from './products.js';


function getDocuments() {
    return window.ApDb ? window.ApDb.getDocuments() : [];
}

function setDocuments(arr) {
    if (window.ApDb)
        window.ApDb.setDocuments(arr);
}

function getDocTemplates() {
    try {
        return JSON.parse(localStorage.getItem('ap_doc_templates') || '[]');
    } catch (e) {
        return [];
    }
}

function setDocTemplates(arr) {
    try {
        localStorage.setItem('ap_doc_templates', JSON.stringify(arr));
    } catch (e) {
    }
}

function openDocTemplateManager() {
    _closeParentModals();
    openModal('modal-doc-templates');
    renderDocTemplates();
}

function renderDocTemplates() {
    var list = document.getElementById('doc-templates-list');
    if (!list)
        return;
    var templates = getDocTemplates();
    if (!templates.length) {
        list.innerHTML = '<div class="empty">Нет сохранённых шаблонов</div>';
        return;
    }
    list.innerHTML = templates.map(function (t, i) {
        return '<div class="doc-template-card" style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;cursor:pointer" onclick="loadDocTemplate(' + i + ')">' + '<div style="display:flex;justify-content:space-between;align-items:center">' + '<div><strong>' + esc(t.name || 'Шаблон ' + (i + 1)) + '</strong><br><span style="font-size:12px;color:var(--muted)">' + esc(t.storeName || '') + (t.bin ? ' \xB7 ' + esc(t.bin) : '') + '</span></div>' + '<div style="display:flex;gap:4px">' + '<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();editDocTemplate(' + i + ')">\u270F️</button>' + '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteDocTemplate(' + i + ')">\u2715</button>' + '</div></div></div>';
    }).join('');
}

function editDocTemplate(idx) {
    var templates = getDocTemplates();
    var t = templates[idx] || {};
    var f = function (id) {
        return document.getElementById(id);
    };
    f('tpl-name').value = t.name || '';
    f('tpl-storeName').value = t.storeName || '';
    f('tpl-bin').value = t.bin || '';
    f('tpl-iik').value = t.iik || '';
    f('tpl-bik').value = t.bik || '';
    f('tpl-bankName').value = t.bankName || '';
    f('tpl-kbe').value = t.kbe || '';
    f('tpl-paymentCode').value = t.paymentCode || '';
    f('tpl-beneficiary').value = t.beneficiary || '';
    f('tpl-address').value = t.address || '';
    f('tpl-phone').value = t.phone || '';
    f('tpl-directorName').value = t.directorName || '';
    f('tpl-directorPosition').value = t.directorPosition || '';
    f('tpl-extra').value = t.extra || '';
    window._editingDocTemplateIdx = idx;
    f('tpl-modal-title').textContent = 'Редактировать шаблон';
    document.getElementById('tpl-save-btn').onclick = function () {
        saveDocTemplate(idx);
    };
    document.getElementById('tpl-save-as-new-btn').style.display = '';
    openModal('modal-doc-template-edit');
}

function deleteDocTemplate(idx) {
    if (!confirm('Удалить шаблон?'))
        return;
    var templates = getDocTemplates();
    templates.splice(idx, 1);
    setDocTemplates(templates);
    renderDocTemplates();
    toast('Шаблон удалён', 'ok');
}

function addDocTemplate() {
    window._editingDocTemplateIdx = -1;
    var f = function (id) {
        return document.getElementById(id);
    };
    f('tpl-name').value = '';
    f('tpl-storeName').value = '';
    f('tpl-bin').value = '';
    f('tpl-iik').value = '';
    f('tpl-bik').value = '';
    f('tpl-bankName').value = '';
    f('tpl-kbe').value = '';
    f('tpl-paymentCode').value = '';
    f('tpl-beneficiary').value = '';
    f('tpl-address').value = '';
    f('tpl-phone').value = '';
    f('tpl-directorName').value = '';
    f('tpl-directorPosition').value = '';
    f('tpl-extra').value = '';
    f('tpl-modal-title').textContent = 'Новый шаблон';
    document.getElementById('tpl-save-btn').onclick = function () {
        saveDocTemplate(-1);
    };
    document.getElementById('tpl-save-as-new-btn').style.display = 'none';
    openModal('modal-doc-template-edit');
}

function saveDocTemplate(idx) {
    var f = function (id) {
        return document.getElementById(id);
    };
    var t = {
        name: f('tpl-name').value.trim() || 'Шаблон',
        storeName: f('tpl-storeName').value.trim(),
        bin: f('tpl-bin').value.trim(),
        iik: f('tpl-iik').value.trim(),
        bik: f('tpl-bik').value.trim(),
        bankName: f('tpl-bankName').value.trim(),
        kbe: f('tpl-kbe').value.trim(),
        paymentCode: f('tpl-paymentCode').value.trim(),
        beneficiary: f('tpl-beneficiary').value.trim(),
        address: f('tpl-address').value.trim(),
        phone: f('tpl-phone').value.trim(),
        directorName: f('tpl-directorName').value.trim(),
        directorPosition: f('tpl-directorPosition').value.trim(),
        extra: f('tpl-extra').value.trim()
    };
    var templates = getDocTemplates();
    if (idx >= 0 && idx < templates.length) {
        templates[idx] = t;
    } else {
        templates.push(t);
    }
    setDocTemplates(templates);
    closeModal('modal-doc-template-edit');
    renderDocTemplates();
    toast('Шаблон сохранён', 'ok');
}

function loadDocTemplate(idx) {
    window.loadDocTemplateNewDoc(idx);
    var templates = getDocTemplates();
    var t = templates[idx];
    if (!t)
        return;
    var si = {
        storeName: t.storeName,
        bin: t.bin,
        iik: t.iik,
        bik: t.bik,
        bankName: t.bankName,
        kbe: t.kbe,
        paymentCode: t.paymentCode,
        beneficiary: t.beneficiary,
        address: t.address,
        phone: t.phone,
        directorName: t.directorName,
        directorPosition: t.directorPosition,
        extra: t.extra
    };
    var fields = [
        [
            'edit-storeName',
            'storeName'
        ],
        [
            'edit-storeBIN',
            'bin'
        ],
        [
            'edit-iik',
            'iik'
        ],
        [
            'edit-bik',
            'bik'
        ],
        [
            'edit-bankName',
            'bankName'
        ],
        [
            'edit-kbe',
            'kbe'
        ],
        [
            'edit-paymentCode',
            'paymentCode'
        ],
        [
            'edit-beneficiary',
            'beneficiary'
        ],
        [
            'edit-storeAddress',
            'address'
        ],
        [
            'edit-storePhone',
            'phone'
        ],
        [
            'edit-directorName',
            'directorName'
        ],
        [
            'edit-directorPosition',
            'directorPosition'
        ],
        [
            'edit-storeExtra',
            'extra'
        ]
    ];
    fields.forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        if (el)
            el.value = si[pair[1]] || '';
    });
    closeModal('modal-doc-templates');
    _reopenParentModal();
    toast('Шаблон загружен: ' + t.name, 'ok');
}

function loadDocTemplateNewDoc(idx) {
    var templates = getDocTemplates();
    var t = templates[idx];
    if (!t)
        return;
    try {
        localStorage.setItem('ap_selected_template', JSON.stringify(t));
    } catch (e) {
    }
}

function selectDocTemplateForDoc() {
    _closeParentModals();
    openModal('modal-doc-templates');
    renderDocTemplates();
}

function printInvoice(receiptId) {
    try {
        if (!receiptId) {
            toast('Не указан ID накладной', 'err');
            return;
        }
        var html = buildInvoiceHTML(receiptId);
        if (!html && typeof receiptId !== 'string')
            html = buildInvoiceHTML(String(receiptId));
        if (!html) {
            toast('Накладная не найдена', 'err');
            return;
        }
        window._currentPrintReceiptId = receiptId;
        showInvoiceOverlay(html);
    } catch (e) {
        toast('Ошибка: ' + (e && e.message ? e.message : String(e)), 'err');
    }
}

function showInvoiceOverlay(html) {
    var existing = document.getElementById('invoice-overlay');
    if (existing)
        existing.remove();
    var printCSS = '@media print{body>*:not(#invoice-overlay){display:none!important}#invoice-overlay{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:auto!important;background:#fff!important;z-index:999999!important;display:block!important;align-items:initial!important;justify-content:initial!important;padding:0!important}#invoice-overlay .no-print{display:none!important}}';
    var overlay = document.createElement('div');
    overlay.id = 'invoice-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,0.6);display:flex;align-items:flex-start;justify-content:center;padding:20px';
    overlay.innerHTML = '<style>' + printCSS + '</style><div id="invoice-print-area" style="background:#fff;max-width:800px;width:100%;max-height:95vh;overflow-y:auto;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,0.3);padding:30px;position:relative">' + '<div class="no-print" style="position:sticky;top:0;float:right;display:flex;gap:8px;align-items:center;z-index:1;margin-bottom:10px">' + '<button onclick="window.print()" style="padding:8px 20px;font-size:14px;background:#1e40af;color:#fff;border:none;border-radius:6px;cursor:pointer">\uD83D\uDDA8 Печать</button>' + '<button onclick="downloadInvoiceExcel(window._currentPrintReceiptId)" style="padding:8px 20px;font-size:14px;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer">\uD83D\uDCE5 Excel</button>' + '<button onclick="document.getElementById(\'invoice-overlay\').remove()" style="padding:8px 20px;font-size:14px;background:#888;color:#fff;border:none;border-radius:6px;cursor:pointer">\u2715 Закрыть</button>' + '</div>' + html + '</div>';
    document.body.appendChild(overlay);
}

function printSalePKO(receiptId) {
    try {
        if (!receiptId) {
            toast('Не указан ID чека', 'err');
            return;
        }
        var allSales = getSales().filter(isSaleActive);
        var sales = allSales.filter(function (s) {
            return s.receiptId === receiptId;
        });
        if (!sales.length)
            sales = allSales.filter(function (s) {
                return s.id === receiptId;
            });
        if (!sales.length)
            sales = allSales.filter(function (s) {
                return String(s.receiptId) === String(receiptId) || String(s.id) === String(receiptId);
            });
        if (!sales.length) {
            toast('Продажа не найдена', 'err');
            return;
        }
        var first = sales[0];
        var store = window.ApAuth && window.ApAuth.getCurrentStore();
        var storeName = store ? store.storeName : 'SANAQ';
        var total = sales.reduce(function (sum, s) {
            return sum + (Number(s.total) || 0);
        }, 0);
        var html = buildSalePKOHTML(first, receiptId, storeName, total);
        window._currentPrintReceiptId = receiptId;
        showInvoiceOverlay(html);
    } catch (e) {
        toast('Ошибка: ' + (e && e.message ? e.message : String(e)), 'err');
    }
}

async function downloadInvoiceExcel(receiptId) {
    if (!receiptId) {
        toast('ID накладной не указан', 'err');
        return;
    }
    var allSales = getSales().filter(isSaleActive);
    var sales = allSales.filter(function (s) {
        return s.receiptId === receiptId;
    });
    if (!sales.length)
        sales = allSales.filter(function (s) {
            return s.id === receiptId;
        });
    if (!sales.length)
        sales = allSales.filter(function (s) {
            return String(s.receiptId) === String(receiptId) || String(s.id) === String(receiptId);
        });
    if (!sales.length) {
        toast('Нет данных для экспорта', 'err');
        return;
    }
    var first = sales[0];
    var store = window.ApAuth && window.ApAuth.getCurrentStore();
    var storeName = store ? store.storeName : 'SANAQ';
    var bin = localStorage.getItem('ap_store_bin') || '';
    var total = sales.reduce(function (sum, s) {
        return sum + (Number(s.total) || 0);
    }, 0);
    var pay = PAY_LABELS[first.payment] || first.payment || '';
    if (first.payment === 'mixed') {
        var pts = [];
        if (Number(first.cashAmount) > 0)
            pts.push('нал:' + fmtShort(first.cashAmount));
        if (Number(first.kaspiAmount) > 0)
            pts.push('kaspiqr:' + fmtShort(first.kaspiAmount));
        if (Number(first.transferAmount) > 0)
            pts.push('банк:' + fmtShort(first.transferAmount));
        if (pts.length)
            pay = pts.join(' ');
    }
    var headers = [
        '\u2116',
        'Код товара',
        'Наименование',
        'Кол-во',
        'Цена',
        'Сумма'
    ];
    var widths = [
        6,
        18,
        42,
        12,
        14,
        16
    ];
    var rows = sales.map(function (s, i) {
        return [
            i + 1,
            s.productCode || '',
            s.productName || '',
            Number(s.quantity) || 0,
            Number(s.unitPrice) || 0,
            Number(s.total) || 0
        ];
    });
    var hdrRow = [
        storeName + ' \u2014 Накладная \u2116 ' + receiptId.slice(-6),
        '',
        '',
        '',
        '',
        ''
    ];
    var infoRow1 = [
        'Дата: ' + fmtDate(first.date),
        '',
        'Кассир: ' + (first.userName || '\u2014'),
        '',
        '',
        ''
    ];
    var infoRow2 = [
        bin ? 'БИН/ИИН: ' + bin : '',
        '',
        'Оплата: ' + pay,
        '',
        '',
        ''
    ];
    var totalRow = [
        '',
        '',
        '',
        '',
        'Итого:',
        total
    ];
    if (typeof ExcelJS !== 'undefined') {
        var wb = new ExcelJS.Workbook();
        wb.creator = 'SANAQ';
        wb.created = new Date();
        var ws = wb.addWorksheet('Накладная', { views: [{ showGridLines: false }] });
        ws.properties.defaultRowHeight = 20;
        var t = ws.addRow(hdrRow);
        t.height = 30;
        ws.mergeCells(1, 1, 1, 6);
        styleExcelCell(t.getCell(1), {
            font: {
                name: 'Arial',
                size: 14,
                bold: true,
                color: { argb: 'FF1F2937' }
            },
            alignment: {
                horizontal: 'center',
                vertical: 'middle'
            }
        });
        var i1 = ws.addRow(infoRow1);
        ws.mergeCells(2, 1, 2, 2);
        ws.mergeCells(2, 3, 2, 4);
        i1.height = 20;
        i1.eachCell(function (c) {
            styleExcelCell(c, {
                font: {
                    name: 'Arial',
                    size: 10
                },
                alignment: { vertical: 'middle' }
            });
        });
        var i2 = ws.addRow(infoRow2);
        ws.mergeCells(3, 1, 3, 2);
        ws.mergeCells(3, 3, 3, 4);
        i2.height = 20;
        i2.eachCell(function (c) {
            styleExcelCell(c, {
                font: {
                    name: 'Arial',
                    size: 10
                },
                alignment: { vertical: 'middle' }
            });
        });
        ws.addRow([]);
        var th = ws.addRow(headers);
        th.height = 24;
        th.eachCell(function (c, ci) {
            styleExcelCell(c, {
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
                    horizontal: ci === 1 || ci >= 4 ? 'center' : 'left',
                    vertical: 'middle',
                    wrapText: true
                },
                border: {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            });
        });
        var alt = false;
        rows.forEach(function (rd) {
            var rw = ws.addRow(rd);
            rw.eachCell(function (c, ci) {
                styleExcelCell(c, {
                    font: {
                        name: 'Arial',
                        size: 10
                    },
                    alignment: {
                        vertical: 'middle',
                        horizontal: ci >= 4 ? 'right' : ci === 1 ? 'center' : 'left',
                        wrapText: true
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
                if (ci >= 5)
                    c.numFmt = '#,##0';
            });
            alt = !alt;
        });
        ws.addRow([]);
        var totRow = ws.addRow(totalRow);
        ws.mergeCells(totRow.number, 1, totRow.number, 5);
        totRow.eachCell(function (c, ci) {
            styleExcelCell(c, {
                font: {
                    name: 'Arial',
                    size: 11,
                    bold: true
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE5E7EB' }
                },
                alignment: {
                    vertical: 'middle',
                    horizontal: ci < 5 ? 'right' : 'right'
                },
                border: {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            });
            if (ci === 6)
                c.numFmt = '#,##0';
        });
        widths.forEach(function (w, i) {
            ws.getColumn(i + 1).width = w;
        });
        var buffer;
        try { buffer = await wb.xlsx.writeBuffer(); } catch (e) { toast('Ошибка создания Excel: ' + e.message, 'err'); return; }
        saveExcelBuffer(buffer, 'Nakladnaya_' + receiptId.slice(-6) + '.xlsx');
        toast('Excel файл скачан', 'ok');
    } else {
        exportAoAToExcel(rows, 'Nakladnaya_' + receiptId.slice(-6), 'Накладная', widths);
    }
}

function renderDocuments() {
    var docs = getDocuments();
    var search = (document.getElementById('doc-search') || {}).value || '';
    var typeFilter = (document.getElementById('doc-type-filter') || {}).value || 'all';
    var statusFilter = (document.getElementById('doc-status-filter') || {}).value || 'all';
    var filtered = docs.filter(function (d) {
        var dt = d.type || d.docType || '';
        if (typeFilter !== 'all' && dt !== typeFilter)
            return false;
        if (statusFilter !== 'all' && d.status !== statusFilter)
            return false;
        if (search) {
            var s = search.toLowerCase();
            var numMatch = (d.number || d.docNumber || '').toLowerCase().indexOf(s) >= 0;
            var clientMatch = (d.clientName || d.recipientName || d.customerName || '').toLowerCase().indexOf(s) >= 0;
            if (!numMatch && !clientMatch)
                return false;
        }
        return true;
    });
    var el = document.getElementById('documents-table');
    if (!el)
        return;
    if (!filtered.length) {
        el.innerHTML = '<div class="empty">Документов не найдено</div>';
        return;
    }
    el.innerHTML = tableHTML([
        'Номер',
        'Тип',
        'Клиент/Получатель',
        'Сумма',
        'Статус',
        'Дата',
        'Действия'
    ], filtered.map(function (d) {
        var dt = d.type || d.docType || '';
        var typeLabel = dt === 'invoice' ? 'Счет на оплату' : dt === 'z2' ? 'Накладная З-2' : dt === 'invoice_sf' ? '\uD83D\uDCC4 Счёт-фактура' : dt === 'deferred' ? '\uD83D\uDCCB Отложенный' : dt || '\u2014';
        var statusLabel = d.status === 'pending' ? '<span class="badge badge-warn">Ожидает</span>' : d.status === 'paid' ? '<span class="badge badge-ok">Оплачено</span>' : d.status === 'issued' ? '<span class="badge badge-info">Выписано</span>' : d.status === 'cancelled' ? '<span class="badge badge-danger">Отменено</span>' : d.status;
        var client = d.clientName || d.recipientName || d.customerName || '\u2014';
        var docNum = d.number || d.docNumber || '\u2116' + d.id.slice(0, 6);
        var actions = '<div style="display:flex;gap:4px;flex-wrap:nowrap">' + '<button class="btn btn-secondary btn-sm" onclick="openDocumentView(\'' + d.id + '\')" title="Открыть">\uD83D\uDC41</button>' + '<button class="btn btn-warning btn-sm" onclick="openDocumentEditById(\'' + d.id + '\')" title="Редактировать">\u270F️</button>' + '<button class="btn btn-info btn-sm" onclick="duplicateDocument(\'' + d.id + '\')" title="Дублировать">\uD83D\uDCCB</button>' + '<button class="btn btn-info btn-sm" onclick="downloadDocumentPdf(\'' + d.id + '\')" title="Скачать PDF">\uD83D\uDCC4</button>' + '<button class="btn btn-success btn-sm" onclick="downloadDocumentExcelById(\'' + d.id + '\')" title="Скачать Excel">\uD83D\uDCCA</button>' + '<button class="btn btn-secondary btn-sm" onclick="printDocumentById(\'' + d.id + '\')" title="Печать">\uD83D\uDDA8️</button>' + '<button class="btn btn-danger btn-sm" onclick="deleteDocument(\'' + d.id + '\')" title="Удалить">\u274C</button>' + '</div>';
        return [
            '<a href="#" onclick="openDocumentView(\'' + d.id + '\');return false">' + docNum + '</a>',
            typeLabel,
            client,
            fmt(d.total || 0),
            statusLabel,
            fmtDate(d.date || d.documentDate),
            actions
        ];
    }));
}

function openDocumentEditById(docId) {
    window._currentDocId = docId;
    openModal('modal-view-document');
    openDocumentEdit();
}

function deleteDocument(docId) {
    if (!docId) {
        toast('ID документа не указан', 'err');
        return;
    }
    confirmAction('Удалить документ?', 'Документ будет удалён безвозвратно.', function () {
        if (window.ApDb && typeof window.ApDb.deleteDocument === 'function') {
            window.ApDb.deleteDocument(docId);
        } else {
            var docs = getDocuments();
            var idx = docs.findIndex(function (d) {
                return d.id === docId;
            });
            if (idx >= 0) {
                docs.splice(idx, 1);
                setDocuments(docs);
            }
        }
        window._currentDocId = null;
        closeModal('modal-view-document');
        renderDocuments();
        toast('Документ удалён', 'ok');
    });
}

function duplicateDocument(docId) {
    if (!docId) {
        toast('ID документа не указан', 'err');
        return;
    }
    var docs = getDocuments();
    var src = docs.find(function (d) {
        return d.id === docId;
    });
    if (!src) {
        toast('Документ не найден', 'err');
        return;
    }
    var copy = JSON.parse(JSON.stringify(src));
    copy.id = uid();
    copy.number = '';
    copy.status = 'pending';
    copy.date = new Date().toISOString();
    docs.unshift(copy);
    setDocuments(docs);
    renderDocuments();
    toast('Документ дублирован', 'ok');
    openDocumentView(copy.id);
}

function downloadDocumentPdf(docId) {
    window._currentDocId = docId;
    openDocumentView(docId);
    setTimeout(function () {
        printDocument();
    }, 300);
}

function printDocumentById(docId) {
    window._currentDocId = docId;
    openDocumentView(docId);
    setTimeout(function () {
        printDocument();
    }, 300);
}

function downloadDocumentExcelById(docId) {
    window._currentDocId = docId;
    downloadDocumentExcel();
}

function openCreateInvoiceModal() {
    openModal('modal-create-invoice');
    document.getElementById('invoice-items-tbody').innerHTML = '';
    addInvoiceItemRow();
    var deferred = getDeferred().filter(function (d) {
        return d.status === 'pending';
    });
    var container = document.getElementById('deferred-checkboxes');
    if (container) {
        if (!deferred.length) {
            container.innerHTML = '<div style="color:var(--text-muted);padding:8px">Нет отложенных товаров</div>';
        } else {
            container.innerHTML = deferred.map(function (d) {
                var detail = (d.items || []).map(function (it) {
                    return '<div style="padding:2px 0 2px 24px;font-size:0.9em;color:var(--text-muted)">' + esc(it.productName) + ' \xD7 ' + it.quantity + ' = ' + fmt(it.total) + '</div>';
                }).join('');
                return '<div style="padding:6px 0;border-bottom:1px solid var(--border)">' + '<label style="display:flex;align-items:center;gap:8px;cursor:pointer">' + '<input type="checkbox" value="' + d.id + '" onchange="updateInvoiceTypeUI()"> ' + '<strong>' + esc(d.customerName || 'Без клиента') + '</strong> \u2014 ' + fmt(d.total) + ' (' + (d.items ? d.items.length : 0) + ' поз.)</label>' + detail + '</div>';
            }).join('');
        }
    }
    document.getElementById('invoice-type').value = 'manual';
    updateInvoiceTypeUI();
}

function openCreateZ2Modal() {
    openModal('modal-create-z2');
    document.getElementById('z2-items-tbody').innerHTML = '';
    addZ2ItemRow();
    var deferred = getDeferred().filter(function (d) {
        return d.status === 'pending';
    });
    var container = document.getElementById('z2-checkboxes');
    if (container) {
        if (!deferred.length) {
            container.innerHTML = '<div style="color:var(--text-muted);padding:8px">Нет отложенных товаров</div>';
        } else {
            container.innerHTML = deferred.map(function (d) {
                var detail = (d.items || []).map(function (it) {
                    return '<div style="padding:2px 0 2px 24px;font-size:0.9em;color:var(--text-muted)">' + esc(it.productName) + ' \xD7 ' + it.quantity + ' = ' + fmt(it.total) + '</div>';
                }).join('');
                return '<div style="padding:6px 0;border-bottom:1px solid var(--border)">' + '<label style="display:flex;align-items:center;gap:8px;cursor:pointer">' + '<input type="checkbox" value="' + d.id + '" onchange="updateZ2TypeUI()"> ' + '<strong>' + esc(d.customerName || 'Без клиента') + '</strong> \u2014 ' + fmt(d.total) + ' (' + (d.items ? d.items.length : 0) + ' поз.)</label>' + detail + '</div>';
            }).join('');
        }
    }
    document.getElementById('z2-type').value = 'manual';
    updateZ2TypeUI();
}

function updateInvoiceTypeUI() {
    var type = document.getElementById('invoice-type').value;
    var manual = document.getElementById('invoice-manual-input');
    var deferredSel = document.getElementById('invoice-deferred-select');
    if (manual)
        manual.style.display = type === 'manual' ? '' : 'none';
    if (deferredSel)
        deferredSel.style.display = type === 'deferred' ? '' : 'none';
}

function updateZ2TypeUI() {
    var type = document.getElementById('z2-type').value;
    var manual = document.getElementById('z2-manual-input');
    var deferredSel = document.getElementById('z2-deferred-select');
    if (manual)
        manual.style.display = type === 'manual' ? '' : 'none';
    if (deferredSel)
        deferredSel.style.display = type === 'deferred' ? '' : 'none';
}

function addInvoiceItemRow() {
    addDocItemRow('invoice-items-tbody');
}

function addZ2ItemRow() {
    addDocItemRow('z2-items-tbody');
}

function addSFItemRow() {
    addDocItemRow('sf-items-tbody');
}

function saveNewInvoice() {
    var type = document.getElementById('invoice-type').value;
    var items = [];
    var idsToRemove = [];
    if (type === 'deferred') {
        var checks = document.querySelectorAll('#deferred-checkboxes input:checked');
        if (!checks.length) {
            toast('Выберите отложенные товары', 'err');
            return;
        }
        var deferred = getDeferred();
        var checkedIds = [];
        checks.forEach(function (cb) {
            checkedIds.push(cb.value);
        });
        deferred.forEach(function (d) {
            if (checkedIds.indexOf(d.id) >= 0) {
                (d.items || []).forEach(function (it) {
                    items.push({
                        productCode: it.productCode,
                        productName: it.productName,
                        quantity: it.quantity,
                        unitPrice: it.unitPrice,
                        total: it.total
                    });
                });
                idsToRemove.push(d.id);
            }
        });
    } else {
        items = getDocItemsFromTable('invoice-items-tbody');
        if (!items.length) {
            toast('Добавьте товары в таблицу', 'err');
            return;
        }
    }
    var customerName = document.getElementById('invoice-customer-name').value.trim();
    var customerPhone = document.getElementById('invoice-customer-phone').value.trim();
    var docs = getDocuments();
    var docItems = getDocumentItems();
    var templateMeta = {};
    try {
        var tpl = JSON.parse(localStorage.getItem('ap_selected_template') || 'null');
        if (tpl) {
            templateMeta = {
                storeName: tpl.storeName,
                bin: tpl.bin,
                iik: tpl.iik,
                bik: tpl.bik,
                bankName: tpl.bankName,
                kbe: tpl.kbe,
                paymentCode: tpl.paymentCode,
                beneficiary: tpl.beneficiary,
                address: tpl.address,
                phone: tpl.phone,
                directorName: tpl.directorName,
                directorPosition: tpl.directorPosition,
                extra: tpl.extra
            };
        }
    } catch (e) {
    }
    var docId = uid();
    if (type === 'deferred' && idsToRemove.length === 1) {
        docId = idsToRemove[0];
        docs = docs.map(function (d) {
            if (d.id !== docId)
                return d;
            return Object.assign({}, d, {
                type: 'invoice',
                docType: 'invoice',
                items: items,
                clientName: customerName,
                clientPhone: customerPhone,
                total: items.reduce(function (s, it) {
                    return s + (it.total || it.unitPrice * it.quantity);
                }, 0),
                status: 'pending',
                date: new Date().toISOString(),
                documentDate: new Date().toISOString(),
                meta: { storeInfo: templateMeta }
            });
        });
    } else if (type === 'deferred' && idsToRemove.length > 1) {
        docId = uid();
        docs = docs.map(function (d) {
            if (idsToRemove.indexOf(d.id) >= 0) {
                return Object.assign({}, d, { status: 'completed' });
            }
            return d;
        });
        docs.unshift({
            id: docId,
            type: 'invoice',
            docType: 'invoice',
            number: '',
            docNumber: '',
            items: items,
            clientName: customerName,
            clientPhone: customerPhone,
            total: items.reduce(function (s, it) {
                return s + (it.total || it.unitPrice * it.quantity);
            }, 0),
            status: 'pending',
            date: new Date().toISOString(),
            documentDate: new Date().toISOString(),
            meta: { storeInfo: templateMeta }
        });
    } else {
        var doc = {
            id: docId,
            type: 'invoice',
            docType: 'invoice',
            number: '',
            docNumber: '',
            items: items,
            clientName: customerName,
            clientPhone: customerPhone,
            total: items.reduce(function (s, it) {
                return s + (it.total || it.unitPrice * it.quantity);
            }, 0),
            status: 'pending',
            date: new Date().toISOString(),
            documentDate: new Date().toISOString(),
            meta: { storeInfo: templateMeta }
        };
        docs.unshift(doc);
    }
    setDocuments(docs);
    items.forEach(function (it) {
        docItems.push({
            id: uid(),
            documentId: docId,
            storeId: null,
            productId: null,
            productCode: it.productCode || '',
            productName: it.productName || '',
            unit: 'шт',
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
            createdAt: new Date().toISOString()
        });
    });
    setDocumentItems(docItems);
    if (idsToRemove.length) {
        var allDef = getDeferred();
        allDef.forEach(function (d) {
            if (idsToRemove.indexOf(d.id) >= 0) {
                d.status = 'completed';
                d.completedAt = new Date().toISOString();
            }
        });
        setDeferred(allDef);
    }
    if (type === 'deferred') {
        clearSaleSelection(true);
        renderPosCatBrowser();
    }
    toast('Счет на оплату создан', 'ok');
    closeModal('modal-create-invoice');
    renderDocuments();
}

function saveNewZ2() {
    var type = document.getElementById('z2-type').value;
    var items = [];
    var idsToRemove = [];
    if (type === 'deferred') {
        var checks = document.querySelectorAll('#z2-checkboxes input:checked');
        if (!checks.length) {
            toast('Выберите отложенные товары', 'err');
            return;
        }
        var deferred = getDeferred();
        var checkedIds = [];
        checks.forEach(function (cb) {
            checkedIds.push(cb.value);
        });
        deferred.forEach(function (d) {
            if (checkedIds.indexOf(d.id) >= 0) {
                (d.items || []).forEach(function (it) {
                    items.push({
                        productCode: it.productCode,
                        productName: it.productName,
                        quantity: it.quantity,
                        unitPrice: it.unitPrice,
                        total: it.total
                    });
                });
                idsToRemove.push(d.id);
            }
        });
    } else {
        items = getDocItemsFromTable('z2-items-tbody');
        if (!items.length) {
            toast('Добавьте товары в таблицу', 'err');
            return;
        }
    }
    var recipientName = document.getElementById('z2-recipient-name').value.trim();
    var docs = getDocuments();
    var docItems = getDocumentItems();
    var templateMeta = {};
    try {
        var tpl = JSON.parse(localStorage.getItem('ap_selected_template') || 'null');
        if (tpl) {
            templateMeta = {
                storeName: tpl.storeName,
                bin: tpl.bin,
                iik: tpl.iik,
                bik: tpl.bik,
                bankName: tpl.bankName,
                kbe: tpl.kbe,
                paymentCode: tpl.paymentCode,
                beneficiary: tpl.beneficiary,
                address: tpl.address,
                phone: tpl.phone,
                directorName: tpl.directorName,
                directorPosition: tpl.directorPosition,
                extra: tpl.extra
            };
        }
    } catch (e) {
    }
    var docId = uid();
    if (type === 'deferred' && idsToRemove.length === 1) {
        docId = idsToRemove[0];
        docs = docs.map(function (d) {
            if (d.id !== docId)
                return d;
            return Object.assign({}, d, {
                type: 'z2',
                docType: 'z2',
                items: items,
                recipientName: recipientName,
                total: items.reduce(function (s, it) {
                    return s + (it.total || it.unitPrice * it.quantity);
                }, 0),
                status: 'pending',
                date: new Date().toISOString(),
                documentDate: new Date().toISOString(),
                meta: { storeInfo: templateMeta }
            });
        });
    } else if (type === 'deferred' && idsToRemove.length > 1) {
        docId = uid();
        docs = docs.map(function (d) {
            if (idsToRemove.indexOf(d.id) >= 0) {
                return Object.assign({}, d, { status: 'completed' });
            }
            return d;
        });
        docs.unshift({
            id: docId,
            type: 'z2',
            docType: 'z2',
            number: '',
            docNumber: '',
            items: items,
            recipientName: recipientName,
            total: items.reduce(function (s, it) {
                return s + (it.total || it.unitPrice * it.quantity);
            }, 0),
            status: 'pending',
            date: new Date().toISOString(),
            documentDate: new Date().toISOString(),
            meta: { storeInfo: templateMeta }
        });
    } else {
        var doc = {
            id: docId,
            type: 'z2',
            docType: 'z2',
            number: '',
            docNumber: '',
            items: items,
            recipientName: recipientName,
            total: items.reduce(function (s, it) {
                return s + (it.total || it.unitPrice * it.quantity);
            }, 0),
            status: 'pending',
            date: new Date().toISOString(),
            documentDate: new Date().toISOString(),
            meta: { storeInfo: templateMeta }
        };
        docs.unshift(doc);
    }
    setDocuments(docs);
    items.forEach(function (it) {
        docItems.push({
            id: uid(),
            documentId: docId,
            storeId: null,
            productId: null,
            productCode: it.productCode || '',
            productName: it.productName || '',
            unit: 'шт',
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
            createdAt: new Date().toISOString()
        });
    });
    setDocumentItems(docItems);
    if (idsToRemove.length) {
        var allDef = getDeferred();
        allDef.forEach(function (d) {
            if (idsToRemove.indexOf(d.id) >= 0) {
                d.status = 'completed';
                d.completedAt = new Date().toISOString();
            }
        });
        setDeferred(allDef);
    }
    if (type === 'deferred') {
        clearSaleSelection(true);
        renderPosCatBrowser();
    }
    toast('Накладная З-2 создана', 'ok');
    closeModal('modal-create-z2');
    renderDocuments();
}

function openCreateSFFModal() {
    openModal('modal-create-sf');
    document.getElementById('sf-customer-iin').value = '';
    document.getElementById('sf-customer-address').value = '';
    document.getElementById('sf-items-tbody').innerHTML = '';
    addSFItemRow();
}

function saveNewSFF() {
    var customerName = document.getElementById('sf-customer-name').value.trim();
    var customerIIN = document.getElementById('sf-customer-iin').value.trim();
    var customerAddress = document.getElementById('sf-customer-address').value.trim();
    var items = getDocItemsFromTable('sf-items-tbody');
    if (!customerName) {
        toast('Введите покупателя', 'err');
        return;
    }
    if (!items.length) {
        toast('Добавьте товары', 'err');
        return;
    }
    var templateMeta = {};
    try {
        var tpl = JSON.parse(localStorage.getItem('ap_selected_template') || 'null');
        if (tpl) {
            templateMeta = {
                storeName: tpl.storeName,
                bin: tpl.bin,
                iik: tpl.iik,
                bik: tpl.bik,
                bankName: tpl.bankName,
                kbe: tpl.kbe,
                paymentCode: tpl.paymentCode,
                beneficiary: tpl.beneficiary,
                address: tpl.address,
                phone: tpl.phone,
                directorName: tpl.directorName,
                directorPosition: tpl.directorPosition,
                extra: tpl.extra
            };
        }
    } catch (e) {
    }
    var docId = uid();
    var docs = getDocuments();
    var docItems = getDocumentItems();
    var total = items.reduce(function (s, it) {
        return s + (it.total || it.unitPrice * it.quantity);
    }, 0);
    var doc = {
        id: docId,
        type: 'invoice_sf',
        docType: 'invoice_sf',
        number: '',
        docNumber: '',
        items: items,
        customerName: customerName,
        customerIIN: customerIIN,
        customerAddress: customerAddress,
        total: total,
        status: 'pending',
        date: new Date().toISOString(),
        documentDate: new Date().toISOString(),
        meta: {
            customerIIN: customerIIN,
            customerAddress: customerAddress,
            storeInfo: templateMeta
        }
    };
    docs.unshift(doc);
    setDocuments(docs);
    items.forEach(function (it) {
        docItems.push({
            id: uid(),
            documentId: docId,
            storeId: null,
            productId: null,
            productCode: it.productCode || '',
            productName: it.productName || '',
            unit: 'шт',
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
            createdAt: new Date().toISOString()
        });
    });
    setDocumentItems(docItems);
    toast('Счёт-фактура создан', 'ok');
    closeModal('modal-create-sf');
    renderDocuments();
}

function openCreatePKOModal() {
    document.getElementById('pko-payer').value = '';
    document.getElementById('pko-basis').value = '';
    document.getElementById('pko-amount').value = 0;
    openModal('modal-create-pko');
}

function saveNewPKO() {
    var payer = document.getElementById('pko-payer').value.trim();
    var basis = document.getElementById('pko-basis').value.trim();
    var amount = parseFloat(document.getElementById('pko-amount').value) || 0;
    if (!payer) {
        toast('Введите от кого получено', 'err');
        return;
    }
    if (!basis) {
        toast('Введите основание', 'err');
        return;
    }
    if (amount <= 0) {
        toast('Введите сумму', 'err');
        return;
    }
    var docId = uid();
    var docs = getDocuments();
    var doc = {
        id: docId,
        type: 'pko',
        docType: 'pko',
        number: '',
        docNumber: '',
        customerName: payer,
        basis: basis,
        total: amount,
        status: 'issued',
        date: new Date().toISOString(),
        documentDate: new Date().toISOString(),
        meta: {}
    };
    docs.unshift(doc);
    setDocuments(docs);
    toast('ПКО создан: ' + fmt(amount) + ' \u20B8 от ' + payer, 'ok');
    closeModal('modal-create-pko');
    renderDocuments();
}

function buildClassicInvoiceHTML(doc) {
    var si = doc.meta && doc.meta.storeInfo || {};
    var storeName = si.storeName || 'Организация';
    var bin = si.bin || '\u2014';
    var iik = si.iik || '\u2014';
    var bik = si.bik || '\u2014';
    var bankName = si.bankName || '\u2014';
    var kbe = si.kbe || '\u2014';
    var beneficiary = si.beneficiary || storeName;
    var paymentCode = si.paymentCode || '';
    var address = si.address || '';
    var phone = si.phone || '';
    var directorName = si.directorName || '';
    var directorPosition = si.directorPosition || 'Директор';
    var extraInfo = si.extra || '';
    var logoData = si.logo || '';
    var contractText = doc.meta && doc.meta.contract || 'Без договора';
    var amountWords = window.classicAmountWords(doc.total);
    var totalQty = 0;
    (doc.items || []).forEach(function (it) {
        totalQty += Number(it.quantity || 0);
    });
    var h = '<div style="font-family:\'Times New Roman\',Times,serif;color:#000;max-width:980px;margin:0 auto;padding:24px 20px;font-size:13px;line-height:1.4">';
    h += '<div style="font-size:11px;line-height:1.4;padding:8px 12px;border:1px solid #000;background:#fafafa;margin-bottom:16px">' + 'Внимание! Оплата данного счета означает согласие с условиями поставки товара. Уведомление об оплате обязательно, в противном случае не гарантируется наличие товара на складе. Товар отпускается по факту прихода денег на р/с Поставщика, самовывозом, при наличии доверенности и документов, удостоверяющих личность.' + '</div>';
    h += '<div style="text-align:center;margin-bottom:20px"><div style="font-weight:700;font-size:20px;letter-spacing:1px">Счет на оплату \u2116 ' + escapeHtml(doc.docNumber || '') + '</div>' + '<div style="margin-top:4px;font-size:13px">от ' + fmtDate(doc.documentDate) + '</div></div>';
    h += '<div style="margin-bottom:12px">';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;border:1px solid #000;padding:8px;font-size:12px">' + '<div><strong>Бенефициар:</strong><br>' + escapeHtml(beneficiary) + '</div>' + '<div><strong>ИИК:</strong><br>' + escapeHtml(iik) + '</div>' + '<div><strong>КБЕ:</strong><br>' + escapeHtml(kbe || '\u2014') + '</div>' + '</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;border:1px solid #000;border-top:none;padding:8px;font-size:12px">' + '<div><strong>ИИН:</strong> ' + escapeHtml(bin) + '</div>' + '<div></div><div></div>' + '</div>';
    h += '<div style="display:grid;grid-template-columns:2fr 1fr 2fr;gap:8px;border:1px solid #000;border-top:none;padding:8px;font-size:12px">' + '<div><strong>Банк бенефициара:</strong></div>' + '<div><strong>БИК:</strong></div>' + '<div><strong>Код назначения платежа:</strong></div>' + '</div>';
    h += '<div style="display:grid;grid-template-columns:2fr 1fr 2fr;gap:8px;border:1px solid #000;border-top:none;padding:8px;font-size:12px">' + '<div>' + escapeHtml(bankName) + '</div>' + '<div>' + escapeHtml(bik) + '</div>' + '<div>' + (paymentCode ? escapeHtml(paymentCode) : '') + '</div>' + '</div>';
    h += '</div>';
    h += '<div style="margin-bottom:12px;font-size:12px">';
    h += '<div><strong>Поставщик:</strong> БИН / ИИН ' + escapeHtml(bin) + ', ' + escapeHtml(storeName) + '</div>';
    var custIIN = si.customerIIN || '';
    var custAddr = si.customerAddress || '';
    var buyerStr = escapeHtml(doc.customerName || '\u2014');
    if (custIIN)
        buyerStr = 'БИН / ИИН ' + escapeHtml(custIIN) + ',' + buyerStr;
    if (custAddr)
        buyerStr += ' ' + escapeHtml(custAddr);
    h += '<div><strong>Покупатель:</strong> ' + buyerStr + '</div>';
    h += '<div><strong>Договор:</strong> ' + escapeHtml(contractText) + '</div>';
    h += '</div>';
    h += '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:14px">';
    h += '<thead><tr>' + '<th style="padding:8px;border:1px solid #000;text-align:center;width:36px">\u2116</th>' + '<th style="padding:8px;border:1px solid #000;text-align:left">Наименование</th>' + '<th style="padding:8px;border:1px solid #000;text-align:center;width:60px">Кол-во</th>' + '<th style="padding:8px;border:1px solid #000;text-align:center;width:50px">Ед.</th>' + '<th style="padding:8px;border:1px solid #000;text-align:right;width:100px">Цена</th>' + '<th style="padding:8px;border:1px solid #000;text-align:right;width:120px">Сумма</th>' + '</tr></thead><tbody>';
    (doc.items || []).forEach(function (it, i) {
        h += '<tr>' + '<td style="padding:8px;border:1px solid #000;text-align:center">' + (i + 1) + '</td>' + '<td style="padding:8px;border:1px solid #000">' + escapeHtml(it.productName || it.productCode || '') + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:center">' + (it.quantity || 0) + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:center">' + escapeHtml(it.unit || 'шт') + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:right">' + fmt(it.unitPrice) + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:right">' + fmt(it.total) + '</td>' + '</tr>';
    });
    h += '</tbody></table>';
    h += '<div style="text-align:right;margin-bottom:6px;font-size:15px;font-weight:700">Итого: ' + fmt(doc.total) + '</div>';
    h += '<div style="margin-bottom:14px;font-size:12px">';
    h += '<div>Всего наименований ' + (doc.items || []).length + ', на сумму ' + Number(doc.total || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2 }) + ' KZT</div>';
    h += '<div><strong>Всего к оплате:</strong> ' + escapeHtml(amountWords) + '</div>';
    h += '</div>';
    h += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-top:20px">';
    h += '<div style="text-align:left">Исполнитель</div>';
    h += '<div style="text-align:right">/' + escapeHtml(directorName || '________') + '/</div>';
    h += '</div>';
    h += '</div>';
    return h;
}

function buildClassicZ2HTML(doc) {
    var si = doc.meta && doc.meta.storeInfo || {};
    var storeName = si.storeName || 'Организация';
    var bin = si.bin || '\u2014';
    var address = si.address || '';
    var phone = si.phone || '';
    var directorName = si.directorName || '';
    var directorPosition = si.directorPosition || 'Директор';
    var extraInfo = si.extra || '';
    var totalQty = 0;
    (doc.items || []).forEach(function (it) {
        totalQty += Number(it.quantity || 0);
    });
    var h = '<div style="font-family:\'Times New Roman\',Times,serif;color:#000;max-width:980px;margin:0 auto;padding:24px 20px;font-size:13px;line-height:1.4">';
    h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">' + '<div style="font-size:12px;line-height:1.4">Приложение 26<br>к приказу Министра финансов<br>Республики Казахстан<br>от 20 декабря 2012 года \u2116 562</div>' + '<div style="font-size:16px;font-weight:700">Форма 3-2</div></div>';
    h += '<div style="text-align:center;font-size:18px;font-weight:700;margin-bottom:14px">НАКЛАДНАЯ НА ОТПУСК ЗАПАСОВ НА СТОРОНУ</div>';
    var senderLines = '<strong>Организация (индивидуальный предприниматель) - отправитель:</strong> ' + escapeHtml(storeName) + '<br><strong>БИН/ИИН:</strong> ' + escapeHtml(bin);
    if (address)
        senderLines += '<br><strong>Адрес:</strong> ' + escapeHtml(address);
    if (phone)
        senderLines += '<br><strong>Тел:</strong> ' + escapeHtml(phone);
    if (directorName)
        senderLines += '<br><strong>' + escapeHtml(directorPosition) + ':</strong> ' + escapeHtml(directorName);
    if (extraInfo)
        senderLines += '<br><em>' + escapeHtml(extraInfo) + '</em>';
    h += '<div style="margin-bottom:14px">' + senderLines + '</div>';
    var custIIN = si.customerIIN || '';
    var custAddr = si.customerAddress || '';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">';
    var recHtml = '<strong>Организация (ИП) - получатель:</strong><br>' + escapeHtml(doc.customerName || '\u2014');
    if (custIIN)
        recHtml += '<br><strong>БИН/ИИН:</strong> ' + escapeHtml(custIIN);
    if (custAddr)
        recHtml += '<br>' + escapeHtml(custAddr);
    h += '<div>' + recHtml + '</div>';
    h += '<div><strong>Номер документа:</strong> ' + escapeHtml(doc.docNumber || '') + '<br><strong>Дата составления:</strong> ' + fmtDate(doc.documentDate) + '</div>';
    h += '</div>';
    h += '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">';
    h += '<thead><tr>' + '<th style="padding:8px;border:1px solid #000;text-align:center;width:36px">\u2116 п/п</th>' + '<th style="padding:8px;border:1px solid #000;text-align:center;width:100px">Номенклатурный номер</th>' + '<th style="padding:8px;border:1px solid #000;text-align:left">Наименование, характеристика</th>' + '<th style="padding:8px;border:1px solid #000;text-align:center;width:50px">Ед.изм.</th>' + '<th style="padding:8px;border:1px solid #000;text-align:right;width:70px">Количество</th>' + '<th style="padding:8px;border:1px solid #000;text-align:right;width:100px">Цена за единицу, KZT</th>' + '<th style="padding:8px;border:1px solid #000;text-align:right;width:120px">Сумма с НДС, KZT</th>' + '</tr></thead><tbody>';
    (doc.items || []).forEach(function (it, i) {
        h += '<tr>' + '<td style="padding:8px;border:1px solid #000;text-align:center">' + (i + 1) + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:center">' + escapeHtml(it.productCode || '') + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:left">' + escapeHtml(it.productName || '') + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:center">' + escapeHtml(it.unit || 'шт') + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:right">' + (it.quantity || 0) + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:right">' + fmt(it.unitPrice) + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:right">' + fmt(it.total) + '</td>' + '</tr>';
    });
    h += '</tbody></table>';
    h += '<div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:13px">' + '<div><strong>Итого наименований:</strong> ' + (doc.items || []).length + ', <strong>на сумму:</strong> ' + fmt(doc.total) + '</div>' + '<div><strong>Всего отпущено количество:</strong> ' + totalQty + '</div>' + '</div>';
    h += '<div style="display:flex;justify-content:space-between;gap:14px;font-size:12px">';
    h += '<div style="flex:1;min-width:300px">';
    h += '<div style="border:1px solid #000;padding:10px;margin-bottom:8px">' + '<div style="margin-bottom:6px"><strong>Отпуск разрешил:</strong></div>' + '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' + '<span style="font-size:11px">' + escapeHtml(directorPosition) + '</span>' + '<span style="font-size:11px">_______________</span>' + '<span style="font-size:11px">_______________</span>' + '</div>' + '<div style="font-size:10px;text-align:right">должность&nbsp;&nbsp;&nbsp;подпись&nbsp;&nbsp;&nbsp;расшифровка подписи</div>' + '</div>';
    h += '<div style="border:1px solid #000;padding:10px;margin-bottom:8px">' + '<div style="margin-bottom:6px"><strong>Главный бухгалтер:</strong></div>' + '<div style="display:flex;justify-content:flex-end;gap:20px;margin-bottom:4px">' + '<span style="font-size:11px">_______________</span>' + '<span style="font-size:11px">_______________</span>' + '</div>' + '<div style="font-size:10px;text-align:right">подпись&nbsp;&nbsp;&nbsp;расшифровка подписи</div>' + '</div>';
    h += '<div style="border:1px solid #000;padding:10px">' + '<div style="margin-bottom:6px"><strong>Отпустил:</strong></div>' + '<div style="display:flex;justify-content:flex-end;gap:20px;margin-bottom:4px">' + '<span style="font-size:11px">_______________</span>' + '<span style="font-size:11px">_______________</span>' + '</div>' + '<div style="font-size:10px;text-align:right">подпись&nbsp;&nbsp;&nbsp;расшифровка подписи</div>' + '</div>';
    h += '</div>';
    h += '<div style="flex:1;min-width:300px">';
    h += '<div style="border:1px solid #000;padding:10px">' + '<div style="margin-bottom:6px"><strong>Запасы получил:</strong></div>' + '<div style="display:flex;justify-content:flex-end;gap:20px;margin-bottom:4px">' + '<span style="font-size:11px">_______________</span>' + '<span style="font-size:11px">_______________</span>' + '</div>' + '<div style="font-size:10px;text-align:right;margin-bottom:8px">подпись&nbsp;&nbsp;&nbsp;расшифровка подписи</div>' + '<div style="font-size:11px;border-top:1px solid #ccc;padding-top:6px">' + 'по доверенности \u2116 ________________ от ___ _________ 20__ года<br>выданной __________________________________________________' + '</div>' + '</div>';
    h += '</div>';
    h += '</div>';
    h += '</div>';
    return h;
}

function buildClassicSFHTML(doc) {
    var store = window.ApAuth && window.ApAuth.getCurrentStore();
    var si = doc.meta && doc.meta.storeInfo || {};
    var storeName = si.storeName || (store ? store.storeName : 'SANAQ');
    var storeBin = si.bin || localStorage.getItem('ap_store_bin') || '';
    var storeNdscert = si.ndsCert || localStorage.getItem('ap_store_nds_cert') || '';
    var storeAddr = si.address || localStorage.getItem('ap_store_address') || '';
    var bankName = si.bankName || localStorage.getItem('ap_store_bank_name') || '';
    var iik = si.iik || localStorage.getItem('ap_store_iik') || '';
    var bik = si.bik || localStorage.getItem('ap_store_bik') || '';
    var items = doc.items || [];
    var total = doc.total || 0;
    var ndsRate = 12;
    var totalNoNds = 0, totalNds = 0;
    function ndsRow(v) {
        return v * ndsRate / (100 + ndsRate);
    }
    function ndsOnly(v) {
        return v - ndsRow(v);
    }
    var h = '<div style="font-family:\'Times New Roman\',Times,serif;color:#000;max-width:960px;margin:0 auto;padding:24px 20px;font-size:12px;line-height:1.4">';
    h += '<div style="font-size:10px;color:#555;text-align:right;margin-bottom:4px">Форма по ОКУД 0710002</div>';
    h += '<div style="text-align:center;font-size:18px;font-weight:700;margin-bottom:4px">СЧЁТ-ФАКТУРА</div>';
    h += '<div style="text-align:center;font-size:12px;color:#333;margin-bottom:16px">Счёт-фактура \u2116 ' + (doc.docNumber || doc.number || doc.id.slice(0, 6)) + ' от "' + fmtDate(doc.documentDate).replace(/(\d+)\.(\d+)\.(\d+).*/, '$1 $2 $3') + '"</div>';
    h += '<div style="text-align:center;font-size:11px;color:#666;margin-bottom:16px">Дата совершения оборота: "' + fmtDate(doc.documentDate).replace(/(\d+)\.(\d+)\.(\d+).*/, '$1 $2 $3') + '"</div>';
    h += '<div style="margin-bottom:12px">';
    h += '<div style="font-weight:700;font-size:13px;margin-bottom:4px">Продавец:</div>';
    h += '<table style="width:100%;border-collapse:collapse;font-size:11px">';
    h += '<tr><td style="padding:2px 4px;width:160px"><strong>Наименование:</strong></td><td style="padding:2px 4px">' + escapeHtml(storeName) + '</td></tr>';
    h += '<tr><td style="padding:2px 4px"><strong>БИН:</strong></td><td style="padding:2px 4px">' + escapeHtml(storeBin) + '</td></tr>';
    h += '<tr><td style="padding:2px 4px"><strong>Адрес:</strong></td><td style="padding:2px 4px">' + escapeHtml(storeAddr || '\u2014') + '</td></tr>';
    h += '<tr><td style="padding:2px 4px"><strong>Свидетельство НДС:</strong></td><td style="padding:2px 4px">' + escapeHtml(storeNdscert || '\u2014') + '</td></tr>';
    h += '</table>';
    if (iik || bik || bankName) {
        h += '<div style="font-size:11px;margin-top:4px;padding:4px;background:#f5f5f5">' + '<strong>Банковские реквизиты:</strong> ' + (iik ? 'ИИК ' + escapeHtml(iik) + '; ' : '') + (bik ? 'БИК ' + escapeHtml(bik) + '; ' : '') + (bankName ? escapeHtml(bankName) : '') + '</div>';
    }
    h += '</div>';
    var custIIN = doc.customerIIN || doc.meta && doc.meta.customerIIN || '';
    var custAddr = doc.customerAddress || doc.meta && doc.meta.customerAddress || '';
    h += '<div style="margin-bottom:12px">';
    h += '<div style="font-weight:700;font-size:13px;margin-bottom:4px">Покупатель:</div>';
    h += '<table style="width:100%;border-collapse:collapse;font-size:11px">';
    h += '<tr><td style="padding:2px 4px;width:160px"><strong>Наименование:</strong></td><td style="padding:2px 4px">' + escapeHtml(doc.customerName || '\u2014') + '</td></tr>';
    h += '<tr><td style="padding:2px 4px"><strong>БИН/ИИН:</strong></td><td style="padding:2px 4px">' + escapeHtml(custIIN || '\u2014') + '</td></tr>';
    h += '<tr><td style="padding:2px 4px"><strong>Адрес:</strong></td><td style="padding:2px 4px">' + escapeHtml(custAddr || '\u2014') + '</td></tr>';
    h += '</table>';
    h += '</div>';
    h += '<table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:11px">';
    h += '<thead><tr>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:center;width:30px">\u2116</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:left">Наименование товара</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:center;width:40px">Ед.</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:center;width:60px">Кол-во</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:right;width:90px">Цена, \u20B8</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:right;width:100px">Стоимость, \u20B8</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:center;width:45px">НДС%</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:right;width:100px">Сумма НДС, \u20B8</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:right;width:110px">Итого с НДС, \u20B8</th>' + '</tr></thead><tbody>';
    if (!items.length) {
        h += '<tr><td colspan="9" style="padding:12px;border:1.5px solid #000;text-align:center;color:#888">Нет товаров</td></tr>';
    } else {
        items.forEach(function (it, i) {
            var cost = it.total || it.unitPrice * it.quantity;
            var priceNoNds = ndsOnly(it.unitPrice || 0);
            var ndsAmt = ndsRow(cost);
            var incNds = cost;
            totalNoNds += ndsOnly(cost);
            totalNds += ndsAmt;
            h += '<tr>' + '<td style="padding:4px;border:1.5px solid #000;text-align:center">' + (i + 1) + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:left">' + escapeHtml(it.productName || '') + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:center">' + (it.unit || 'шт') + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:center">' + (it.quantity || 0) + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:right">' + fmt(priceNoNds) + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:right">' + fmt(ndsOnly(cost)) + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:center">' + ndsRate + '%</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:right">' + fmt(ndsAmt) + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:right;font-weight:600">' + fmt(incNds) + '</td>' + '</tr>';
        });
    }
    h += '</tbody></table>';
    h += '<div style="display:flex;justify-content:flex-end;gap:24px;margin-bottom:16px;font-size:12px">';
    h += '<div><strong>Итого без НДС:</strong> ' + fmt(totalNoNds) + ' \u20B8</div>';
    h += '<div><strong>Сумма НДС (' + ndsRate + '%):</strong> ' + fmt(totalNds) + ' \u20B8</div>';
    h += '<div style="font-size:14px;font-weight:700"><strong>Итого с НДС:</strong> ' + fmt(totalNoNds + totalNds) + ' \u20B8</div>';
    h += '</div>';
    h += '<div style="font-size:11px;color:#555;text-align:right;margin-bottom:16px">Всего наименований: ' + items.length + '</div>';
    h += '<div style="margin-top:24px;border-top:1.5px solid #000;padding-top:12px;font-size:11px">';
    h += '<div style="display:flex;justify-content:space-between;max-width:600px;margin-bottom:4px">' + '<span><strong>Руководитель / ИП:</strong> ______________________</span>' + '<span><strong>Главный бухгалтер:</strong> ______________________</span>' + '</div>';
    h += '<div style="font-size:10px;color:#555;text-align:right;margin-top:2px">Дата подписания: "' + fmtDate(doc.documentDate).replace(/(\d+)\.(\d+)\.(\d+).*/, '$1 $2 $3') + '"</div>';
    h += '</div>';
    h += '</div>';
    return h;
}

function buildClassicPKOHTML(doc) {
    var h = '<div style="font-family:\'Times New Roman\',Times,serif;color:#000;max-width:700px;margin:0 auto;padding:24px 20px;font-size:13px;line-height:1.4">';
    h += '<div style="text-align:center;font-size:16px;font-weight:700;margin-bottom:8px">ПРИХОДНЫЙ КАССОВЫЙ ОРДЕР</div>';
    h += '<div style="display:flex;justify-content:space-between;margin-bottom:16px">' + '<span><strong>\u2116:</strong> ' + (doc.docNumber || doc.number || doc.id.slice(0, 6)) + '</span>' + '<span><strong>Дата:</strong> ' + fmtDate(doc.documentDate) + '</span>' + '</div>';
    h += '<div style="border:1px solid #000;padding:16px;margin-bottom:16px">';
    h += '<p><strong>Принято от:</strong> ' + escapeHtml(doc.customerName || doc.payer || '\u2014') + '</p>';
    h += '<p><strong>Основание:</strong> ' + escapeHtml(doc.basis || '\u2014') + '</p>';
    h += '<p style="font-size:16px;font-weight:700;text-align:right">Сумма: ' + fmt(doc.total || 0) + ' \u20B8</p>';
    h += '</div>';
    h += '<div style="font-size:12px;margin-top:16px">' + '<div style="display:flex;justify-content:space-between;max-width:500px">' + '<span>Главный бухгалтер: _______________</span>' + '<span>Кассир: _______________</span>' + '</div></div>';
    h += '</div>';
    return h;
}

function openDocumentView(docId) {
    var docs = getDocuments();
    var doc = docs.find(function (d) {
        return d.id === docId;
    });
    if (!doc) {
        toast('Документ не найден', 'err');
        return;
    }
    window._currentDocId = docId;
    var content = document.getElementById('document-view-content');
    var title = document.getElementById('modal-doc-title');
    var dt = doc.type || doc.docType || '';
    var adapted = Object.assign({}, doc, {
        docNumber: doc.number || doc.docNumber || '',
        documentDate: doc.date || doc.documentDate || new Date().toISOString(),
        customerName: doc.clientName || doc.customerName || doc.recipientName || '',
        customerPhone: doc.clientPhone || doc.customerPhone || ''
    });
    if (dt === 'invoice') {
        if (content)
            content.innerHTML = window.buildClassicInvoiceHTML(adapted);
        if (title)
            title.textContent = 'Счет на оплату \u2116' + (doc.number || doc.docNumber || doc.id.slice(0, 6));
    } else if (dt === 'z2') {
        if (content)
            content.innerHTML = window.buildClassicZ2HTML(adapted);
        if (title)
            title.textContent = 'Накладная З-2 \u2116' + (doc.number || doc.docNumber || doc.id.slice(0, 6));
    } else if (dt === 'invoice_sf') {
        if (content)
            content.innerHTML = window.buildClassicSFHTML(adapted);
        if (title)
            title.textContent = 'Счёт-фактура \u2116' + (doc.number || doc.docNumber || doc.id.slice(0, 6));
    } else if (dt === 'pko') {
        if (content)
            content.innerHTML = window.buildClassicPKOHTML(adapted);
        if (title)
            title.textContent = 'ПКО \u2116' + (doc.number || doc.docNumber || doc.id.slice(0, 6));
    } else {
        if (title)
            title.textContent = (dt === 'invoice' ? 'Счет на оплату' : 'Накладная З-2') + ' \u2116' + (doc.number || doc.docNumber || doc.id.slice(0, 6));
        if (content) {
            var clientInfo = dt === 'invoice' ? '<p><strong>Клиент:</strong> ' + esc(doc.clientName || doc.customerName || '\u2014') + (doc.clientPhone || doc.customerPhone ? ' (' + esc(doc.clientPhone || doc.customerPhone) + ')' : '') + '</p>' : '<p><strong>Получатель:</strong> ' + esc(doc.recipientName || '\u2014') + '</p>';
            var itemsHtml = '<table><thead><tr><th>Код</th><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead><tbody>';
            (doc.items || []).forEach(function (it) {
                itemsHtml += '<tr><td>' + esc(it.productCode || '') + '</td><td>' + esc(it.productName || '') + '</td><td>' + it.quantity + '</td><td>' + fmt(it.unitPrice) + '</td><td>' + fmt(it.total || it.unitPrice * it.quantity) + '</td></tr>';
            });
            itemsHtml += '</tbody></table>';
            var statusLabel = doc.status === 'pending' ? 'Ожидает' : doc.status === 'paid' ? 'Оплачено' : doc.status === 'issued' ? 'Выписано' : 'Отменено';
            content.innerHTML = '<div style="margin-bottom:16px">' + clientInfo + '<p><strong>Дата:</strong> ' + fmtDate(doc.date || doc.documentDate) + '</p>' + '<p><strong>Статус:</strong> <span class="badge badge-' + (doc.status === 'paid' || doc.status === 'issued' ? 'ok' : doc.status === 'cancelled' ? 'danger' : 'warn') + '">' + statusLabel + '</span></p>' + '<p><strong>Итого:</strong> ' + fmt(doc.total || 0) + ' \u20B8</p></div>' + '<div class="panel"><div class="panel-title">Товары</div>' + itemsHtml + '</div>';
        }
    }
    var statusBtn = document.getElementById('btn-doc-status');
    if (statusBtn) {
        if (dt === 'invoice' || dt === 'invoice_sf') {
            statusBtn.style.display = doc.status === 'pending' ? '' : 'none';
            statusBtn.textContent = '\u2713 Отметить оплаченным';
            statusBtn.onclick = function () {
                changeDocumentStatus(docId, 'paid');
            };
        } else if (dt === 'pko') {
            statusBtn.style.display = 'none';
        } else {
            statusBtn.style.display = doc.status === 'pending' ? '' : 'none';
            statusBtn.textContent = '\uD83D\uDCE6 Отметить выписанным';
            statusBtn.onclick = function () {
                changeDocumentStatus(docId, 'issued');
            };
        }
    }
    openModal('modal-view-document');
}

function changeDocumentStatus(docId, status) {
    var docs = getDocuments();
    var idx = docs.findIndex(function (d) {
        return d.id === docId;
    });
    if (idx < 0) {
        toast('Документ не найден', 'err');
        return;
    }
    docs[idx].status = status;
    setDocuments(docs);
    toast('Статус обновлен', 'ok');
    renderDocuments();
    if (window._currentDocId === docId)
        openDocumentView(docId);
}

function printDocument() {
    var content = document.getElementById('document-view-content');
    if (!content)
        return;
    var w = window.open('', '', 'width=800,height=600');
    if (!w) {
        toast('Разрешите всплывающие окна', 'err');
        return;
    }
    w.document.write('<html><head><title>Печать</title></head><body>' + content.innerHTML + '</body></html>');
    w.document.close();
    w.print();
}

function downloadDocumentExcel() {
    var docId = window._currentDocId;
    if (!docId) {
        toast('Нет открытого документа', 'err');
        return;
    }
    var docs = getDocuments();
    var doc = docs.find(function (d) {
        return d.id === docId;
    });
    if (!doc) {
        toast('Документ не найден', 'err');
        return;
    }
    try {
        var si = doc.meta && doc.meta.storeInfo || {};
        var storeName = si.storeName || 'Организация';
        var bin = si.bin || '\u2014';
        var iik = si.iik || '\u2014';
        var bik = si.bik || '\u2014';
        var bankName = si.bankName || '\u2014';
        var kbe = si.kbe || '\u2014';
        var beneficiary = si.beneficiary || storeName;
        var paymentCode = si.paymentCode || '';
        var address = si.address || '';
        var phone = si.phone || '';
        var directorName = si.directorName || '';
        var directorPosition = si.directorPosition || 'Директор';
        var custIIN = si.customerIIN || '';
        var custAddr = si.customerAddress || '';
        var contractText = doc.meta && doc.meta.contract || 'Без договора';
        var comment = doc.comment || '';
        var isInvoice = (doc.type || doc.docType || '') === 'invoice';
        var customerName = doc.clientName || doc.customerName || doc.recipientName || '\u2014';
        var customerPhone = doc.clientPhone || doc.customerPhone || '';
        var docNumber = doc.number || doc.docNumber || doc.id.slice(0, 6);
        var docDate = doc.date || doc.documentDate ? new Date(doc.date || doc.documentDate).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }) : '\u2014';
        var totalRaw = doc.total || 0;
        var items = doc.items || [];
        var totalQty = items.reduce(function (s, it) {
            return s + Number(it.quantity || 0);
        }, 0);
        var wb = XLSX.utils.book_new();
        var data = [], merges = [];
        function M(r1, c1, r2, c2) {
            merges.push({
                s: {
                    r: r1,
                    c: c1
                },
                e: {
                    r: r2,
                    c: c2
                }
            });
        }
        function cellAt(arr, r, c, val) {
            if (!arr[r])
                arr[r] = [];
            arr[r][c] = val;
        }
        function fmtCell(v, opts) {
            return {
                v: v,
                s: opts || {}
            };
        }
        function fnt(sz, b, i, n) {
            return {
                font: {
                    sz: sz || 10,
                    bold: b || false,
                    italic: i || false,
                    name: 'Arial'
                },
                alignment: {
                    horizontal: n && n.h || 'left',
                    vertical: n && n.v || 'center',
                    wrapText: n && n.w || false
                }
            };
        }
        function tin(s) {
            return { style: s || 'thin' };
        }
        function med() {
            return { style: 'medium' };
        }
        function buildSheetFromData(data, merges) {
            var ws = {};
            var maxR = -1, maxC = -1;
            for (var r = 0; r < data.length; r++) {
                if (!data[r])
                    continue;
                for (var c = 0; c < data[r].length; c++) {
                    var cell = data[r][c];
                    if (cell === undefined || cell === null)
                        continue;
                    if (!cell.t) {
                        if (typeof cell.v === 'number')
                            cell.t = 'n';
                        else if (typeof cell.v === 'boolean')
                            cell.t = 'b';
                        else
                            cell.t = 's';
                    }
                    ws[XLSX.utils.encode_cell({
                        r: r,
                        c: c
                    })] = cell;
                    if (r > maxR)
                        maxR = r;
                    if (c > maxC)
                        maxC = c;
                }
            }
            var refEnd = XLSX.utils.encode_cell({
                r: Math.max(maxR, 0),
                c: Math.max(maxC, 0)
            });
            ws['!ref'] = 'A1:' + refEnd;
            if (merges && merges.length)
                ws['!merges'] = merges;
            return ws;
        }
        function bdr(t, r, b, l) {
            return {
                top: t || {},
                bottom: b || {},
                left: l || {},
                right: r || {}
            };
        }
        if (isInvoice) {
            var C = {
                B: 1,
                D: 3,
                E: 4,
                F: 5,
                G: 6,
                S: 18,
                T: 19,
                U: 20,
                V: 21,
                W: 22,
                X: 23,
                Y: 24,
                Z: 25,
                AA: 26,
                AB: 27,
                AC: 28,
                AD: 29,
                AE: 30,
                AF: 31,
                AG: 32,
                AH: 33,
                AI: 34,
                AJ: 35,
                AK: 36,
                AL: 37,
                AM: 38
            };
            cellAt(data, 0, C.G, {
                v: 'Внимание! Оплата данного счета означает согласие с условиями поставки товара. Уведомление об оплате обязательно, в противном случае не гарантируется наличие товара на складе. Товар отпускается по факту прихода денег на р/с Поставщика, самовывозом, при наличии доверенности и документов удостоверяющих личность.',
                s: {
                    font: fnt(8, false, false, {
                        h: 'center',
                        v: 'center',
                        w: true
                    }).font,
                    alignment: fnt(8, false, false, {
                        h: 'center',
                        v: 'center',
                        w: true
                    }).alignment,
                    border: {
                        top: med(),
                        bottom: med(),
                        left: med(),
                        right: med()
                    }
                }
            });
            M(0, C.G, 5, C.AM);
            cellAt(data, 7, C.B, fmtCell('Образец платежного поручения', fnt(10, true, false, {
                h: 'left',
                v: 'center'
            })));
            function bb(top, right, bottom, left) {
                var b = {};
                if (top)
                    b.top = tin();
                if (right)
                    b.right = tin();
                if (bottom)
                    b.bottom = tin();
                if (left)
                    b.left = tin();
                return b;
            }
            cellAt(data, 8, C.B, {
                v: 'Бенефициар:',
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'left',
                        v: 'top'
                    }).alignment,
                    border: bb(1, 0, 0, 1)
                }
            });
            M(8, C.B, 8, C.U);
            cellAt(data, 8, C.V, {
                v: 'ИИК',
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'top'
                    }).alignment,
                    border: bb(1, 0, 0, 1)
                }
            });
            M(8, C.V, 8, C.AE);
            cellAt(data, 8, C.AF, {
                v: 'Кбе',
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'top'
                    }).alignment,
                    border: bb(1, 1, 0, 1)
                }
            });
            M(8, C.AF, 8, C.AM);
            cellAt(data, 9, C.B, {
                v: beneficiary,
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'left',
                        v: 'top',
                        w: true
                    }).alignment,
                    border: bb(0, 0, 0, 1)
                }
            });
            M(9, C.B, 9, C.U);
            cellAt(data, 9, C.V, {
                v: iik,
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'center',
                        w: true
                    }).alignment,
                    border: bb(0, 0, 0, 1)
                }
            });
            M(9, C.V, 9, C.AC);
            cellAt(data, 9, C.AF, {
                v: kbe,
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'center',
                        w: true
                    }).alignment,
                    border: bb(0, 1, 0, 1)
                }
            });
            M(9, C.AF, 10, C.AM);
            cellAt(data, 10, C.B, {
                v: 'ИИН: ' + bin,
                s: {
                    font: fnt(9, false).font,
                    alignment: fnt(9, false, false, {
                        h: 'left',
                        v: 'top'
                    }).alignment,
                    border: bb(0, 0, 0, 1)
                }
            });
            M(10, C.B, 10, C.U);
            cellAt(data, 11, C.B, {
                v: 'Банк бенефициара:',
                s: {
                    font: fnt(9, false).font,
                    alignment: fnt(9, false, false, {
                        h: 'left',
                        v: 'top'
                    }).alignment,
                    border: bb(1, 0, 0, 1)
                }
            });
            M(11, C.B, 11, C.U);
            cellAt(data, 11, C.V, {
                v: 'БИК',
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'top'
                    }).alignment,
                    border: bb(1, 0, 0, 1)
                }
            });
            M(11, C.V, 11, C.AC);
            cellAt(data, 11, C.AD, {
                v: 'Код назначения платежа',
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'top'
                    }).alignment,
                    border: bb(1, 1, 0, 1)
                }
            });
            M(11, C.AD, 11, C.AM);
            cellAt(data, 12, C.B, {
                v: bankName,
                s: {
                    font: fnt(9, false).font,
                    alignment: fnt(9, false, false, {
                        h: 'left',
                        v: 'top',
                        w: true
                    }).alignment,
                    border: bb(0, 0, 1, 1)
                }
            });
            M(12, C.B, 12, C.U);
            cellAt(data, 12, C.V, {
                v: bik,
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'top',
                        w: true
                    }).alignment,
                    border: bb(0, 0, 1, 1)
                }
            });
            M(12, C.V, 12, C.AC);
            var titles = ['Счет на оплату \u2116 ' + docNumber + ' от ' + docDate];
            var d = doc.date ? new Date(doc.date) : new Date();
            var ms = [
                'января',
                'февраля',
                'марта',
                'апреля',
                'мая',
                'июня',
                'июля',
                'августа',
                'сентября',
                'октября',
                'ноября',
                'декабря'
            ];
            cellAt(data, 15, C.B, fmtCell('Счет на оплату \u2116 ' + docNumber + ' от ' + d.getDate() + ' ' + ms[d.getMonth()] + ' ' + d.getFullYear() + ' г.', fnt(14, true, false, {
                h: 'left',
                v: 'center'
            })));
            M(15, C.B, 16, C.AM);
            cellAt(data, 17, C.B, fmtCell('', fnt(9)));
            M(17, C.B, 17, C.AM);
            cellAt(data, 19, C.B, fmtCell('Поставщик:', fnt(9, false, false, {
                h: 'left',
                v: 'top'
            })));
            M(19, C.B, 19, C.E);
            cellAt(data, 19, C.F, fmtCell('БИН / ИИН ' + bin + ', ' + storeName, fnt(9, true, false, {
                h: 'left',
                v: 'top',
                w: true
            })));
            M(19, C.F, 19, C.AM);
            cellAt(data, 21, C.B, fmtCell('Покупатель:', fnt(9, false, false, {
                h: 'left',
                v: 'top'
            })));
            M(21, C.B, 21, C.E);
            var bStr = customerName;
            if (custIIN)
                bStr = 'БИН / ИИН ' + custIIN + ', ' + bStr;
            if (custAddr)
                bStr += ' ' + custAddr;
            cellAt(data, 21, C.F, fmtCell(bStr, fnt(9, true, false, {
                h: 'left',
                v: 'top',
                w: true
            })));
            M(21, C.F, 21, C.AM);
            cellAt(data, 23, C.B, fmtCell('Договор:', fnt(10, false, false, {
                h: 'left',
                v: 'top'
            })));
            M(23, C.B, 23, C.E);
            cellAt(data, 23, C.F, fmtCell(contractText, fnt(10, true, false, {
                h: 'left',
                v: 'top',
                w: true
            })));
            M(23, C.F, 23, C.AM);
            function thdr(rr, txt, c1, c2, leftB, rightB) {
                var b = {
                    top: med(),
                    bottom: tin('thin')
                };
                if (leftB)
                    b.left = med();
                else
                    b.left = tin();
                if (rightB)
                    b.right = med();
                else
                    b.right = tin();
                cellAt(data, rr, c1, {
                    v: txt,
                    s: {
                        font: fnt(9, true).font,
                        alignment: fnt(9, true, false, {
                            h: 'center',
                            v: 'center'
                        }).alignment,
                        border: b
                    }
                });
                if (c2 > c1)
                    M(rr, c1, rr, c2);
            }
            thdr(25, '\u2116', C.B, C.C, true, false);
            thdr(25, 'Наименование', C.D, C.S, false, false);
            thdr(25, 'Кол-во', C.T, C.W, false, false);
            thdr(25, 'Ед.', C.X, C.Z, false, false);
            thdr(25, 'Цена', C.AA, C.AF, false, false);
            thdr(25, 'Сумма', C.AG, C.AL, false, true);
            var rowN = 26;
            items.forEach(function (it, idx) {
                var price = it.unitPrice || 0;
                var sum = it.total || price * (it.quantity || 0);
                function tcell(rrr, c1, c2, txt, al, leftM, rightM) {
                    var b = {
                        top: tin(),
                        bottom: tin()
                    };
                    if (leftM)
                        b.left = med();
                    else
                        b.left = tin();
                    if (rightM)
                        b.right = med();
                    else
                        b.right = tin();
                    cellAt(data, rrr, c1, {
                        v: txt,
                        s: {
                            font: fnt(8, false).font,
                            alignment: {
                                horizontal: al || 'left',
                                vertical: 'top',
                                wrapText: true
                            },
                            border: b
                        }
                    });
                    if (c2 > c1)
                        M(rrr, c1, rrr, c2);
                }
                tcell(rowN, C.B, C.C, String(idx + 1), 'center', true, false);
                tcell(rowN, C.D, C.S, it.productName || it.productCode || '', 'left', false, false);
                tcell(rowN, C.T, C.W, it.quantity || 0, 'right', false, false);
                tcell(rowN, C.X, C.Z, it.unit || 'шт', 'left', false, false);
                tcell(rowN, C.AA, C.AF, price, 'right', false, false);
                tcell(rowN, C.AG, C.AL, sum, 'right', false, true);
                rowN++;
            });
            var rr = rowN;
            function totCell(rrr, c1, c2, txt, leftM, rightM) {
                var b = {
                    top: med(),
                    bottom: med()
                };
                if (leftM)
                    b.left = med();
                else
                    b.left = tin();
                if (rightM)
                    b.right = med();
                else
                    b.right = tin();
                cellAt(data, rrr, c1, {
                    v: txt,
                    s: {
                        font: fnt(9, true).font,
                        alignment: {
                            horizontal: 'right',
                            vertical: 'top'
                        },
                        border: b
                    }
                });
                if (c2 > c1)
                    M(rrr, c1, rrr, c2);
            }
            totCell(rr, C.AF, C.AF, 'Итого:', true, false);
            totCell(rr, C.AG, C.AL, totalRaw, false, true);
            rr += 3;
            cellAt(data, rr, C.B, fmtCell('Всего наименований ' + items.length + ', на сумму ' + Number(totalRaw).toLocaleString('ru-RU', { minimumFractionDigits: 2 }) + ' KZT', fnt(9, false, false, {
                h: 'left',
                v: 'top'
            })));
            M(rr, C.B, rr, C.AM);
            rr++;
            cellAt(data, rr, C.B, fmtCell('Всего к оплате: ' + window.classicAmountWords(totalRaw), fnt(9, true, false, {
                h: 'left',
                v: 'top',
                w: true
            })));
            M(rr, C.B, rr, C.AK);
            rr += 2;
            cellAt(data, rr, C.B, fmtCell('Исполнитель', fnt(9, true, false, {
                h: 'left',
                v: 'center'
            })));
            cellAt(data, rr, C.G, fmtCell('', fnt(8)));
            M(rr, C.G, rr, C.V);
            cellAt(data, rr, C.W, fmtCell('/' + (directorName || '________') + '/', fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(rr, C.W, rr, C.AM);
            var ws = buildSheetFromData(data, merges);
            ws['!cols'] = [
                { wch: 2 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 }
            ];
            ws['!print'] = {
                paperSize: 9,
                orientation: 'portrait'
            };
            XLSX.utils.book_append_sheet(wb, ws, 'Лист_1');
        } else {
            var C = {};
            for (var ci = 0; ci <= 48; ci++) {
                if (ci < 26)
                    C[String.fromCharCode(65 + ci)] = ci;
                else
                    C['A' + String.fromCharCode(65 + ci - 26)] = ci;
            }
            var appLines = [
                'Приложение 26',
                'к приказу Министра финансов',
                'Республики Казахстан',
                'от 20 декабря 2012 года \u2116 562'
            ];
            appLines.forEach(function (l, i) {
                cellAt(data, i, C.AN, fmtCell(l, fnt(8, false, true, {
                    h: 'center',
                    v: 'center'
                })));
                M(i, C.AN, i, C.AW);
            });
            cellAt(data, 4, C.AQ, fmtCell('Форма З-2', fnt(9, false, false, {
                h: 'center',
                v: 'center'
            })));
            M(4, C.AQ, 4, C.AW);
            cellAt(data, 8, C.A, fmtCell('Организация (индивидуальный предприниматель)', fnt(8, false, false, {
                h: 'left',
                v: 'bottom',
                w: true
            })));
            M(8, C.A, 8, C.M);
            cellAt(data, 8, C.N, fmtCell(storeName, fnt(9, true, false, {
                h: 'center',
                v: 'top',
                w: true
            })));
            M(8, C.N, 8, C.AJ);
            cellAt(data, 8, C.AQ, fmtCell(bin, fnt(9, true, false, {
                h: 'center',
                v: 'center'
            })));
            cellAt(data, 11, C.AP, fmtCell('Номер документа', fnt(8, false, false, {
                h: 'center',
                v: 'center',
                w: true
            })));
            cellAt(data, 11, C.AT, fmtCell('Дата составления', fnt(8, false, false, {
                h: 'center',
                v: 'center',
                w: true
            })));
            cellAt(data, 12, C.AP, fmtCell(docNumber, fnt(8, true, false, {
                h: 'center',
                v: 'center',
                w: true
            })));
            cellAt(data, 12, C.AT, fmtCell(docDate, fnt(8, true, false, {
                h: 'center',
                v: 'center',
                w: true
            })));
            cellAt(data, 14, C.A, fmtCell('НАКЛАДНАЯ НА ОТПУСК ЗАПАСОВ НА СТОРОНУ', fnt(10, true, false, {
                h: 'center',
                v: 'center'
            })));
            M(14, C.A, 14, C.AW);
            function z2HdrBdr(leftM, rightM) {
                var b = {
                    top: med(),
                    bottom: tin('thin')
                };
                if (leftM)
                    b.left = med();
                else
                    b.left = tin();
                if (rightM)
                    b.right = med();
                else
                    b.right = tin();
                return b;
            }
            function z2ValBdr(leftM, rightM) {
                var b = {
                    top: tin('thin'),
                    bottom: tin('thin')
                };
                if (leftM)
                    b.left = med();
                else
                    b.left = tin();
                if (rightM)
                    b.right = med();
                else
                    b.right = tin();
                return b;
            }
            var hdrs18 = [
                {
                    t: 'Организация (ИП) - отправитель',
                    c1: C.A,
                    c2: C.K,
                    l: true,
                    r: false
                },
                {
                    t: 'Организация (ИП) - получатель',
                    c1: C.L,
                    c2: C.V,
                    l: false,
                    r: false
                },
                {
                    t: 'Ответственный за поставку (Ф.И.О.)',
                    c1: C.W,
                    c2: C.AE,
                    l: false,
                    r: false
                },
                {
                    t: 'Транспортная организация',
                    c1: C.AF,
                    c2: C.AN,
                    l: false,
                    r: false
                },
                {
                    t: 'Товарно-транспортная накладная (номер, дата)',
                    c1: C.AO,
                    c2: C.AW,
                    l: false,
                    r: true
                }
            ];
            hdrs18.forEach(function (h) {
                cellAt(data, 17, h.c1, {
                    v: h.t,
                    s: {
                        font: fnt(8, false).font,
                        alignment: fnt(8, false, false, {
                            h: 'center',
                            v: 'center',
                            w: true
                        }).alignment,
                        border: z2HdrBdr(h.l, h.r)
                    }
                });
                M(17, h.c1, 17, h.c2);
            });
            var vals19 = [
                {
                    t: storeName,
                    c1: C.A,
                    c2: C.K,
                    l: true,
                    r: false
                },
                {
                    t: customerName,
                    c1: C.L,
                    c2: C.V,
                    l: false,
                    r: false
                },
                {
                    t: directorName,
                    c1: C.W,
                    c2: C.AE,
                    l: false,
                    r: false
                },
                {
                    t: '',
                    c1: C.AF,
                    c2: C.AN,
                    l: false,
                    r: false
                },
                {
                    t: '',
                    c1: C.AO,
                    c2: C.AW,
                    l: false,
                    r: true
                }
            ];
            vals19.forEach(function (h) {
                cellAt(data, 18, h.c1, {
                    v: h.t,
                    s: {
                        font: fnt(8, false).font,
                        alignment: fnt(8, false, false, {
                            h: 'center',
                            v: 'center',
                            w: true
                        }).alignment,
                        border: z2ValBdr(h.l, h.r)
                    }
                });
                M(18, h.c1, 18, h.c2);
            });
            function z2TblHdrBdr(leftM, rightM, isTop) {
                var b = {
                    top: isTop ? med() : tin('thin'),
                    bottom: tin('thin')
                };
                if (leftM)
                    b.left = med();
                else
                    b.left = tin();
                if (rightM)
                    b.right = med();
                else
                    b.right = tin();
                return b;
            }
            var tblH = [
                {
                    t: 'Номер по порядку',
                    r1: 20,
                    r2: 21,
                    c1: C.A,
                    c2: C.B,
                    l: true,
                    r: false
                },
                {
                    t: 'Наименование, характеристика',
                    r1: 20,
                    r2: 21,
                    c1: C.C,
                    c2: C.N,
                    l: false,
                    r: false
                },
                {
                    t: 'Номенкла-турный номер',
                    r1: 20,
                    r2: 21,
                    c1: C.O,
                    c2: C.S,
                    l: false,
                    r: false
                },
                {
                    t: 'Единица измерения',
                    r1: 20,
                    r2: 21,
                    c1: C.T,
                    c2: C.V,
                    l: false,
                    r: false
                },
                {
                    t: 'Количество',
                    r1: 20,
                    r2: 20,
                    c1: C.W,
                    c2: C.AE,
                    l: false,
                    r: false
                },
                {
                    t: 'подлежит отпуску',
                    r1: 21,
                    r2: 21,
                    c1: C.W,
                    c2: C.AA,
                    l: false,
                    r: false
                },
                {
                    t: 'отпущено',
                    r1: 21,
                    r2: 21,
                    c1: C.AB,
                    c2: C.AE,
                    l: false,
                    r: false
                },
                {
                    t: 'Цена за единицу, в KZT',
                    r1: 20,
                    r2: 21,
                    c1: C.AF,
                    c2: C.AK,
                    l: false,
                    r: false
                },
                {
                    t: 'Сумма с НДС, в KZT',
                    r1: 20,
                    r2: 21,
                    c1: C.AL,
                    c2: C.AQ,
                    l: false,
                    r: false
                },
                {
                    t: 'Сумма НДС, в KZT',
                    r1: 20,
                    r2: 21,
                    c1: C.AR,
                    c2: C.AW,
                    l: false,
                    r: true
                }
            ];
            tblH.forEach(function (h) {
                for (var rr = h.r1; rr <= h.r2; rr++) {
                    cellAt(data, rr, h.c1, {
                        v: h.t,
                        s: {
                            font: fnt(8, false).font,
                            alignment: fnt(8, false, false, {
                                h: 'center',
                                v: 'center',
                                w: true
                            }).alignment,
                            border: z2TblHdrBdr(h.l, h.r, rr === h.r1)
                        }
                    });
                    M(h.r1, h.c1, h.r2, h.c2);
                }
            });
            var colNums = [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9
            ];
            var colRanges = [
                [
                    C.A,
                    C.B,
                    true
                ],
                [
                    C.C,
                    C.N,
                    false
                ],
                [
                    C.O,
                    C.S,
                    false
                ],
                [
                    C.T,
                    C.V,
                    false
                ],
                [
                    C.W,
                    C.AA,
                    false
                ],
                [
                    C.AB,
                    C.AE,
                    false
                ],
                [
                    C.AF,
                    C.AK,
                    false
                ],
                [
                    C.AL,
                    C.AQ,
                    false
                ],
                [
                    C.AR,
                    C.AW,
                    false,
                    true
                ]
            ];
            colNums.forEach(function (n, i) {
                var b = {
                    top: tin(),
                    bottom: tin('thin')
                };
                b.left = colRanges[i][2] ? med() : tin();
                b.right = colRanges[i][3] ? med() : tin();
                cellAt(data, 22, colRanges[i][0], {
                    v: String(n),
                    s: {
                        font: fnt(8, false).font,
                        alignment: fnt(8, false, false, {
                            h: 'center',
                            v: 'center'
                        }).alignment,
                        border: b
                    }
                });
                M(22, colRanges[i][0], 22, colRanges[i][1]);
            });
            var dr = 23;
            items.forEach(function (it, idx) {
                var price = it.unitPrice || 0;
                var sum = it.total || price * (it.quantity || 0);
                function z2dc(c1, c2, txt, al, leftM, rightM) {
                    var b = {
                        top: tin(),
                        bottom: tin()
                    };
                    if (leftM)
                        b.left = med();
                    else
                        b.left = tin();
                    if (rightM)
                        b.right = med();
                    else
                        b.right = tin();
                    cellAt(data, dr, c1, {
                        v: txt,
                        s: {
                            font: fnt(8, false).font,
                            alignment: {
                                horizontal: al || 'left',
                                vertical: 'center',
                                wrapText: true
                            },
                            border: b
                        }
                    });
                    if (c2 > c1)
                        M(dr, c1, dr, c2);
                }
                z2dc(C.A, C.B, String(idx + 1), 'center', true, false);
                z2dc(C.C, C.N, it.productName || '', 'left', false, false);
                z2dc(C.O, C.S, it.productCode || '', 'center', false, false);
                z2dc(C.T, C.V, it.unit || 'шт', 'center', false, false);
                z2dc(C.W, C.AA, it.quantity || 0, 'right', false, false);
                z2dc(C.AB, C.AE, it.quantity || 0, 'right', false, false);
                z2dc(C.AF, C.AK, price, 'right', false, false);
                z2dc(C.AL, C.AQ, sum, 'right', false, false);
                z2dc(C.AR, C.AW, '', 'right', false, true);
                dr++;
            });
            function z2tc(c1, c2, txt, al, leftM, rightM) {
                var b = {
                    top: med(),
                    bottom: med()
                };
                if (leftM)
                    b.left = med();
                else
                    b.left = tin();
                if (rightM)
                    b.right = med();
                else
                    b.right = tin();
                cellAt(data, dr, c1, {
                    v: txt,
                    s: {
                        font: fnt(9, true).font,
                        alignment: {
                            horizontal: al || 'left',
                            vertical: 'center'
                        },
                        border: b
                    }
                });
                if (c2 > c1)
                    M(dr, c1, dr, c2);
            }
            z2tc(C.W, C.AE, 'Итого', 'right', false, false);
            z2tc(C.AF, C.AK, totalQty, 'right', false, false);
            z2tc(C.AL, C.AQ, totalRaw, 'right', false, true);
            dr += 2;
            cellAt(data, dr, C.A, fmtCell('Всего отпущено количество запасов (прописью): ' + totalQty, fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(dr, C.A, dr, C.AW);
            dr++;
            cellAt(data, dr, C.A, fmtCell('на сумму (прописью): ' + window.classicAmountWords(totalRaw), fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(dr, C.A, dr, C.AW);
            dr++;
            dr++;
            var sigLeft = [
                {
                    title: 'Отпуск разрешил:',
                    pos: directorPosition
                },
                {
                    title: 'Главный бухгалтер:',
                    pos: ''
                },
                {
                    title: 'Отпустил:',
                    pos: ''
                }
            ];
            sigLeft.forEach(function (s) {
                var posTxt = s.pos ? s.pos + ' ' : '';
                cellAt(data, dr, C.A, fmtCell(s.title, fnt(8, false, false, {
                    h: 'left',
                    v: 'center'
                })));
                M(dr, C.A, dr, C.D);
                cellAt(data, dr, C.E, fmtCell('/_______________/_______________/', fnt(8, false, false, {
                    h: 'left',
                    v: 'center'
                })));
                M(dr, C.E, dr, C.M);
                dr++;
            });
            dr++;
            cellAt(data, dr, C.AE, fmtCell('Запасы получил:', fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(dr, C.AE, dr, C.AJ);
            dr++;
            cellAt(data, dr, C.AE, fmtCell('/_______________/_______________/', fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(dr, C.AE, dr, C.AJ);
            dr++;
            cellAt(data, dr, C.AE, fmtCell('по доверенности \u2116 ________________ от ___ _________ 20__ года', fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(dr, C.AE, dr, C.AW);
            dr++;
            cellAt(data, dr, C.AE, fmtCell('выданной __________________________________________________', fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(dr, C.AE, dr, C.AW);
            dr++;
            dr++;
            cellAt(data, dr, C.A, fmtCell('М.П.', fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            var ws = buildSheetFromData(data, merges);
            var colW = [];
            for (var ci = 0; ci < 49; ci++)
                colW.push({ wch: 3 });
            ws['!cols'] = colW;
            ws['!rows'] = [];
            for (var ri = 0; ri <= 4; ri++)
                ws['!rows'][ri] = { hpt: 11 };
            ws['!rows'][8] = { hpt: 12 };
            ws['!rows'][17] = { hpt: 23 };
            ws['!rows'][18] = { hpt: 47 };
            ws['!rows'][20] = { hpt: 17 };
            ws['!rows'][21] = { hpt: 17 };
            for (var ri = dr; ri < data.length; ri++) {
                if (!ws['!rows'][ri])
                    ws['!rows'][ri] = { hpt: 23 };
            }
            ws['!print'] = {
                paperSize: 9,
                orientation: 'landscape'
            };
            XLSX.utils.book_append_sheet(wb, ws, 'Лист_1');
        }
        var filename = (isInvoice ? 'Счет_' : 'Накладная_') + docNumber + '.xlsx';
        XLSX.writeFile(wb, filename);
        toast('Excel файл скачан', 'ok');
    } catch (err) {
        toast('Ошибка Excel: ' + err.message, 'err');
    }
}

function downloadDocumentHTML() {
    var content = document.getElementById('document-view-content');
    if (!content)
        return;
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Документ</title></head><body>' + content.innerHTML + '</body></html>';
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
}



export { getDocuments, setDocuments, getDocTemplates, setDocTemplates, openDocTemplateManager, renderDocTemplates, editDocTemplate, deleteDocTemplate, addDocTemplate, saveDocTemplate, loadDocTemplate, loadDocTemplateNewDoc, selectDocTemplateForDoc, printInvoice, showInvoiceOverlay, printSalePKO, downloadInvoiceExcel, renderDocuments, openDocumentEditById, deleteDocument, duplicateDocument, downloadDocumentPdf, printDocumentById, downloadDocumentExcelById, openCreateInvoiceModal, openCreateZ2Modal, updateInvoiceTypeUI, updateZ2TypeUI, addInvoiceItemRow, addZ2ItemRow, addSFItemRow, saveNewInvoice, saveNewZ2, openCreateSFFModal, saveNewSFF, openCreatePKOModal, saveNewPKO, buildClassicInvoiceHTML, buildClassicZ2HTML, buildClassicSFHTML, buildClassicPKOHTML, openDocumentView, changeDocumentStatus, printDocument, downloadDocumentExcel, downloadDocumentHTML };
