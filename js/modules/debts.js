import { esc, fmt, closeModal, showPaymentMethodModal, fmtDate, confirmAction, todayStr } from './utils.js';
import { uid, openModal } from './ui.js';
import { toast } from './notifications.js';
import { currentUser } from './users.js';
import { completeDebtPayment } from './sales.js';
import { exportSectionToExcel } from './reports.js';



function getDebts() {
    return window.ApDb ? window.ApDb.getDebts() : [];
}

function setDebts(arr) {
    if (window.ApDb)
        window.ApDb.setDebts(arr);
}

function getDebtors() {
    return window.ApDb ? window.ApDb.getDebtors() : [];
}

function setDebtors(arr) {
    if (window.ApDb)
        window.ApDb.setDebtors(arr);
}

let currentDebtorId = null;

function populateDebtClientSelector(selectedId) {
    var sel = document.getElementById('debt-client-select');
    if (!sel)
        return;
    var debtors = getDebtors();
    var html = '<option value="">-- Выберите клиента --</option>';
    debtors.forEach(function (d) {
        html += '<option value="' + d.id + '">' + esc(d.name) + (d.phone ? ' (' + esc(d.phone) + ')' : '') + '</option>';
    });
    html += '<option value="__new__">+ Новый клиент</option>';
    sel.innerHTML = html;
    if (selectedId && debtors.some(function (d) {
            return d.id === selectedId;
        })) {
        sel.value = selectedId;
    } else {
        sel.value = '';
    }
    onDebtClientChange();
}

function migrateDebtData() {
    var migrationKey = 'ap_debt_migration_v2';
    if (localStorage.getItem(migrationKey))
        return;
    try {
        var debtors = getDebtors();
        var debts = getDebts();
        var changed = false;
        var merged = {};
        var dupMap = {};
        debtors.forEach(function (d) {
            var key = (d.name || '').toLowerCase().trim();
            if (!key)
                return;
            if (!merged[key]) {
                merged[key] = d;
            } else {
                dupMap[d.id] = merged[key].id;
                changed = true;
            }
        });
        if (changed) {
            var keepIds = {};
            Object.keys(merged).forEach(function (k) {
                keepIds[merged[k].id] = true;
            });
            debtors = debtors.filter(function (d) {
                return keepIds[d.id];
            });
            debts = debts.map(function (d) {
                if (dupMap[d.debtorId])
                    return Object.assign({}, d, { debtorId: dupMap[d.debtorId] });
                return d;
            });
        }
        var newEntries = [];
        debts.forEach(function (d) {
            if (d.status === 'paid' && d.amount > 0 && d.productName !== 'Оплата') {
                var hasOffset = debts.some(function (x) {
                    return x.debtorId === d.debtorId && x.amount < 0 && Math.abs(x.amount) === d.amount && x.date && d.date && Math.abs(new Date(x.date) - new Date(d.date)) < 120000;
                });
                if (!hasOffset) {
                    newEntries.push({
                        id: uid(),
                        debtorId: d.debtorId,
                        debtorName: d.debtorName || '',
                        productCode: '',
                        productName: 'Оплата',
                        quantity: 1,
                        amount: -d.amount,
                        cashierName: d.cashierName || '',
                        dueDate: null,
                        status: 'open',
                        note: 'Авто-миграция (оплата долга: ' + d.productName + ')',
                        date: d.date || new Date().toISOString()
                    });
                    changed = true;
                }
            }
        });
        if (newEntries.length)
            debts = debts.concat(newEntries);
        if (changed) {
            setDebtors(debtors);
            setDebts(debts);
        }
        localStorage.setItem(migrationKey, '1');
    } catch (e) {
        console.warn('[Debt migration] Error:', e);
    }
}




function cancelDebt(id) {
    var debts = getDebts().map(function (d) {
        if (d.id === id)
            return Object.assign({}, d, { status: 'cancelled' });
        return d;
    });
    setDebts(debts);
    toast('Долг отменён', 'ok');
    renderDebts();
}

function changeDebtorRating(debtorId, rating) {
    var debtors = getDebtors().map(function (d) {
        if (d.id === debtorId)
            return Object.assign({}, d, { rating: rating });
        return d;
    });
    setDebtors(debtors);
    renderDebts();
}

function renderDebts() {
    renderDebtsList();
    if (currentDebtorId)
        renderDebtorDetail();
}

function onDebtClientChange() {
    var sel = document.getElementById('debt-client-select');
    var newFields = document.getElementById('debt-new-client-fields');
    if (!sel || !newFields)
        return;
    if (sel.value === '__new__') {
        newFields.style.display = '';
    } else {
        newFields.style.display = 'none';
    }
}

function openNewDebtorModal() {
    currentDebtorId = null;
    populateDebtClientSelector(null);
    document.getElementById('debt-client-select').value = '__new__';
    document.getElementById('debt-new-client-fields').style.display = '';
    document.getElementById('debt-name').value = '';
    document.getElementById('debt-phone').value = '';
    document.getElementById('debt-rating').value = 'good';
    document.getElementById('debt-due-date').value = '';
    document.getElementById('debt-barcode').value = '';
    document.getElementById('debt-product-name').value = '';
    document.getElementById('debt-product-code').value = '';
    document.getElementById('debt-qty').value = 1;
    document.getElementById('debt-amount').value = 0;
    document.getElementById('debt-note').value = '';
    document.getElementById('debt-status').value = 'open';
    document.getElementById('debt-modal-title').textContent = 'Новый должник';
    openModal('modal-debt');
}

function openAddDebt() {
    if (!currentDebtorId) {
        toast('Клиент не выбран', 'err');
        return;
    }
    var debtor = getDebtors().find(function (d) {
        return d.id === currentDebtorId;
    });
    if (!debtor)
        return;
    populateDebtClientSelector(currentDebtorId);
    document.getElementById('debt-name').value = debtor.name;
    document.getElementById('debt-phone').value = debtor.phone || '';
    document.getElementById('debt-rating').value = debtor.rating || 'good';
    document.getElementById('debt-due-date').value = '';
    document.getElementById('debt-barcode').value = '';
    document.getElementById('debt-product-name').value = '';
    document.getElementById('debt-product-code').value = '';
    document.getElementById('debt-qty').value = 1;
    document.getElementById('debt-amount').value = 0;
    document.getElementById('debt-note').value = '';
    document.getElementById('debt-status').value = 'open';
    document.getElementById('debt-modal-title').textContent = 'Добавить долг \u2014 ' + debtor.name;
    openModal('modal-debt');
}

function saveDebt() {
    var sel = document.getElementById('debt-client-select');
    var selectedClientId = sel ? sel.value : '';
    if (!selectedClientId) {
        toast('Выберите клиента из списка', 'err');
        return;
    }
    var rating = document.getElementById('debt-rating').value;
    var dueDate = document.getElementById('debt-due-date').value;
    var productName = document.getElementById('debt-product-name').value.trim();
    var productCode = document.getElementById('debt-product-code').value.trim();
    var qty = parseInt(document.getElementById('debt-qty').value) || 1;
    var amount = parseFloat(document.getElementById('debt-amount').value) || 0;
    var note = document.getElementById('debt-note').value.trim();
    var debtStatus = document.getElementById('debt-status').value;
    if (!productName) {
        toast('Введите товар/описание', 'err');
        return;
    }
    if (amount <= 0) {
        toast('Введите сумму долга', 'err');
        return;
    }
    if (selectedClientId === '__new__') {
        var name = document.getElementById('debt-name').value.trim();
        var phone = document.getElementById('debt-phone').value.trim();
        if (!name) {
            toast('Введите имя нового клиента', 'err');
            return;
        }
        var debtors = getDebtors();
        var debtorId = uid();
        debtors.push({
            id: debtorId,
            name: name,
            phone: phone || '',
            rating: rating,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        setDebtors(debtors);
        var debts = getDebts();
        debts.push({
            id: uid(),
            debtorId: debtorId,
            debtorName: name,
            productCode: productCode,
            productName: productName,
            quantity: qty,
            amount: amount,
            cashierName: currentUser.name,
            dueDate: dueDate || null,
            status: debtStatus,
            note: note,
            date: new Date().toISOString()
        });
        setDebts(debts);
        currentDebtorId = debtorId;
        toast('Должник создан: ' + name + ', долг: ' + fmt(amount), 'ok');
    } else {
        var debtors = getDebtors();
        var debtor = debtors.find(function (d) {
            return d.id === selectedClientId;
        });
        if (!debtor) {
            toast('Должник не найден', 'err');
            return;
        }
        debtor.rating = rating;
        debtor.phone = document.getElementById('debt-phone').value.trim() || debtor.phone;
        setDebtors(debtors);
        var debts = getDebts();
        debts.push({
            id: uid(),
            debtorId: selectedClientId,
            debtorName: debtor.name,
            productCode: productCode,
            productName: productName,
            quantity: qty,
            amount: amount,
            cashierName: currentUser.name,
            dueDate: dueDate || null,
            status: debtStatus,
            note: note,
            date: new Date().toISOString()
        });
        setDebts(debts);
        currentDebtorId = selectedClientId;
        toast('Долг добавлен: ' + fmt(amount), 'ok');
    }
    closeModal('modal-debt');
    renderDebts();
}

function openPayDebt(totalDebt) {
    if (!currentDebtorId) {
        toast('Клиент не выбран', 'err');
        return;
    }
    var debtor = getDebtors().find(function (d) {
        return d.id === currentDebtorId;
    });
    if (!debtor)
        return;
    if (totalDebt <= 0) {
        toast('Нет долга для погашения', 'err');
        return;
    }
    var existing = document.getElementById('debt-pay-overlay');
    if (existing)
        existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'debt-pay-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = '<div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:24px 32px;box-shadow:0 8px 30px rgba(0,0,0,0.3);max-width:400px;width:90%">' + '<div style="font-size:16px;font-weight:600;margin-bottom:4px">Погашение долга</div>' + '<div style="font-size:13px;color:var(--muted);margin-bottom:16px">' + debtor.name + ' \u2014 текущий долг: ' + fmt(totalDebt) + '</div>' + '<div class="field"><label>Сумма оплаты</label><input type="number" id="debt-pay-amount" class="form-input" step="1" min="1" max="' + totalDebt + '" value="' + totalDebt + '" style="font-size:18px;font-weight:700"></div>' + '<div style="display:flex;gap:8px;margin-top:16px">' + '<button class="btn btn-primary" style="flex:1" onclick="submitDebtPayment()">\uD83D\uDCB8 Оплатить</button>' + '<button class="btn btn-secondary" style="flex:1" onclick="document.getElementById(\'debt-pay-overlay\').remove()">Отмена</button>' + '</div></div>';
    document.body.appendChild(overlay);
    setTimeout(function () {
        document.getElementById('debt-pay-amount').focus();
    }, 100);
}

function submitDebtPayment() {
    var amt = parseFloat(document.getElementById('debt-pay-amount').value) || 0;
    if (amt <= 0) {
        toast('Введите сумму', 'err');
        return;
    }
    document.getElementById('debt-pay-overlay').remove();
    showPaymentMethodModal(function (paymentMethod) {
        completeDebtPayment(currentDebtorId, amt, paymentMethod);
    });
}

function renderDebtsList() {
    var debts = getDebts();
    var debtors = getDebtors();
    var search = (document.getElementById('debt-search').value || '').toLowerCase();
    var debtorsMap = {};
    debtors.forEach(function (d) {
        d.totalDebt = 0;
        d.lastActivity = d.updated_at || '';
        debtorsMap[d.id] = d;
    });
    debts.forEach(function (d) {
        if (!debtorsMap[d.debtorId])
            return;
        if (d.status !== 'cancelled') {
            debtorsMap[d.debtorId].totalDebt += d.amount || 0;
        }
        if (!debtorsMap[d.debtorId].lastActivity || d.date && d.date > debtorsMap[d.debtorId].lastActivity) {
            debtorsMap[d.debtorId].lastActivity = d.date;
        }
    });
    var filtered = debtors.filter(function (d) {
        if (search) {
            var name = (d.name || '').toLowerCase();
            var phone = (d.phone || '').replace(/\D/g, '');
            var searchDigits = search.replace(/\D/g, '');
            if (name.indexOf(search) === -1 && phone.indexOf(searchDigits) === -1 && (d.phone || '').toLowerCase().indexOf(search) === -1)
                return false;
        }
        return true;
    });
    filtered.sort(function (a, b) {
        return (b.lastActivity || '').localeCompare(a.lastActivity || '');
    });
    var active = filtered.filter(function (d) {
        return d.totalDebt > 0;
    });
    var closed = filtered.filter(function (d) {
        return d.totalDebt <= 0;
    });
    function renderCards(list) {
        return list.map(function (d) {
            var actCls = d.id === currentDebtorId ? 'active' : '';
            return '<div class="debtor-card ' + actCls + '" onclick="selectDebtor(\'' + d.id + '\')">' + '<div class="debtor-card-header"><span>' + d.name + '</span><span class="debtor-card-total">' + fmt(d.totalDebt) + '</span></div>' + '<div class="debtor-card-phone">' + (d.phone || 'Нет телефона') + '</div>' + '</div>';
        }).join('');
    }
    var html = '';
    if (active.length) {
        html += '<div class="debt-section-title">Активные (' + active.length + ')</div>' + renderCards(active);
    }
    if (closed.length) {
        html += '<div class="debt-section-title" style="margin-top:12px;">Закрытые (' + closed.length + ')</div>' + renderCards(closed);
    }
    if (!html)
        html = '<div class="empty">Ничего не найдено</div>';
    document.getElementById('debtors-list-container').innerHTML = html;
}

function selectDebtor(id) {
    currentDebtorId = id;
    renderDebtsList();
    renderDebtorDetail();
}

function renderDebtorDetail() {
    var container = document.getElementById('debtor-detail-container');
    if (!currentDebtorId) {
        container.innerHTML = '<div class="empty" style="flex:1;display:flex;align-items:center;justify-content:center;height:100%;">Выберите клиента слева</div>';
        return;
    }
    var debtor = getDebtors().find(function (d) {
        return d.id === currentDebtorId;
    });
    if (!debtor)
        return;
    var allDebts = getDebts().filter(function (d) {
        return d.debtorId === currentDebtorId;
    });
    var debts = allDebts.filter(function (d) {
        return d.status !== 'cancelled';
    });
    var totalDebt = debts.reduce(function (sum, d) {
        return sum + (d.amount || 0);
    }, 0);
    debts.sort(function (a, b) {
        return (a.date || '').localeCompare(b.date || '');
    });
    var msgs = debts.map(function (d) {
        var isPay = d.amount < 0;
        var cls = isPay ? 'msg-payment' : 'msg-debt';
        var text = isPay ? 'Оплата' + (d.note ? ' (' + d.note + ')' : '') : d.productName || 'Долг';
        if (d.quantity > 1 && !isPay)
            text += ' x' + d.quantity;
        var amtTxt = (isPay ? '+' : '-') + fmt(Math.abs(d.amount));
        var canDelete = d.status === 'paid' || d.status === 'cancelled' || d.amount <= 0;
        var statusBadge = d.status === 'paid' ? '<span class="badge badge-ok" style="font-size:10px">Погашен</span>' : d.status === 'open' ? '<span class="badge badge-warn" style="font-size:10px">Активен</span>' : d.status === 'cancelled' ? '<span class="badge badge-danger" style="font-size:10px">Отменён</span>' : '';
        return '<div class="msg-bubble ' + cls + '" style="position:relative">' + '<div class="msg-date">' + fmtDate(d.date) + (d.cashierName ? ' \u2022 ' + d.cashierName : '') + ' ' + statusBadge + '</div>' + '<div>' + text + '</div>' + '<div class="msg-amount">' + amtTxt + '</div>' + (canDelete ? '<button class="btn btn-sm btn-danger" style="position:absolute;top:4px;right:4px;padding:2px 6px;font-size:10px;line-height:1" onclick="event.stopPropagation();deleteDebt(\'' + d.id + '\')" title="Удалить запись">\u2715</button>' : '') + '</div>';
    }).join('');
    if (!msgs)
        msgs = '<div class="empty" style="margin:auto">История пуста</div>';
    var actions = '<button class="btn btn-primary" style="flex:1" onclick="openAddDebt()">+ Добавить долг</button>' + '<button class="btn btn-success" style="flex:1" onclick="openPayDebt(' + totalDebt + ')">\uD83D\uDCB8 Погасить долг</button>';
    if (totalDebt <= 0) {
        actions += '<button class="btn btn-danger" style="flex:1" onclick="deleteDebtor(\'' + currentDebtorId + '\')">\u2715 Удалить клиента</button>';
    }
    var html = '<div class="messenger-header">' + '<div><div style="font-size:18px;font-weight:600">' + debtor.name + '</div><div style="font-size:13px;color:var(--muted)">' + (debtor.phone || '') + '</div></div>' + '<div style="text-align:right"><div style="font-size:13px;color:var(--muted)">Общий долг</div><div style="font-size:20px;font-weight:700;color:' + (totalDebt > 0 ? 'var(--err)' : 'var(--ok)') + '">' + fmt(totalDebt) + '</div></div>' + '</div>' + '<div class="messenger-history">' + msgs + '</div>' + '<div class="messenger-actions">' + actions + '</div>';
    container.innerHTML = html;
    var hist = container.querySelector('.messenger-history');
    if (hist)
        hist.scrollTop = hist.scrollHeight;
}

function deleteDebt(id) {
    confirmAction('Удалить запись?', 'Запись будет удалена безвозвратно.', function () {
        if (window.ApDb && typeof window.ApDb.deleteDebt === 'function') {
            window.ApDb.deleteDebt(id);
        } else {
            var debts = getDebts().filter(function (d) {
                return d.id !== id;
            });
            setDebts(debts);
        }
        toast('Запись удалена', 'ok');
        renderDebts();
    });
}

function deleteDebtor(id) {
    confirmAction('Удалить клиента?', 'Клиент и вся история его долгов будут удалены безвозвратно.', function () {
        if (window.ApDb && typeof window.ApDb.deleteDebtor === 'function') {
            window.ApDb.deleteDebtor(id);
        } else {
            var debtors = getDebtors().filter(function (d) {
                return d.id !== id;
            });
            var debts = getDebts().filter(function (d) {
                return d.debtorId !== id;
            });
            setDebtors(debtors);
            setDebts(debts);
        }
        currentDebtorId = null;
        toast('Клиент удалён', 'ok');
        renderDebts();
    });
}

function exportDebtsExcel() {
    exportSectionToExcel('debts', getDebts(), 'SANAQ_Долги_' + todayStr() + '.xlsx');
}



export { getDebts, setDebts, getDebtors, setDebtors, currentDebtorId, populateDebtClientSelector, migrateDebtData, cancelDebt, changeDebtorRating, renderDebts, onDebtClientChange, openNewDebtorModal, openAddDebt, saveDebt, openPayDebt, submitDebtPayment, renderDebtsList, selectDebtor, renderDebtorDetail, deleteDebt, deleteDebtor, exportDebtsExcel };
