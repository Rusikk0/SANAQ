import { getProducts, setProducts, renderProducts, fillSaleProducts, smartMatchProducts, findProductByScan, setSelectedCartItemId } from './products.js';
import { set } from './app-context.js';
import { isAdmin, currentUser, getOpenShiftForCashier, checkPermission } from './users.js';
import { isToday, tableHTML, fmt, fmtDate, escapeHtml, esc, confirmAction, showPaymentMethodModal, closeModal, todayStr, createExcelWorkbook, saveExcelBuffer, fmtShort } from './utils.js';
import { toast } from './notifications.js';
import { renderPosSideHistory, renderDashboard, uid, renderPosCatBrowser, goPage, openModal, renderWriteOffsTable, renderAuditsArchive } from './ui.js';
import { renderStatistics, _posBrowserState } from './statistics.js';
import { calcShiftTotals } from './shifts.js';
import { getDebtors, getDebts, setDebts, renderDebts, setDebtors } from './debts.js';
import { saleCart, setSaleCart, renderSaleCart, addToCart, setCartDiscountInfo } from './cart.js';
import { currentCustomer, setCurrentCustomer, getCustomerTier, getCustomers, setCustomers } from './customers.js';
import { getDocuments, setDocuments, renderDocuments } from './documents.js';
import { exportSectionToExcel } from './reports.js';
import { _auditSession, setAuditSession } from './auth.js';

const PAY_LABELS = {
    cash: 'Наличные',
    kaspi: 'Kaspi QR',
    transfer: 'Банк',
    mixed: 'Смешанная',
    debt: 'В долг'
};

let currentPayment = 'cash';

function setCurrentPayment(value) {
    currentPayment = value;
}

const getSales = () => (window.ApDb ? window.ApDb.getSales() : []);

function setSales(arr) {
    if (window.ApDb)
        window.ApDb.setSales(arr);
}

function migrateSalesRecords() {
    const sales = getSales();
    if (!sales.length)
        return;
    const products = getProducts();
    let changed = false;
    const migrated = sales.map(function (s) {
        let out = s;
        if (!out.receiptId) {
            out = Object.assign({}, out, { receiptId: out.id });
            changed = true;
        }
        if (out.purchasePrice == null) {
            const p = out.productId ? products.find(x => x.id === out.productId;
            }) : null;
            out = Object.assign({}, out, { purchasePrice: p ? Number(p.purchasePrice) || 0 : 0 });
            changed = true;
        }
        return out;
    });
    if (changed)
        setSales(migrated);
}

function focusSaleSearch() {
    setTimeout(function () {
        const el = document.getElementById('sale-search');
        if (el && document.getElementById('page-sales').classList.contains('active'))
            el.focus();
    }, 150);
}

function isSaleActive(s) {
    return !s.status || s.status === 'completed';
}

function saleStatusBadge(s) {
    return isSaleActive(s) ? '<span class="badge badge-ok">Завершена</span>' : '<span class="badge badge-danger">Отменена</span>';
}

function adminCancelSaleBtn(s) {
    if (!isAdmin() || !isSaleActive(s))
        return '\u2014';
    return '<button class="btn btn-sm btn-danger" onclick="cancelSaleConfirm(\'' + s.id + '\')">Отменить</button>';
}

function togglePaymentSection(id, show) {
    const el = document.getElementById(id);
    if (!el)
        return;
    if (show) {
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

function renderSalesToday() {
    const list = getSales().filter(s => isToday(s.date) && isSaleActive(s);
    });
    const receipts = groupSalesIntoReceipts(list);
    const cols = [
        'Чек',
        'Товаров',
        'Сумма',
        'Оплата',
        'Кассир',
        'Время',
        ''
    ];
    document.getElementById('sales-today-list').innerHTML = receipts.length ? tableHTML(cols, receipts.map(r => [
            '<span class="code-tag">\u2116 ' + r.id.slice(-6) + '</span>',
            r.items.reduce(sum, it => sum + (Number(it.quantity) || 0);
            }, 0),
            fmt(r.total),
            badgePay(r.payment, r.items[0]),
            r.userName || '\u2014',
            fmtDate(r.date),
            '<button class="btn btn-sm btn-secondary" onclick="openReceipt(\'' + r.id + '\')">Открыть</button> ' + '<button class="btn btn-sm btn-primary" onclick="printInvoice(\'' + r.id + '\')">Накладная</button> ' + '<button class="btn btn-sm btn-primary" onclick="printSalePKO(\'' + r.id + '\')">ПКО</button>'
        ];
    })) : '<div class="empty">Продаж сегодня нет</div>';
}

function buildSalePKOHTML(sale, receiptId, storeName, total) {
    const date = sale.date || new Date().toISOString();
    const payer = sale.customerName || sale.clientName || '\u2014';
    const basis = 'Оплата по чеку \u2116' + receiptId.slice(-6) + ' от ' + fmtDate(date);
    const h = '<div style="font-family:\'Times New Roman\',Times,serif;color:#000;max-width:700px;margin:0 auto;padding:24px 20px;font-size:13px;line-height:1.4">';
    h += '<div style="text-align:center;font-size:16px;font-weight:700;margin-bottom:8px">ПРИХОДНЫЙ КАССОВЫЙ ОРДЕР</div>';
    h += '<div style="display:flex;justify-content:space-between;margin-bottom:16px">' + '<span><strong>\u2116:</strong> ' + receiptId.slice(-6) + '</span>' + '<span><strong>Дата:</strong> ' + fmtDate(date) + '</span>' + '</div>';
    h += '<div style="border:1px solid #000;padding:16px;margin-bottom:16px">';
    h += '<p><strong>Принято от:</strong> ' + escapeHtml(payer) + '</p>';
    h += '<p><strong>Основание:</strong> ' + escapeHtml(basis) + '</p>';
    h += '<p style="font-size:16px;font-weight:700;text-align:right">Сумма: ' + fmt(total) + ' \u20B8</p>';
    h += '</div>';
    h += '<div style="font-size:12px;margin-top:16px">' + '<div style="display:flex;justify-content:space-between;max-width:500px">' + '<span>Главный бухгалтер: _______________</span>' + '<span>Кассир: _______________</span>' + '</div></div>';
    h += '<div style="font-size:11px;color:#555;margin-top:24px;text-align:center">' + '<em>Организация (ИП): ' + escapeHtml(storeName) + '</em></div>';
    h += '</div>';
    return h;
}

function cancelSale(saleId) {
    const sales = getSales();
    const idx = sales.findIndex(function (s) {
        return s.id === saleId;
    });
    if (idx < 0)
        return;
    const sale = sales[idx];
    if (!isSaleActive(sale))
        return;
    if (sale.productId) {
        const products = getProducts();
        const product = products.find(p => p.id === sale.productId;
        });
        if (product) {
            product.quantity += sale.quantity;
            setProducts(products);
        }
    }
    sales[idx] = Object.assign({}, sale, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelledBy: currentUser.name
    });
    setSales(sales);
    toast('Продажа отменена, товар возвращён на склад', 'ok');
    renderSalesToday();
    renderPosSideHistory();
    renderDashboard();
    renderProducts();
    fillSaleProducts();
    if (document.getElementById('page-statistics').classList.contains('active'))
        renderStatistics();
}

function renderSalesHeatmap(sales) {
    const container = document.getElementById('sales-heatmap');
    if (!container)
        return;
    const heat = {};
    const days = [
        'Вс',
        'Пн',
        'Вт',
        'Ср',
        'Чт',
        'Пт',
        'Сб'
    ];
    for (var d = 0; d < 7; d++) {
        heat[d] = {};
        for (var h = 0; h < 24; h++)
            heat[d][h] = 0;
    }
    sales.forEach(s => {
        const dt = new Date(s.date);
        const day = dt.getDay();
        const hour = dt.getHours();
        if (heat[day] && heat[day][hour] !== undefined)
            heat[day][hour] += Number(s.total) || 0;
    });
    const maxVal = 0;
    for (var d2 = 0; d2 < 7; d2++)
        for (var h2 = 0; h2 < 24; h2++)
            maxVal = Math.max(maxVal, heat[d2][h2]);
    maxVal = maxVal || 1;
    const html = '<table style="border-collapse:collapse;font-size:11px"><thead><tr><th style="padding:4px;width:30px"></th>';
    for (var h3 = 0; h3 < 24; h3++)
        html += '<th style="padding:4px;min-width:28px;text-align:center;font-weight:400;color:var(--text-muted)">' + h3 + '</th>';
    html += '</tr></thead><tbody>';
    for (var d3 = 0; d3 < 7; d3++) {
        html += '<tr><td style="padding:4px;font-weight:600;text-align:right;color:var(--text-muted)">' + days[d3] + '</td>';
        for (var h4 = 0; h4 < 24; h4++) {
            const val = heat[d3][h4];
            const intensity = val / maxVal;
            const r = Math.round(255 - intensity * 200);
            const g = Math.round(255 - intensity * 150);
            const b = Math.round(255 - intensity * 80);
            html += '<td style="padding:2px;text-align:center;background:rgb(' + r + ',' + g + ',' + b + ');border-radius:3px;font-size:10px;color:' + (intensity > 0.5 ? '#fff' : '#666') + '" title="' + days[d3] + ' ' + h4 + ':00 \u2014 ' + fmt(Math.round(val)) + ' \u20B8">' + (val > 0 ? val > 100000 ? '\uD83D\uDD25' : val > 10000 ? '\u2022' : '\xB7' : '') + '</td>';
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderMostExpensiveReceipt(receipts) {
    const container = document.getElementById('most-expensive-receipt');
    if (!container)
        return;
    if (!receipts.length) {
        container.innerHTML = '<div class="empty">Нет данных</div>';
        return;
    }
    const best = receipts[0];
    receipts.forEach(r => {
        if (r.total > best.total)
            best = r;
    });
    const cashierName = best.userName || '\u2014';
    const items = best.items || [];
    const qty = items.reduce(s, it => s + (Number(it.quantity) || 0);
    }, 0);
    container.innerHTML = '<div class="card" style="border-left:3px solid var(--warn)">' + '<div style="font-weight:700;font-size:18px;color:var(--text)">' + fmt(best.total) + ' \u20B8</div>' + '<div style="display:flex;gap:16px;margin-top:6px;flex-wrap:wrap;font-size:13px;color:var(--text-secondary)">' + '<span>\uD83D\uDC64 ' + esc(cashierName) + '</span>' + '<span>\uD83D\uDCE6 ' + qty + ' шт.</span>' + '<span>\uD83D\uDD50 ' + fmtDate(best.date) + '</span>' + '<span>\uD83D\uDCB3 ' + badgePay(best.payment, best.items[0]) + '</span>' + '</div></div>';
}

function updateSaleShiftBanner() {
    const banner = document.getElementById('sale-shift-banner');
    if (isAdmin()) {
        banner.classList.add('hidden');
        return;
    }
    const shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    banner.classList.remove('hidden');
    if (shift) {
        banner.style.borderColor = 'var(--accent)';
        const t = calcShiftTotals(shift.id);
        banner.innerHTML = '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px">' + '<div><strong style="color:var(--ok)">\u25CF Смена открыта</strong> \u2014 с ' + fmtDate(shift.openedAt) + '. Продаж: ' + t.salesCount + ', выручка: ' + fmt(t.revenue) + '</div>' + '<div style="display:flex;gap:8px;flex-wrap:wrap">' + '<button class="btn btn-sm btn-secondary" onclick="goPage(\'myshift\')">\uD83D\uDD50 Моя смена</button>' + '<button class="btn btn-sm btn-danger" onclick="closeShiftConfirm(\'' + shift.id + '\')">Закрыть смену</button>' + '</div></div>';
    } else {
        banner.style.borderColor = 'var(--warn)';
        banner.innerHTML = '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px">' + '<div><strong style="color:var(--warn)">\u26A0 Смена не открыта</strong> \u2014 сначала откройте смену, чтобы продавать</div>' + '<button class="btn btn-sm btn-success" onclick="openShift()">\u25B6 Открыть смену</button>' + '</div>';
    }
}

function badgePay(pay, item) {
    if (pay === 'mixed' && item) {
        const parts = [];
        if (Number(item.cashAmount) > 0)
            parts.push('\uD83D\uDCB5' + fmt(item.cashAmount));
        if (Number(item.kaspiAmount) > 0)
            parts.push('\uD83D\uDCF1' + fmt(item.kaspiAmount));
        if (Number(item.transferAmount) > 0)
            parts.push('\uD83C\uDFE6' + fmt(item.transferAmount));
        return '<span class="badge badge-mixed">' + parts.join(' ') + '</span>';
    }
    const map = {
        cash: 'badge-cash',
        kaspi: 'badge-kaspi',
        transfer: 'badge-bank',
        debt: 'badge-warn',
        mixed: 'badge-mixed'
    };
    const cls = map[pay] || 'badge-info';
    return '<span class="badge ' + cls + '">' + (PAY_LABELS[pay] || pay) + '</span>';
}

function groupSalesIntoReceipts(salesList) {
    const map = {};
    (salesList || []).forEach(s => {
        const rid = s.receiptId || s.id;
        if (!map[rid]) {
            map[rid] = {
                id: rid,
                date: s.date,
                shiftId: s.shiftId || null,
                customerId: s.customerId || null,
                payment: s.payment,
                userName: s.userName,
                username: s.username,
                status: s.status,
                debtorName: s.debtorName || '',
                debtPhone: (s.debtPhone !== undefined && s.debtPhone !== null) ? String(s.debtPhone) : '',
                debtReturnDate: s.debtReturnDate || '',
                cashAmount: Number(s.cashAmount) || 0,
                kaspiAmount: Number(s.kaspiAmount) || 0,
                transferAmount: Number(s.transferAmount) || 0,
                bonusSpend: Number(s.bonusSpend) || 0,
                earnedBonus: Number(s.earnedBonus) || 0,
                discountAmount: Number(s.discountAmount) || 0,
                items: [],
                total: 0
            };
        }
        map[rid].items.push(s);
        map[rid].total += Number(s.total) || 0;
        if (!map[rid].payment)
            map[rid].payment = s.payment;
        if (!map[rid].date || s.date && s.date > map[rid].date)
            map[rid].date = s.date;
    });
    return Object.keys(map).map(k => map[k];
    }).sort(a, b => String(b.date || '').localeCompare(String(a.date || ''));
    });
}

function completeDebtPayment(debtorId, amount, paymentMethod) {
    const debtor = getDebtors().find(d => d.id === debtorId;
    });
    if (!debtor) {
        toast('Должник не найден', 'err');
        return;
    }
    const shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    const sales = getSales();
    const receiptId = uid();
    const dateStr = new Date().toISOString();
    sales.push({
        id: uid(),
        receiptId: receiptId,
        shiftId: shift ? shift.id : null,
        productId: null,
        productCode: '',
        productName: 'Погашение долга: ' + debtor.name,
        quantity: 1,
        unitPrice: amount,
        purchasePrice: 0,
        total: amount,
        payment: paymentMethod,
        cashAmount: paymentMethod === 'cash' ? amount : 0,
        kaspiAmount: paymentMethod === 'kaspi' ? amount : 0,
        transferAmount: paymentMethod === 'transfer' ? amount : 0,
        customerId: null,
        userName: currentUser.name,
        username: currentUser.username,
        date: dateStr,
        status: 'completed',
        debtorName: debtor.name || '',
        debtPhone: (debtor.phone !== undefined && debtor.phone !== null) ? String(debtor.phone) : '',
        debtReturnDate: ''
    });
    setSales(sales);
    const debts = getDebts();
    debts.push({
        id: uid(),
        debtorId: debtorId,
        debtorName: debtor.name,
        productCode: '',
        productName: 'Оплата',
        quantity: 1,
        amount: -amount,
        cashierName: currentUser.name,
        dueDate: null,
        status: 'open',
        note: 'Оплата через ' + (paymentMethod === 'cash' ? 'наличные' : paymentMethod === 'kaspi' ? 'Kaspi QR' : 'Банк'),
        date: dateStr
    });
    const openDebts = debts.filter(d => d.debtorId === debtorId && d.status === 'open' && d.amount > 0;
    });
    openDebts.sort(a, b => (a.date || '').localeCompare(b.date || '');
    });
    const remaining = amount;
    debts = debts.map(function (d) {
        if (d.debtorId === debtorId && d.status === 'open' && d.amount > 0 && remaining > 0) {
            if (d.amount <= remaining) {
                remaining -= d.amount;
                return Object.assign({}, d, { status: 'paid' });
            }
        }
        return d;
    });
    setDebts(debts);
    toast('Долг погашен: ' + fmt(amount) + ' (' + debtor.name + ')', 'ok');
    renderDebts();
    renderDashboard();
    renderSalesToday();
}

const getWriteOffs = () => (window.ApDb ? window.ApDb.getWriteOffs() : []);

const getAudits = () => (window.ApDb ? window.ApDb.getAudits() : []);

const getDeferred = () => (window.ApDb ? window.ApDb.getDeferred() : []);

function setDeferred(arr) {
    if (window.ApDb)
        window.ApDb.setDeferred(arr);
}

function onSaleSearch() {
    const term = document.getElementById('sale-search').value;
    const box = document.getElementById('sale-results');
    if (!box)
        return;
    const catFilter = _posBrowserState.cat || '';
    if (!term.trim() && !catFilter) {
        box.classList.add('hidden');
        box.innerHTML = '';
        return;
    }
    const matches = term.trim() ? smartMatchProducts(term) : getProducts();
    if (catFilter)
        matches = matches.filter(p => p.category === catFilter;
        });
    if (!matches.length) {
        box.classList.remove('hidden');
        box.innerHTML = '<div style="padding:16px;text-align:center;color:#9ca3af">Ничего не найдено</div>';
        return;
    }
    box.classList.remove('hidden');
    box.innerHTML = matches.map(p => '<div class="sale-result-item" onclick="addToCart(\'' + p.id + '\')">' + '<span class="code-tag">' + (p.code || '\u2014') + '</span> ' + (p.barcode ? '<span class="barcode-tag">' + p.barcode + '</span> ' : '') + '<span class="name">' + esc(p.name) + '</span><br>' + '<span style="font-size:12px;color:var(--muted)">Остаток: ' + p.quantity + ' \xB7 ' + fmt(p.price) + '</span></div>';
    }).join('');
}

function clearSaleSelection(noConfirm) {
    if (!noConfirm && saleCart.length) {
        if (!confirm('Очистить корзину?'))
            return;
    }
    document.getElementById('sale-search').value = '';
    document.getElementById('sale-results').classList.add('hidden');
    setSaleCart([]);
    setCurrentCustomer(null);
    setCartDiscountInfo(null);
    setSelectedCartItemId(null);
    document.getElementById('sale-customer-search').value = '';
    document.getElementById('sale-customer-name').value = '';
    document.getElementById('sale-customer-name').style.display = 'none';
    document.getElementById('sale-customer-info').style.display = 'none';
    document.getElementById('sale-bonus-wrap').style.display = 'none';
    const bs = document.getElementById('sale-bonus-spend');
    if (bs)
        bs.value = 0;
    const cg = document.getElementById('cash-given');
    if (cg)
        cg.value = '';
    const cc = document.getElementById('cash-change');
    if (cc)
        cc.value = '';
    const mc = document.getElementById('mixed-cash');
    if (mc)
        mc.value = '0';
    const mk = document.getElementById('mixed-kaspi');
    if (mk)
        mk.value = '0';
    const mt = document.getElementById('mixed-transfer');
    if (mt)
        mt.value = '0';
    const mcg = document.getElementById('mixed-cash-given');
    if (mcg)
        mcg.value = '';
    const mcc = document.getElementById('mixed-cash-change');
    if (mcc)
        mcc.value = '';
    const mr = document.getElementById('mixed-remainder');
    if (mr)
        mr.innerHTML = '';
    const dn = document.getElementById('debt-pay-name');
    if (dn)
        dn.value = '';
    const dp = document.getElementById('debt-pay-phone');
    if (dp)
        dp.value = '';
    const dd = document.getElementById('debt-pay-due');
    if (dd)
        dd.value = '';
    const dno = document.getElementById('debt-pay-note');
    if (dno)
        dno.value = '';
    togglePaymentSection('cash-change-wrap', currentPayment === 'cash');
    togglePaymentSection('mixed-payment-wrap', currentPayment === 'mixed');
    togglePaymentSection('debt-payment-wrap', currentPayment === 'debt');
    renderSaleCart();
    if (saleCart.length === 0)
        toast('Корзина очищена');
}

function onSaleSearchKey(e) {
    if (e.key !== 'Enter')
        return;
    e.preventDefault();
    const term = document.getElementById('sale-search').value;
    const exact = findProductByScan(term);
    if (exact) {
        addToCart(exact.id);
        return;
    }
    const catFilter = _posBrowserState.cat || '';
    const matches = smartMatchProducts(term);
    if (catFilter)
        matches = matches.filter(p => p.category === catFilter;
        });
    if (matches.length === 1)
        addToCart(matches[0].id);
    else if (matches.length > 1)
        toast('Найдено несколько товаров \u2014 выберите из списка', 'warn');
    else
        toast('Товар не найден', 'err');
}

function calcChange() {
    const totalEl = document.getElementById('sale-total');
    const given = parseFloat(document.getElementById('cash-given').value) || 0;
    const total = parseFloat(totalEl.dataset.value || totalEl.value || 0);
    const change = given - total;
    const changeEl = document.getElementById('cash-change');
    const changeDisplay = document.getElementById('sale-change-display');
    const btnComplete = document.getElementById('btn-complete-sale');
    if (given <= 0) {
        if (changeEl) {
            changeEl.value = '';
            changeEl.style.color = '#059669';
        }
        if (changeDisplay)
            changeDisplay.textContent = '0 \u20B8';
        if (btnComplete && saleCart.length > 0)
            btnComplete.disabled = false;
    } else if (change < 0) {
        if (changeEl) {
            changeEl.value = 'Не хватает ' + Math.abs(change).toLocaleString('ru-RU') + ' \u20B8';
            changeEl.style.color = '#dc2626';
        }
        if (changeDisplay) {
            changeDisplay.textContent = '-' + Math.abs(change).toLocaleString('ru-RU') + ' \u20B8';
            changeDisplay.className = 'pos-bottom-total-value pos-red';
        }
        if (btnComplete)
            btnComplete.disabled = true;
    } else {
        if (changeEl) {
            changeEl.value = change.toLocaleString('ru-RU') + ' \u20B8';
            changeEl.style.color = '#059669';
        }
        if (changeDisplay) {
            changeDisplay.textContent = change.toLocaleString('ru-RU') + ' \u20B8';
            changeDisplay.className = 'pos-bottom-total-value pos-green';
        }
        if (btnComplete && saleCart.length > 0)
            btnComplete.disabled = false;
    }
}

function calcMixedRemainder(changed) {
    const totalEl = document.getElementById('sale-total');
    const total = parseFloat(totalEl.dataset.value || totalEl.value || 0);
    const cashEl = document.getElementById('mixed-cash');
    const kaspiEl = document.getElementById('mixed-kaspi');
    const transEl = document.getElementById('mixed-transfer');
    const cash = parseFloat(cashEl.value) || 0;
    const kaspi = parseFloat(kaspiEl.value) || 0;
    const trans = parseFloat(transEl.value) || 0;
    if (changed === 'cash') {
        const rest = Math.max(0, total - cash);
        kaspi = Math.round(rest / 2);
        trans = rest - kaspi;
        kaspiEl.value = kaspi;
        transEl.value = trans;
    } else if (changed === 'kaspi') {
        trans = Math.max(0, total - cash - kaspi);
        transEl.value = trans;
    } else if (changed === 'transfer') {
        kaspi = Math.max(0, total - cash - trans);
        kaspiEl.value = kaspi;
    }
    const sum = cash + kaspi + trans;
    const rem = total - sum;
    const el = document.getElementById('mixed-remainder');
    if (!el)
        return;
    const cashGivenEl = document.getElementById('mixed-cash-given');
    const cashChangeEl = document.getElementById('mixed-cash-change');
    const cashGiven = parseFloat(cashGivenEl.value) || 0;
    if (cashGiven > 0) {
        const change = cashGiven - cash;
        if (change < 0) {
            cashChangeEl.value = 'Не хватает';
            cashChangeEl.style.color = 'var(--err)';
        } else {
            cashChangeEl.value = change.toLocaleString('ru-RU') + ' \u20B8';
            cashChangeEl.style.color = 'var(--ok)';
        }
    } else {
        cashChangeEl.value = '';
    }
    const btnComplete = document.getElementById('btn-complete-sale');
    const changeDisplay = document.getElementById('sale-change-display');
    if (Math.abs(rem) < 0.01) {
        el.innerHTML = '<span style="color:#059669;font-weight:600">\u2713 Сумма совпадает</span>';
        if (changeDisplay) {
            changeDisplay.textContent = '0 \u20B8';
            changeDisplay.className = 'pos-bottom-total-value pos-green';
        }
        if (btnComplete && saleCart.length > 0)
            btnComplete.disabled = false;
    } else if (rem > 0) {
        el.innerHTML = '<span style="color:#d97706">Осталось доплатить: ' + rem.toLocaleString('ru-RU') + ' \u20B8</span>';
        if (btnComplete)
            btnComplete.disabled = true;
    } else {
        el.innerHTML = '<span style="color:#dc2626">Превышение на: ' + Math.abs(rem).toLocaleString('ru-RU') + ' \u20B8</span>';
        if (changeDisplay) {
            changeDisplay.textContent = Math.abs(rem).toLocaleString('ru-RU') + ' \u20B8';
            changeDisplay.className = 'pos-bottom-total-value pos-green';
        }
        if (btnComplete)
            btnComplete.disabled = true;
    }
}

let updateSaleTotal = renderSaleCart;

function deferSale() {
    if (!saleCart.length) {
        toast('Корзина пуста', 'err');
        return;
    }
    const deferred = getDeferred();
    const products = getProducts();
    const name = currentCustomer ? currentCustomer.name : '';
    const phone = currentCustomer ? currentCustomer.phone || '' : '';
    const items = [];
    const total = 0;
    const totalQty = 0;
    saleCart.forEach(c => {
        const p = products.find(x => x.id === c.id;
        });
        if (p)
            p.quantity -= c.qty;
        const itemTotal = c.price * c.qty;
        total += itemTotal;
        totalQty += c.qty;
        items.push({
            productId: c.id,
            productCode: c.code || '',
            productName: c.name,
            quantity: c.qty,
            unitPrice: c.price,
            total: itemTotal
        });
    });
    const defId = uid();
    deferred.push({
        id: defId,
        items: items,
        customerName: name,
        customerPhone: phone,
        total: total,
        quantity: totalQty,
        cashierName: currentUser.name,
        status: 'pending',
        note: '',
        date: new Date().toISOString(),
        completedAt: null
    });
    setDeferred(deferred);
    const docs = getDocuments();
    docs.unshift({
        id: defId,
        type: 'deferred',
        docType: 'deferred',
        docNumber: 'DEF_' + Date.now(),
        items: items.map(it => ({
                productCode: it.productCode,
                productName: it.productName,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                total: it.total
            })),
        clientName: name,
        customerName: name,
        customerPhone: (phone !== undefined && phone !== null) ? String(phone) : '',
        total: total,
        status: 'pending',
        date: new Date().toISOString(),
        documentDate: new Date().toISOString(),
        meta: {}
    });
    setDocuments(docs);
    setProducts(products);
    toast('Продажа отложена на ' + fmt(total), 'ok');
    clearSaleSelection(true);
    renderDeferred();
}

function restoreDeferredSale(id) {
    if (!id)
        return;
    const deferred = getDeferred();
    const rec = deferred.find(d => d.id === id;
    });
    if (!rec) {
        toast('Запись не найдена', 'err');
        return;
    }
    const products = getProducts();
    rec.items.forEach(item => {
        const p = products.find(x => x.id === item.productId;
        });
        if (p)
            p.quantity += item.quantity;
        const existing = saleCart.find(c => c.id === item.productId && c.receiptId === 'deferred';
        });
        if (existing)
            existing.qty += item.quantity;
        else
            saleCart.push({
                id: item.productId,
                code: item.productCode,
                name: item.productName,
                qty: item.quantity,
                price: item.unitPrice,
                receiptId: 'deferred'
            });
    });
    setProducts(products);
    deferred = deferred.map(function (d) {
        if (d.id !== id) return d;
        return Object.assign({}, d, {
            status: 'in_cart',
            completedAt: new Date().toISOString()
        });
    });
    setDeferred(deferred);
    toast('Товары восстановлены в корзину', 'ok');
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.page === 'sales');
    });
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === 'page-sales');
    });
    fillSaleProducts();
    updateSaleTotal();
    renderSalesToday();
    renderPosSideHistory();
    updateSaleShiftBanner();
    focusSaleSearch();
    renderPosCatBrowser();
    renderDeferred();
}

function deleteDeferred(id) {
    if (!id)
        return;
    confirmAction('Удалить', 'Удалить отложенную продажу из списка?', function () {
        const deferred = getDeferred();
        const rec = deferred.find(d => d.id === id;
        });
        if (!rec)
            return;
        if (rec.status === 'pending' || rec.status === 'awaiting_payment') {
            const products = getProducts();
            rec.items.forEach(item => {
                const p = products.find(x => x.id === item.productId;
                });
                if (p)
                    p.quantity += item.quantity;
            });
            setProducts(products);
        }
        if (rec.status === 'in_cart') {
            rec.items.forEach(item => {
                setSaleCart(saleCart.filter(c => c.id !== item.productId || c.receiptId !== 'deferred';
                }));
            });
            updateSaleTotal();
        }
        if (window.ApDb && typeof window.ApDb.deleteDeferred === 'function') {
            window.ApDb.deleteDeferred(id);
        } else {
            setDeferred(deferred.filter(d => d.id !== id;
            }));
        }
        const docs = getDocuments();
        const docIdx = docs.findIndex(function (d) {
            return d.id === id;
        });
        if (docIdx >= 0) {
            if (rec.status === 'completed') {
                docs[docIdx] = Object.assign({}, docs[docIdx], { status: 'cancelled' });
            } else {
                docs.splice(docIdx, 1);
            }
            setDocuments(docs);
        }
        renderDeferred();
        renderDocuments();
    });
}

function payDeferred(id) {
    if (!id)
        return;
    const deferred = getDeferred();
    const rec = deferred.find(d => d.id === id;
    });
    if (!rec) {
        toast('Запись не найдена', 'err');
        return;
    }
    if (rec.status === 'completed') {
        toast('Уже оплачено', 'err');
        return;
    }
    showPaymentMethodModal(function (paymentMethod) {
        const shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
        if (!shift) {
            toast('Смена не открыта', 'err');
            goPage('myshift');
            return;
        }
        const sales = getSales();
        const products = getProducts();
        const receiptId = uid();
        const dateStr = new Date().toISOString();
        rec.items.forEach(item => {
            const p = products.find(x => x.id === item.productId;
            });
            sales.push({
                id: uid(),
                receiptId: receiptId,
                shiftId: shift.id,
                productId: item.productId,
                productCode: item.productCode || '',
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                purchasePrice: p ? Number(p.purchasePrice) || 0 : 0,
                total: item.total,
                payment: paymentMethod,
                cashAmount: paymentMethod === 'cash' ? item.total : 0,
                kaspiAmount: paymentMethod === 'kaspi' ? item.total : 0,
                transferAmount: paymentMethod === 'transfer' ? item.total : 0,
                customerId: null,
                userName: currentUser.name,
                username: currentUser.username,
                date: dateStr,
                status: 'completed',
                debtorName: rec.customerName || '',
                debtPhone: (rec.customerPhone !== undefined && rec.customerPhone !== null) ? String(rec.customerPhone) : '',
                debtReturnDate: ''
            });
        });
        setSales(sales);
        deferred = deferred.map(function (d) {
            if (d.id !== id) return d;
            return Object.assign({}, d, {
                status: 'completed',
                paymentMethod: paymentMethod,
                completedAt: dateStr
            });
        });
        setDeferred(deferred);
        const docs = getDocuments().map(function (d) {
            if (d.id !== id) return d;
            return Object.assign({}, d, {
                status: 'paid',
                paymentMethod: paymentMethod
            });
        });
        setDocuments(docs);
        toast('Оплачено: ' + fmt(rec.total) + ' (' + (paymentMethod === 'cash' ? 'наличные' : paymentMethod === 'kaspi' ? 'Kaspi QR' : 'банк') + ')', 'ok');
        renderDeferred();
        renderDocuments();
        renderDashboard();
        renderSalesToday();
        renderPosSideHistory();
    });
}

function cancelDeferredDoc(id) {
    if (!id)
        return;
    const deferred = getDeferred();
    const rec = deferred.find(d => d.id === id;
    });
    if (!rec) {
        toast('Запись не найдена', 'err');
        return;
    }
    if (rec.status === 'completed') {
        toast('Нельзя отменить оплаченный документ', 'err');
        return;
    }
    const msg = rec.status === 'in_cart' ? 'Товары уже в корзине. Перенести обратно в отложенные? Склад не изменится.' : 'Перенести товары обратно в отложенные? Склад не изменится.';
    confirmAction('Отменить документ', msg, function () {
        if (rec.status === 'in_cart') {
            rec.items.forEach(item => {
                setSaleCart(saleCart.filter(c => c.id !== item.productId || c.receiptId !== 'deferred';
                }));
            });
            updateSaleTotal();
        }
        deferred = deferred.map(function (d) {
            if (d.id !== id) return d;
            return Object.assign({}, d, {
                status: 'pending',
                paymentMethod: null
            });
        });
        setDeferred(deferred);
        const docs = getDocuments().map(function (d) {
            if (d.id !== id) return d;
            return Object.assign({}, d, {
                status: 'cancelled',
                paymentMethod: null
            });
        });
        setDocuments(docs);
        toast('Документ отменён, товары возвращены в отложенные', 'ok');
        renderDeferred();
        renderDocuments();
    });
}

function renderDeferred() {
    const deferred = getDeferred();
    const search = (document.getElementById('deferred-search') || {}).value || '';
    const filter = (document.getElementById('deferred-filter') || {}).value || 'all';
    const searchLower = search.toLowerCase().trim();
    const filtered = deferred.filter(function (d) {
        if (filter !== 'all' && d.status !== filter) return false;
        if (searchLower) {
            const nameMatch = (d.customerName || '').toLowerCase().indexOf(searchLower) >= 0;
            const phoneMatch = (d.customerPhone || '').toLowerCase().indexOf(searchLower) >= 0;
            if (!nameMatch && !phoneMatch) return false;
        }
        return true;
    });
    const cols = [
        'Клиент',
        'Телефон',
        'Товары',
        'Сумма',
        'Кассир',
        'Дата',
        'Статус',
        'Оплата',
        ''
    ];
    const rows = filtered.map(function (d) {
        const statusBadge = d.status === 'pending' ? '<span class="badge badge-warn">В ожидании</span>' : d.status === 'awaiting_payment' ? '<span class="badge badge-info">Ожидает оплаты</span>' : d.status === 'completed' ? '<span class="badge badge-ok">Оплачен</span>' : d.status === 'in_cart' ? '<span class="badge badge-info">В корзине</span>' : '<span class="badge badge-danger">Отменён</span>';
        const paymentLabel = d.paymentMethod ? d.paymentMethod === 'cash' ? '\uD83D\uDCB5 Наличные' : d.paymentMethod === 'kaspi' ? '\uD83D\uDCF1 Kaspi QR' : d.paymentMethod === 'transfer' ? '\uD83C\uDFE6 Банк' : d.paymentMethod : '\u2014';
        const itemsHtml = (d.items || []).map(it => '<div style="font-size:12px;padding:2px 0">' + esc(it.productName) + ' \xD7 ' + it.quantity + ' = ' + fmt(it.total) + '</div>';
        }).join('');
        const actions = '<div class="actions" style="gap:4px">';
        if (d.status === 'pending' || d.status === 'awaiting_payment') {
            actions += '<button class="btn btn-success btn-sm" onclick="payDeferred(\'' + d.id + '\')" title="Оплатить">\uD83D\uDCB3 Оплатить</button>';
            actions += '<button class="btn btn-secondary btn-sm" onclick="cancelDeferredDoc(\'' + d.id + '\')" title="Отменить">\u2715 Отменить</button>';
        }
        if (d.status === 'pending') {
            actions += '<button class="btn btn-secondary btn-sm" onclick="restoreDeferredSale(\'' + d.id + '\')" title="Вернуть в корзину">\u21A9</button>';
        }
        if (d.status === 'completed' || d.status === 'cancelled' || d.status === 'in_cart') {
            actions += '<button class="btn btn-danger btn-sm" onclick="deleteDeferred(\'' + d.id + '\')" title="Удалить">\uD83D\uDDD1</button>';
        }
        actions += '</div>';
        return [
            d.customerName || '\u2014',
            d.customerPhone || '\u2014',
            itemsHtml + (d.note ? '<div style="font-size:11px;color:var(--muted);margin-top:4px">' + esc(d.note) + '</div>' : ''),
            fmt(d.total),
            d.cashierName || '\u2014',
            fmtDate(d.date),
            statusBadge,
            paymentLabel,
            actions
        ];
    });
    document.getElementById('deferred-table').innerHTML = rows.length ? tableHTML(cols, rows) : '<div class="empty">Нет отложенных товаров</div>';
}

function openDeferredModal() {
    if (!isAdmin()) {
        toast('Только администратор', 'err');
        return;
    }
    document.getElementById('def-product-search').value = '';
    document.getElementById('def-search-results').innerHTML = '';
    document.getElementById('def-product-id').value = '';
    document.getElementById('def-selected-name').textContent = '';
    document.getElementById('def-selected-qty').textContent = '';
    document.getElementById('def-qty').value = 1;
    document.getElementById('def-price').value = 0;
    document.getElementById('def-total').textContent = '0 \u20B8';
    document.getElementById('def-customer-name').value = '';
    openModal('modal-deferred');
}

function searchDeferredProduct() {
    const q = (document.getElementById('def-product-search').value || '').trim().toLowerCase();
    const results = document.getElementById('def-search-results');
    if (!q) {
        results.innerHTML = '';
        return;
    }
    const products = getProducts().filter(p => (p.name || '').toLowerCase().indexOf(q) >= 0 || (p.code || '').toLowerCase().indexOf(q) >= 0 || (p.barcode || '').indexOf(q) >= 0;
    }).slice(0, 10);
    if (!products.length) {
        results.innerHTML = '<div style="padding:8px;color:var(--text-muted)">Ничего не найдено</div>';
        return;
    }
    results.innerHTML = products.map(p => '<div class="sale-result-item" onclick="selectDeferredProduct(\'' + p.id + '\')">' + '<strong>' + esc(p.name) + '</strong>' + (p.code ? ' <span class="code-tag">' + esc(p.code) + '</span>' : '') + ' <span style="color:var(--text-muted)">Остаток: ' + p.quantity + '</span></div>';
    }).join('');
}

function selectDeferredProduct(id) {
    const p = getProducts().find(x => x.id === id;
    });
    if (!p)
        return;
    document.getElementById('def-product-id').value = id;
    document.getElementById('def-selected-name').textContent = p.name;
    document.getElementById('def-selected-qty').textContent = 'Остаток: ' + p.quantity;
    document.getElementById('def-price').value = p.price || 0;
    document.getElementById('def-search-results').innerHTML = '';
    document.getElementById('def-product-search').value = p.name;
    calcDeferredTotal();
}

function calcDeferredTotal() {
    const qty = parseFloat(document.getElementById('def-qty').value) || 0;
    const price = parseFloat(document.getElementById('def-price').value) || 0;
    document.getElementById('def-total').textContent = fmt(qty * price);
}

function saveDeferred() {
    const productId = document.getElementById('def-product-id').value;
    const qty = parseFloat(document.getElementById('def-qty').value) || 0;
    const price = parseFloat(document.getElementById('def-price').value) || 0;
    const customerName = document.getElementById('def-customer-name').value.trim();
    const note = document.getElementById('def-note').value.trim();
    if (!productId) {
        toast('Выберите товар', 'err');
        return;
    }
    if (qty <= 0) {
        toast('Укажите количество', 'err');
        return;
    }
    const p = getProducts().find(x => x.id === productId;
    });
    if (!p) {
        toast('Товар не найден', 'err');
        return;
    }
    if (qty > p.quantity) {
        toast('Недостаточно товара (остаток: ' + p.quantity + ')', 'err');
        return;
    }
    const deferred = getDeferred();
    const defId = uid();
    p.quantity -= qty;
    const itemTotal = qty * price;
    deferred.push({
        id: defId,
        items: [{
                productId: p.id,
                productCode: p.code || '',
                productName: p.name,
                quantity: qty,
                unitPrice: price,
                total: itemTotal
            }],
        customerName: customerName,
        customerPhone: '',
        total: itemTotal,
        quantity: qty,
        cashierName: currentUser.name,
        status: 'pending',
        note: note,
        date: new Date().toISOString(),
        completedAt: null
    });
    setDeferred(deferred);
    const docs = getDocuments();
    docs.unshift({
        id: defId,
        type: 'deferred',
        docType: 'deferred',
        items: [{
                productCode: p.code || '',
                productName: p.name,
                quantity: qty,
                unitPrice: price,
                total: itemTotal
            }],
        customerName: customerName,
        clientName: customerName,
        total: itemTotal,
        status: 'pending',
        date: new Date().toISOString(),
        documentDate: new Date().toISOString(),
        meta: {}
    });
    setDocuments(docs);
    setProducts(getProducts());
    toast('Товар отложен', 'ok');
    closeModal('modal-deferred');
    renderDeferred();
}

function exportDeferredExcel() {
    exportSectionToExcel('deferred', getDeferred(), 'SANAQ_Отложенные_' + todayStr() + '.xlsx');
}

function completeSale() {
    if (!checkPermission('createSale')) {
        toast('Нет прав на создание продажи', 'err');
        return;
    }
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
    let shiftId = shift.id;
    const products = getProducts();
    const sales = getSales();
    const dateStr = new Date().toISOString();
    for (let i = 0; i < saleCart.length; i++) {
        const c = saleCart[i];
        if (c.isUniversal)
            continue;
        const p = products.find(x => x.id === c.id;
        });
        if (!p || p.quantity < c.qty) {
            toast('Товар \xAB' + c.name + '\xBB недостаточно на складе', 'err');
            return;
        }
    }
    const stEl = document.getElementById('sale-total');
    const finalTotal = stEl ? parseFloat(stEl.dataset.value || stEl.value || 0) : 0;
    if (currentPayment === 'cash') {
        const given = parseFloat(document.getElementById('cash-given').value) || 0;
        if (given > 0 && given < finalTotal - 0.01) {
            toast('Сумма от клиента меньше суммы чека', 'err');
            return;
        }
    }
    let debtName = '', debtPhone = '', debtDue = '', debtNote = '';
    if (currentPayment === 'debt') {
        debtName = document.getElementById('debt-pay-name').value.trim();
        debtPhone = document.getElementById('debt-pay-phone').value.trim();
        debtDue = document.getElementById('debt-pay-due').value;
        const debtNoteEl = document.getElementById('debt-pay-note');
        debtNote = debtNoteEl ? debtNoteEl.value.trim() : '';
        if (!debtName) {
            toast('Введите имя должника', 'err');
            return;
        }
        if (!debtPhone) {
            toast('Введите телефон должника', 'err');
            return;
        }
        if (!debtDue) {
            toast('Выберите дату возврата долга', 'err');
            return;
        }
    }
    let mCash = 0, mKaspi = 0, mTransfer = 0;
    if (currentPayment === 'mixed') {
        mCash = parseFloat(document.getElementById('mixed-cash').value) || 0;
        mKaspi = parseFloat(document.getElementById('mixed-kaspi').value) || 0;
        mTransfer = parseFloat(document.getElementById('mixed-transfer').value) || 0;
        if (Math.abs(mCash + mKaspi + mTransfer - finalTotal) > 0.01) {
            toast('Сумма смешанной оплаты не совпадает с итогом чека', 'err');
            return;
        }
        const mixedGiven = parseFloat(document.getElementById('mixed-cash-given').value) || 0;
        if (mixedGiven > 0 && mixedGiven < mCash - 0.01) {
            toast('Получено наличных меньше доли наличных в смешанной оплате', 'err');
            return;
        }
    }
    let subTotal = saleCart.reduce(sum, c => sum + c.price * c.qty;
    }, 0);
    let bonusSpend = parseInt(document.getElementById('sale-bonus-spend').value) || 0;
    let earnedBonus = 0;
    let discountAmt = 0;
    let subAfterDiscount = subTotal;
    if (currentCustomer) {
        const tier = getCustomerTier(currentCustomer.spent || 0);
        discountAmt = subTotal * tier.discount;
        subAfterDiscount = subTotal - discountAmt;
        let maxBonus = Math.min(Number(currentCustomer.bonusBalance) || 0, subAfterDiscount * tier.maxSpend);
        maxBonus = Math.floor(maxBonus);
        if (bonusSpend > maxBonus)
            bonusSpend = maxBonus;
        if (bonusSpend < 0)
            bonusSpend = 0;
        earnedBonus = Math.round(subAfterDiscount * tier.bonusEarn);
        const customers = getCustomers();
        const cidx = customers.findIndex(function (c) {
            return c.id === currentCustomer.id;
        });
        if (cidx >= 0) {
            customers[cidx].spent = (Number(customers[cidx].spent) || 0) + subAfterDiscount;
            customers[cidx].bonusBalance = Math.max(0, Math.round((Number(customers[cidx].bonusBalance) || 0) - bonusSpend + earnedBonus));
            setCustomers(customers);
        }
    }
    const receiptId = uid();
    saleCart.forEach(c => {
        const p = products.find(x => x.id === c.id;
        });
        if (p)
            p.quantity -= c.qty;
        const ratio = c.price * c.qty / subTotal;
        const itemFinalTotal = finalTotal * ratio;
        sales.push({
            id: uid(),
            receiptId: receiptId,
            shiftId: shiftId,
            productId: c.id,
            productCode: c.code || '',
            productName: c.name,
            quantity: c.qty,
            unitPrice: c.price,
            purchasePrice: p ? Number(p.purchasePrice) || 0 : 0,
            total: itemFinalTotal,
            payment: currentPayment,
            cashAmount: currentPayment === 'cash' ? finalTotal : currentPayment === 'mixed' ? mCash : 0,
            kaspiAmount: currentPayment === 'kaspi' ? finalTotal : currentPayment === 'mixed' ? mKaspi : 0,
            transferAmount: currentPayment === 'transfer' ? finalTotal : currentPayment === 'mixed' ? mTransfer : 0,
            customerId: currentCustomer ? currentCustomer.id : null,
            userName: currentUser.name,
            username: currentUser.username,
            date: dateStr,
            status: 'completed',
            debtorName: currentPayment === 'debt' ? debtName : '',
            debtPhone: currentPayment === 'debt' ? (debtPhone !== undefined && debtPhone !== null ? String(debtPhone) : '') : '',
            debtReturnDate: currentPayment === 'debt' ? debtDue : ''
        });
    });
    setProducts(products);
    addAuditLog('Продажа завершена', 'Чек #' + receiptId.slice(-6) + ' на сумму ' + fmt(finalTotal) + ' \u20B8', '\uD83D\uDED2');
    setSales(sales);
    if (currentPayment === 'debt') {
        const debtors = getDebtors();
        const debtor = debtors.find(d => d.name.toLowerCase() === debtName.toLowerCase() && d.phone === debtPhone;
        });
        if (!debtor) {
            debtor = {
                id: uid(),
                name: debtName,
                phone: debtPhone,
                rating: 'good'
            };
            debtors.push(debtor);
            setDebtors(debtors);
        }
        const debts = getDebts();
        debts.push({
            id: uid(),
            debtorId: debtor.id,
            debtorName: debtName,
            productCode: saleCart.map(c => c.code || '';
            }).join(', '),
            productName: saleCart.map(c => c.name;
            }).join(', '),
            quantity: saleCart.reduce(s, c => s + c.qty;
            }, 0),
            amount: finalTotal,
            cashierName: currentUser.name,
            dueDate: debtDue || null,
            status: 'open',
            note: debtNote || 'Чек \u2116' + receiptId.slice(-6),
            date: dateStr
        });
        setDebts(debts);
        toast('Долг записан: ' + debtName + ' \u2014 ' + fmt(finalTotal), 'ok');
    }
    toast('Продажа оформлена: ' + fmt(finalTotal) + (earnedBonus ? ' (+бонусы)' : ''), 'ok');
    clearSaleSelection(true);
    renderSalesToday();
    renderPosSideHistory();
    renderDashboard();
    if (currentPayment === 'debt')
        renderDebts();
}

function cancelSaleConfirm(saleId) {
    const sale = getSales().find(s => s.id === saleId;
    });
    if (!sale || !isSaleActive(sale)) {
        toast('Продажа уже отменена', 'err');
        return;
    }
    confirmAction('Отменить продажу?', 'Товар \xAB' + sale.productName + '\xBB (' + sale.quantity + ' шт.) вернётся на склад. Сумма ' + fmt(sale.total) + ' не будет учтена в выручке.', function () {
        cancelSale(saleId);
    });
}

function selectReturnReceipt(receiptId) {
    closeModal('modal-return-selector');
    openReturnModalFromReceipt(receiptId);
}

function openReturnModalFromReceipt(receiptId) {
    if (!isAdmin()) {
        toast('Только для администратора', 'err');
        return;
    }
    receiptId = receiptId || window._currentReceiptId;
    if (!receiptId) {
        toast('Чек не найден', 'err');
        return;
    }
    const all = getSales().filter(isSaleActive);
    const receipts = groupSalesIntoReceipts(all);
    const r = receipts.find(x => x.id === receiptId;
    });
    if (!r) {
        toast('Чек не найден', 'err');
        return;
    }
    document.getElementById('return-sale-id').value = receiptId;
    document.getElementById('return-customer-id').value = r.customerId || '';
    const meta = 'Чек \u2116 ' + receiptId.slice(-6) + ' от ' + fmtDate(r.date) + ' | Кассир: ' + (r.userName || '\u2014');
    document.getElementById('return-receipt-meta').textContent = meta;
    const body = document.getElementById('return-items-body');
    body.innerHTML = '';
    const totalRefund = 0;
    r.items.forEach(it => {
        const qty = Number(it.quantity) || 0;
        const price = Number(it.unitPrice) || 0;
        const refundMax = price * qty;
        totalRefund += refundMax;
        const tr = document.createElement('tr');
        tr.innerHTML = '<td>' + esc(it.productName) + '</td>' + '<td style="text-align:center">' + qty + '</td>' + '<td style="text-align:center"><input type="number" class="form-input" style="width:70px;padding:4px;text-align:center" min="0" max="' + qty + '" value="' + qty + '" data-price="' + price + '" data-max="' + refundMax + '" oninput="calcReturnTotal()"></td>' + '<td style="text-align:right;font-weight:600;color:var(--err)">' + fmt(refundMax) + '</td>';
        body.appendChild(tr);
    });
    document.getElementById('return-total-refund').textContent = fmt(totalRefund);
    openModal('modal-return');
}

function exportSalesExcel() {
    exportSectionToExcel('sales', getSales().filter(isSaleActive), 'SANAQ_Продажи_' + todayStr() + '.xlsx');
}

function exportSalesDetailedExcel() {
    const receipts = groupSalesIntoReceipts(getSales().filter(isSaleActive));
    const rows = [];
    receipts.forEach(r => {
        const pay = PAY_LABELS[r.payment] || r.payment || '';
        if (r.payment === 'mixed') {
            const parts = [];
            if (Number(r.cashAmount) > 0)
                parts.push('наличные: ' + Number(r.cashAmount));
            if (Number(r.kaspiAmount) > 0)
                parts.push('Kaspi QR: ' + Number(r.kaspiAmount));
            if (Number(r.transferAmount) > 0)
                parts.push('Банк: ' + Number(r.transferAmount));
            if (parts.length)
                pay = parts.join('; ');
        }
        r.items.forEach(s, idx => {
            rows.push([
                r.id,
                r.id.slice(-6),
                idx + 1,
                s.productCode || '',
                s.productName || '',
                Number(s.quantity) || 0,
                Number(s.unitPrice) || 0,
                Number(s.total) || 0,
                Number(r.total) || 0,
                pay,
                r.userName || '',
                fmtDate(r.date),
                r.debtorName || '',
                r.debtPhone || '',
                r.debtReturnDate ? fmtDate(r.debtReturnDate) : ''
            ]);
        });
    });
    const headers = [
        'ID чека',
        'Номер чека',
        '\u2116 строки',
        'Код товара',
        'Товар',
        'Кол-во',
        'Цена',
        'Сумма строки',
        'Итого по чеку',
        'Оплата',
        'Кассир',
        'Дата и время',
        'Должник',
        'Телефон должника',
        'Дата возврата долга'
    ];
    const widths = [
        24,
        12,
        10,
        14,
        42,
        10,
        14,
        16,
        16,
        24,
        20,
        20,
        22,
        20,
        18
    ];
    createExcelWorkbook(headers, rows, widths, 'Продажи').then(function (buf) {
        saveExcelBuffer(buf, 'SANAQ_Продажи_детально_' + todayStr() + '.xlsx');
        toast('Excel файл скачан', 'ok');
    }).catch(function (e) {
        toast('Ошибка: ' + (e.message || e), 'err');
    });
}

async function submitWriteOff() {
    if (!checkPermission('writeOffStock')) {
        toast('Нет прав на списание товара', 'err');
        return;
    }
    const productId = document.getElementById('wo-product-id').value;
    const qty = parseFloat(document.getElementById('wo-qty').value);
    const reason = document.getElementById('wo-reason').value;
    const note = document.getElementById('wo-note').value.trim();
    if (!productId) {
        toast('Выберите товар', 'err');
        return;
    }
    if (!qty || qty <= 0) {
        toast('Укажите количество', 'err');
        return;
    }
    if (!reason) {
        toast('Укажите причину', 'err');
        return;
    }
    const p = getProducts().find(x => x.id === productId;
    });
    if (!p) {
        toast('Товар не найден', 'err');
        return;
    }
    if (qty > p.quantity) {
        toast('Количество превышает остаток (' + p.quantity + ')', 'err');
        return;
    }
    confirmAction('Списание', 'Списать ' + qty + ' шт. товара \xAB' + p.name + '\xBB? (' + reason + ')', async function () {
        try {
            await window.ApDb.createWriteOff({
                productId: p.id,
                productCode: p.code || '',
                productName: p.name,
                quantity: qty,
                reason: reason,
                note: note,
                userName: currentUser.name
            });
            toast('Списание оформлено', 'ok');
            document.getElementById('wo-product-id').value = '';
            document.getElementById('wo-selected-product').classList.add('hidden');
            document.getElementById('wo-qty').value = '';
            document.getElementById('wo-note').value = '';
            renderWriteOffsTable();
        } catch (err) {
            toast(err.message || String(err), 'err');
        }
    });
}

function startAuditSession() {
    if (!checkPermission('inventory')) {
        toast('Нет прав на инвентаризацию', 'err');
        return;
    }
    const products = getProducts();
    if (!products.length) {
        toast('Нет товаров для ревизии', 'err');
        return;
    }
    setAuditSession({
        active: true,
        items: products.map(p => {
                productId: p.id,
                code: p.code || '',
                name: p.name,
                qtySystem: Number(p.quantity) || 0,
                qtyFact: Number(p.quantity) || 0
            };
        })
    });
    document.getElementById('audit-session-ctrl').classList.add('hidden');
    document.getElementById('audit-session-panel').classList.remove('hidden');
    renderAuditSessionTable();
}

function cancelAuditSession() {
    confirmAction('Отмена ревизии', 'Отменить текущую ревизию? Все введённые данные будут потеряны.', function () {
        setAuditSession(null);
        document.getElementById('audit-session-ctrl').classList.remove('hidden');
        document.getElementById('audit-session-panel').classList.add('hidden');
    });
}

function renderAuditSessionTable() {
    if (!_auditSession || !_auditSession.active)
        return;
    const body = document.getElementById('audit-session-body');
    if (!body)
        return;
    const filter = (document.getElementById('audit-search').value || '').trim().toLowerCase();
    const items = _auditSession.items.filter(function (it) {
        if (!filter) return true;
        return it.name.toLowerCase().indexOf(filter) >= 0 || it.code.toLowerCase().indexOf(filter) >= 0;
    });
    body.innerHTML = items.map(function (it, idx) {
        const realIdx = _auditSession.items.indexOf(it);
        const diff = it.qtyFact - it.qtySystem;
        const diffColor = diff === 0 ? 'var(--muted)' : diff > 0 ? 'var(--ok)' : 'var(--err)';
        const diffText = diff > 0 ? '+' + diff : diff;
        return '<tr>' + '<td><span class="code-tag">' + it.code + '</span></td>' + '<td>' + it.name + '</td>' + '<td style="text-align:center">' + it.qtySystem + '</td>' + '<td style="text-align:center"><input type="number" min="0" step="any" value="' + it.qtyFact + '" ' + 'style="width:80px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);text-align:center" ' + 'onchange="updateAuditQty(' + realIdx + ', this.value)"></td>' + '<td style="text-align:center;color:' + diffColor + ';font-weight:600">' + diffText + '</td>' + '</tr>';
    }).join('');
}

function completeAuditSession() {
    if (!_auditSession || !_auditSession.active)
        return;
    const diffs = _auditSession.items.filter(it => it.qtyFact !== it.qtySystem;
    });
    const msg = diffs.length ? 'Обнаружены расхождения по ' + diffs.length + ' позициям. Завершить ревизию и обновить остатки?' : 'Расхождений не обнаружено. Завершить ревизию?';
    confirmAction('Завершить ревизию', msg, async function () {
        try {
            const payload = {
                userName: currentUser.name,
                items: _auditSession.items.map(it => {
                        productId: it.productId,
                        code: it.code,
                        name: it.name,
                        qtySystem: it.qtySystem,
                        qtyFact: it.qtyFact,
                        diff: it.qtyFact - it.qtySystem
                    };
                })
            };
            await window.ApDb.createAudit(payload);
            toast('Ревизия завершена. Остатки обновлены.', 'ok');
            setAuditSession(null);
            document.getElementById('audit-session-ctrl').classList.remove('hidden');
            document.getElementById('audit-session-panel').classList.add('hidden');
            renderAuditsArchive();
        } catch (err) {
            toast(err.message || String(err), 'err');
        }
    });
}

function printReceipt() {
    const el = document.getElementById('receipt-print-area');
    if (!el)
        return;
    const printWin = window.open('', '', 'height=600,width=400');
    if (!printWin) {
        toast('Разрешите всплывающее окно для печати чека', 'err');
        return;
    }
    printWin.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Чек</title><style>');
    printWin.document.write('@page{size:80mm auto;margin:4mm}body{font-family:"Courier New",Courier,monospace;font-size:12px;line-height:1.25;color:#000;background:#fff;margin:0;padding:0;width:72mm}.receipt-row{display:flex;justify-content:space-between;gap:8px}.receipt-center{text-align:center}.receipt-bold{font-weight:700}.receipt-sep{border-top:1px dashed #000;margin:6px 0}.receipt-item{margin:5px 0}.receipt-name{word-break:break-word}.receipt-total{font-size:15px;font-weight:700}');
    printWin.document.write('@media print{button{display:none!important}}');
    printWin.document.write('</style></head><body>');
    printWin.document.write(el.innerHTML);
    printWin.document.write('<script>window.onload=function(){window.focus();window.print();};</script></body></html>');
    printWin.document.close();
}

function openReceipt(receiptId) {
    const all = getSales().filter(isSaleActive);
    const receipts = groupSalesIntoReceipts(all);
    const r = receipts.find(x => x.id === receiptId;
    });
    if (!r) {
        toast('Чек не найден', 'err');
        return;
    }
    window._currentReceiptId = receiptId;
    document.getElementById('receipt-title').textContent = 'Чек \u2116 ' + receiptId.slice(-6);
    const store = window.ApAuth && window.ApAuth.getCurrentStore();
    const storeName = store ? store.storeName : 'SANAQ';
    const bin = localStorage.getItem('ap_store_bin') || '';
    const dateStr = r.date ? new Date(r.date).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : '\u2014';
    const payDetail = PAY_LABELS[r.payment] || r.payment || '\u2014';
    if (r.payment === 'mixed') {
        const pts = [];
        if (Number(r.cashAmount) > 0)
            pts.push('нал:' + fmtShort(r.cashAmount));
        if (Number(r.kaspiAmount) > 0)
            pts.push('kaspiqr:' + fmtShort(r.kaspiAmount));
        if (Number(r.transferAmount) > 0)
            pts.push('банк:' + fmtShort(r.transferAmount));
        if (pts.length)
            payDetail = pts.join(' ');
    }
    const h = escapeHtml;
    const custName = '';
    if (r.customerId) {
        const cust = getCustomers().find(c => c.id === r.customerId;
        });
        if (cust)
            custName = cust.name || '';
    }
    const header = '<div class="receipt-center receipt-bold">' + h(storeName) + '</div>' + (bin ? '<div class="receipt-center">БИН/ИИН ' + h(bin) + '</div>' : '') + '<div class="receipt-center">КАССОВЫЙ ЧЕК</div>' + '<div class="receipt-row"><span>Чек \u2116</span><span>' + receiptId.slice(-6) + '</span></div>' + '<div class="receipt-row"><span>Дата</span><span>' + dateStr + '</span></div>' + '<div class="receipt-row"><span>Кассир</span><span>' + h(r.userName || '\u2014') + '</span></div>' + (custName ? '<div class="receipt-row"><span>Клиент</span><span>' + h(custName) + '</span></div>' : '') + '<div class="receipt-sep"></div>';
    const itemsHtml = '';
    r.items.forEach(it => {
        const name = it.productName || '\u2014';
        const qty = Number(it.quantity) || 0;
        const price = Number(it.unitPrice) || 0;
        const total = Number(it.total) || 0;
        itemsHtml += '<div class="receipt-item">' + '<div class="receipt-name">' + h(name) + '</div>' + '<div class="receipt-row"><span>' + qty + ' x ' + fmtShort(price) + '</span><span>' + fmtShort(total) + '</span></div>' + (it.productCode ? '<div style="font-size:11px">Код: ' + h(it.productCode) + '</div>' : '') + '</div>';
    });
    itemsHtml += '<div class="receipt-sep"></div>';
    const totalsHtml = '';
    const netTotal = r.total - (Number(r.discountAmount) || 0) - (Number(r.bonusSpend) || 0);
    totalsHtml += '<div class="receipt-row receipt-total"><span>ИТОГО</span><span>' + fmtShort(netTotal) + '</span></div>';
    if (Number(r.discountAmount) > 0)
        totalsHtml += '<div class="receipt-row"><span>Скидка</span><span>-' + fmtShort(r.discountAmount) + '</span></div>';
    if (Number(r.bonusSpend) > 0)
        totalsHtml += '<div class="receipt-row"><span>Оплата бонусами</span><span>-' + fmtShort(r.bonusSpend) + '</span></div>';
    totalsHtml += '<div class="receipt-sep"></div>';
    if (r.payment === 'cash')
        totalsHtml += '<div class="receipt-row"><span>Наличные</span><span>' + fmtShort(netTotal) + '</span></div>';
    else if (r.payment === 'kaspi')
        totalsHtml += '<div class="receipt-row"><span>Kaspi QR</span><span>' + fmtShort(netTotal) + '</span></div>';
    else if (r.payment === 'transfer')
        totalsHtml += '<div class="receipt-row"><span>Банк</span><span>' + fmtShort(netTotal) + '</span></div>';
    else if (r.payment === 'mixed') {
        if (Number(r.cashAmount) > 0)
            totalsHtml += '<div class="receipt-row"><span>Наличные</span><span>' + fmtShort(r.cashAmount) + '</span></div>';
        if (Number(r.kaspiAmount) > 0)
            totalsHtml += '<div class="receipt-row"><span>Kaspi QR</span><span>' + fmtShort(r.kaspiAmount) + '</span></div>';
        if (Number(r.transferAmount) > 0)
            totalsHtml += '<div class="receipt-row"><span>Банк</span><span>' + fmtShort(r.transferAmount) + '</span></div>';
    } else if (r.payment === 'debt')
        totalsHtml += '<div class="receipt-row"><span>В долг</span><span>' + fmtShort(netTotal) + '</span></div>';
    if (Number(r.earnedBonus) > 0)
        totalsHtml += '<div class="receipt-row"><span>Бонусы начислено</span><span>+' + fmtShort(r.earnedBonus) + '</span></div>';
    totalsHtml += '<div class="receipt-sep"></div>';
    const footer = '<div class="receipt-center receipt-bold">СПАСИБО ЗА ПОКУПКУ!</div>';
    document.getElementById('receipt-header').innerHTML = header;
    document.getElementById('receipt-items').innerHTML = itemsHtml;
    document.getElementById('receipt-totals').innerHTML = totalsHtml;
    document.getElementById('receipt-footer').innerHTML = footer;
    const returnBtn = document.getElementById('btn-receipt-return');
    if (returnBtn) {
        const returnable = r.items.some(it => Number(it.quantity) > 0;
        });
        returnBtn.style.display = returnable ? 'inline-flex' : 'none';
    }
    openModal('modal-receipt');
}

function migrateDeferredData() {
    const migrationKey = 'ap_deferred_migration_v1';
    if (localStorage.getItem(migrationKey))
        return;
    try {
        const deferred = getDeferred();
        const changed = false;
        const migrated = deferred.map(function (d) {
            if (d.items) return d;
            changed = true;
            return {
                id: d.id,
                items: [{
                        productId: d.productId,
                        productCode: d.productCode || '',
                        productName: d.productName || '',
                        quantity: d.quantity || 0,
                        unitPrice: d.unitPrice || 0,
                        total: d.total || (d.unitPrice || 0) * (d.quantity || 0)
                    }],
                customerName: d.customerName || '',
                customerPhone: d.customerPhone || '',
                total: d.total || (d.unitPrice || 0) * (d.quantity || 0),
                quantity: d.quantity || 0,
                cashierName: d.cashierName || '',
                status: d.status || 'pending',
                note: d.note || '',
                date: d.date || new Date().toISOString(),
                completedAt: d.completedAt || null
            };
        });
        if (changed) {
            setDeferred(migrated);
        }
        localStorage.setItem(migrationKey, '1');
    } catch (e) {
        console.warn('[Deferred migration] Error:', e);
    }
}

function getAuditLog() {
    const v = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('audit_log') : null;
    if (v !== null && v !== undefined) return Array.isArray(v) ? v : [];
    try {
        return JSON.parse(localStorage.getItem('sanaq_audit_log') || '[]');
    } catch (e) {
        return [];
    }
}

function setAuditLog(arr) {
    try {
        localStorage.setItem('sanaq_audit_log', JSON.stringify(arr));
    } catch (e) {
    }
    if (window.ApDb && window.ApDb.setAppData)
        window.ApDb.setAppData('audit_log', arr);
}

function addAuditLog(action, detail, icon) {
    const log = getAuditLog();
    log.unshift({
        id: uid(),
        action: action,
        detail: detail,
        icon: icon || '\uD83D\uDCDD',
        user: currentUser ? currentUser.name : '\u2014',
        userId: currentUser ? currentUser.id : null,
        time: new Date().toISOString()
    });
    if (log.length > 500)
        log = log.slice(0, 500);
    setAuditLog(log);
}

function openAuditLog() {
    const container = document.getElementById('audit-log-body');
    const log = getAuditLog();
    if (!log.length) {
        container.innerHTML = '<div class="empty">Журнал действий пуст</div>';
    } else {
        container.innerHTML = log.map(entry => '<div class="audit-item"><div class="audit-item-icon">' + (entry.icon || '\uD83D\uDCDD') + '</div><div class="audit-item-content"><div class="audit-item-action">' + esc(entry.action) + '</div><div class="audit-item-detail">' + esc(entry.detail || '') + ' \u2014 ' + esc(entry.user || '') + '</div><div class="audit-item-time">' + fmtDate(entry.time) + '</div></div></div>';
        }).join('');
    }
    openModal('modal-audit-log');
}

set('isSaleActive', isSaleActive);
set('togglePaymentSection', togglePaymentSection);
set('calcMixedRemainder', calcMixedRemainder);
set('addAuditLog', addAuditLog);
set('renderAuditSessionTable', renderAuditSessionTable);
export { PAY_LABELS, currentPayment, setCurrentPayment, getSales, setSales, migrateSalesRecords, focusSaleSearch, isSaleActive, saleStatusBadge, adminCancelSaleBtn, togglePaymentSection, renderSalesToday, buildSalePKOHTML, cancelSale, renderSalesHeatmap, renderMostExpensiveReceipt, updateSaleShiftBanner, badgePay, groupSalesIntoReceipts, completeDebtPayment, getWriteOffs, getAudits, getDeferred, setDeferred, onSaleSearch, clearSaleSelection, onSaleSearchKey, calcChange, calcMixedRemainder, updateSaleTotal, deferSale, restoreDeferredSale, deleteDeferred, payDeferred, cancelDeferredDoc, renderDeferred, openDeferredModal, searchDeferredProduct, selectDeferredProduct, calcDeferredTotal, saveDeferred, exportDeferredExcel, completeSale, cancelSaleConfirm, selectReturnReceipt, openReturnModalFromReceipt, exportSalesExcel, exportSalesDetailedExcel, submitWriteOff, startAuditSession, cancelAuditSession, renderAuditSessionTable, completeAuditSession, printReceipt, openReceipt, migrateDeferredData, getAuditLog, setAuditLog, addAuditLog, openAuditLog };
