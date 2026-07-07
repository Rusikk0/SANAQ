import { currentStoreId } from './store.js';
import { getSales, addAuditLog, isSaleActive, groupSalesIntoReceipts, setSales, renderSalesToday } from './sales.js';
import { getOpenShiftForCashier, currentUser, isAdmin } from './users.js';
import { toast } from './notifications.js';
import { esc, fmtDate, fmt, confirmAction, closeModal } from './utils.js';
import { openModal, uid, renderPosSideHistory, renderDashboard } from './ui.js';
import { getProducts, setProducts, renderProducts, fillSaleProducts } from './products.js';
import { getExpenses, setExpenses, renderExpenses } from './expenses.js';
import { renderStatistics } from './statistics.js';
import { getCustomers, setCustomers } from './customers.js';



function getReturnLimit() {
    var v = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('return_limit') : null;
    if (v !== null && v !== undefined)
        return parseInt(v) || 3;
    return parseInt(localStorage.getItem('sanaq_return_limit_' + (currentStoreId || '')) || '3');
}

function getShiftReturnCount(shiftId) {
    var returns = getSales().filter(function (s) {
        return s.status === 'returned' && s.shiftId === shiftId;
    });
    return returns.length;
}

function canMakeReturn() {
    var shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    if (!shift) {
        toast('Смена не открыта', 'err');
        return false;
    }
    var limit = getReturnLimit();
    if (limit <= 0)
        return true;
    var count = getShiftReturnCount(shift.id);
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
    var all = getSales().filter(isSaleActive);
    var receipts = groupSalesIntoReceipts(all).slice(0, 50);
    if (!receipts.length) {
        toast('Нет доступных продаж для возврата', 'err');
        return;
    }
    var body = document.getElementById('return-selector-body');
    if (!body)
        return;
    body.innerHTML = receipts.map(function (r) {
        var itemsSummary = r.items.map(function (it) {
            return esc(it.productName) + ' \xD7 ' + it.quantity;
        }).join(', ');
        return '<div class="return-receipt-row" onclick="selectReturnReceipt(\'' + r.id + '\')">' + '<div style="font-weight:600">Чек \u2116 ' + esc(r.id.slice(-6)) + '</div>' + '<div style="font-size:12px;color:var(--text-muted)">' + fmtDate(r.date) + ' | ' + esc(r.userName || '\u2014') + ' | ' + fmt(r.total) + '</div>' + '<div style="font-size:11px;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + itemsSummary.slice(0, 120) + '</div>' + '</div>';
    }).join('');
    openModal('modal-return-selector');
}

function calcReturnTotal() {
    var inputs = document.querySelectorAll('#return-items-body input[type=number]');
    var total = 0;
    inputs.forEach(function (inp) {
        var qty = Number(inp.value) || 0;
        var price = Number(inp.dataset.price) || 0;
        var max = Number(inp.dataset.max) || 0;
        var amt = Math.min(qty * price, max);
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
    var receiptId = document.getElementById('return-sale-id').value;
    if (!receiptId)
        return;
    var inputs = document.querySelectorAll('#return-items-body input[type=number]');
    var items = [];
    var totalRefund = 0;
    var hasAny = false;
    var allSales = getSales();
    var receiptSales = allSales.filter(function (s) {
        return s.receiptId === receiptId && isSaleActive(s);
    });
    inputs.forEach(function (inp) {
        var returnQty = Number(inp.value) || 0;
        if (returnQty <= 0)
            return;
        hasAny = true;
        var tr = inp.closest('tr');
        if (!tr)
            return;
        var idx = Array.prototype.indexOf.call(tr.parentNode.children, tr);
        var sale = receiptSales[idx];
        if (!sale) {
            toast('Ошибка: продажа не найдена для строки ' + (idx + 1), 'err');
            return;
        }
        if (sale.status === 'returned') {
            toast('Товар уже возвращён: ' + sale.productName, 'err');
            return;
        }
        var price = Number(inp.dataset.price) || 0;
        var refundAmount = returnQty * price;
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
        var returnedItems = [];
        items.forEach(function (it) {
            var sale = it.sale;
            var origQty = Number(sale.quantity) || 0;
            var returnQty = it.returnQty;
            if (sale.productId) {
                var products = getProducts();
                var product = products.find(function (p) {
                    return p.id === sale.productId;
                });
                if (product) {
                    product.quantity += returnQty;
                    setProducts(products);
                }
            }
            if (returnQty >= origQty) {
                var idx = allSales.findIndex(function (s) {
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
                var sidx = allSales.findIndex(function (s) {
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

        // Adjust customer spent and bonus balance on return
        var saleToRefund = receiptSales[0];
        if (saleToRefund && saleToRefund.customerId) {
            var allCustomers = getCustomers();
            var custIdx = allCustomers.findIndex(function (cx) {
                return cx.id === saleToRefund.customerId;
            });
            if (custIdx >= 0) {
                var cust = allCustomers[custIdx];
                var newSpent = Math.max(0, (Number(cust.spent) || 0) - totalRefund);
                var bonusReduction = Math.round(totalRefund * 0.01);
                cust.spent = newSpent;
                cust.bonusBalance = Math.max(0, Math.round((Number(cust.bonusBalance) || 0) - bonusReduction));
                setCustomers(allCustomers);
            }
        }

        var expenses = getExpenses();
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
