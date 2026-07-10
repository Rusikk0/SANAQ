import { currentStoreId } from './store.js';
import { getProducts } from './products.js';
import { esc, fmt, closeModal, confirmAction } from './utils.js';
import { openModal, uid } from './ui.js';
import { toast } from './notifications.js';

function getPromotions() {
    const v = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('promotions') : null;
    if (v !== null && v !== undefined) return Array.isArray(v) ? v : [];
    try {
        return JSON.parse(localStorage.getItem('sanaq_promotions_' + (currentStoreId || '')) || '[]');
    } catch (e) {
        return [];
    }
}

function setPromotions(arr) {
    try {
        localStorage.setItem('sanaq_promotions_' + (currentStoreId || ''), JSON.stringify(arr));
    } catch (e) {
    }
    if (window.ApDb && window.ApDb.setAppData)
        window.ApDb.setAppData('promotions', arr);
}

function getActivePromotions() {
    const now = new Date();
    return getPromotions().filter(function (p) {
        const start = new Date(p.startDate + 'T' + (p.startTime || '00:00'));
        const end = new Date(p.endDate + 'T' + (p.endTime || '23:59'));
        return now >= start && now <= end && p.active !== false;
    });
}

function renderPromotionsPage() {
    const container = document.getElementById('promotions-page-content');
    const list = getPromotions();
    if (!list.length) {
        container.innerHTML = '<div class="empty">Нет активных акций. Создайте новую акцию.</div>';
        return;
    }
    list.sort(a, b => b.startDate.localeCompare(a.startDate);
    });
    const now = new Date();
    const html = '<div style="display:flex;flex-direction:column;gap:12px">';
    list.forEach(p => {
        const start = new Date(p.startDate + 'T' + (p.startTime || '00:00'));
        const end = new Date(p.endDate + 'T' + (p.endTime || '23:59'));
        const isActive = now >= start && now <= end && p.active !== false;
        const products = getProducts();
        const product = products.find(x => x.id === p.productId;
        });
        const pName = product ? product.name : 'Товар удалён';
        html += '<div class="card" style="' + (isActive ? 'border-left:3px solid var(--success)' : 'border-left:3px solid var(--text-muted);opacity:0.7') + '">' + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' + '<span style="flex:1;font-weight:600">' + esc(pName) + '</span>' + '<span class="badge ' + (isActive ? 'badge-ok' : 'badge') + '">' + (isActive ? 'Активна' : 'Завершена') + '</span>' + '<span style="font-weight:700;color:var(--err)">-' + (p.discountType === 'percent' ? p.discountValue + '%' : fmt(p.discountValue) + ' \u20B8') + '</span>' + '<span style="font-size:12px;color:var(--text-secondary)">' + p.startDate + ' \u2192 ' + p.endDate + '</span>' + '<div style="display:flex;gap:4px">' + '<button class="icon-btn" onclick="editPromotion(\'' + p.id + '\')">\u270F️</button>' + '<button class="icon-btn del" onclick="deletePromotion(\'' + p.id + '\')">\uD83D\uDDD1</button>' + '</div></div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

function openPromotionEditor(id) {
    const products = getProducts();
    const sel = document.getElementById('promo-product');
    sel.innerHTML = '<option value="">-- Выберите товар --</option>' + products.map(p => '<option value="' + p.id + '">' + esc(p.code || '') + ' \u2014 ' + esc(p.name) + '</option>';
    }).join('');
    if (id) {
        const list = getPromotions();
        const p = list.find(x => x.id === id;
        });
        if (!p)
            return;
        document.getElementById('promo-edit-id').value = id;
        document.getElementById('promo-edit-title').textContent = 'Редактировать акцию';
        document.getElementById('promo-product').value = p.productId;
        document.getElementById('promo-discount-type').value = p.discountType || 'percent';
        document.getElementById('promo-discount-value').value = p.discountValue || 0;
        document.getElementById('promo-start-date').value = p.startDate || '';
        document.getElementById('promo-end-date').value = p.endDate || '';
        document.getElementById('promo-start-time').value = p.startTime || '';
        document.getElementById('promo-end-time').value = p.endTime || '';
    } else {
        document.getElementById('promo-edit-id').value = '';
        document.getElementById('promo-edit-title').textContent = 'Новая акция';
        document.getElementById('promo-product').value = '';
        document.getElementById('promo-discount-type').value = 'percent';
        document.getElementById('promo-discount-value').value = '';
        const today = new Date().toISOString().slice(0, 10);
        document.getElementById('promo-start-date').value = today;
        const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
        document.getElementById('promo-end-date').value = future;
        document.getElementById('promo-start-time').value = '00:00';
        document.getElementById('promo-end-time').value = '23:59';
    }
    openModal('modal-promotion-edit');
}

function savePromotion() {
    const id = document.getElementById('promo-edit-id').value;
    const productId = document.getElementById('promo-product').value;
    const discountType = document.getElementById('promo-discount-type').value;
    const discountValue = parseFloat(document.getElementById('promo-discount-value').value) || 0;
    const startDate = document.getElementById('promo-start-date').value;
    const endDate = document.getElementById('promo-end-date').value;
    const startTime = document.getElementById('promo-start-time').value || '00:00';
    const endTime = document.getElementById('promo-end-time').value || '23:59';
    if (!productId) {
        toast('Выберите товар', 'err');
        return;
    }
    if (discountValue <= 0) {
        toast('Введите размер скидки', 'err');
        return;
    }
    if (!startDate || !endDate) {
        toast('Укажите даты', 'err');
        return;
    }
    const data = {
        productId: productId,
        discountType: discountType,
        discountValue: discountValue,
        startDate: startDate,
        endDate: endDate,
        startTime: startTime,
        endTime: endTime
    };
    const list = getPromotions();
    if (id) {
        list = list.map(p => p.id === id ? Object.assign({}, p, data) : p;
        });
        toast('Акция обновлена', 'ok');
    } else {
        data.id = uid();
        data.active = true;
        list.push(data);
        toast('Акция создана', 'ok');
    }
    setPromotions(list);
    closeModal('modal-promotion-edit');
    renderPromotionsPage();
}

function editPromotion(id) {
    openPromotionEditor(id);
}

function deletePromotion(id) {
    confirmAction('Удалить акцию', 'Удалить акцию?', function () {
        const list = getPromotions().filter(p => p.id !== id;
        });
        setPromotions(list);
        renderPromotionsPage();
        toast('Акция удалена', 'ok');
    });
}

export { getPromotions, setPromotions, getActivePromotions, renderPromotionsPage, openPromotionEditor, savePromotion, editPromotion, deletePromotion };
