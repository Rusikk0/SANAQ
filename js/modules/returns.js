import { currentStoreId } from './store.js';
import { getSales, addAuditLog, isSaleActive, groupSalesIntoReceipts, setSales, renderSalesToday } from './sales.js';
import { getOpenShiftForCashier, currentUser, isAdmin } from './users.js';
import { toast } from './notifications.js';
import { esc, fmtDate, fmt, confirmAction, closeModal } from './utils.js';
import { openModal, uid, renderPosSideHistory, renderDashboard } from './ui.js';
import { getProducts, setProducts, renderProducts, fillSaleProducts } from './products.js';
import { getExpenses, setExpenses, renderExpenses } from './expenses.js';
import { renderStatistics } from './statistics.js';

function getReturnLimit() {
    const v = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('return_limit') : null;
    if (v !== null && v !== undefined) return parseInt(v) || 3;
    return parseInt(localStorage.getItem('sanaq_return_limit_' + (currentStoreId || '')) || '3');
}

function getShiftReturnCount(shiftId) {
    const returns = getSales().filter(s => s.status === 'returned' && s.shiftId === shiftId;
    });
    return returns.length;
}

function canMakeReturn() {
    const shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    if (!shift) {
        toast('Смена не открыта', 'err');
        return false;
    }
    const limit = getReturnLimit();
    if (limit <= 0) return true;
    const count = getShiftReturnCount(shift.id);
    if (count >= limit) {
        toast('Превышен лимит возвратов за смену (' + limit + ')', 'err');
        addAuditLog('Лимит возвратов превышен', 'Кассир: ' + currentUser.name + ', смена: ' + shift.id.slice(-6), '\u26A0️');
        return false;
    }
    return true;
}

function openReturnSelector() {
    if (!isAdmin()) {
        toast('Только для администратора', 'err');
        return;
    }
    const all = getSales().filter(isSaleActive);
    const receipts = groupSalesIntoReceipts(all).slice(0, 50);
    if (!receipts.length) {
        toast('Нет доступных продаж для возврата', 'err');
        return;
    }
    const body = document.getElementById('return-selector-body');
    if (!body)
        return;
    body.innerHTML = receipts.map(function (r) {
        const itemsSummary = r.items.map(it => esc(it.productName) + ' \xD7 ' + it.quantity;
        }).join(', ');
        return '<div class="return-receipt-row" onclick="selectReturnReceipt(\'' + r.id + '\')">' + '<div style="font-weight:600">Чек \u2116 ' + esc(r.id.slice(-6)) + '</div>' + '<div style="font-size:12px;color:var(--text-muted)">' + fmtDate(r.date) + ' | ' + esc(r.userName || '\u2014') + ' | ' + fmt(r.total) + '</div>' + '<div style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + itemsSummary.slice(0, 120) + '</div>' + '</div>';
    }).join('');
    openModal('modal-return-selector');
}

function calcReturnTotal() {
    const inputs = document.querySelectorAll('#return-items-body input[type=number]');
    const total = 0;
    inputs.forEach(inp => {
        const qty = Number(inp.value) || 0;
        const price = Number(inp.dataset.price) || 0;
        const max = Number(inp.dataset.max) || 0;
        const amt = Math.min(qty * price, max);
        inp.closest('tr').querySelector('td:last-child').textContent = amt >= 0 ? fmt(amt) : '0 \u20B8';
        total += amt;
    });
    document.getElementById('return-total-refund').textContent = fmt(total);
}

function submitReturn() {
    if (!canMakeReturn())
        return;
    if (!isAdmin()) {
        toast('Только для администратора', 'err');
        return;
    }
    const receiptId = document.getElementById('return-sale-id').value;
    if (!receiptId)
        return;
    const inputs = document.querySelectorAll('#return-items-body input[type=number]');
    const items = [];
    const totalRefund = 0;
    const hasAny = false;
    const allSales = getSales();
    const receiptSales = allSales.filter(s => s.receiptId === receiptId && isSaleActive(s);
    });
    inputs.forEach(inp => {
        const returnQty = Number(inp.value) || 0;
        if (returnQty <= 0)
            return;
        hasAny = true;
        const tr = inp.closest('tr');
        if (!tr)
            return;
        const idx = Array.prototype.indexOf.call(tr.parentNode.children, tr);
        const sale = receiptSales[idx];
        if (!sale) {
            toast('Ошибка: продажа не найдена для строки ' + (idx + 1), 'err');
            return;
        }
        if (sale.status === 'returned') {
            toast('Товар уже возвращён: ' + sale.productName, 'err');
            return;
        }
        const price = Number(inp.dataset.price) || 0;
        const refundAmount = returnQty * price;
        totalRefund += refundAmount;
        items.push({
            sale: sale,
            returnQty: returnQty,
            refundAmount: refundAmount
        });
    });
    if (!hasAny) {
        toast('Укажите количество к возврату', 'err');
        return;
    }
    if (totalRefund <= 0) {
        toast('Сумма возврата должна быть больше 0', 'err');
        return;
    }
    confirmAction('Подтверждение возврата', 'Возврат товаров на сумму ' + fmt(totalRefund) + '. Товар вернётся на склад.', function () {
        const returnedItems = [];
        items.forEach(it => {
            const sale = it.sale;
            const origQty = Number(sale.quantity) || 0;
            const returnQty = it.returnQty;
            if (sale.productId) {
                const products = getProducts();
                const product = products.find(p => p.id === sale.productId;
                });
                if (product) {
                    product.quantity += returnQty;
                    setProducts(products);
                }
            }
            if (returnQty >= origQty) {
                const idx = allSales.findIndex(function (s) {
                    return s.id === sale.id;
                });
                if (idx >= 0) {
                    allSales[idx] = Object.assign({}, allSales[idx], {
                        status: 'returned',
                        returnedAt: new Date().toISOString(),
                        returnedBy: currentUser.name
                    });
                }
            } else {
                allSales.push(Object.assign({}, sale, {
                    id: uid(),
                    quantity: returnQty,
                    total: it.refundAmount,
                    status: 'returned',
                    returnedAt: new Date().toISOString(),
                    returnedBy: currentUser.name
                }));
                const sidx = allSales.findIndex(function (s) {
                    return s.id === sale.id;
                });
                if (sidx >= 0) {
                    allSales[sidx] = Object.assign({}, allSales[sidx], {
                        quantity: origQty - returnQty,
                        total: (Number(sale.total) || 0) - it.refundAmount
                    });
                }
            }
            returnedItems.push({
                saleId: sale.id,
                productId: sale.productId,
                productName: sale.productName,
                quantity: returnQty,
                refundAmount: it.refundAmount
            });
        });
        setSales(allSales);
        const expenses = getExpenses();
        expenses.push({
            id: uid(),
            category: 'Возврат',
            amount: totalRefund,
            note: 'Возврат по чеку \u2116 ' + receiptId.slice(-6),
            userName: currentUser.name,
            date: new Date().toISOString(),
            status: 'active'
        });
        setExpenses(expenses);
        toast('Возврат оформлен на сумму ' + fmt(totalRefund), 'ok');
        closeModal('modal-return');
        closeModal('modal-receipt');
        renderSalesToday();
        renderPosSideHistory();
        renderDashboard();
        renderProducts();
        fillSaleProducts();
        renderExpenses();
        if (document.getElementById('page-statistics').classList.contains('active'))
            renderStatistics();
    });
}

export { getReturnLimit, getShiftReturnCount, canMakeReturn, openReturnSelector, calcReturnTotal, submitReturn };
