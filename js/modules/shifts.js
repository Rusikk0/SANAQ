import { isAdmin, currentUser, renderCashiersPage, getOpenShiftForCashier } from './users.js';
import { getSales, isSaleActive, addAuditLog, updateSaleShiftBanner, groupSalesIntoReceipts, PAY_LABELS } from './sales.js';
import { getExpenses, isExpenseActive } from './expenses.js';
import { card, fmt, fmtDate, esc, tableHTML, getCurrentStoreName, downloadFile, todayStr } from './utils.js';
import { toast } from './notifications.js';
import { getCustomers } from './customers.js';
import { exportSectionToExcel } from './reports.js';
import { uid, goPage, openModal } from './ui.js';



function getShifts() {
    return window.ApDb ? window.ApDb.getShifts() : [];
}

function setShifts(arr) {
    if (window.ApDb)
        window.ApDb.setShifts(arr);
}

function canManageShift(shift) {
    if (!shift)
        return false;
    return isAdmin() || shift.cashierId === currentUser.id || (shift.cashierUsername || '').toLowerCase() === (currentUser.username || '').toLowerCase();
}

function renderShiftStats() {
    var shifts = getShifts();
    var sales = getSales().filter(isSaleActive);
    var expenses = getExpenses().filter(isExpenseActive);
    var expTotal = expenses.reduce(function (s, e) {
        return s + e.amount;
    }, 0);
    var shiftData = shifts.map(function (sh) {
        var shiftSales = sales.filter(function (s) {
            return s.shiftId === sh.id;
        });
        var rev = shiftSales.reduce(function (s, x) {
            return s + x.total;
        }, 0);
        var cost = shiftSales.reduce(function (s, x) {
            return s + (Number(x.purchasePrice) || 0) * (Number(x.quantity) || 0);
        }, 0);
        var cnt = shiftSales.length;
        return {
            id: sh.id,
            cashier: sh.cashierName || '\u2014',
            openedAt: sh.openedAt,
            closedAt: sh.closedAt,
            status: sh.status,
            count: cnt,
            revenue: rev,
            cogs: cost,
            profit: rev - cost
        };
    });
    var totalRev = shiftData.reduce(function (s, x) {
        return s + x.revenue;
    }, 0);
    var totalProfit = shiftData.reduce(function (s, x) {
        return s + x.profit;
    }, 0);
    var totalShifts = shiftData.length;
    var openShifts = shiftData.filter(function (s) {
        return s.status === 'open';
    }).length;
    document.getElementById('shifts-stats-cards').innerHTML = card('Всего смен', totalShifts, '') + card('Открытых смен', openShifts, 'ok') + card('Выручка за все смены', fmt(totalRev), 'ok') + card('Прибыль за все смены', fmt(totalProfit), totalProfit >= 0 ? 'ok' : 'err');
    shiftData.sort(function (a, b) {
        return (b.openedAt || '').localeCompare(a.openedAt || '');
    });
    var rows = shiftData.map(function (s) {
        return [
            s.cashier,
            fmtDate(s.openedAt),
            s.closedAt ? fmtDate(s.closedAt) : '<span class="badge badge-ok">Открыта</span>',
            s.count,
            fmt(s.revenue),
            fmt(s.cogs),
            '<span style="color:' + (s.profit >= 0 ? 'var(--ok)' : 'var(--err)') + ';font-weight:600">' + fmt(s.profit) + '</span>'
        ];
    });
    document.getElementById('shifts-stats-table').innerHTML = rows.length ? '<div class="table-wrap">' + tableHTML([
        'Кассир',
        'Открыта',
        'Закрыта',
        'Продаж',
        'Выручка',
        'Себестоимость',
        'Прибыль'
    ], rows) + '</div>' : '<div class="empty">Смен нет</div>';
    window._shiftStatsData = shiftData;
}

function closeShift(shiftId) {
    const shifts = getShifts();
    const idx = shifts.findIndex(function (s) {
        return s.id === shiftId;
    });
    if (idx < 0)
        return;
    const shift = shifts[idx];
    if (shift.status === 'closed') {
        toast('Эта смена уже закрыта и не может быть открыта снова', 'err');
        return;
    }
    shift.status = 'closed';
    shift.closedAt = new Date().toISOString();
    shift.closedBy = currentUser.name;
    shift.totals = calcShiftTotals(shiftId);
    shifts[idx] = shift;
    addAuditLog('Закрытие смены', 'Смена #' + shiftId.slice(-6) + ' кассира ' + shift.cashierName, '\uD83D\uDD12');
    setShifts(shifts);
    exportShiftToExcel(shift);
    toast('Смена закрыта. Файл Excel сохранён', 'ok');
    if (isAdmin())
        renderCashiersPage();
    else
        renderMyShiftPage();
    updateSaleShiftBanner();
}

function calcShiftTotals(shiftId) {
    const sales = getSales().filter(function (s) {
        return s.shiftId === shiftId && isSaleActive(s);
    });
    let cash = 0, kaspi = 0, transfer = 0, revenue = 0;
    sales.forEach(function (s) {
        if (s.payment === 'debt') {
        } else {
            revenue += s.total;
            if (s.payment === 'cash')
                cash += s.total;
            else if (s.payment === 'kaspi')
                kaspi += s.total;
            else if (s.payment === 'transfer')
                transfer += s.total;
            else if (s.payment === 'mixed') {
                cash += Number(s.cashAmount) || 0;
                kaspi += Number(s.kaspiAmount) || 0;
                transfer += Number(s.transferAmount) || 0;
            }
        }
    });
    return {
        cash: cash,
        kaspi: kaspi,
        transfer: transfer,
        revenue: revenue,
        salesCount: sales.length
    };
}

function renderShiftLists(opts) {
    opts = opts || {};
    const onlyMine = !!opts.onlyMine;
    const openEl = document.getElementById(opts.openListId || 'shifts-open-list');
    const closedEl = document.getElementById(opts.closedListId || 'shifts-closed-list');
    if (!openEl || !closedEl)
        return;
    let allShifts = getShifts();
    if (onlyMine) {
        var myId = currentUser.id;
        var myEmail = (currentUser.email || '').toLowerCase();
        var myUsername = (currentUser.username || '').toLowerCase();
        allShifts = allShifts.filter(function (s) {
            if (s.cashierId === myId)
                return true;
            var cu = (s.cashierUsername || '').toLowerCase();
            return cu === myEmail || cu === myUsername;
        });
    }
    const openList = allShifts.filter(function (s) {
        return s.status === 'open';
    });
    const closedList = allShifts.filter(function (s) {
        return s.status === 'closed';
    }).reverse();
    if (onlyMine) {
        openEl.innerHTML = openList.length ? tableHTML([
            'Открыта',
            'Кем открыта',
            ''
        ], openList.map(function (s) {
            return [
                fmtDate(s.openedAt),
                s.openedBy || '\u2014',
                canManageShift(s) ? '<button class="btn btn-sm btn-danger" onclick="closeShiftConfirm(\'' + s.id + '\')">\u23F9 Закрыть и Excel</button>' : '\u2014'
            ];
        })) : '<div class="empty">Смена не открыта</div>';
        closedEl.innerHTML = closedList.length ? tableHTML([
            'Открыта',
            'Закрыта',
            'Продаж',
            'Выручка',
            ''
        ], closedList.map(function (s) {
            const t = s.totals || calcShiftTotals(s.id);
            return [
                fmtDate(s.openedAt),
                fmtDate(s.closedAt),
                t.salesCount,
                fmt(t.revenue),
                '<button class="btn btn-sm btn-secondary" onclick="exportShiftById(\'' + s.id + '\')">\uD83D\uDCE5 Excel</button>'
            ];
        })) : '<div class="empty">Закрытых смен пока нет</div>';
    } else {
        openEl.innerHTML = openList.length ? tableHTML([
            'Кассир',
            'Открыта',
            'Кем открыта',
            ''
        ], openList.map(function (s) {
            return [
                s.cashierName,
                fmtDate(s.openedAt),
                s.openedBy || '\u2014',
                canManageShift(s) ? '<button class="btn btn-sm btn-danger" onclick="closeShiftConfirm(\'' + s.id + '\')">\u23F9 Закрыть и Excel</button>' : '\u2014'
            ];
        })) : '<div class="empty">Нет открытых смен</div>';
        closedEl.innerHTML = closedList.length ? tableHTML([
            'Кассир',
            'Открыта',
            'Закрыта',
            'Продаж',
            'Выручка',
            ''
        ], closedList.map(function (s) {
            const t = s.totals || calcShiftTotals(s.id);
            return [
                s.cashierName,
                fmtDate(s.openedAt),
                fmtDate(s.closedAt),
                t.salesCount,
                fmt(t.revenue),
                '<button class="btn btn-sm btn-secondary" onclick="exportShiftById(\'' + s.id + '\')">\uD83D\uDCE5 Excel</button>'
            ];
        })) : '<div class="empty">Закрытых смен пока нет</div>';
    }
}

function renderShifts() {
    renderShiftLists({
        onlyMine: false,
        openListId: 'shifts-open-list',
        closedListId: 'shifts-closed-list'
    });
}

function renderMyShiftPage() {
    const shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    const ctrl = document.getElementById('myshift-controls');
    if (shift) {
        const t = calcShiftTotals(shift.id);
        ctrl.innerHTML = '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px;justify-content:space-between">' + '<div>' + '<div style="font-size:18px;font-weight:600;color:var(--ok)">\u25CF Смена открыта</div>' + '<div style="font-size:14px;color:var(--muted);margin-top:6px">С ' + fmtDate(shift.openedAt) + ' \xB7 Продаж: ' + t.salesCount + ' \xB7 Выручка: ' + fmt(t.revenue) + '</div>' + '</div>' + '<button class="btn btn-danger btn-lg" onclick="closeShiftConfirm(\'' + shift.id + '\')">\u23F9 Закрыть смену и Excel</button>' + '</div>';
    } else {
        ctrl.innerHTML = '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px;justify-content:space-between">' + '<div>' + '<div style="font-size:18px;font-weight:600;color:var(--warn)">Смена закрыта</div>' + '<div style="font-size:14px;color:var(--muted);margin-top:6px">Откройте смену, чтобы оформлять продажи</div>' + '</div>' + '<button class="btn btn-success btn-lg" onclick="openMyShift()">\u25B6 Открыть мою смену</button>' + '</div>';
    }
    renderShiftLists({
        onlyMine: true,
        openListId: 'myshift-open-list',
        closedListId: 'myshift-closed-list'
    });
    updateSaleShiftBanner();
}

function exportShiftToExcel(shift) {
    if (!shift)
        return;
    const sales = getSales().filter(function (s) {
        return s.shiftId === shift.id && isSaleActive(s);
    });
    const t = shift.totals || calcShiftTotals(shift.id);
    const receipts = groupSalesIntoReceipts(sales);
    const storeName = getCurrentStoreName ? getCurrentStoreName() : 'Магазин';
    const openedAt = new Date(shift.openedAt);
    const closedAt = shift.closedAt ? new Date(shift.closedAt) : null;
    let cogs = 0;
    sales.forEach(function (s) {
        cogs += (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
    });
    const grossProfit = (Number(t.revenue) || 0) - cogs;
    const expEnd = closedAt || new Date();
    const expTotal = getExpenses().filter(function (e) {
        if (!isExpenseActive(e))
            return false;
        if (!e.date)
            return false;
        const d = new Date(e.date);
        return d >= openedAt && d <= expEnd;
    }).reduce(function (sum, e) {
        return sum + (Number(e.amount) || 0);
    }, 0);
    const netProfit = grossProfit - expTotal;
    let html = '<html><head><meta charset="UTF-8"></head><body>';
    html += '<h2>Отчёт по смене \u2014 ' + esc(storeName) + '</h2>';
    html += '<table border="1" cellpadding="5" style="border-collapse:collapse;font-family:Arial">';
    html += '<tr><td><b>Магазин</b></td><td>' + esc(storeName) + '</td></tr>';
    html += '<tr><td><b>Кассир</b></td><td>' + esc(shift.cashierName) + '</td></tr>';
    html += '<tr><td><b>Логин</b></td><td>' + esc(shift.cashierUsername) + '</td></tr>';
    html += '<tr><td><b>Открыта</b></td><td>' + esc(fmtDate(shift.openedAt)) + '</td></tr>';
    html += '<tr><td><b>Закрыта</b></td><td>' + esc(shift.closedAt ? fmtDate(shift.closedAt) : '\u2014') + '</td></tr>';
    html += '<tr><td><b>Закрыл</b></td><td>' + esc(shift.closedBy || '\u2014') + '</td></tr>';
    html += '<tr><td><b>Строк продаж</b></td><td>' + t.salesCount + '</td></tr>';
    html += '<tr><td><b>Чеков</b></td><td>' + receipts.length + '</td></tr>';
    html += '<tr><td><b>Наличные</b></td><td>' + t.cash + '</td></tr>';
    html += '<tr><td><b>Kaspi QR</b></td><td>' + t.kaspi + '</td></tr>';
    html += '<tr><td><b>Банк</b></td><td>' + t.transfer + '</td></tr>';
    html += '<tr><td><b>Выручка</b></td><td>' + t.revenue + '</td></tr>';
    html += '<tr><td><b>Себестоимость</b></td><td>' + cogs + '</td></tr>';
    html += '<tr><td><b>Валовая прибыль</b></td><td>' + grossProfit + '</td></tr>';
    html += '<tr><td><b>Расходы (в смене)</b></td><td>' + expTotal + '</td></tr>';
    html += '<tr><td><b>Чистая прибыль</b></td><td>' + netProfit + '</td></tr>';
    html += '</table><br>';
    html += '<h3>Чеки за смену</h3>';
    html += '<table border="1" cellpadding="5" style="border-collapse:collapse">';
    html += '<tr style="background:#305496;color:#fff"><th>Чек</th><th>Дата</th><th>Товаров (шт)</th><th>Сумма</th><th>Оплата</th><th>Клиент</th><th>Телефон</th></tr>';
    receipts.forEach(function (r) {
        const cust = r.customerId ? getCustomers().find(function (c) {
            return c.id === r.customerId;
        }) : null;
        const itemsQty = r.items.reduce(function (sum, it) {
            return sum + (Number(it.quantity) || 0);
        }, 0);
        html += '<tr>' + '<td>' + esc(r.id.slice(-6)) + '</td>' + '<td>' + esc(fmtDate(r.date)) + '</td>' + '<td>' + itemsQty + '</td>' + '<td>' + (Number(r.total) || 0) + '</td>' + '<td>' + esc(PAY_LABELS[r.payment] || r.payment || '') + '</td>' + '<td>' + esc(cust ? cust.name : '\u2014') + '</td>' + '<td>' + esc(cust ? cust.phone : '\u2014') + '</td>' + '</tr>';
    });
    if (!receipts.length)
        html += '<tr><td colspan="7">Нет чеков</td></tr>';
    html += '</table><br>';
    html += '<h3>Продажи (строки) за смену</h3>';
    html += '<table border="1" cellpadding="5" style="border-collapse:collapse">';
    html += '<tr style="background:#4472C4;color:#fff"><th>Чек</th><th>Код</th><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Закуп</th><th>Сумма</th><th>Прибыль</th><th>Оплата</th><th>Дата</th></tr>';
    sales.forEach(function (s) {
        const lineCogs = (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
        const lineProfit = (Number(s.total) || 0) - lineCogs;
        html += '<tr>' + '<td>' + esc((s.receiptId || s.id).slice(-6)) + '</td>' + '<td>' + esc(s.productCode) + '</td>' + '<td>' + esc(s.productName) + '</td>' + '<td>' + (Number(s.quantity) || 0) + '</td>' + '<td>' + (Number(s.unitPrice) || 0) + '</td>' + '<td>' + (Number(s.purchasePrice) || 0) + '</td>' + '<td>' + (Number(s.total) || 0) + '</td>' + '<td>' + lineProfit + '</td>' + '<td>' + esc(PAY_LABELS[s.payment] || s.payment) + '</td>' + '<td>' + esc(fmtDate(s.date)) + '</td>' + '</tr>';
    });
    if (!sales.length)
        html += '<tr><td colspan="10">Нет продаж</td></tr>';
    html += '</table></body></html>';
    const safeStore = String(storeName || 'store').replace(/[\\\/:*?"<>|]/g, '').replace(/\s+/g, '_');
    const fname = 'Смена_' + safeStore + '_' + (shift.cashierUsername || 'cashier') + '_' + (shift.closedAt || shift.openedAt).slice(0, 10).replace(/-/g, '') + '.xls';
    downloadFile(fname, html, 'application/vnd.ms-excel');
}




function exportShiftsExcel() {
    exportSectionToExcel('shifts', window._shiftStatsData || [], 'SANAQ_Смены_' + todayStr() + '.xlsx');
}

function openMyShift() {
    try {
        const cashierKey = currentUser.email || currentUser.username || currentUser.id;
        if (getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(cashierKey)) {
            toast('Ваша смена уже открыта', 'err');
            return;
        }
        const shifts = getShifts();
        var newId = uid();
        shifts.push({
            id: newId,
            cashierId: currentUser.id,
            cashierUsername: currentUser.email || currentUser.username || '',
            cashierName: currentUser.name,
            openedAt: new Date().toISOString(),
            closedAt: null,
            status: 'open',
            openedBy: currentUser.name
        });
        setShifts(shifts);
        var verify = getOpenShiftForCashier(currentUser.id);
        if (!verify) {
            console.error('[Shift] Shift not found in cache after setShifts!');
            var retry = getShifts();
            retry.push({
                id: newId,
                cashierId: currentUser.id,
                cashierUsername: currentUser.email || currentUser.username || '',
                cashierName: currentUser.name,
                openedAt: new Date().toISOString(),
                closedAt: null,
                status: 'open',
                openedBy: currentUser.name
            });
            setShifts(retry);
        }
        toast('Смена открыта: ' + currentUser.name, 'ok');
        renderMyShiftPage();
        updateSaleShiftBanner();
    } catch (e) {
        console.error('[Shift] openMyShift error:', e);
        toast('Ошибка открытия смены: ' + (e.message || e), 'err');
    }
}

function openShift() {
    if (!currentUser) {
        toast('Пользователь не авторизован', 'err');
        return;
    }
    const cashierKey = currentUser.email || currentUser.username || currentUser.id;
    if (getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(cashierKey)) {
        toast('Ваша смена уже открыта', 'err');
        return;
    }
    const shifts = getShifts();
    var newShift = {
        id: uid(),
        cashierId: currentUser.id,
        cashierUsername: currentUser.email || currentUser.username || '',
        cashierName: currentUser.name,
        openedAt: new Date().toISOString(),
        closedAt: null,
        status: 'open',
        openedBy: currentUser.name
    };
    shifts.push(newShift);
    setShifts(shifts);
    addAuditLog('Открытие смены', 'Смена #' + newShift.id.slice(-6) + ' кассира ' + newShift.cashierName, '\uD83D\uDD13');
    toast('Смена открыта: ' + currentUser.name, 'ok');
    if (isAdmin())
        renderCashiersPage();
    else {
        renderMyShiftPage();
        goPage('myshift');
    }
    updateSaleShiftBanner();
    var _shiftId = newShift.id;
    setTimeout(function () {
        var stillHere = getOpenShiftForCashier(currentUser.id);
        if (!stillHere || stillHere.id !== _shiftId) {
            console.error('[Shift] LOST after 2s! Expected:', _shiftId, 'Found:', stillHere ? stillHere.id : null);
            console.error('[Shift] Cache shifts:', JSON.stringify(getShifts().map(function (s) {
                return {
                    id: s.id,
                    status: s.status
                };
            })));
        } else {
            console.log('[Shift] OK after 2s:', _shiftId);
        }
    }, 2000);
    setTimeout(function () {
        var stillHere = getOpenShiftForCashier(currentUser.id);
        if (!stillHere || stillHere.id !== _shiftId) {
            console.error('[Shift] LOST after 10s! Expected:', _shiftId, 'Found:', stillHere ? stillHere.id : null);
        } else {
            console.log('[Shift] OK after 10s:', _shiftId);
        }
    }, 10000);
}

function closeShiftConfirm(shiftId) {
    const shift = getShifts().find(function (s) {
        return s.id === shiftId;
    });
    if (!shift || shift.status !== 'open') {
        toast('Смена уже закрыта', 'err');
        return;
    }
    if (!canManageShift(shift)) {
        toast('Нет прав закрыть эту смену', 'err');
        return;
    }
    document.getElementById('confirm-title').textContent = 'Закрыть смену?';
    document.getElementById('confirm-msg').textContent = 'Смена кассира \xAB' + shift.cashierName + '\xBB будет закрыта навсегда. ' + 'Повторно открыть её нельзя. Отчёт будет сохранён в файл Excel.';
    document.getElementById('confirm-ok').textContent = 'Закрыть и сохранить Excel';
    document.getElementById('confirm-ok').className = 'btn btn-danger';
    confirmCallback = function () {
        document.getElementById('confirm-ok').textContent = 'Удалить';
        closeShift(shiftId);
    };
    openModal('modal-confirm');
}

function exportShiftById(shiftId) {
    const shift = getShifts().find(function (s) {
        return s.id === shiftId;
    });
    if (shift)
        exportShiftToExcel(shift);
}



export { getShifts, setShifts, canManageShift, renderShiftStats, closeShift, calcShiftTotals, renderShiftLists, renderShifts, renderMyShiftPage, exportShiftToExcel, exportShiftsExcel, openMyShift, openShift, closeShiftConfirm, exportShiftById };
