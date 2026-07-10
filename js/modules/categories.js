import { checkPermission } from './users.js';
import { esc, confirmAction, closeModal, clearBulkSelection } from './utils.js';
import { toast } from './notifications.js';
import { uid, openModal } from './ui.js';
import { _catDragSrc, _bulkSelected, setStore } from './store.js';
import { _posBrowserState } from './statistics.js';
import { onSaleSearch } from './sales.js';
import { getProducts, setProducts, renderProducts } from './products.js';

const getCategories = () => (window.ApDb ? window.ApDb.getCategories() : []);

function setCategories(arr) {
    if (window.ApDb)
        window.ApDb.setCategories(arr);
}

function renderCategoriesList(containerId) {
    const container = document.getElementById(containerId || 'categories-list');
    if (!container)
        return;
    const list = getCategories();
    const html = '';
    const canEditCat = checkPermission('editCategory');
    const canDeleteCat = checkPermission('deleteCategory');
    if (!list.length) {
        html = '<div class="empty">Нет разделов</div>';
    } else {
        html = '<div id="categories-sortable">';
        list.forEach(c, i => {
            const color = c.color || '#2563EB';
            const icon = c.icon || '\uD83D\uDCE6';
            html += '<div class="cat-card" draggable="true" data-index="' + i + '" data-id="' + c.id + '" ondragstart="onCatDragStart(event)" ondragover="onCatDragOver(event)" ondrop="onCatDrop(event,\'' + (containerId || '') + '\')" ondragend="onCatDragEnd(event)">' + '<div class="cat-card-inner">' + '<span class="cat-drag-handle" title="Перетащить">\u283F</span>' + '<span class="cat-color-dot" style="background:' + color + '"></span>' + '<span class="cat-icon-display">' + icon + '</span>' + '<span style="flex:1;font-weight:600;color:var(--text)">' + esc(c.name) + '</span>' + (canEditCat ? '<button class="icon-btn" onclick="editCategory(\'' + c.id + '\',\'' + (containerId || '') + '\')" style="font-size:13px" title="Редактировать">\u270F️</button>' : '') + (canDeleteCat ? '<button class="icon-btn del" onclick="deleteCategory(\'' + c.id + '\',\'' + (containerId || '') + '\')" style="font-size:14px" title="Удалить">\u2715</button>' : '') + '</div></div>';
        });
        html += '</div>';
    }
    container.innerHTML = html;
}

const CATEGORY_ICONS = [
    '\uD83D\uDCE6',
    '\uD83D\uDD27',
    '\u2699️',
    '\uD83D\uDEE2️',
    '\uD83D\uDD29',
    '\uD83D\uDD28',
    '\uD83D\uDD0C',
    '\uD83D\uDD0B',
    '\uD83D\uDEDE',
    '\uD83D\uDE97',
    '\uD83E\uDDF0',
    '\uD83E\uDE9B',
    '\uD83D\uDD12',
    '\uD83D\uDCA1',
    '\uD83E\uDDF4',
    '\uD83E\uDDF9',
    '\uD83D\uDCC4',
    '\uD83D\uDCCB',
    '\uD83D\uDCE6'
];

function renderCategoriesPage() {
    renderCategoriesList('categories-page-list');
    const pageWrap = document.getElementById('new-category-wrapper-page');
    if (pageWrap)
        pageWrap.style.display = checkPermission('addCategory') ? 'flex' : 'none';
    const pageHint = document.getElementById('page-cat-drag-hint');
    if (pageHint)
        pageHint.style.display = checkPermission('editCategory') ? 'block' : 'none';
}

function pageAddCategory() {
    if (!checkPermission('addCategory')) {
        toast('Нет прав на добавление разделов', 'err');
        return;
    }
    const nameInput = document.getElementById('page-new-category-name');
    if (!nameInput)
        return;
    const name = nameInput.value.trim();
    if (!name)
        return;
    const list = getCategories();
    if (list.some(c => c.name.toLowerCase() === name.toLowerCase();
        })) {
        toast('Раздел уже существует', 'err');
        return;
    }
    list.push({
        id: uid(),
        name: name,
        color: '#2563EB',
        icon: '\uD83D\uDCE6',
        order: list.length
    });
    setCategories(list);
    nameInput.value = '';
    renderCategoriesList('categories-page-list');
    toast('Раздел добавлен', 'ok');
}

function openCategoriesModal() {
    renderCategoriesList();
    const wrap = document.getElementById('new-category-wrapper');
    const hint = document.getElementById('cat-drag-hint');
    if (wrap)
        wrap.style.display = checkPermission('addCategory') ? 'flex' : 'none';
    if (hint)
        hint.style.display = checkPermission('editCategory') ? 'block' : 'none';
    openModal('modal-categories');
}

function addCategory() {
    if (!checkPermission('addCategory')) {
        toast('Нет прав на добавление разделов', 'err');
        return;
    }
    const name = document.getElementById('new-category-name').value.trim();
    if (!name)
        return;
    const list = getCategories();
    if (list.some(c => c.name.toLowerCase() === name.toLowerCase();
        })) {
        toast('Раздел уже существует', 'err');
        return;
    }
    list.push({
        id: uid(),
        name: name,
        color: '#2563EB',
        icon: '\uD83D\uDCE6',
        order: list.length
    });
    setCategories(list);
    document.getElementById('new-category-name').value = '';
    renderCategoriesList();
    toast('Раздел добавлен', 'ok');
}

function deleteCategory(id, containerId) {
    if (!checkPermission('deleteCategory')) {
        toast('Нет прав на удаление разделов', 'err');
        return;
    }
    confirmAction('Удалить раздел', 'Удалить раздел?', function () {
        const list = getCategories();
        list = list.filter(c => c.id !== id;
        });
        setCategories(list);
        renderCategoriesList(containerId);
        toast('Раздел удален', 'ok');
    });
}

function editCategory(id, containerId) {
    const list = getCategories();
    const cat = list.find(c => c.id === id;
    });
    if (!cat)
        return;
    const container = document.getElementById(containerId || 'categories-list');
    if (!container)
        return;
    const card = container.querySelector('.cat-card[data-id="' + id + '"]');
    if (!card)
        return;
    const inner = card.querySelector('.cat-card-inner');
    const color = cat.color || '#2563EB';
    const icon = cat.icon || '\uD83D\uDCE6';
    const cid = containerId || '';
    inner.innerHTML = '<div class="cat-edit-inline">' + '<input type="text" id="cat-edit-name-' + id + '" value="' + esc(cat.name) + '" placeholder="Название">' + '<input type="color" id="cat-edit-color-' + id + '" value="' + color + '">' + '<span class="cat-icon-display" id="cat-edit-icon-display-' + id + '">' + icon + '</span>' + '<div class="cat-icon-grid">' + CATEGORY_ICONS.map(ic => '<button type="button" class="' + (ic === icon ? 'active' : '') + '" onclick="selectCatIcon(\'' + id + '\',\'' + ic + '\')">' + ic + '</button>';
    }).join('') + '</div>' + '<button class="btn btn-primary btn-sm" onclick="saveCategory(\'' + id + '\',\'' + cid + '\')">Сохранить</button>' + '<button class="btn btn-secondary btn-sm" onclick="renderCategoriesList(\'' + cid + '\')">Отмена</button>' + '</div>';
}

function selectCatIcon(id, ic) {
    const display = document.getElementById('cat-edit-icon-display-' + id);
    if (display)
        display.textContent = ic;
    const grid = display.parentElement.querySelector('.cat-icon-grid');
    if (grid) {
        grid.querySelectorAll('button').forEach(b => {
            b.classList.toggle('active', b.textContent === ic);
        });
    }
}

function saveCategory(id, containerId) {
    if (!checkPermission('editCategory')) {
        toast('Нет прав на редактирование разделов', 'err');
        return;
    }
    const nameEl = document.getElementById('cat-edit-name-' + id);
    const colorEl = document.getElementById('cat-edit-color-' + id);
    const displayEl = document.getElementById('cat-edit-icon-display-' + id);
    if (!nameEl || !colorEl || !displayEl)
        return;
    const name = nameEl.value.trim();
    if (!name) {
        toast('Введите название', 'err');
        return;
    }
    const list = getCategories();
    const cat = list.find(c => c.id === id;
    });
    if (!cat)
        return;
    cat.name = name;
    cat.color = colorEl.value;
    cat.icon = displayEl.textContent;
    setCategories(list);
    renderCategoriesList(containerId);
    toast('Раздел обновлён', 'ok');
}

function onCatDragStart(e) {
    const card = e.target.closest('.cat-card');
    if (!card)
        return;
    setStore('_catDragSrc', card);
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.dataset.index);
}

function onCatDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const card = e.target.closest('.cat-card');
    if (card && card !== _catDragSrc) {
        card.classList.add('drag-over');
    }
}

function onCatDrop(e, containerId) {
    e.preventDefault();
    const target = e.target.closest('.cat-card');
    if (!target || !_catDragSrc || target === _catDragSrc)
        return;
    const list = getCategories();
    const fromIdx = parseInt(_catDragSrc.dataset.index);
    const toIdx = parseInt(target.dataset.index);
    if (isNaN(fromIdx) || isNaN(toIdx))
        return;
    const item = list.splice(fromIdx, 1)[0];
    list.splice(toIdx, 0, item);
    list.forEach(c, i => {
        c.order = i;
    });
    setCategories(list);
    renderCategoriesList(containerId);
    toast('Порядок изменён', 'ok');
    setStore('_catDragSrc', null);
}

function onCatDragEnd(e) {
    document.querySelectorAll('.cat-card').forEach(c => {
        c.classList.remove('dragging', 'drag-over');
    });
    setStore('_catDragSrc', null);
}

function filterCategory(catId) {
    document.querySelectorAll('.pos-cat-pill').forEach(b => {
        b.classList.remove('active');
    });
    if (catId) {
        const btn = document.querySelector('.pos-cat-pill[data-cat-id="' + catId + '"]');
        if (btn)
            btn.classList.add('active');
    } else {
        const allBtn = document.querySelector('.pos-cat-pill:first-child');
        if (allBtn)
            allBtn.classList.add('active');
    }
    _posBrowserState.cat = catId;
    const searchEl = document.getElementById('sale-search');
    if (searchEl) {
        searchEl.value = '';
        onSaleSearch();
    }
}

function posSelectCat(catId) {
    _posBrowserState.cat = catId;
    filterCategory(catId);
}

function filterCategoryFromModal(catId) {
    if (catId) {
        _posBrowserState.cat = catId;
        window.renderPosCatProducts(catId);
    } else {
        _posBrowserState.cat = '';
        window.renderPosCatList();
    }
}

function bulkChangeCategory() {
    if (_bulkSelected.size === 0) {
        toast('Нет выбранных товаров', 'err');
        return;
    }
    document.getElementById('bulk-cat-count').textContent = _bulkSelected.size;
    const sel = document.getElementById('bulk-cat-select');
    sel.innerHTML = '<option value="">Без категории</option>' + getCategories().map(c => '<option value="' + c.id + '">' + esc(c.name) + '</option>';
    }).join('');
    openModal('modal-bulk-category');
}

function applyBulkCategory() {
    const cat = document.getElementById('bulk-cat-select').value;
    const list = getProducts();
    const changed = 0;
    list = list.map(function (p) {
        if (_bulkSelected.has(p.id)) {
            p.category = cat;
            changed++;
        }
        return p;
    });
    setProducts(list);
    closeModal('modal-bulk-category');
    clearBulkSelection();
    renderProducts();
    toast('Категория обновлена у ' + changed + ' товаров', 'ok');
}

export { getCategories, setCategories, renderCategoriesList, CATEGORY_ICONS, renderCategoriesPage, pageAddCategory, openCategoriesModal, addCategory, deleteCategory, editCategory, selectCatIcon, saveCategory, onCatDragStart, onCatDragOver, onCatDrop, onCatDragEnd, filterCategory, posSelectCat, filterCategoryFromModal, bulkChangeCategory, applyBulkCategory };
