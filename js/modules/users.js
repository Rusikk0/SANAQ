import { getShifts, renderShifts } from './shifts.js';
import { getSales, isSaleActive, addAuditLog } from './sales.js';
import { set } from './app-context.js';
import { card, fmt, tableHTML, fmtDate, closeModal, todayStr, _setPerm, esc } from './utils.js';
import { currentStoreId, _pendingPerms, _pendingMaxDisc, setStore } from './store.js';
import { DEFAULT_PERMISSIONS, PAGE_PERMISSION_GROUP, PERMISSION_GROUPS, PERMISSION_LABELS } from './constants.js';
import { applyRoleUI, refreshAll, openModal, showCustomModal } from './ui.js';
import { toast } from './notifications.js';
import { getUserPin, _adminPinCallback, setAdminPinCallback } from './auth.js';
import { exportSectionToExcel } from './reports.js';



let currentUser = null;

function setCurrentUser(user) {
    currentUser = user;
}

function getUsers() {
    return window.ApDb ? window.ApDb.getUsers() : [];
}

function setUsers(arr) {
}

function getCashiers() {
    return getUsers().filter(function (u) {
        return u.role === 'cashier';
    });
}

function getOpenShiftForCashier(usernameOrId) {
    const norm = (usernameOrId || '').toLowerCase();
    return getShifts().find(function (s) {
        if (s.status !== 'open')
            return false;
        if (s.cashierId === usernameOrId)
            return true;
        return (s.cashierUsername || '').toLowerCase() === norm;
    });
}

function getCashierShare() {
    var key = 'sanaq_share_' + (currentUser && currentUser.username || 'default');
    return parseFloat(localStorage.getItem(key)) || 5;
}

function renderCashierStats() {
    var shifts = getShifts();
    var sales = getSales().filter(isSaleActive);
    var users = getUsers();
    var cashierMap = {};
    shifts.forEach(function (sh) {
        var name = sh.cashierName || '\u2014';
        if (!cashierMap[name]) {
            var u = users.find(function (x) {
                return (x.email || x.username || '') === (sh.cashierUsername || '');
            });
            var isCashierRole = u ? u.role === 'cashier' : true;
            var shareKey = 'sanaq_share_' + (sh.cashierUsername || '');
            var pct = isCashierRole ? parseFloat(localStorage.getItem(shareKey)) || 5 : 0;
            cashierMap[name] = {
                name: name,
                username: sh.cashierUsername || '',
                shifts: 0,
                sales: 0,
                revenue: 0,
                cogs: 0,
                percent: pct,
                isCashier: isCashierRole
            };
        }
        cashierMap[name].shifts++;
        var shiftSales = sales.filter(function (s) {
            return s.shiftId === sh.id;
        });
        cashierMap[name].sales += shiftSales.length;
        shiftSales.forEach(function (s) {
            cashierMap[name].revenue += s.total;
            cashierMap[name].cogs += (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
        });
    });
    var cashierRows = Object.values(cashierMap);
    cashierRows.sort(function (a, b) {
        return b.revenue - a.revenue;
    });
    var totalRev = cashierRows.reduce(function (s, x) {
        return s + x.revenue;
    }, 0);
    var totalSales = cashierRows.reduce(function (s, x) {
        return s + x.sales;
    }, 0);
    document.getElementById('cashiers-stats-cards').innerHTML = card('Всего кассиров', cashierRows.length, '') + card('Общая выручка', fmt(totalRev), 'ok') + card('Всего продаж', totalSales, '');
    var rows = cashierRows.map(function (c) {
        var profit = c.revenue - c.cogs;
        var earnings = c.isCashier ? c.revenue * c.percent / 100 : 0;
        var pct = totalRev > 0 ? (c.revenue / totalRev * 100).toFixed(1) : '0';
        return [
            c.name,
            c.shifts,
            c.sales,
            fmt(c.revenue),
            fmt(c.cogs),
            '<span style="color:' + (profit >= 0 ? 'var(--ok)' : 'var(--err)') + ';font-weight:600">' + fmt(profit) + '</span>',
            pct + '%',
            c.isCashier ? c.percent + '%' : '<span style="color:var(--text-muted)">\u2014</span>',
            c.isCashier ? '<span style="color:var(--accent);font-weight:600">' + fmt(earnings) + '</span>' : '<span style="color:var(--text-muted)">\u2014</span>'
        ];
    });
    document.getElementById('cashiers-stats-table').innerHTML = rows.length ? '<div class="table-wrap">' + tableHTML([
        'Кассир',
        'Смен',
        'Продаж',
        'Выручка',
        'Себестоимость',
        'Прибыль',
        'Доля от выручки',
        'Процент',
        'Заработок'
    ], rows) + '</div>' : '<div class="empty">Данных нет</div>';
    window._cashierStatsData = cashierRows;
}

function renderCashiersPage() {
    renderCashiersTable();
    renderShifts();
    fillAdminProfileForm();
    var nameEl = document.getElementById('shift-current-user-name');
    if (nameEl && currentUser)
        nameEl.textContent = currentUser.name;
}

function renderCashiersTable() {
    var all = getAllUsers().filter(function (u) {
        return u.role === 'cashier';
    });
    document.getElementById('cashiers-table').innerHTML = all.length ? tableHTML([
        'Имя',
        'Логин',
        'Тип',
        'Статус',
        'Смена',
        'Действия'
    ], all.map(function (u) {
        const shift = getOpenShiftForCashier(u.username);
        const shiftInfo = shift ? '<span class="badge badge-ok">Открыта с ' + fmtDate(shift.openedAt) + '</span>' : '<span class="badge badge-warn">Нет смены</span>';
        const status = u.active !== false ? '<span class="badge badge-ok">Активен</span>' : '<span class="badge badge-danger">Заблокирован</span>';
        var typeLabel = u.memberId ? 'Supabase' : '<span class="badge badge-info">Локальный</span>';
        return [
            u.name,
            u.username,
            typeLabel,
            status,
            shiftInfo,
            '<div class="actions">' + '<button class="btn btn-sm btn-secondary" onclick="editCashierAccount(\'' + u.id + '\')">\u270F️ Аккаунт</button>' + (shift ? '<button class="btn btn-sm btn-danger" onclick="closeShiftConfirm(\'' + shift.id + '\')">\u23F9 Закрыть смену</button>' : '') + '</div>'
        ];
    })) : '<div class="empty">Кассиров нет</div>';
}

function _localUsersKey() {
    return 'sanaq_local_users_' + (currentStoreId || '');
}

function getLocalUsers() {
    try {
        var raw = localStorage.getItem(_localUsersKey());
        if (raw)
            return JSON.parse(raw);
        if (currentStoreId) {
            raw = localStorage.getItem('sanaq_local_users_');
            if (raw)
                return JSON.parse(raw);
        }
    } catch (e) {
    }
    return [];
}

function setLocalUsers(arr) {
    localStorage.setItem(_localUsersKey(), JSON.stringify(arr));
    localStorage.setItem('sanaq_local_users_', JSON.stringify(arr));
}

function getAllUsers() {
    var supabase = getUsers();
    var local = getLocalUsers();
    var byKey = {};
    supabase.forEach(function (u) {
        var key = (u.username || u.email || u.id || '').toLowerCase();
        if (key)
            byKey[key] = u;
    });
    local.forEach(function (u) {
        var key = (u.username || u.email || u.id || '').toLowerCase();
        if (key && !byKey[key])
            byKey[key] = u;
    });
    return Object.keys(byKey).map(function (k) {
        return byKey[k];
    });
}

function getUserData(userId) {
    try {
        var all = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('permissions') : null;
        if (!all)
            all = JSON.parse(localStorage.getItem('sanaq_permissions_' + (currentStoreId || '')) || '{}');
        var data = all[userId];
        if (!data)
            return {
                permissions: Object.assign({}, DEFAULT_PERMISSIONS),
                maxDiscount: 0
            };
        if (data.permissions)
            return data;
        var oldMax = data._maxDiscount || 0;
        delete data._maxDiscount;
        return {
            permissions: data,
            maxDiscount: oldMax
        };
    } catch (e) {
        return {
            permissions: Object.assign({}, DEFAULT_PERMISSIONS),
            maxDiscount: 0
        };
    }
}

function getUserPermissions(userId) {
    return getUserData(userId).permissions;
}

function getUserMaxDiscount(userId) {
    return getUserData(userId).maxDiscount || 0;
}

function setUserPermissions(userId, data) {
    try {
        var all = JSON.parse(localStorage.getItem('sanaq_permissions_' + (currentStoreId || '')) || '{}');
        all[userId] = data;
        localStorage.setItem('sanaq_permissions_' + (currentStoreId || ''), JSON.stringify(all));
        if (window.ApDb && window.ApDb.setAppData)
            window.ApDb.setAppData('permissions', all);
        if (currentUser && currentUser.id === userId)
            applyRoleUI();
    } catch (e) {
    }
}

function _permUserId() {
    return document.getElementById('cashier-edit-id').value;
}

var _pendingSwitchUserId = null;

function _findUserAnywhere(userId) {
    var u = getUsers().find(function (u) {
        return u.id === userId;
    });
    if (u)
        return u;
    return getLocalUsers().find(function (u) {
        return u.id === userId;
    });
}

function doSwitchUser(target) {
    var oldUser = currentUser ? currentUser.name : '\u2014';
    currentUser = target;
    document.getElementById('user-avatar').textContent = (target.name || '\u2014')[0].toUpperCase();
    document.getElementById('user-name').textContent = target.name || '\u2014';
    document.getElementById('user-role').textContent = target.role === 'admin' ? 'Администратор' : 'Кассир';
    applyRoleUI();
    addAuditLog('Смена пользователя', 'С ' + oldUser + ' на ' + target.name, '\uD83D\uDD04');
    toast('Вы вошли как ' + target.name, 'ok');
    closeModal('modal-cashier-switch');
    refreshAll();
}




function openInviteCashierModal() {
    if (!isAdmin()) {
        toast('Только администратор', 'err');
        return;
    }
    openModal('modal-invite-cashier');
}

function isAdmin() {
    return currentUser && currentUser.role === 'admin';
}

function hasGroupPermission(pageName) {
    if (isAdmin())
        return true;
    var group = PAGE_PERMISSION_GROUP[pageName];
    if (!group)
        return true;
    var keys = PERMISSION_GROUPS[group];
    if (!keys)
        return true;
    var perms = getUserPermissions(currentUser.id);
    return keys.some(function (k) {
        return perms[k] === true;
    });
}

function posCashierName() {
    var el = document.getElementById('pos-cashier-display');
    if (el && currentUser)
        el.textContent = currentUser.name || currentUser.username || 'Кассир';
}

function requireAdminPin(operationName, callback) {
    var admins = getUsers().filter(function (u) {
        return u.role === 'admin';
    });
    if (!admins.length) {
        toast('Нет администратора в системе', 'err');
        return;
    }
    document.getElementById('admin-pin-operation').textContent = operationName;
    document.getElementById('admin-pin-input').value = '';
    document.getElementById('admin-pin-error').style.display = 'none';
    setAdminPinCallback(callback);
    openModal('modal-admin-pin');
    setTimeout(function () {
        document.getElementById('admin-pin-input').focus();
    }, 200);
}

function verifyAdminPin() {
    var pin = document.getElementById('admin-pin-input').value.trim();
    if (!pin) {
        document.getElementById('admin-pin-error').style.display = 'block';
        return;
    }
    var admins = getUsers().filter(function (u) {
        return u.role === 'admin';
    });
    var ok = false;
    admins.forEach(function (a) {
        if (getUserPin(a.id) === pin)
            ok = true;
    });
    if (ok) {
        closeModal('modal-admin-pin');
        var cb = _adminPinCallback;
        setAdminPinCallback(null);
        addAuditLog('Подтверждение администратора', 'Операция подтверждена PIN', '\uD83D\uDD10');
        if (cb)
            cb();
    } else {
        document.getElementById('admin-pin-error').style.display = 'block';
    }
}

function saveCashierShare() {
    var val = parseFloat(document.getElementById('cashier-share-input').value) || 0;
    var key = 'sanaq_share_' + (currentUser && currentUser.username || 'default');
    localStorage.setItem(key, val);
    toast('Доля сохранена: ' + val + '%', 'ok');
    renderCashierStats();
}

function exportCashiersExcel() {
    exportSectionToExcel('cashiers', window._cashierStatsData || [], 'SANAQ_Кассиры_' + todayStr() + '.xlsx');
}

function switchCashiersTab(tab) {
    document.querySelectorAll('#cashiers-tabs .tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.ctab === tab);
    });
    document.getElementById('ctab-accounts').classList.toggle('hidden', tab !== 'accounts');
    document.getElementById('ctab-shifts').classList.toggle('hidden', tab !== 'shifts');
    document.getElementById('ctab-profile').classList.toggle('hidden', tab !== 'profile');
    var ctabBackup = document.getElementById('ctab-backup');
    if (ctabBackup)
        ctabBackup.classList.toggle('hidden', tab !== 'backup');
    if (tab === 'shifts')
        renderShifts();
    if (tab === 'profile')
        fillAdminProfileForm();
}

async function fillAdminProfileForm() {
    var user;
    try { user = await window.ApAuth.getCurrentUser(); } catch (e) { return; }
    if (!user)
        return;
    document.getElementById('admin-username').value = user.email || '';
    document.getElementById('admin-name').value = currentUser.name || '';
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-password2').value = '';
}

async function saveAdminProfile() {
    const name = document.getElementById('admin-name').value.trim();
    const password = document.getElementById('admin-password').value;
    const password2 = document.getElementById('admin-password2').value;
    if (!name) {
        toast('Введите имя', 'err');
        return;
    }
    if (password && password.length < 6) {
        toast('Пароль минимум 6 символов', 'err');
        return;
    }
    if (password && password !== password2) {
        toast('Пароли не совпадают', 'err');
        return;
    }
    try {
        await window.ApAuth.updateProfile(name);
        if (password)
            await window.ApAuth.updatePassword(password);
        currentUser.name = name;
        
        document.getElementById('user-name').textContent = name;
        toast('Профиль сохранён', 'ok');
        fillAdminProfileForm();
    } catch (err) {
        toast(err.message || String(err), 'err');
    }
}

function openCashierModal(id) {
    document.getElementById('cashier-edit-id').value = id || '';
    document.getElementById('modal-cashier-title').textContent = id ? 'Редактировать кассира' : 'Новый кассир';
    document.getElementById('cashier-login-field').style.display = 'block';
    document.getElementById('cashier-active-field').classList.toggle('hidden', !id);
    document.getElementById('cashier-pass-hint').textContent = id ? '(оставьте пустым, чтобы не менять)' : '*';
    var hint = document.getElementById('cashier-login-hint');
    hint.style.display = id ? 'block' : 'none';
    hint.textContent = id ? 'При смене логина обновятся привязки к сменам этого кассира.' : '';
    if (id) {
        var u = getUsers().find(function (x) {
            return x.id === id;
        });
        if (!u)
            u = getLocalUsers().find(function (x) {
                return x.id === id;
            });
        if (u) {
            document.getElementById('cashier-username').value = u.username;
            document.getElementById('cashier-name').value = u.name;
            document.getElementById('cashier-password').value = '';
            document.getElementById('cashier-active').checked = u.active !== false;
            var shareKey = 'sanaq_share_' + (u.email || u.username || '');
            document.getElementById('cashier-percent').value = parseFloat(localStorage.getItem(shareKey)) || 5;
        }
    } else {
        document.getElementById('cashier-username').value = '';
        document.getElementById('cashier-name').value = '';
        document.getElementById('cashier-password').value = '';
        document.getElementById('cashier-active').checked = true;
        document.getElementById('cashier-percent').value = 5;
    }
    renderPermissionsEditor(id);
    openModal('modal-cashier');
}

function editCashierAccount(id) {
    openCashierModal(id);
}

async function saveCashier() {
    const editId = document.getElementById('cashier-edit-id').value;
    const username = document.getElementById('cashier-username').value.trim();
    const name = document.getElementById('cashier-name').value.trim();
    const password = document.getElementById('cashier-password').value;
    const active = document.getElementById('cashier-active').checked;
    if (!editId) {
        if (!username) {
            toast('Введите логин', 'err');
            return;
        }
        if (!name) {
            toast('Введите имя кассира', 'err');
            return;
        }
        if (!password) {
            toast('Введите пароль', 'err');
            return;
        }
        var localUsers = getLocalUsers();
        if (localUsers.some(function (u) {
                return u.username === username;
            })) {
            toast('Логин уже занят', 'err');
            return;
        }
        var newId = uid();
        localUsers.push({
            id: newId,
            username: username,
            password: password,
            name: name,
            role: 'cashier',
            active: true
        });
        setLocalUsers(localUsers);
        var newPerms = _pendingPerms || Object.assign({}, DEFAULT_PERMISSIONS);
        setUserPermissions(newId, {
            permissions: newPerms,
            maxDiscount: _pendingMaxDisc || 0
        });
        setStore('_pendingPerms', null);
        setStore('_pendingMaxDisc', 0);
        const shareVal = parseFloat(document.getElementById('cashier-percent').value) || 0;
        localStorage.setItem('sanaq_share_' + username, Math.min(100, Math.max(0, shareVal)));
        toast('Кассир создан', 'ok');
        closeModal('modal-cashier');
        renderCashiersPage();
        return;
    }
    if (!name) {
        toast('Введите имя кассира', 'err');
        return;
    }
    var localUsers = getLocalUsers();
    var localIdx = localUsers.findIndex(function (x) {
        return x.id === editId;
    });
    if (localIdx !== -1) {
        localUsers[localIdx].name = name;
        localUsers[localIdx].active = active;
        if (password)
            localUsers[localIdx].password = password;
        setLocalUsers(localUsers);
        const shareVal = parseFloat(document.getElementById('cashier-percent').value) || 0;
        localStorage.setItem('sanaq_share_' + localUsers[localIdx].username, Math.min(100, Math.max(0, shareVal)));
        toast('Данные кассира сохранены', 'ok');
        closeModal('modal-cashier');
        renderCashiersPage();
        return;
    }
    const u = getUsers().find(function (x) {
        return x.id === editId;
    });
    if (!u || !u.memberId) {
        toast('Кассир не найден', 'err');
        return;
    }
    try {
        const shareVal = parseFloat(document.getElementById('cashier-percent').value) || 0;
        var shareKey = 'sanaq_share_' + (u.email || u.username || '');
        localStorage.setItem(shareKey, Math.min(100, Math.max(0, shareVal)));
        const store = window.ApAuth.getCurrentStore();
        const res = await window.ApAuth.client().from('store_members').update({
            display_name: name,
            active: active
        }).eq('id', u.memberId).eq('store_id', store.storeId);
        if (res.error)
            throw res.error;
        await window.ApDb.refresh();
        toast('Данные кассира сохранены', 'ok');
        closeModal('modal-cashier');
        renderCashiersPage();
    } catch (err) {
        toast(err.message || String(err), 'err');
    }
}

function checkPermission(permName) {
    if (isAdmin())
        return true;
    var perms = getUserPermissions(currentUser.id);
    return perms[permName] === true;
}

function renderPermissionsEditor(userId) {
    var container = document.getElementById('permissions-list');
    var editor = document.getElementById('permissions-editor');
    if (!container || !editor)
        return;
    if (!isAdmin()) {
        editor.style.display = 'none';
        return;
    }
    editor.style.display = 'block';
    editor.style.borderTop = '2px solid var(--border)';
    editor.style.paddingTop = '14px';
    editor.style.marginTop = '10px';
    var perms, maxDisc;
    if (!userId) {
        perms = _pendingPerms || Object.assign({}, DEFAULT_PERMISSIONS);
        maxDisc = _pendingMaxDisc;
    } else {
        var data = getUserData(userId);
        perms = data.permissions;
        maxDisc = data.maxDiscount;
    }
    var html = '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;grid-column:1/-1">' + '<input type="text" id="perm-search" placeholder="\uD83D\uDD0D Поиск права..." style="flex:1;min-width:120px;padding:6px 10px;border:1px solid var(--border);border-radius:6px;font-size:12px;background:var(--bg2)" oninput="filterPermissions(this.value)">' + '<button class="btn btn-sm btn-secondary" onclick="selectAllPermissions()" title="Выбрать все права">\u2713 Все</button>' + '<button class="btn btn-sm btn-secondary" onclick="deselectAllPermissions()" title="Снять все права">\u2715 Ничего</button>' + '<button class="btn btn-sm btn-secondary" onclick="copyPermissionsFromUser()" title="Скопировать права другого пользователя">\uD83D\uDCCB Копировать</button>' + '<button class="btn btn-sm btn-secondary" onclick="savePermissionTemplate()" title="Сохранить текущие права как шаблон">\uD83D\uDCBE Шаблон</button>' + '<button class="btn btn-sm btn-secondary" onclick="applyPermissionTemplate()" title="Применить шаблон прав">\uD83D\uDCC2 Применить</button>' + '</div>';
    Object.keys(PERMISSION_GROUPS).forEach(function (group) {
        html += '<div class="perm-group-card" data-group="' + group + '" style="background:var(--bg3);border-radius:10px;padding:10px 12px;border:1px solid var(--border)">' + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' + '<div style="font-weight:700;font-size:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.3px">' + group + '</div>' + '<div style="display:flex;gap:4px">' + '<span onclick="selectAllInGroup(\'' + group + '\',true)" style="cursor:pointer;font-size:11px;color:var(--text-muted);padding:2px 6px;border-radius:4px;background:var(--bg2)">\u2713 все</span>' + '<span onclick="selectAllInGroup(\'' + group + '\',false)" style="cursor:pointer;font-size:11px;color:var(--text-muted);padding:2px 6px;border-radius:4px;background:var(--bg2)">\u2715 нет</span>' + '</div></div>';
        PERMISSION_GROUPS[group].forEach(function (key) {
            html += '<label class="perm-item" data-key="' + key + '" style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;padding:2px 0">' + '<input type="checkbox" data-perm="' + key + '" ' + (perms[key] ? 'checked' : '') + ' onchange="savePermission(this)"> ' + (PERMISSION_LABELS[key] || key) + '</label>';
        });
        html += '</div>';
    });
    html += '<div style="grid-column:1/-1;background:var(--bg3);border-radius:10px;padding:10px 12px;border:1px solid var(--border)">' + '<div style="font-weight:700;font-size:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.3px;margin-bottom:6px">Параметры кассира</div>' + '<div style="display:flex;align-items:center;gap:8px">' + '<label style="font-size:13px">Макс. ручная скидка (%)</label>' + '<select id="cashier-max-discount" style="padding:4px 8px;border:1px solid var(--border);border-radius:6px;font-size:13px;background:var(--bg2)" onchange="saveCashierMaxDiscount(this.value)">' + [
        0,
        5,
        10,
        15,
        20,
        25
    ].map(function (v) {
        return '<option value="' + v + '" ' + (maxDisc === v ? 'selected' : '') + '>' + v + '%</option>';
    }).join('') + '</select></div></div>';
    container.innerHTML = html;
}

function savePermission(cb) {
    _setPerm(cb.dataset.perm, cb.checked);
    var uid = _permUserId();
    if (uid) {
        addAuditLog('Изменены права', 'Пользователю ' + uid + ': ' + cb.dataset.perm + ' = ' + cb.checked, '\uD83D\uDD11');
    }
}

function saveCashierMaxDiscount(val) {
    var userId = document.getElementById('cashier-edit-id').value;
    if (!userId) {
        setStore('_pendingMaxDisc', parseInt(val) || 0);
        return;
    }
    var data = getUserData(userId);
    data.maxDiscount = parseInt(val) || 0;
    setUserPermissions(userId, data);
    toast('Макс. скидка: ' + val + '%', 'ok');
}

function selectAllPermissions() {
    Object.keys(DEFAULT_PERMISSIONS).forEach(function (k) {
        _setPerm(k, true);
    });
    renderPermissionsEditor(_permUserId());
    toast('Все права выбраны', 'ok');
}

function deselectAllPermissions() {
    Object.keys(DEFAULT_PERMISSIONS).forEach(function (k) {
        _setPerm(k, false);
    });
    renderPermissionsEditor(_permUserId());
    toast('Все права сняты', 'ok');
}

function filterPermissions(query) {
    document.querySelectorAll('.perm-item').forEach(function (el) {
        var key = el.getAttribute('data-key');
        var label = PERMISSION_LABELS[key] || key;
        if (!query || label.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
            el.style.display = 'flex';
        } else {
            el.style.display = 'none';
        }
    });
}

function copyPermissionsFromUser() {
    var users = getAllUsers().filter(function (u) {
        return u.id !== currentUser.id && u.role !== 'admin';
    });
    if (!users.length) {
        toast('Нет других пользователей', 'err');
        return;
    }
    var list = users.map(function (u) {
        return '<div onclick="applyCopiedPermissions(\'' + u.id + '\')" style="padding:6px 10px;cursor:pointer;border-bottom:1px solid var(--border)">' + esc(u.name) + ' (' + esc(u.role) + ')</div>';
    }).join('');
    showCustomModal('Выберите пользователя для копирования прав', '<div style="max-height:300px;overflow-y:auto">' + list + '</div>');
}

function applyCopiedPermissions(sourceUserId) {
    closeModal('modal-custom');
    var data = getUserData(sourceUserId);
    var targetId = _permUserId();
    if (!targetId) {
        setStore('_pendingPerms', Object.assign({}, data.permissions));
        renderPermissionsEditor(null);
        toast('Права скопированы (будут применены при создании)', 'ok');
        return;
    }
    setUserPermissions(targetId, data);
    renderPermissionsEditor(targetId);
    toast('Права скопированы', 'ok');
}

function savePermissionTemplate() {
    var uid = _permUserId();
    var perms = uid ? getUserData(uid).permissions : _pendingPerms || DEFAULT_PERMISSIONS;
    var name = prompt('Название шаблона:');
    if (!name)
        return;
    try {
        var templates = JSON.parse(localStorage.getItem('sanaq_perm_templates_' + (currentStoreId || '')) || '[]');
        templates.push({
            name: name,
            permissions: perms,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('sanaq_perm_templates_' + (currentStoreId || ''), JSON.stringify(templates));
        toast('Шаблон "' + name + '" сохранён', 'ok');
    } catch (e) {
        toast('Ошибка сохранения шаблона', 'err');
    }
}

function applyPermissionTemplate() {
    try {
        var templates = JSON.parse(localStorage.getItem('sanaq_perm_templates_' + (currentStoreId || '')) || '[]');
        if (!templates.length) {
            toast('Нет сохранённых шаблонов', 'err');
            return;
        }
        var list = templates.map(function (t, i) {
            return '<div onclick="applyTemplateIndex(' + i + ')" style="padding:6px 10px;cursor:pointer;border-bottom:1px solid var(--border)">' + esc(t.name) + '</div>';
        }).join('');
        showCustomModal('Выберите шаблон', '<div style="max-height:300px;overflow-y:auto">' + list + '</div>');
    } catch (e) {
        toast('Ошибка загрузки шаблонов', 'err');
    }
}

function openCashierSwitch() {
    var users = getAllUsers();
    var container = document.getElementById('cashier-switch-list');
    container.innerHTML = '<div style="margin-bottom:12px;font-size:13px;color:var(--text-secondary)">Выберите пользователя для входа</div>' + users.filter(function (u) {
        return u.active !== false;
    }).map(function (u) {
        var initial = (u.name || '\u2014')[0].toUpperCase();
        var hasPin = getUserPin(u.id) ? '<span class="pin-badge">\uD83D\uDD10 PIN</span>' : '';
        var isCurrent = currentUser && currentUser.id === u.id;
        return '<div class="cashier-switch-item" onclick="' + (isCurrent ? '' : 'switchToUser(\'' + u.id + '\')') + '" style="' + (isCurrent ? 'opacity:0.6' : '') + '">' + '<div class="avatar">' + esc(initial) + '</div>' + '<div class="info"><div class="name">' + esc(u.name || '\u2014') + (isCurrent ? ' <span style="font-size:11px;color:var(--text-muted)">(текущий)</span>' : '') + '</div><div class="role">' + esc(u.role || '\u2014') + '</div></div>' + hasPin + '</div>';
    }).join('');
    openModal('modal-cashier-switch');
}

function switchToUser(userId) {
    var users = getAllUsers();
    var target = users.find(function (u) {
        return u.id === userId;
    });
    if (!target) {
        toast('Пользователь не найден', 'err');
        return;
    }
    var userPin = getUserPin(userId);
    if (userPin) {
        _pendingSwitchUserId = userId;
        document.getElementById('pin-login-user-info').querySelector('#pin-login-avatar').textContent = (target.name || '\u2014')[0];
        document.getElementById('pin-login-name').textContent = target.name || '\u2014';
        document.getElementById('pin-login-code').value = '';
        document.getElementById('pin-login-error').style.display = 'none';
        closeModal('modal-cashier-switch');
        openModal('modal-pin-login');
        setTimeout(function () {
            document.getElementById('pin-login-code').focus();
        }, 100);
    } else {
        doSwitchUser(target);
    }
}



set('getOpenShiftForCashier', getOpenShiftForCashier);
set('checkPermission', checkPermission);
set('requireAdminPin', requireAdminPin);
set('isAdmin', isAdmin);
set('getUserMaxDiscount', getUserMaxDiscount);
set('_permUserId', _permUserId);
set('getUserData', getUserData);
set('setUserPermissions', setUserPermissions);
set('renderPermissionsEditor', renderPermissionsEditor);
set('doSwitchUser', doSwitchUser);
set('_findUserAnywhere', _findUserAnywhere);
export { currentUser, setCurrentUser, getUsers, setUsers, getCashiers, getOpenShiftForCashier, getCashierShare, renderCashierStats, renderCashiersPage, renderCashiersTable, _localUsersKey, getLocalUsers, setLocalUsers, getAllUsers, getUserData, getUserPermissions, getUserMaxDiscount, setUserPermissions, _permUserId, _pendingSwitchUserId, _findUserAnywhere, doSwitchUser, openInviteCashierModal, isAdmin, hasGroupPermission, posCashierName, requireAdminPin, verifyAdminPin, saveCashierShare, exportCashiersExcel, switchCashiersTab, fillAdminProfileForm, saveAdminProfile, openCashierModal, editCashierAccount, saveCashier, checkPermission, renderPermissionsEditor, savePermission, saveCashierMaxDiscount, selectAllPermissions, deselectAllPermissions, filterPermissions, copyPermissionsFromUser, applyCopiedPermissions, savePermissionTemplate, applyPermissionTemplate, openCashierSwitch, switchToUser };
