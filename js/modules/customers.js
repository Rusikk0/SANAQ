import { isAdmin, checkPermission } from './users.js';
import { openModal, uid } from './ui.js';
import { toast } from './notifications.js';
import { closeModal, confirmAction, fmt, tableHTML } from './utils.js';
import { getSales, isSaleActive, groupSalesIntoReceipts, openReceipt } from './sales.js';
import { renderSaleCart } from './cart.js';


function getCustomers() {
    return window.ApDb ? window.ApDb.getCustomers() : [];
}

function setCustomers(arr) {
    if (window.ApDb)
        window.ApDb.setCustomers(arr);
}

function getCustomerTier(spent) {
    if (spent >= 100000)
        return {
            name: 'VIP',
            discount: 0.08,
            bonusEarn: 0.01,
            maxSpend: 0.5
        };
    if (spent >= 50000)
        return {
            name: 'Gold',
            discount: 0.03,
            bonusEarn: 0.01,
            maxSpend: 0.3
        };
    if (spent >= 25000)
        return {
            name: 'Silver',
            discount: 0.01,
            bonusEarn: 0.01,
            maxSpend: 0.2
        };
    return {
        name: 'Bronze',
        discount: 0,
        bonusEarn: 0.01,
        maxSpend: 0.1
    };
}

function findCustomerByPhone(phone) {
    const p = (phone || '').replace(/\D/g, '');
    if (!p)
        return null;
    return getCustomers().find(function (c) {
        return (c.phone || '').replace(/\D/g, '') === p;
    });
}

let currentCustomer = null;




function openCustomerModal(id) {
    if (!isAdmin())
        return;
    document.getElementById('customer-edit-id').value = id || '';
    document.getElementById('modal-customer-title').textContent = id ? 'Редактировать клиента' : 'Новый клиент';
    if (id) {
        const c = getCustomers().find(function (x) {
            return x.id === id;
        });
        if (c) {
            document.getElementById('customer-phone').value = c.phone || '';
            document.getElementById('customer-name').value = c.name || '';
        }
    } else {
        document.getElementById('customer-phone').value = '';
        document.getElementById('customer-name').value = '';
    }
    openModal('modal-customer');
}

function saveCustomer() {
    const editId = document.getElementById('customer-edit-id').value || '';
    if (editId && !checkPermission('editCustomer')) {
        toast('Нет прав на редактирование клиентов', 'err');
        return;
    }
    if (!editId && !checkPermission('addCustomer')) {
        toast('Нет прав на добавление клиентов', 'err');
        return;
    }
    const phone = (document.getElementById('customer-phone').value || '').trim();
    const name = (document.getElementById('customer-name').value || '').trim();
    if (!phone) {
        toast('Введите телефон/ID', 'err');
        return;
    }
    if (!name) {
        toast('Введите имя', 'err');
        return;
    }
    let list = getCustomers();
    const normalized = phone.replace(/\D/g, '');
    const dup = list.find(function (c) {
        return c.id !== editId && (c.phone || '').replace(/\D/g, '') === normalized;
    });
    if (dup) {
        toast('Клиент с таким телефоном уже есть', 'err');
        return;
    }
    if (editId) {
        list = list.map(function (c) {
            if (c.id !== editId)
                return c;
            return Object.assign({}, c, {
                phone: phone,
                name: name
            });
        });
        toast('Клиент обновлён', 'ok');
    } else {
        list.push({
            id: uid(),
            phone: phone,
            name: name,
            spent: 0,
            bonusBalance: 0
        });
        toast('Клиент создан', 'ok');
    }
    setCustomers(list);
    closeModal('modal-customer');
    renderCustomers();
}

function openCustomerHistory(customerId) {
    const c = getCustomers().find(function (x) {
        return x.id === customerId;
    });
    if (!c) {
        toast('Клиент не найден', 'err');
        return;
    }
    const sales = getSales().filter(function (s) {
        return isSaleActive(s) && s.customerId === customerId;
    });
    const receipts = groupSalesIntoReceipts(sales);
    if (!receipts.length) {
        toast('У клиента нет покупок', 'warn');
        return;
    }
    openReceipt(receipts[0].id);
    document.getElementById('receipt-title').textContent = 'Покупки клиента: ' + c.name + ' (' + c.phone + ')';
}

function deleteCustomer(id) {
    if (!checkPermission('deleteCustomer')) {
        toast('Нет прав на удаление клиентов', 'err');
        return;
    }
    var c = getCustomers().find(function (x) {
        return x.id === id;
    });
    confirmAction('Удалить клиента', 'Клиент \xAB' + (c ? c.name : '') + '\xBB будет удалён безвозвратно.', function () {
        setCustomers(getCustomers().filter(function (x) {
            return x.id !== id;
        }));
        renderCustomers();
        toast('Клиент удалён', 'ok');
    });
}

function renderCustomers() {
    if (!document.getElementById('page-cards'))
        return;
    const term = (document.getElementById('customer-search').value || '').toLowerCase();
    const tierFilter = (document.getElementById('customer-tier').value || '').trim();
    let list = getCustomers().slice();
    if (term) {
        list = list.filter(function (c) {
            return (c.name || '').toLowerCase().includes(term) || (c.phone || '').toLowerCase().includes(term);
        });
    }
    if (tierFilter) {
        list = list.filter(function (c) {
            return getCustomerTier(Number(c.spent) || 0).name === tierFilter;
        });
    }
    list.sort(function (a, b) {
        return (a.name || '').localeCompare(b.name || '', 'ru', { sensitivity: 'base' });
    });
    const rows = list.map(function (c) {
        const tier = getCustomerTier(Number(c.spent) || 0);
        var actions = '<div class="actions">' + '<button class="btn btn-sm btn-secondary" onclick="openCustomerHistory(\'' + c.id + '\')">История</button> ';
        if (checkPermission('editCustomer')) {
            actions += '<button class="btn btn-sm btn-secondary" onclick="openCustomerModal(\'' + c.id + '\')">\u270F️</button>';
        }
        if (checkPermission('deleteCustomer')) {
            actions += '<button class="btn btn-sm btn-danger" onclick="deleteCustomer(\'' + c.id + '\')" style="color:var(--err);background:none;border:none;cursor:pointer;font-size:16px" title="Удалить">\u2715</button>';
        }
        actions += '</div>';
        return [
            c.name,
            c.phone,
            '<span class="badge badge-info">' + tier.name + '</span>',
            fmt(Number(c.spent) || 0),
            fmt(Number(c.bonusBalance) || 0),
            actions
        ];
    });
    document.getElementById('customers-table').innerHTML = rows.length ? tableHTML([
        'Имя',
        'Телефон',
        'Уровень',
        'Покупок (\u20B8)',
        'Бонусы (\u20B8)',
        ''
    ], rows) : '<div class="empty">Клиенты не найдены</div>';
}

function findCustomer() {
    const search = document.getElementById('sale-customer-search').value.trim();
    if (!search || search.length < 10) {
        toast('Введите корректный номер', 'err');
        return;
    }
    let customer = findCustomerByPhone(search);
    const nameInput = document.getElementById('sale-customer-name');
    if (customer) {
        currentCustomer = customer;
        nameInput.style.display = 'none';
        toast('Клиент найден: ' + customer.name, 'ok');
    } else {
        if (nameInput.style.display === 'none') {
            nameInput.style.display = 'block';
            toast('Клиент не найден. Введите имя для создания.', 'warn');
            return;
        }
        const name = nameInput.value.trim();
        if (!name) {
            toast('Введите имя клиента', 'err');
            return;
        }
        customer = {
            id: uid(),
            phone: search,
            name: name,
            spent: 0,
            bonusBalance: 0
        };
        const list = getCustomers();
        list.push(customer);
        setCustomers(list);
        currentCustomer = customer;
        nameInput.style.display = 'none';
        toast('Клиент создан', 'ok');
    }
    renderSaleCart();
}



export { getCustomers, setCustomers, getCustomerTier, findCustomerByPhone, currentCustomer, openCustomerModal, saveCustomer, openCustomerHistory, deleteCustomer, renderCustomers, findCustomer };
