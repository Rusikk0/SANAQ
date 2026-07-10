import { isExpenseActive, getExpenses } from './expenses.js';
import { getSales, isSaleActive, groupSalesIntoReceipts, badgePay, saleStatusBadge } from './sales.js';
import { isToday, card, fmt, esc, tableHTML, fmtDate } from './utils.js';
import { currentUser, renderCashierStats, isAdmin } from './users.js';
import { renderProductAnalysis, renderUnsoldProducts } from './products.js';
import { toast } from './notifications.js';
import { renderShiftStats } from './shifts.js';
import { renderAnalytics } from './ui.js';

const _importState = {
    section: null,
    rawData: null,
    rows: null
};

function setImportState(value) {
    _importState = value;
}

function expenseStatusBadge(e) {
    return isExpenseActive(e) ? '<span class="badge badge-ok">Активен</span>' : '<span class="badge badge-danger">Отменён</span>';
}

function getStats() {
    const sales = getSales().filter(s => isToday(s.date) && isSaleActive(s);
    });
    const expenses = getExpenses().filter(e => isToday(e.date) && isExpenseActive(e);
    });
    let cash = 0, kaspi = 0, transfer = 0, revenue = 0, expTotal = 0, cogs = 0;
    sales.forEach(s => {
        revenue += s.total;
        cogs += (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
        if (s.payment === 'debt') {
        } else if (s.payment === 'cash')
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
    });
    expenses.forEach(e => {
        expTotal += e.amount;
    });
    return {
        cash,
        kaspi,
        transfer,
        revenue,
        expTotal,
        cogs,
        profit: revenue - expTotal - cogs,
        salesCount: sales.length
    };
}

const _posBrowserState = { cat: '' };

const _posCatModalState = {
    mode: 'categories',
    catId: '',
    catName: ''
};

const _statsPeriod = 'today';

function renderStatistics() {
    const period = _statsPeriod || 'today';
    const now = new Date();
    const periodStart = new Date(0);
    if (period === 'today') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        periodStart = d;
    } else if (period === 'month') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const sales = getSales().filter(s => isSaleActive(s) && new Date(s.date) >= periodStart;
    });
    const expenses = getExpenses().filter(e => isExpenseActive(e) && new Date(e.date) >= periodStart;
    });
    let cash = 0, kaspi = 0, transfer = 0, revenue = 0, cogs = 0, itemsCount = 0;
    sales.forEach(s => {
        revenue += s.total;
        cogs += (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
        itemsCount += Number(s.quantity) || 0;
        if (s.payment === 'debt') {
        } else if (s.payment === 'cash')
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
    });
    const expTotal = expenses.reduce(s, e => s + e.amount;
    }, 0);
    const profit = revenue - expTotal - cogs;
    const receipts = groupSalesIntoReceipts(sales);
    const salesCount = receipts.length;
    const avgCheck = salesCount ? revenue / salesCount : 0;
    document.getElementById('stats-cards').innerHTML = card('Кол-во продаж', salesCount, '') + card('Выручка', fmt(revenue), 'ok') + card('Прибыль', fmt(profit), profit >= 0 ? 'ok' : 'err') + card('Средний чек', fmt(avgCheck), '') + card('Продано товаров', itemsCount, '') + card('Kaspi QR', fmt(kaspi), 'kaspi') + card('Наличные', fmt(cash), 'cash') + card('Банк', fmt(transfer), 'bank') + card('Себестоимость', fmt(cogs), '') + card('Всего расходов', fmt(expTotal), 'warn');
    const productSales = {};
    const cashierSales = {};
    const hourlySales = {};
    sales.forEach(s => {
        const pName = s.productName || '\u2014';
        productSales[pName] = (productSales[pName] || 0) + (Number(s.quantity) || 0);
        const cName = s.userName || currentUser.name || '\u2014';
        cashierSales[cName] = (cashierSales[cName] || 0) + 1;
        const hour = s.date ? new Date(s.date).getHours() : 0;
        hourlySales[hour] = (hourlySales[hour] || 0) + (Number(s.total) || 0);
    });
    const topProduct = Object.keys(productSales).sort(a, b => productSales[b] - productSales[a];
    })[0] || null;
    const topCashier = Object.keys(cashierSales).sort(a, b => cashierSales[b] - cashierSales[a];
    })[0] || null;
    const peakHour = Object.keys(hourlySales).sort(a, b => hourlySales[b] - hourlySales[a];
    })[0] || null;
    const totalPayments = cash + kaspi + transfer;
    const cashPct = totalPayments > 0 ? Math.round(cash / totalPayments * 100) : 0;
    const kaspiPct = totalPayments > 0 ? Math.round(kaspi / totalPayments * 100) : 0;
    const transferPct = totalPayments > 0 ? Math.round(transfer / totalPayments * 100) : 0;
    const analysisHTML = '';
    analysisHTML += '<div class="card"><div class="card-label">\uD83C\uDFC6 Товар-лидер</div><div class="card-value" style="font-size:16px">' + esc(topProduct || '\u2014') + '</div>' + (topProduct ? '<div style="font-size:12px;color:var(--text-muted)">Продано: ' + productSales[topProduct] + ' шт</div>' : '') + '</div>';
    analysisHTML += '<div class="card"><div class="card-label">\uD83D\uDC64 Лучший кассир</div><div class="card-value" style="font-size:16px">' + esc(topCashier || '\u2014') + '</div>' + (topCashier ? '<div style="font-size:12px;color:var(--text-muted)">Продаж: ' + cashierSales[topCashier] + '</div>' : '') + '</div>';
    analysisHTML += '<div class="card"><div class="card-label">\u23F0 Пиковый час</div><div class="card-value" style="font-size:16px">' + (peakHour !== null ? peakHour + ':00' : '\u2014') + '</div><div style="font-size:12px;color:var(--text-muted)">' + (peakHour !== null ? 'Выручка: ' + fmt(Math.round(hourlySales[peakHour])) + ' \u20B8' : '') + '</div></div>';
    analysisHTML += '<div class="card" style="flex:1"><div class="card-label">\uD83D\uDCCA Способы оплаты</div><div style="display:flex;gap:4px;margin-top:6px;height:8px;border-radius:4px;overflow:hidden;background:var(--border)">' + (cashPct > 0 ? '<div style="flex:' + cashPct + ';background:#22c55e;min-width:4px" title="Наличные ' + cashPct + '%"></div>' : '') + (kaspiPct > 0 ? '<div style="flex:' + kaspiPct + ';background:#e11d48;min-width:4px" title="Kaspi QR ' + kaspiPct + '%"></div>' : '') + (transferPct > 0 ? '<div style="flex:' + transferPct + ';background:#3b82f6;min-width:4px" title="Банк ' + transferPct + '%"></div>' : '') + '</div><div style="display:flex;gap:12px;margin-top:4px;font-size:11px;color:var(--text-muted)">' + (cashPct > 0 ? '<span>\uD83D\uDCB5 ' + cashPct + '%</span>' : '') + (kaspiPct > 0 ? '<span>\uD83D\uDCF1 ' + kaspiPct + '%</span>' : '') + (transferPct > 0 ? '<span>\uD83C\uDFE6 ' + transferPct + '%</span>' : '') + '</div></div>';
    document.getElementById('stats-analysis').innerHTML = analysisHTML;
    const statSaleCols = [
        'Чек',
        'Товары',
        'Сумма',
        'Оплата',
        'Статус',
        'Кассир',
        'Время',
        ''
    ];
    document.getElementById('stats-sales-table').innerHTML = receipts.length ? '<div class="table-wrap">' + tableHTML(statSaleCols, receipts.map(function (r) {
        const qty = r.items.reduce(sum, it => sum + (Number(it.quantity) || 0);
        }, 0);
        const row = [
            '<span class="code-tag">\u2116 ' + r.id.slice(-6) + '</span>',
            qty + ' шт.',
            fmt(r.total),
            badgePay(r.payment, r.items[0]),
            saleStatusBadge(r.items[0]),
            r.userName || '\u2014',
            fmtDate(r.date),
            '<button class="btn btn-sm btn-secondary" onclick="openReceipt(\'' + r.id + '\')">Открыть</button>'
        ];
        return row;
    })) + '</div>' : '<div class="empty">Продаж нет</div>';
    const catMap = {};
    expenses.filter(isExpenseActive).forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    const catRows = Object.keys(catMap).map(k => [
            k,
            '<span style="color:var(--err);font-weight:600">-' + fmt(catMap[k]) + '</span>'
        ];
    });
    document.getElementById('stats-expenses-table').innerHTML = catRows.length ? '<div class="table-wrap">' + tableHTML([
        'Категория',
        'Сумма'
    ], catRows) + '</div>' : '<div class="empty">Расходов нет</div>';
    renderStatCharts(sales, expenses);
    renderProductAnalysis();
}

const _statCharts = {};

function renderStatCharts(sales, expenses) {
    Object.keys(_statCharts).forEach(k => {
        if (_statCharts[k]) {
            _statCharts[k].destroy();
            delete _statCharts[k];
        }
    });
    if (typeof Chart === 'undefined')
        return;
    const dayMap = {};
    const now = new Date();
    for (var i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = {
            revenue: 0,
            cost: 0
        };
    }
    sales.forEach(s => {
        const sk = (s.date || '').slice(0, 10);
        if (dayMap[sk]) {
            dayMap[sk].revenue += s.total;
            dayMap[sk].cost += (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
        }
    });
    const labels = Object.keys(dayMap);
    const revData = labels.map(k => dayMap[k].revenue;
    });
    const costData = labels.map(k => dayMap[k].cost;
    });
    const ctx1 = document.getElementById('chart-sales');
    if (ctx1) {
        _statCharts.sales = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: labels.map(l => l.slice(5);
                }),
                datasets: [
                    {
                        label: 'Выручка',
                        data: revData,
                        backgroundColor: 'rgba(34,197,94,0.7)',
                        borderColor: 'rgb(34,197,94)',
                        borderWidth: 1
                    },
                    {
                        label: 'Себестоимость',
                        data: costData,
                        backgroundColor: 'rgba(239,68,68,0.7)',
                        borderColor: 'rgb(239,68,68)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (v) {
                                return v.toLocaleString('ru-RU');
                            }
                        }
                    }
                }
            }
        });
    }
    const pCash = 0, pKaspi = 0, pTransfer = 0, pDebt = 0;
    sales.forEach(s => {
        if (s.payment === 'cash')
            pCash += s.total;
        else if (s.payment === 'kaspi')
            pKaspi += s.total;
        else if (s.payment === 'transfer')
            pTransfer += s.total;
        else if (s.payment === 'debt')
            pDebt += s.total;
        else if (s.payment === 'mixed') {
            pCash += Number(s.cashAmount) || 0;
            pKaspi += Number(s.kaspiAmount) || 0;
            pTransfer += Number(s.transferAmount) || 0;
        }
    });
    const ctx2 = document.getElementById('chart-payments');
    if (ctx2) {
        _statCharts.payments = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: [
                    'Наличные',
                    'Kaspi QR',
                    'Банк',
                    'В долг'
                ],
                datasets: [{
                        data: [
                            pCash,
                            pKaspi,
                            pTransfer,
                            pDebt
                        ],
                        backgroundColor: [
                            '#22c55e',
                            '#e11d48',
                            '#3b82f6',
                            '#f59e0b'
                        ]
                    }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                return ctx.label + ': ' + ctx.parsed.toLocaleString('ru-RU') + ' \u20B8';
                            }
                        }
                    }
                }
            }
        });
    }
    const catMap = {};
    expenses.filter(isExpenseActive).forEach(e => {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    const catLabels = Object.keys(catMap);
    const catValues = catLabels.map(k => catMap[k];
    });
    const colors = [
        '#ef4444',
        '#f97316',
        '#eab308',
        '#22c55e',
        '#06b6d4',
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#78716c'
    ];
    const ctx3 = document.getElementById('chart-expenses');
    if (ctx3 && catLabels.length) {
        _statCharts.expenses = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: catLabels,
                datasets: [{
                        data: catValues,
                        backgroundColor: colors.slice(0, catLabels.length)
                    }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                return ctx.label + ': ' + ctx.parsed.toLocaleString('ru-RU') + ' \u20B8';
                            }
                        }
                    }
                }
            }
        });
    }
}

const _statsSubTab = 'unsold';

function exportToExcel(headers, rows, filename) {
    if (typeof XLSX === 'undefined') {
        toast('Excel библиотека не загружена', 'err');
        return;
    }
    const data = [headers].concat(rows);
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = headers.map(function (h, i) {
        const maxLen = h.length;
        rows.forEach(r => {
            if (r[i] && String(r[i]).length > maxLen)
                maxLen = String(r[i]).length;
        });
        return { wch: Math.min(40, Math.max(10, maxLen + 2)) };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Данные');
    XLSX.writeFile(wb, (filename || 'export') + '.xlsx');
    toast('Excel файл скачан', 'ok');
}

function exportAoAToExcel(rows, filename, sheetName, widths) {
    if (typeof XLSX === 'undefined') {
        toast('Excel библиотека не загружена', 'err');
        return;
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    if (widths) {
        ws['!cols'] = widths.map(w => { wch: w };
        });
    } else {
        const maxCols = rows.reduce(m, r => Math.max(m, r.length);
        }, 0);
        ws['!cols'] = Array.from({ length: maxCols }, function (_, i) {
            const maxLen = 10;
            rows.forEach(r => {
                const v = r[i];
                if (v !== null && v !== undefined && String(v).length > maxLen)
                    maxLen = String(v).length;
            });
            return { wch: Math.min(48, maxLen + 2) };
        });
    }
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Данные');
    XLSX.writeFile(wb, (filename || 'export') + '.xlsx');
    toast('Excel файл скачан', 'ok');
}

function switchStatsPeriod(period) {
    _statsPeriod = period;
    document.querySelectorAll('.period-tabs .tab').forEach(t => {
        t.classList.toggle('active', t.dataset.speriod === period);
    });
    renderStatistics();
}

function switchStatsTab(tab) {
    document.querySelectorAll('#stats-tabs .tab').forEach(t => {
        t.classList.toggle('active', t.dataset.stab === tab);
    });
    document.getElementById('stab-general').classList.toggle('hidden', tab !== 'general');
    document.getElementById('stab-shifts').classList.toggle('hidden', tab !== 'shifts');
    document.getElementById('stab-cashiers').classList.toggle('hidden', tab !== 'cashiers');
    if (tab === 'shifts')
        renderShiftStats();
    if (tab === 'cashiers')
        renderCashierStats();
}

function switchStatsSubTab(tab) {
    _statsSubTab = tab;
    document.querySelectorAll('[data-stab2]').forEach(b => {
        b.classList.toggle('active', b.dataset.stab2 === tab);
    });
    document.querySelectorAll('.stab-sub').forEach(s => {
        s.style.display = 'none';
    });
    const el = document.getElementById('stab2-' + tab);
    if (el)
        el.style.display = 'block';
    if (tab === 'unsold')
        renderUnsoldProducts(30);
    if (tab === 'analytics')
        renderAnalytics();
}

async function exportStoreBackup() {
    if (!isAdmin()) {
        toast('Только администратор', 'err');
        return;
    }
    try {
        await window.ApBackup.exportBackup();
    } catch (e) {
        toast(e.message || String(e), 'err');
    }
}

export { _importState, setImportState, expenseStatusBadge, getStats, _posBrowserState, _posCatModalState, _statsPeriod, renderStatistics, _statCharts, renderStatCharts, _statsSubTab, exportToExcel, exportAoAToExcel, switchStatsPeriod, switchStatsTab, switchStatsSubTab, exportStoreBackup };
