import { isAdmin, checkPermission, currentUser } from './users.js';
import { fmt, tableHTML, fmtDate, closeModal, confirmAction, todayStr } from './utils.js';
import { set } from './app-context.js';
import { expenseStatusBadge, renderStatistics } from './statistics.js';
import { openModal, uid, renderDashboard } from './ui.js';
import { toast } from './notifications.js';
import { exportSectionToExcel } from './reports.js';


function getExpenses() {
    return window.ApDb ? window.ApDb.getExpenses() : [];
}

function setExpenses(arr) {
    if (window.ApDb)
        window.ApDb.setExpenses(arr);
}

function isExpenseActive(e) {
    return !e.status || e.status === 'active';
}

function adminCancelExpenseBtn(e) {
    if (!isAdmin() || !isExpenseActive(e))
        return '\u2014';
    return '<button class="btn btn-sm btn-danger" onclick="cancelExpenseConfirm(\'' + e.id + '\')">Отменить</button>';
}

function renderExpenses() {
    const list = getExpenses().slice().reverse();
    const total = list.filter(isExpenseActive).reduce(function (s, e) {
        return s + e.amount;
    }, 0);
    document.getElementById('expenses-total-label').textContent = 'Учтено расходов: ' + fmt(total);
    const cols = [
        'Категория',
        'Сумма',
        'Примечание',
        'Кто',
        'Дата',
        'Статус'
    ];
    if (isAdmin())
        cols.push('');
    document.getElementById('expenses-table').innerHTML = list.length ? tableHTML(cols, list.map(function (e) {
        const sumStyle = isExpenseActive(e) ? 'color:var(--err);font-weight:600' : 'color:var(--text-muted);text-decoration:line-through';
        const row = [
            '<span class="badge badge-warn">' + e.category + '</span>',
            '<span style="' + sumStyle + '">-' + fmt(e.amount) + '</span>',
            e.note || '\u2014',
            e.userName || '\u2014',
            fmtDate(e.date),
            expenseStatusBadge(e)
        ];
        if (isAdmin())
            row.push(adminCancelExpenseBtn(e));
        return row;
    })) : '<div class="empty">Расходов пока нет</div>';
}

function openExpenseModal() {
    document.getElementById('expense-amount').value = '';
    document.getElementById('expense-note').value = '';
    openModal('modal-expense');
}

function saveExpense() {
    if (!checkPermission('viewStatistics')) {
        toast('Нет доступа к расходам', 'err');
        return;
    }
    const category = document.getElementById('expense-category').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const note = document.getElementById('expense-note').value.trim();
    if (isNaN(amount) || amount <= 0) {
        toast('Введите сумму расхода', 'err');
        return;
    }
    const list = getExpenses();
    list.push({
        id: uid(),
        category: category,
        amount: amount,
        note: note,
        userName: currentUser.name,
        date: new Date().toISOString(),
        status: 'active'
    });
    setExpenses(list);
    closeModal('modal-expense');
    toast('Расход добавлен', 'ok');
    renderExpenses();
    renderDashboard();
    if (document.getElementById('page-statistics').classList.contains('active'))
        renderStatistics();
}

function cancelExpenseConfirm(id) {
    if (!checkPermission('viewStatistics')) {
        toast('Нет доступа', 'err');
        return;
    }
    const expense = getExpenses().find(function (e) {
        return e.id === id;
    });
    if (!expense || !isExpenseActive(expense)) {
        toast('Расход уже отменён', 'err');
        return;
    }
    confirmAction('Отменить расход?', 'Расход \xAB' + expense.category + '\xBB на сумму ' + fmt(expense.amount) + ' не будет учтён в статистике.', function () {
        cancelExpense(id);
    });
}

function cancelExpense(id) {
    const list = getExpenses().map(function (e) {
        if (e.id !== id)
            return e;
        if (!isExpenseActive(e))
            return e;
        return Object.assign({}, e, {
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            cancelledBy: currentUser.name
        });
    });
    setExpenses(list);
    toast('Расход отменён', 'ok');
    renderExpenses();
    renderDashboard();
    if (document.getElementById('page-statistics').classList.contains('active'))
        renderStatistics();
}

function exportExpensesExcel() {
    exportSectionToExcel('expenses', getExpenses().filter(isExpenseActive), 'SANAQ_Расходы_' + todayStr() + '.xlsx');
}



set('isExpenseActive', isExpenseActive);
export { getExpenses, setExpenses, isExpenseActive, adminCancelExpenseBtn, renderExpenses, openExpenseModal, saveExpense, cancelExpenseConfirm, cancelExpense, exportExpensesExcel };
