import { generateEAN13, normalizeCode, fmt, closeModal, generateSearchVariations, levenshtein, drawEan13Svg, drawCode39Svg, tableHTML, updateBulkBar, todayStr, getFieldValue, updateMarkup, confirmAction, stopTracks } from './utils.js';
import { set } from './app-context.js';
import { toast } from './notifications.js';
import { isAdmin, checkPermission } from './users.js';
import { addToCart, saleCart, renderSaleCart } from './cart.js';
import { getCategories } from './categories.js';
import { scannerActive, scannerTarget, _lastScanTime, _scannerAutoClose, scannerAnimFrame, _scanLoopFn, _bulkSelected, scannerStream, setStore } from './store.js';
import { getSales, isSaleActive, addAuditLog } from './sales.js';
import { getActivePromotions } from './promotions.js';
import { CODE39, EXCEL_SECTIONS } from './constants.js';
import { exportSectionToExcel } from './reports.js';
import { openModal, uid, renderDashboard, refreshAll } from './ui.js';
import { _schedulePostSaveSync } from './sync.js';
import { _posCatModalState, _statsPeriod } from './statistics.js';



function getProducts() {
    return window.DataService ? window.DataService.get('products') : [];
}

function setProducts(arr) {
    if (window.DataService)
        window.DataService.set('products', arr);
}

function getDocumentItems() {
    return window.ApDb ? window.ApDb.getDocumentItems() : [];
}

function setDocumentItems(arr) {
    if (window.ApDb)
        window.ApDb.setDocumentItems(arr);
}

function migrateProducts() {
    const list = getProducts();
    let changed = false;
    const migrated = list.map(function (p, i) {
        const code = (p.code || '').trim().toUpperCase();
        if (!code) {
            changed = true;
            return Object.assign({}, p, { code: 'T' + String(i + 1).padStart(3, '0') });
        }
        if (code !== p.code) {
            changed = true;
            return Object.assign({}, p, { code: code });
        }
        return p;
    });
    if (changed)
        setProducts(migrated);
    migrateBarcodes();
}

function migrateBarcodes() {
    const list = getProducts();
    let changed = false;
    let num = 1;
    const migrated = list.map(function (p) {
        if (p.barcode && normalizeBarcode(p.barcode))
            return p;
        changed = true;
        var bc = generateEAN13(num++);
        return Object.assign({}, p, { barcode: bc });
    });
    if (changed)
        setProducts(migrated);
}

function normalizeBarcode(str) {
    return String(str || '').replace(/\s/g, '').trim();
}

function findProductByBarcode(term, requireStock) {
    var t = normalizeBarcode(term);
    if (!t)
        return null;
    var found = getProducts().find(function (p) {
        return p.barcode && normalizeBarcode(p.barcode) === t;
    });
    if (!found)
        return null;
    if (requireStock && found.quantity <= 0)
        return null;
    return found;
}

function findProductByCode(term, requireStock) {
    var t = normalizeCode(term);
    if (!t)
        return null;
    var found = getProducts().find(function (p) {
        return (p.code || '').toUpperCase() === t;
    });
    if (!found)
        return null;
    if (requireStock && found.quantity <= 0)
        return null;
    return found;
}

function findProductByScan(term) {
    var bc = findProductByBarcode(term, true);
    if (bc)
        return bc;
    var code = findProductByCode(term, true);
    if (code)
        return code;
    var bcNoStock = findProductByBarcode(term, false);
    if (bcNoStock && bcNoStock.quantity <= 0) {
        toast('Товар \xAB' + bcNoStock.name + '\xBB нет на складе', 'warn');
        return null;
    }
    var codeNoStock = findProductByCode(term, false);
    if (codeNoStock && codeNoStock.quantity <= 0) {
        toast('Товар \xAB' + codeNoStock.name + '\xBB нет на складе', 'warn');
    }
    return null;
}

function barcodePriceLabel() {
    var price = parseFloat(document.getElementById('product-price').value);
    if (isNaN(price) || price < 0)
        price = 0;
    return fmt(price);
}

function handleBarcodeScan(raw) {
    var code = normalizeBarcode(raw);
    if (!code)
        return;
    var modalOpen = document.getElementById('modal-product').classList.contains('show');
    if (modalOpen && isAdmin()) {
        document.getElementById('product-barcode').value = code;
        renderBarcodePreview();
        toast('Штрих-код: ' + code, 'ok');
        return;
    }
    var page = document.querySelector('.page.active');
    var product = findProductByScan(code) || findProductByBarcode(code, false) || findProductByCode(code, false);
    if (!product) {
        toast('Товар не найден: ' + code, 'err');
        if (page.id === 'page-products') {
            document.getElementById('product-search').value = code;
            renderProducts();
        } else {
            document.getElementById('sale-search').value = code;
        }
        return;
    }
    if (page.id === 'page-sales') {
        if (product.quantity <= 0) {
            toast('Нет на складе: ' + product.name, 'err');
            return;
        }
        addToCart(product.id);
    } else if (page.id === 'page-products') {
        document.getElementById('product-search').value = product.barcode || product.code || '';
        renderProducts();
        toast('Найден: ' + product.name, 'ok');
    }
}

function syncProductFilterUI() {
    const sel = document.getElementById('filter-category');
    if (!sel)
        return;
    const current = sel.value || '';
    const cats = getCategories();
    sel.innerHTML = '<option value="">Все категории</option>' + cats.map(function (c) {
        return '<option value="' + c.id + '">' + c.name + '</option>';
    }).join('');
    if (current && cats.some(function (c) {
            return c.id === current;
        }))
        sel.value = current;
    else
        sel.value = '';
    var supSel = document.getElementById('filter-supplier');
    if (supSel) {
        var curSup = supSel.value;
        var prods = getProducts();
        var suppliers = prods.filter(function (p) {
            return p.supplier;
        }).map(function (p) {
            return p.supplier;
        });
        suppliers = suppliers.filter(function (v, i, a) {
            return a.indexOf(v) === i;
        }).sort(function (a, b) {
            return a.localeCompare(b, 'ru');
        });
        supSel.innerHTML = '<option value="">Все поставщики</option>' + suppliers.map(function (s) {
            return '<option value="' + esc(s) + '">' + esc(s) + '</option>';
        }).join('');
        if (curSup && suppliers.indexOf(curSup) >= 0)
            supSel.value = curSup;
        else
            supSel.value = '';
    }
}

function fillSaleProducts() {
}

var _selectedCartItemId = null;

function setSelectedCartItemId(value) {
    _selectedCartItemId = value;
}

var _discountItemId = null;

function setDiscountItemId(value) {
    _discountItemId = value;
}

function onBarcodeDetected(code) {
    if (!scannerActive)
        return;
    if (!scannerTarget)
        return;
    var now = Date.now();
    if (now - _lastScanTime < 800) {
        return;
    }
    setStore('_lastScanTime', now);
    if (scannerTarget === 'sale-search') {
        var exact = findProductByScan(code);
        if (exact) {
            addToCart(exact.id);
            toast('\u2705 ' + exact.name, 'ok');
            if (!_scannerAutoClose) {
                return;
            }
        } else {
            var matches = smartMatchProducts(code);
            if (matches.length === 1) {
                addToCart(matches[0].id);
                toast('\u2705 ' + matches[0].name, 'ok');
                if (!_scannerAutoClose)
                    return;
            } else if (matches.length > 1) {
                toast('Найдено несколько товаров', 'warn');
                var input = document.getElementById(scannerTarget);
                if (input) {
                    input.value = code;
                    input.dispatchEvent(new Event('input'));
                }
                if (scannerAnimFrame) {
                    setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn);
                }
                return;
            } else {
                toast('\u274C Штрих-код ' + code + ' не найден', 'err');
                if (scannerAnimFrame) {
                    setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn);
                }
                return;
            }
        }
    } else {
        var input = document.getElementById(scannerTarget);
        if (input) {
            input.value = code;
            input.dispatchEvent(new Event('input'));
            if (scannerTarget === 'product-barcode' || scannerTarget === 'debt-barcode') {
                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            }
        }
    }
    if (_scannerAutoClose) {
        setStore('scannerActive', false);
        cleanupScanner();
        try {
            closeModal('modal-scanner');
        } catch (e) {
        }
    } else {
        if (scannerAnimFrame) {
            setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn);
        }
    }
}

function renderUnsoldProducts(days) {
    days = days || 30;
    var start = new Date();
    start.setDate(start.getDate() - days);
    var sales = getSales().filter(function (s) {
        return isSaleActive(s) && new Date(s.date) >= start;
    });
    var soldIds = {};
    sales.forEach(function (s) {
        if (s.productId)
            soldIds[s.productId] = true;
    });
    var products = getProducts();
    var unsold = products.filter(function (p) {
        return !soldIds[p.id];
    });
    var container = document.getElementById('unsold-products-list');
    if (!unsold.length) {
        container.innerHTML = '<div class="empty">Все товары продавались за последние ' + days + ' дней</div>';
        return;
    }
    var html = '<div style="font-size:13px;color:var(--text-muted);margin-bottom:8px">Товаров без продаж: ' + unsold.length + '</div>';
    html += '<div class="table-wrap"><table><thead><tr><th>Код</th><th>Название</th><th>Остаток</th><th>Цена</th><th>Категория</th></tr></thead><tbody>';
    unsold.forEach(function (p) {
        html += '<tr><td>' + esc(p.code || '\u2014') + '</td><td>' + esc(p.name) + '</td><td>' + (p.quantity || 0) + '</td><td>' + fmt(p.price) + '</td><td>' + esc(p.category || '\u2014') + '</td></tr>';
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function addDocItemRow(tbodyId) {
    var tbody = document.getElementById(tbodyId);
    if (!tbody)
        return;
    var tr = document.createElement('tr');
    tr.innerHTML = '<td style="padding:2px;border:1px solid var(--border)"><input class="doc-item-code" style="width:100%;border:none;background:transparent;padding:4px" placeholder="Код"></td>' + '<td style="padding:2px;border:1px solid var(--border)"><input class="doc-item-name" style="width:100%;border:none;background:transparent;padding:4px" placeholder="Наименование товара"></td>' + '<td style="padding:2px;border:1px solid var(--border);text-align:center"><input class="doc-item-qty" type="number" step="any" value="1" min="0" style="width:70px;border:none;background:transparent;padding:4px;text-align:center" oninput="recalcDocItemRow(this)"></td>' + '<td style="padding:2px;border:1px solid var(--border);text-align:center"><input class="doc-item-price" type="number" step="any" value="0" min="0" style="width:90px;border:none;background:transparent;padding:4px;text-align:center" oninput="recalcDocItemRow(this)"></td>' + '<td style="padding:2px;border:1px solid var(--border);text-align:center"><span class="doc-item-total" style="font-weight:600">0</span></td>' + '<td style="padding:2px;border:1px solid var(--border);text-align:center"><button class="btn btn-sm btn-danger" style="padding:2px 6px;font-size:12px" onclick="this.closest(\'tr\').remove()">\u2715</button></td>';
    tbody.appendChild(tr);
}

function recalcDocItemRow(el) {
    var tr = el.closest('tr');
    if (!tr)
        return;
    var qty = parseFloat((tr.querySelector('.doc-item-qty') || {}).value) || 0;
    var price = parseFloat((tr.querySelector('.doc-item-price') || {}).value) || 0;
    var totalSpan = tr.querySelector('.doc-item-total');
    if (totalSpan)
        totalSpan.textContent = fmt(qty * price);
}

function getDocItemsFromTable(tbodyId) {
    var tbody = document.getElementById(tbodyId);
    if (!tbody)
        return [];
    var items = [];
    tbody.querySelectorAll('tr').forEach(function (tr) {
        var code = (tr.querySelector('.doc-item-code') || {}).value || '';
        var name = (tr.querySelector('.doc-item-name') || {}).value || '';
        var qty = parseFloat((tr.querySelector('.doc-item-qty') || {}).value) || 0;
        var price = parseFloat((tr.querySelector('.doc-item-price') || {}).value) || 0;
        if (name && qty > 0) {
            items.push({
                productCode: code,
                productName: name,
                quantity: qty,
                unitPrice: price,
                total: qty * price
            });
        }
    });
    return items;
}

function getProductDiscount(productId) {
    var promos = getActivePromotions();
    var best = null;
    promos.forEach(function (p) {
        if (p.productId === productId) {
            if (!best || p.discountValue > best.discountValue)
                best = p;
        }
    });
    return best;
}

var _qtyPopupProductId = null;

function setQtyPopupProductId(value) {
    _qtyPopupProductId = value;
}




function smartMatchProducts(term) {
    var t = term.trim();
    if (!t)
        return [];
    var variations = generateSearchVariations(t);
    var products = getProducts().filter(function (p) {
        return p.quantity > 0;
    });
    var scored = [];
    products.forEach(function (p) {
        var name = (p.name || '').toLowerCase();
        var code = (p.code || '').toLowerCase();
        var barcode = (p.barcode || '').toLowerCase();
        var sku = (p.sku || '').toLowerCase();
        var searchText = name + ' ' + code + ' ' + barcode + ' ' + sku;
        var bestScore = 0;
        var matchType = '';
        variations.forEach(function (v) {
            var vl = v.toLowerCase();
            if (searchText === vl) {
                bestScore = Math.max(bestScore, 1000);
                matchType = 'exact';
                return;
            }
            if (barcode === vl) {
                bestScore = Math.max(bestScore, 950);
                matchType = 'barcode';
                return;
            }
            if (code === vl) {
                bestScore = Math.max(bestScore, 900);
                matchType = 'code';
                return;
            }
            if (name.indexOf(vl) === 0) {
                bestScore = Math.max(bestScore, 500 + (1000 - vl.length));
                matchType = 'prefix';
                return;
            }
            if (code.indexOf(vl) === 0) {
                bestScore = Math.max(bestScore, 400);
                matchType = 'code_prefix';
                return;
            }
            if (name.indexOf(vl) >= 0) {
                bestScore = Math.max(bestScore, 200 + (1000 - vl.length) + (100 - name.indexOf(vl)));
                matchType = 'substring';
            }
            if (code.indexOf(vl) >= 0) {
                bestScore = Math.max(bestScore, 150);
                matchType = 'code_substr';
            }
            if (sku.indexOf(vl) >= 0) {
                bestScore = Math.max(bestScore, 140);
                matchType = 'sku';
            }
            var nameWords = name.split(/[\s\-_.,\/]+/);
            nameWords.forEach(function (w) {
                if (w.indexOf(vl) === 0)
                    bestScore = Math.max(bestScore, 180 + (1000 - vl.length));
                if (w.length > 2 && vl.length > 2) {
                    var dist = levenshtein(w, vl);
                    if (dist <= 1)
                        bestScore = Math.max(bestScore, 160);
                    else if (dist <= 2)
                        bestScore = Math.max(bestScore, 80);
                }
            });
        });
        if (bestScore > 0) {
            scored.push({
                product: p,
                score: bestScore,
                matchType: matchType
            });
        }
    });
    scored.sort(function (a, b) {
        return b.score - a.score;
    });
    return scored.map(function (s) {
        return s.product;
    });
}

function renderBarcodePreview() {
    var el = document.getElementById('product-barcode-preview');
    if (!el)
        return;
    var text = normalizeBarcode(document.getElementById('product-barcode').value);
    var name = (document.getElementById('product-name').value || '').trim();
    if (!text) {
        el.innerHTML = '<span style="color:#999">Введите или создайте штрих-код</span>';
        return;
    }
    var html = '';
    if (name)
        html += '<div style="font-weight:600;font-size:14px;color:#111;margin-bottom:6px">' + name.replace(/</g, '&lt;') + '</div>';
    var isEan13 = /^\d{13}$/.test(text);
    if (isEan13) {
        html += drawEan13Svg(text, 2, 50);
    } else {
        html += drawCode39Svg(text) + '<div class="barcode-num">' + text + '</div>';
    }
    html += '<div style="font-size:20px;font-weight:700;color:#111;margin-top:8px">' + barcodePriceLabel() + '</div>';
    el.innerHTML = html;
}

function generateProductBarcode() {
    var list = getProducts();
    var n = list.length + 1;
    var bc;
    do {
        bc = generateEAN13(n++);
    } while (list.some(function (p) {
        return p.barcode === bc;
    }));
    document.getElementById('product-barcode').value = bc;
    renderBarcodePreview();
    toast('Штрих-код создан', 'ok');
}

function printProductBarcode() {
    var text = normalizeBarcode(document.getElementById('product-barcode').value);
    var name = document.getElementById('product-name').value.trim() || 'Товар';
    var priceStr = barcodePriceLabel();
    if (!text) {
        toast('Сначала укажите штрих-код', 'err');
        return;
    }
    var lw = parseInt(document.getElementById('label-width').value) || 43;
    var lh = parseInt(document.getElementById('label-height').value) || 25;
    var isEan13 = /^\d{13}$/.test(text);
    var svgHtml, numHtml;
    if (isEan13) {
        var targetW = lw * 8 * 0.92;
        var modW = Math.max(1, Math.round(targetW / 115));
        var barH = Math.max(20, Math.round(lh * 8 * 0.4));
        svgHtml = drawEan13Svg(text, modW, barH);
        numHtml = '';
    } else {
        var enc = '*' + String(text).toUpperCase().replace(/[^0-9A-Z\-\.\ \$\/\+\%]/g, '') + '*';
        var totalUnits = 0;
        for (var i = 0; i < enc.length; i++) {
            var pat = CODE39[enc[i]];
            if (pat) {
                for (var j = 0; j < 9; j++)
                    totalUnits += pat[j] === 'w' ? 3 : 1;
            }
            totalUnits += 1;
        }
        var targetPx = lw * 8 * 0.85;
        var scale = Math.max(1, Math.floor(targetPx / (totalUnits * 2)));
        var targetHeightPx = lh * 8 * 0.35;
        var heightScale = Math.max(1, Math.round(targetHeightPx / 40));
        svgHtml = drawCode39Svg(text, scale, heightScale);
        numHtml = '<div class="label-num">' + String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>';
    }
    var esc = function (s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    };
    var w = window.open('', '_blank', 'width=420,height=360');
    w.document.write('<html><head><title>Штрих-код ' + lw + 'x' + lh + 'mm</title>' + '<style>' + '@page { size: ' + lw + 'mm ' + lh + 'mm; margin: 0; }' + '* { box-sizing: border-box; margin: 0; padding: 0; }' + 'body {' + 'width: ' + lw + 'mm; height: ' + lh + 'mm;' + 'display: flex; flex-direction: column; align-items: center; justify-content: center;' + 'font-family: Arial, Helvetica, sans-serif; text-align: center;' + 'overflow: hidden; padding: 0.5mm; background: #fff;' + '}' + '.label-name { font-size: 6pt; font-weight: 700; line-height: 1.15; max-height: 2.2em; overflow: hidden; word-break: break-all; color: #000; }' + '.label-price { font-size: 7.5pt; font-weight: 800; margin: 0.2mm 0 0.3mm; color: #000; }' + '.label-barcode { line-height: 0; }' + '.label-barcode svg { width: ' + (lw - 2) + 'mm; height: auto; display: block; }' + '.label-num { font-family: "Courier New", monospace; font-size: 5.5pt; letter-spacing: 0.8px; margin-top: 0.2mm; color: #000; font-weight: 600; }' + '@media print {' + 'body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }' + '.label-barcode svg { image-rendering: pixelated; image-rendering: crisp-edges; }' + '}' + '</style></head><body>' + '<div class="label-name">' + esc(name) + '</div>' + '<div class="label-price">' + esc(priceStr) + '</div>' + '<div class="label-barcode">' + svgHtml + '</div>' + numHtml + '<script>window.onload=function(){window.print()}</script>' + '</body></html>');
    w.document.close();
}

function renderProducts() {
    syncProductFilterUI();
    const search = (document.getElementById('product-search').value || '').toLowerCase();
    const lowOnly = document.getElementById('filter-low').checked;
    const cat = (document.getElementById('filter-category').value || '').trim();
    const minPrice = parseFloat(document.getElementById('filter-price-min').value);
    const maxPrice = parseFloat(document.getElementById('filter-price-max').value);
    const sort = (document.getElementById('filter-sort').value || 'name_asc').trim();
    let list = getProducts();
    var allProducts = getProducts();
    var totalCost = 0;
    var totalRetail = 0;
    var totalQty = 0;
    allProducts.forEach(function (p) {
        var qty = Number(p.quantity) || 0;
        totalQty += qty;
        totalCost += qty * (Number(p.purchasePrice) || 0);
        totalRetail += qty * (Number(p.price) || 0);
    });
    var summaryEl = document.getElementById('products-summary');
    if (summaryEl) {
        summaryEl.innerHTML = '<div class="card"><div class="card-label">Общий остаток (шт)</div><div class="card-value">' + totalQty + '</div></div>' + '<div class="card warn"><div class="card-label">Общая себестоимость</div><div class="card-value">' + fmt(totalCost) + ' \u20B8</div></div>' + '<div class="card ok"><div class="card-label">Общая цена продажи</div><div class="card-value">' + fmt(totalRetail) + ' \u20B8</div></div>' + (totalCost > 0 ? '<div class="card"><div class="card-label">Наценка (суммарная)</div><div class="card-value">' + fmt(totalRetail - totalCost) + ' \u20B8</div></div>' : '');
    }
    if (search) {
        var smartResults = smartMatchProducts(search);
        var smartIds = {};
        smartResults.forEach(function (p) {
            smartIds[p.id] = true;
        });
        list = list.filter(function (p) {
            return smartIds[p.id];
        });
    }
    if (cat)
        list = list.filter(function (p) {
            return (p.category || '') === cat;
        });
    if (!isNaN(minPrice))
        list = list.filter(function (p) {
            return (Number(p.price) || 0) >= minPrice;
        });
    if (!isNaN(maxPrice))
        list = list.filter(function (p) {
            return (Number(p.price) || 0) <= maxPrice;
        });
    if (lowOnly)
        list = list.filter(function (p) {
            return p.quantity <= (p.minStock || 5);
        });
    var skuSearch = (document.getElementById('filter-sku').value || '').toLowerCase().trim();
    if (skuSearch)
        list = list.filter(function (p) {
            return (p.sku || '').toLowerCase().includes(skuSearch);
        });
    var supFilter = (document.getElementById('filter-supplier').value || '').trim();
    if (supFilter)
        list = list.filter(function (p) {
            return (p.supplier || '') === supFilter;
        });
    var dateFrom = document.getElementById('filter-date-from').value;
    var dateTo = document.getElementById('filter-date-to').value;
    if (dateFrom || dateTo) {
        list = list.filter(function (p) {
            var d = p.created_at ? new Date(p.created_at) : null;
            if (!d)
                return false;
            if (dateFrom && d < new Date(dateFrom + 'T00:00:00'))
                return false;
            if (dateTo && d > new Date(dateTo + 'T23:59:59'))
                return false;
            return true;
        });
    }
    list = list.slice().sort(function (a, b) {
        const an = a.name || '';
        const bn = b.name || '';
        const ap = Number(a.price) || 0;
        const bp = Number(b.price) || 0;
        const aq = Number(a.quantity) || 0;
        const bq = Number(b.quantity) || 0;
        switch (sort) {
        case 'price_asc':
            return ap - bp;
        case 'price_desc':
            return bp - ap;
        case 'qty_asc':
            return aq - bq;
        case 'qty_desc':
            return bq - aq;
        case 'name_asc':
        default:
            return an.localeCompare(bn, 'ru', { sensitivity: 'base' });
        }
    });
    document.getElementById('products-count').textContent = 'Всего: ' + getProducts().length + ' товаров';
    const admin = isAdmin();
    const cols = [
        '<input type="checkbox" id="bulk-select-all" onchange="toggleBulkSelectAll(this)" title="Выбрать всё">',
        '\u2605',
        'Категория',
        'Код',
        'Артикул (SKU)',
        'Штрих-код',
        'Название',
        'Поставщик'
    ];
    if (admin)
        cols.push('Закуп');
    cols.push('Цена', 'Скидка', 'Количество');
    if (admin)
        cols.push('Действия');
    const rows = list.map(function (p) {
        const low = p.quantity <= (p.minStock || 5);
        const qty = low ? '<span class="low-stock">' + p.quantity + ' \u26A0</span>' : p.quantity;
        var catName = '\u2014';
        if (p.category) {
            var catObj = getCategories().find(function (c) {
                return c.id === p.category;
            });
            catName = catObj ? '<span class="badge badge-info">' + catObj.name + '</span>' : '\u2014';
        }
        let nameCell = p.name;
        if (p.info)
            nameCell += '<br><span style="font-size:12px;color:var(--muted)">' + p.info + '</span>';
        if (p.compatibility)
            nameCell += '<br><span style="font-size:11px;color:var(--primary);background:var(--primary-light);padding:2px 6px;border-radius:4px;">\uD83D\uDE97 ' + p.compatibility + '</span>';
        var starBtn = p.favorite ? '<span class="star-fav" onclick="toggleFavoriteFromTable(\'' + p.id + '\', event)" title="Убрать из избранного">\u2605</span>' : '<span class="star-no-fav" onclick="toggleFavoriteFromTable(\'' + p.id + '\', event)" title="Добавить в избранное">\u2606</span>';
        const row = [
            '<input type="checkbox" class="bulk-item" data-id="' + p.id + '" onchange="updateBulkBar()">',
            starBtn,
            catName,
            '<span class="code-tag">' + (p.code || '\u2014') + '</span>',
            '<span style="font-size:12px">' + (p.sku || '\u2014') + '</span>',
            '<span class="barcode-tag">' + (p.barcode || '\u2014') + '</span>',
            nameCell,
            '<span style="font-size:12px">' + (p.supplier || '\u2014') + '</span>'
        ];
        if (admin)
            row.push(fmt(p.purchasePrice || 0));
        row.push(fmt(p.price));
        var discount = getProductDiscount(p.id);
        row.push(discount ? '<span class="badge badge-ok">-' + (discount.discountType === 'percent' ? discount.discountValue + '%' : fmt(discount.discountValue) + '\u20B8') + '</span>' : '\u2014');
        row.push(qty);
        var canEdit = checkPermission('editProducts');
        var canDelete = checkPermission('deleteProducts');
        var actions = '<div class="actions">';
        if (canEdit)
            actions += '<button class="icon-btn" onclick="editProduct(\'' + p.id + '\')">\u270F️</button>';
        if (canDelete)
            actions += '<button class="icon-btn del" onclick="deleteProduct(\'' + p.id + '\')">\uD83D\uDDD1</button>';
        actions += '</div>';
        row.push(actions);
        return row;
    });
    document.getElementById('products-table').innerHTML = list.length ? tableHTML(cols, rows) : '<div class="empty">Товары не найдены</div>';
    document.querySelectorAll('.bulk-item').forEach(function (el) {
        if (_bulkSelected.has(el.dataset.id))
            el.checked = true;
    });
    updateBulkBar();
}

function exportProductsToExcel() {
    exportSectionToExcel('products', getProducts().slice().sort(function (a, b) {
        return String(a.name || '').localeCompare(String(b.name || ''), 'ru', { sensitivity: 'base' });
    }), 'SANAQ_Товары_' + todayStr() + '.xlsx');
}

function exportProductsToCSV() {
    var cfg = EXCEL_SECTIONS.products;
    if (!cfg)
        return;
    var data = getProducts().slice().sort(function (a, b) {
        return String(a.name || '').localeCompare(String(b.name || ''), 'ru', { sensitivity: 'base' });
    });
    var rows = data.map(function (item) {
        return cfg.headers.map(function (h, i) {
            return getFieldValue(item, cfg.fields[i]);
        });
    });
    var csvContent = '\uFEFF' + cfg.headers.join(';') + '\n' + rows.map(function (r) {
        return r.join(';');
    }).join('\n');
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'SANAQ_Товары_' + todayStr() + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    toast('CSV файл скачан', 'ok');
}

function openProductModal(id) {
    document.getElementById('product-edit-id').value = id || '';
    document.getElementById('modal-product-title').textContent = id ? 'Редактировать товар' : 'Новый товар';
    const catSel = document.getElementById('product-category');
    catSel.innerHTML = '<option value="">Без категории</option>' + getCategories().map(function (c) {
        return '<option value="' + c.id + '">' + c.name + '</option>';
    }).join('');
    if (id) {
        const p = getProducts().find(function (x) {
            return x.id === id;
        });
        if (p) {
            document.getElementById('product-code').value = p.code || '';
            document.getElementById('product-barcode').value = p.barcode || '';
            document.getElementById('product-name').value = p.name || '';
            document.getElementById('product-category').value = p.category || '';
            document.getElementById('product-qty').value = p.quantity || 0;
            document.getElementById('product-purchase').value = p.purchasePrice || 0;
            document.getElementById('product-price').value = p.price || 0;
            document.getElementById('product-markup').value = p.markup || 0;
            document.getElementById('product-min').value = p.minStock || 5;
            document.getElementById('product-info').value = p.info || '';
            document.getElementById('product-compatibility').value = p.compatibility || '';
            document.getElementById('product-sku').value = p.sku || '';
            document.getElementById('product-supplier').value = p.supplier || '';
            renderBarcodePreview();
            updateMarkup();
        }
    } else {
        document.getElementById('product-code').value = '';
        document.getElementById('product-barcode').value = '';
        document.getElementById('product-name').value = '';
        document.getElementById('product-category').value = '';
        document.getElementById('product-qty').value = 0;
        document.getElementById('product-purchase').value = 0;
        document.getElementById('product-price').value = 0;
        document.getElementById('product-markup').value = 0;
        document.getElementById('product-min').value = 5;
        document.getElementById('product-info').value = '';
        document.getElementById('product-compatibility').value = '';
        document.getElementById('product-sku').value = '';
        document.getElementById('product-supplier').value = '';
        renderBarcodePreview();
        updateMarkup();
    }
    openModal('modal-product');
}

function editProduct(id) {
    openProductModal(id);
}

function saveProduct() {
    const code = normalizeCode(document.getElementById('product-code').value);
    const barcode = normalizeBarcode(document.getElementById('product-barcode').value);
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const qty = parseFloat(document.getElementById('product-qty').value);
    const purchasePrice = parseFloat(document.getElementById('product-purchase').value) || 0;
    const markup = parseFloat(document.getElementById('product-markup').value) || 0;
    const price = parseFloat(document.getElementById('product-price').value);
    const minStock = parseFloat(document.getElementById('product-min').value) || 5;
    const info = document.getElementById('product-info').value.trim();
    const compatibility = document.getElementById('product-compatibility').value.trim();
    const sku = document.getElementById('product-sku').value.trim();
    const supplier = document.getElementById('product-supplier').value.trim();
    const editId = document.getElementById('product-edit-id').value;
    if (!code) {
        toast('Введите код товара', 'err');
        return;
    }
    if (!name) {
        toast('Введите название товара', 'err');
        return;
    }
    if (isNaN(qty) || qty < 0) {
        toast('Некорректное количество', 'err');
        return;
    }
    if (isNaN(price) || price < 0) {
        toast('Некорректная цена', 'err');
        return;
    }
    if (editId && !checkPermission('editProducts')) {
        toast('Нет прав на редактирование товаров', 'err');
        return;
    }
    if (!editId && !checkPermission('addProducts')) {
        toast('Нет прав на добавление товаров', 'err');
        return;
    }
    let list = getProducts();
    const duplicate = list.find(function (p) {
        return p.code === code && p.id !== editId;
    });
    if (duplicate) {
        toast('Код \xAB' + code + '\xBB уже занят', 'err');
        return;
    }
    if (barcode) {
        const dupBc = list.find(function (p) {
            return p.barcode === barcode && p.id !== editId;
        });
        if (dupBc) {
            toast('Штрих-код \xAB' + barcode + '\xBB уже используется', 'err');
            return;
        }
    }
    if (sku) {
        const dupSku = list.find(function (p) {
            return p.sku === sku && p.id !== editId;
        });
        if (dupSku) {
            toast('Артикул (SKU) \xAB' + sku + '\xBB уже используется', 'err');
            return;
        }
    }
    var data = {
        code: code,
        barcode: barcode || '',
        name: name,
        category: category,
        sku: sku,
        supplier: supplier,
        quantity: qty,
        purchasePrice: purchasePrice,
        markup: markup,
        price: price,
        minStock: minStock,
        info: info,
        compatibility: compatibility
    };
    data.updated_at = new Date().toISOString();
    if (editId) {
        list = list.map(function (p) {
            return p.id === editId ? Object.assign({}, p, data) : p;
        });
        toast('Товар обновлён', 'ok');
        addAuditLog('Изменён товар', 'Товар: ' + data.name, '\u270F️');
    } else {
        if (!data.barcode)
            data.barcode = generateEAN13(list.length + 1);
        data.created_at = data.updated_at;
        list.push(Object.assign({
            id: uid(),
            favorite: false
        }, data));
        toast('Товар добавлен', 'ok');
        addAuditLog('Добавлен товар', 'Товар: ' + data.name + ' (код: ' + data.code + ')', '\uD83D\uDCE6');
    }
    setProducts(list);
    closeModal('modal-product');
    renderProducts();
    renderDashboard();
    refreshAll();
    _schedulePostSaveSync();
}

function deleteProduct(id) {
    if (!checkPermission('deleteProducts')) {
        toast('Нет прав на удаление товаров', 'err');
        return;
    }
    const p = getProducts().find(function (x) {
        return x.id === id;
    });
    confirmAction('Удалить товар?', 'Товар \xAB' + (p ? p.name : '') + '\xBB будет удалён безвозвратно.', function () {
        addAuditLog('Удалён товар', 'Товар: ' + (p ? p.name : ''), '\uD83D\uDDD1');
        setProducts(getProducts().filter(function (x) {
            return x.id !== id;
        }));
        toast('Товар удалён', 'ok');
        renderProducts();
        renderDashboard();
    });
}

function addUniversalProduct() {
    var modal = document.getElementById('modal-universal-product');
    if (!modal) {
        toast('Модальное окно не найдено', 'err');
        return;
    }
    openModal('modal-universal-product');
    var nameEl = document.getElementById('uni-name');
    var priceEl = document.getElementById('uni-price');
    var qtyEl = document.getElementById('uni-qty');
    if (nameEl) {
        nameEl.value = '';
        nameEl.focus();
    }
    if (priceEl)
        priceEl.value = '';
    if (qtyEl)
        qtyEl.value = '1';
}

function confirmUniversalProduct() {
    var name = (document.getElementById('uni-name').value || '').trim();
    var price = parseFloat(document.getElementById('uni-price').value) || 0;
    var qty = parseInt(document.getElementById('uni-qty').value) || 1;
    if (!name) {
        toast('Введите название товара', 'err');
        return;
    }
    if (price <= 0) {
        toast('Введите цену товара', 'err');
        return;
    }
    if (qty < 1)
        qty = 1;
    saleCart.push({
        id: 'uni_' + uid(),
        code: '',
        barcode: '',
        name: name,
        price: price,
        maxQty: 999999,
        qty: qty,
        isUniversal: true
    });
    closeModal('modal-universal-product');
    renderSaleCart();
    toast('Добавлено: ' + name, 'ok');
}

function renderPosBrowserProducts(products, catName) {
}

function renderPosCatProducts(catId) {
    try {
        var list = document.getElementById('pos-cat-modal-list');
        if (!list)
            return;
        var cat = (getCategories() || []).find(function (c) {
            return c.id === catId;
        });
        _posCatModalState.mode = 'products';
        _posCatModalState.catId = catId;
        _posCatModalState.catName = cat ? cat.name : 'Товары';
        var products = (getProducts() || []).filter(function (p) {
            return p.category === catId && p.quantity > 0;
        });
        if (!products.length) {
            list.style.cssText = '';
            list.innerHTML = '<div style="text-align:center;padding:30px;color:#9ca3af;font-size:16px">Нет товаров в этой категории</div>';
            return;
        }
        list.style.cssText = '';
        list.innerHTML = '<div style="margin-bottom:16px;display:flex;align-items:center;gap:12px;padding:4px"><button class="pos-cat-pill" onclick="window.renderPosCatList()">\u2190 Назад</button> <span style="font-size:18px;font-weight:700;color:#374151">' + esc(_posCatModalState.catName) + '</span></div>' + '<div class="pos-modal-grid">' + products.sort(function (a, b) {
            return (b.quantity || 0) - (a.quantity || 0);
        }).map(function (p) {
            return '<div class="pos-quick-item" onclick="closeModal(\'modal-pos-categories\');addToCart(\'' + p.id + '\')">' + '<div class="qp-price">' + fmt(p.price) + '</div>' + '<div style="font-size:14px;color:#6b7280;margin-top:4px">' + esc(p.name) + '</div></div>';
        }).join('') + '</div>';
    } catch (e) {
        toast('Ошибка загрузки товаров', 'err');
    }
}

function startCameraScanner(targetInputId) {
    setStore('scannerTarget', targetInputId);
    if ('BarcodeDetector' in window) {
        setStore('scannerActive', true);
        openModal('modal-scanner');
        var readerEl = document.getElementById('scanner-reader');
        readerEl.innerHTML = '<div style="padding:40px;text-align:center;color:#fff">Загрузка камеры...</div>';
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        }).then(function (stream) {
            if (!scannerActive) {
                stopTracks(stream);
                return;
            }
            setStore('scannerStream', stream;
            var video = document.createElement('video');
            video.srcObject = stream;
            video.setAttribute('playsinline', 'true');
            video.setAttribute('autoplay', 'true');
            video.style.cssText = 'width:100%;height:auto;border-radius:8px;display:block;';
            readerEl.innerHTML = '';
            readerEl.appendChild(video);
            video.play().then(function () {
                var detector;
                try {
                    detector = new BarcodeDetector({
                        formats: [
                            'ean_13',
                            'ean_8',
                            'code_128',
                            'code_39',
                            'code_93',
                            'upc_a',
                            'upc_e',
                            'codabar',
                            'itf'
                        ]
                    });
                } catch (e) {
                    try {
                        detector = new BarcodeDetector();
                    } catch (e2) {
                        stopCameraScanner();
                        toast('Сканер недоступен', 'err');
                        return;
                    }
                }
                setTimeout(function () {
                    var btn = document.getElementById('btn-scanner-torch');
                    if (btn && scannerStream) {
                        var track = scannerStream.getVideoTracks()[0];
                        if (track && track.getCapabilities) {
                            var caps = track.getCapabilities();
                            if (caps && caps.torch)
                                btn.style.display = 'inline-block';
                        }
                    }
                }, 500);
                var lastScan = 0;
                setStore('_scanLoopFn', function () {
                    if (!scannerActive)
                        return;
                    var now = Date.now();
                    if (now - lastScan < 150) {
                        setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn);
                        return;
                    }
                    lastScan = now;
                    detector.detect(video).then(function (barcodes) {
                        if (!scannerActive)
                            return;
                        if (barcodes.length > 0) {
                            onBarcodeDetected(barcodes[0].rawValue);
                            if (scannerActive) {
                                setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn);
                            }
                            return;
                        }
                        setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn);
                    }).catch(function () {
                        if (scannerActive)
                            setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn);
                    });
                };
                setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn);
            }).catch(function () {
                stopCameraScanner();
                toast('Ошибка запуска видео', 'err');
            });
        }).catch(function (err) {
            console.warn('[Scanner] Camera denied:', err);
            readerEl.innerHTML = '<div style="padding:30px;text-align:center;color:#ff6b6b">' + '<div style="font-size:40px;margin-bottom:12px">\uD83D\uDCF7</div>' + '<div>Нет доступа к камере.</div>' + '<div style="font-size:12px;margin-top:8px;color:#999">Разрешите доступ к камере в настройках браузера, или сделайте фото штрих-кода:</div>' + '<button class="btn btn-primary" style="margin-top:16px" onclick="scanFromPhoto()">\uD83D\uDCF8 Сделать фото</button></div>';
        });
    } else {
        scanFromPhoto();
    }
}

function scanFromPhoto() {
    setStore('scannerActive', false);
    cleanupScanner();
    try {
        closeModal('modal-scanner');
    } catch (e) {
        var modal = document.getElementById('modal-scanner');
        if (modal)
            modal.style.display = 'none';
    }
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.onchange = function () {
        var file = input.files[0];
        document.body.removeChild(input);
        if (!file)
            return;
        var img = new Image();
        img.onload = function () {
            if ('BarcodeDetector' in window) {
                try {
                    var detector = new BarcodeDetector({
                        formats: [
                            'ean_13',
                            'ean_8',
                            'code_128',
                            'code_39',
                            'code_93',
                            'upc_a',
                            'upc_e'
                        ]
                    });
                    detector.detect(img).then(function (barcodes) {
                        if (barcodes.length > 0) {
                            onBarcodeDetected(barcodes[0].rawValue);
                            return;
                        }
                        toast('Штрих-код не найден на фото', 'err');
                    }).catch(function () {
                        toast('Ошибка распознавания фото', 'err');
                    });
                } catch (e) {
                    try {
                        var detector = new BarcodeDetector();
                        detector.detect(img).then(function (barcodes) {
                            if (barcodes.length > 0) {
                                onBarcodeDetected(barcodes[0].rawValue);
                                return;
                            }
                            toast('Штрих-код не найден на фото', 'err');
                        }).catch(function () {
                            toast('Ошибка распознавания фото', 'err');
                        });
                    } catch (e2) {
                        toast('Сканер недоступен', 'err');
                    }
                }
            } else {
                toast('Сканер не поддерживается на этом устройстве', 'err');
            }
        };
        img.onerror = function () {
            toast('Ошибка загрузки фото', 'err');
        };
        img.src = URL.createObjectURL(file);
    };
    input.click();
}

function cleanupScanner() {
    if (scannerAnimFrame) {
        cancelAnimationFrame(scannerAnimFrame);
        setStore('scannerAnimFrame', null;
    }
    if (scannerStream) {
        try {
            scannerStream.getTracks().forEach(function (t) {
                t.stop();
            });
        } catch (e) {
        }
        setStore('scannerStream', null;
    }
    var reader = document.getElementById('scanner-reader');
    if (reader)
        reader.innerHTML = '';
}

function stopCameraScanner() {
    setStore('scannerActive', false);
    cleanupScanner();
    try {
        closeModal('modal-scanner');
    } catch (e) {
        var modal = document.getElementById('modal-scanner');
        if (modal)
            modal.style.display = 'none';
    }
}

function renderProductAnalysis() {
    const period = _statsPeriod || 'today';
    const now = new Date();
    var periodStart = new Date(0);
    if (period === 'today') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
        var d = new Date(now);
        d.setDate(d.getDate() - 7);
        periodStart = d;
    } else if (period === 'month') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    var sales = getSales().filter(function (s) {
        return isSaleActive(s) && new Date(s.date) >= periodStart;
    });
    var sort = (document.getElementById('stats-product-sort') || {}).value || 'top';
    var prodMap = {};
    sales.forEach(function (s) {
        var key = s.productId || s.productName || '';
        if (!key)
            return;
        if (!prodMap[key])
            prodMap[key] = {
                name: s.productName || '\u2014',
                code: s.productCode || '',
                qty: 0,
                sum: 0,
                id: s.productId
            };
        prodMap[key].qty += Number(s.quantity) || 0;
        prodMap[key].sum += Number(s.total) || 0;
    });
    var prodArr = Object.keys(prodMap).map(function (k) {
        return prodMap[k];
    });
    prodArr.sort(function (a, b) {
        return sort === 'top' ? b.qty - a.qty : a.qty - b.qty;
    });
    var container = document.getElementById('stats-product-analysis');
    if (!prodArr.length) {
        container.innerHTML = '<div class="empty">Нет продаж за период</div>';
        return;
    }
    var top = prodArr.slice(0, 5);
    var worst = prodArr.slice(-5).reverse();
    var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">';
    html += '<div><div style="font-weight:600;font-size:13px;margin-bottom:8px;color:var(--ok)">' + (sort === 'top' ? 'ТОП продаваемых' : 'Наименее популярные') + '</div>';
    html += '<table class="table-sm"><thead><tr><th>Товар</th><th style="text-align:right">Кол-во</th><th style="text-align:right">Сумма</th></tr></thead><tbody>';
    (sort === 'top' ? top : worst).forEach(function (p) {
        html += '<tr><td>' + esc(p.name) + '</td><td style="text-align:right">' + p.qty + '</td><td style="text-align:right">' + fmt(p.sum) + '</td></tr>';
    });
    html += '</tbody></table></div>';
    html += '<div><div style="font-weight:600;font-size:13px;margin-bottom:8px;color:var(--err)">' + (sort === 'top' ? 'Наименее популярные' : 'ТОП продаваемых') + '</div>';
    html += '<table class="table-sm"><thead><tr><th>Товар</th><th style="text-align:right">Кол-во</th><th style="text-align:right">Сумма</th></tr></thead><tbody>';
    (sort === 'top' ? worst : top).forEach(function (p) {
        html += '<tr><td>' + esc(p.name) + '</td><td style="text-align:right">' + p.qty + '</td><td style="text-align:right">' + fmt(p.sum) + '</td></tr>';
    });
    html += '</tbody></table></div></div>';
    html += '<div style="font-size:12px;color:var(--text-muted);margin-top:4px">Всего товаров: ' + prodArr.length + '</div>';
    container.innerHTML = html;
}

function selectWoProduct(id) {
    var p = getProducts().find(function (x) {
        return x.id === id;
    });
    if (!p)
        return;
    document.getElementById('wo-product-id').value = p.id;
    document.getElementById('wo-selected-name').textContent = p.name + ' (' + (p.code || '') + ')';
    document.getElementById('wo-selected-qty').textContent = p.quantity;
    document.getElementById('wo-selected-product').classList.remove('hidden');
    document.getElementById('wo-search-results').classList.add('hidden');
    document.getElementById('wo-product-search').value = '';
}

function debtBarcodeLookup() {
    var barcode = document.getElementById('debt-barcode').value.trim();
    if (!barcode)
        return;
    var p = getProducts().find(function (x) {
        return (x.barcode || '') === barcode;
    });
    if (p) {
        document.getElementById('debt-product-name').value = p.name;
        document.getElementById('debt-product-code').value = p.code || '';
        document.getElementById('debt-amount').value = p.price || 0;
        document.getElementById('debt-qty').value = 1;
    } else {
        toast('Товар с таким штрих-кодом не найден', 'err');
    }
}



set('renderProducts', renderProducts);
set('renderUnsoldProducts', renderUnsoldProducts);
export { getProducts, setProducts, getDocumentItems, setDocumentItems, migrateProducts, migrateBarcodes, normalizeBarcode, findProductByBarcode, findProductByCode, findProductByScan, barcodePriceLabel, handleBarcodeScan, syncProductFilterUI, fillSaleProducts, _selectedCartItemId, setSelectedCartItemId, _discountItemId, setDiscountItemId, onBarcodeDetected, renderUnsoldProducts, addDocItemRow, recalcDocItemRow, getDocItemsFromTable, getProductDiscount, _qtyPopupProductId, setQtyPopupProductId, smartMatchProducts, renderBarcodePreview, generateProductBarcode, printProductBarcode, renderProducts, exportProductsToExcel, exportProductsToCSV, openProductModal, editProduct, saveProduct, deleteProduct, addUniversalProduct, confirmUniversalProduct, renderPosBrowserProducts, renderPosCatProducts, startCameraScanner, scanFromPhoto, cleanupScanner, stopCameraScanner, renderProductAnalysis, selectWoProduct, debtBarcodeLookup };
