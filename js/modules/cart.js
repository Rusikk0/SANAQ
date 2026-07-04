import { closeModal, posRefreshFavorites, fmt, esc } from './utils.js';
import { set } from './app-context.js';
import { addAuditLog, currentPayment, calcChange, calcMixedRemainder } from './sales.js';
import { toast } from './notifications.js';
import { _selectedCartItemId, setSelectedCartItemId, getProducts, getProductDiscount } from './products.js';
import { openModal, goPage, renderPosCatBrowser } from './ui.js';
import { checkPermission, requireAdminPin, isAdmin, getUserMaxDiscount, currentUser, getOpenShiftForCashier } from './users.js';
import { currentCustomer, getCustomerTier } from './customers.js';



let saleCart = [];

function setSaleCart(value) {
    saleCart = value;
}

var _cartDiscountInfo = null;

function setCartDiscountInfo(value) {
    _cartDiscountInfo = value;
}

function applyCartDiscountFinal(type, value, reason) {
    _cartDiscountInfo = {
        type: type,
        value: value,
        reason: reason
    };
    saleCart.forEach(function (item) {
        delete item.discount;
        delete item.discountReason;
        delete item.discountType;
        delete item.discountValue;
    });
    closeModal('modal-cart-discount');
    renderSaleCart();
    addAuditLog('Ручная скидка на корзину', '-' + value + (type === 'percent' ? '%' : '\u20B8') + (reason ? ' (' + reason + ')' : ''), '\uD83C\uDFF7');
    toast('Скидка на корзину применена', 'ok');
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

function openCartDiscount() {
    if (!saleCart.length) {
        toast('Корзина пуста', 'err');
        return;
    }
    if (_cartDiscountInfo) {
        document.getElementById('cart-discount-type').value = _cartDiscountInfo.type;
        document.getElementById('cart-discount-value').value = _cartDiscountInfo.value;
        document.getElementById('cart-discount-reason').value = _cartDiscountInfo.reason || '';
    } else {
        document.getElementById('cart-discount-type').value = 'percent';
        document.getElementById('cart-discount-value').value = '';
        document.getElementById('cart-discount-reason').value = '';
    }
    function doOpen() {
        openModal('modal-cart-discount');
        setTimeout(function () {
            document.getElementById('cart-discount-value').focus();
        }, 200);
    }
    if (!checkPermission('canManualCartDiscount')) {
        requireAdminPin('Ручная скидка на корзину (нет прав)', doOpen);
    } else {
        doOpen();
    }
}

function applyCartDiscount() {
    var type = document.getElementById('cart-discount-type').value;
    var value = parseFloat(document.getElementById('cart-discount-value').value);
    var reason = document.getElementById('cart-discount-reason').value.trim();
    if (!value || value <= 0) {
        toast('Введите значение скидки', 'err');
        return;
    }
    var maxAllowed = isAdmin() ? 25 : getUserMaxDiscount(currentUser.id);
    if (type === 'percent' && value > 25) {
        toast('Максимальная скидка в системе \u2014 25%', 'err');
        return;
    }
    if (type === 'percent' && value > maxAllowed) {
        requireAdminPin('Скидка ' + value + '% превышает лимит (' + maxAllowed + '%)', function () {
            applyCartDiscountFinal(type, value, reason);
        });
        return;
    }
    applyCartDiscountFinal(type, value, reason);
}

function removeCartDiscount() {
    if (!_cartDiscountInfo)
        return;
    _cartDiscountInfo = null;
    renderSaleCart();
    toast('Скидка на корзину отменена', 'ok');
}

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
        saleCart = saleCart.filter(function (c) {
            return c.id !== productId;
        });
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
        return;
    }
    if (btnComplete)
        btnComplete.disabled = false;
    if (btnDefer)
        btnDefer.disabled = false;
    saleCart.forEach(function (item) {
        var promo = getProductDiscount(item.id);
        if (promo) {
            var itemDiscount = promo.discountType === 'percent' ? item.price * promo.discountValue / 100 : promo.discountValue;
            item._discount = itemDiscount;
            item._promoName = promo.id;
        } else {
            item._discount = 0;
            item._promoName = null;
        }
    });
    tbody.innerHTML = saleCart.map(function (c, i) {
        var promoDisc = c._discount || 0;
        var priceCell = promoDisc > 0 ? '<span style="text-decoration:line-through;color:var(--text-muted)">' + fmt(c.price) + '</span> <span style="color:var(--err);font-weight:600">-' + fmt(promoDisc) + '</span>' : fmt(c.price);
        var discBtn = c._promoName ? '<span title="' + esc(c._promoName) + '" style="color:var(--ok);font-weight:600">\uD83C\uDFF7</span>' : '<span onclick="event.stopPropagation();openItemDiscount(\'' + c.id + '\')" style="cursor:pointer;color:var(--text-muted);font-size:12px;font-weight:500">\uD83C\uDFF7</span>';
        return '<tr onclick="selectCartItem(\'' + c.id + '\')" data-id="' + c.id + '">' + '<td>' + (i + 1) + '</td>' + '<td><div class="pos-cart-row-name">' + esc(c.name) + '</div><div class="pos-cart-row-code">' + (c.code || c.barcode || (c.isUniversal ? 'универсальный' : '') || '') + '</div></td>' + '<td>' + priceCell + '</td>' + '<td><div style="display:flex;align-items:center;gap:4px;justify-content:center">' + (canChangeQty ? '<button class="qty-btn" onclick="event.stopPropagation();changeCartQty(\'' + c.id + '\',-1)" style="width:26px;height:26px;border-radius:50%;border:1px solid var(--border);background:var(--bg3);cursor:pointer;font-weight:700;font-size:16px;line-height:1;display:inline-flex;align-items:center;justify-content:center">\u2212</button>' : '') + '<span class="qty-editable" onclick="event.stopPropagation();openQtyPopup(\'' + c.id + '\')" style="cursor:pointer;font-weight:700;font-size:16px;padding:4px 8px;background:var(--bg3);border-radius:6px;border:1px solid var(--border)" title="Нажмите чтобы изменить количество">' + c.qty + '</span>' + (canChangeQty ? '<button class="qty-btn" onclick="event.stopPropagation();changeCartQty(\'' + c.id + '\',1)" style="width:26px;height:26px;border-radius:50%;border:1px solid var(--border);background:var(--bg3);cursor:pointer;font-weight:700;font-size:16px;line-height:1;display:inline-flex;align-items:center;justify-content:center">+</button>' : '') + '</div></td>' + '<td>' + discBtn + '</td>' + '<td>' + fmt((c.price - promoDisc) * c.qty) + '</td>' + '</tr>';
    }).join('');
    if (countEl)
        countEl.textContent = saleCart.length + ' товаров';
    let subTotal = saleCart.reduce(function (sum, c) {
        return sum + (c.price - (c._discount || 0)) * c.qty;
    }, 0);
    if (subTotalEl)
        subTotalEl.textContent = fmt(subTotal);
    var cartDiscAmt = 0;
    if (_cartDiscountInfo) {
        if (_cartDiscountInfo.type === 'percent') {
            cartDiscAmt = subTotal * _cartDiscountInfo.value / 100;
        } else {
            cartDiscAmt = Math.min(_cartDiscountInfo.value, subTotal);
        }
    }
    let maxBonus = 0;
    let discountAmt = 0;
    let subAfterDiscount = subTotal - cartDiscAmt;
    if (currentCustomer) {
        const tier = getCustomerTier(currentCustomer.spent || 0);
        var ci = document.getElementById('sale-customer-info');
        if (ci) {
            ci.style.display = 'flex';
            var ciText = document.getElementById('sale-customer-info-text');
            if (ciText)
                ciText.innerHTML = 'Клиент: <strong>' + (currentCustomer.name || '\u2014') + '</strong> \xB7 Уровень: <strong>' + tier.name + '</strong> (-' + tier.discount * 100 + '%) \xB7 Бонусы: <strong>' + fmt(currentCustomer.bonusBalance) + '</strong>';
        }
        var bw = document.getElementById('sale-bonus-wrap');
        if (bw)
            bw.style.display = 'flex';
        discountAmt = subAfterDiscount * tier.discount;
        subAfterDiscount = subAfterDiscount - discountAmt;
        maxBonus = Math.min(Number(currentCustomer.bonusBalance) || 0, subAfterDiscount * tier.maxSpend);
        maxBonus = Math.floor(maxBonus);
        var bm = document.getElementById('sale-bonus-max');
        if (bm)
            bm.textContent = '(макс ' + fmt(maxBonus) + ')';
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
    if (discountAmt > 0 && discountRow && discountEl) {
        discountRow.style.display = 'flex';
        discountEl.textContent = '-' + fmt(discountAmt);
    } else if (discountRow) {
        discountRow.style.display = 'none';
    }
    var cartDiscRow = document.getElementById('sale-cart-discount-row');
    var cartDiscEl = document.getElementById('sale-cart-discount');
    if (cartDiscAmt > 0 && cartDiscRow && cartDiscEl) {
        cartDiscRow.style.display = 'flex';
        var discLabel = _cartDiscountInfo.type === 'percent' ? _cartDiscountInfo.value + '%' : fmt(_cartDiscountInfo.value) + '\u20B8';
        cartDiscEl.innerHTML = '-' + fmt(cartDiscAmt) + ' (' + discLabel + ') <span onclick="removeCartDiscount()" style="cursor:pointer;color:var(--err);font-size:14px;margin-left:4px" title="Убрать скидку">\u2715</span>';
        if (_cartDiscountInfo.reason)
            cartDiscEl.innerHTML += ' \u2014 ' + esc(_cartDiscountInfo.reason);
    } else if (cartDiscRow) {
        cartDiscRow.style.display = 'none';
    }
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
        totalEl.dataset.discountAmt = discountAmt;
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
}



set('getSelectedCartItem', getSelectedCartItem);
set('updateCartQty', updateCartQty);
set('removeFromCart', removeFromCart);
set('renderSaleCart', renderSaleCart);
export { saleCart, setSaleCart, _cartDiscountInfo, setCartDiscountInfo, applyCartDiscountFinal, selectCartItem, getSelectedCartItem, promptCartQty, openCartDiscount, applyCartDiscount, removeCartDiscount, addToCart, updateCartQty, removeFromCart, changeCartQty, renderSaleCart };
