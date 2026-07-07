import { closeModal, posRefreshFavorites, fmt, esc, toggleItemDiscountValue } from './utils.js';
import { set } from './app-context.js';
import { addAuditLog, currentPayment, calcChange, calcMixedRemainder } from './sales.js';
import { toast } from './notifications.js';
import { _selectedCartItemId, setSelectedCartItemId, getProducts, getProductDiscount } from './products.js';
import { openModal, goPage, renderPosCatBrowser } from './ui.js';
import { checkPermission, requireAdminPin, isAdmin, getUserMaxDiscount, currentUser, getOpenShiftForCashier } from './users.js';
import { currentCustomer, getCustomerTier } from './customers.js';



let saleCart = [];
let SELECTED_IDS = new Set();

function setSaleCart(value) {
    saleCart = value;
    SELECTED_IDS.clear();
}

function toggleSelectAll(checked) {
    SELECTED_IDS.clear();
    if (checked) saleCart.forEach(function (item) { SELECTED_IDS.add(item.id); });
    renderSaleCart();
}

function toggleSelectItem(id, checked) {
    if (checked) SELECTED_IDS.add(id);
    else SELECTED_IDS.delete(id);
    renderSaleCart();
}

function clearSelection() {
    SELECTED_IDS.clear();
    renderSaleCart();
}

function getSelectedItems() {
    return saleCart.filter(function (item) { return SELECTED_IDS.has(item.id); });
}

function updateBulkBar() {
    var selected = getSelectedItems();
    var allCheck = document.getElementById('pos-select-all');
    var selCount = document.getElementById('pos-sel-count');
    var bulkInline = document.getElementById('pos-bulk-inline');
    if (selected.length === 0) {
        if (allCheck) allCheck.checked = false;
        if (selCount) selCount.classList.remove('show');
        if (bulkInline) bulkInline.classList.remove('show');
    } else {
        if (selCount) { selCount.classList.add('show'); selCount.textContent = '\u2713 ' + selected.length; }
        if (bulkInline) bulkInline.classList.add('show');
        if (allCheck) allCheck.checked = selected.length === saleCart.length;
    }
}

var _cartDiscountInfo = null; // legacy — kept for import compat

function setCartDiscountInfo(value) {
    _cartDiscountInfo = value;
}




function selectCartItem(id) {
    setSelectedCartItemId(id);
    document.querySelectorAll('#sale-cart-body tr').forEach(function (r) {
        r.classList.remove('selected');
    });
    var row = document.querySelector('#sale-cart-body tr[data-id="' + id + '"]');
    if (row)
        row.classList.add('selected');
}

function getSelectedCartItem() {
    if (!_selectedCartItemId)
        return null;
    return saleCart.find(function (c) {
        return c.id === _selectedCartItemId;
    }) || null;
}

function promptCartQty() {
    var item = getSelectedCartItem();
    if (!item) {
        toast('Выберите товар в таблице', 'warn');
        return;
    }
    var newQty = prompt('Новое количество для "' + item.name + '":', item.qty);
    if (newQty === null)
        return;
    newQty = parseInt(newQty) || 0;
    if (newQty < 1) {
        removeFromCart(item.id);
        return;
    }
    if (!item.isUniversal && newQty > (item.maxQty || 999999)) {
        toast('На складе всего ' + item.maxQty + ' шт.', 'err');
        return;
    }
    item.qty = newQty;
    renderSaleCart();
}

/* ========== DISCOUNT ON SELECTED ITEMS ========== */

function openCartDiscount() {
    if (!saleCart.length) {
        toast('Корзина пуста', 'err');
        return;
    }
    var selected = getSelectedItems();
    if (!selected.length) {
        toast('Сначала выберите товары', 'warn');
        return;
    }
    openItemDiscountForItems(selected);
}

function openItemDiscountForItems(items) {
    var ids = items.map(function (c) { return c.id; });
    window._bulkDiscountIds = ids;
    document.getElementById('item-discount-product').textContent = items.length === 1
        ? 'Товар: ' + items[0].name
        : 'Выбрано: ' + items.length + ' товаров';
    document.getElementById('item-discount-type').value = 'percent';
    document.getElementById('item-discount-value').value = '';
    document.getElementById('item-discount-reason').value = '';
    toggleItemDiscountValue();
    function doOpen() {
        openModal('modal-item-discount');
        setTimeout(function () { document.getElementById('item-discount-value').focus(); }, 200);
    }
    if (!checkPermission('canManualItemDiscount')) {
        requireAdminPin('Ручная скидка на товар (нет прав)', doOpen);
    } else {
        doOpen();
    }
}

function applyItemDiscount() {
    var type = document.getElementById('item-discount-type').value;
    var value = parseFloat(document.getElementById('item-discount-value').value);
    var reason = document.getElementById('item-discount-reason').value.trim();
    if (!value || value <= 0) {
        toast('Введите значение скидки', 'err');
        return;
    }
    var ids = window._bulkDiscountIds || [];
    if (!ids.length) { toast('Не выбраны товары', 'err'); return; }
    var items = saleCart.filter(function (c) { return ids.indexOf(c.id) !== -1; });
    if (!items.length) { toast('Товары не найдены', 'err'); return; }
    var maxAllowed = isAdmin() ? 25 : getUserMaxDiscount(currentUser.id);
    if (type === 'percent' && value > 25) {
        toast('Максимальная скидка в системе — 25%', 'err');
        return;
    }
    var overallEffective = type === 'percent' ? value : (value / items[0].price * 100);
    if (overallEffective > maxAllowed) {
        requireAdminPin('Скидка ' + overallEffective.toFixed(0) + '% превышает лимит (' + maxAllowed + '%)', function () {
            applyDiscountToItems(items, type, value, reason);
        });
        return;
    }
    applyDiscountToItems(items, type, value, reason);
}

function applyDiscountToItems(items, type, value, reason) {
    items.forEach(function (item) {
        if (type === 'percent') {
            item.discount = Math.round(item.price * value / 100 * 100) / 100;
            item.discountType = 'percent';
            item.discountValue = value;
        } else {
            item.discount = Math.min(value, item.price);
            item.discountType = 'amount';
            item.discountValue = value;
        }
        item.discountReason = reason || 'ручная скидка';
    });
    var label = type === 'percent' ? value + '%' : fmt(value) + '₸';
    closeModal('modal-item-discount');
    renderSaleCart();
    addAuditLog('Скидка на товары', label + ' на ' + items.length + ' тов.', '\uD83C\uDFF7');
    toast('Скидка ' + label + ' применена к ' + items.length + ' тов.', 'ok');
}

function removeItemDiscount(id) {
    var item = saleCart.find(function (c) { return c.id === id; });
    if (!item) return;
    delete item.discount;
    delete item.discountReason;
    delete item.discountType;
    delete item.discountValue;
    renderSaleCart();
    toast('Скидка убрана', 'ok');
}

function bulkRemoveDiscountSelected() {
    if (!SELECTED_IDS.size) { toast('Выберите товары', 'warn'); return; }
    getSelectedItems().forEach(function (item) {
        delete item.discount;
        delete item.discountReason;
        delete item.discountType;
        delete item.discountValue;
    });
    renderSaleCart();
    toast('Скидка убрана с ' + SELECTED_IDS.size + ' тов.', 'ok');
}

/* ========== /DISCOUNT ON SELECTED ITEMS ========== */

function addToCart(productId) {
    const shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    if (!shift) {
        toast('Смена (касса) не открыта. Сначала откройте смену.', 'err');
        goPage('myshift');
        return;
    }
    const product = getProducts().find(function (p) {
        return p.id === productId;
    });
    if (!product)
        return;
    if (product.quantity <= 0) {
        toast('Товара нет на складе', 'err');
        return;
    }
    const existing = saleCart.find(function (c) {
        return c.id === productId;
    });
    if (existing) {
        if (existing.qty >= product.quantity) {
            toast('На складе всего ' + product.quantity + ' шт.', 'err');
            return;
        }
        existing.qty++;
    } else {
        saleCart.push({
            id: product.id,
            code: product.code,
            barcode: product.barcode,
            name: product.name,
            price: product.price,
            maxQty: product.quantity,
            qty: 1
        });
    }
    document.getElementById('sale-search').value = '';
    document.getElementById('sale-results').classList.add('hidden');
    document.getElementById('sale-search').focus();
    renderPosCatBrowser();
    renderSaleCart();
    posRefreshFavorites();
}

function updateCartQty(productId, delta) {
    const item = saleCart.find(function (c) {
        return c.id === productId;
    });
    if (!item)
        return;
    const newQty = item.qty + delta;
    if (newQty < 1) {
        removeFromCart(productId);
        return;
    } else {
        if (newQty > item.maxQty) {
            toast('На складе всего ' + item.maxQty + ' шт.', 'err');
            return;
        }
        item.qty = newQty;
    }
    renderSaleCart();
}

function removeFromCart(productId) {
    saleCart = saleCart.filter(function (c) {
        return c.id !== productId;
    });
    SELECTED_IDS.delete(productId);
    renderSaleCart();
}

function changeCartQty(productId, delta) {
    var idx = saleCart.findIndex(function (c) {
        return c.id === productId;
    });
    if (idx === -1)
        return;
    var newQty = (saleCart[idx].qty || 1) + delta;
    if (newQty < 1) {
        removeFromCart(productId);
        return;
    }
    saleCart[idx].qty = newQty;
    renderSaleCart();
}

function renderSaleCart() {
    const tbody = document.getElementById('sale-cart-body');
    const subTotalEl = document.getElementById('sale-subtotal');
    var canChangeQty = checkPermission('canChangeQty');
    const discountRow = document.getElementById('sale-discount-row');
    const discountEl = document.getElementById('sale-discount');
    const bonusRow = document.getElementById('sale-bonus-row');
    const bonusUsedEl = document.getElementById('sale-bonus-used');
    const totalEl = document.getElementById('sale-total');
    const totalDisplay = document.getElementById('sale-total-display');
    const changeDisplay = document.getElementById('sale-change-display');
    const btnComplete = document.getElementById('btn-complete-sale');
    const btnDefer = document.getElementById('btn-defer-sale');
    var countEl = document.getElementById('pos-cart-count');
    if (!saleCart.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="pos-empty-msg">Список пуст</td></tr>';
        if (subTotalEl)
            subTotalEl.textContent = '0 \u20B8';
        if (discountRow)
            discountRow.style.display = 'none';
        if (bonusRow)
            bonusRow.style.display = 'none';
        if (totalEl) {
            totalEl.value = '';
            totalEl.dataset.value = 0;
        }
        if (totalDisplay)
            totalDisplay.textContent = '0 \u20B8';
        if (changeDisplay)
            changeDisplay.textContent = '0 \u20B8';
        if (countEl)
            countEl.textContent = '0 товаров';
        if (btnComplete)
            btnComplete.disabled = true;
        if (btnDefer)
            btnDefer.disabled = true;
        var ci = document.getElementById('sale-customer-info');
        if (ci)
            ci.style.display = 'none';
        var bw = document.getElementById('sale-bonus-wrap');
        if (bw)
            bw.style.display = 'none';
        updateBulkBar();
        return;
    }
    if (btnComplete)
        btnComplete.disabled = false;
    if (btnDefer)
        btnDefer.disabled = false;
    saleCart.forEach(function (item) {
        var promo = getProductDiscount(item.id);
        if (promo) {
            item._promoDisc = promo.discountType === 'percent' ? item.price * promo.discountValue / 100 : promo.discountValue;
            item._promoName = promo.id;
        } else {
            item._promoDisc = 0;
            item._promoName = null;
        }
    });
    var subTotal = saleCart.reduce(function (sum, c) {
        var effectivePrice = c.price - (c._promoDisc || 0) - (c.discount || 0);
        if (effectivePrice < 0) effectivePrice = 0;
        return sum + effectivePrice * c.qty;
    }, 0);
    tbody.innerHTML = saleCart.map(function (c, i) {
        var promoDisc = c._promoDisc || 0;
        var manualDisc = c.discount || 0;
        var totalItemDisc = promoDisc + manualDisc;
        var effectivePrice = c.price - totalItemDisc;
        if (effectivePrice < 0) effectivePrice = 0;

        var totAmt = effectivePrice * c.qty;

        var oldPriceHtml = totalItemDisc > 0 ? '<span class="pos-old-price">' + fmt(c.price) + '</span>' : '';
        var effectiveHtml = totalItemDisc > 0 ? '<span style="font-weight:600;color:var(--pos-success)">' + fmt(effectivePrice) + '</span>' : fmt(c.price);
        var priceHtml = oldPriceHtml + effectiveHtml;

        var discParts = [];
        if (manualDisc > 0) {
            var label = c.discountType === 'percent' ? c.discountValue + '%' : fmt(c.discountValue) + '\u20B8';
            discParts.push('<span class="pos-discount-badge" onclick="event.stopPropagation();removeItemDiscount(\'' + c.id + '\')">- ' + label + ' \u2715</span>');
        } else if (totalItemDisc > 0) {
            discParts.push('<span class="pos-discount-badge" style="background:var(--success-light, rgba(34,197,94,0.12));color:var(--success, #16a34a)">\uD83C\uDFF7 -' + fmt(totalItemDisc) + '</span>');
        } else {
            discParts.push('<span onclick="event.stopPropagation();openItemDiscountSingle(\'' + c.id + '\')" style="cursor:pointer;color:var(--pos-text-muted);font-size:13px;font-weight:500">\uD83C\uDFF7</span>');
        }
        var checked = SELECTED_IDS.has(c.id) ? 'checked' : '';
        return '<tr data-id="' + c.id + '"' + (SELECTED_IDS.has(c.id) ? ' class="selected"' : '') + '>' +
            '<td><input type="checkbox" class="pos-cart-checkbox" ' + checked + ' onchange="event.stopPropagation();toggleSelectItem(\'' + c.id + '\',' + 'this.checked)"></td>' +
            '<td><div class="pos-cart-row-name">' + esc(c.name) + '</div><div class="pos-cart-row-code">' + (c.code || c.barcode || (c.isUniversal ? '\u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B\u044C\u043D\u044B\u0439' : '') || '') + '</div></td>' +
            '<td>' + priceHtml + '</td>' +
            '<td><div class="pos-cart-row-qty">' +
            (canChangeQty ? '<button onclick="event.stopPropagation();changeCartQty(\'' + c.id + '\',-1)">\u2212</button>' : '') +
            '<span onclick="event.stopPropagation();openQtyPopup(\'' + c.id + '\')">' + c.qty + '</span>' +
            (canChangeQty ? '<button onclick="event.stopPropagation();changeCartQty(\'' + c.id + '\',1)">+</button>' : '') +
            '</div></td>' +
            '<td>' + discParts.join(' ') + '</td>' +
            '<td>' + fmt(totAmt) + '</td>' +
            '</tr>';
    }).join('');

    // Update select-all checkbox state
    var allCheck = document.getElementById('pos-select-all');
    if (allCheck && saleCart.length > 0) {
        allCheck.checked = SELECTED_IDS.size === saleCart.length;
    }

    if (countEl)
        countEl.textContent = saleCart.length + ' \u0442\u043E\u0432\u0430\u0440\u043E\u0432';
    if (subTotalEl)
        subTotalEl.textContent = fmt(subTotal);

    // Customer & bonus section — NO auto tier discount, NO cart discount
    let maxBonus = 0;
    let subAfterDiscount = subTotal;
    if (subAfterDiscount < 0) subAfterDiscount = 0;

    if (currentCustomer) {
        const tier = getCustomerTier(currentCustomer.spent || 0);
        var ci = document.getElementById('sale-customer-info');
        if (ci) {
            ci.style.display = 'flex';
            var ciText = document.getElementById('sale-customer-info-text');
            if (ciText)
                ciText.innerHTML = '\u041A\u043B\u0438\u0435\u043D\u0442: <strong>' + (currentCustomer.name || '\u2014') + '</strong> \xB7 \u0423\u0440\u043E\u0432\u0435\u043D\u044C: <strong>' + tier.name + '</strong> (\u0434\u043E -' + tier.discount * 100 + '%) \xB7 \u0411\u043E\u043D\u0443\u0441\u044B: <strong>' + fmt(currentCustomer.bonusBalance) + '</strong>';
        }
        var bw = document.getElementById('sale-bonus-wrap');
        if (bw)
            bw.style.display = 'flex';
        maxBonus = Math.min(Number(currentCustomer.bonusBalance) || 0, subAfterDiscount * tier.maxSpend);
        maxBonus = Math.floor(maxBonus);
        var bm = document.getElementById('sale-bonus-max');
        if (bm)
            bm.textContent = '(\u043C\u0430\u043A\u0441 ' + fmt(maxBonus) + ')';
    } else {
        var ci = document.getElementById('sale-customer-info');
        if (ci)
            ci.style.display = 'none';
        var bw = document.getElementById('sale-bonus-wrap');
        if (bw)
            bw.style.display = 'none';
        var bs = document.getElementById('sale-bonus-spend');
        if (bs)
            bs.value = 0;
    }

    // Hide tier discount row (no auto apply)
    if (discountRow)
        discountRow.style.display = 'none';

    let bonusSpend = 0;
    var bsEl = document.getElementById('sale-bonus-spend');
    if (bsEl) {
        bonusSpend = parseInt(bsEl.value) || 0;
        if (bonusSpend > maxBonus) {
            bonusSpend = maxBonus;
            bsEl.value = maxBonus;
        }
        if (bonusSpend < 0) {
            bonusSpend = 0;
            bsEl.value = 0;
        }
    }
    if (bonusSpend > 0 && bonusRow && bonusUsedEl) {
        bonusRow.style.display = 'flex';
        bonusUsedEl.textContent = '-' + fmt(bonusSpend);
    } else if (bonusRow) {
        bonusRow.style.display = 'none';
    }
    let finalTotal = subAfterDiscount - bonusSpend;
    if (finalTotal < 0)
        finalTotal = 0;
    if (totalEl) {
        totalEl.value = fmt(finalTotal);
        totalEl.dataset.value = finalTotal;
        totalEl.dataset.subAfterDiscount = subAfterDiscount;
        totalEl.dataset.discountAmt = 0;
        totalEl.dataset.maxBonus = maxBonus;
    }
    if (totalDisplay)
        totalDisplay.textContent = fmt(finalTotal) + ' \u20B8';
    if (currentPayment === 'cash') {
        calcChange();
    } else if (currentPayment === 'mixed') {
        var mc = document.getElementById('mixed-cash');
        var mk = document.getElementById('mixed-kaspi');
        if (mc && mk) {
            var cashVal = parseFloat(mc.value) || 0;
            var kaspiVal = parseFloat(mk.value) || 0;
            if (cashVal === 0 && kaspiVal === 0) {
                mc.value = finalTotal;
                mk.value = 0;
            } else {
                if (cashVal > finalTotal) {
                    mc.value = finalTotal;
                    mk.value = 0;
                } else {
                    mk.value = finalTotal - cashVal;
                }
            }
        }
        calcMixedRemainder();
    }
    updateBulkBar();
}




/* ========== BULK ACTIONS ========== */

function bulkDeleteSelected() {
    if (!SELECTED_IDS.size) { toast('Выберите товары', 'warn'); return; }
    var ids = getSelectedItems().map(function (c) { return c.id; });
    saleCart = saleCart.filter(function (c) { return ids.indexOf(c.id) === -1; });
    SELECTED_IDS.clear();
    renderSaleCart();
    toast('Удалено: ' + ids.length + ' тов.', 'ok');
}

function bulkDiscountSelected() {
    openCartDiscount();
}

function bulkQtySelected() {
    if (!SELECTED_IDS.size) { toast('\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u043E\u0432\u0430\u0440\u044B', 'warn'); return; }
    var selected = getSelectedItems();
    var newQty = prompt('\u041D\u043E\u0432\u043E\u0435 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0434\u043B\u044F ' + selected.length + ' \u0442\u043E\u0432\u0430\u0440\u043E\u0432:', '');
    if (newQty === null) return;
    newQty = parseInt(newQty) || 0;
    if (newQty < 1) {
        saleCart = saleCart.filter(function (c) { return selected.indexOf(c) === -1; });
        SELECTED_IDS.clear();
    } else {
        selected.forEach(function (item) {
            if (!item.isUniversal && newQty > (item.maxQty || 999999)) {
                toast('\u041D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435 \u0432\u0441\u0435\u0433\u043E ' + item.maxQty + ' \u0448\u0442. \u0434\u043B\u044F "' + item.name + '"', 'warn');
                return;
            }
            item.qty = newQty;
        });
    }
    renderSaleCart();
}

function bulkPriceSelected() {
    if (!SELECTED_IDS.size) { toast('\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0442\u043E\u0432\u0430\u0440\u044B', 'warn'); return; }
    var selected = getSelectedItems();
    var newPrice = prompt('\u041D\u043E\u0432\u0430\u044F \u0446\u0435\u043D\u0430 \u0434\u043B\u044F ' + selected.length + ' \u0442\u043E\u0432\u0430\u0440\u043E\u0432:', '');
    if (newPrice === null) return;
    newPrice = parseFloat(newPrice);
    if (!newPrice || newPrice <= 0) { toast('\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u0430\u044F \u0446\u0435\u043D\u0430', 'err'); return; }
    if (!checkPermission('canManualPrice')) { requireAdminPin('\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0446\u0435\u043D\u044B (\u043D\u0435\u0442 \u043F\u0440\u0430\u0432)', function () { applyPriceToItems(selected, newPrice); }); return; }
    applyPriceToItems(selected, newPrice);
}

function applyPriceToItems(items, price) {
    items.forEach(function (item) { item.price = price; });
    renderSaleCart();
    toast('\u0426\u0435\u043D\u0430 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0430 \u0434\u043B\u044F ' + items.length + ' \u0442\u043E\u0432.', 'ok');
}

// clearSaleSelection is defined in sales.js (clears cart + customer + search)

function openItemDiscountSingle(id) {
    var item = saleCart.find(function (c) { return c.id === id; });
    if (!item) return;
    window._bulkDiscountIds = [id];
    document.getElementById('item-discount-product').textContent = 'Товар: ' + item.name;
    document.getElementById('item-discount-type').value = 'percent';
    document.getElementById('item-discount-value').value = '';
    document.getElementById('item-discount-reason').value = '';
    toggleItemDiscountValue();
    function doOpen() {
        openModal('modal-item-discount');
        setTimeout(function () { document.getElementById('item-discount-value').focus(); }, 200);
    }
    if (!checkPermission('canManualItemDiscount')) {
        requireAdminPin('Ручная скидка на товар (нет прав)', doOpen);
    } else {
        doOpen();
    }
}

set('toggleSelectAll', toggleSelectAll);
set('toggleSelectItem', toggleSelectItem);
set('clearSelection', clearSelection);
set('bulkDeleteSelected', bulkDeleteSelected);
set('bulkDiscountSelected', bulkDiscountSelected);
set('bulkQtySelected', bulkQtySelected);
set('bulkPriceSelected', bulkPriceSelected);
set('bulkRemoveDiscountSelected', bulkRemoveDiscountSelected);
set('removeItemDiscount', removeItemDiscount);
set('openItemDiscountSingle', openItemDiscountSingle);
set('openCartDiscount', openCartDiscount);
set('applyItemDiscount', applyItemDiscount);

set('getSelectedCartItem', getSelectedCartItem);
set('updateCartQty', updateCartQty);
set('removeFromCart', removeFromCart);
set('renderSaleCart', renderSaleCart);
export { saleCart, setSaleCart, selectCartItem, getSelectedCartItem, promptCartQty, addToCart, updateCartQty, removeFromCart, changeCartQty, renderSaleCart, toggleSelectAll, toggleSelectItem, clearSelection, getSelectedItems, updateBulkBar, bulkDeleteSelected, bulkDiscountSelected, bulkQtySelected, bulkPriceSelected, applyPriceToItems, bulkRemoveDiscountSelected, removeItemDiscount, openCartDiscount, applyItemDiscount, openItemDiscountSingle };
