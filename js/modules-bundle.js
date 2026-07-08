// SANAQ modules bundle (file:// compatible)
(function(){'use strict';var __mod={};
function __mf(m,n){return function(){var f=__mod[m]&&__mod[m][n];return f?f.apply(this,arguments):void 0;}}
function __mv(m,n){return new Proxy({},{get:function(_,p){var o=__mod[m]&&__mod[m][n];return o?o[p]:void 0;}});}

// app-context
__mod['app-context']=(function(){
var _services = {};
var _state = {};
var _stateGetters = {};

function set(name, service) {
    _services[name] = service;
}

function get(name) {
    return _services[name] || null;
}

function setState(name, value) {
    _state[name] = value;
}

function getState(name) {
    return _state[name];
}

function syncState(targetName, sourceModule, sourceName) {
    _stateGetters[targetName] = function () { return sourceModule[sourceName || targetName]; };
}

function pullState(name) {
    if (_stateGetters[name]) {
        _state[name] = _stateGetters[name]();
    }
    return _state[name];
}

function refreshAllState() {
    Object.keys(_stateGetters).forEach(function (k) {
        _state[k] = _stateGetters[k]();
    });
}

function requireNow(name) {
    var s = _services[name];
    if (!s) throw new Error('Service not registered: ' + name);
    return s;
}

var _ex={};
return _ex;})();

// constants
__mod['constants']=(function(){
const ROLE_LABELS = {
    admin: 'Администратор',
    cashier: 'Кассир'
};

var CODE39 = {
    '0': 'nnnwwnwnn',
    '1': 'wnnwnnnnw',
    '2': 'nnwwnnnnw',
    '3': 'wnnwwnnnw',
    '4': 'wnnnnwnnw',
    '5': 'nwnnwnnnw',
    '6': 'nnnwnwnnw',
    '7': 'wnnnwnnnw',
    '8': 'nnwnnwnnw',
    '9': 'nwnnnwnnw',
    'A': 'wnnnnwnwn',
    'B': 'nnwnnwnwn',
    'C': 'wnnwwnnnn',
    'D': 'nnnnwwnwn',
    'E': 'nwnnwwnnn',
    'F': 'nnnnnwwnw',
    'G': 'wnnnnwwnn',
    'H': 'nwnnnwwnn',
    'I': 'nnnwnwwnn',
    'J': 'nnnnnwwnw',
    'K': 'wnnnnnnww',
    'L': 'nnwwnnnnw',
    'M': 'wnnwnnnnw',
    'N': 'nnnnwnnww',
    'O': 'nnnnwwnwn',
    'P': 'wwnnnnnnw',
    'Q': 'nnnnnwwnw',
    'R': 'nnnnwwnwn',
    'S': 'nwnnnnwnw',
    'T': 'nnnnwnnww',
    'U': 'wwnnnnnwn',
    'V': 'nnwnnwnnw',
    'W': 'wnnwnnwnn',
    'X': 'nnnwnwnnw',
    'Y': 'nwnnnnwnw',
    'Z': 'nnwwnnnnw',
    '-': 'nnnnnwnww',
    '.': 'wnnnnwnnw',
    ' ': 'nnnnnwwnw',
    '$': 'nnnwnwnnw',
    '/': 'nwnnnnwnw',
    '+': 'nnnnnwwnw',
    '%': 'wnnwnnnwn',
    '*': 'nnnwnnwnn'
};

var EAN_L = [
    '0001101',
    '0011001',
    '0010011',
    '0111101',
    '0100011',
    '0110001',
    '0101111',
    '0111011',
    '0110111',
    '0001011'
];

var EAN_R = [
    '1110010',
    '1100110',
    '1101100',
    '1000010',
    '1011100',
    '1001110',
    '1010000',
    '1000100',
    '1001000',
    '1110100'
];

var EAN_G = [
    '0100111',
    '0110011',
    '0011011',
    '0100001',
    '0011101',
    '0111001',
    '0000101',
    '0010001',
    '0001001',
    '0010111'
];

var EAN_PARITY = [
    'LLLLLL',
    'LLGLGG',
    'LLGGLG',
    'LLGGGL',
    'LGLLGG',
    'LGGLLG',
    'LGGGLL',
    'LGLGLG',
    'LGLGGL',
    'LGGLGL'
];

var SCAN_MAX_GAP = 45;

var EXCEL_SECTIONS = {
    products: {
        label: 'Товары',
        headers: [
            'Штрихкод',
            'Артикул',
            'Наименование',
            'Категория',
            'Единица измерения',
            'Закупочная цена',
            'Цена продажи',
            'Остаток на складе',
            'Минимальный остаток',
            'Поставщик',
            'Описание',
            'Статус'
        ],
        fields: [
            'barcode',
            'code',
            'name',
            '_categoryName',
            'unit',
            'purchasePrice',
            'price',
            'quantity',
            'minStock',
            'supplier',
            'description',
            '_status'
        ],
        widths: [
            18,
            14,
            42,
            20,
            10,
            14,
            14,
            12,
            12,
            22,
            30,
            12
        ],
        numFmt: [
            's',
            's',
            's',
            's',
            's',
            '#,##0',
            '#,##0',
            '#,##0',
            '#,##0',
            's',
            's',
            's'
        ],
        required: [
            'barcode',
            'code',
            'name'
        ],
        dataKey: 'productData'
    },
    sales: {
        label: 'Продажи',
        headers: [
            'Номер документа',
            'Дата',
            'Клиент',
            'Товар',
            'Количество',
            'Цена',
            'Сумма',
            'Способ оплаты',
            'Кассир',
            'Статус'
        ],
        fields: [
            '_docNum',
            'date',
            '_customerName',
            'productName',
            'quantity',
            'unitPrice',
            'total',
            '_paymentLabel',
            'userName',
            '_saleStatus'
        ],
        widths: [
            16,
            18,
            24,
            42,
            10,
            14,
            16,
            18,
            20,
            14
        ],
        numFmt: [
            's',
            'dd.mm.yyyy hh:mm',
            's',
            's',
            '#,##0',
            '#,##0',
            '#,##0',
            's',
            's',
            's'
        ],
        required: [
            'productName',
            'quantity',
            'total'
        ],
        dataKey: 'saleData'
    },
    documents: {
        label: 'Документы продаж',
        headers: [
            'Номер',
            'Тип',
            'Дата',
            'Клиент',
            'Телефон',
            'Сумма',
            'Статус',
            'Создатель'
        ],
        fields: [
            'docNumber',
            '_docType',
            'documentDate',
            'customerName',
            'customerPhone',
            'total',
            '_docStatus',
            '_createdByName'
        ],
        widths: [
            14,
            16,
            18,
            30,
            18,
            16,
            14,
            22
        ],
        numFmt: [
            's',
            's',
            'dd.mm.yyyy',
            's',
            's',
            '#,##0',
            's',
            's'
        ],
        required: [
            'customerName',
            'total'
        ],
        dataKey: 'documentData'
    },
    expenses: {
        label: 'Расходы',
        headers: [
            'Категория',
            'Сумма',
            'Дата',
            'Описание',
            'Кем создан',
            'Статус'
        ],
        fields: [
            'category',
            'amount',
            'date',
            'description',
            'userName',
            '_expenseStatus'
        ],
        widths: [
            22,
            16,
            18,
            40,
            22,
            14
        ],
        numFmt: [
            's',
            '#,##0',
            'dd.mm.yyyy',
            's',
            's',
            's'
        ],
        required: [
            'category',
            'amount'
        ],
        dataKey: 'expenseData'
    },
    customers: {
        label: 'Клиенты',
        headers: [
            'Имя',
            'Телефон',
            'Уровень',
            'Сумма покупок',
            'Бонусы',
            'Последняя покупка',
            'Дата регистрации'
        ],
        fields: [
            'name',
            'phone',
            '_tierName',
            'spent',
            'bonusBalance',
            '_lastPurchase',
            'createdAt'
        ],
        widths: [
            24,
            18,
            14,
            18,
            14,
            20,
            18
        ],
        numFmt: [
            's',
            's',
            's',
            '#,##0',
            '#,##0',
            'dd.mm.yyyy',
            'dd.mm.yyyy'
        ],
        required: [
            'name',
            'phone'
        ],
        dataKey: 'customerData'
    },
    debts: {
        label: 'Долги',
        headers: [
            'Должник',
            'Телефон',
            'Рейтинг',
            'Товар',
            'Количество',
            'Сумма',
            'Кассир',
            'Дата возврата',
            'Статус',
            'Примечание',
            'Дата создания'
        ],
        fields: [
            'debtorName',
            '_debtorPhone',
            '_debtorRating',
            'productName',
            'quantity',
            'amount',
            'cashierName',
            'dueDate',
            'status',
            'note',
            'date'
        ],
        widths: [
            22,
            18,
            10,
            34,
            10,
            16,
            18,
            16,
            12,
            30,
            18
        ],
        numFmt: [
            's',
            's',
            's',
            's',
            '#,##0',
            '#,##0',
            's',
            'dd.mm.yyyy',
            's',
            's',
            'dd.mm.yyyy'
        ],
        required: [
            'debtorName',
            'amount'
        ],
        dataKey: 'debtData'
    },
    deferred: {
        label: 'Отложенные',
        headers: [
            'Клиент',
            'Телефон',
            'Товар',
            'Количество',
            'Цена',
            'Сумма',
            'Кассир',
            'Дата',
            'Статус',
            'Примечание'
        ],
        fields: [
            'customerName',
            'customerPhone',
            'productName',
            'quantity',
            'unitPrice',
            'total',
            'cashierName',
            'date',
            'status',
            'note'
        ],
        widths: [
            24,
            18,
            40,
            10,
            14,
            16,
            20,
            18,
            14,
            30
        ],
        numFmt: [
            's',
            's',
            's',
            '#,##0',
            '#,##0',
            '#,##0',
            's',
            'dd.mm.yyyy',
            's',
            's'
        ],
        required: [
            'customerName',
            'productName',
            'total'
        ],
        dataKey: 'deferredData'
    },
    shifts: {
        label: 'Смены',
        headers: [
            'Кассир',
            'Открыта',
            'Закрыта',
            'Продаж',
            'Выручка',
            'Себестоимость',
            'Прибыль'
        ],
        fields: [
            'cashier',
            'openedAt',
            'closedAt',
            'count',
            'revenue',
            'cogs',
            'profit'
        ],
        widths: [
            22,
            18,
            18,
            10,
            16,
            16,
            16
        ],
        numFmt: [
            's',
            'dd.mm.yyyy hh:mm',
            'dd.mm.yyyy hh:mm',
            '#,##0',
            '#,##0',
            '#,##0',
            '#,##0'
        ],
        required: [
            'cashier',
            'revenue'
        ],
        dataKey: 'shiftData'
    },
    cashiers: {
        label: 'Кассиры',
        headers: [
            'Кассир',
            'Смен',
            'Продаж',
            'Выручка',
            'Себестоимость',
            'Прибыль',
            'Доля от выручки'
        ],
        fields: [
            'name',
            'shifts',
            'sales',
            'revenue',
            'cogs',
            '_profit',
            '_share'
        ],
        widths: [
            22,
            10,
            10,
            16,
            16,
            16,
            16
        ],
        numFmt: [
            's',
            '#,##0',
            '#,##0',
            '#,##0',
            '#,##0',
            '#,##0',
            '#,##0'
        ],
        required: [
            'name',
            'revenue'
        ],
        dataKey: 'cashierData'
    }
};

var PAGE_PERMISSION_GROUP = {
    sales: 'Продажи',
    products: 'Товары',
    categories: 'Категории',
    cards: 'Клиенты',
    warehouse: 'Склад',
    statistics: 'Статистика',
    debts: 'Долги',
    cashiers: 'Настройки',
    promotions: 'Товары',
    audits: 'Склад',
    expenses: 'Статистика',
    deferred: 'Продажи',
    documents: 'Продажи'
};

var DEFAULT_PERMISSIONS = {
    viewSales: true,
    viewReceiptHistory: true,
    searchReceipts: true,
    printReceipt: true,
    reprintReceipt: true,
    openCashDrawer: true,
    openShift: true,
    closeShift: true,
    cashIn: true,
    cashOut: true,
    viewCashOps: true,
    saleWithoutCustomer: true,
    saleOnCredit: false,
    refundMoney: false,
    useCustomerBonuses: true,
    accrueBonuses: false,
    canChangeQty: true,
    canChangePriceInSale: false,
    canAddUniversal: true,
    canManualItemDiscount: false,
    canManualCartDiscount: false,
    createSale: true,
    canReturn: true,
    canCancelReceipt: false,
    canDeferSale: true,
    canChangePayment: false,
    canMixedPayment: false,
    viewProducts: true,
    addProducts: false,
    editProducts: false,
    deleteProducts: false,
    changePrices: false,
    changeStock: false,
    importProducts: false, exportProducts: false, massChangePrices: false, massChangeCategories: false, massDelete: false, viewPurchasePrice: false, viewCostPrice: false, viewProductProfit: false, viewCategories: true, addCategory: false, editCategory: false, deleteCategory: false, viewCustomers: true, addCustomer: true, editCustomer: true, deleteCustomer: false, manageBonuses: false, viewPurchaseHistory: true, exportCustomers: false, viewWarehouse: true, receiveStock: false, writeOffStock: false, inventory: false, transferStock: false, viewPurchasePrices: false, viewStatistics: false, viewProfit: false, viewExpenses: false, viewRevenue: false, viewProductAnalytics: false, viewCashierAnalytics: false, viewCustomerAnalytics: false, viewDebts: true, createDebt: true, editDebt: true, closeDebt: true, deleteDebt: false, changeSettings: false, manageUsers: false, manageRoles: false, managePermissions: false, exportData: true,
    importData: false, backupData: false, restoreData: false, clearData: false };  var PERMISSION_GROUPS = { 'Продажи': [ 'viewSales', 'viewReceiptHistory', 'searchReceipts', 'printReceipt', 'reprintReceipt', 'openCashDrawer', 'openShift', 'closeShift', 'cashIn', 'cashOut', 'viewCashOps', 'saleWithoutCustomer', 'saleOnCredit', 'refundMoney', 'useCustomerBonuses', 'accrueBonuses', 'canChangeQty', 'canChangePriceInSale', 'canAddUniversal', 'canManualItemDiscount', 'canManualCartDiscount', 'createSale', 'canReturn', 'canCancelReceipt', 'canDeferSale', 'canChangePayment', 'canMixedPayment' ], 'Товары': [ 'viewProducts', 'addProducts', 'editProducts', 'deleteProducts', 'changePrices', 'changeStock', 'importProducts', 'exportProducts', 'massChangePrices', 'massChangeCategories', 'massDelete', 'viewPurchasePrice', 'viewCostPrice', 'viewProductProfit' ], 'Категории': [ 'viewCategories', 'addCategory', 'editCategory', 'deleteCategory' ], 'Клиенты': [ 'viewCustomers', 'addCustomer', 'editCustomer', 'deleteCustomer', 'manageBonuses', 'viewPurchaseHistory', 'exportCustomers' ], 'Склад': [ 'viewWarehouse', 'receiveStock', 'writeOffStock', 'inventory', 'transferStock', 'viewPurchasePrices' ], 'Статистика': [ 'viewStatistics', 'viewProfit', 'viewExpenses', 'viewRevenue', 'viewProductAnalytics', 'viewCashierAnalytics', 'viewCustomerAnalytics' ], 'Долги': [ 'viewDebts', 'createDebt', 'editDebt', 'closeDebt', 'deleteDebt' ], 'Настройки': [ 'changeSettings', 'manageUsers', 'manageRoles', 'managePermissions', 'exportData', 'importData', 'backupData', 'restoreData', 'clearData' ] };  var PERMISSION_LABELS = { viewSales: 'Просмотр продаж', viewReceiptHistory: 'Просмотр истории чеков', searchReceipts: 'Поиск чеков', printReceipt: 'Печать чека', reprintReceipt: 'Повторная печать чека', openCashDrawer: 'Открытие денежного ящика', openShift: 'Открытие смены', closeShift: 'Закрытие смены', cashIn: 'Внесение денег', cashOut: 'Изъятие денег', viewCashOps: 'Просмотр кассовых операций', saleWithoutCustomer: 'Продажа без клиента', saleOnCredit: 'Продажа в долг', refundMoney: 'Возврат денег', useCustomerBonuses: 'Использование бонусов', accrueBonuses: 'Начисление бонусов', canChangeQty: 'Изменение кол-ва', canChangePriceInSale: 'Изменение цены при продаже', canAddUniversal: 'Универсальный товар', canManualItemDiscount: 'Ручная скидка на товар', canManualCartDiscount: 'Ручная скидка на корзину', createSale: 'Создание продажи', canReturn: 'Возврат товара', canCancelReceipt: 'Отмена чека', canDeferSale: 'Отложенная продажа', canChangePayment: 'Изменить способ оплаты', canMixedPayment: 'Смешанная оплата', viewProducts: 'Просмотр товаров', addProducts: 'Добавление товаров', editProducts: 'Редактирование товаров', deleteProducts: 'Удаление товаров', changePrices: 'Изменение цен', changeStock: 'Изменение остатков',
    importProducts: 'Импорт товаров', exportProducts: 'Экспорт товаров', massChangePrices: 'Массовое изменение цен', massChangeCategories: 'Массовое изменение категорий', massDelete: 'Массовое удаление', viewPurchasePrice: 'Просмотр закупочной цены', viewCostPrice: 'Просмотр себестоимости', viewProductProfit: 'Просмотр прибыли по товару', viewCategories: 'Просмотр категорий', addCategory: 'Добавление категорий', editCategory: 'Редактирование категорий', deleteCategory: 'Удаление категорий', viewCustomers: 'Просмотр клиентов', addCustomer: 'Добавление клиентов', editCustomer: 'Редактирование клиентов', deleteCustomer: 'Удаление клиентов', manageBonuses: 'Управление бонусами', viewPurchaseHistory: 'История покупок', exportCustomers: 'Экспорт клиентов', viewWarehouse: 'Просмотр склада', receiveStock: 'Приход товара', writeOffStock: 'Списание товара', inventory: 'Инвентаризация', transferStock: 'Перемещение товаров', viewPurchasePrices: 'Просмотр закупочных цен', viewStatistics: 'Просмотр статистики', viewProfit: 'Просмотр прибыли', viewExpenses: 'Просмотр расходов', viewRevenue: 'Просмотр выручки', viewProductAnalytics: 'Аналитика по товарам', viewCashierAnalytics: 'Аналитика по кассирам', viewCustomerAnalytics: 'Аналитика по клиентам', viewDebts: 'Просмотр долгов', createDebt: 'Создание долга', editDebt: 'Редактирование долга', closeDebt: 'Закрытие долга', deleteDebt: 'Удаление долга', changeSettings: 'Изменение настроек', manageUsers: 'Управление пользователями', manageRoles: 'Управление ролями', managePermissions: 'Управление правами', exportData: 'Экспорт данных',
    importData: 'Импорт данных', backupData: 'Резервное копирование', restoreData: 'Восстановление базы', clearData: 'Очистка базы' };  export { ROLE_LABELS, CODE39, EAN_L, EAN_R, EAN_G, EAN_PARITY, SCAN_MAX_GAP, EXCEL_SECTIONS, PAGE_PERMISSION_GROUP, DEFAULT_PERMISSIONS, PERMISSION_GROUPS, PERMISSION_LABELS }; 
var _ex={};
try{_ex['ROLE_LABELS']=ROLE_LABELS}catch(e){}
try{_ex['CODE39']=CODE39}catch(e){}
try{_ex['EAN_L']=EAN_L}catch(e){}
try{_ex['EAN_R']=EAN_R}catch(e){}
try{_ex['EAN_G']=EAN_G}catch(e){}
try{_ex['EAN_PARITY']=EAN_PARITY}catch(e){}
try{_ex['SCAN_MAX_GAP']=SCAN_MAX_GAP}catch(e){}
try{_ex['EXCEL_SECTIONS']=EXCEL_SECTIONS}catch(e){}
try{_ex['PAGE_PERMISSION_GROUP']=PAGE_PERMISSION_GROUP}catch(e){}
try{_ex['DEFAULT_PERMISSIONS']=DEFAULT_PERMISSIONS}catch(e){}
try{_ex['PERMISSION_GROUPS']=PERMISSION_GROUPS}catch(e){}
try{_ex['PERMISSION_LABELS']=PERMISSION_LABELS}catch(e){}
return _ex;})();

// store
__mod['store']=(function(){
var DEFAULT_PERMISSIONS=__mod['constants']&&__mod['constants']['DEFAULT_PERMISSIONS'];


let currentStoreId = null;

let confirmCallback = null;

var scanBuffer = '';

var scanLastKey = 0;

var _catDragSrc = null;

var scannerTarget = null;

var scannerActive = false;

var scannerStream = null;

var scannerAnimFrame = null;

var _lastScanTime = 0;

var _scannerAutoClose = false;

var _scanLoopFn = null;

var _pendingPerms = null;

var _pendingMaxDisc = 0;

var _bulkSelected = new Set();

var _currentDocId = null;

var _currentReceiptId = null;

var _currentPrintReceiptId = null;

var _editingDocTemplateIdx = -1;

var _cashierStatsData = null;

var _shiftStatsData = null;

var _templateParentModal = '';

var _autoRefreshInterval = null;

function setStore(name, value) {
    switch (name) {
        case 'currentStoreId': currentStoreId = value; break;
        case 'confirmCallback': confirmCallback = value; break;
        case 'scanBuffer': scanBuffer = value; break;
        case 'scanLastKey': scanLastKey = value; break;
        case '_catDragSrc': _catDragSrc = value; break;
        case 'scannerTarget': scannerTarget = value; break;
        case 'scannerActive': scannerActive = value; break;
        case 'scannerStream': scannerStream = value; break;
        case 'scannerAnimFrame': scannerAnimFrame = value; break;
        case '_lastScanTime': _lastScanTime = value; break;
        case '_scannerAutoClose': _scannerAutoClose = value; break;
        case '_scanLoopFn': _scanLoopFn = value; break;
        case '_pendingPerms': _pendingPerms = value; break;
        case '_pendingMaxDisc': _pendingMaxDisc = value; break;
    }
}


var _ex={};
try{_ex['currentStoreId']=currentStoreId}catch(e){}
try{_ex['confirmCallback']=confirmCallback}catch(e){}
try{_ex['scanBuffer']=scanBuffer}catch(e){}
try{_ex['scanLastKey']=scanLastKey}catch(e){}
try{_ex['_catDragSrc']=_catDragSrc}catch(e){}
try{_ex['scannerTarget']=scannerTarget}catch(e){}
try{_ex['scannerActive']=scannerActive}catch(e){}
try{_ex['scannerStream']=scannerStream}catch(e){}
try{_ex['scannerAnimFrame']=scannerAnimFrame}catch(e){}
try{_ex['_lastScanTime']=_lastScanTime}catch(e){}
try{_ex['_scannerAutoClose']=_scannerAutoClose}catch(e){}
try{_ex['_scanLoopFn']=_scanLoopFn}catch(e){}
try{_ex['_pendingPerms']=_pendingPerms}catch(e){}
try{_ex['_pendingMaxDisc']=_pendingMaxDisc}catch(e){}
try{_ex['_bulkSelected']=_bulkSelected}catch(e){}
try{_ex['_currentDocId']=_currentDocId}catch(e){}
try{_ex['_currentReceiptId']=_currentReceiptId}catch(e){}
try{_ex['_currentPrintReceiptId']=_currentPrintReceiptId}catch(e){}
try{_ex['_editingDocTemplateIdx']=_editingDocTemplateIdx}catch(e){}
try{_ex['_cashierStatsData']=_cashierStatsData}catch(e){}
try{_ex['_shiftStatsData']=_shiftStatsData}catch(e){}
try{_ex['_templateParentModal']=_templateParentModal}catch(e){}
try{_ex['_autoRefreshInterval']=_autoRefreshInterval}catch(e){}
return _ex;})();

// auth
__mod['auth']=(function(){
var set=__mf('app-context','set');
var setCurrentUser=__mf('users','setCurrentUser');
var getUsers=__mf('users','getUsers');
var getLocalUsers=__mf('users','getLocalUsers');

function findUserByLogin(usernameOrEmail) {
    if (!usernameOrEmail)
        return null;
    const norm = usernameOrEmail.toLowerCase().trim();
    var user = getUsers().find(function (u) {
        const email = (u.email || '').toLowerCase();
        const un = (u.username || '').toLowerCase();
        return (email === norm || un === norm || email.split('@')[0] === norm) && u.active !== false;
    });
    if (user)
        return user;
    return getLocalUsers().find(function (u) {
        return (u.username || '').toLowerCase() === norm && u.active !== false;
    });
}

async function showLogin() {
    document.getElementById('app').classList.remove('active');
    setCurrentUser(null);
    window.currentUser = null;
    try { await window.ApAuth.signOut(); } catch (e) { /* suppress */ }
    clearInterval(window._syncInterval);
    clearInterval(window._backupInterval);
    clearInterval(window._notifBadgeInterval);
    document.getElementById('auth-screen').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

var _adminPinCallback = null;

function setAdminPinCallback(value) {
    _adminPinCallback = value;
}

var _auditSession = null;

function setAuditSession(value) {
    _auditSession = value;
}


var PIN_LOG = '[SANAQ PIN]';

async function hashPin(pin) {
    var enc = new TextEncoder();
    var buf = await crypto.subtle.digest('SHA-256', enc.encode(pin));
    return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
}

function _isLegacyPlain(val) {
    return typeof val === 'string' && /^\d{4,6}$/.test(val);
}

function _loadPins() {
    var ls = {}; var ap = null;
    try { ls = JSON.parse(localStorage.getItem('sanaq_user_pins') || '{}'); } catch (e) {}
    try { if (window.ApDb && window.ApDb.getAppData) ap = window.ApDb.getAppData('user_pins'); } catch (e) {}
    return { ls: ls, ap: ap };
}

function _savePinsToBoth(pins) {
    try { localStorage.setItem('sanaq_user_pins', JSON.stringify(pins)); } catch (e) {}
    try { if (window.ApDb && window.ApDb.setAppData) window.ApDb.setAppData('user_pins', pins); } catch (e) {}
}

function syncPins() {
    var s = _loadPins();
    var changed = false;
    if (!s.ap || typeof s.ap !== 'object') {
        if (Object.keys(s.ls).length > 0) {
            console.log(PIN_LOG, 'ApDb пуст — копируем из localStorage');
            _savePinsToBoth(s.ls);
        }
        return;
    }
    var all = new Set(Object.keys(s.ls).concat(Object.keys(s.ap)));
    all.forEach(function (id) {
        var lv = s.ls[id] || null;
        var av = s.ap[id] || null;
        if (lv !== av) {
            if (lv && !av) {
                console.log(PIN_LOG, 'Расхождение', id, ': localStorage содержит PIN, ApDb — нет. Принято: localStorage');
                s.ap[id] = lv; changed = true;
            } else if (av && !lv) {
                console.log(PIN_LOG, 'Расхождение', id, ': ApDb содержит PIN, localStorage — нет. Принято: ApDb');
                s.ls[id] = av; changed = true;
            } else if (lv && av && lv !== av) {
                console.log(PIN_LOG, 'Расхождение', id, ': разные PIN. Принято: ApDb');
                s.ls[id] = av; changed = true;
            }
        }
    });
    if (changed) _savePinsToBoth(s.ap);
}

async function migratePins() {
    var s = _loadPins();
    var pins = s.ap && typeof s.ap === 'object' ? s.ap : s.ls;
    var migrated = false;
    for (var id in pins) {
        if (_isLegacyPlain(pins[id])) {
            var h = await hashPin(pins[id]);
            console.log(PIN_LOG, 'Миграция', id, ': plain text → SHA-256');
            pins[id] = h;
            migrated = true;
        }
    }
    if (migrated) _savePinsToBoth(pins);
    return migrated;
}

async function initPins() {
    console.log(PIN_LOG, '── Инициализация ──');
    var cu = window.currentUser;
    if (cu && cu.id) console.log(PIN_LOG, 'Пользователь:', cu.name, '(id:', cu.id + ', role:', cu.role + ')');
    syncPins();
    return migratePins();
}

function getUserPin(userId) {
    if (!userId) { console.warn(PIN_LOG, 'getUserPin: нет userId'); return null; }
    try {
        var pins = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('user_pins') : null;
        var src = 'ApDb';
        if (!pins || typeof pins !== 'object') {
            pins = JSON.parse(localStorage.getItem('sanaq_user_pins') || '{}');
            src = 'localStorage';
        }
        var val = pins[userId] || null;
        console.log(PIN_LOG, 'getUserPin:', userId, '→', val ? 'найден (' + src + ')' : 'не найден');
        return val;
    } catch (e) {
        console.error(PIN_LOG, 'getUserPin error:', e);
        return null;
    }
}

async function saveUserPin(userId, pin) {
    if (!userId) { console.warn(PIN_LOG, 'saveUserPin: нет userId'); return; }
    try {
        var pins = (window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('user_pins') : null) ||
                   JSON.parse(localStorage.getItem('sanaq_user_pins') || '{}');
        if (typeof pins !== 'object') pins = {};
        if (pin) {
            pins[userId] = await hashPin(pin);
            console.log(PIN_LOG, 'saveUserPin:', userId, '→ хеш сохранён');
        } else {
            delete pins[userId];
            console.log(PIN_LOG, 'saveUserPin:', userId, '→ PIN удалён');
        }
        _savePinsToBoth(pins);
    } catch (e) {
        console.error(PIN_LOG, 'saveUserPin error:', e);
    }
}

async function verifyPin(userId, enteredPin) {
    if (!userId || !enteredPin) { console.log(PIN_LOG, 'verifyPin: нет userId или PIN'); return false; }
    try {
        var stored = getUserPin(userId);
        if (!stored) { console.log(PIN_LOG, 'verifyPin:', userId, '→ PIN не найден'); return false; }
        if (_isLegacyPlain(stored)) {
            var ok = stored === enteredPin;
            if (ok) {
                var h = await hashPin(enteredPin);
                var pins = JSON.parse(localStorage.getItem('sanaq_user_pins') || '{}');
                pins[userId] = h;
                _savePinsToBoth(pins);
                console.log(PIN_LOG, 'verifyPin:', userId, '→ legacy PIN авто-мигрирован');
            } else {
                console.log(PIN_LOG, 'verifyPin:', userId, '→ legacy PIN НЕ совпал');
            }
            return ok;
        }
        var match = (await hashPin(enteredPin)) === stored;
        console.log(PIN_LOG, 'verifyPin:', userId, match ? '→ успех' : '→ НЕ совпал');
        return match;
    } catch (e) {
        console.error(PIN_LOG, 'verifyPin error:', e);
        return false;
    }
}

function hasPin(userId) {
    return !!getUserPin(userId);
}

set('saveUserPin', saveUserPin);
set('getUserPin', getUserPin);
set('verifyPin', verifyPin);
set('hasPin', hasPin);
set('initPins', initPins);
set('syncPins', syncPins);
set('migratePins', migratePins);
set('hashPin', hashPin);


var _ex={};
try{_ex['findUserByLogin']=findUserByLogin}catch(e){}
try{_ex['showLogin']=showLogin}catch(e){}
try{_ex['_adminPinCallback']=_adminPinCallback}catch(e){}
try{_ex['setAdminPinCallback']=setAdminPinCallback}catch(e){}
try{_ex['_auditSession']=_auditSession}catch(e){}
try{_ex['setAuditSession']=setAuditSession}catch(e){}
try{_ex['getUserPin']=getUserPin}catch(e){}
try{_ex['saveUserPin']=saveUserPin}catch(e){}
try{_ex['verifyPin']=verifyPin}catch(e){}
try{_ex['hasPin']=hasPin}catch(e){}
try{_ex['initPins']=initPins}catch(e){}
try{_ex['syncPins']=syncPins}catch(e){}
try{_ex['migratePins']=migratePins}catch(e){}
try{_ex['hashPin']=hashPin}catch(e){}
try{_ex['_isLegacyPlain']=_isLegacyPlain}catch(e){}
return _ex;})();

// notifications
__mod['notifications']=(function(){
var getShifts=__mf('shifts','getShifts');
var getProducts=__mf('products','getProducts');
var set=__mf('app-context','set');



function toast(msg, type) {
    const el = document.createElement('div');
    el.className = 'toast ' + (type || '');
    el.textContent = msg;
    document.getElementById('toasts').appendChild(el);
    setTimeout(function () {
        el.remove();
    }, type === 'err' ? 5000 : 3500);
}

function requestNotificationPermission() {
    if (!('Notification' in window))
        return;
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(function (perm) {
            if (perm === 'granted') {
                toast('Уведомления включены', 'ok');
            }
        }).catch(function () {});
    }
}

function sendNotification(title, body, tag) {
    if (!('Notification' in window) || Notification.permission !== 'granted')
        return;
    var key = 'ap_notif_' + (tag || title);
    var last = parseInt(localStorage.getItem(key) || '0');
    if (Date.now() - last < 3600000)
        return;
    localStorage.setItem(key, String(Date.now()));
    try {
        new Notification(title, {
            body: body,
            icon: 'icons/icon-192.png',
            badge: 'icons/icon-192.png',
            tag: tag || title,
            vibrate: [
                200,
                100,
                200
            ]
        });
    } catch (e) {
        console.warn('[Notif] Error:', e);
    }
}

function checkLowStockNotification() {
    var products = getProducts();
    var lowItems = products.filter(function (p) {
        return p.quantity <= (p.minStock || 5);
    });
    if (lowItems.length > 0) {
        var names = lowItems.slice(0, 3).map(function (p) {
            return p.name;
        }).join(', ');
        var extra = lowItems.length > 3 ? ' и ещё ' + (lowItems.length - 3) : '';
        sendNotification('\u26A0️ Низкий остаток', lowItems.length + ' товаров: ' + names + extra, 'low_stock');
    }
}

function updateNotifBadge() {
    var products = getProducts();
    var lowCount = products.filter(function (p) {
        return p.quantity <= (p.minStock || 5);
    }).length;
    var shifts = getShifts();
    var openCount = shifts.filter(function (s) {
        return s.status === 'open';
    }).length;
    var total = lowCount + openCount;
    var badge = document.getElementById('notif-badge');
    if (badge) {
        if (total > 0) {
            badge.style.display = 'inline';
            badge.textContent = total > 99 ? '99+' : total;
        } else {
            badge.style.display = 'none';
        }
    }
}




set('toast', toast);
window.toast = toast; // Expose globally for legacy IIFE code (ap-db.js etc.)


var _ex={};
try{_ex['toast']=toast}catch(e){}
try{_ex['requestNotificationPermission']=requestNotificationPermission}catch(e){}
try{_ex['sendNotification']=sendNotification}catch(e){}
try{_ex['checkLowStockNotification']=checkLowStockNotification}catch(e){}
try{_ex['updateNotifBadge']=updateNotifBadge}catch(e){}
return _ex;})();

// statistics
__mod['statistics']=(function(){
var isToday=__mf('utils','isToday');
var renderAnalytics=__mf('ui','renderAnalytics');
var groupSalesIntoReceipts=__mf('sales','groupSalesIntoReceipts');
var renderUnsoldProducts=__mf('products','renderUnsoldProducts');
var isSaleActive=__mf('sales','isSaleActive');
var esc=__mf('utils','esc');
var fmt=__mf('utils','fmt');
var fmtDate=__mf('utils','fmtDate');
var renderProductAnalysis=__mf('products','renderProductAnalysis');
var isAdmin=__mf('users','isAdmin');
var getExpenses=__mf('expenses','getExpenses');
var tableHTML=__mf('utils','tableHTML');
var saleStatusBadge=__mf('sales','saleStatusBadge');
var currentUser=__mv('users','currentUser');
var badgePay=__mf('sales','badgePay');
var renderCashierStats=__mf('users','renderCashierStats');
var isExpenseActive=__mf('expenses','isExpenseActive');
var getSales=__mf('sales','getSales');
var toast=__mf('notifications','toast');
var card=__mf('utils','card');
var renderShiftStats=__mf('shifts','renderShiftStats');



var _importState = {
    section: null,
    rawData: null,
    rows: null
};

function setImportState(value) {
    _importState = value;
}

function expenseStatusBadge(e) {
    return isExpenseActive(e) ? '<span class="badge badge-ok">Активен</span>' : '<span class="badge badge-danger">Отменён</span>';
}

function getStats() {
    const sales = getSales().filter(function (s) {
        return isToday(s.date) && isSaleActive(s);
    });
    const expenses = getExpenses().filter(function (e) {
        return isToday(e.date) && isExpenseActive(e);
    });
    let cash = 0, kaspi = 0, transfer = 0, revenue = 0, expTotal = 0, cogs = 0;
    sales.forEach(function (s) {
        revenue += s.total;
        cogs += (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
        if (s.payment === 'debt') {
        } else if (s.payment === 'cash')
            cash += s.total;
        else if (s.payment === 'kaspi')
            kaspi += s.total;
        else if (s.payment === 'transfer')
            transfer += s.total;
        else if (s.payment === 'mixed') {
            cash += Number(s.cashAmount) || 0;
            kaspi += Number(s.kaspiAmount) || 0;
            transfer += Number(s.transferAmount) || 0;
        }
    });
    expenses.forEach(function (e) {
        expTotal += e.amount;
    });
    return {
        cash,
        kaspi,
        transfer,
        revenue,
        expTotal,
        cogs,
        profit: revenue - expTotal - cogs,
        salesCount: sales.length
    };
}

var _posBrowserState = { cat: '' };

var _posCatModalState = {
    mode: 'categories',
    catId: '',
    catName: ''
};

var _statsPeriod = 'today';

function renderStatistics() {
    const period = _statsPeriod || 'today';
    const now = new Date();
    var periodStart = new Date(0);
    if (period === 'today') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
        var d = new Date(now);
        d.setDate(d.getDate() - 7);
        periodStart = d;
    } else if (period === 'month') {
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    const sales = getSales().filter(function (s) {
        return isSaleActive(s) && new Date(s.date) >= periodStart;
    });
    const expenses = getExpenses().filter(function (e) {
        return isExpenseActive(e) && new Date(e.date) >= periodStart;
    });
    let cash = 0, kaspi = 0, transfer = 0, revenue = 0, cogs = 0, itemsCount = 0;
    sales.forEach(function (s) {
        revenue += s.total;
        cogs += (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
        itemsCount += Number(s.quantity) || 0;
        if (s.payment === 'debt') {
        } else if (s.payment === 'cash')
            cash += s.total;
        else if (s.payment === 'kaspi')
            kaspi += s.total;
        else if (s.payment === 'transfer')
            transfer += s.total;
        else if (s.payment === 'mixed') {
            cash += Number(s.cashAmount) || 0;
            kaspi += Number(s.kaspiAmount) || 0;
            transfer += Number(s.transferAmount) || 0;
        }
    });
    const expTotal = expenses.reduce(function (s, e) {
        return s + e.amount;
    }, 0);
    const profit = revenue - expTotal - cogs;
    const receipts = groupSalesIntoReceipts(sales);
    var salesCount = receipts.length;
    var avgCheck = salesCount ? revenue / salesCount : 0;
    document.getElementById('stats-cards').innerHTML = card('Кол-во продаж', salesCount, '') + card('Выручка', fmt(revenue), 'ok') + card('Прибыль', fmt(profit), profit >= 0 ? 'ok' : 'err') + card('Средний чек', fmt(avgCheck), '') + card('Продано товаров', itemsCount, '') + card('Kaspi QR', fmt(kaspi), 'kaspi') + card('Наличные', fmt(cash), 'cash') + card('Банк', fmt(transfer), 'bank') + card('Себестоимость', fmt(cogs), '') + card('Всего расходов', fmt(expTotal), 'warn');
    var productSales = {};
    var cashierSales = {};
    var hourlySales = {};
    sales.forEach(function (s) {
        var pName = s.productName || '\u2014';
        productSales[pName] = (productSales[pName] || 0) + (Number(s.quantity) || 0);
        var cName = s.userName || currentUser.name || '\u2014';
        cashierSales[cName] = (cashierSales[cName] || 0) + 1;
        var hour = s.date ? new Date(s.date).getHours() : 0;
        hourlySales[hour] = (hourlySales[hour] || 0) + (Number(s.total) || 0);
    });
    var topProduct = Object.keys(productSales).sort(function (a, b) {
        return productSales[b] - productSales[a];
    })[0] || null;
    var topCashier = Object.keys(cashierSales).sort(function (a, b) {
        return cashierSales[b] - cashierSales[a];
    })[0] || null;
    var peakHour = Object.keys(hourlySales).sort(function (a, b) {
        return hourlySales[b] - hourlySales[a];
    })[0] || null;
    var totalPayments = cash + kaspi + transfer;
    var cashPct = totalPayments > 0 ? Math.round(cash / totalPayments * 100) : 0;
    var kaspiPct = totalPayments > 0 ? Math.round(kaspi / totalPayments * 100) : 0;
    var transferPct = totalPayments > 0 ? Math.round(transfer / totalPayments * 100) : 0;
    var analysisHTML = '';
    analysisHTML += '<div class="card"><div class="card-label">\uD83C\uDFC6 Товар-лидер</div><div class="card-value" style="font-size:16px">' + esc(topProduct || '\u2014') + '</div>' + (topProduct ? '<div style="font-size:12px;color:var(--text-muted)">Продано: ' + productSales[topProduct] + ' шт</div>' : '') + '</div>';
    analysisHTML += '<div class="card"><div class="card-label">\uD83D\uDC64 Лучший кассир</div><div class="card-value" style="font-size:16px">' + esc(topCashier || '\u2014') + '</div>' + (topCashier ? '<div style="font-size:12px;color:var(--text-muted)">Продаж: ' + cashierSales[topCashier] + '</div>' : '') + '</div>';
    analysisHTML += '<div class="card"><div class="card-label">\u23F0 Пиковый час</div><div class="card-value" style="font-size:16px">' + (peakHour !== null ? peakHour + ':00' : '\u2014') + '</div><div style="font-size:12px;color:var(--text-muted)">' + (peakHour !== null ? 'Выручка: ' + fmt(Math.round(hourlySales[peakHour])) + ' \u20B8' : '') + '</div></div>';
    analysisHTML += '<div class="card" style="flex:1"><div class="card-label">\uD83D\uDCCA Способы оплаты</div><div style="display:flex;gap:4px;margin-top:6px;height:8px;border-radius:4px;overflow:hidden;background:var(--border)">' + (cashPct > 0 ? '<div style="flex:' + cashPct + ';background:#22c55e;min-width:4px" title="Наличные ' + cashPct + '%"></div>' : '') + (kaspiPct > 0 ? '<div style="flex:' + kaspiPct + ';background:#e11d48;min-width:4px" title="Kaspi QR ' + kaspiPct + '%"></div>' : '') + (transferPct > 0 ? '<div style="flex:' + transferPct + ';background:#3b82f6;min-width:4px" title="Банк ' + transferPct + '%"></div>' : '') + '</div><div style="display:flex;gap:12px;margin-top:4px;font-size:11px;color:var(--text-muted)">' + (cashPct > 0 ? '<span>\uD83D\uDCB5 ' + cashPct + '%</span>' : '') + (kaspiPct > 0 ? '<span>\uD83D\uDCF1 ' + kaspiPct + '%</span>' : '') + (transferPct > 0 ? '<span>\uD83C\uDFE6 ' + transferPct + '%</span>' : '') + '</div></div>';
    document.getElementById('stats-analysis').innerHTML = analysisHTML;
    const statSaleCols = [
        'Чек',
        'Товары',
        'Сумма',
        'Оплата',
        'Статус',
        'Кассир',
        'Время',
        ''
    ];
    document.getElementById('stats-sales-table').innerHTML = receipts.length ? '<div class="table-wrap">' + tableHTML(statSaleCols, receipts.map(function (r) {
        const qty = r.items.reduce(function (sum, it) {
            return sum + (Number(it.quantity) || 0);
        }, 0);
        const row = [
            '<span class="code-tag">\u2116 ' + r.id.slice(-6) + '</span>',
            qty + ' шт.',
            fmt(r.total),
            badgePay(r.payment, r.items[0]),
            saleStatusBadge(r.items[0]),
            r.userName || '\u2014',
            fmtDate(r.date),
            '<button class="btn btn-sm btn-secondary" onclick="openReceipt(\'' + r.id + '\')">Открыть</button>'
        ];
        return row;
    })) + '</div>' : '<div class="empty">Продаж нет</div>';
    const catMap = {};
    expenses.filter(isExpenseActive).forEach(function (e) {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    const catRows = Object.keys(catMap).map(function (k) {
        return [
            k,
            '<span style="color:var(--err);font-weight:600">-' + fmt(catMap[k]) + '</span>'
        ];
    });
    document.getElementById('stats-expenses-table').innerHTML = catRows.length ? '<div class="table-wrap">' + tableHTML([
        'Категория',
        'Сумма'
    ], catRows) + '</div>' : '<div class="empty">Расходов нет</div>';
    renderStatCharts(sales, expenses);
    renderProductAnalysis();
}

var _statCharts = {};

function renderStatCharts(sales, expenses) {
    Object.keys(_statCharts).forEach(function (k) {
        if (_statCharts[k]) {
            _statCharts[k].destroy();
            delete _statCharts[k];
        }
    });
    if (typeof Chart === 'undefined')
        return;
    var dayMap = {};
    var now = new Date();
    for (var i = 29; i >= 0; i--) {
        var d = new Date(now);
        d.setDate(d.getDate() - i);
        var key = d.toISOString().slice(0, 10);
        dayMap[key] = {
            revenue: 0,
            cost: 0
        };
    }
    sales.forEach(function (s) {
        var sk = (s.date || '').slice(0, 10);
        if (dayMap[sk]) {
            dayMap[sk].revenue += s.total;
            dayMap[sk].cost += (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
        }
    });
    var labels = Object.keys(dayMap);
    var revData = labels.map(function (k) {
        return dayMap[k].revenue;
    });
    var costData = labels.map(function (k) {
        return dayMap[k].cost;
    });
    var ctx1 = document.getElementById('chart-sales');
    if (ctx1) {
        _statCharts.sales = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: labels.map(function (l) {
                    return l.slice(5);
                }),
                datasets: [
                    {
                        label: 'Выручка',
                        data: revData,
                        backgroundColor: 'rgba(34,197,94,0.7)',
                        borderColor: 'rgb(34,197,94)',
                        borderWidth: 1
                    },
                    {
                        label: 'Себестоимость',
                        data: costData,
                        backgroundColor: 'rgba(239,68,68,0.7)',
                        borderColor: 'rgb(239,68,68)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function (v) {
                                return v.toLocaleString('ru-RU');
                            }
                        }
                    }
                }
            }
        });
    }
    var pCash = 0, pKaspi = 0, pTransfer = 0, pDebt = 0;
    sales.forEach(function (s) {
        if (s.payment === 'cash')
            pCash += s.total;
        else if (s.payment === 'kaspi')
            pKaspi += s.total;
        else if (s.payment === 'transfer')
            pTransfer += s.total;
        else if (s.payment === 'debt')
            pDebt += s.total;
        else if (s.payment === 'mixed') {
            pCash += Number(s.cashAmount) || 0;
            pKaspi += Number(s.kaspiAmount) || 0;
            pTransfer += Number(s.transferAmount) || 0;
        }
    });
    var ctx2 = document.getElementById('chart-payments');
    if (ctx2) {
        _statCharts.payments = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: [
                    'Наличные',
                    'Kaspi QR',
                    'Банк',
                    'В долг'
                ],
                datasets: [{
                        data: [
                            pCash,
                            pKaspi,
                            pTransfer,
                            pDebt
                        ],
                        backgroundColor: [
                            '#22c55e',
                            '#e11d48',
                            '#3b82f6',
                            '#f59e0b'
                        ]
                    }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                return ctx.label + ': ' + ctx.parsed.toLocaleString('ru-RU') + ' \u20B8';
                            }
                        }
                    }
                }
            }
        });
    }
    var catMap = {};
    expenses.filter(isExpenseActive).forEach(function (e) {
        catMap[e.category] = (catMap[e.category] || 0) + e.amount;
    });
    var catLabels = Object.keys(catMap);
    var catValues = catLabels.map(function (k) {
        return catMap[k];
    });
    var colors = [
        '#ef4444',
        '#f97316',
        '#eab308',
        '#22c55e',
        '#06b6d4',
        '#3b82f6',
        '#8b5cf6',
        '#ec4899',
        '#78716c'
    ];
    var ctx3 = document.getElementById('chart-expenses');
    if (ctx3 && catLabels.length) {
        _statCharts.expenses = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: catLabels,
                datasets: [{
                        data: catValues,
                        backgroundColor: colors.slice(0, catLabels.length)
                    }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                return ctx.label + ': ' + ctx.parsed.toLocaleString('ru-RU') + ' \u20B8';
                            }
                        }
                    }
                }
            }
        });
    }
}

var _statsSubTab = 'unsold';




function exportToExcel(headers, rows, filename) {
    if (typeof XLSX === 'undefined') {
        toast('Excel библиотека не загружена', 'err');
        return;
    }
    var data = [headers].concat(rows);
    var ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = headers.map(function (h, i) {
        var maxLen = h.length;
        rows.forEach(function (r) {
            if (r[i] && String(r[i]).length > maxLen)
                maxLen = String(r[i]).length;
        });
        return { wch: Math.min(40, Math.max(10, maxLen + 2)) };
    });
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Данные');
    XLSX.writeFile(wb, (filename || 'export') + '.xlsx');
    toast('Excel файл скачан', 'ok');
}

function exportAoAToExcel(rows, filename, sheetName, widths) {
    if (typeof XLSX === 'undefined') {
        toast('Excel библиотека не загружена', 'err');
        return;
    }
    var ws = XLSX.utils.aoa_to_sheet(rows);
    if (widths) {
        ws['!cols'] = widths.map(function (w) {
            return { wch: w };
        });
    } else {
        var maxCols = rows.reduce(function (m, r) {
            return Math.max(m, r.length);
        }, 0);
        ws['!cols'] = Array.from({ length: maxCols }, function (_, i) {
            var maxLen = 10;
            rows.forEach(function (r) {
                var v = r[i];
                if (v !== null && v !== undefined && String(v).length > maxLen)
                    maxLen = String(v).length;
            });
            return { wch: Math.min(48, maxLen + 2) };
        });
    }
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Данные');
    XLSX.writeFile(wb, (filename || 'export') + '.xlsx');
    toast('Excel файл скачан', 'ok');
}

function switchStatsPeriod(period) {
    _statsPeriod = period;
    document.querySelectorAll('.period-tabs .tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.speriod === period);
    });
    renderStatistics();
}

function switchStatsTab(tab) {
    document.querySelectorAll('#stats-tabs .tab').forEach(function (t) {
        t.classList.toggle('active', t.dataset.stab === tab);
    });
    document.getElementById('stab-general').classList.toggle('hidden', tab !== 'general');
    document.getElementById('stab-shifts').classList.toggle('hidden', tab !== 'shifts');
    document.getElementById('stab-cashiers').classList.toggle('hidden', tab !== 'cashiers');
    if (tab === 'shifts')
        renderShiftStats();
    if (tab === 'cashiers')
        renderCashierStats();
}

function switchStatsSubTab(tab) {
    _statsSubTab = tab;
    document.querySelectorAll('[data-stab2]').forEach(function (b) {
        b.classList.toggle('active', b.dataset.stab2 === tab);
    });
    document.querySelectorAll('.stab-sub').forEach(function (s) {
        s.style.display = 'none';
    });
    var el = document.getElementById('stab2-' + tab);
    if (el)
        el.style.display = 'block';
    if (tab === 'unsold')
        renderUnsoldProducts(30);
    if (tab === 'analytics')
        renderAnalytics();
}

async function exportStoreBackup() {
    if (!isAdmin()) {
        toast('Только администратор', 'err');
        return;
    }
    try {
        await window.ApBackup.exportBackup();
    } catch (e) {
        toast(e.message || String(e), 'err');
    }
}




var _ex={};
try{_ex['_importState']=_importState}catch(e){}
try{_ex['setImportState']=setImportState}catch(e){}
try{_ex['expenseStatusBadge']=expenseStatusBadge}catch(e){}
try{_ex['getStats']=getStats}catch(e){}
try{_ex['_posBrowserState']=_posBrowserState}catch(e){}
try{_ex['_posCatModalState']=_posCatModalState}catch(e){}
try{_ex['_statsPeriod']=_statsPeriod}catch(e){}
try{_ex['renderStatistics']=renderStatistics}catch(e){}
try{_ex['_statCharts']=_statCharts}catch(e){}
try{_ex['renderStatCharts']=renderStatCharts}catch(e){}
try{_ex['_statsSubTab']=_statsSubTab}catch(e){}
try{_ex['exportToExcel']=exportToExcel}catch(e){}
try{_ex['exportAoAToExcel']=exportAoAToExcel}catch(e){}
try{_ex['switchStatsPeriod']=switchStatsPeriod}catch(e){}
try{_ex['switchStatsTab']=switchStatsTab}catch(e){}
try{_ex['switchStatsSubTab']=switchStatsSubTab}catch(e){}
try{_ex['exportStoreBackup']=exportStoreBackup}catch(e){}
return _ex;})();

// helpers
__mod['helpers']=(function(){
function formatExcelValue(val, fmtCode) {
    if (val === null || val === undefined)
        return '';
    if (fmtCode && fmtCode.indexOf('dd.') === 0 && val && typeof val === 'string') {
        var d = new Date(val);
        if (!isNaN(d.getTime()))
            return d;
    }
    if (fmtCode === '#,##0' || fmtCode === '#,##0.00') {
        var n = Number(val);
        if (!isNaN(n))
            return n;
    }
    return val;
}





var _ex={};
try{_ex['formatExcelValue']=formatExcelValue}catch(e){}
return _ex;})();

// reports
__mod['reports']=(function(){
var todayStr=__mf('utils','todayStr');
var toast=__mf('notifications','toast');
var EXCEL_SECTIONS=__mv('constants','EXCEL_SECTIONS');
var saveExcelBuffer=__mf('utils','saveExcelBuffer');
var getFieldValue=__mf('utils','getFieldValue');
var formatExcelValue=__mf('helpers','formatExcelValue');
var createExcelWorkbook=__mf('utils','createExcelWorkbook');



async function exportSectionToExcel(section, data, filename) {
    var cfg = EXCEL_SECTIONS[section];
    if (!cfg) {
        toast('Неизвестный раздел: ' + section, 'err');
        return;
    }
    if (!data || !data.length) {
        toast('Нет данных для экспорта', 'err');
        return;
    }
    var rows = data.map(function (item) {
        return cfg.fields.map(function (field, i) {
            return formatExcelValue(getFieldValue(item, field), cfg.numFmt[i]);
        });
    });
    try {
        var buffer = await createExcelWorkbook(cfg.headers, rows, cfg.widths, cfg.label, cfg.numFmt);
        saveExcelBuffer(buffer, filename || 'SANAQ_' + section + '_' + todayStr() + '.xlsx');
        toast('Excel файл скачан', 'ok');
    } catch (e) { toast('Ошибка экспорта: ' + e.message, 'err'); }
}





var _ex={};
try{_ex['exportSectionToExcel']=exportSectionToExcel}catch(e){}
return _ex;})();

// expenses
__mod['expenses']=(function(){
var confirmAction=__mf('utils','confirmAction');
var expenseStatusBadge=__mf('statistics','expenseStatusBadge');
var todayStr=__mf('utils','todayStr');
var renderDashboard=__mf('ui','renderDashboard');
var exportSectionToExcel=__mf('reports','exportSectionToExcel');
var currentUser=__mv('users','currentUser');
var checkPermission=__mf('users','checkPermission');
var fmt=__mf('utils','fmt');
var fmtDate=__mf('utils','fmtDate');
var set=__mf('app-context','set');
var isAdmin=__mf('users','isAdmin');
var renderStatistics=__mf('statistics','renderStatistics');
var tableHTML=__mf('utils','tableHTML');
var closeModal=__mf('utils','closeModal');
var uid=__mf('ui','uid');
var toast=__mf('notifications','toast');
var openModal=__mf('ui','openModal');


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

var _ex={};
try{_ex['getExpenses']=getExpenses}catch(e){}
try{_ex['setExpenses']=setExpenses}catch(e){}
try{_ex['isExpenseActive']=isExpenseActive}catch(e){}
try{_ex['adminCancelExpenseBtn']=adminCancelExpenseBtn}catch(e){}
try{_ex['renderExpenses']=renderExpenses}catch(e){}
try{_ex['openExpenseModal']=openExpenseModal}catch(e){}
try{_ex['saveExpense']=saveExpense}catch(e){}
try{_ex['cancelExpenseConfirm']=cancelExpenseConfirm}catch(e){}
try{_ex['cancelExpense']=cancelExpense}catch(e){}
try{_ex['exportExpensesExcel']=exportExpensesExcel}catch(e){}
return _ex;})();

// cart
__mod['cart']=(function(){
var renderPosCatBrowser=__mf('ui','renderPosCatBrowser');
var currentPayment=__mv('sales','currentPayment');
var currentCustomer=__mv('customers','currentCustomer');
var setSelectedCartItemId=__mf('products','setSelectedCartItemId');
var isAdmin=__mf('users','isAdmin');
var _selectedCartItemId=__mv('products','_selectedCartItemId');
var currentUser=__mv('users','currentUser');
var getProducts=__mf('products','getProducts');
var goPage=__mf('ui','goPage');
var esc=__mf('utils','esc');
var calcChange=__mf('sales','calcChange');
var checkPermission=__mf('users','checkPermission');
var fmt=__mf('utils','fmt');
var set=__mf('app-context','set');
var toggleItemDiscountValue=__mf('utils','toggleItemDiscountValue');
var calcMixedRemainder=__mf('sales','calcMixedRemainder');
var addAuditLog=__mf('sales','addAuditLog');
var getUserMaxDiscount=__mf('users','getUserMaxDiscount');
var requireAdminPin=__mf('users','requireAdminPin');
var closeModal=__mf('utils','closeModal');
var getProductDiscount=__mf('products','getProductDiscount');
var getOpenShiftForCashier=__mf('users','getOpenShiftForCashier');
var getCustomerTier=__mf('customers','getCustomerTier');
var toast=__mf('notifications','toast');
var openModal=__mf('ui','openModal');



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

function addToCart(productId, keepSearch) {
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
    if (!keepSearch) {
        document.getElementById('sale-search').value = '';
        document.getElementById('sale-results').classList.add('hidden');
    }
    document.getElementById('sale-search').focus();
    renderSaleCart();
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
    const totalPay = document.getElementById('sale-total-pay');
    const changeDisplay = document.getElementById('sale-change-display');
    const btnComplete = document.getElementById('btn-complete-sale');
    const btnDefer = document.getElementById('btn-defer-sale');
    var countEl = document.getElementById('pos-cart-count');
    if (!saleCart.length) {
        tbody.innerHTML = '<tr><td colspan="3" class="pos-cart-empty">Корзина пуста</td></tr>';
        if (subTotalEl)
            subTotalEl.textContent = '0 ₸';
        if (discountRow)
            discountRow.style.display = 'none';
        if (bonusRow)
            bonusRow.style.display = 'none';
        if (totalEl) {
            totalEl.value = '';
            totalEl.dataset.value = 0;
        }
        if (totalDisplay)
            totalDisplay.textContent = '0 ₸';
        if (totalPay)
            totalPay.textContent = '0 ₸';
        if (changeDisplay)
            changeDisplay.textContent = '0 ₸';
        if (countEl)
            countEl.textContent = '0';
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
        var priceHtml = totAmt;
        var discBadge = '';
        if (totalItemDisc > 0) {
            discBadge = '<span style="font-size:10px;color:var(--success)">🏷️ -' + fmt(totalItemDisc) + '</span>';
        }
        return '<tr data-id="' + c.id + '">' +
            '<td style="padding:6px 4px 6px 10px">' +
                '<div class="pos-ci-name">' + esc(c.name) + '</div>' +
                '<div class="pos-ci-code">' + (c.code || c.barcode || '') + '</div>' +
                discBadge +
            '</td>' +
            '<td class="pos-ci-qty" style="padding:6px 2px;white-space:nowrap">' +
                (canChangeQty ? '<button onclick="event.stopPropagation();changeCartQty(\'' + c.id + '\',-1)">−</button>' : '') +
                '<span onclick="event.stopPropagation();openQtyPopup(\'' + c.id + '\')">' + c.qty + '</span>' +
                (canChangeQty ? '<button onclick="event.stopPropagation();changeCartQty(\'' + c.id + '\',1)">+</button>' : '') +
            '</td>' +
            '<td class="pos-ci-total" style="padding:6px 10px 6px 4px">' + fmt(totAmt) + '</td>' +
            '</tr>';
    }).join('');

    if (countEl)
        countEl.textContent = saleCart.length;

    if (subTotalEl)
        subTotalEl.textContent = fmt(subTotal);

    let maxBonus = 0;
    let subAfterDiscount = subTotal;
    if (subAfterDiscount < 0) subAfterDiscount = 0;

    if (currentCustomer) {
        const tier = getCustomerTier(currentCustomer.spent || 0);
        var ci = document.getElementById('sale-customer-info');
        if (ci) {
            ci.style.display = 'flex';
            var ciText = document.getElementById('sale-customer-info-text') || ci;
            ci.textContent = 'Клиент: ' + (currentCustomer.name || '—') + ' | Уровень: ' + tier.name + ' (-' + (tier.discount * 100) + '%) | Бонусы: ' + fmt(currentCustomer.bonusBalance);
        }
        var bw = document.getElementById('sale-bonus-wrap');
        if (bw)
            bw.style.display = 'flex';
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
        totalDisplay.textContent = fmt(finalTotal) + ' ₸';
    if (totalPay)
        totalPay.textContent = fmt(finalTotal) + ' ₸';
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

var _ex={};
try{_ex['saleCart']=saleCart}catch(e){}
try{_ex['setSaleCart']=setSaleCart}catch(e){}
try{_ex['selectCartItem']=selectCartItem}catch(e){}
try{_ex['getSelectedCartItem']=getSelectedCartItem}catch(e){}
try{_ex['promptCartQty']=promptCartQty}catch(e){}
try{_ex['addToCart']=addToCart}catch(e){}
try{_ex['updateCartQty']=updateCartQty}catch(e){}
try{_ex['removeFromCart']=removeFromCart}catch(e){}
try{_ex['changeCartQty']=changeCartQty}catch(e){}
try{_ex['renderSaleCart']=renderSaleCart}catch(e){}
try{_ex['toggleSelectAll']=toggleSelectAll}catch(e){}
try{_ex['toggleSelectItem']=toggleSelectItem}catch(e){}
try{_ex['clearSelection']=clearSelection}catch(e){}
try{_ex['getSelectedItems']=getSelectedItems}catch(e){}
try{_ex['updateBulkBar']=updateBulkBar}catch(e){}
try{_ex['bulkDeleteSelected']=bulkDeleteSelected}catch(e){}
try{_ex['bulkDiscountSelected']=bulkDiscountSelected}catch(e){}
try{_ex['bulkQtySelected']=bulkQtySelected}catch(e){}
try{_ex['bulkPriceSelected']=bulkPriceSelected}catch(e){}
try{_ex['applyPriceToItems']=applyPriceToItems}catch(e){}
try{_ex['bulkRemoveDiscountSelected']=bulkRemoveDiscountSelected}catch(e){}
try{_ex['removeItemDiscount']=removeItemDiscount}catch(e){}
try{_ex['openCartDiscount']=openCartDiscount}catch(e){}
try{_ex['applyItemDiscount']=applyItemDiscount}catch(e){}
try{_ex['openItemDiscountSingle']=openItemDiscountSingle}catch(e){}
return _ex;})();

// customers
__mod['customers']=(function(){
var confirmAction=__mf('utils','confirmAction');
var renderSaleCart=__mf('cart','renderSaleCart');
var groupSalesIntoReceipts=__mf('sales','groupSalesIntoReceipts');
var isSaleActive=__mf('sales','isSaleActive');
var isAdmin=__mf('users','isAdmin');
var checkPermission=__mf('users','checkPermission');
var fmt=__mf('utils','fmt');
var uid=__mf('ui','uid');
var tableHTML=__mf('utils','tableHTML');
var openReceipt=__mf('sales','openReceipt');
var closeModal=__mf('utils','closeModal');
var getSales=__mf('sales','getSales');
var toast=__mf('notifications','toast');
var openModal=__mf('ui','openModal');


function getCustomers() {
    return window.ApDb ? window.ApDb.getCustomers() : [];
}

function setCustomers(arr) {
    if (window.ApDb)
        window.ApDb.setCustomers(arr);
}

var TIERS = [
    { name: 'Bronze', minSpent: 0, discount: 0, bonusEarn: 0.01, maxSpend: 0.1 },
    { name: 'Silver', minSpent: 25000, discount: 0.05, bonusEarn: 0.01, maxSpend: 0.2 },
    { name: 'Gold', minSpent: 50000, discount: 0.08, bonusEarn: 0.01, maxSpend: 0.3 },
    { name: 'VIP', minSpent: 100000, discount: 0.1, bonusEarn: 0.01, maxSpend: 0.5 }
];

function getCustomerTier(spent) {
    var tier = TIERS[0];
    for (var i = TIERS.length - 1; i >= 0; i--) {
        if (spent >= TIERS[i].minSpent) {
            tier = TIERS[i];
            break;
        }
    }
    return {
        name: tier.name,
        discount: tier.discount,
        bonusEarn: tier.bonusEarn,
        maxSpend: tier.maxSpend
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

function setCurrentCustomer(value) {
    currentCustomer = value;
}





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




var _ex={};
try{_ex['getCustomers']=getCustomers}catch(e){}
try{_ex['setCustomers']=setCustomers}catch(e){}
try{_ex['getCustomerTier']=getCustomerTier}catch(e){}
try{_ex['findCustomerByPhone']=findCustomerByPhone}catch(e){}
try{_ex['currentCustomer']=currentCustomer}catch(e){}
try{_ex['setCurrentCustomer']=setCurrentCustomer}catch(e){}
try{_ex['openCustomerModal']=openCustomerModal}catch(e){}
try{_ex['saveCustomer']=saveCustomer}catch(e){}
try{_ex['openCustomerHistory']=openCustomerHistory}catch(e){}
try{_ex['deleteCustomer']=deleteCustomer}catch(e){}
try{_ex['renderCustomers']=renderCustomers}catch(e){}
try{_ex['findCustomer']=findCustomer}catch(e){}
return _ex;})();

// shifts
__mod['shifts']=(function(){
var addAuditLog=__mf('sales','addAuditLog');
var getSales=__mf('sales','getSales');
var updateSaleShiftBanner=__mf('sales','updateSaleShiftBanner');
var esc=__mf('utils','esc');
var tableHTML=__mf('utils','tableHTML');
var fmt=__mf('utils','fmt');
var setStore=__mf('store','setStore');
var openModal=__mf('ui','openModal');
var isSaleActive=__mf('sales','isSaleActive');
var isExpenseActive=__mf('expenses','isExpenseActive');
var groupSalesIntoReceipts=__mf('sales','groupSalesIntoReceipts');
var uid=__mf('ui','uid');
var fmtDate=__mf('utils','fmtDate');
var renderCashiersPage=__mf('users','renderCashiersPage');
var downloadFile=__mf('utils','downloadFile');
var card=__mf('utils','card');
var currentUser=__mv('users','currentUser');
var PAY_LABELS=__mv('sales','PAY_LABELS');
var goPage=__mf('ui','goPage');
var getCustomers=__mf('customers','getCustomers');
var getOpenShiftForCashier=__mf('users','getOpenShiftForCashier');
var exportSectionToExcel=__mf('reports','exportSectionToExcel');
var isAdmin=__mf('users','isAdmin');
var getExpenses=__mf('expenses','getExpenses');
var toast=__mf('notifications','toast');
var getCurrentStoreName=__mf('utils','getCurrentStoreName');
var todayStr=__mf('utils','todayStr');



function getShifts() {
    return window.ApDb ? window.ApDb.getShifts() : [];
}

function setShifts(arr) {
    if (window.ApDb)
        window.ApDb.setShifts(arr);
}

function canManageShift(shift) {
    if (!shift)
        return false;
    return isAdmin() || shift.cashierId === currentUser.id || (shift.cashierUsername || '').toLowerCase() === (currentUser.username || '').toLowerCase();
}

function renderShiftStats() {
    var shifts = getShifts();
    var sales = getSales().filter(isSaleActive);
    var expenses = getExpenses().filter(isExpenseActive);
    var expTotal = expenses.reduce(function (s, e) {
        return s + e.amount;
    }, 0);
    var shiftData = shifts.map(function (sh) {
        var shiftSales = sales.filter(function (s) {
            return s.shiftId === sh.id;
        });
        var rev = shiftSales.reduce(function (s, x) {
            return s + x.total;
        }, 0);
        var cost = shiftSales.reduce(function (s, x) {
            return s + (Number(x.purchasePrice) || 0) * (Number(x.quantity) || 0);
        }, 0);
        var cnt = shiftSales.length;
        return {
            id: sh.id,
            cashier: sh.cashierName || '\u2014',
            openedAt: sh.openedAt,
            closedAt: sh.closedAt,
            status: sh.status,
            count: cnt,
            revenue: rev,
            cogs: cost,
            profit: rev - cost
        };
    });
    var totalRev = shiftData.reduce(function (s, x) {
        return s + x.revenue;
    }, 0);
    var totalProfit = shiftData.reduce(function (s, x) {
        return s + x.profit;
    }, 0);
    var totalShifts = shiftData.length;
    var openShifts = shiftData.filter(function (s) {
        return s.status === 'open';
    }).length;
    document.getElementById('shifts-stats-cards').innerHTML = card('Всего смен', totalShifts, '') + card('Открытых смен', openShifts, 'ok') + card('Выручка за все смены', fmt(totalRev), 'ok') + card('Прибыль за все смены', fmt(totalProfit), totalProfit >= 0 ? 'ok' : 'err');
    shiftData.sort(function (a, b) {
        return (b.openedAt || '').localeCompare(a.openedAt || '');
    });
    var rows = shiftData.map(function (s) {
        return [
            s.cashier,
            fmtDate(s.openedAt),
            s.closedAt ? fmtDate(s.closedAt) : '<span class="badge badge-ok">Открыта</span>',
            s.count,
            fmt(s.revenue),
            fmt(s.cogs),
            '<span style="color:' + (s.profit >= 0 ? 'var(--ok)' : 'var(--err)') + ';font-weight:600">' + fmt(s.profit) + '</span>'
        ];
    });
    document.getElementById('shifts-stats-table').innerHTML = rows.length ? '<div class="table-wrap">' + tableHTML([
        'Кассир',
        'Открыта',
        'Закрыта',
        'Продаж',
        'Выручка',
        'Себестоимость',
        'Прибыль'
    ], rows) + '</div>' : '<div class="empty">Смен нет</div>';
    window._shiftStatsData = shiftData;
}

function closeShift(shiftId) {
    const shifts = getShifts();
    const idx = shifts.findIndex(function (s) {
        return s.id === shiftId;
    });
    if (idx < 0)
        return;
    const shift = shifts[idx];
    if (shift.status === 'closed') {
        toast('Эта смена уже закрыта и не может быть открыта снова', 'err');
        return;
    }
    shift.status = 'closed';
    shift.closedAt = new Date().toISOString();
    shift.closedBy = currentUser.name;
    shift.totals = calcShiftTotals(shiftId);
    shifts[idx] = shift;
    addAuditLog('Закрытие смены', 'Смена #' + shiftId.slice(-6) + ' кассира ' + shift.cashierName, '\uD83D\uDD12');
    setShifts(shifts);
    exportShiftToExcel(shift);
    toast('Смена закрыта. Файл Excel сохранён', 'ok');
    if (isAdmin())
        renderCashiersPage();
    else
        renderMyShiftPage();
    updateSaleShiftBanner();
}

function calcShiftTotals(shiftId) {
    const sales = getSales().filter(function (s) {
        return s.shiftId === shiftId && isSaleActive(s);
    });
    let cash = 0, kaspi = 0, transfer = 0, revenue = 0;
    sales.forEach(function (s) {
        if (s.payment === 'debt') {
        } else {
            revenue += s.total;
            if (s.payment === 'cash')
                cash += s.total;
            else if (s.payment === 'kaspi')
                kaspi += s.total;
            else if (s.payment === 'transfer')
                transfer += s.total;
            else if (s.payment === 'mixed') {
                cash += Number(s.cashAmount) || 0;
                kaspi += Number(s.kaspiAmount) || 0;
                transfer += Number(s.transferAmount) || 0;
            }
        }
    });
    return {
        cash: cash,
        kaspi: kaspi,
        transfer: transfer,
        revenue: revenue,
        salesCount: sales.length
    };
}

function renderShiftLists(opts) {
    opts = opts || {};
    const onlyMine = !!opts.onlyMine;
    const openEl = document.getElementById(opts.openListId || 'shifts-open-list');
    const closedEl = document.getElementById(opts.closedListId || 'shifts-closed-list');
    if (!openEl || !closedEl)
        return;
    let allShifts = getShifts();
    if (onlyMine) {
        var myId = currentUser.id;
        var myEmail = (currentUser.email || '').toLowerCase();
        var myUsername = (currentUser.username || '').toLowerCase();
        allShifts = allShifts.filter(function (s) {
            if (s.cashierId === myId)
                return true;
            var cu = (s.cashierUsername || '').toLowerCase();
            return cu === myEmail || cu === myUsername;
        });
    }
    const openList = allShifts.filter(function (s) {
        return s.status === 'open';
    });
    const closedList = allShifts.filter(function (s) {
        return s.status === 'closed';
    }).reverse();
    if (onlyMine) {
        openEl.innerHTML = openList.length ? tableHTML([
            'Открыта',
            'Кем открыта',
            ''
        ], openList.map(function (s) {
            return [
                fmtDate(s.openedAt),
                s.openedBy || '\u2014',
                canManageShift(s) ? '<button class="btn btn-sm btn-danger" onclick="closeShiftConfirm(\'' + s.id + '\')">\u23F9 Закрыть и Excel</button>' : '\u2014'
            ];
        })) : '<div class="empty">Смена не открыта</div>';
        closedEl.innerHTML = closedList.length ? tableHTML([
            'Открыта',
            'Закрыта',
            'Продаж',
            'Выручка',
            ''
        ], closedList.map(function (s) {
            const t = s.totals || calcShiftTotals(s.id);
            return [
                fmtDate(s.openedAt),
                fmtDate(s.closedAt),
                t.salesCount,
                fmt(t.revenue),
                '<button class="btn btn-sm btn-secondary" onclick="exportShiftById(\'' + s.id + '\')">\uD83D\uDCE5 Excel</button>'
            ];
        })) : '<div class="empty">Закрытых смен пока нет</div>';
    } else {
        openEl.innerHTML = openList.length ? tableHTML([
            'Кассир',
            'Открыта',
            'Кем открыта',
            ''
        ], openList.map(function (s) {
            return [
                s.cashierName,
                fmtDate(s.openedAt),
                s.openedBy || '\u2014',
                canManageShift(s) ? '<button class="btn btn-sm btn-danger" onclick="closeShiftConfirm(\'' + s.id + '\')">\u23F9 Закрыть и Excel</button>' : '\u2014'
            ];
        })) : '<div class="empty">Нет открытых смен</div>';
        closedEl.innerHTML = closedList.length ? tableHTML([
            'Кассир',
            'Открыта',
            'Закрыта',
            'Продаж',
            'Выручка',
            ''
        ], closedList.map(function (s) {
            const t = s.totals || calcShiftTotals(s.id);
            return [
                s.cashierName,
                fmtDate(s.openedAt),
                fmtDate(s.closedAt),
                t.salesCount,
                fmt(t.revenue),
                '<button class="btn btn-sm btn-secondary" onclick="exportShiftById(\'' + s.id + '\')">\uD83D\uDCE5 Excel</button>'
            ];
        })) : '<div class="empty">Закрытых смен пока нет</div>';
    }
}

function renderShifts() {
    renderShiftLists({
        onlyMine: false,
        openListId: 'shifts-open-list',
        closedListId: 'shifts-closed-list'
    });
}

function renderMyShiftPage() {
    const shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    const ctrl = document.getElementById('myshift-controls');
    if (shift) {
        const t = calcShiftTotals(shift.id);
        ctrl.innerHTML = '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px;justify-content:space-between">' + '<div>' + '<div style="font-size:18px;font-weight:600;color:var(--ok)">\u25CF Смена открыта</div>' + '<div style="font-size:14px;color:var(--muted);margin-top:6px">С ' + fmtDate(shift.openedAt) + ' \xB7 Продаж: ' + t.salesCount + ' \xB7 Выручка: ' + fmt(t.revenue) + '</div>' + '</div>' + '<button class="btn btn-danger btn-lg" onclick="closeShiftConfirm(\'' + shift.id + '\')">\u23F9 Закрыть смену и Excel</button>' + '</div>';
    } else {
        ctrl.innerHTML = '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:16px;justify-content:space-between">' + '<div>' + '<div style="font-size:18px;font-weight:600;color:var(--warn)">Смена закрыта</div>' + '<div style="font-size:14px;color:var(--muted);margin-top:6px">Откройте смену, чтобы оформлять продажи</div>' + '</div>' + '<button class="btn btn-success btn-lg" onclick="openMyShift()">\u25B6 Открыть мою смену</button>' + '</div>';
    }
    renderShiftLists({
        onlyMine: true,
        openListId: 'myshift-open-list',
        closedListId: 'myshift-closed-list'
    });
    updateSaleShiftBanner();
}

function exportShiftToExcel(shift) {
    if (!shift)
        return;
    const sales = getSales().filter(function (s) {
        return s.shiftId === shift.id && isSaleActive(s);
    });
    const t = shift.totals || calcShiftTotals(shift.id);
    const receipts = groupSalesIntoReceipts(sales);
    const storeName = getCurrentStoreName ? getCurrentStoreName() : 'Магазин';
    const openedAt = new Date(shift.openedAt);
    const closedAt = shift.closedAt ? new Date(shift.closedAt) : null;
    let cogs = 0;
    sales.forEach(function (s) {
        cogs += (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
    });
    const grossProfit = (Number(t.revenue) || 0) - cogs;
    const expEnd = closedAt || new Date();
    const expTotal = getExpenses().filter(function (e) {
        if (!isExpenseActive(e))
            return false;
        if (!e.date)
            return false;
        const d = new Date(e.date);
        return d >= openedAt && d <= expEnd;
    }).reduce(function (sum, e) {
        return sum + (Number(e.amount) || 0);
    }, 0);
    const netProfit = grossProfit - expTotal;
    let html = '<html><head><meta charset="UTF-8"></head><body>';
    html += '<h2>Отчёт по смене \u2014 ' + esc(storeName) + '</h2>';
    html += '<table border="1" cellpadding="5" style="border-collapse:collapse;font-family:Arial">';
    html += '<tr><td><b>Магазин</b></td><td>' + esc(storeName) + '</td></tr>';
    html += '<tr><td><b>Кассир</b></td><td>' + esc(shift.cashierName) + '</td></tr>';
    html += '<tr><td><b>Логин</b></td><td>' + esc(shift.cashierUsername) + '</td></tr>';
    html += '<tr><td><b>Открыта</b></td><td>' + esc(fmtDate(shift.openedAt)) + '</td></tr>';
    html += '<tr><td><b>Закрыта</b></td><td>' + esc(shift.closedAt ? fmtDate(shift.closedAt) : '\u2014') + '</td></tr>';
    html += '<tr><td><b>Закрыл</b></td><td>' + esc(shift.closedBy || '\u2014') + '</td></tr>';
    html += '<tr><td><b>Строк продаж</b></td><td>' + t.salesCount + '</td></tr>';
    html += '<tr><td><b>Чеков</b></td><td>' + receipts.length + '</td></tr>';
    html += '<tr><td><b>Наличные</b></td><td>' + t.cash + '</td></tr>';
    html += '<tr><td><b>Kaspi QR</b></td><td>' + t.kaspi + '</td></tr>';
    html += '<tr><td><b>Банк</b></td><td>' + t.transfer + '</td></tr>';
    html += '<tr><td><b>Выручка</b></td><td>' + t.revenue + '</td></tr>';
    html += '<tr><td><b>Себестоимость</b></td><td>' + cogs + '</td></tr>';
    html += '<tr><td><b>Валовая прибыль</b></td><td>' + grossProfit + '</td></tr>';
    html += '<tr><td><b>Расходы (в смене)</b></td><td>' + expTotal + '</td></tr>';
    html += '<tr><td><b>Чистая прибыль</b></td><td>' + netProfit + '</td></tr>';
    html += '</table><br>';
    html += '<h3>Чеки за смену</h3>';
    html += '<table border="1" cellpadding="5" style="border-collapse:collapse">';
    html += '<tr style="background:#305496;color:#fff"><th>Чек</th><th>Дата</th><th>Товаров (шт)</th><th>Сумма</th><th>Оплата</th><th>Клиент</th><th>Телефон</th></tr>';
    receipts.forEach(function (r) {
        const cust = r.customerId ? getCustomers().find(function (c) {
            return c.id === r.customerId;
        }) : null;
        const itemsQty = r.items.reduce(function (sum, it) {
            return sum + (Number(it.quantity) || 0);
        }, 0);
        html += '<tr>' + '<td>' + esc(r.id.slice(-6)) + '</td>' + '<td>' + esc(fmtDate(r.date)) + '</td>' + '<td>' + itemsQty + '</td>' + '<td>' + (Number(r.total) || 0) + '</td>' + '<td>' + esc(PAY_LABELS[r.payment] || r.payment || '') + '</td>' + '<td>' + esc(cust ? cust.name : '\u2014') + '</td>' + '<td>' + esc(cust ? cust.phone : '\u2014') + '</td>' + '</tr>';
    });
    if (!receipts.length)
        html += '<tr><td colspan="7">Нет чеков</td></tr>';
    html += '</table><br>';
    html += '<h3>Продажи (строки) за смену</h3>';
    html += '<table border="1" cellpadding="5" style="border-collapse:collapse">';
    html += '<tr style="background:#4472C4;color:#fff"><th>Чек</th><th>Код</th><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Закуп</th><th>Сумма</th><th>Прибыль</th><th>Оплата</th><th>Дата</th></tr>';
    sales.forEach(function (s) {
        const lineCogs = (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
        const lineProfit = (Number(s.total) || 0) - lineCogs;
        html += '<tr>' + '<td>' + esc((s.receiptId || s.id).slice(-6)) + '</td>' + '<td>' + esc(s.productCode) + '</td>' + '<td>' + esc(s.productName) + '</td>' + '<td>' + (Number(s.quantity) || 0) + '</td>' + '<td>' + (Number(s.unitPrice) || 0) + '</td>' + '<td>' + (Number(s.purchasePrice) || 0) + '</td>' + '<td>' + (Number(s.total) || 0) + '</td>' + '<td>' + lineProfit + '</td>' + '<td>' + esc(PAY_LABELS[s.payment] || s.payment) + '</td>' + '<td>' + esc(fmtDate(s.date)) + '</td>' + '</tr>';
    });
    if (!sales.length)
        html += '<tr><td colspan="10">Нет продаж</td></tr>';
    html += '</table></body></html>';
    const safeStore = String(storeName || 'store').replace(/[\\\/:*?"<>|]/g, '').replace(/\s+/g, '_');
    const fname = 'Смена_' + safeStore + '_' + (shift.cashierUsername || 'cashier') + '_' + (shift.closedAt || shift.openedAt).slice(0, 10).replace(/-/g, '') + '.xls';
    downloadFile(fname, html, 'application/vnd.ms-excel');
}




function exportShiftsExcel() {
    exportSectionToExcel('shifts', window._shiftStatsData || [], 'SANAQ_Смены_' + todayStr() + '.xlsx');
}

function openMyShift() {
    try {
        const cashierKey = currentUser.email || currentUser.username || currentUser.id;
        if (getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(cashierKey)) {
            toast('Ваша смена уже открыта', 'err');
            return;
        }
        const shifts = getShifts();
        var newId = uid();
        shifts.push({
            id: newId,
            cashierId: currentUser.id,
            cashierUsername: currentUser.email || currentUser.username || '',
            cashierName: currentUser.name,
            openedAt: new Date().toISOString(),
            closedAt: null,
            status: 'open',
            openedBy: currentUser.name
        });
        setShifts(shifts);
        var verify = getOpenShiftForCashier(currentUser.id);
        if (!verify) {
            console.error('[Shift] Shift not found in cache after setShifts!');
            var retry = getShifts();
            retry.push({
                id: newId,
                cashierId: currentUser.id,
                cashierUsername: currentUser.email || currentUser.username || '',
                cashierName: currentUser.name,
                openedAt: new Date().toISOString(),
                closedAt: null,
                status: 'open',
                openedBy: currentUser.name
            });
            setShifts(retry);
        }
        toast('Смена открыта: ' + currentUser.name, 'ok');
        renderMyShiftPage();
        updateSaleShiftBanner();
    } catch (e) {
        console.error('[Shift] openMyShift error:', e);
        toast('Ошибка открытия смены: ' + (e.message || e), 'err');
    }
}

function openShift() {
    if (!currentUser) {
        toast('Пользователь не авторизован', 'err');
        return;
    }
    const cashierKey = currentUser.email || currentUser.username || currentUser.id;
    if (getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(cashierKey)) {
        toast('Ваша смена уже открыта', 'err');
        return;
    }
    const shifts = getShifts();
    var newShift = {
        id: uid(),
        cashierId: currentUser.id,
        cashierUsername: currentUser.email || currentUser.username || '',
        cashierName: currentUser.name,
        openedAt: new Date().toISOString(),
        closedAt: null,
        status: 'open',
        openedBy: currentUser.name
    };
    shifts.push(newShift);
    setShifts(shifts);
    addAuditLog('Открытие смены', 'Смена #' + newShift.id.slice(-6) + ' кассира ' + newShift.cashierName, '\uD83D\uDD13');
    toast('Смена открыта: ' + currentUser.name, 'ok');
    if (isAdmin())
        renderCashiersPage();
    else {
        renderMyShiftPage();
        goPage('myshift');
    }
    updateSaleShiftBanner();
    var _shiftId = newShift.id;
    setTimeout(function () {
        var stillHere = getOpenShiftForCashier(currentUser.id);
        if (!stillHere || stillHere.id !== _shiftId) {
            console.error('[Shift] LOST after 2s! Expected:', _shiftId, 'Found:', stillHere ? stillHere.id : null);
            console.error('[Shift] Cache shifts:', JSON.stringify(getShifts().map(function (s) {
                return {
                    id: s.id,
                    status: s.status
                };
            })));
        } else {
            console.log('[Shift] OK after 2s:', _shiftId);
        }
    }, 2000);
    setTimeout(function () {
        var stillHere = getOpenShiftForCashier(currentUser.id);
        if (!stillHere || stillHere.id !== _shiftId) {
            console.error('[Shift] LOST after 10s! Expected:', _shiftId, 'Found:', stillHere ? stillHere.id : null);
        } else {
            console.log('[Shift] OK after 10s:', _shiftId);
        }
    }, 10000);
}

function closeShiftConfirm(shiftId) {
    const shift = getShifts().find(function (s) {
        return s.id === shiftId;
    });
    if (!shift || shift.status !== 'open') {
        toast('Смена уже закрыта', 'err');
        return;
    }
    if (!canManageShift(shift)) {
        toast('Нет прав закрыть эту смену', 'err');
        return;
    }
    document.getElementById('confirm-title').textContent = 'Закрыть смену?';
    document.getElementById('confirm-msg').textContent = 'Смена кассира \xAB' + shift.cashierName + '\xBB будет закрыта навсегда. ' + 'Повторно открыть её нельзя. Отчёт будет сохранён в файл Excel.';
    document.getElementById('confirm-ok').textContent = 'Закрыть и сохранить Excel';
    document.getElementById('confirm-ok').className = 'btn btn-danger';
    setStore('confirmCallback', function () {
        document.getElementById('confirm-ok').textContent = 'Удалить';
        closeShift(shiftId);
    });
    openModal('modal-confirm');
}

function exportShiftById(shiftId) {
    const shift = getShifts().find(function (s) {
        return s.id === shiftId;
    });
    if (shift)
        exportShiftToExcel(shift);
}




var _ex={};
try{_ex['getShifts']=getShifts}catch(e){}
try{_ex['setShifts']=setShifts}catch(e){}
try{_ex['canManageShift']=canManageShift}catch(e){}
try{_ex['renderShiftStats']=renderShiftStats}catch(e){}
try{_ex['closeShift']=closeShift}catch(e){}
try{_ex['calcShiftTotals']=calcShiftTotals}catch(e){}
try{_ex['renderShiftLists']=renderShiftLists}catch(e){}
try{_ex['renderShifts']=renderShifts}catch(e){}
try{_ex['renderMyShiftPage']=renderMyShiftPage}catch(e){}
try{_ex['exportShiftToExcel']=exportShiftToExcel}catch(e){}
try{_ex['exportShiftsExcel']=exportShiftsExcel}catch(e){}
try{_ex['openMyShift']=openMyShift}catch(e){}
try{_ex['openShift']=openShift}catch(e){}
try{_ex['closeShiftConfirm']=closeShiftConfirm}catch(e){}
try{_ex['exportShiftById']=exportShiftById}catch(e){}
return _ex;})();

// users
__mod['users']=(function(){
var addAuditLog=__mf('sales','addAuditLog');
var getSales=__mf('sales','getSales');
var esc=__mf('utils','esc');
var tableHTML=__mf('utils','tableHTML');
var fmt=__mf('utils','fmt');
var closeModal=__mf('utils','closeModal');
var setStore=__mf('store','setStore');
var openModal=__mf('ui','openModal');
var isSaleActive=__mf('sales','isSaleActive');
var DEFAULT_PERMISSIONS=__mv('constants','DEFAULT_PERMISSIONS');
var refreshAll=__mf('ui','refreshAll');
var currentStoreId=__mv('store','currentStoreId');
var _pendingMaxDisc=__mv('store','_pendingMaxDisc');
var _pendingPerms=__mv('store','_pendingPerms');
var setAdminPinCallback=__mf('auth','setAdminPinCallback');
var getShifts=__mf('shifts','getShifts');
var card=__mf('utils','card');
var _setPerm=__mf('utils','_setPerm');
var PERMISSION_LABELS=__mv('constants','PERMISSION_LABELS');
var PAGE_PERMISSION_GROUP=__mv('constants','PAGE_PERMISSION_GROUP');
var exportSectionToExcel=__mf('reports','exportSectionToExcel');
var showCustomModal=__mf('ui','showCustomModal');
var applyRoleUI=__mf('ui','applyRoleUI');
var renderShifts=__mf('shifts','renderShifts');
var toast=__mf('notifications','toast');
var _adminPinCallback=__mv('auth','_adminPinCallback');
var getUserPin=__mf('auth','getUserPin');
var set=__mf('app-context','set');
var fmtDate=__mf('utils','fmtDate');
var PERMISSION_GROUPS=__mv('constants','PERMISSION_GROUPS');
var todayStr=__mf('utils','todayStr');



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

function _getCashierShares() {
    var fromDb = (window.ApDb && window.ApDb.getAppData && window.ApDb.getAppData('cashier_shares'));
    if (fromDb && typeof fromDb === 'object') return fromDb;
    var shares = {};
    try {
        for (var i = 0; i < localStorage.length; i++) {
            var k = localStorage.key(i);
            if (k && k.indexOf('sanaq_share_') === 0) {
                shares[k.replace('sanaq_share_', '')] = parseFloat(localStorage.getItem(k)) || 5;
            }
        }
    } catch(e) {}
    return shares;
}

function _setCashierShare(username, val) {
    val = Math.min(100, Math.max(0, val));
    localStorage.setItem('sanaq_share_' + username, String(val));
    var shares = _getCashierShares();
    shares[username] = val;
    if (window.ApDb && window.ApDb.setAppData) window.ApDb.setAppData('cashier_shares', shares);
}

function getCashierShare() {
    var username = currentUser && currentUser.username || 'default';
    var shares = _getCashierShares();
    return parseFloat(shares[username]) || 5;
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
            var allShares = _getCashierShares();
            var pct = isCashierRole ? parseFloat(allShares[sh.cashierUsername || '']) || 5 : 0;
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
    var fromDb = (window.ApDb && window.ApDb.getAppData && window.ApDb.getAppData('local_users'));
    if (fromDb && Array.isArray(fromDb) && fromDb.length) return fromDb;
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
    if (window.ApDb && window.ApDb.setAppData) window.ApDb.setAppData('local_users', arr);
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

async function verifyAdminPin() {
    var pin = document.getElementById('admin-pin-input').value.trim();
    if (!pin) {
        document.getElementById('admin-pin-error').style.display = 'block';
        return;
    }
    var admins = getUsers().filter(function (u) { return u.role === 'admin'; });
    if (!admins.length) {
        console.warn('[SANAQ PIN] verifyAdminPin: нет администраторов');
        return;
    }
    var ok = false;
    for (var i = 0; i < admins.length; i++) {
        if (await verifyPin(admins[i].id, pin)) { ok = true; break; }
    }
    if (ok) {
        closeModal('modal-admin-pin');
        var cb = _adminPinCallback;
        setAdminPinCallback(null);
        addAuditLog('Подтверждение администратора', 'Операция подтверждена PIN', '\uD83D\uDD10');
        if (cb) cb();
    } else {
        console.log('[SANAQ PIN] verifyAdminPin: ни один админский PIN не совпал');
        document.getElementById('admin-pin-error').style.display = 'block';
    }
}

function saveCashierShare() {
    var val = parseFloat(document.getElementById('cashier-share-input').value) || 0;
    _setCashierShare(currentUser && currentUser.username || 'default', val);
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
            var allShares = _getCashierShares();
            document.getElementById('cashier-percent').value = parseFloat(allShares[u.email || u.username || '']) || 5;
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
        _setCashierShare(username, shareVal);
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
        _setCashierShare(localUsers[localIdx].username, shareVal);
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
        _setCashierShare(u.email || u.username || '', shareVal);
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
        var templates = (window.ApDb && window.ApDb.getAppData && window.ApDb.getAppData('perm_templates')) || JSON.parse(localStorage.getItem('sanaq_perm_templates_' + (currentStoreId || '')) || '[]');
        templates.push({
            name: name,
            permissions: perms,
            createdAt: new Date().toISOString()
        });
        if (window.ApDb && window.ApDb.setAppData) window.ApDb.setAppData('perm_templates', templates);
        localStorage.setItem('sanaq_perm_templates_' + (currentStoreId || ''), JSON.stringify(templates));
        toast('Шаблон "' + name + '" сохранён', 'ok');
    } catch (e) {
        toast('Ошибка сохранения шаблона', 'err');
    }
}

function applyPermissionTemplate() {
    try {
        var templates = (window.ApDb && window.ApDb.getAppData && window.ApDb.getAppData('perm_templates')) || JSON.parse(localStorage.getItem('sanaq_perm_templates_' + (currentStoreId || '')) || '[]');
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

var _ex={};
try{_ex['currentUser']=currentUser}catch(e){}
try{_ex['setCurrentUser']=setCurrentUser}catch(e){}
try{_ex['getUsers']=getUsers}catch(e){}
try{_ex['setUsers']=setUsers}catch(e){}
try{_ex['getCashiers']=getCashiers}catch(e){}
try{_ex['getOpenShiftForCashier']=getOpenShiftForCashier}catch(e){}
try{_ex['getCashierShare']=getCashierShare}catch(e){}
try{_ex['renderCashierStats']=renderCashierStats}catch(e){}
try{_ex['renderCashiersPage']=renderCashiersPage}catch(e){}
try{_ex['renderCashiersTable']=renderCashiersTable}catch(e){}
try{_ex['_localUsersKey']=_localUsersKey}catch(e){}
try{_ex['getLocalUsers']=getLocalUsers}catch(e){}
try{_ex['setLocalUsers']=setLocalUsers}catch(e){}
try{_ex['getAllUsers']=getAllUsers}catch(e){}
try{_ex['getUserData']=getUserData}catch(e){}
try{_ex['getUserPermissions']=getUserPermissions}catch(e){}
try{_ex['getUserMaxDiscount']=getUserMaxDiscount}catch(e){}
try{_ex['setUserPermissions']=setUserPermissions}catch(e){}
try{_ex['_permUserId']=_permUserId}catch(e){}
try{_ex['_pendingSwitchUserId']=_pendingSwitchUserId}catch(e){}
try{_ex['_findUserAnywhere']=_findUserAnywhere}catch(e){}
try{_ex['doSwitchUser']=doSwitchUser}catch(e){}
try{_ex['openInviteCashierModal']=openInviteCashierModal}catch(e){}
try{_ex['isAdmin']=isAdmin}catch(e){}
try{_ex['hasGroupPermission']=hasGroupPermission}catch(e){}
try{_ex['posCashierName']=posCashierName}catch(e){}
try{_ex['requireAdminPin']=requireAdminPin}catch(e){}
try{_ex['verifyAdminPin']=verifyAdminPin}catch(e){}
try{_ex['saveCashierShare']=saveCashierShare}catch(e){}
try{_ex['exportCashiersExcel']=exportCashiersExcel}catch(e){}
try{_ex['switchCashiersTab']=switchCashiersTab}catch(e){}
try{_ex['fillAdminProfileForm']=fillAdminProfileForm}catch(e){}
try{_ex['saveAdminProfile']=saveAdminProfile}catch(e){}
try{_ex['openCashierModal']=openCashierModal}catch(e){}
try{_ex['editCashierAccount']=editCashierAccount}catch(e){}
try{_ex['saveCashier']=saveCashier}catch(e){}
try{_ex['checkPermission']=checkPermission}catch(e){}
try{_ex['renderPermissionsEditor']=renderPermissionsEditor}catch(e){}
try{_ex['savePermission']=savePermission}catch(e){}
try{_ex['saveCashierMaxDiscount']=saveCashierMaxDiscount}catch(e){}
try{_ex['selectAllPermissions']=selectAllPermissions}catch(e){}
try{_ex['deselectAllPermissions']=deselectAllPermissions}catch(e){}
try{_ex['filterPermissions']=filterPermissions}catch(e){}
try{_ex['copyPermissionsFromUser']=copyPermissionsFromUser}catch(e){}
try{_ex['applyCopiedPermissions']=applyCopiedPermissions}catch(e){}
try{_ex['savePermissionTemplate']=savePermissionTemplate}catch(e){}
try{_ex['applyPermissionTemplate']=applyPermissionTemplate}catch(e){}
try{_ex['openCashierSwitch']=openCashierSwitch}catch(e){}
try{_ex['switchToUser']=switchToUser}catch(e){}
return _ex;})();

// settings
__mod['settings']=(function(){
var toast=__mf('notifications','toast');
var applyUIPosMode=__mf('ui','applyUIPosMode');
var openModal=__mf('ui','openModal');
var closeModal=__mf('utils','closeModal');
var currentStoreId=__mv('store','currentStoreId');
var applyUIVisibility=__mf('ui','applyUIVisibility');



var _uiSettings = null;

function getUISettings() {
    if (_uiSettings)
        return _uiSettings;
    var v = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('ui_settings') : null;
    if (v && typeof v === 'object') {
        _uiSettings = v;
        return _uiSettings;
    }
    try {
        _uiSettings = JSON.parse(localStorage.getItem('sanaq_ui_settings') || '{}');
    } catch (e) {
        _uiSettings = {};
    }
    return _uiSettings;
}

function saveUISettings() {
    localStorage.setItem('sanaq_ui_settings', JSON.stringify(_uiSettings));
    if (window.ApDb && window.ApDb.setAppData)
        window.ApDb.setAppData('ui_settings', _uiSettings);
}

function applyUISettings() {
    var s = getUISettings();
    var scale = s.scale || 1;
    var cardSize = s.cardSize || 1;
    var cols = s.cols || 4;
    var btnSize = s.buttonSize || 1;
    var colsCss = cols;
    if (window.innerWidth < 768)
        colsCss = Math.min(cols, 3);
    if (window.innerWidth < 480)
        colsCss = Math.min(cols, 2);
    var styleEl = document.getElementById('ui-dynamic-style');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'ui-dynamic-style';
        document.head.appendChild(styleEl);
    }
    styleEl.textContent = 'html { font-size: ' + 14 * scale + 'px !important; }' + '.card { padding: ' + 20 * cardSize + 'px !important; }' + '.card-value { font-size: ' + 1.8 * cardSize + 'em !important; }' + '.panel { padding: ' + 16 * cardSize + 'px !important; }' + '.modal { padding: ' + 4 * cardSize + 'px !important; }' + '.modal-body { padding: ' + 16 * cardSize + 'px !important; }' + '#pos-products { --grid-cols: ' + colsCss + '; }' + '.btn, button:not(.icon-btn):not(.nav-btn):not(.pos-btm-btn):not(.tab):not(.modal-close) { ' + '  padding: ' + 8 * btnSize + 'px ' + 14 * btnSize + 'px !important; ' + '  font-size: ' + 13 * btnSize + 'px !important; ' + '  border-radius: ' + 6 * btnSize + 'px !important; ' + '}';
    applyUIVisibility();
    applyUIPosMode(s.posMode || 'standard');
}




function openStoreSettings() {
    var ds = window.DataService;
    document.getElementById('store-bin').value = (ds ? ds.getAppData('store_bin') : null) || localStorage.getItem('ap_store_bin') || '';
    document.getElementById('store-address').value = (ds ? ds.getAppData('store_address') : null) || localStorage.getItem('ap_store_address') || '';
    document.getElementById('store-nds-cert').value = (ds ? ds.getAppData('store_nds_cert') : null) || localStorage.getItem('ap_store_nds_cert') || '';
    document.getElementById('store-bank-name').value = (ds ? ds.getAppData('store_bank_name') : null) || localStorage.getItem('ap_store_bank_name') || '';
    document.getElementById('store-iik').value = (ds ? ds.getAppData('store_iik') : null) || localStorage.getItem('ap_store_iik') || '';
    document.getElementById('store-bik').value = (ds ? ds.getAppData('store_bik') : null) || localStorage.getItem('ap_store_bik') || '';
    var savedLimit = (ds ? ds.getAppData('return_limit') : null) || parseInt(localStorage.getItem('sanaq_return_limit_' + (currentStoreId || '')) || '3');
    var limitInput = document.getElementById('setting-return-limit');
    if (limitInput)
        limitInput.value = savedLimit;
    openModal('modal-store-settings');
}

function saveStoreSettings() {
    var ds = window.DataService;
    var bin = document.getElementById('store-bin').value.trim();
    var addr = document.getElementById('store-address').value.trim();
    var nds = document.getElementById('store-nds-cert').value.trim();
    var bank = document.getElementById('store-bank-name').value.trim();
    var iik = document.getElementById('store-iik').value.trim();
    var bik = document.getElementById('store-bik').value.trim();
    var returnLimit = parseInt(document.getElementById('setting-return-limit').value) || 3;
    localStorage.setItem('ap_store_bin', bin);
    localStorage.setItem('ap_store_address', addr);
    localStorage.setItem('ap_store_nds_cert', nds);
    localStorage.setItem('ap_store_bank_name', bank);
    localStorage.setItem('ap_store_iik', iik);
    localStorage.setItem('ap_store_bik', bik);
    try {
        localStorage.setItem('sanaq_return_limit_' + (currentStoreId || ''), returnLimit);
    } catch (e) {
    }
    if (ds) {
        ds.setAppData('store_bin', bin);
        ds.setAppData('store_address', addr);
        ds.setAppData('store_nds_cert', nds);
        ds.setAppData('store_bank_name', bank);
        ds.setAppData('store_iik', iik);
        ds.setAppData('store_bik', bik);
        ds.setAppData('return_limit', returnLimit);
    }
    toast('Настройки сохранены', 'ok');
    closeModal('modal-store-settings');
}




var _ex={};
try{_ex['_uiSettings']=_uiSettings}catch(e){}
try{_ex['getUISettings']=getUISettings}catch(e){}
try{_ex['saveUISettings']=saveUISettings}catch(e){}
try{_ex['applyUISettings']=applyUISettings}catch(e){}
try{_ex['openStoreSettings']=openStoreSettings}catch(e){}
try{_ex['saveStoreSettings']=saveStoreSettings}catch(e){}
return _ex;})();

// debts
__mod['debts']=(function(){
var confirmAction=__mf('utils','confirmAction');
var exportSectionToExcel=__mf('reports','exportSectionToExcel');
var closeModal=__mf('utils','closeModal');
var showPaymentMethodModal=__mf('utils','showPaymentMethodModal');
var todayStr=__mf('utils','todayStr');
var esc=__mf('utils','esc');
var fmt=__mf('utils','fmt');
var fmtDate=__mf('utils','fmtDate');
var uid=__mf('ui','uid');
var currentUser=__mv('users','currentUser');
var completeDebtPayment=__mf('sales','completeDebtPayment');
var toast=__mf('notifications','toast');
var openModal=__mf('ui','openModal');



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




var _ex={};
try{_ex['getDebts']=getDebts}catch(e){}
try{_ex['setDebts']=setDebts}catch(e){}
try{_ex['getDebtors']=getDebtors}catch(e){}
try{_ex['setDebtors']=setDebtors}catch(e){}
try{_ex['currentDebtorId']=currentDebtorId}catch(e){}
try{_ex['populateDebtClientSelector']=populateDebtClientSelector}catch(e){}
try{_ex['migrateDebtData']=migrateDebtData}catch(e){}
try{_ex['cancelDebt']=cancelDebt}catch(e){}
try{_ex['changeDebtorRating']=changeDebtorRating}catch(e){}
try{_ex['renderDebts']=renderDebts}catch(e){}
try{_ex['onDebtClientChange']=onDebtClientChange}catch(e){}
try{_ex['openNewDebtorModal']=openNewDebtorModal}catch(e){}
try{_ex['openAddDebt']=openAddDebt}catch(e){}
try{_ex['saveDebt']=saveDebt}catch(e){}
try{_ex['openPayDebt']=openPayDebt}catch(e){}
try{_ex['submitDebtPayment']=submitDebtPayment}catch(e){}
try{_ex['renderDebtsList']=renderDebtsList}catch(e){}
try{_ex['selectDebtor']=selectDebtor}catch(e){}
try{_ex['renderDebtorDetail']=renderDebtorDetail}catch(e){}
try{_ex['deleteDebt']=deleteDebt}catch(e){}
try{_ex['deleteDebtor']=deleteDebtor}catch(e){}
try{_ex['exportDebtsExcel']=exportDebtsExcel}catch(e){}
return _ex;})();

// categories
__mod['categories']=(function(){
var confirmAction=__mf('utils','confirmAction');
var clearBulkSelection=__mf('utils','clearBulkSelection');
var onSaleSearch=__mf('sales','onSaleSearch');
var getProducts=__mf('products','getProducts');
var esc=__mf('utils','esc');
var renderProducts=__mf('products','renderProducts');
var checkPermission=__mf('users','checkPermission');
var toast=__mf('notifications','toast');
var _posBrowserState=__mv('statistics','_posBrowserState');
var uid=__mf('ui','uid');
var setProducts=__mf('products','setProducts');
var setStore=__mf('store','setStore');
var closeModal=__mf('utils','closeModal');
var _catDragSrc=__mv('store','_catDragSrc');
var _bulkSelected=__mv('store','_bulkSelected');
var openModal=__mf('ui','openModal');



function getCategories() {
    return window.ApDb ? window.ApDb.getCategories() : [];
}

function setCategories(arr) {
    if (window.ApDb)
        window.ApDb.setCategories(arr);
}

function renderCategoriesList(containerId) {
    var container = document.getElementById(containerId || 'categories-list');
    if (!container)
        return;
    var list = getCategories();
    var html = '';
    var canEditCat = checkPermission('editCategory');
    var canDeleteCat = checkPermission('deleteCategory');
    if (!list.length) {
        html = '<div class="empty">Нет разделов</div>';
    } else {
        html = '<div id="categories-sortable">';
        list.forEach(function (c, i) {
            var color = c.color || '#2563EB';
            var icon = c.icon || '\uD83D\uDCE6';
            html += '<div class="cat-card" draggable="true" data-index="' + i + '" data-id="' + c.id + '" ondragstart="onCatDragStart(event)" ondragover="onCatDragOver(event)" ondrop="onCatDrop(event,\'' + (containerId || '') + '\')" ondragend="onCatDragEnd(event)">' + '<div class="cat-card-inner">' + '<span class="cat-drag-handle" title="Перетащить">\u283F</span>' + '<span class="cat-color-dot" style="background:' + color + '"></span>' + '<span class="cat-icon-display">' + icon + '</span>' + '<span style="flex:1;font-weight:600;color:var(--text)">' + esc(c.name) + '</span>' + (canEditCat ? '<button class="icon-btn" onclick="editCategory(\'' + c.id + '\',\'' + (containerId || '') + '\')" style="font-size:13px" title="Редактировать">\u270F️</button>' : '') + (canDeleteCat ? '<button class="icon-btn del" onclick="deleteCategory(\'' + c.id + '\',\'' + (containerId || '') + '\')" style="font-size:14px" title="Удалить">\u2715</button>' : '') + '</div></div>';
        });
        html += '</div>';
    }
    container.innerHTML = html;
}

var CATEGORY_ICONS = [
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
    var pageWrap = document.getElementById('new-category-wrapper-page');
    if (pageWrap)
        pageWrap.style.display = checkPermission('addCategory') ? 'flex' : 'none';
    var pageHint = document.getElementById('page-cat-drag-hint');
    if (pageHint)
        pageHint.style.display = checkPermission('editCategory') ? 'block' : 'none';
}

function pageAddCategory() {
    if (!checkPermission('addCategory')) {
        toast('Нет прав на добавление разделов', 'err');
        return;
    }
    var nameInput = document.getElementById('page-new-category-name');
    if (!nameInput)
        return;
    var name = nameInput.value.trim();
    if (!name)
        return;
    var list = getCategories();
    if (list.some(function (c) {
            return c.name.toLowerCase() === name.toLowerCase();
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
    var wrap = document.getElementById('new-category-wrapper');
    var hint = document.getElementById('cat-drag-hint');
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
    var name = document.getElementById('new-category-name').value.trim();
    if (!name)
        return;
    var list = getCategories();
    if (list.some(function (c) {
            return c.name.toLowerCase() === name.toLowerCase();
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
        var list = getCategories();
        list = list.filter(function (c) {
            return c.id !== id;
        });
        setCategories(list);
        renderCategoriesList(containerId);
        toast('Раздел удален', 'ok');
    });
}

function editCategory(id, containerId) {
    var list = getCategories();
    var cat = list.find(function (c) {
        return c.id === id;
    });
    if (!cat)
        return;
    var container = document.getElementById(containerId || 'categories-list');
    if (!container)
        return;
    var card = container.querySelector('.cat-card[data-id="' + id + '"]');
    if (!card)
        return;
    var inner = card.querySelector('.cat-card-inner');
    var color = cat.color || '#2563EB';
    var icon = cat.icon || '\uD83D\uDCE6';
    var cid = containerId || '';
    inner.innerHTML = '<div class="cat-edit-inline">' + '<input type="text" id="cat-edit-name-' + id + '" value="' + esc(cat.name) + '" placeholder="Название">' + '<input type="color" id="cat-edit-color-' + id + '" value="' + color + '">' + '<span class="cat-icon-display" id="cat-edit-icon-display-' + id + '">' + icon + '</span>' + '<div class="cat-icon-grid">' + CATEGORY_ICONS.map(function (ic) {
        return '<button type="button" class="' + (ic === icon ? 'active' : '') + '" onclick="selectCatIcon(\'' + id + '\',\'' + ic + '\')">' + ic + '</button>';
    }).join('') + '</div>' + '<button class="btn btn-primary btn-sm" onclick="saveCategory(\'' + id + '\',\'' + cid + '\')">Сохранить</button>' + '<button class="btn btn-secondary btn-sm" onclick="renderCategoriesList(\'' + cid + '\')">Отмена</button>' + '</div>';
}

function selectCatIcon(id, ic) {
    var display = document.getElementById('cat-edit-icon-display-' + id);
    if (display)
        display.textContent = ic;
    var grid = display.parentElement.querySelector('.cat-icon-grid');
    if (grid) {
        grid.querySelectorAll('button').forEach(function (b) {
            b.classList.toggle('active', b.textContent === ic);
        });
    }
}

function saveCategory(id, containerId) {
    if (!checkPermission('editCategory')) {
        toast('Нет прав на редактирование разделов', 'err');
        return;
    }
    var nameEl = document.getElementById('cat-edit-name-' + id);
    var colorEl = document.getElementById('cat-edit-color-' + id);
    var displayEl = document.getElementById('cat-edit-icon-display-' + id);
    if (!nameEl || !colorEl || !displayEl)
        return;
    var name = nameEl.value.trim();
    if (!name) {
        toast('Введите название', 'err');
        return;
    }
    var list = getCategories();
    var cat = list.find(function (c) {
        return c.id === id;
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
    var card = e.target.closest('.cat-card');
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
    var card = e.target.closest('.cat-card');
    if (card && card !== _catDragSrc) {
        card.classList.add('drag-over');
    }
}

function onCatDrop(e, containerId) {
    e.preventDefault();
    var target = e.target.closest('.cat-card');
    if (!target || !_catDragSrc || target === _catDragSrc)
        return;
    var list = getCategories();
    var fromIdx = parseInt(_catDragSrc.dataset.index);
    var toIdx = parseInt(target.dataset.index);
    if (isNaN(fromIdx) || isNaN(toIdx))
        return;
    var item = list.splice(fromIdx, 1)[0];
    list.splice(toIdx, 0, item);
    list.forEach(function (c, i) {
        c.order = i;
    });
    setCategories(list);
    renderCategoriesList(containerId);
    toast('Порядок изменён', 'ok');
    setStore('_catDragSrc', null);
}

function onCatDragEnd(e) {
    document.querySelectorAll('.cat-card').forEach(function (c) {
        c.classList.remove('dragging', 'drag-over');
    });
    setStore('_catDragSrc', null);
}

function filterCategory(catId) {
    document.querySelectorAll('#pos-cat-strip button').forEach(function (b) {
        b.classList.remove('active');
    });
    if (catId) {
        var btn = document.querySelector('#pos-cat-strip button[data-cat-id="' + catId + '"]');
        if (btn) btn.classList.add('active');
    } else {
        var allBtn = document.querySelector('#pos-cat-strip button:first-child');
        if (allBtn) allBtn.classList.add('active');
    }
    _posBrowserState.cat = catId === '__favorites__' ? '' : catId;
    var searchEl = document.getElementById('sale-search');
    if (searchEl) {
        searchEl.value = '';
        if (catId === '__favorites__') {
            var area = document.getElementById('pos-prod-area');
            if (area) {
                var favs = getProducts().filter(function (p) { return p.favorite; });
                if (!favs.length) {
                    area.innerHTML = '<div class="pos-prod-empty">Нет быстрых товаров</div>';
                } else {
                    area.innerHTML = favs.map(function (p) {
                        return '<div class="pos-prod-card" onclick="addToCart(\'' + p.id + '\')">' +
                            '<div class="pp-name">' + esc(p.name) + '</div>' +
                            '<div class="pp-price">' + fmt(p.price) + ' ₸</div>' +
                            '<div class="pp-stock">ост. ' + p.quantity + '</div></div>';
                    }).join('');
                }
            }
        } else {
            onSaleSearch();
        }
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
    var sel = document.getElementById('bulk-cat-select');
    sel.innerHTML = '<option value="">Без категории</option>' + getCategories().map(function (c) {
        return '<option value="' + c.id + '">' + esc(c.name) + '</option>';
    }).join('');
    openModal('modal-bulk-category');
}

function applyBulkCategory() {
    var cat = document.getElementById('bulk-cat-select').value;
    var list = getProducts();
    var changed = 0;
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




var _ex={};
try{_ex['getCategories']=getCategories}catch(e){}
try{_ex['setCategories']=setCategories}catch(e){}
try{_ex['renderCategoriesList']=renderCategoriesList}catch(e){}
try{_ex['CATEGORY_ICONS']=CATEGORY_ICONS}catch(e){}
try{_ex['renderCategoriesPage']=renderCategoriesPage}catch(e){}
try{_ex['pageAddCategory']=pageAddCategory}catch(e){}
try{_ex['openCategoriesModal']=openCategoriesModal}catch(e){}
try{_ex['addCategory']=addCategory}catch(e){}
try{_ex['deleteCategory']=deleteCategory}catch(e){}
try{_ex['editCategory']=editCategory}catch(e){}
try{_ex['selectCatIcon']=selectCatIcon}catch(e){}
try{_ex['saveCategory']=saveCategory}catch(e){}
try{_ex['onCatDragStart']=onCatDragStart}catch(e){}
try{_ex['onCatDragOver']=onCatDragOver}catch(e){}
try{_ex['onCatDrop']=onCatDrop}catch(e){}
try{_ex['onCatDragEnd']=onCatDragEnd}catch(e){}
try{_ex['filterCategory']=filterCategory}catch(e){}
try{_ex['posSelectCat']=posSelectCat}catch(e){}
try{_ex['filterCategoryFromModal']=filterCategoryFromModal}catch(e){}
try{_ex['bulkChangeCategory']=bulkChangeCategory}catch(e){}
try{_ex['applyBulkCategory']=applyBulkCategory}catch(e){}
return _ex;})();

// sync
__mod['sync']=(function(){
var confirmAction=__mf('utils','confirmAction');
var setDebtors=__mf('debts','setDebtors');
var getProducts=__mf('products','getProducts');
var setDebts=__mf('debts','setDebts');
var getDeferred=__mf('sales','getDeferred');
var getCategories=__mf('categories','getCategories');
var setCategories=__mf('categories','setCategories');
var getShifts=__mf('shifts','getShifts');
var getDebtors=__mf('debts','getDebtors');
var getDebts=__mf('debts','getDebts');
var setDeferred=__mf('sales','setDeferred');
var setCustomers=__mf('customers','setCustomers');
var getCustomers=__mf('customers','getCustomers');
var isAdmin=__mf('users','isAdmin');
var getExpenses=__mf('expenses','getExpenses');
var setProducts=__mf('products','setProducts');
var currentUser=__mv('users','currentUser');
var getCurrentStoreName=__mf('utils','getCurrentStoreName');
var refreshAll=__mf('ui','refreshAll');
var getSales=__mf('sales','getSales');
var toast=__mf('notifications','toast');



async function syncWithSupabase() {
    if (!currentUser || !window.ApDb)
        return;
    try {
        await window.ApDb.refresh();
        refreshAll();
    } catch (e) {
        console.error('Sync error:', e);
    }
}

var _postSaveSyncTimer = null;

function _schedulePostSaveSync() {
    if (_postSaveSyncTimer)
        clearTimeout(_postSaveSyncTimer);
    _postSaveSyncTimer = setTimeout(function () {
        if (window.ApDb && typeof window.ApDb.refresh === 'function') {
            window.ApDb.refresh().catch(function () {
            });
        }
    }, 4000);
}




function syncFromPurchase() {
    var purchase = parseFloat(document.getElementById('product-purchase').value) || 0;
    var markup = parseFloat(document.getElementById('product-markup').value) || 0;
    if (purchase > 0 && markup > 0) {
        var price = purchase * (1 + markup / 100);
        document.getElementById('product-price').value = price.toFixed(2);
    }
}

function syncFromMarkup() {
    var purchase = parseFloat(document.getElementById('product-purchase').value) || 0;
    var markup = parseFloat(document.getElementById('product-markup').value) || 0;
    if (purchase > 0 && markup >= 0) {
        var price = purchase * (1 + markup / 100);
        document.getElementById('product-price').value = price.toFixed(2);
    }
}

function syncFromPrice() {
    var purchase = parseFloat(document.getElementById('product-purchase').value) || 0;
    var price = parseFloat(document.getElementById('product-price').value) || 0;
    if (purchase > 0 && price >= purchase) {
        var markup = (price - purchase) / purchase * 100;
        document.getElementById('product-markup').value = markup.toFixed(2);
    } else if (purchase > 0) {
        document.getElementById('product-markup').value = '0';
    }
}

function importStoreBackup() {
    if (!isAdmin()) {
        toast('Только администратор', 'err');
        return;
    }
    var input = document.getElementById('backup-import-file');
    var file = input && input.files && input.files[0];
    if (!file) {
        toast('Выберите файл .json', 'err');
        return;
    }
    var replace = document.getElementById('backup-replace-all') && document.getElementById('backup-replace-all').checked;
    confirmAction('Восстановить из копии?', replace ? 'Все текущие данные магазина будут заменены содержимым файла. Продолжить?' : 'Данные из файла будут загружены. Рекомендуется включить \xABЗаменить всё\xBB для полного восстановления.', async function () {
        try {
            await window.ApBackup.importBackup(file, replace);
            input.value = '';
        } catch (e) {
            toast(e.message || String(e), 'err');
        }
    });
}

var autoBackupKey = 'ap_auto_backup_ts';

function autoBackup() {
    try {
        var store = getCurrentStoreName();
        var data = {
            ts: Date.now(),
            products: getProducts(),
            categories: getCategories(),
            sales: getSales(),
            expenses: getExpenses(),
            shifts: getShifts(),
            customers: getCustomers(),
            debtors: getDebtors(),
            debts: getDebts(),
            deferred: getDeferred()
        };
        localStorage.setItem('ap_auto_backup_' + store, JSON.stringify(data));
        localStorage.setItem(autoBackupKey, String(Date.now()));
        if (typeof toast === 'function')
            toast('\uD83D\uDCBE Авто-резервная копия создана', 'ok');
    } catch (e) {
        console.warn('[AutoBackup]', e);
    }
}

function restoreAutoBackup() {
    try {
        var store = getCurrentStoreName();
        var raw = localStorage.getItem('ap_auto_backup_' + store);
        if (!raw)
            return;
        var data = JSON.parse(raw);
        var age = Date.now() - (data.ts || 0);
        if (age > 86400000) {
            localStorage.removeItem('ap_auto_backup_' + store);
            return;
        }
        if (getProducts().length === 0 && data.products && data.products.length > 0) {
            setProducts(data.products);
            if (data.categories)
                setCategories(data.categories);
            if (data.customers)
                setCustomers(data.customers);
            if (data.debtors)
                setDebtors(data.debtors);
            if (data.debts)
                setDebts(data.debts);
            if (data.deferred)
                setDeferred(data.deferred);
            toast('\uD83D\uDCBE Данные восстановлены из авто-копии', 'ok');
        }
    } catch (e) {
    }
}




var _ex={};
try{_ex['syncWithSupabase']=syncWithSupabase}catch(e){}
try{_ex['_postSaveSyncTimer']=_postSaveSyncTimer}catch(e){}
try{_ex['_schedulePostSaveSync']=_schedulePostSaveSync}catch(e){}
try{_ex['syncFromPurchase']=syncFromPurchase}catch(e){}
try{_ex['syncFromMarkup']=syncFromMarkup}catch(e){}
try{_ex['syncFromPrice']=syncFromPrice}catch(e){}
try{_ex['importStoreBackup']=importStoreBackup}catch(e){}
try{_ex['autoBackupKey']=autoBackupKey}catch(e){}
try{_ex['autoBackup']=autoBackup}catch(e){}
try{_ex['restoreAutoBackup']=restoreAutoBackup}catch(e){}
return _ex;})();

// returns
__mod['returns']=(function(){
var renderPosSideHistory=__mf('ui','renderPosSideHistory');
var addAuditLog=__mf('sales','addAuditLog');
var getSales=__mf('sales','getSales');
var toast=__mf('notifications','toast');
var fmt=__mf('utils','fmt');
var closeModal=__mf('utils','closeModal');
var setCustomers=__mf('customers','setCustomers');
var openModal=__mf('ui','openModal');
var fillSaleProducts=__mf('products','fillSaleProducts');
var isSaleActive=__mf('sales','isSaleActive');
var setProducts=__mf('products','setProducts');
var setSales=__mf('sales','setSales');
var uid=__mf('ui','uid');
var groupSalesIntoReceipts=__mf('sales','groupSalesIntoReceipts');
var fmtDate=__mf('utils','fmtDate');
var renderSalesToday=__mf('sales','renderSalesToday');
var setExpenses=__mf('expenses','setExpenses');
var getCustomers=__mf('customers','getCustomers');
var confirmAction=__mf('utils','confirmAction');
var getProducts=__mf('products','getProducts');
var currentUser=__mv('users','currentUser');
var currentStoreId=__mv('store','currentStoreId');
var renderProducts=__mf('products','renderProducts');
var renderExpenses=__mf('expenses','renderExpenses');
var getOpenShiftForCashier=__mf('users','getOpenShiftForCashier');
var isAdmin=__mf('users','isAdmin');
var getExpenses=__mf('expenses','getExpenses');
var renderStatistics=__mf('statistics','renderStatistics');
var esc=__mf('utils','esc');
var renderDashboard=__mf('ui','renderDashboard');



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




var _ex={};
try{_ex['getReturnLimit']=getReturnLimit}catch(e){}
try{_ex['getShiftReturnCount']=getShiftReturnCount}catch(e){}
try{_ex['canMakeReturn']=canMakeReturn}catch(e){}
try{_ex['openReturnSelector']=openReturnSelector}catch(e){}
try{_ex['calcReturnTotal']=calcReturnTotal}catch(e){}
try{_ex['submitReturn']=submitReturn}catch(e){}
return _ex;})();

// offline
__mod['offline']=(function(){
function updateOfflineBanner() {
    var banner = document.getElementById('offline-banner');
    if (!banner)
        return;
    var pending = window.ApDb ? window.ApDb.getOfflineQueueCount() : 0;
    if (!navigator.onLine) {
        banner.style.display = 'flex';
        banner.innerHTML = '<span>\uD83D\uDD34 Нет интернета. Данные сохраняются локально.</span>' + (pending ? '<button class="btn btn-sm btn-warning" onclick="window.ApDb.processOfflineQueue()">\uD83D\uDD04 Синхронизировать (' + pending + ')</button>' : '');
    } else if (pending > 0) {
        banner.style.display = 'flex';
        banner.innerHTML = '<span>\uD83D\uDD04 Ожидает синхронизации: ' + pending + ' операций</span>' + '<button class="btn btn-sm btn-primary" onclick="window.ApDb.processOfflineQueue()">Синхронизировать</button>';
    } else {
        banner.style.display = 'none';
    }
}





var _ex={};
try{_ex['updateOfflineBanner']=updateOfflineBanner}catch(e){}
return _ex;})();

// ui
__mod['ui']=(function(){
var isSaleActive=__mf('sales','isSaleActive');
var getSales=__mf('sales','getSales');
var set=__mf('app-context','set');
var _bulkSelected=__mv('store','_bulkSelected');
var getLocalUsers=__mf('users','getLocalUsers');
var renderMyShiftPage=__mf('shifts','renderMyShiftPage');
var _uiSettings=__mv('settings','_uiSettings');
var renderCustomers=__mf('customers','renderCustomers');
var getOpenShiftForCashier=__mf('users','getOpenShiftForCashier');
var getUserPin=__mf('auth','getUserPin');
var closeModal=__mf('utils','closeModal');
var groupSalesIntoReceipts=__mf('sales','groupSalesIntoReceipts');
var migrateProducts=__mf('products','migrateProducts');
var setPromotions=__mf('promotions','setPromotions');
var setLocalUsers=__mf('users','setLocalUsers');
var autoBackup=__mf('sync','autoBackup');
var finCard=__mf('utils','finCard');
var updateBulkBar=__mf('utils','updateBulkBar');
var renderCashiersPage=__mf('users','renderCashiersPage');
var renderDeferred=__mf('sales','renderDeferred');
var confirmAction=__mf('utils','confirmAction');
var checkLowStockNotification=__mf('notifications','checkLowStockNotification');
var clearSaleSelection=__mf('sales','clearSaleSelection');
var getProducts=__mf('products','getProducts');
var saveUISettings=__mf('settings','saveUISettings');
var syncWithSupabase=__mf('sync','syncWithSupabase');
var applyUISettings=__mf('settings','applyUISettings');
var getExpenses=__mf('expenses','getExpenses');
var currentUser=__mv('users','currentUser');
var requestNotificationPermission=__mf('notifications','requestNotificationPermission');
var _posBrowserState=__mv('statistics','_posBrowserState');
var renderPosProducts=__mf('sales','renderPosProducts');
var renderMostExpensiveReceipt=__mf('sales','renderMostExpensiveReceipt');
var toast=__mf('notifications','toast');
var getShifts=__mf('shifts','getShifts');
var tableHTML=__mf('utils','tableHTML');
var PAY_LABELS=__mv('sales','PAY_LABELS');
var renderPromotionsPage=__mf('promotions','renderPromotionsPage');
var getDeferred=__mf('sales','getDeferred');
var renderDocuments=__mf('documents','renderDocuments');
var setCategories=__mf('categories','setCategories');
var renderDebts=__mf('debts','renderDebts');
var SCAN_MAX_GAP=__mv('constants','SCAN_MAX_GAP');
var getDocuments=__mf('documents','getDocuments');
var renderExpenses=__mf('expenses','renderExpenses');
var migrateDebtData=__mf('debts','migrateDebtData');
var card=__mf('utils','card');
var getCurrentStoreName=__mf('utils','getCurrentStoreName');
var getUISettings=__mf('settings','getUISettings');
var hasGroupPermission=__mf('users','hasGroupPermission');
var _statsPeriod=__mv('statistics','_statsPeriod');
var showLogin=__mf('auth','showLogin');
var ROLE_LABELS=__mv('constants','ROLE_LABELS');
var focusSaleSearch=__mf('sales','focusSaleSearch');
var renderProducts=__mf('products','renderProducts');
var migrateDeferredData=__mf('sales','migrateDeferredData');
var renderSalesToday=__mf('sales','renderSalesToday');
var openReturnSelector=__mf('returns','openReturnSelector');
var setStore=__mf('store','setStore');
var _posCatModalState=__mv('statistics','_posCatModalState');
var badgePay=__mf('sales','badgePay');
var getDebts=__mf('debts','getDebts');
var renderStatistics=__mf('statistics','renderStatistics');
var filterByPeriod=__mf('utils','filterByPeriod');
var updateSaleShiftBanner=__mf('sales','updateSaleShiftBanner');
var fmt=__mf('utils','fmt');
var getCategories=__mf('categories','getCategories');
var posCashierName=__mf('users','posCashierName');
var addAuditLog=__mf('sales','addAuditLog');
var checkPermission=__mf('users','checkPermission');
var renderCategoriesPage=__mf('categories','renderCategoriesPage');
var scanBuffer=__mv('store','scanBuffer');
var migrateSalesRecords=__mf('sales','migrateSalesRecords');
var findUserByLogin=__mf('auth','findUserByLogin');
var fmtDate=__mf('utils','fmtDate');
var getPromotions=__mf('promotions','getPromotions');
var confirmCallback=__mv('store','confirmCallback');
var switchAuditsTab=__mf('utils','switchAuditsTab');
var updateNotifBadge=__mf('notifications','updateNotifBadge');
var handleBarcodeScan=__mf('products','handleBarcodeScan');
var fillSaleProducts=__mf('products','fillSaleProducts');
var setCurrentUser=__mf('users','setCurrentUser');
var updateOfflineBanner=__mf('offline','updateOfflineBanner');
var getUsers=__mf('users','getUsers');
var isAdmin=__mf('users','isAdmin');
var restoreAutoBackup=__mf('sync','restoreAutoBackup');
var scanLastKey=__mv('store','scanLastKey');
var currentStoreId=__mv('store','currentStoreId');
var esc=__mf('utils','esc');
var getWriteOffs=__mf('sales','getWriteOffs');
var renderSalesHeatmap=__mf('sales','renderSalesHeatmap');
var getAudits=__mf('sales','getAudits');
var migrateBarcodes=__mf('products','migrateBarcodes');
var setProducts=__mf('products','setProducts');



function _closeParentModals() {
    var parents = [
        'modal-view-document',
        'modal-create-invoice',
        'modal-create-z2',
        'modal-create-sf'
    ];
    window._templateParentModal = '';
    parents.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && el.classList.contains('show')) {
            window._templateParentModal = id;
            closeModal(id);
        }
    });
}

function _reopenParentModal() {
    if (window._templateParentModal) {
        openModal(window._templateParentModal);
        window._templateParentModal = '';
    }
}

function uid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID)
        return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : r & 3 | 8;
        return v.toString(16);
    });
}

function openModal(id) {
    document.getElementById(id).classList.add('show');
}

function renderStoreUI() {
    const mobTitle = document.getElementById('mobile-store-title');
    if (mobTitle)
        mobTitle.textContent = getCurrentStoreName();
}

function applyRoleUI() {
    document.querySelectorAll('.admin-only').forEach(function (el) {
        if (isAdmin())
            el.classList.remove('hidden-role');
        else
            el.classList.add('hidden-role');
    });
    document.querySelectorAll('.cashier-only').forEach(function (el) {
        if (isAdmin())
            el.classList.add('hidden-role');
        else
            el.classList.remove('hidden-role');
    });
    document.querySelectorAll('[data-perm]').forEach(function (el) {
        var perm = el.getAttribute('data-perm');
        if (!checkPermission(perm))
            el.classList.add('hidden-role');
        else
            el.classList.remove('hidden-role');
    });
    document.querySelectorAll('.nav-btn[data-page]').forEach(function (el) {
        var page = el.getAttribute('data-page');
        if (!hasGroupPermission(page))
            el.classList.add('hidden-role');
        else
            el.classList.remove('hidden-role');
    });
}

function renderDashboard() {
    const period = (document.getElementById('dash-period-filter') || {}).value || 'all';
    const products = getProducts();
    const low = products.filter(function (p) {
        return p.quantity <= (p.minStock || 5);
    });
    const allSales = getSales().filter(isSaleActive);
    const sales = filterByPeriod(allSales, 'date', period);
    const expenses = filterByPeriod(getExpenses(), 'date', period).filter(function (e) {
        return e.status !== 'cancelled';
    });
    const docs = getDocuments();
    document.getElementById('dash-date').textContent = new Date().toLocaleDateString('ru-RU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    var totalRevenue = 0, totalCash = 0, totalKaspi = 0, totalTransfer = 0, totalCOGS = 0, salesQty = 0;
    var productSalesMap = {};
    var categorySalesMap = {};
    sales.forEach(function (s) {
        if (Number(s.total) > 0)
            totalRevenue += Number(s.total);
        if (s.payment === 'cash')
            totalCash += Number(s.total) || 0;
        else if (s.payment === 'kaspi')
            totalKaspi += Number(s.total) || 0;
        else if (s.payment === 'transfer')
            totalTransfer += Number(s.total) || 0;
        totalCOGS += (Number(s.purchasePrice) || 0) * (Number(s.quantity) || 0);
        salesQty += Number(s.quantity) || 0;
        var pName = s.productName || '\u2014';
        if (!productSalesMap[pName])
            productSalesMap[pName] = {
                qty: 0,
                total: 0,
                name: pName,
                category: ''
            };
        productSalesMap[pName].qty += Number(s.quantity) || 0;
        productSalesMap[pName].total += Number(s.total) || 0;
        if (s.productId) {
            var prod = products.find(function (p) {
                return p.id === s.productId;
            });
            if (prod) {
                productSalesMap[pName].category = prod.category || '';
                var catName = '';
                var catObj = getCategories().find(function (c) {
                    return c.id === prod.category;
                });
                catName = catObj ? catObj.name : 'Без категории';
                if (!categorySalesMap[catName])
                    categorySalesMap[catName] = {
                        qty: 0,
                        total: 0
                    };
                categorySalesMap[catName].qty += Number(s.quantity) || 0;
                categorySalesMap[catName].total += Number(s.total) || 0;
            }
        }
    });
    var totalExpenses = expenses.reduce(function (sum, e) {
        return sum + (Number(e.amount) || 0);
    }, 0);
    var allDebts = getDebts();
    var activeDebts = allDebts.filter(function (d) {
        return d.status === 'open' && d.amount > 0;
    });
    var totalDebtAmount = activeDebts.reduce(function (sum, d) {
        return sum + (Number(d.amount) || 0);
    }, 0);
    var docCounts = {};
    docs.forEach(function (d) {
        var dt = d.type || d.docType || 'other';
        docCounts[dt] = (docCounts[dt] || 0) + 1;
    });
    var docTypeLabels = {
        invoice: 'Счета',
        z2: 'Накладные З-2',
        invoice_sf: 'Счёт-фактуры',
        deferred: 'Отложенные'
    };
    var docsTotalSum = docs.reduce(function (sum, d) {
        return sum + (Number(d.total) || 0);
    }, 0);
    var salesCount = sales.length;
    document.getElementById('dash-cards').innerHTML = card('\uD83D\uDCE6 Товаров', products.length, '') + card('\uD83D\uDED2 Продаж', salesCount + ' (' + fmt(totalRevenue) + ' \u20B8)', 'ok') + card('\uD83D\uDCB5 Наличные', fmt(totalCash), 'cash') + card('\uD83D\uDCF1 Kaspi QR', fmt(totalKaspi), 'kaspi') + card('\uD83C\uDFE6 Банк', fmt(totalTransfer), 'bank') + card('\uD83D\uDCB0 Выручка', fmt(totalRevenue), 'ok') + card('\uD83D\uDCC9 Расходы', fmt(totalExpenses), 'warn') + card('\uD83D\uDCCB Долги', fmt(totalDebtAmount), 'err');
    var topProducts = Object.keys(productSalesMap).map(function (k) {
        return productSalesMap[k];
    });
    topProducts.sort(function (a, b) {
        return b.qty - a.qty;
    });
    topProducts = topProducts.slice(0, 15);
    var topEl = document.getElementById('dash-top-products');
    if (topProducts.length) {
        var maxQty = topProducts[0] ? topProducts[0].qty : 1;
        topEl.innerHTML = topProducts.map(function (p) {
            var pct = Math.round(p.qty / maxQty * 100);
            return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:13px">' + '<div style="flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(p.name) + '</div>' + '<div style="width:100px;background:var(--bg3);border-radius:4px;height:16px;position:relative;overflow:hidden">' + '<div style="position:absolute;top:0;left:0;height:100%;width:' + pct + '%;background:var(--accent);border-radius:4px;opacity:0.6"></div>' + '</div>' + '<div style="min-width:40px;text-align:right;font-weight:600">' + p.qty + '</div>' + '</div>';
        }).join('');
    } else {
        topEl.innerHTML = '<div class="empty">Нет данных о продажах</div>';
    }
    var catEl = document.getElementById('dash-category-breakdown');
    var catEntries = Object.keys(categorySalesMap).map(function (k) {
        return {
            name: k,
            qty: categorySalesMap[k].qty,
            total: categorySalesMap[k].total
        };
    });
    catEntries.sort(function (a, b) {
        return b.total - a.total;
    });
    if (catEntries.length) {
        var maxCatTotal = catEntries[0] ? catEntries[0].total : 1;
        catEl.innerHTML = tableHTML([
            'Категория',
            'Кол-во',
            'Сумма'
        ], catEntries.map(function (c) {
            var barW = Math.round(c.total / maxCatTotal * 100);
            return [
                c.name,
                c.qty,
                '<div style="display:flex;align-items:center;gap:6px"><div style="width:60px;background:var(--bg3);border-radius:3px;height:12px;overflow:hidden"><div style="height:100%;width:' + barW + '%;background:var(--accent);border-radius:3px;opacity:0.5"></div></div>' + fmt(c.total) + '</div>'
            ];
        }));
    } else {
        catEl.innerHTML = '<div class="empty">Нет данных</div>';
    }
    var netBalance = totalRevenue - totalExpenses - totalDebtAmount;
    var reportEl = document.getElementById('dash-financial-report');
    reportEl.innerHTML = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">' + finCard('\uD83D\uDED2 Сумма продаж', fmt(totalRevenue) + ' \u20B8', 'ok') + finCard('\uD83D\uDCC4 Сумма по документам', fmt(docsTotalSum) + ' \u20B8', '') + finCard('\uD83D\uDCC9 Сумма расходов', fmt(totalExpenses) + ' \u20B8', 'warn') + finCard('\uD83D\uDCCB Активные долги', fmt(totalDebtAmount) + ' \u20B8', 'err') + finCard('\uD83D\uDC8E Чистый баланс', fmt(Math.abs(netBalance)) + ' \u20B8', netBalance >= 0 ? 'ok' : 'err') + '</div>' + '<div style="margin-top:12px;font-size:13px;color:var(--text-muted)">' + Object.keys(docTypeLabels).map(function (t) {
        var cnt = docCounts[t] || 0;
        return docCounts[t] ? '<span style="margin-right:16px">' + docTypeLabels[t] + ': <strong>' + cnt + '</strong></span>' : '';
    }).join('') + (docs.length ? '<span>Всего документов: <strong>' + docs.length + '</strong></span>' : '') + '</div>';
    document.getElementById('dash-lowstock').innerHTML = low.length ? tableHTML([
        'Код',
        'Название',
        'Остаток',
        'Мин.'
    ], low.map(function (p) {
        return [
            '<span class="code-tag">' + (p.code || '\u2014') + '</span>',
            p.name,
            '<span class="low-stock">' + p.quantity + '</span>',
            p.minStock || 5
        ];
    })) : '<div class="empty">Все товары в норме \u2713</div>';
    const receipts = groupSalesIntoReceipts(allSales).slice(0, 10);
    const dashCols = [
        'Чек',
        'Товаров',
        'Сумма',
        'Оплата',
        'Кассир',
        'Время',
        ''
    ];
    document.getElementById('dash-recent').innerHTML = receipts.length ? tableHTML(dashCols, receipts.map(function (r) {
        return [
            '<span class="code-tag">\u2116 ' + r.id.slice(-6) + '</span>',
            r.items.reduce(function (sum, it) {
                return sum + (Number(it.quantity) || 0);
            }, 0),
            fmt(r.total),
            badgePay(r.payment, r.items[0]),
            r.userName || '\u2014',
            fmtDate(r.date),
            '<button class="btn btn-sm btn-secondary" onclick="openReceipt(\'' + r.id + '\')">Открыть</button>'
        ];
    })) : '<div class="empty">Продаж пока нет</div>';
    renderSalesToday();
}

function buildInvoiceHTML(receiptId) {
    var allSales = getSales().filter(isSaleActive);
    var sales = allSales.filter(function (s) {
        return s.receiptId === receiptId;
    });
    if (!sales.length)
        sales = allSales.filter(function (s) {
            return s.id === receiptId;
        });
    if (!sales.length)
        sales = allSales.filter(function (s) {
            return String(s.receiptId) === String(receiptId) || String(s.id) === String(receiptId);
        });
    if (!sales.length)
        return null;
    var first = sales[0];
    var store = window.ApAuth && window.ApAuth.getCurrentStore();
    var storeName = store ? store.storeName : 'SANAQ';
    var storeBin = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_bin')) || localStorage.getItem('ap_store_bin') || '';
    var bankName = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_bank_name')) || localStorage.getItem('ap_store_bank_name') || '';
    var iik = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_iik')) || localStorage.getItem('ap_store_iik') || '';
    var bik = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_bik')) || localStorage.getItem('ap_store_bik') || '';
    var kbe = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_kbe')) || localStorage.getItem('ap_store_kbe') || '';
    var paymentCode = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_payment_code')) || localStorage.getItem('ap_store_payment_code') || '';
    var beneficiary = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_beneficiary')) || localStorage.getItem('ap_store_beneficiary') || storeName;
    var total = sales.reduce(function (s, x) {
        return s + x.total;
    }, 0);
    var totalQty = sales.reduce(function (s, x) {
        return s + (Number(x.quantity) || 0);
    }, 0);
    var rows = sales.map(function (s, i) {
        return '<tr>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:center;font-size:11px">' + (i + 1) + '</td>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:center;font-size:11px">' + esc(s.productCode || '\u2014') + '</td>' + '<td style="padding:6px 4px;border:1px solid #000;font-size:11px">' + esc(s.productName) + '</td>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:center;font-size:11px">шт</td>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:center;font-size:11px">' + s.quantity + '</td>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:center;font-size:11px">' + s.quantity + '</td>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:right;font-size:11px">' + fmt(s.unitPrice) + '</td>' + '<td style="padding:6px 4px;border:1px solid #000;text-align:right;font-size:11px;font-weight:600">' + fmt(s.total) + '</td>' + '</tr>';
    }).join('');
    var html = '<div style="font-family:\'Times New Roman\',Times,serif;color:#000;max-width:980px;margin:0 auto;padding:30px 20px">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;font-size:11px">';
    html += '<div>Приложение 26<br>к приказу Министра финансов<br>Республики Казахстан<br>от 20 декабря 2012 года \u2116 562</div>';
    html += '<div style="font-size:16px;font-weight:700">Форма З-2</div></div>';
    html += '<div style="text-align:center;font-weight:700;font-size:16px;margin:12px 0 16px">Накладная на отпуск запасов на сторону</div>';
    html += '<div style="margin-bottom:10px;font-size:12px"><strong>Организация (ИП) - отправитель:</strong> ' + esc(storeName) + ' &nbsp; <strong>БИН/ИИН:</strong> ' + esc(storeBin) + '</div>';
    html += '<div style="margin-bottom:14px;font-size:12px"><strong>Номер документа:</strong> ' + receiptId.slice(-6) + ' &nbsp; <strong>Дата:</strong> ' + fmtDate(first.date) + '</div>';
    html += '<table style="width:100%;border-collapse:collapse;margin-bottom:12px">';
    html += '<thead><tr>' + '<th rowspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px;width:28px">\u2116 п/п</th>' + '<th rowspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px;width:70px">Номенкл. номер</th>' + '<th rowspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px">Наименование, характеристика</th>' + '<th rowspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px;width:38px">Ед.</th>' + '<th colspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px;width:70px">Количество</th>' + '<th rowspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px;width:70px">Цена, KZT</th>' + '<th rowspan="2" style="padding:5px;border:1px solid #000;text-align:center;font-size:10px;width:80px">Сумма с НДС, KZT</th>' + '</tr><tr>' + '<th style="padding:5px;border:1px solid #000;text-align:center;font-size:9px">подлежит</th>' + '<th style="padding:5px;border:1px solid #000;text-align:center;font-size:9px">отпущено</th>' + '</tr></thead><tbody>' + rows + '</tbody></table>';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:14px;font-size:12px">';
    html += '<div><strong>Итого наименований:</strong> ' + sales.length + '</div>';
    html += '<div><strong>Всего отпущено количество:</strong> ' + totalQty + '</div>';
    html += '<div><strong>на сумму:</strong> ' + fmt(total) + ' KZT</div></div>';
    html += '<div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:12px;gap:12px">';
    html += '<div style="flex:1;border:1px solid #000;padding:8px"><strong>Отпуск разрешил:</strong><div style="border-bottom:1px solid #000;height:24px;margin-top:8px"></div><div style="font-size:10px;margin-top:2px">(подпись, расшифровка)</div></div>';
    html += '<div style="flex:1;border:1px solid #000;padding:8px"><strong>Главный бухгалтер:</strong><div style="border-bottom:1px solid #000;height:24px;margin-top:8px"></div><div style="font-size:10px;margin-top:2px">(подпись, расшифровка)</div></div>';
    html += '<div style="flex:1;border:1px solid #000;padding:8px"><strong>М.П.</strong></div></div>';
    html += '<div style="display:flex;justify-content:space-between;font-size:12px;gap:12px">';
    html += '<div style="flex:1;border:1px solid #000;padding:8px"><strong>Отпустил:</strong><div style="border-bottom:1px solid #000;height:24px;margin-top:8px"></div><div style="font-size:10px;margin-top:2px">(подпись, расшифровка)</div></div>';
    html += '<div style="flex:1;border:1px solid #000;padding:8px"><strong>Запасы получил:</strong><div style="border-bottom:1px solid #000;height:24px;margin-top:8px"></div><div style="font-size:10px;margin-top:2px">(подпись, расшифровка)</div></div>';
    html += '</div></div>';
    return html;
}

function renderAnalytics() {
    var period = _statsPeriod || 'today';
    var now = new Date();
    var periodStart = new Date(0);
    if (period === 'today')
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (period === 'week') {
        var d = new Date(now);
        d.setDate(d.getDate() - 7);
        periodStart = d;
    } else if (period === 'month')
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    var sales = getSales().filter(function (s) {
        return isSaleActive(s) && new Date(s.date) >= periodStart;
    });
    var receipts = groupSalesIntoReceipts(sales);
    renderAnalyticsCards(sales);
    renderSalesHeatmap(sales);
    renderRecords(sales, receipts, period);
    renderMostExpensiveReceipt(receipts);
}

function renderAnalyticsCards(sales) {
    var container = document.getElementById('analytics-cards');
    if (!container)
        return;
    var peak = renderPeakHour(sales);
    var totalSales = sales.length;
    var totalRevenue = sales.reduce(function (s, x) {
        return s + (Number(x.total) || 0);
    }, 0);
    var avgCheck = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;
    container.innerHTML = '<div class="card"><div class="card-label">\uD83D\uDCCA Всего продаж</div><div class="card-value" style="font-size:18px">' + totalSales + '</div></div>' + '<div class="card"><div class="card-label">\uD83D\uDCB0 Общая выручка</div><div class="card-value" style="font-size:18px">' + fmt(totalRevenue) + '</div></div>' + '<div class="card"><div class="card-label">\uD83E\uDDFE Средний чек</div><div class="card-value" style="font-size:18px">' + fmt(avgCheck) + '</div></div>' + '<div class="card"><div class="card-label">\u23F0 Пиковый час</div><div class="card-value" style="font-size:18px">' + peak.hour + ':00</div><div style="font-size:11px;color:var(--text-muted)">' + peak.count + ' продаж, ' + fmt(Math.round(peak.revenue)) + '</div></div>';
}

function renderPeakHour(sales) {
    var hourlyChecks = {};
    var hourlyRevenue = {};
    sales.forEach(function (s) {
        var hour = s.date ? new Date(s.date).getHours() : 0;
        if (!hourlyChecks[hour])
            hourlyChecks[hour] = 0;
        if (!hourlyRevenue[hour])
            hourlyRevenue[hour] = 0;
        hourlyChecks[hour]++;
        hourlyRevenue[hour] += Number(s.total) || 0;
    });
    var peakHour = 0, peakCount = 0, peakRev = 0;
    Object.keys(hourlyChecks).forEach(function (h) {
        if (hourlyChecks[h] > peakCount) {
            peakCount = hourlyChecks[h];
            peakHour = parseInt(h);
            peakRev = hourlyRevenue[h];
        }
    });
    return {
        hour: peakHour,
        count: peakCount,
        revenue: peakRev
    };
}

function renderRecords(sales, receipts, period) {
    var cardsContainer = document.getElementById('records-cards');
    if (!cardsContainer)
        return;
    var dailyTotals = {};
    receipts.forEach(function (r) {
        var day = (r.date || '').slice(0, 10);
        if (!dailyTotals[day])
            dailyTotals[day] = 0;
        dailyTotals[day] += r.total;
    });
    var bestDay = null, bestDayTotal = 0;
    Object.keys(dailyTotals).forEach(function (d) {
        if (dailyTotals[d] > bestDayTotal) {
            bestDayTotal = dailyTotals[d];
            bestDay = d;
        }
    });
    var weeklyTotals = {};
    receipts.forEach(function (r) {
        var dt = new Date(r.date);
        var weekStart = new Date(dt);
        weekStart.setDate(dt.getDate() - dt.getDay());
        var key = weekStart.toISOString().slice(0, 10);
        if (!weeklyTotals[key])
            weeklyTotals[key] = 0;
        weeklyTotals[key] += r.total;
    });
    var bestWeek = null, bestWeekTotal = 0;
    Object.keys(weeklyTotals).forEach(function (w) {
        if (weeklyTotals[w] > bestWeekTotal) {
            bestWeekTotal = weeklyTotals[w];
            bestWeek = w;
        }
    });
    var monthlyTotals = {};
    receipts.forEach(function (r) {
        var key = (r.date || '').slice(0, 7);
        if (!monthlyTotals[key])
            monthlyTotals[key] = 0;
        monthlyTotals[key] += r.total;
    });
    var bestMonth = null, bestMonthTotal = 0;
    Object.keys(monthlyTotals).forEach(function (m) {
        if (monthlyTotals[m] > bestMonthTotal) {
            bestMonthTotal = monthlyTotals[m];
            bestMonth = m;
        }
    });
    cardsContainer.innerHTML = '<div class="card"><div class="card-label">\uD83C\uDFC6 Рекорд дня</div><div class="card-value" style="font-size:18px">' + (bestDay ? fmt(bestDayTotal) : '\u2014') + ' \u20B8</div><div style="font-size:11px;color:var(--text-muted)">' + (bestDay || '\u2014') + '</div></div>' + '<div class="card"><div class="card-label">\uD83C\uDFC6 Рекорд недели</div><div class="card-value" style="font-size:18px">' + (bestWeek ? fmt(bestWeekTotal) : '\u2014') + ' \u20B8</div><div style="font-size:11px;color:var(--text-muted)">Неделя от ' + (bestWeek || '\u2014') + '</div></div>' + '<div class="card"><div class="card-label">\uD83C\uDFC6 Рекорд месяца</div><div class="card-value" style="font-size:18px">' + (bestMonth ? fmt(bestMonthTotal) : '\u2014') + ' \u20B8</div><div style="font-size:11px;color:var(--text-muted)">' + (bestMonth || '\u2014') + '</div></div>';
}

function renderAuditsPage() {
    if (!isAdmin()) {
        toast('Только администратор', 'err');
        return;
    }
    switchAuditsTab('writeoffs');
    renderWriteOffsTable();
    renderAuditsArchive();
}

function renderWriteOffsTable() {
    var el = document.getElementById('writeoffs-list-table');
    if (!el)
        return;
    var list = getWriteOffs();
    if (!list.length) {
        el.innerHTML = '<div class="empty">Списаний пока нет</div>';
        return;
    }
    el.innerHTML = tableHTML([
        'Дата',
        'Товар',
        'Код',
        'Кол-во',
        'Причина',
        'Примечание',
        'Сотрудник'
    ], list.map(function (w) {
        return [
            fmtDate(w.date),
            w.productName,
            w.productCode,
            w.quantity,
            w.reason,
            w.note || '\u2014',
            w.userName
        ];
    }));
}

function renderAuditsArchive() {
    var el = document.getElementById('audits-archive-table');
    if (!el)
        return;
    var list = getAudits();
    if (!list.length) {
        el.innerHTML = '<div class="empty">Ревизий пока нет</div>';
        return;
    }
    el.innerHTML = tableHTML([
        'Дата',
        'Сотрудник',
        'Позиций',
        'Расхождений',
        'Детали'
    ], list.map(function (a) {
        var items = a.items || [];
        var diffs = items.filter(function (it) {
            return it.qtyFact !== it.qtySystem;
        });
        var details = diffs.length ? diffs.map(function (it) {
            return it.name + ': ' + it.qtySystem + ' \u2192 ' + it.qtyFact;
        }).join('<br>') : '<span style="color:var(--ok)">Без расхождений</span>';
        return [
            fmtDate(a.date),
            a.userName,
            items.length,
            diffs.length,
            '<div style="max-width:300px;font-size:12px;line-height:1.5">' + details + '</div>'
        ];
    }));
}

function showCustomModal(title, body) {
    var existing = document.getElementById('modal-custom');
    if (!existing) {
        var div = document.createElement('div');
        div.id = 'modal-custom';
        div.className = 'overlay';
        div.innerHTML = '<div style="background:var(--bg);max-width:400px;width:90%;margin:60px auto;border-radius:12px;padding:20px;box-shadow:0 8px 32px rgba(0,0,0,0.3)"><div style="font-weight:700;font-size:16px;margin-bottom:12px" id="modal-custom-title"></div><div id="modal-custom-body"></div></div>';
        document.body.appendChild(div);
        div.addEventListener('click', function (e) {
            if (e.target === div)
                closeModal('modal-custom');
        });
    }
    document.getElementById('modal-custom-title').textContent = title;
    document.getElementById('modal-custom-body').innerHTML = body;
    openModal('modal-custom');
}

function updateAutoBackupUI() {
    try {
        var ts = localStorage.getItem(autoBackupKey);
        if (ts) {
            var elapsed = Math.floor((Date.now() - parseInt(ts)) / 60000);
            var el = document.querySelector('#ctab-backup .panel-title');
            if (el && elapsed < 7200) {
                var minText = elapsed < 60 ? elapsed + ' мин' : Math.floor(elapsed / 60) + 'ч ' + elapsed % 60 + 'мин';
                el.textContent = 'Резервное копирование (авто: ' + minText + ' назад)';
            }
        }
    } catch (e) {
    }
}

function renderNotifications() {
    var container = document.getElementById('notif-panel-body');
    var notifs = [];
    var products = getProducts();
    var lowItems = products.filter(function (p) {
        return p.quantity <= (p.minStock || 5);
    });
    if (lowItems.length > 0) {
        notifs.push({
            icon: '\u26A0️',
            title: 'Низкий остаток: ' + lowItems.length + ' товаров',
            desc: lowItems.slice(0, 3).map(function (p) {
                return p.name + ' (' + p.quantity + ' шт)';
            }).join(', ') + (lowItems.length > 3 ? ' и ещё ' + (lowItems.length - 3) : ''),
            time: 'сейчас'
        });
    }
    var shifts = getShifts();
    var openShifts = shifts.filter(function (s) {
        return s.status === 'open';
    });
    if (openShifts.length > 0) {
        notifs.push({
            icon: '\uD83D\uDD50',
            title: 'Открытые смены: ' + openShifts.length,
            desc: openShifts.map(function (s) {
                return s.cashierName + ' (' + fmtDate(s.openedAt) + ')';
            }).join(', '),
            time: 'сейчас'
        });
    }
    var deferred = getDeferred ? getDeferred() : [];
    if (deferred.length > 0) {
        notifs.push({
            icon: '\uD83D\uDCE6',
            title: 'Отложенные товары: ' + deferred.length,
            desc: 'Есть отложенные товары, ожидающие обработки',
            time: 'сейчас'
        });
    }
    var debts = getDebts ? getDebts() : [];
    var openDebts = debts.filter(function (d) {
        return d.status === 'open';
    });
    if (openDebts.length > 0) {
        notifs.push({
            icon: '\uD83D\uDCB0',
            title: 'Активные долги: ' + openDebts.length,
            desc: 'Общая сумма: ' + fmt(openDebts.reduce(function (s, d) {
                return s + (Number(d.amount) || 0);
            }, 0)) + ' \u20B8',
            time: 'сейчас'
        });
    }
    var autoBackupKey = 'ap_auto_backup_ts';
    var ts = localStorage.getItem(autoBackupKey);
    if (ts) {
        var elapsed = Math.floor((Date.now() - parseInt(ts)) / 3600000);
        if (elapsed > 24) {
            notifs.push({
                icon: '\uD83D\uDCBE',
                title: 'Резервная копия устарела',
                desc: 'Последняя копия была сделана ' + Math.floor(elapsed / 24) + ' дней назад',
                time: Math.floor(elapsed / 24) + 'д назад'
            });
        }
    }
    if (notifs.length === 0) {
        container.innerHTML = '<div class="empty">\u2705 Всё в порядке, уведомлений нет</div>';
    } else {
        container.innerHTML = notifs.map(function (n) {
            return '<div class="notif-item"><div class="notif-item-icon">' + n.icon + '</div><div class="notif-item-content"><div class="notif-item-title">' + esc(n.title) + '</div><div class="notif-item-desc">' + esc(n.desc) + '</div><div class="notif-item-time">' + n.time + '</div></div></div>';
        }).join('');
    }
    updateNotifBadge();
}

function applyUIVisibility() {
    var s = getUISettings();
    var vis = s.visibility || {};
    var blocks = {
        'sidebar': '.sidebar',
        'header': '.mobile-header',
        'dash-cards': '#dash-cards',
        'dash-analytics': '.dash-analytics-grid',
        'sales-history': '.pos-side-col',
        'pos-shift-history': '#pos-shift-history',
        'stats-cards': '#stats-cards'
    };
    Object.keys(blocks).forEach(function (key) {
        var els = document.querySelectorAll(blocks[key]);
        els.forEach(function (el) {
            if (el)
                el.style.display = vis[key] === false ? 'none' : '';
        });
    });
    var restoreBtn = document.getElementById('sidebar-restore-btn');
    if (restoreBtn) {
        restoreBtn.style.display = vis.sidebar === false ? 'flex' : 'none';
    }
}

function applyUIPosMode(mode) {
    var html = document.documentElement;
    html.classList.remove('ui-compact', 'ui-standard', 'ui-large');
    if (mode === 'compact')
        html.classList.add('ui-compact');
    else if (mode === 'large')
        html.classList.add('ui-large');
    else
        html.classList.add('ui-standard');
}

function getUIProfiles() {
    var v = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('ui_profiles') : null;
    if (v && typeof v === 'object')
        return v;
    try {
        return JSON.parse(localStorage.getItem('sanaq_ui_profiles_' + (currentStoreId || '')) || '{}');
    } catch (e) {
        return {};
    }
}

function setUIProfiles(profiles) {
    try {
        localStorage.setItem('sanaq_ui_profiles_' + (currentStoreId || ''), JSON.stringify(profiles));
    } catch (e) {
    }
    if (window.ApDb && window.ApDb.setAppData)
        window.ApDb.setAppData('ui_profiles', profiles);
}

function renderSavedUIProfiles() {
    var container = document.getElementById('ui-saved-profiles');
    if (!container)
        return;
    var profiles = getUIProfiles();
    var names = Object.keys(profiles);
    if (!names.length) {
        container.innerHTML = '';
        return;
    }
    container.innerHTML = names.map(function (name) {
        return '<div class="ui-saved-profile">' + '<span class="name">' + esc(name) + '</span>' + '<div class="actions">' + '<button class="btn btn-sm btn-secondary" onclick="loadUIProfile(\'' + name.replace(/'/g, '\\\'') + '\')">\uD83D\uDCC2</button>' + '<button class="btn btn-sm btn-danger" onclick="deleteUIProfile(\'' + name.replace(/'/g, '\\\'') + '\')">\u2715</button>' + '</div></div>';
    }).join('');
}

function renderPosLayoutEditor() {
    var container = document.getElementById('pos-layout-editor');
    if (!container)
        return;
    var layout = getPosLayout();
    var labels = {
        favorites: '\u2B50 Быстрые товары',
        categories: '\uD83D\uDDC2️ Категории',
        'shift-history': '\uD83D\uDCCB История продаж',
        search: '\uD83D\uDD0D Поиск'
    };
    container.innerHTML = layout.map(function (key, i) {
        return '<div draggable="true" class="pos-layout-item" data-key="' + key + '" data-index="' + i + '" ondragstart="onPosLayoutDragStart(event)" ondragover="onPosLayoutDragOver(event)" ondrop="onPosLayoutDrop(event)" ondragend="onPosLayoutDragEnd(event)" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg3);border-radius:8px;cursor:grab;border:1px solid var(--border)">' + '<span style="cursor:grab;color:var(--text-muted)">\u283F</span>' + '<span style="flex:1;font-size:13px">' + (labels[key] || key) + '</span>' + '</div>';
    }).join('');
}




'use strict';

window.addEventListener('error', function (e) {
    try {
        console.warn('[App error]', e && e.message ? e.message : 'unknown', e && e.lineno ? 'line:' + e.lineno : '');
    } catch (err) {
    }
});

window.addEventListener('unhandledrejection', function (e) {
    try {
        var msg = e && e.reason && (e.reason.message || e.reason) ? e.reason.message || e.reason : 'unknown';
        console.warn('[Promise error]', msg);
    } catch (err) {
    }
});

window.currentUser = null;

































document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        var restoreBtn = document.getElementById('sidebar-restore-btn');
        if (restoreBtn && restoreBtn.style.display === 'flex') {
            window.restoreSidebar();
            e.preventDefault();
            return;
        }
    }
    if (e.key === 'Escape') {
        var openModals = document.querySelectorAll('.overlay:not(.hidden)');
        if (openModals.length) {
            return;
        }
        var searchEl = document.getElementById('sale-search');
        if (searchEl && document.activeElement === searchEl && searchEl.value) {
            searchEl.value = '';
            onSaleSearch();
            e.preventDefault();
        }
        return;
    }
});

document.addEventListener('keydown', function (e) {
    if (!currentUser || e.ctrlKey || e.altKey || e.metaKey)
        return;
    var page = document.querySelector('.page.active');
    if (!page || page.id !== 'page-sales' && page.id !== 'page-products')
        return;
    var now = Date.now();
    var gap = now - scanLastKey;
    setStore('scanLastKey', now);
    if (e.key === 'Enter') {
        var ae = document.activeElement;
        if (ae && (ae.id === 'sale-search' || ae.id === 'product-search' || ae.id === 'product-barcode')) {
            setStore('scanBuffer', '');
            return;
        }
        if (scanBuffer.length >= 4 && gap < 120) {
            handleBarcodeScan(scanBuffer);
            setStore('scanBuffer', '');
            e.preventDefault();
        } else {
            setStore('scanBuffer', '');
        }
        return;
    }
    if (e.key.length === 1) {
        if (gap > SCAN_MAX_GAP)
            setStore('scanBuffer', '');
        setStore('scanBuffer', scanBuffer + e.key);
    }
});





























window.addEventListener('online', function () {
    updateOfflineBanner();
});

window.addEventListener('offline', function () {
    updateOfflineBanner();
});









document.getElementById('confirm-ok').onclick = function () {
    closeModal('modal-confirm');
    if (confirmCallback)
        confirmCallback();
    setStore('confirmCallback', null);
};

function refreshAll() {
    renderDashboard();
    renderProducts();
    fillSaleProducts();
    renderSalesToday();
    renderPosSideHistory();
    updateSaleShiftBanner();
    if (isAdmin())
        renderExpenses();
    else if (document.getElementById('page-myshift') && document.getElementById('page-myshift').classList.contains('active'))
        renderMyShiftPage();
    renderPosCatBrowser();
    renderPosProducts(_posBrowserState.cat || '');
}











function showApp() {
    if (window.currentUser)
        setCurrentUser(window.currentUser);
    try {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('app').classList.add('active');
        
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-role').textContent = ROLE_LABELS[currentUser.role] || currentUser.role;
        applyRoleUI();
        renderStoreUI();
        var cats = getCategories();
        if (!cats.length) {
            var defaults = [
                'Масла и жидкости',
                'Фильтры',
                'Тормозная система',
                'Электрика',
                'Подвеска',
                'Двигатель',
                'Кузов',
                'Аксессуары',
                'Расходники'
            ];
            setCategories(defaults.map(function (n) {
                return {
                    id: uid(),
                    name: n
                };
            }));
        }
        refreshAll();
        addAuditLog('Вход в систему', 'Пользователь: ' + currentUser.name, '\uD83D\uDD11');
        if (typeof initPins === 'function') initPins();
        if (typeof lucide !== 'undefined')
            lucide.createIcons();
        applyUISettings();
        updateNotifBadge();
        requestNotificationPermission();
        setTimeout(checkLowStockNotification, 3000);
        if (!window._notifBadgeInterval)
            window._notifBadgeInterval = setInterval(updateNotifBadge, 30000);
        if (!window._syncInterval) {
            window._syncInterval = setInterval(function () {
                if (!currentUser)
                    return;
                if (document.querySelector('.modal.open'))
                    return;
                syncWithSupabase();
            }, 60000);
        }
        if (!window._backupInterval) {
            window._backupInterval = setInterval(function () {
                if (currentUser && isAdmin())
                    autoBackup();
            }, 7200000);
        }
        if (!window._autoRefreshInterval) {
            window._autoRefreshInterval = setInterval(function () {
                var activePage = document.querySelector('.page.active');
                if (activePage) {
                    var id = activePage.id;
                    if (id === 'page-dashboard')
                        renderDashboard();
                    else if (id === 'page-products')
                        renderProducts();
                    else if (id === 'page-statistics')
                        renderStatistics();
                    else if (id === 'page-audits') {
                        renderWriteOffsTable();
                        renderAuditsArchive();
                    }
                }
            }, 15000);
        }
        (function () {
            try {
                var sidebar = document.querySelector('.sidebar');
                var btn = document.getElementById('sidebar-collapse-btn');
                if (sidebar && window.ApDb && window.ApDb.get('sidebarCollapsed')) {
                    sidebar.classList.add('collapsed');
                    if (btn)
                        btn.innerHTML = '\u25B6';
                }
                var lowEl = document.getElementById('dash-lowstock');
                if (lowEl && window.ApDb && window.ApDb.get('dashLowStockHidden')) {
                    lowEl.style.display = 'none';
                    var lowBtn = document.querySelector('#panel-dash-lowstock .collapse-btn');
                    if (lowBtn)
                        lowBtn.innerHTML = '\u25BC';
                }
            } catch (e) {
            }
        }());
    } catch (e) {
        try {
            toast('Ошибка после входа: ' + (e && e.message ? e.message : e), 'err');
        } catch (err) {
        }
        try {
            showLogin();
        } catch (err2) {
        }
        throw e;
    }
}





document.getElementById('btn-logout').onclick = function () {
    confirmAction('Выход', 'Выйти из системы?', async function () {
        try { await showLogin(); } catch (e) { /* suppress */ }
        toast('Вы вышли из системы');
    });
};

function goPage(name) {
    if (!isAdmin() && !hasGroupPermission(name)) {
        toast('Нет доступа к разделу', 'err');
        return;
    }
    const sb = document.querySelector('.sidebar');
    const ov = document.getElementById('sidebar-overlay');
    if (sb && sb.classList.contains('active')) {
        sb.classList.remove('active');
        if (ov)
            ov.classList.remove('active');
    }
    document.querySelectorAll('.nav-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.page === name);
    });
    document.querySelectorAll('.page').forEach(function (p) {
        p.classList.toggle('active', p.id === 'page-' + name);
    });
    if (name === 'products')
        renderProducts();
    if (name === 'sales') {
        fillSaleProducts();
        clearSaleSelection();
        renderSalesToday();
        renderPosSideHistory();
        updateSaleShiftBanner();
        focusSaleSearch();
        renderPosCatBrowser();
        updatePosClock();
        if (typeof posCashierName === 'function')
            posCashierName();
    }
    if (name === 'expenses')
        renderExpenses();
    if (name === 'statistics')
        renderStatistics();
    if (name === 'promotions')
        renderPromotionsPage();
    if (name === 'cards')
        renderCustomers();
    if (name === 'categories')
        renderCategoriesPage();
    if (name === 'dashboard')
        renderDashboard();
    if (name === 'cashiers')
        renderCashiersPage();
    if (name === 'audits')
        renderAuditsPage();
    if (name === 'myshift')
        renderMyShiftPage();
    if (name === 'debts') {
        migrateDebtData();
        renderDebts();
    }
    if (name === 'deferred') {
        migrateDeferredData();
        renderDeferred();
    }
    if (name === 'documents')
        renderDocuments();
    if (name === 'sales')
        updateSaleShiftBanner();
    if (typeof lucide !== 'undefined')
        setTimeout(function () {
            lucide.createIcons();
        }, 50);
}



document.querySelectorAll('.nav-btn').forEach(function (btn) {
    btn.onclick = function () {
        goPage(btn.dataset.page);
    };
});

const menuToggle = document.getElementById('btn-menu-toggle');

const sidebar = document.querySelector('.sidebar');

const overlay = document.getElementById('sidebar-overlay');

if (menuToggle && sidebar && overlay) {
    menuToggle.onclick = function () {
        sidebar.classList.add('active');
        overlay.classList.add('active');
    };
    overlay.onclick = function () {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    };
}



































































function updatePosClock() {
    var el = document.getElementById('pos-clock-display');
    if (el)
        el.textContent = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
}



setInterval(function () {
    var p = document.getElementById('page-sales');
    if (p && !p.classList.contains('hidden'))
        updatePosClock();
}, 10000);



function showPosView(view) {
    document.querySelectorAll('.pos-top-tab').forEach(function (b) {
        b.classList.toggle('active', b.dataset.posView === view);
    });
    if (view === 'sales') {
    }
    if (view === 'return')
        openReturnSelector();
}



function renderPosCatBrowser() {
    var container = document.getElementById('pos-cat-strip');
    if (!container) return;
    var cats = getCategories();
    var all = getProducts();
    var html = '<button class="active" onclick="filterCategory(\'\')">⭐ Все</button>';
    var favCount = all.filter(function (p) { return p.favorite; }).length;
    if (favCount) {
        html += '<button data-cat-id="__favorites__" onclick="filterCategory(\'__favorites__\')">⭐ Быстрые</button>';
    }
    cats.forEach(function (c) {
        var count = all.filter(function (p) { return p.category === c.id; }).length;
        if (count) {
            html += '<button data-cat-id="' + c.id + '" onclick="filterCategory(\'' + esc(c.id) + '\')">' + esc(c.name) + '</button>';
        }
    });
    container.innerHTML = html;
    _posBrowserState.cat = '';
}











function toggleFavPos(productId, e) {
    if (e)
        e.stopPropagation();
    var products = getProducts();
    var p = products.find(function (x) { return x.id === productId; });
    if (!p) return;
    p.favorite = !p.favorite;
    setProducts(products);
    renderPosCatBrowser();
    if (_posBrowserState.cat === '__favorites__' || document.querySelector('#pos-cat-strip button[data-cat-id="__favorites__"].active')) {
        filterCategory('__favorites__');
    }
}





function switchPosTab(tab) {
}





function renderPosCatList() {
    try {
        var list = document.getElementById('pos-cat-modal-list');
        if (!list)
            return;
        _posCatModalState.mode = 'categories';
        _posCatModalState.catId = '';
        var cats = getCategories() || [];
        var all = getProducts() || [];
        var html = '<button class="pos-cat-pill active" onclick="filterCategoryFromModal(\'\')">Все</button>';
        cats.forEach(function (c) {
            var count = all.filter(function (p) {
                return p.category === c.id;
            }).length;
            html += '<button class="pos-cat-pill" onclick="filterCategoryFromModal(\'' + esc(c.id) + '\')">' + esc(c.name) + ' (' + count + ')</button>';
        });
        list.style.cssText = 'display:flex;flex-wrap:wrap;gap:12px;padding:16px';
        list.innerHTML = html;
    } catch (e) {
        toast('Ошибка при возврате к категориям', 'err');
    }
}





var activeRightPanel = 'sales';

function setRightPanel(panel) {
    var searchEl = document.getElementById('sale-search');
    if (searchEl) searchEl.focus();
}

function openPosCategories() {
    var searchEl = document.getElementById('sale-search');
    if (searchEl) searchEl.focus();
}

function openPosFavorites() {
    filterCategory('__favorites__');
}

function renderPosSideHistory() {
    var el = document.getElementById('pos-shift-history');
    if (!el)
        return;
    var shift = currentUser && (getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username));
    if (!shift) {
        el.innerHTML = '<div class="pos-empty-msg">Смена не открыта</div>';
        return;
    }
    var allSales = getSales().filter(function (s) {
        return isSaleActive(s);
    });
    var shiftSales = allSales.filter(function (s) {
        return s.shiftId === shift.id;
    });
    var receipts = groupSalesIntoReceipts(shiftSales);
    if (!receipts.length) {
        el.innerHTML = '<div class="pos-empty-msg">Нет продаж в этой смене</div>';
        return;
    }
    var html = '';
    receipts.forEach(function (r) {
        var payLabel = PAY_LABELS[r.payment] || r.payment || '';
        var payBadge = '';
        if (payLabel === 'Наличные')
            payBadge = '<span class="side-pay-badge" style="background:#ecfdf5;color:#059669">нал</span>';
        else if (payLabel === 'Kaspi QR')
            payBadge = '<span class="side-pay-badge" style="background:#f0fdf4;color:#16a34a">kaspi</span>';
        else if (payLabel === 'Банк')
            payBadge = '<span class="side-pay-badge" style="background:#eff6ff;color:#2563eb">банк</span>';
        else if (payLabel === 'Смешанный')
            payBadge = '<span class="side-pay-badge" style="background:#fefce8;color:#ca8a04">смеш</span>';
        else if (payLabel === 'В долг')
            payBadge = '<span class="side-pay-badge" style="background:#fef2f2;color:#dc2626">долг</span>';
        else if (payLabel)
            payBadge = '<span class="side-pay-badge" style="background:#f3f4f6;color:#6b7280">' + esc(payLabel) + '</span>';
        var timeStr = r.date ? fmtDate(r.date) : '\u2014';
        var itemsCount = r.items.reduce(function (s, it) {
            return s + (Number(it.quantity) || 0);
        }, 0);
        html += '<div class="pos-side-sale" onclick="openReceipt(\'' + r.id + '\')">' + '<span class="pos-side-sale-num">\u2116' + r.id.slice(-6) + '</span>' + '<div class="pos-side-sale-info"><span class="side-sale-time">' + esc(timeStr) + '</span><span>x' + itemsCount + '</span></div>' + payBadge + '<span class="pos-side-sale-amount">' + fmt(r.total) + '</span>' + '</div>';
    });
    el.innerHTML = html;
}











document.addEventListener('click', function (e) {
    var m = document.getElementById('modal-admin-pin');
    if (m && m.classList.contains('show') && e.target === m)
        closeModal('modal-admin-pin');
});







































































































































































































































































































setInterval(function () {
    var list = getPromotions();
    var now = new Date();
    var changed = false;
    list = list.map(function (p) {
        var end = new Date(p.endDate + 'T' + (p.endTime || '23:59'));
        if (p.active !== false && now > end) {
            p.active = false;
            changed = true;
        }
        return p;
    });
    if (changed)
        setPromotions(list);
}, 60000);

async function initApp() {
    if (!window.ApDb || !window.ApAuth || !window.ApScreens) {
        alert('Не загружены файлы приложения (ap-db.js, ap-auth.js\u2026).\nПроверьте наличие папки js/ на сервере.');
        return;
    }
    migrateProducts();
    migrateBarcodes();
    migrateSalesRecords();
    document.getElementById('auth-screen').style.display = 'flex';
    try { await window.ApScreens.bootstrap(); } catch (e) { console.error('Bootstrap error:', e); return; }
    if (getUsers().length === 0) {
        var existingLU = getLocalUsers();
        if (!existingLU.length) {
            setLocalUsers([
                {
                    id: 'user-admin',
                    username: 'admin',
                    password: 'admin123',
                    name: 'Администратор',
                    role: 'admin',
                    active: true
                },
                {
                    id: uid(),
                    username: 'cashier',
                    password: 'cashier123',
                    name: 'Кассир 1',
                    role: 'cashier',
                    active: true
                }
            ]);
        }
    }
    window._syncInterval = setInterval(function () {
        if (!currentUser)
            return;
        if (document.querySelector('.modal.open'))
            return;
        syncWithSupabase();
    }, 5000);
    window._backupInterval = setInterval(function () {
        if (currentUser && isAdmin()) {
            autoBackup();
        }
    }, 7200000);
}



window._notifBadgeInterval = setInterval(updateNotifBadge, 30000);



function setUIPosMode(mode) {
    getUISettings();
    _uiSettings.posMode = mode;
    saveUISettings();
    applyUISettings();
    openUISettings();
    toast('Режим POS: ' + mode, 'ok');
}



function openUISettings() {
    var s = getUISettings();
    document.querySelectorAll('#ui-profile-select button').forEach(function (b) {
        b.classList.toggle('btn-primary', b.dataset.profile === (s.profile || 'desktop'));
        b.classList.toggle('btn-secondary', b.dataset.profile !== (s.profile || 'desktop'));
    });
    document.querySelectorAll('#ui-scale-select button').forEach(function (b) {
        b.classList.toggle('btn-primary', parseFloat(b.dataset.scale) === (s.scale || 1));
        b.classList.toggle('btn-secondary', parseFloat(b.dataset.scale) !== (s.scale || 1));
    });
    document.querySelectorAll('#ui-card-size-select button').forEach(function (b) {
        b.classList.toggle('btn-primary', parseFloat(b.dataset.cardsize) === (s.cardSize || 1));
        b.classList.toggle('btn-secondary', parseFloat(b.dataset.cardsize) !== (s.cardSize || 1));
    });
    document.querySelectorAll('#ui-button-size-select button').forEach(function (b) {
        b.classList.toggle('btn-primary', parseFloat(b.dataset.btnsize) === (s.buttonSize || 1));
        b.classList.toggle('btn-secondary', parseFloat(b.dataset.btnsize) !== (s.buttonSize || 1));
    });
    document.querySelectorAll('#ui-cols-select button').forEach(function (b) {
        b.classList.toggle('btn-primary', parseInt(b.dataset.cols) === (s.cols || 4));
        b.classList.toggle('btn-secondary', parseInt(b.dataset.cols) !== (s.cols || 4));
    });
    document.querySelectorAll('#ui-posmode-select button').forEach(function (b) {
        b.classList.toggle('btn-primary', b.dataset.posmode === (s.posMode || 'standard'));
        b.classList.toggle('btn-secondary', b.dataset.posmode !== (s.posMode || 'standard'));
    });
    var visContainer = document.getElementById('ui-visibility-toggles');
    if (visContainer) {
        var vis = s.visibility || {};
        var labels = {
            sidebar: 'Боковое меню',
            header: 'Шапка (мобильная)',
            'dash-cards': 'Карточки на главной',
            'dash-analytics': 'Аналитика на главной',
            'sales-history': 'История продаж (справа)',
            'stats-cards': 'Карточки статистики'
        };
        visContainer.innerHTML = Object.keys(labels).map(function (key) {
            return '<label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer">' + '<input type="checkbox" ' + (vis[key] !== false ? 'checked' : '') + ' onchange="toggleUIVisibility(\'' + key + '\', this.checked)"> ' + labels[key] + '</label>';
        }).join('');
    }
    renderSavedUIProfiles();
    renderPosLayoutEditor();
    openModal('modal-ui-settings');
}



function toggleUIVisibility(key, visible) {
    getUISettings();
    if (!_uiSettings.visibility)
        _uiSettings.visibility = {};
    _uiSettings.visibility[key] = visible;
    saveUISettings();
    applyUISettings();
}



function setUIProfile(profile) {
    var profiles = {
        phone: {
            scale: 0.85,
            cardSize: 0.85,
            cols: 2
        },
        tablet: {
            scale: 0.9,
            cardSize: 0.9,
            cols: 3
        },
        desktop: {
            scale: 1,
            cardSize: 1,
            cols: 4
        },
        pos: {
            scale: 1.15,
            cardSize: 1.1,
            cols: 5
        }
    };
    var p = profiles[profile] || profiles.desktop;
    getUISettings();
    _uiSettings.profile = profile;
    _uiSettings.scale = p.scale;
    _uiSettings.cardSize = p.cardSize;
    _uiSettings.cols = p.cols;
    saveUISettings();
    applyUISettings();
    openUISettings();
    toast('Профиль \xAB' + profile + '\xBB применён', 'ok');
}



function setUIScale(scale) {
    getUISettings();
    _uiSettings.scale = scale;
    _uiSettings.profile = null;
    saveUISettings();
    applyUISettings();
    openUISettings();
}



function setUICardSize(size) {
    getUISettings();
    _uiSettings.cardSize = size;
    _uiSettings.profile = null;
    saveUISettings();
    applyUISettings();
    openUISettings();
}



function setUICols(cols) {
    getUISettings();
    _uiSettings.cols = cols;
    _uiSettings.profile = null;
    saveUISettings();
    applyUISettings();
    openUISettings();
}



function setUIButtonSize(size) {
    getUISettings();
    _uiSettings.buttonSize = size;
    _uiSettings.profile = null;
    saveUISettings();
    applyUISettings();
    openUISettings();
}



function saveUIProfile() {
    var name = document.getElementById('ui-profile-name').value.trim();
    if (!name) {
        toast('Введите название профиля', 'err');
        return;
    }
    var s = getUISettings();
    var profiles = getUIProfiles();
    profiles[name] = {
        scale: s.scale || 1,
        cardSize: s.cardSize || 1,
        cols: s.cols || 4,
        buttonSize: s.buttonSize || 1,
        visibility: s.visibility || {}
    };
    setUIProfiles(profiles);
    document.getElementById('ui-profile-name').value = '';
    renderSavedUIProfiles();
    toast('Профиль \xAB' + name + '\xBB сохранён', 'ok');
}



function loadUIProfile(name) {
    var profiles = getUIProfiles();
    var p = profiles[name];
    if (!p)
        return;
    getUISettings();
    Object.keys(p).forEach(function (k) {
        _uiSettings[k] = p[k];
    });
    _uiSettings.profile = name;
    saveUISettings();
    applyUISettings();
    openUISettings();
    toast('Профиль \xAB' + name + '\xBB загружен', 'ok');
}



function deleteUIProfile(name) {
    confirmAction('Удалить профиль', 'Удалить профиль \xAB' + name + '\xBB?', function () {
        var profiles = getUIProfiles();
        delete profiles[name];
        setUIProfiles(profiles);
        renderSavedUIProfiles();
        toast('Профиль удалён', 'ok');
    });
}



function getPosLayout() {
    var s = getUISettings();
    return s.posLayout || [
        'favorites',
        'categories',
        'shift-history',
        'search'
    ];
}

function setPosLayout(layout) {
    getUISettings();
    _uiSettings.posLayout = layout;
    saveUISettings();
}

function resetPosLayout() {
    getUISettings();
    _uiSettings.posLayout = [
        'favorites',
        'categories',
        'shift-history',
        'search'
    ];
    saveUISettings();
    renderPosLayoutEditor();
    applyPosLayout();
    toast('Порядок блоков сброшен', 'ok');
}



function applyPosLayout() {
}

function onPosLayoutDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.key);
    e.target.classList.add('dragging');
}

function onPosLayoutDragOver(e) {
    e.preventDefault();
    var target = e.target.closest('.pos-layout-item');
    if (!target)
        return;
    var rect = target.getBoundingClientRect();
    var mid = rect.top + rect.height / 2;
    target.classList.toggle('drag-over-top', e.clientY < mid);
    target.classList.toggle('drag-over-bottom', e.clientY >= mid);
}

function onPosLayoutDrop(e) {
    e.preventDefault();
    var draggedKey = e.dataTransfer.getData('text/plain');
    var target = e.target.closest('.pos-layout-item');
    if (!target || target.dataset.key === draggedKey)
        return;
    var layout = getPosLayout();
    var fromIdx = layout.indexOf(draggedKey);
    var toIdx = layout.indexOf(target.dataset.key);
    if (fromIdx < 0 || toIdx < 0)
        return;
    layout.splice(fromIdx, 1);
    layout.splice(toIdx, 0, draggedKey);
    setPosLayout(layout);
    renderPosLayoutEditor();
    applyPosLayout();
}

function onPosLayoutDragEnd(e) {
    document.querySelectorAll('.pos-layout-item').forEach(function (el) {
        el.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom');
    });
}

window.addEventListener('resize', function () {
    var s = getUISettings();
    var grid = document.getElementById('pos-products');
    if (grid) {
        var cols = s.cols || 4;
        if (window.innerWidth < 768)
            cols = Math.min(cols, 3);
        if (window.innerWidth < 480)
            cols = Math.min(cols, 2);
        grid.style.setProperty('--grid-cols', cols);
    }
});



document.addEventListener('change', function (e) {
    if (e.target.classList.contains('bulk-item')) {
        if (e.target.checked)
            _bulkSelected.add(e.target.dataset.id);
        else
            _bulkSelected.delete(e.target.dataset.id);
        updateBulkBar();
        var selAll = document.getElementById('bulk-select-all');
        if (selAll) {
            var all = document.querySelectorAll('.bulk-item');
            var checked = document.querySelectorAll('.bulk-item:checked');
            selAll.checked = all.length > 0 && checked.length === all.length;
        }
    }
});









































function boot() {
    restoreAutoBackup();
    initApp();
    document.getElementById('login-form').onsubmit = function (e) {
        e.preventDefault();
        try {
            var storeId = (document.getElementById('login-store').value || '').trim();
            if (storeId && storeId !== currentStoreId) {
                setStore('currentStoreId', storeId);
            }
            var login = document.getElementById('login-user').value.trim();
            var pass = document.getElementById('login-pass').value;
            var u = findUserByLogin(login);
            if (!u) {
                toast('Неверный логин или пароль', 'err');
                return;
            }
            if (u.memberId) {
                toast('Этот аккаунт входит через Supabase (email/пароль)', 'err');
                return;
            }
            if (u.password !== pass) {
                toast('Неверный логин или пароль', 'err');
                return;
            }
            setCurrentUser({
                id: u.id,
                username: u.username || '',
                name: u.name,
                role: u.role || 'cashier'
            });
            toast('Добро пожаловать, ' + u.name + '!', 'ok');
            showApp();
        } catch (err) {
            try {
                toast('Ошибка входа: ' + (err && err.message ? err.message : err), 'err');
            } catch (e2) {
            }
            throw err;
        }
    };
    set('openModal', openModal);
    set('refreshAll', refreshAll);
    set('_reopenParentModal', _reopenParentModal);
    set('goPage', goPage);
    set('renderNotifications', renderNotifications);
    set('renderDashboard', renderDashboard);
}

var _ex={};
try{_ex['_closeParentModals']=_closeParentModals}catch(e){}
try{_ex['_reopenParentModal']=_reopenParentModal}catch(e){}
try{_ex['uid']=uid}catch(e){}
try{_ex['openModal']=openModal}catch(e){}
try{_ex['renderStoreUI']=renderStoreUI}catch(e){}
try{_ex['applyRoleUI']=applyRoleUI}catch(e){}
try{_ex['renderDashboard']=renderDashboard}catch(e){}
try{_ex['buildInvoiceHTML']=buildInvoiceHTML}catch(e){}
try{_ex['renderAnalytics']=renderAnalytics}catch(e){}
try{_ex['renderAnalyticsCards']=renderAnalyticsCards}catch(e){}
try{_ex['renderPeakHour']=renderPeakHour}catch(e){}
try{_ex['renderRecords']=renderRecords}catch(e){}
try{_ex['renderAuditsPage']=renderAuditsPage}catch(e){}
try{_ex['renderWriteOffsTable']=renderWriteOffsTable}catch(e){}
try{_ex['renderAuditsArchive']=renderAuditsArchive}catch(e){}
try{_ex['showCustomModal']=showCustomModal}catch(e){}
try{_ex['updateAutoBackupUI']=updateAutoBackupUI}catch(e){}
try{_ex['renderNotifications']=renderNotifications}catch(e){}
try{_ex['applyUIVisibility']=applyUIVisibility}catch(e){}
try{_ex['applyUIPosMode']=applyUIPosMode}catch(e){}
try{_ex['getUIProfiles']=getUIProfiles}catch(e){}
try{_ex['setUIProfiles']=setUIProfiles}catch(e){}
try{_ex['renderSavedUIProfiles']=renderSavedUIProfiles}catch(e){}
try{_ex['renderPosLayoutEditor']=renderPosLayoutEditor}catch(e){}
try{_ex['refreshAll']=refreshAll}catch(e){}
try{_ex['showApp']=showApp}catch(e){}
try{_ex['goPage']=goPage}catch(e){}
try{_ex['menuToggle']=menuToggle}catch(e){}
try{_ex['sidebar']=sidebar}catch(e){}
try{_ex['overlay']=overlay}catch(e){}
try{_ex['updatePosClock']=updatePosClock}catch(e){}
try{_ex['showPosView']=showPosView}catch(e){}
try{_ex['renderPosCatBrowser']=renderPosCatBrowser}catch(e){}
try{_ex['toggleFavPos']=toggleFavPos}catch(e){}
try{_ex['switchPosTab']=switchPosTab}catch(e){}
try{_ex['renderPosCatList']=renderPosCatList}catch(e){}
try{_ex['openPosCategories']=openPosCategories}catch(e){}
try{_ex['openPosFavorites']=openPosFavorites}catch(e){}
try{_ex['renderPosSideHistory']=renderPosSideHistory}catch(e){}
try{_ex['initApp']=initApp}catch(e){}
try{_ex['setUIPosMode']=setUIPosMode}catch(e){}
try{_ex['openUISettings']=openUISettings}catch(e){}
try{_ex['toggleUIVisibility']=toggleUIVisibility}catch(e){}
try{_ex['setUIProfile']=setUIProfile}catch(e){}
try{_ex['setUIScale']=setUIScale}catch(e){}
try{_ex['setUICardSize']=setUICardSize}catch(e){}
try{_ex['setUICols']=setUICols}catch(e){}
try{_ex['setUIButtonSize']=setUIButtonSize}catch(e){}
try{_ex['saveUIProfile']=saveUIProfile}catch(e){}
try{_ex['loadUIProfile']=loadUIProfile}catch(e){}
try{_ex['deleteUIProfile']=deleteUIProfile}catch(e){}
try{_ex['getPosLayout']=getPosLayout}catch(e){}
try{_ex['setPosLayout']=setPosLayout}catch(e){}
try{_ex['resetPosLayout']=resetPosLayout}catch(e){}
try{_ex['applyPosLayout']=applyPosLayout}catch(e){}
try{_ex['onPosLayoutDragStart']=onPosLayoutDragStart}catch(e){}
try{_ex['onPosLayoutDragOver']=onPosLayoutDragOver}catch(e){}
try{_ex['onPosLayoutDrop']=onPosLayoutDrop}catch(e){}
try{_ex['onPosLayoutDragEnd']=onPosLayoutDragEnd}catch(e){}
try{_ex['activeRightPanel']=activeRightPanel}catch(e){}
try{_ex['setRightPanel']=setRightPanel}catch(e){}
return _ex;})();

// sales
__mod['sales']=(function(){
var renderPosSideHistory=__mf('ui','renderPosSideHistory');
var renderPosCatBrowser=__mf('ui','renderPosCatBrowser');
var setDebts=__mf('debts','setDebts');
var toast=__mf('notifications','toast');
var tableHTML=__mf('utils','tableHTML');
var fmt=__mf('utils','fmt');
var closeModal=__mf('utils','closeModal');
var smartMatchProducts=__mf('products','smartMatchProducts');
var getProductDiscount=__mf('products','getProductDiscount');
var addToCart=__mf('cart','addToCart');
var fillSaleProducts=__mf('products','fillSaleProducts');
var renderDebts=__mf('debts','renderDebts');
var renderDocuments=__mf('documents','renderDocuments');
var fmtShort=__mf('utils','fmtShort');
var setProducts=__mf('products','setProducts');
var checkPermission=__mf('users','checkPermission');
var getCustomerTier=__mf('customers','getCustomerTier');
var uid=__mf('ui','uid');
var escapeHtml=__mf('utils','escapeHtml');
var getDocuments=__mf('documents','getDocuments');
var renderSaleCart=__mf('cart','renderSaleCart');
var fmtDate=__mf('utils','fmtDate');
var setCurrentCustomer=__mf('customers','setCurrentCustomer');
var createExcelWorkbook=__mf('utils','createExcelWorkbook');
var setDocuments=__mf('documents','setDocuments');
var renderAuditsArchive=__mf('ui','renderAuditsArchive');
var getCustomers=__mf('customers','getCustomers');
var getDebts=__mf('debts','getDebts');
var renderStatistics=__mf('statistics','renderStatistics');
var confirmAction=__mf('utils','confirmAction');
var openModal=__mf('ui','openModal');
var getProducts=__mf('products','getProducts');
var isToday=__mf('utils','isToday');
var setSaleCart=__mf('cart','setSaleCart');
var _posBrowserState=__mv('statistics','_posBrowserState');
var calcShiftTotals=__mf('shifts','calcShiftTotals');
var findProductByScan=__mf('products','findProductByScan');
var goPage=__mf('ui','goPage');
var exportSectionToExcel=__mf('reports','exportSectionToExcel');
var renderProducts=__mf('products','renderProducts');
var showPaymentMethodModal=__mf('utils','showPaymentMethodModal');
var _auditSession=__mv('auth','_auditSession');
var currentCustomer=__mv('customers','currentCustomer');
var getOpenShiftForCashier=__mf('users','getOpenShiftForCashier');
var getDebtors=__mf('debts','getDebtors');
var isAdmin=__mf('users','isAdmin');
var setDebtors=__mf('debts','setDebtors');
var saleCart=__mv('cart','saleCart');
var setSelectedCartItemId=__mf('products','setSelectedCartItemId');
var renderWriteOffsTable=__mf('ui','renderWriteOffsTable');
var saveExcelBuffer=__mf('utils','saveExcelBuffer');
var currentUser=__mv('users','currentUser');
var setCustomers=__mf('customers','setCustomers');
var set=__mf('app-context','set');
var esc=__mf('utils','esc');
var renderDashboard=__mf('ui','renderDashboard');
var todayStr=__mf('utils','todayStr');
var setAuditSession=__mf('auth','setAuditSession');



const PAY_LABELS = {
    cash: 'Наличные',
    kaspi: 'Kaspi QR',
    transfer: 'Банк',
    mixed: 'Смешанная',
    debt: 'В долг'
};

let currentPayment = 'cash';

function setCurrentPayment(value) {
    currentPayment = value;
}

function getSales() {
    return window.ApDb ? window.ApDb.getSales() : [];
}

function setSales(arr) {
    if (window.ApDb)
        window.ApDb.setSales(arr);
}

function migrateSalesRecords() {
    const sales = getSales();
    if (!sales.length)
        return;
    const products = getProducts();
    let changed = false;
    const migrated = sales.map(function (s) {
        let out = s;
        if (!out.receiptId) {
            out = Object.assign({}, out, { receiptId: out.id });
            changed = true;
        }
        if (out.purchasePrice == null) {
            const p = out.productId ? products.find(function (x) {
                return x.id === out.productId;
            }) : null;
            out = Object.assign({}, out, { purchasePrice: p ? Number(p.purchasePrice) || 0 : 0 });
            changed = true;
        }
        return out;
    });
    if (changed)
        setSales(migrated);
}

function focusSaleSearch() {
    setTimeout(function () {
        var el = document.getElementById('sale-search');
        if (el && document.getElementById('page-sales').classList.contains('active'))
            el.focus();
    }, 150);
}

document.addEventListener('keydown', function(e) {
    if (!document.getElementById('page-sales').classList.contains('active')) return;
    if (e.key === 'F2') {
        e.preventDefault();
        document.getElementById('sale-search').focus();
        return;
    }
    if (e.key === 'F8') {
        e.preventDefault();
        completeSale();
        return;
    }
});

function isSaleActive(s) {
    return !s.status || s.status === 'completed';
}

function saleStatusBadge(s) {
    return isSaleActive(s) ? '<span class="badge badge-ok">Завершена</span>' : '<span class="badge badge-danger">Отменена</span>';
}

function adminCancelSaleBtn(s) {
    if (!isAdmin() || !isSaleActive(s))
        return '\u2014';
    return '<button class="btn btn-sm btn-danger" onclick="cancelSaleConfirm(\'' + s.id + '\')">Отменить</button>';
}

function togglePaymentSection(id, show) {
    var el = document.getElementById(id);
    if (!el)
        return;
    if (show) {
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

function renderSalesToday() {
    const list = getSales().filter(function (s) {
        return isToday(s.date) && isSaleActive(s);
    });
    const receipts = groupSalesIntoReceipts(list);
    const cols = [
        'Чек',
        'Товаров',
        'Сумма',
        'Оплата',
        'Кассир',
        'Время',
        ''
    ];
    document.getElementById('sales-today-list').innerHTML = receipts.length ? tableHTML(cols, receipts.map(function (r) {
        return [
            '<span class="code-tag">\u2116 ' + r.id.slice(-6) + '</span>',
            r.items.reduce(function (sum, it) {
                return sum + (Number(it.quantity) || 0);
            }, 0),
            fmt(r.total),
            badgePay(r.payment, r.items[0]),
            r.userName || '\u2014',
            fmtDate(r.date),
            '<button class="btn btn-sm btn-secondary" onclick="openReceipt(\'' + r.id + '\')">Открыть</button> ' + '<button class="btn btn-sm btn-primary" onclick="printInvoice(\'' + r.id + '\')">Накладная</button> ' + '<button class="btn btn-sm btn-primary" onclick="printSalePKO(\'' + r.id + '\')">ПКО</button>'
        ];
    })) : '<div class="empty">Продаж сегодня нет</div>';
}

function buildSalePKOHTML(sale, receiptId, storeName, total) {
    var date = sale.date || new Date().toISOString();
    var payer = sale.customerName || sale.clientName || '\u2014';
    var basis = 'Оплата по чеку \u2116' + receiptId.slice(-6) + ' от ' + fmtDate(date);
    var h = '<div style="font-family:\'Times New Roman\',Times,serif;color:#000;max-width:700px;margin:0 auto;padding:24px 20px;font-size:13px;line-height:1.4">';
    h += '<div style="text-align:center;font-size:16px;font-weight:700;margin-bottom:8px">ПРИХОДНЫЙ КАССОВЫЙ ОРДЕР</div>';
    h += '<div style="display:flex;justify-content:space-between;margin-bottom:16px">' + '<span><strong>\u2116:</strong> ' + receiptId.slice(-6) + '</span>' + '<span><strong>Дата:</strong> ' + fmtDate(date) + '</span>' + '</div>';
    h += '<div style="border:1px solid #000;padding:16px;margin-bottom:16px">';
    h += '<p><strong>Принято от:</strong> ' + escapeHtml(payer) + '</p>';
    h += '<p><strong>Основание:</strong> ' + escapeHtml(basis) + '</p>';
    h += '<p style="font-size:16px;font-weight:700;text-align:right">Сумма: ' + fmt(total) + ' \u20B8</p>';
    h += '</div>';
    h += '<div style="font-size:12px;margin-top:16px">' + '<div style="display:flex;justify-content:space-between;max-width:500px">' + '<span>Главный бухгалтер: _______________</span>' + '<span>Кассир: _______________</span>' + '</div></div>';
    h += '<div style="font-size:11px;color:#555;margin-top:24px;text-align:center">' + '<em>Организация (ИП): ' + escapeHtml(storeName) + '</em></div>';
    h += '</div>';
    return h;
}

function cancelSale(saleId) {
    const sales = getSales();
    const idx = sales.findIndex(function (s) {
        return s.id === saleId;
    });
    if (idx < 0)
        return;
    const sale = sales[idx];
    if (!isSaleActive(sale))
        return;
    if (sale.productId) {
        const products = getProducts();
        const product = products.find(function (p) {
            return p.id === sale.productId;
        });
        if (product) {
            product.quantity += sale.quantity;
            setProducts(products);
        }
    }
    sales[idx] = Object.assign({}, sale, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
        cancelledBy: currentUser.name
    });
    setSales(sales);
    toast('Продажа отменена, товар возвращён на склад', 'ok');
    renderSalesToday();
    renderPosSideHistory();
    renderDashboard();
    renderProducts();
    fillSaleProducts();
    if (document.getElementById('page-statistics').classList.contains('active'))
        renderStatistics();
}

function renderSalesHeatmap(sales) {
    var container = document.getElementById('sales-heatmap');
    if (!container)
        return;
    var heat = {};
    var days = [
        'Вс',
        'Пн',
        'Вт',
        'Ср',
        'Чт',
        'Пт',
        'Сб'
    ];
    for (var d = 0; d < 7; d++) {
        heat[d] = {};
        for (var h = 0; h < 24; h++)
            heat[d][h] = 0;
    }
    sales.forEach(function (s) {
        var dt = new Date(s.date);
        var day = dt.getDay();
        var hour = dt.getHours();
        if (heat[day] && heat[day][hour] !== undefined)
            heat[day][hour] += Number(s.total) || 0;
    });
    var maxVal = 0;
    for (var d2 = 0; d2 < 7; d2++)
        for (var h2 = 0; h2 < 24; h2++)
            maxVal = Math.max(maxVal, heat[d2][h2]);
    maxVal = maxVal || 1;
    var html = '<table style="border-collapse:collapse;font-size:11px"><thead><tr><th style="padding:4px;width:30px"></th>';
    for (var h3 = 0; h3 < 24; h3++)
        html += '<th style="padding:4px;min-width:28px;text-align:center;font-weight:400;color:var(--text-muted)">' + h3 + '</th>';
    html += '</tr></thead><tbody>';
    for (var d3 = 0; d3 < 7; d3++) {
        html += '<tr><td style="padding:4px;font-weight:600;text-align:right;color:var(--text-muted)">' + days[d3] + '</td>';
        for (var h4 = 0; h4 < 24; h4++) {
            var val = heat[d3][h4];
            var intensity = val / maxVal;
            var r = Math.round(255 - intensity * 200);
            var g = Math.round(255 - intensity * 150);
            var b = Math.round(255 - intensity * 80);
            html += '<td style="padding:2px;text-align:center;background:rgb(' + r + ',' + g + ',' + b + ');border-radius:3px;font-size:10px;color:' + (intensity > 0.5 ? '#fff' : '#666') + '" title="' + days[d3] + ' ' + h4 + ':00 \u2014 ' + fmt(Math.round(val)) + ' \u20B8">' + (val > 0 ? val > 100000 ? '\uD83D\uDD25' : val > 10000 ? '\u2022' : '\xB7' : '') + '</td>';
        }
        html += '</tr>';
    }
    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderMostExpensiveReceipt(receipts) {
    var container = document.getElementById('most-expensive-receipt');
    if (!container)
        return;
    if (!receipts.length) {
        container.innerHTML = '<div class="empty">Нет данных</div>';
        return;
    }
    var best = receipts[0];
    receipts.forEach(function (r) {
        if (r.total > best.total)
            best = r;
    });
    var cashierName = best.userName || '\u2014';
    var items = best.items || [];
    var qty = items.reduce(function (s, it) {
        return s + (Number(it.quantity) || 0);
    }, 0);
    container.innerHTML = '<div class="card" style="border-left:3px solid var(--warn)">' + '<div style="font-weight:700;font-size:18px;color:var(--text)">' + fmt(best.total) + ' \u20B8</div>' + '<div style="display:flex;gap:16px;margin-top:6px;flex-wrap:wrap;font-size:13px;color:var(--text-secondary)">' + '<span>\uD83D\uDC64 ' + esc(cashierName) + '</span>' + '<span>\uD83D\uDCE6 ' + qty + ' шт.</span>' + '<span>\uD83D\uDD50 ' + fmtDate(best.date) + '</span>' + '<span>\uD83D\uDCB3 ' + badgePay(best.payment, best.items[0]) + '</span>' + '</div></div>';
}

function updateSaleShiftBanner() {
    const banner = document.getElementById('sale-shift-banner');
    if (isAdmin()) {
        banner.classList.add('hidden');
        return;
    }
    const shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    banner.classList.remove('hidden');
    if (shift) {
        banner.style.borderColor = 'var(--accent)';
        const t = calcShiftTotals(shift.id);
        banner.innerHTML = '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px">' + '<div><strong style="color:var(--ok)">\u25CF Смена открыта</strong> \u2014 с ' + fmtDate(shift.openedAt) + '. Продаж: ' + t.salesCount + ', выручка: ' + fmt(t.revenue) + '</div>' + '<div style="display:flex;gap:8px;flex-wrap:wrap">' + '<button class="btn btn-sm btn-secondary" onclick="goPage(\'myshift\')">\uD83D\uDD50 Моя смена</button>' + '<button class="btn btn-sm btn-danger" onclick="closeShiftConfirm(\'' + shift.id + '\')">Закрыть смену</button>' + '</div></div>';
    } else {
        banner.style.borderColor = 'var(--warn)';
        banner.innerHTML = '<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px">' + '<div><strong style="color:var(--warn)">\u26A0 Смена не открыта</strong> \u2014 сначала откройте смену, чтобы продавать</div>' + '<button class="btn btn-sm btn-success" onclick="openShift()">\u25B6 Открыть смену</button>' + '</div>';
    }
}

function badgePay(pay, item) {
    if (pay === 'mixed' && item) {
        var parts = [];
        if (Number(item.cashAmount) > 0)
            parts.push('\uD83D\uDCB5' + fmt(item.cashAmount));
        if (Number(item.kaspiAmount) > 0)
            parts.push('\uD83D\uDCF1' + fmt(item.kaspiAmount));
        if (Number(item.transferAmount) > 0)
            parts.push('\uD83C\uDFE6' + fmt(item.transferAmount));
        return '<span class="badge badge-mixed">' + parts.join(' ') + '</span>';
    }
    const map = {
        cash: 'badge-cash',
        kaspi: 'badge-kaspi',
        transfer: 'badge-bank',
        debt: 'badge-warn',
        mixed: 'badge-mixed'
    };
    const cls = map[pay] || 'badge-info';
    return '<span class="badge ' + cls + '">' + (PAY_LABELS[pay] || pay) + '</span>';
}

function groupSalesIntoReceipts(salesList) {
    const map = {};
    (salesList || []).forEach(function (s) {
        const rid = s.receiptId || s.id;
        if (!map[rid]) {
            map[rid] = {
                id: rid,
                date: s.date,
                shiftId: s.shiftId || null,
                customerId: s.customerId || null,
                payment: s.payment,
                userName: s.userName,
                username: s.username,
                status: s.status,
                debtorName: s.debtorName || '',
                debtPhone: s.debtPhone || '',
                debtReturnDate: s.debtReturnDate || '',
                cashAmount: Number(s.cashAmount) || 0,
                kaspiAmount: Number(s.kaspiAmount) || 0,
                transferAmount: Number(s.transferAmount) || 0,
                bonusSpend: Number(s.bonusSpend) || 0,
                earnedBonus: Number(s.earnedBonus) || 0,
                discountAmount: Number(s.discountAmount) || 0,
                items: [],
                total: 0
            };
        }
        map[rid].items.push(s);
        map[rid].total += Number(s.total) || 0;
        if (!map[rid].payment)
            map[rid].payment = s.payment;
        if (!map[rid].date || s.date && s.date > map[rid].date)
            map[rid].date = s.date;
    });
    return Object.keys(map).map(function (k) {
        return map[k];
    }).sort(function (a, b) {
        return String(b.date || '').localeCompare(String(a.date || ''));
    });
}

function completeDebtPayment(debtorId, amount, paymentMethod) {
    var debtor = getDebtors().find(function (d) {
        return d.id === debtorId;
    });
    if (!debtor) {
        toast('Должник не найден', 'err');
        return;
    }
    var shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    var sales = getSales();
    var receiptId = uid();
    var dateStr = new Date().toISOString();
    sales.push({
        id: uid(),
        receiptId: receiptId,
        shiftId: shift ? shift.id : null,
        productId: null,
        productCode: '',
        productName: 'Погашение долга: ' + debtor.name,
        quantity: 1,
        unitPrice: amount,
        purchasePrice: 0,
        total: amount,
        payment: paymentMethod,
        cashAmount: paymentMethod === 'cash' ? amount : 0,
        kaspiAmount: paymentMethod === 'kaspi' ? amount : 0,
        transferAmount: paymentMethod === 'transfer' ? amount : 0,
        customerId: null,
        userName: currentUser.name,
        username: currentUser.username,
        date: dateStr,
        status: 'completed',
        debtorName: debtor.name || '',
        debtPhone: debtor.phone || '',
        debtReturnDate: ''
    });
    setSales(sales);
    var debts = getDebts();
    debts.push({
        id: uid(),
        debtorId: debtorId,
        debtorName: debtor.name,
        productCode: '',
        productName: 'Оплата',
        quantity: 1,
        amount: -amount,
        cashierName: currentUser.name,
        dueDate: null,
        status: 'open',
        note: 'Оплата через ' + (paymentMethod === 'cash' ? 'наличные' : paymentMethod === 'kaspi' ? 'Kaspi QR' : 'Банк'),
        date: dateStr
    });
    var openDebts = debts.filter(function (d) {
        return d.debtorId === debtorId && d.status === 'open' && d.amount > 0;
    });
    openDebts.sort(function (a, b) {
        return (a.date || '').localeCompare(b.date || '');
    });
    var remaining = amount;
    debts = debts.map(function (d) {
        if (d.debtorId === debtorId && d.status === 'open' && d.amount > 0 && remaining > 0) {
            if (d.amount <= remaining) {
                remaining -= d.amount;
                return Object.assign({}, d, { status: 'paid' });
            }
        }
        return d;
    });
    setDebts(debts);
    toast('Долг погашен: ' + fmt(amount) + ' (' + debtor.name + ')', 'ok');
    renderDebts();
    renderDashboard();
    renderSalesToday();
}




function getWriteOffs() {
    return window.ApDb ? window.ApDb.getWriteOffs() : [];
}

function getAudits() {
    return window.ApDb ? window.ApDb.getAudits() : [];
}

function getDeferred() {
    return window.ApDb ? window.ApDb.getDeferred() : [];
}

function setDeferred(arr) {
    if (window.ApDb)
        window.ApDb.setDeferred(arr);
}

var _posSearchTimer = null;

function onSaleSearch() {
    if (_posSearchTimer) clearTimeout(_posSearchTimer);
    _posSearchTimer = setTimeout(function() {
        _posSearchTimer = null;
        doSaleSearch();
    }, 200);
}

function doSaleSearch() {
    var term = document.getElementById('sale-search').value;
    var box = document.getElementById('sale-results');
    if (!box) return;
    var catFilter = _posBrowserState.cat || '';
    var prodArea = document.getElementById('pos-prod-area');
    if (!term.trim()) {
        box.classList.add('hidden');
        box.innerHTML = '';
        if (prodArea) prodArea.style.display = '';
        _posSearchIdx = -1;
        renderPosProducts(catFilter);
        return;
    }
    if (prodArea) prodArea.style.display = 'none';
    _posSearchIdx = -1;
    var matches = smartMatchProducts(term);
    if (catFilter)
        matches = matches.filter(function (p) { return p.category === catFilter; });
    if (!matches.length) {
        box.classList.remove('hidden');
        box.innerHTML = '<div style="padding:12px;text-align:center;color:#9ca3af">Ничего не найдено</div>';
        return;
    }
    box.classList.remove('hidden');
    box.innerHTML = matches.map(function (p) {
        return '<div class="sale-result-item" onclick="addToCart(\'' + p.id + '\',true);document.getElementById(\'sale-search\').focus()">' +
            '<span class="code-tag">' + (p.code || '—') + '</span> ' +
            (p.barcode ? '<span class="barcode-tag">' + p.barcode + '</span> ' : '') +
            '<span class="name">' + esc(p.name) + '</span><br>' +
            '<span style="font-size:11px;color:var(--text-muted)">' + fmt(p.price) + ' ₸ · ост. ' + p.quantity + '</span></div>';
    }).join('');
}

function renderPosProducts(catFilter) {
    var area = document.getElementById('pos-prod-area');
    if (!area) return;
    var products = getProducts();
    if (catFilter)
        products = products.filter(function (p) { return p.category === catFilter; });
    if (!products.length) {
        area.innerHTML = '<div class="pos-prod-empty">' + (catFilter ? 'Нет товаров в этой категории' : 'Товаров нет. Начните поиск.') + '</div>';
        return;
    }
    area.innerHTML = '<div class="pos-prod-grid">' + products.map(function (p) {
        var qty = parseInt(p.quantity) || 0;
        var stockLabel = qty > 0 ? 'ост. ' + qty : '<span style="color:var(--err)">нет</span>';
        var codeHtml = (p.code || p.barcode) ? '<div class="pp-code">' + esc(p.code || p.barcode) + '</div>' : '';
        return '<div class="pos-prod-card' + (qty <= 0 ? ' pos-prod-oos' : '') + '" onclick="if(' + qty + '>0)addToCart(\'' + p.id + '\')">' +
            codeHtml +
            '<div class="pp-name">' + esc(p.name) + '</div>' +
            '<div class="pp-price">' + fmt(p.price) + ' ₸</div>' +
            '<div class="pp-stock">' + stockLabel + '</div>' +
            '</div>';
    }).join('') + '</div>';
}

function clearSaleSelection(noConfirm) {
    if (!noConfirm && saleCart.length) {
        if (!confirm('Очистить корзину?'))
            return;
    }
    document.getElementById('sale-search').value = '';
    document.getElementById('sale-results').classList.add('hidden');
    setSaleCart([]);
    setCurrentCustomer(null);
    setSelectedCartItemId(null);
    document.getElementById('sale-customer-search').value = '';
    document.getElementById('sale-customer-name').value = '';
    document.getElementById('sale-customer-name').style.display = 'none';
    document.getElementById('sale-customer-info').style.display = 'none';
    document.getElementById('sale-bonus-wrap').style.display = 'none';
    var bs = document.getElementById('sale-bonus-spend');
    if (bs)
        bs.value = 0;
    var cg = document.getElementById('cash-given');
    if (cg)
        cg.value = '';
    var cc = document.getElementById('cash-change');
    if (cc)
        cc.value = '';
    var mc = document.getElementById('mixed-cash');
    if (mc)
        mc.value = '0';
    var mk = document.getElementById('mixed-kaspi');
    if (mk)
        mk.value = '0';
    var mt = document.getElementById('mixed-transfer');
    if (mt)
        mt.value = '0';
    var mcg = document.getElementById('mixed-cash-given');
    if (mcg)
        mcg.value = '';
    var mcc = document.getElementById('mixed-cash-change');
    if (mcc)
        mcc.value = '';
    var mr = document.getElementById('mixed-remainder');
    if (mr)
        mr.innerHTML = '';
    var dn = document.getElementById('debt-pay-name');
    if (dn)
        dn.value = '';
    var dp = document.getElementById('debt-pay-phone');
    if (dp)
        dp.value = '';
    var dd = document.getElementById('debt-pay-due');
    if (dd)
        dd.value = '';
    var dno = document.getElementById('debt-pay-note');
    if (dno)
        dno.value = '';
    togglePaymentSection('cash-change-wrap', currentPayment === 'cash');
    togglePaymentSection('mixed-payment-wrap', currentPayment === 'mixed');
    togglePaymentSection('debt-payment-wrap', currentPayment === 'debt');
    var pa = document.getElementById('pos-prod-area');
    if (pa) pa.style.display = '';
    renderSaleCart();
    renderPosProducts(_posBrowserState.cat || '');
    if (saleCart.length === 0)
        toast('Корзина очищена');
}

var _posSearchIdx = -1;

function onSaleSearchKey(e) {
    var box = document.getElementById('sale-results');
    var items = box ? box.querySelectorAll('.sale-result-item') : [];
    if (e.key === 'Escape') {
        document.getElementById('sale-search').value = '';
        box.classList.add('hidden');
        var pa = document.getElementById('pos-prod-area');
        if (pa) pa.style.display = '';
        renderPosProducts(_posBrowserState.cat || '');
        _posSearchIdx = -1;
        return;
    }
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!items.length) return;
        if (_posSearchIdx < items.length - 1) _posSearchIdx++;
        items.forEach(function(el, i) { el.classList.toggle('selected', i === _posSearchIdx); });
        if (items[_posSearchIdx]) items[_posSearchIdx].scrollIntoView({ block: 'nearest' });
        return;
    }
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (!items.length) return;
        if (_posSearchIdx > 0) _posSearchIdx--;
        items.forEach(function(el, i) { el.classList.toggle('selected', i === _posSearchIdx); });
        if (items[_posSearchIdx]) items[_posSearchIdx].scrollIntoView({ block: 'nearest' });
        return;
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        if (_posSearchIdx >= 0 && items[_posSearchIdx]) {
            items[_posSearchIdx].click();
            _posSearchIdx = -1;
            return;
        }
        const term = document.getElementById('sale-search').value;
        const exact = findProductByScan(term);
        if (exact) {
            addToCart(exact.id);
            focusSearch();
            return;
        }
        var catFilter = _posBrowserState.cat || '';
        var matches = smartMatchProducts(term);
        if (catFilter)
            matches = matches.filter(function (p) {
                return p.category === catFilter;
            });
        if (matches.length === 1) {
            addToCart(matches[0].id);
            focusSearch();
        } else if (matches.length > 1) {
            toast('Найдено несколько товаров — выберите', 'warn');
        } else if (term.trim()) {
            toast('Товар не найден', 'err');
        }
        return;
    }
}

function calcChange() {
    var totalEl = document.getElementById('sale-total');
    var given = parseFloat(document.getElementById('cash-given').value) || 0;
    var total = parseFloat(totalEl.dataset.value || totalEl.value || 0);
    var change = given - total;
    var changeEl = document.getElementById('cash-change');
    var changeDisplay = document.getElementById('sale-change-display');
    var btnComplete = document.getElementById('btn-complete-sale');
    if (given <= 0) {
        if (changeEl) {
            changeEl.value = '';
            changeEl.style.color = '#059669';
        }
        if (changeDisplay)
            changeDisplay.textContent = '0 \u20B8';
        if (btnComplete && saleCart.length > 0)
            btnComplete.disabled = false;
    } else if (change < 0) {
        if (changeEl) {
            changeEl.value = 'Не хватает ' + Math.abs(change).toLocaleString('ru-RU') + ' \u20B8';
            changeEl.style.color = '#dc2626';
        }
        if (changeDisplay) {
            changeDisplay.textContent = '-' + Math.abs(change).toLocaleString('ru-RU') + ' \u20B8';
            changeDisplay.className = 'pos-bottom-total-value pos-red';
        }
        if (btnComplete)
            btnComplete.disabled = true;
    } else {
        if (changeEl) {
            changeEl.value = change.toLocaleString('ru-RU') + ' \u20B8';
            changeEl.style.color = '#059669';
        }
        if (changeDisplay) {
            changeDisplay.textContent = change.toLocaleString('ru-RU') + ' \u20B8';
            changeDisplay.className = 'pos-bottom-total-value pos-green';
        }
        if (btnComplete && saleCart.length > 0)
            btnComplete.disabled = false;
    }
}

function calcMixedRemainder(changed) {
    var totalEl = document.getElementById('sale-total');
    var total = parseFloat(totalEl.dataset.value || totalEl.value || 0);
    var cashEl = document.getElementById('mixed-cash');
    var kaspiEl = document.getElementById('mixed-kaspi');
    var transEl = document.getElementById('mixed-transfer');
    var cash = parseFloat(cashEl.value) || 0;
    var kaspi = parseFloat(kaspiEl.value) || 0;
    var trans = parseFloat(transEl.value) || 0;
    if (changed === 'cash') {
        var rest = Math.max(0, total - cash);
        kaspi = Math.round(rest / 2);
        trans = rest - kaspi;
        kaspiEl.value = kaspi;
        transEl.value = trans;
    } else if (changed === 'kaspi') {
        trans = Math.max(0, total - cash - kaspi);
        transEl.value = trans;
    } else if (changed === 'transfer') {
        kaspi = Math.max(0, total - cash - trans);
        kaspiEl.value = kaspi;
    }
    var sum = cash + kaspi + trans;
    var rem = total - sum;
    var el = document.getElementById('mixed-remainder');
    if (!el)
        return;
    var cashGivenEl = document.getElementById('mixed-cash-given');
    var cashChangeEl = document.getElementById('mixed-cash-change');
    var cashGiven = parseFloat(cashGivenEl.value) || 0;
    if (cashGiven > 0) {
        var change = cashGiven - cash;
        if (change < 0) {
            cashChangeEl.value = 'Не хватает';
            cashChangeEl.style.color = 'var(--err)';
        } else {
            cashChangeEl.value = change.toLocaleString('ru-RU') + ' \u20B8';
            cashChangeEl.style.color = 'var(--ok)';
        }
    } else {
        cashChangeEl.value = '';
    }
    var btnComplete = document.getElementById('btn-complete-sale');
    var changeDisplay = document.getElementById('sale-change-display');
    if (Math.abs(rem) < 0.01) {
        el.innerHTML = '<span style="color:#059669;font-weight:600">\u2713 Сумма совпадает</span>';
        if (changeDisplay) {
            changeDisplay.textContent = '0 \u20B8';
            changeDisplay.className = 'pos-bottom-total-value pos-green';
        }
        if (btnComplete && saleCart.length > 0)
            btnComplete.disabled = false;
    } else if (rem > 0) {
        el.innerHTML = '<span style="color:#d97706">Осталось доплатить: ' + rem.toLocaleString('ru-RU') + ' \u20B8</span>';
        if (btnComplete)
            btnComplete.disabled = true;
    } else {
        el.innerHTML = '<span style="color:#dc2626">Превышение на: ' + Math.abs(rem).toLocaleString('ru-RU') + ' \u20B8</span>';
        if (changeDisplay) {
            changeDisplay.textContent = Math.abs(rem).toLocaleString('ru-RU') + ' \u20B8';
            changeDisplay.className = 'pos-bottom-total-value pos-green';
        }
        if (btnComplete)
            btnComplete.disabled = true;
    }
}

let updateSaleTotal = renderSaleCart;

function deferSale() {
    if (!saleCart.length) {
        toast('Корзина пуста', 'err');
        return;
    }
    var deferred = getDeferred();
    var products = getProducts();
    var name = currentCustomer ? currentCustomer.name : '';
    var phone = currentCustomer ? currentCustomer.phone || '' : '';
    var items = [];
    var total = 0;
    var totalQty = 0;
    saleCart.forEach(function (c) {
        var p = products.find(function (x) {
            return x.id === c.id;
        });
        if (p)
            p.quantity -= c.qty;
        var itemTotal = c.price * c.qty;
        total += itemTotal;
        totalQty += c.qty;
        items.push({
            productId: c.id,
            productCode: c.code || '',
            productName: c.name,
            quantity: c.qty,
            unitPrice: c.price,
            total: itemTotal
        });
    });
    var defId = uid();
    deferred.push({
        id: defId,
        items: items,
        customerName: name,
        customerPhone: phone,
        total: total,
        quantity: totalQty,
        cashierName: currentUser.name,
        status: 'pending',
        note: '',
        date: new Date().toISOString(),
        completedAt: null
    });
    setDeferred(deferred);
    var docs = getDocuments();
    docs.unshift({
        id: defId,
        type: 'deferred',
        docType: 'deferred',
        items: items.map(function (it) {
            return {
                productCode: it.productCode,
                productName: it.productName,
                quantity: it.quantity,
                unitPrice: it.unitPrice,
                total: it.total
            };
        }),
        clientName: name,
        customerName: name,
        total: total,
        status: 'pending',
        date: new Date().toISOString(),
        documentDate: new Date().toISOString(),
        meta: {}
    });
    setDocuments(docs);
    setProducts(products);
    toast('Продажа отложена на ' + fmt(total), 'ok');
    clearSaleSelection(true);
    renderDeferred();
}

function restoreDeferredSale(id) {
    if (!id)
        return;
    var deferred = getDeferred();
    var rec = deferred.find(function (d) {
        return d.id === id;
    });
    if (!rec) {
        toast('Запись не найдена', 'err');
        return;
    }
    var products = getProducts();
    rec.items.forEach(function (item) {
        var p = products.find(function (x) {
            return x.id === item.productId;
        });
        if (p)
            p.quantity += item.quantity;
        var existing = saleCart.find(function (c) {
            return c.id === item.productId && c.receiptId === 'deferred';
        });
        if (existing)
            existing.qty += item.quantity;
        else
            saleCart.push({
                id: item.productId,
                code: item.productCode,
                name: item.productName,
                qty: item.quantity,
                price: item.unitPrice,
                receiptId: 'deferred'
            });
    });
    setProducts(products);
    deferred = deferred.map(function (d) {
        if (d.id !== id)
            return d;
        return Object.assign({}, d, {
            status: 'in_cart',
            completedAt: new Date().toISOString()
        });
    });
    setDeferred(deferred);
    toast('Товары восстановлены в корзину', 'ok');
    document.querySelectorAll('.nav-btn').forEach(function (b) {
        b.classList.toggle('active', b.dataset.page === 'sales');
    });
    document.querySelectorAll('.page').forEach(function (p) {
        p.classList.toggle('active', p.id === 'page-sales');
    });
    fillSaleProducts();
    updateSaleTotal();
    renderSalesToday();
    renderPosSideHistory();
    updateSaleShiftBanner();
    focusSaleSearch();
    renderPosCatBrowser();
    renderDeferred();
}

function deleteDeferred(id) {
    if (!id)
        return;
    confirmAction('Удалить', 'Удалить отложенную продажу из списка?', function () {
        var deferred = getDeferred();
        var rec = deferred.find(function (d) {
            return d.id === id;
        });
        if (!rec)
            return;
        if (rec.status === 'pending' || rec.status === 'awaiting_payment') {
            var products = getProducts();
            rec.items.forEach(function (item) {
                var p = products.find(function (x) {
                    return x.id === item.productId;
                });
                if (p)
                    p.quantity += item.quantity;
            });
            setProducts(products);
        }
        if (rec.status === 'in_cart') {
            rec.items.forEach(function (item) {
                setSaleCart(saleCart.filter(function (c) {
                    return c.id !== item.productId || c.receiptId !== 'deferred';
                }));
            });
            updateSaleTotal();
        }
        if (window.ApDb && typeof window.ApDb.deleteDeferred === 'function') {
            window.ApDb.deleteDeferred(id);
        } else {
            setDeferred(deferred.filter(function (d) {
                return d.id !== id;
            }));
        }
        var docs = getDocuments();
        var docIdx = docs.findIndex(function (d) {
            return d.id === id;
        });
        if (docIdx >= 0) {
            if (rec.status === 'completed') {
                docs[docIdx] = Object.assign({}, docs[docIdx], { status: 'cancelled' });
            } else {
                docs.splice(docIdx, 1);
            }
            setDocuments(docs);
        }
        renderDeferred();
        renderDocuments();
    });
}

function payDeferred(id) {
    if (!id)
        return;
    var deferred = getDeferred();
    var rec = deferred.find(function (d) {
        return d.id === id;
    });
    if (!rec) {
        toast('Запись не найдена', 'err');
        return;
    }
    if (rec.status === 'completed') {
        toast('Уже оплачено', 'err');
        return;
    }
    showPaymentMethodModal(function (paymentMethod) {
        var shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
        if (!shift) {
            toast('Смена не открыта', 'err');
            goPage('myshift');
            return;
        }
        var sales = getSales();
        var products = getProducts();
        var receiptId = uid();
        var dateStr = new Date().toISOString();
        rec.items.forEach(function (item) {
            var p = products.find(function (x) {
                return x.id === item.productId;
            });
            sales.push({
                id: uid(),
                receiptId: receiptId,
                shiftId: shift.id,
                productId: item.productId,
                productCode: item.productCode || '',
                productName: item.productName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                purchasePrice: p ? Number(p.purchasePrice) || 0 : 0,
                total: item.total,
                payment: paymentMethod,
                cashAmount: paymentMethod === 'cash' ? item.total : 0,
                kaspiAmount: paymentMethod === 'kaspi' ? item.total : 0,
                transferAmount: paymentMethod === 'transfer' ? item.total : 0,
                customerId: null,
                userName: currentUser.name,
                username: currentUser.username,
                date: dateStr,
                status: 'completed',
                debtorName: rec.customerName || '',
                debtPhone: rec.customerPhone || '',
                debtReturnDate: ''
            });
        });
        setSales(sales);
        deferred = deferred.map(function (d) {
            if (d.id !== id)
                return d;
            return Object.assign({}, d, {
                status: 'completed',
                paymentMethod: paymentMethod,
                completedAt: dateStr
            });
        });
        setDeferred(deferred);
        var docs = getDocuments().map(function (d) {
            if (d.id !== id)
                return d;
            return Object.assign({}, d, {
                status: 'paid',
                paymentMethod: paymentMethod
            });
        });
        setDocuments(docs);
        toast('Оплачено: ' + fmt(rec.total) + ' (' + (paymentMethod === 'cash' ? 'наличные' : paymentMethod === 'kaspi' ? 'Kaspi QR' : 'банк') + ')', 'ok');
        renderDeferred();
        renderDocuments();
        renderDashboard();
        renderSalesToday();
        renderPosSideHistory();
    });
}

function cancelDeferredDoc(id) {
    if (!id)
        return;
    var deferred = getDeferred();
    var rec = deferred.find(function (d) {
        return d.id === id;
    });
    if (!rec) {
        toast('Запись не найдена', 'err');
        return;
    }
    if (rec.status === 'completed') {
        toast('Нельзя отменить оплаченный документ', 'err');
        return;
    }
    var msg = rec.status === 'in_cart' ? 'Товары уже в корзине. Перенести обратно в отложенные? Склад не изменится.' : 'Перенести товары обратно в отложенные? Склад не изменится.';
    confirmAction('Отменить документ', msg, function () {
        if (rec.status === 'in_cart') {
            rec.items.forEach(function (item) {
                setSaleCart(saleCart.filter(function (c) {
                    return c.id !== item.productId || c.receiptId !== 'deferred';
                }));
            });
            updateSaleTotal();
        }
        deferred = deferred.map(function (d) {
            if (d.id !== id)
                return d;
            return Object.assign({}, d, {
                status: 'pending',
                paymentMethod: null
            });
        });
        setDeferred(deferred);
        var docs = getDocuments().map(function (d) {
            if (d.id !== id)
                return d;
            return Object.assign({}, d, {
                status: 'cancelled',
                paymentMethod: null
            });
        });
        setDocuments(docs);
        toast('Документ отменён, товары возвращены в отложенные', 'ok');
        renderDeferred();
        renderDocuments();
    });
}

function renderDeferred() {
    var deferred = getDeferred();
    var search = (document.getElementById('deferred-search') || {}).value || '';
    var filter = (document.getElementById('deferred-filter') || {}).value || 'all';
    var searchLower = search.toLowerCase().trim();
    var filtered = deferred.filter(function (d) {
        if (filter !== 'all' && d.status !== filter)
            return false;
        if (searchLower) {
            var nameMatch = (d.customerName || '').toLowerCase().indexOf(searchLower) >= 0;
            var phoneMatch = (d.customerPhone || '').toLowerCase().indexOf(searchLower) >= 0;
            if (!nameMatch && !phoneMatch)
                return false;
        }
        return true;
    });
    var cols = [
        'Клиент',
        'Телефон',
        'Товары',
        'Сумма',
        'Кассир',
        'Дата',
        'Статус',
        'Оплата',
        ''
    ];
    var rows = filtered.map(function (d) {
        var statusBadge = d.status === 'pending' ? '<span class="badge badge-warn">В ожидании</span>' : d.status === 'awaiting_payment' ? '<span class="badge badge-info">Ожидает оплаты</span>' : d.status === 'completed' ? '<span class="badge badge-ok">Оплачен</span>' : d.status === 'in_cart' ? '<span class="badge badge-info">В корзине</span>' : '<span class="badge badge-danger">Отменён</span>';
        var paymentLabel = d.paymentMethod ? d.paymentMethod === 'cash' ? '\uD83D\uDCB5 Наличные' : d.paymentMethod === 'kaspi' ? '\uD83D\uDCF1 Kaspi QR' : d.paymentMethod === 'transfer' ? '\uD83C\uDFE6 Банк' : d.paymentMethod : '\u2014';
        var itemsHtml = (d.items || []).map(function (it) {
            return '<div style="font-size:12px;padding:2px 0">' + esc(it.productName) + ' \xD7 ' + it.quantity + ' = ' + fmt(it.total) + '</div>';
        }).join('');
        var actions = '<div class="actions" style="gap:4px">';
        if (d.status === 'pending' || d.status === 'awaiting_payment') {
            actions += '<button class="btn btn-success btn-sm" onclick="payDeferred(\'' + d.id + '\')" title="Оплатить">\uD83D\uDCB3 Оплатить</button>';
            actions += '<button class="btn btn-secondary btn-sm" onclick="cancelDeferredDoc(\'' + d.id + '\')" title="Отменить">\u2715 Отменить</button>';
        }
        if (d.status === 'pending') {
            actions += '<button class="btn btn-secondary btn-sm" onclick="restoreDeferredSale(\'' + d.id + '\')" title="Вернуть в корзину">\u21A9</button>';
        }
        if (d.status === 'completed' || d.status === 'cancelled' || d.status === 'in_cart') {
            actions += '<button class="btn btn-danger btn-sm" onclick="deleteDeferred(\'' + d.id + '\')" title="Удалить">\uD83D\uDDD1</button>';
        }
        actions += '</div>';
        return [
            d.customerName || '\u2014',
            d.customerPhone || '\u2014',
            itemsHtml + (d.note ? '<div style="font-size:11px;color:var(--muted);margin-top:4px">' + esc(d.note) + '</div>' : ''),
            fmt(d.total),
            d.cashierName || '\u2014',
            fmtDate(d.date),
            statusBadge,
            paymentLabel,
            actions
        ];
    });
    document.getElementById('deferred-table').innerHTML = rows.length ? tableHTML(cols, rows) : '<div class="empty">Нет отложенных товаров</div>';
}

function openDeferredModal() {
    if (!isAdmin()) {
        toast('Только администратор', 'err');
        return;
    }
    document.getElementById('def-product-search').value = '';
    document.getElementById('def-search-results').innerHTML = '';
    document.getElementById('def-product-id').value = '';
    document.getElementById('def-selected-name').textContent = '';
    document.getElementById('def-selected-qty').textContent = '';
    document.getElementById('def-qty').value = 1;
    document.getElementById('def-price').value = 0;
    document.getElementById('def-total').textContent = '0 \u20B8';
    document.getElementById('def-customer-name').value = '';
    openModal('modal-deferred');
}

function searchDeferredProduct() {
    var q = (document.getElementById('def-product-search').value || '').trim().toLowerCase();
    var results = document.getElementById('def-search-results');
    if (!q) {
        results.innerHTML = '';
        return;
    }
    var products = getProducts().filter(function (p) {
        return (p.name || '').toLowerCase().indexOf(q) >= 0 || (p.code || '').toLowerCase().indexOf(q) >= 0 || (p.barcode || '').indexOf(q) >= 0;
    }).slice(0, 10);
    if (!products.length) {
        results.innerHTML = '<div style="padding:8px;color:var(--text-muted)">Ничего не найдено</div>';
        return;
    }
    results.innerHTML = products.map(function (p) {
        return '<div class="sale-result-item" onclick="selectDeferredProduct(\'' + p.id + '\')">' + '<strong>' + esc(p.name) + '</strong>' + (p.code ? ' <span class="code-tag">' + esc(p.code) + '</span>' : '') + ' <span style="color:var(--text-muted)">Остаток: ' + p.quantity + '</span></div>';
    }).join('');
}

function selectDeferredProduct(id) {
    var p = getProducts().find(function (x) {
        return x.id === id;
    });
    if (!p)
        return;
    document.getElementById('def-product-id').value = id;
    document.getElementById('def-selected-name').textContent = p.name;
    document.getElementById('def-selected-qty').textContent = 'Остаток: ' + p.quantity;
    document.getElementById('def-price').value = p.price || 0;
    document.getElementById('def-search-results').innerHTML = '';
    document.getElementById('def-product-search').value = p.name;
    calcDeferredTotal();
}

function calcDeferredTotal() {
    var qty = parseFloat(document.getElementById('def-qty').value) || 0;
    var price = parseFloat(document.getElementById('def-price').value) || 0;
    document.getElementById('def-total').textContent = fmt(qty * price);
}

function saveDeferred() {
    var productId = document.getElementById('def-product-id').value;
    var qty = parseFloat(document.getElementById('def-qty').value) || 0;
    var price = parseFloat(document.getElementById('def-price').value) || 0;
    var customerName = document.getElementById('def-customer-name').value.trim();
    var note = document.getElementById('def-note').value.trim();
    if (!productId) {
        toast('Выберите товар', 'err');
        return;
    }
    if (qty <= 0) {
        toast('Укажите количество', 'err');
        return;
    }
    var p = getProducts().find(function (x) {
        return x.id === productId;
    });
    if (!p) {
        toast('Товар не найден', 'err');
        return;
    }
    if (qty > p.quantity) {
        toast('Недостаточно товара (остаток: ' + p.quantity + ')', 'err');
        return;
    }
    var deferred = getDeferred();
    var defId = uid();
    p.quantity -= qty;
    var itemTotal = qty * price;
    deferred.push({
        id: defId,
        items: [{
                productId: p.id,
                productCode: p.code || '',
                productName: p.name,
                quantity: qty,
                unitPrice: price,
                total: itemTotal
            }],
        customerName: customerName,
        customerPhone: '',
        total: itemTotal,
        quantity: qty,
        cashierName: currentUser.name,
        status: 'pending',
        note: note,
        date: new Date().toISOString(),
        completedAt: null
    });
    setDeferred(deferred);
    var docs = getDocuments();
    docs.unshift({
        id: defId,
        type: 'deferred',
        docType: 'deferred',
        items: [{
                productCode: p.code || '',
                productName: p.name,
                quantity: qty,
                unitPrice: price,
                total: itemTotal
            }],
        customerName: customerName,
        clientName: customerName,
        total: itemTotal,
        status: 'pending',
        date: new Date().toISOString(),
        documentDate: new Date().toISOString(),
        meta: {}
    });
    setDocuments(docs);
    setProducts(getProducts());
    toast('Товар отложен', 'ok');
    closeModal('modal-deferred');
    renderDeferred();
}

function exportDeferredExcel() {
    exportSectionToExcel('deferred', getDeferred(), 'SANAQ_Отложенные_' + todayStr() + '.xlsx');
}

function completeSale() {
    if (!checkPermission('createSale')) {
        toast('Нет прав на создание продажи', 'err');
        return;
    }
    if (!saleCart.length) {
        toast('Корзина пуста', 'err');
        return;
    }
    const shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    if (!shift) {
        toast('Смена (касса) не открыта. Сначала откройте смену.', 'err');
        goPage('myshift');
        return;
    }
    let shiftId = shift.id;
    const products = getProducts();
    const sales = getSales();
    const dateStr = new Date().toISOString();
    for (let i = 0; i < saleCart.length; i++) {
        const c = saleCart[i];
        if (c.isUniversal)
            continue;
        const p = products.find(function (x) {
            return x.id === c.id;
        });
        if (!p || p.quantity < c.qty) {
            toast('Товар \xAB' + c.name + '\xBB недостаточно на складе', 'err');
            return;
        }
    }
    const stEl = document.getElementById('sale-total');
    var finalTotal = stEl ? parseFloat(stEl.dataset.value || stEl.value || 0) : 0;
    if (currentPayment === 'cash') {
        const given = parseFloat(document.getElementById('cash-given').value) || 0;
        if (given > 0 && given < finalTotal - 0.01) {
            toast('Сумма от клиента меньше суммы чека', 'err');
            return;
        }
    }
    let debtName = '', debtPhone = '', debtDue = '', debtNote = '';
    if (currentPayment === 'debt') {
        debtName = document.getElementById('debt-pay-name').value.trim();
        debtPhone = document.getElementById('debt-pay-phone').value.trim();
        debtDue = document.getElementById('debt-pay-due').value;
        var debtNoteEl = document.getElementById('debt-pay-note');
        debtNote = debtNoteEl ? debtNoteEl.value.trim() : '';
        if (!debtName) {
            toast('Введите имя должника', 'err');
            return;
        }
        if (!debtPhone) {
            toast('Введите телефон должника', 'err');
            return;
        }
        if (!debtDue) {
            toast('Выберите дату возврата долга', 'err');
            return;
        }
    }
    let mCash = 0, mKaspi = 0, mTransfer = 0;
    if (currentPayment === 'mixed') {
        mCash = parseFloat(document.getElementById('mixed-cash').value) || 0;
        mKaspi = parseFloat(document.getElementById('mixed-kaspi').value) || 0;
        mTransfer = parseFloat(document.getElementById('mixed-transfer').value) || 0;
        if (Math.abs(mCash + mKaspi + mTransfer - finalTotal) > 0.01) {
            toast('Сумма смешанной оплаты не совпадает с итогом чека', 'err');
            return;
        }
        const mixedGiven = parseFloat(document.getElementById('mixed-cash-given').value) || 0;
        if (mixedGiven > 0 && mixedGiven < mCash - 0.01) {
            toast('Получено наличных меньше доли наличных в смешанной оплате', 'err');
            return;
        }
    }
    var originalTotal = saleCart.reduce(function (sum, c) {
        return sum + c.price * c.qty;
    }, 0);
    let subTotal = saleCart.reduce(function (sum, c) {
        var promo = getProductDiscount(c.id);
        var promoDisc = promo ? (promo.discountType === 'percent' ? c.price * promo.discountValue / 100 : promo.discountValue) : 0;
        var manualDisc = c.discount || 0;
        var effectivePrice = c.price - promoDisc - manualDisc;
        if (effectivePrice < 0) effectivePrice = 0;
        return sum + effectivePrice * c.qty;
    }, 0);
    let subAfterDiscount = subTotal;
    if (subAfterDiscount < 0) subAfterDiscount = 0;
    var totalDiscount = Math.round((originalTotal - subTotal) * 100) / 100;
    let bonusSpend = parseInt(document.getElementById('sale-bonus-spend').value) || 0;
    let earnedBonus = 0;
    if (currentCustomer) {
        const tier = getCustomerTier(currentCustomer.spent || 0);
        let maxBonus = Math.min(Number(currentCustomer.bonusBalance) || 0, subAfterDiscount * tier.maxSpend);
        maxBonus = Math.floor(maxBonus);
        if (bonusSpend > maxBonus)
            bonusSpend = maxBonus;
        if (bonusSpend < 0)
            bonusSpend = 0;
        earnedBonus = Math.round(subAfterDiscount * tier.bonusEarn);
        const customers = getCustomers();
        const cidx = customers.findIndex(function (c) {
            return c.id === currentCustomer.id;
        });
        if (cidx >= 0) {
            customers[cidx].spent = (Number(customers[cidx].spent) || 0) + subAfterDiscount;
            customers[cidx].bonusBalance = Math.max(0, Math.round((Number(customers[cidx].bonusBalance) || 0) - bonusSpend + earnedBonus));
            setCustomers(customers);
        }
    }
    finalTotal = subAfterDiscount - bonusSpend;
    if (finalTotal < 0)
        finalTotal = 0;
    const receiptId = uid();
    var accumulatedTotal = 0;
    var saleCount = saleCart.length;
    saleCart.forEach(function (c, idx) {
        const p = products.find(function (x) {
            return x.id === c.id;
        });
        if (p)
            p.quantity -= c.qty;
        var _promo = getProductDiscount(c.id);
        var _promoDisc = _promo ? (_promo.discountType === 'percent' ? c.price * _promo.discountValue / 100 : _promo.discountValue) : 0;
        var _manualDisc = c.discount || 0;
        var effectivePrice = c.price - _promoDisc - _manualDisc;
        if (effectivePrice < 0) effectivePrice = 0;
        var itemBase = effectivePrice * c.qty;
        var ratio = subTotal > 0 ? itemBase / subTotal : 0;
        var itemFinalTotal;
        if (idx === saleCount - 1) {
            itemFinalTotal = Math.round((finalTotal - accumulatedTotal) * 100) / 100;
        } else {
            itemFinalTotal = Math.round(finalTotal * ratio * 100) / 100;
            accumulatedTotal += itemFinalTotal;
        }
        sales.push({
            id: uid(),
            receiptId: receiptId,
            shiftId: shiftId,
            productId: c.id,
            productCode: c.code || '',
            productName: c.name,
            quantity: c.qty,
            unitPrice: c.price,
            purchasePrice: p ? Number(p.purchasePrice) || 0 : 0,
            total: itemFinalTotal,
            payment: currentPayment,
            cashAmount: currentPayment === 'cash' ? finalTotal : currentPayment === 'mixed' ? mCash : 0,
            kaspiAmount: currentPayment === 'kaspi' ? finalTotal : currentPayment === 'mixed' ? mKaspi : 0,
            transferAmount: currentPayment === 'transfer' ? finalTotal : currentPayment === 'mixed' ? mTransfer : 0,
            customerId: currentCustomer ? currentCustomer.id : null,
            userName: currentUser.name,
            username: currentUser.username,
            date: dateStr,
            status: 'completed',
            debtorName: currentPayment === 'debt' ? debtName : '',
            debtPhone: currentPayment === 'debt' ? debtPhone : '',
            debtReturnDate: currentPayment === 'debt' ? debtDue : ''
        });
    });
    setProducts(products);
    addAuditLog('Продажа завершена', 'Чек #' + receiptId.slice(-6) + ' на сумму ' + fmt(finalTotal) + ' \u20B8', '\uD83D\uDED2');
    setSales(sales);
    if (currentPayment === 'debt') {
        var debtors = getDebtors();
        var debtor = debtors.find(function (d) {
            return d.name.toLowerCase() === debtName.toLowerCase() && d.phone === debtPhone;
        });
        if (!debtor) {
            debtor = {
                id: uid(),
                name: debtName,
                phone: debtPhone,
                rating: 'good'
            };
            debtors.push(debtor);
            setDebtors(debtors);
        }
        var debts = getDebts();
        debts.push({
            id: uid(),
            debtorId: debtor.id,
            debtorName: debtName,
            productCode: saleCart.map(function (c) {
                return c.code || '';
            }).join(', '),
            productName: saleCart.map(function (c) {
                return c.name;
            }).join(', '),
            quantity: saleCart.reduce(function (s, c) {
                return s + c.qty;
            }, 0),
            amount: finalTotal,
            cashierName: currentUser.name,
            dueDate: debtDue || null,
            status: 'open',
            note: debtNote || 'Чек \u2116' + receiptId.slice(-6),
            date: dateStr
        });
        setDebts(debts);
        toast('Долг записан: ' + debtName + ' \u2014 ' + fmt(finalTotal), 'ok');
    }
    toast('Продажа оформлена: ' + fmt(finalTotal) + (earnedBonus ? ' (+бонусы)' : ''), 'ok');
    clearSaleSelection(true);
    focusSearch();
    renderSalesToday();
    renderPosSideHistory();
    renderDashboard();
    if (currentPayment === 'debt')
        renderDebts();
}

function cancelSaleConfirm(saleId) {
    const sale = getSales().find(function (s) {
        return s.id === saleId;
    });
    if (!sale || !isSaleActive(sale)) {
        toast('Продажа уже отменена', 'err');
        return;
    }
    confirmAction('Отменить продажу?', 'Товар \xAB' + sale.productName + '\xBB (' + sale.quantity + ' шт.) вернётся на склад. Сумма ' + fmt(sale.total) + ' не будет учтена в выручке.', function () {
        cancelSale(saleId);
    });
}

function selectReturnReceipt(receiptId) {
    closeModal('modal-return-selector');
    openReturnModalFromReceipt(receiptId);
}

function openReturnModalFromReceipt(receiptId) {
    if (!isAdmin()) {
        toast('Только для администратора', 'err');
        return;
    }
    receiptId = receiptId || window._currentReceiptId;
    if (!receiptId) {
        toast('Чек не найден', 'err');
        return;
    }
    var all = getSales().filter(isSaleActive);
    var receipts = groupSalesIntoReceipts(all);
    var r = receipts.find(function (x) {
        return x.id === receiptId;
    });
    if (!r) {
        toast('Чек не найден', 'err');
        return;
    }
    document.getElementById('return-sale-id').value = receiptId;
    document.getElementById('return-customer-id').value = r.customerId || '';
    var meta = 'Чек \u2116 ' + receiptId.slice(-6) + ' от ' + fmtDate(r.date) + ' | Кассир: ' + (r.userName || '\u2014');
    document.getElementById('return-receipt-meta').textContent = meta;
    var body = document.getElementById('return-items-body');
    body.innerHTML = '';
    var totalRefund = 0;
    r.items.forEach(function (it) {
        var qty = Number(it.quantity) || 0;
        var price = Number(it.unitPrice) || 0;
        var refundMax = price * qty;
        totalRefund += refundMax;
        var tr = document.createElement('tr');
        tr.innerHTML = '<td>' + esc(it.productName) + '</td>' + '<td style="text-align:center">' + qty + '</td>' + '<td style="text-align:center"><input type="number" class="form-input" style="width:70px;padding:4px;text-align:center" min="0" max="' + qty + '" value="' + qty + '" data-price="' + price + '" data-max="' + refundMax + '" oninput="calcReturnTotal()"></td>' + '<td style="text-align:right;font-weight:600;color:var(--err)">' + fmt(refundMax) + '</td>';
        body.appendChild(tr);
    });
    document.getElementById('return-total-refund').textContent = fmt(totalRefund);
    openModal('modal-return');
}

function exportSalesExcel() {
    exportSectionToExcel('sales', getSales().filter(isSaleActive), 'SANAQ_Продажи_' + todayStr() + '.xlsx');
}

function exportSalesDetailedExcel() {
    var receipts = groupSalesIntoReceipts(getSales().filter(isSaleActive));
    var rows = [];
    receipts.forEach(function (r) {
        var pay = PAY_LABELS[r.payment] || r.payment || '';
        if (r.payment === 'mixed') {
            var parts = [];
            if (Number(r.cashAmount) > 0)
                parts.push('наличные: ' + Number(r.cashAmount));
            if (Number(r.kaspiAmount) > 0)
                parts.push('Kaspi QR: ' + Number(r.kaspiAmount));
            if (Number(r.transferAmount) > 0)
                parts.push('Банк: ' + Number(r.transferAmount));
            if (parts.length)
                pay = parts.join('; ');
        }
        r.items.forEach(function (s, idx) {
            rows.push([
                r.id,
                r.id.slice(-6),
                idx + 1,
                s.productCode || '',
                s.productName || '',
                Number(s.quantity) || 0,
                Number(s.unitPrice) || 0,
                Number(s.total) || 0,
                Number(r.total) || 0,
                pay,
                r.userName || '',
                fmtDate(r.date),
                r.debtorName || '',
                r.debtPhone || '',
                r.debtReturnDate ? fmtDate(r.debtReturnDate) : ''
            ]);
        });
    });
    var headers = [
        'ID чека',
        'Номер чека',
        '\u2116 строки',
        'Код товара',
        'Товар',
        'Кол-во',
        'Цена',
        'Сумма строки',
        'Итого по чеку',
        'Оплата',
        'Кассир',
        'Дата и время',
        'Должник',
        'Телефон должника',
        'Дата возврата долга'
    ];
    var widths = [
        24,
        12,
        10,
        14,
        42,
        10,
        14,
        16,
        16,
        24,
        20,
        20,
        22,
        20,
        18
    ];
    createExcelWorkbook(headers, rows, widths, 'Продажи').then(function (buf) {
        saveExcelBuffer(buf, 'SANAQ_Продажи_детально_' + todayStr() + '.xlsx');
        toast('Excel файл скачан', 'ok');
    }).catch(function (e) {
        toast('Ошибка: ' + (e.message || e), 'err');
    });
}

async function submitWriteOff() {
    if (!checkPermission('writeOffStock')) {
        toast('Нет прав на списание товара', 'err');
        return;
    }
    var productId = document.getElementById('wo-product-id').value;
    var qty = parseFloat(document.getElementById('wo-qty').value);
    var reason = document.getElementById('wo-reason').value;
    var note = document.getElementById('wo-note').value.trim();
    if (!productId) {
        toast('Выберите товар', 'err');
        return;
    }
    if (!qty || qty <= 0) {
        toast('Укажите количество', 'err');
        return;
    }
    if (!reason) {
        toast('Укажите причину', 'err');
        return;
    }
    var p = getProducts().find(function (x) {
        return x.id === productId;
    });
    if (!p) {
        toast('Товар не найден', 'err');
        return;
    }
    if (qty > p.quantity) {
        toast('Количество превышает остаток (' + p.quantity + ')', 'err');
        return;
    }
    confirmAction('Списание', 'Списать ' + qty + ' шт. товара \xAB' + p.name + '\xBB? (' + reason + ')', async function () {
        try {
            await window.ApDb.createWriteOff({
                productId: p.id,
                productCode: p.code || '',
                productName: p.name,
                quantity: qty,
                reason: reason,
                note: note,
                userName: currentUser.name
            });
            toast('Списание оформлено', 'ok');
            document.getElementById('wo-product-id').value = '';
            document.getElementById('wo-selected-product').classList.add('hidden');
            document.getElementById('wo-qty').value = '';
            document.getElementById('wo-note').value = '';
            renderWriteOffsTable();
        } catch (err) {
            toast(err.message || String(err), 'err');
        }
    });
}

function startAuditSession() {
    if (!checkPermission('inventory')) {
        toast('Нет прав на инвентаризацию', 'err');
        return;
    }
    var products = getProducts();
    if (!products.length) {
        toast('Нет товаров для ревизии', 'err');
        return;
    }
    setAuditSession({
        active: true,
        items: products.map(function (p) {
            return {
                productId: p.id,
                code: p.code || '',
                name: p.name,
                qtySystem: Number(p.quantity) || 0,
                qtyFact: Number(p.quantity) || 0
            };
        })
    });
    document.getElementById('audit-session-ctrl').classList.add('hidden');
    document.getElementById('audit-session-panel').classList.remove('hidden');
    renderAuditSessionTable();
}

function cancelAuditSession() {
    confirmAction('Отмена ревизии', 'Отменить текущую ревизию? Все введённые данные будут потеряны.', function () {
        setAuditSession(null);
        document.getElementById('audit-session-ctrl').classList.remove('hidden');
        document.getElementById('audit-session-panel').classList.add('hidden');
    });
}

function renderAuditSessionTable() {
    if (!_auditSession || !_auditSession.active)
        return;
    var body = document.getElementById('audit-session-body');
    if (!body)
        return;
    var filter = (document.getElementById('audit-search').value || '').trim().toLowerCase();
    var items = _auditSession.items.filter(function (it) {
        if (!filter)
            return true;
        return it.name.toLowerCase().indexOf(filter) >= 0 || it.code.toLowerCase().indexOf(filter) >= 0;
    });
    body.innerHTML = items.map(function (it, idx) {
        var realIdx = _auditSession.items.indexOf(it);
        var diff = it.qtyFact - it.qtySystem;
        var diffColor = diff === 0 ? 'var(--muted)' : diff > 0 ? 'var(--ok)' : 'var(--err)';
        var diffText = diff > 0 ? '+' + diff : diff;
        return '<tr>' + '<td><span class="code-tag">' + it.code + '</span></td>' + '<td>' + it.name + '</td>' + '<td style="text-align:center">' + it.qtySystem + '</td>' + '<td style="text-align:center"><input type="number" min="0" step="any" value="' + it.qtyFact + '" ' + 'style="width:80px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);text-align:center" ' + 'onchange="updateAuditQty(' + realIdx + ', this.value)"></td>' + '<td style="text-align:center;color:' + diffColor + ';font-weight:600">' + diffText + '</td>' + '</tr>';
    }).join('');
}

function completeAuditSession() {
    if (!_auditSession || !_auditSession.active)
        return;
    var diffs = _auditSession.items.filter(function (it) {
        return it.qtyFact !== it.qtySystem;
    });
    var msg = diffs.length ? 'Обнаружены расхождения по ' + diffs.length + ' позициям. Завершить ревизию и обновить остатки?' : 'Расхождений не обнаружено. Завершить ревизию?';
    confirmAction('Завершить ревизию', msg, async function () {
        try {
            var payload = {
                userName: currentUser.name,
                items: _auditSession.items.map(function (it) {
                    return {
                        productId: it.productId,
                        code: it.code,
                        name: it.name,
                        qtySystem: it.qtySystem,
                        qtyFact: it.qtyFact,
                        diff: it.qtyFact - it.qtySystem
                    };
                })
            };
            await window.ApDb.createAudit(payload);
            toast('Ревизия завершена. Остатки обновлены.', 'ok');
            setAuditSession(null);
            document.getElementById('audit-session-ctrl').classList.remove('hidden');
            document.getElementById('audit-session-panel').classList.add('hidden');
            renderAuditsArchive();
        } catch (err) {
            toast(err.message || String(err), 'err');
        }
    });
}

function printReceipt() {
    var el = document.getElementById('receipt-print-area');
    if (!el)
        return;
    var printWin = window.open('', '', 'height=600,width=400');
    if (!printWin) {
        toast('Разрешите всплывающее окно для печати чека', 'err');
        return;
    }
    printWin.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Чек</title><style>');
    printWin.document.write('@page{size:80mm auto;margin:4mm}body{font-family:"Courier New",Courier,monospace;font-size:12px;line-height:1.25;color:#000;background:#fff;margin:0;padding:0;width:72mm}.receipt-row{display:flex;justify-content:space-between;gap:8px}.receipt-center{text-align:center}.receipt-bold{font-weight:700}.receipt-sep{border-top:1px dashed #000;margin:6px 0}.receipt-item{margin:5px 0}.receipt-name{word-break:break-word}.receipt-total{font-size:15px;font-weight:700}');
    printWin.document.write('@media print{button{display:none!important}}');
    printWin.document.write('</style></head><body>');
    printWin.document.write(el.innerHTML);
    printWin.document.write('<script>window.onload=function(){window.focus();window.print();};</script></body></html>');
    printWin.document.close();
}

function openReceipt(receiptId) {
    const all = getSales().filter(isSaleActive);
    const receipts = groupSalesIntoReceipts(all);
    const r = receipts.find(function (x) {
        return x.id === receiptId;
    });
    if (!r) {
        toast('Чек не найден', 'err');
        return;
    }
    window._currentReceiptId = receiptId;
    document.getElementById('receipt-title').textContent = 'Чек \u2116 ' + receiptId.slice(-6);
    var store = window.ApAuth && window.ApAuth.getCurrentStore();
    var storeName = store ? store.storeName : 'SANAQ';
    var bin = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_bin')) || localStorage.getItem('ap_store_bin') || '';
    var dateStr = r.date ? new Date(r.date).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : '\u2014';
    var payDetail = PAY_LABELS[r.payment] || r.payment || '\u2014';
    if (r.payment === 'mixed') {
        var pts = [];
        if (Number(r.cashAmount) > 0)
            pts.push('нал:' + fmtShort(r.cashAmount));
        if (Number(r.kaspiAmount) > 0)
            pts.push('kaspiqr:' + fmtShort(r.kaspiAmount));
        if (Number(r.transferAmount) > 0)
            pts.push('банк:' + fmtShort(r.transferAmount));
        if (pts.length)
            payDetail = pts.join(' ');
    }
    var h = escapeHtml;
    var custName = '';
    if (r.customerId) {
        var cust = getCustomers().find(function (c) {
            return c.id === r.customerId;
        });
        if (cust)
            custName = cust.name || '';
    }
    var header = '<div class="receipt-center receipt-bold">' + h(storeName) + '</div>' + (bin ? '<div class="receipt-center">БИН/ИИН ' + h(bin) + '</div>' : '') + '<div class="receipt-center">КАССОВЫЙ ЧЕК</div>' + '<div class="receipt-row"><span>Чек \u2116</span><span>' + receiptId.slice(-6) + '</span></div>' + '<div class="receipt-row"><span>Дата</span><span>' + dateStr + '</span></div>' + '<div class="receipt-row"><span>Кассир</span><span>' + h(r.userName || '\u2014') + '</span></div>' + (custName ? '<div class="receipt-row"><span>Клиент</span><span>' + h(custName) + '</span></div>' : '') + '<div class="receipt-sep"></div>';
    var itemsHtml = '';
    r.items.forEach(function (it) {
        var name = it.productName || '\u2014';
        var qty = Number(it.quantity) || 0;
        var price = Number(it.unitPrice) || 0;
        var total = Number(it.total) || 0;
        itemsHtml += '<div class="receipt-item">' + '<div class="receipt-name">' + h(name) + '</div>' + '<div class="receipt-row"><span>' + qty + ' x ' + fmtShort(price) + '</span><span>' + fmtShort(total) + '</span></div>' + (it.productCode ? '<div style="font-size:11px">Код: ' + h(it.productCode) + '</div>' : '') + '</div>';
    });
    itemsHtml += '<div class="receipt-sep"></div>';
    var totalsHtml = '';
    var netTotal = r.total - (Number(r.discountAmount) || 0) - (Number(r.bonusSpend) || 0);
    totalsHtml += '<div class="receipt-row receipt-total"><span>ИТОГО</span><span>' + fmtShort(netTotal) + '</span></div>';
    if (Number(r.discountAmount) > 0)
        totalsHtml += '<div class="receipt-row"><span>Скидка</span><span>-' + fmtShort(r.discountAmount) + '</span></div>';
    if (Number(r.bonusSpend) > 0)
        totalsHtml += '<div class="receipt-row"><span>Оплата бонусами</span><span>-' + fmtShort(r.bonusSpend) + '</span></div>';
    totalsHtml += '<div class="receipt-sep"></div>';
    if (r.payment === 'cash')
        totalsHtml += '<div class="receipt-row"><span>Наличные</span><span>' + fmtShort(netTotal) + '</span></div>';
    else if (r.payment === 'kaspi')
        totalsHtml += '<div class="receipt-row"><span>Kaspi QR</span><span>' + fmtShort(netTotal) + '</span></div>';
    else if (r.payment === 'transfer')
        totalsHtml += '<div class="receipt-row"><span>Банк</span><span>' + fmtShort(netTotal) + '</span></div>';
    else if (r.payment === 'mixed') {
        if (Number(r.cashAmount) > 0)
            totalsHtml += '<div class="receipt-row"><span>Наличные</span><span>' + fmtShort(r.cashAmount) + '</span></div>';
        if (Number(r.kaspiAmount) > 0)
            totalsHtml += '<div class="receipt-row"><span>Kaspi QR</span><span>' + fmtShort(r.kaspiAmount) + '</span></div>';
        if (Number(r.transferAmount) > 0)
            totalsHtml += '<div class="receipt-row"><span>Банк</span><span>' + fmtShort(r.transferAmount) + '</span></div>';
    } else if (r.payment === 'debt')
        totalsHtml += '<div class="receipt-row"><span>В долг</span><span>' + fmtShort(netTotal) + '</span></div>';
    if (Number(r.earnedBonus) > 0)
        totalsHtml += '<div class="receipt-row"><span>Бонусы начислено</span><span>+' + fmtShort(r.earnedBonus) + '</span></div>';
    totalsHtml += '<div class="receipt-sep"></div>';
    var footer = '<div class="receipt-center receipt-bold">СПАСИБО ЗА ПОКУПКУ!</div>';
    document.getElementById('receipt-header').innerHTML = header;
    document.getElementById('receipt-items').innerHTML = itemsHtml;
    document.getElementById('receipt-totals').innerHTML = totalsHtml;
    document.getElementById('receipt-footer').innerHTML = footer;
    var returnBtn = document.getElementById('btn-receipt-return');
    if (returnBtn) {
        var returnable = r.items.some(function (it) {
            return Number(it.quantity) > 0;
        });
        returnBtn.style.display = returnable ? 'inline-flex' : 'none';
    }
    openModal('modal-receipt');
}

function migrateDeferredData() {
    var migrationKey = 'ap_deferred_migration_v1';
    if (localStorage.getItem(migrationKey))
        return;
    try {
        var deferred = getDeferred();
        var changed = false;
        var migrated = deferred.map(function (d) {
            if (d.items)
                return d;
            changed = true;
            return {
                id: d.id,
                items: [{
                        productId: d.productId,
                        productCode: d.productCode || '',
                        productName: d.productName || '',
                        quantity: d.quantity || 0,
                        unitPrice: d.unitPrice || 0,
                        total: d.total || (d.unitPrice || 0) * (d.quantity || 0)
                    }],
                customerName: d.customerName || '',
                customerPhone: d.customerPhone || '',
                total: d.total || (d.unitPrice || 0) * (d.quantity || 0),
                quantity: d.quantity || 0,
                cashierName: d.cashierName || '',
                status: d.status || 'pending',
                note: d.note || '',
                date: d.date || new Date().toISOString(),
                completedAt: d.completedAt || null
            };
        });
        if (changed) {
            setDeferred(migrated);
        }
        localStorage.setItem(migrationKey, '1');
    } catch (e) {
        console.warn('[Deferred migration] Error:', e);
    }
}

function getAuditLog() {
    var v = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('audit_log') : null;
    if (v !== null && v !== undefined)
        return Array.isArray(v) ? v : [];
    try {
        return JSON.parse(localStorage.getItem('sanaq_audit_log') || '[]');
    } catch (e) {
        return [];
    }
}

function setAuditLog(arr) {
    try {
        localStorage.setItem('sanaq_audit_log', JSON.stringify(arr));
    } catch (e) {
    }
    if (window.ApDb && window.ApDb.setAppData)
        window.ApDb.setAppData('audit_log', arr);
}

function addAuditLog(action, detail, icon) {
    var log = getAuditLog();
    log.unshift({
        id: uid(),
        action: action,
        detail: detail,
        icon: icon || '\uD83D\uDCDD',
        user: currentUser ? currentUser.name : '\u2014',
        userId: currentUser ? currentUser.id : null,
        time: new Date().toISOString()
    });
    if (log.length > 500)
        log = log.slice(0, 500);
    setAuditLog(log);
}

function openAuditLog() {
    var container = document.getElementById('audit-log-body');
    var log = getAuditLog();
    if (!log.length) {
        container.innerHTML = '<div class="empty">Журнал действий пуст</div>';
    } else {
        container.innerHTML = log.map(function (entry) {
            return '<div class="audit-item"><div class="audit-item-icon">' + (entry.icon || '\uD83D\uDCDD') + '</div><div class="audit-item-content"><div class="audit-item-action">' + esc(entry.action) + '</div><div class="audit-item-detail">' + esc(entry.detail || '') + ' \u2014 ' + esc(entry.user || '') + '</div><div class="audit-item-time">' + fmtDate(entry.time) + '</div></div></div>';
        }).join('');
    }
    openModal('modal-audit-log');
}



set('isSaleActive', isSaleActive);
set('togglePaymentSection', togglePaymentSection);
set('calcMixedRemainder', calcMixedRemainder);
set('addAuditLog', addAuditLog);
set('renderAuditSessionTable', renderAuditSessionTable);

var _ex={};
try{_ex['PAY_LABELS']=PAY_LABELS}catch(e){}
try{_ex['currentPayment']=currentPayment}catch(e){}
try{_ex['setCurrentPayment']=setCurrentPayment}catch(e){}
try{_ex['getSales']=getSales}catch(e){}
try{_ex['setSales']=setSales}catch(e){}
try{_ex['migrateSalesRecords']=migrateSalesRecords}catch(e){}
try{_ex['focusSaleSearch']=focusSaleSearch}catch(e){}
try{_ex['isSaleActive']=isSaleActive}catch(e){}
try{_ex['saleStatusBadge']=saleStatusBadge}catch(e){}
try{_ex['adminCancelSaleBtn']=adminCancelSaleBtn}catch(e){}
try{_ex['togglePaymentSection']=togglePaymentSection}catch(e){}
try{_ex['renderSalesToday']=renderSalesToday}catch(e){}
try{_ex['buildSalePKOHTML']=buildSalePKOHTML}catch(e){}
try{_ex['cancelSale']=cancelSale}catch(e){}
try{_ex['renderSalesHeatmap']=renderSalesHeatmap}catch(e){}
try{_ex['renderMostExpensiveReceipt']=renderMostExpensiveReceipt}catch(e){}
try{_ex['updateSaleShiftBanner']=updateSaleShiftBanner}catch(e){}
try{_ex['badgePay']=badgePay}catch(e){}
try{_ex['groupSalesIntoReceipts']=groupSalesIntoReceipts}catch(e){}
try{_ex['completeDebtPayment']=completeDebtPayment}catch(e){}
try{_ex['getWriteOffs']=getWriteOffs}catch(e){}
try{_ex['getAudits']=getAudits}catch(e){}
try{_ex['getDeferred']=getDeferred}catch(e){}
try{_ex['setDeferred']=setDeferred}catch(e){}
try{_ex['onSaleSearch']=onSaleSearch}catch(e){}
try{_ex['renderPosProducts']=renderPosProducts}catch(e){}
try{_ex['clearSaleSelection']=clearSaleSelection}catch(e){}
try{_ex['onSaleSearchKey']=onSaleSearchKey}catch(e){}
try{_ex['calcChange']=calcChange}catch(e){}
try{_ex['calcMixedRemainder']=calcMixedRemainder}catch(e){}
try{_ex['updateSaleTotal']=updateSaleTotal}catch(e){}
try{_ex['deferSale']=deferSale}catch(e){}
try{_ex['restoreDeferredSale']=restoreDeferredSale}catch(e){}
try{_ex['deleteDeferred']=deleteDeferred}catch(e){}
try{_ex['payDeferred']=payDeferred}catch(e){}
try{_ex['cancelDeferredDoc']=cancelDeferredDoc}catch(e){}
try{_ex['renderDeferred']=renderDeferred}catch(e){}
try{_ex['openDeferredModal']=openDeferredModal}catch(e){}
try{_ex['searchDeferredProduct']=searchDeferredProduct}catch(e){}
try{_ex['selectDeferredProduct']=selectDeferredProduct}catch(e){}
try{_ex['calcDeferredTotal']=calcDeferredTotal}catch(e){}
try{_ex['saveDeferred']=saveDeferred}catch(e){}
try{_ex['exportDeferredExcel']=exportDeferredExcel}catch(e){}
try{_ex['completeSale']=completeSale}catch(e){}
try{_ex['cancelSaleConfirm']=cancelSaleConfirm}catch(e){}
try{_ex['selectReturnReceipt']=selectReturnReceipt}catch(e){}
try{_ex['openReturnModalFromReceipt']=openReturnModalFromReceipt}catch(e){}
try{_ex['exportSalesExcel']=exportSalesExcel}catch(e){}
try{_ex['exportSalesDetailedExcel']=exportSalesDetailedExcel}catch(e){}
try{_ex['submitWriteOff']=submitWriteOff}catch(e){}
try{_ex['startAuditSession']=startAuditSession}catch(e){}
try{_ex['cancelAuditSession']=cancelAuditSession}catch(e){}
try{_ex['renderAuditSessionTable']=renderAuditSessionTable}catch(e){}
try{_ex['completeAuditSession']=completeAuditSession}catch(e){}
try{_ex['printReceipt']=printReceipt}catch(e){}
try{_ex['openReceipt']=openReceipt}catch(e){}
try{_ex['migrateDeferredData']=migrateDeferredData}catch(e){}
try{_ex['getAuditLog']=getAuditLog}catch(e){}
try{_ex['setAuditLog']=setAuditLog}catch(e){}
try{_ex['addAuditLog']=addAuditLog}catch(e){}
try{_ex['openAuditLog']=openAuditLog}catch(e){}
return _ex;})();

// products
__mod['products']=(function(){
var addAuditLog=__mf('sales','addAuditLog');
var getSales=__mf('sales','getSales');
var getActivePromotions=__mf('promotions','getActivePromotions');
var toast=__mf('notifications','toast');
var tableHTML=__mf('utils','tableHTML');
var fmt=__mf('utils','fmt');
var closeModal=__mf('utils','closeModal');
var setStore=__mf('store','setStore');
var openModal=__mf('ui','openModal');
var getFieldValue=__mf('utils','getFieldValue');
var isSaleActive=__mf('sales','isSaleActive');
var _statsPeriod=__mv('statistics','_statsPeriod');
var scannerAnimFrame=__mv('store','scannerAnimFrame');
var checkPermission=__mf('users','checkPermission');
var uid=__mf('ui','uid');
var _bulkSelected=__mv('store','_bulkSelected');
var refreshAll=__mf('ui','refreshAll');
var scannerStream=__mv('store','scannerStream');
var stopTracks=__mf('utils','stopTracks');
var generateSearchVariations=__mf('utils','generateSearchVariations');
var updateBulkBar=__mf('utils','updateBulkBar');
var _lastScanTime=__mv('store','_lastScanTime');
var levenshtein=__mf('utils','levenshtein');
var _scannerAutoClose=__mv('store','_scannerAutoClose');
var getCategories=__mf('categories','getCategories');
var confirmAction=__mf('utils','confirmAction');
var _scanLoopFn=__mv('store','_scanLoopFn');
var EXCEL_SECTIONS=__mv('constants','EXCEL_SECTIONS');
var exportSectionToExcel=__mf('reports','exportSectionToExcel');
var _schedulePostSaveSync=__mf('sync','_schedulePostSaveSync');
var addToCart=__mf('cart','addToCart');
var renderSaleCart=__mf('cart','renderSaleCart');
var scannerActive=__mv('store','scannerActive');
var updateMarkup=__mf('utils','updateMarkup');
var CODE39=__mv('constants','CODE39');
var saleCart=__mv('cart','saleCart');
var scannerTarget=__mv('store','scannerTarget');
var isAdmin=__mf('users','isAdmin');
var normalizeCode=__mf('utils','normalizeCode');
var _posCatModalState=__mv('statistics','_posCatModalState');
var drawEan13Svg=__mf('utils','drawEan13Svg');
var generateEAN13=__mf('utils','generateEAN13');
var set=__mf('app-context','set');
var renderDashboard=__mf('ui','renderDashboard');
var todayStr=__mf('utils','todayStr');
var drawCode39Svg=__mf('utils','drawCode39Svg');



function getProducts() {
    return window.DataService ? window.DataService.get('products') : [];
}

function setProducts(arr) {
    if (window.DataService)
        window.DataService.set('products', arr);
}

function getDocumentItems() {
    return window.ApDb ? window.ApDb.getDocumentItems() : [];
}

function setDocumentItems(arr) {
    if (window.ApDb)
        window.ApDb.setDocumentItems(arr);
}

function migrateProducts() {
    const list = getProducts();
    let changed = false;
    const migrated = list.map(function (p, i) {
        const code = (p.code || '').trim().toUpperCase();
        if (!code) {
            changed = true;
            return Object.assign({}, p, { code: 'T' + String(i + 1).padStart(3, '0') });
        }
        if (code !== p.code) {
            changed = true;
            return Object.assign({}, p, { code: code });
        }
        return p;
    });
    if (changed)
        setProducts(migrated);
    migrateBarcodes();
}

function migrateBarcodes() {
    const list = getProducts();
    let changed = false;
    let num = 1;
    const migrated = list.map(function (p) {
        if (p.barcode && normalizeBarcode(p.barcode))
            return p;
        changed = true;
        var bc = generateEAN13(num++);
        return Object.assign({}, p, { barcode: bc });
    });
    if (changed)
        setProducts(migrated);
}

function normalizeBarcode(str) {
    return String(str || '').replace(/\s/g, '').trim();
}

function findProductByBarcode(term, requireStock) {
    var t = normalizeBarcode(term);
    if (!t)
        return null;
    var found = getProducts().find(function (p) {
        return p.barcode && normalizeBarcode(p.barcode) === t;
    });
    if (!found)
        return null;
    if (requireStock && found.quantity <= 0)
        return null;
    return found;
}

function findProductByCode(term, requireStock) {
    var t = normalizeCode(term);
    if (!t)
        return null;
    var found = getProducts().find(function (p) {
        return (p.code || '').toUpperCase() === t;
    });
    if (!found)
        return null;
    if (requireStock && found.quantity <= 0)
        return null;
    return found;
}

function findProductByScan(term) {
    var bc = findProductByBarcode(term, true);
    if (bc)
        return bc;
    var code = findProductByCode(term, true);
    if (code)
        return code;
    var bcNoStock = findProductByBarcode(term, false);
    if (bcNoStock && bcNoStock.quantity <= 0) {
        toast('Товар \xAB' + bcNoStock.name + '\xBB нет на складе', 'warn');
        return null;
    }
    var codeNoStock = findProductByCode(term, false);
    if (codeNoStock && codeNoStock.quantity <= 0) {
        toast('Товар \xAB' + codeNoStock.name + '\xBB нет на складе', 'warn');
    }
    return null;
}

function barcodePriceLabel() {
    var price = parseFloat(document.getElementById('product-price').value);
    if (isNaN(price) || price < 0)
        price = 0;
    return fmt(price);
}

function handleBarcodeScan(raw) {
    var code = normalizeBarcode(raw);
    if (!code)
        return;
    var modalOpen = document.getElementById('modal-product').classList.contains('show');
    if (modalOpen && isAdmin()) {
        document.getElementById('product-barcode').value = code;
        renderBarcodePreview();
        toast('Штрих-код: ' + code, 'ok');
        return;
    }
    var page = document.querySelector('.page.active');
    var product = findProductByScan(code) || findProductByBarcode(code, false) || findProductByCode(code, false);
    if (!product) {
        toast('Товар не найден: ' + code, 'err');
        if (page.id === 'page-products') {
            document.getElementById('product-search').value = code;
            renderProducts();
        } else {
            document.getElementById('sale-search').value = code;
        }
        return;
    }
    if (page.id === 'page-sales') {
        if (product.quantity <= 0) {
            toast('Нет на складе: ' + product.name, 'err');
            return;
        }
        addToCart(product.id);
    } else if (page.id === 'page-products') {
        document.getElementById('product-search').value = product.barcode || product.code || '';
        renderProducts();
        toast('Найден: ' + product.name, 'ok');
    }
}

function syncProductFilterUI() {
    const sel = document.getElementById('filter-category');
    if (!sel)
        return;
    const current = sel.value || '';
    const cats = getCategories();
    sel.innerHTML = '<option value="">Все категории</option>' + cats.map(function (c) {
        return '<option value="' + c.id + '">' + c.name + '</option>';
    }).join('');
    if (current && cats.some(function (c) {
            return c.id === current;
        }))
        sel.value = current;
    else
        sel.value = '';
    var supSel = document.getElementById('filter-supplier');
    if (supSel) {
        var curSup = supSel.value;
        var prods = getProducts();
        var suppliers = prods.filter(function (p) {
            return p.supplier;
        }).map(function (p) {
            return p.supplier;
        });
        suppliers = suppliers.filter(function (v, i, a) {
            return a.indexOf(v) === i;
        }).sort(function (a, b) {
            return a.localeCompare(b, 'ru');
        });
        supSel.innerHTML = '<option value="">Все поставщики</option>' + suppliers.map(function (s) {
            return '<option value="' + esc(s) + '">' + esc(s) + '</option>';
        }).join('');
        if (curSup && suppliers.indexOf(curSup) >= 0)
            supSel.value = curSup;
        else
            supSel.value = '';
    }
}

function fillSaleProducts() {
}

var _selectedCartItemId = null;

function setSelectedCartItemId(value) {
    _selectedCartItemId = value;
}

var _discountItemId = null;

function setDiscountItemId(value) {
    _discountItemId = value;
}

function onBarcodeDetected(code) {
    if (!scannerActive)
        return;
    if (!scannerTarget)
        return;
    var now = Date.now();
    if (now - _lastScanTime < 800) {
        return;
    }
    setStore('_lastScanTime', now);
    if (scannerTarget === 'sale-search') {
        var exact = findProductByScan(code);
        if (exact) {
            addToCart(exact.id);
            toast('\u2705 ' + exact.name, 'ok');
            if (!_scannerAutoClose) {
                return;
            }
        } else {
            var matches = smartMatchProducts(code);
            if (matches.length === 1) {
                addToCart(matches[0].id);
                toast('\u2705 ' + matches[0].name, 'ok');
                if (!_scannerAutoClose)
                    return;
            } else if (matches.length > 1) {
                toast('Найдено несколько товаров', 'warn');
                var input = document.getElementById(scannerTarget);
                if (input) {
                    input.value = code;
                    input.dispatchEvent(new Event('input'));
                }
                if (scannerAnimFrame) {
                    setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn));
                }
                return;
            } else {
                toast('\u274C Штрих-код ' + code + ' не найден', 'err');
                if (scannerAnimFrame) {
                    setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn));
                }
                return;
            }
        }
    } else {
        var input = document.getElementById(scannerTarget);
        if (input) {
            input.value = code;
            input.dispatchEvent(new Event('input'));
            if (scannerTarget === 'product-barcode' || scannerTarget === 'debt-barcode') {
                input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
            }
        }
    }
    if (_scannerAutoClose) {
        setStore('scannerActive', false);
        cleanupScanner();
        try {
            closeModal('modal-scanner');
        } catch (e) {
        }
    } else {
        if (scannerAnimFrame) {
            setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn));
        }
    }
}

function renderUnsoldProducts(days) {
    days = days || 30;
    var start = new Date();
    start.setDate(start.getDate() - days);
    var sales = getSales().filter(function (s) {
        return isSaleActive(s) && new Date(s.date) >= start;
    });
    var soldIds = {};
    sales.forEach(function (s) {
        if (s.productId)
            soldIds[s.productId] = true;
    });
    var products = getProducts();
    var unsold = products.filter(function (p) {
        return !soldIds[p.id];
    });
    var container = document.getElementById('unsold-products-list');
    if (!unsold.length) {
        container.innerHTML = '<div class="empty">Все товары продавались за последние ' + days + ' дней</div>';
        return;
    }
    var html = '<div style="font-size:13px;color:var(--text-muted);margin-bottom:8px">Товаров без продаж: ' + unsold.length + '</div>';
    html += '<div class="table-wrap"><table><thead><tr><th>Код</th><th>Название</th><th>Остаток</th><th>Цена</th><th>Категория</th></tr></thead><tbody>';
    unsold.forEach(function (p) {
        html += '<tr><td>' + esc(p.code || '\u2014') + '</td><td>' + esc(p.name) + '</td><td>' + (p.quantity || 0) + '</td><td>' + fmt(p.price) + '</td><td>' + esc(p.category || '\u2014') + '</td></tr>';
    });
    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function addDocItemRow(tbodyId) {
    var tbody = document.getElementById(tbodyId);
    if (!tbody)
        return;
    var tr = document.createElement('tr');
    tr.innerHTML = '<td style="padding:2px;border:1px solid var(--border)"><input class="doc-item-code" style="width:100%;border:none;background:transparent;padding:4px" placeholder="Код"></td>' + '<td style="padding:2px;border:1px solid var(--border)"><input class="doc-item-name" style="width:100%;border:none;background:transparent;padding:4px" placeholder="Наименование товара"></td>' + '<td style="padding:2px;border:1px solid var(--border);text-align:center"><input class="doc-item-qty" type="number" step="any" value="1" min="0" style="width:70px;border:none;background:transparent;padding:4px;text-align:center" oninput="recalcDocItemRow(this)"></td>' + '<td style="padding:2px;border:1px solid var(--border);text-align:center"><input class="doc-item-price" type="number" step="any" value="0" min="0" style="width:90px;border:none;background:transparent;padding:4px;text-align:center" oninput="recalcDocItemRow(this)"></td>' + '<td style="padding:2px;border:1px solid var(--border);text-align:center"><span class="doc-item-total" style="font-weight:600">0</span></td>' + '<td style="padding:2px;border:1px solid var(--border);text-align:center"><button class="btn btn-sm btn-danger" style="padding:2px 6px;font-size:12px" onclick="this.closest(\'tr\').remove()">\u2715</button></td>';
    tbody.appendChild(tr);
}

function recalcDocItemRow(el) {
    var tr = el.closest('tr');
    if (!tr)
        return;
    var qty = parseFloat((tr.querySelector('.doc-item-qty') || {}).value) || 0;
    var price = parseFloat((tr.querySelector('.doc-item-price') || {}).value) || 0;
    var totalSpan = tr.querySelector('.doc-item-total');
    if (totalSpan)
        totalSpan.textContent = fmt(qty * price);
}

function getDocItemsFromTable(tbodyId) {
    var tbody = document.getElementById(tbodyId);
    if (!tbody)
        return [];
    var items = [];
    tbody.querySelectorAll('tr').forEach(function (tr) {
        var code = (tr.querySelector('.doc-item-code') || {}).value || '';
        var name = (tr.querySelector('.doc-item-name') || {}).value || '';
        var qty = parseFloat((tr.querySelector('.doc-item-qty') || {}).value) || 0;
        var price = parseFloat((tr.querySelector('.doc-item-price') || {}).value) || 0;
        if (name && qty > 0) {
            items.push({
                productCode: code,
                productName: name,
                quantity: qty,
                unitPrice: price,
                total: qty * price
            });
        }
    });
    return items;
}

function getProductDiscount(productId) {
    var promos = getActivePromotions();
    var best = null;
    promos.forEach(function (p) {
        if (p.productId === productId) {
            if (!best || p.discountValue > best.discountValue)
                best = p;
        }
    });
    return best;
}

var _qtyPopupProductId = null;

function setQtyPopupProductId(value) {
    _qtyPopupProductId = value;
}




function smartMatchProducts(term) {
    var t = term.trim();
    if (!t)
        return [];
    var variations = generateSearchVariations(t);
    var products = getProducts().filter(function (p) {
        return p.quantity > 0;
    });
    var scored = [];
    products.forEach(function (p) {
        var name = (p.name || '').toLowerCase();
        var code = (p.code || '').toLowerCase();
        var barcode = (p.barcode || '').toLowerCase();
        var sku = (p.sku || '').toLowerCase();
        var searchText = name + ' ' + code + ' ' + barcode + ' ' + sku;
        var bestScore = 0;
        var matchType = '';
        variations.forEach(function (v) {
            var vl = v.toLowerCase();
            if (searchText === vl) {
                bestScore = Math.max(bestScore, 1000);
                matchType = 'exact';
                return;
            }
            if (barcode === vl) {
                bestScore = Math.max(bestScore, 950);
                matchType = 'barcode';
                return;
            }
            if (code === vl) {
                bestScore = Math.max(bestScore, 900);
                matchType = 'code';
                return;
            }
            if (name.indexOf(vl) === 0) {
                bestScore = Math.max(bestScore, 500 + (1000 - vl.length));
                matchType = 'prefix';
                return;
            }
            if (code.indexOf(vl) === 0) {
                bestScore = Math.max(bestScore, 400);
                matchType = 'code_prefix';
                return;
            }
            if (name.indexOf(vl) >= 0) {
                bestScore = Math.max(bestScore, 200 + (1000 - vl.length) + (100 - name.indexOf(vl)));
                matchType = 'substring';
            }
            if (code.indexOf(vl) >= 0) {
                bestScore = Math.max(bestScore, 150);
                matchType = 'code_substr';
            }
            if (sku.indexOf(vl) >= 0) {
                bestScore = Math.max(bestScore, 140);
                matchType = 'sku';
            }
            var nameWords = name.split(/[\s\-_.,\/]+/);
            nameWords.forEach(function (w) {
                if (w.indexOf(vl) === 0)
                    bestScore = Math.max(bestScore, 180 + (1000 - vl.length));
                if (w.length > 2 && vl.length > 2) {
                    var dist = levenshtein(w, vl);
                    if (dist <= 1)
                        bestScore = Math.max(bestScore, 160);
                    else if (dist <= 2)
                        bestScore = Math.max(bestScore, 80);
                }
            });
        });
        if (bestScore > 0) {
            scored.push({
                product: p,
                score: bestScore,
                matchType: matchType
            });
        }
    });
    scored.sort(function (a, b) {
        return b.score - a.score;
    });
    return scored.map(function (s) {
        return s.product;
    });
}

function renderBarcodePreview() {
    var el = document.getElementById('product-barcode-preview');
    if (!el)
        return;
    var text = normalizeBarcode(document.getElementById('product-barcode').value);
    var name = (document.getElementById('product-name').value || '').trim();
    if (!text) {
        el.innerHTML = '<span style="color:#999">Введите или создайте штрих-код</span>';
        return;
    }
    var html = '';
    if (name)
        html += '<div style="font-weight:600;font-size:14px;color:#111;margin-bottom:6px">' + name.replace(/</g, '&lt;') + '</div>';
    var isEan13 = /^\d{13}$/.test(text);
    if (isEan13) {
        html += drawEan13Svg(text, 2, 50);
    } else {
        html += drawCode39Svg(text) + '<div class="barcode-num">' + text + '</div>';
    }
    html += '<div style="font-size:20px;font-weight:700;color:#111;margin-top:8px">' + barcodePriceLabel() + '</div>';
    el.innerHTML = html;
}

function generateProductBarcode() {
    var list = getProducts();
    var n = list.length + 1;
    var bc;
    do {
        bc = generateEAN13(n++);
    } while (list.some(function (p) {
        return p.barcode === bc;
    }));
    document.getElementById('product-barcode').value = bc;
    renderBarcodePreview();
    toast('Штрих-код создан', 'ok');
}

function printProductBarcode() {
    var text = normalizeBarcode(document.getElementById('product-barcode').value);
    var name = document.getElementById('product-name').value.trim() || 'Товар';
    var priceStr = barcodePriceLabel();
    if (!text) {
        toast('Сначала укажите штрих-код', 'err');
        return;
    }
    var lw = parseInt(document.getElementById('label-width').value) || 43;
    var lh = parseInt(document.getElementById('label-height').value) || 25;
    var isEan13 = /^\d{13}$/.test(text);
    var svgHtml, numHtml;
    if (isEan13) {
        var targetW = lw * 8 * 0.92;
        var modW = Math.max(1, Math.round(targetW / 115));
        var barH = Math.max(20, Math.round(lh * 8 * 0.4));
        svgHtml = drawEan13Svg(text, modW, barH);
        numHtml = '';
    } else {
        var enc = '*' + String(text).toUpperCase().replace(/[^0-9A-Z\-\.\ \$\/\+\%]/g, '') + '*';
        var totalUnits = 0;
        for (var i = 0; i < enc.length; i++) {
            var pat = CODE39[enc[i]];
            if (pat) {
                for (var j = 0; j < 9; j++)
                    totalUnits += pat[j] === 'w' ? 3 : 1;
            }
            totalUnits += 1;
        }
        var targetPx = lw * 8 * 0.85;
        var scale = Math.max(1, Math.floor(targetPx / (totalUnits * 2)));
        var targetHeightPx = lh * 8 * 0.35;
        var heightScale = Math.max(1, Math.round(targetHeightPx / 40));
        svgHtml = drawCode39Svg(text, scale, heightScale);
        numHtml = '<div class="label-num">' + String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</div>';
    }
    var esc = function (s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
    };
    var w = window.open('', '_blank', 'width=420,height=360');
    w.document.write('<html><head><title>Штрих-код ' + lw + 'x' + lh + 'mm</title>' + '<style>' + '@page { size: ' + lw + 'mm ' + lh + 'mm; margin: 0; }' + '* { box-sizing: border-box; margin: 0; padding: 0; }' + 'body {' + 'width: ' + lw + 'mm; height: ' + lh + 'mm;' + 'display: flex; flex-direction: column; align-items: center; justify-content: center;' + 'font-family: Arial, Helvetica, sans-serif; text-align: center;' + 'overflow: hidden; padding: 0.5mm; background: #fff;' + '}' + '.label-name { font-size: 6pt; font-weight: 700; line-height: 1.15; max-height: 2.2em; overflow: hidden; word-break: break-all; color: #000; }' + '.label-price { font-size: 7.5pt; font-weight: 800; margin: 0.2mm 0 0.3mm; color: #000; }' + '.label-barcode { line-height: 0; }' + '.label-barcode svg { width: ' + (lw - 2) + 'mm; height: auto; display: block; }' + '.label-num { font-family: "Courier New", monospace; font-size: 5.5pt; letter-spacing: 0.8px; margin-top: 0.2mm; color: #000; font-weight: 600; }' + '@media print {' + 'body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }' + '.label-barcode svg { image-rendering: pixelated; image-rendering: crisp-edges; }' + '}' + '</style></head><body>' + '<div class="label-name">' + esc(name) + '</div>' + '<div class="label-price">' + esc(priceStr) + '</div>' + '<div class="label-barcode">' + svgHtml + '</div>' + numHtml + '<script>window.onload=function(){window.print()}</script>' + '</body></html>');
    w.document.close();
}

function renderProducts() {
    syncProductFilterUI();
    const search = (document.getElementById('product-search').value || '').toLowerCase();
    const lowOnly = document.getElementById('filter-low').checked;
    const cat = (document.getElementById('filter-category').value || '').trim();
    const minPrice = parseFloat(document.getElementById('filter-price-min').value);
    const maxPrice = parseFloat(document.getElementById('filter-price-max').value);
    const sort = (document.getElementById('filter-sort').value || 'name_asc').trim();
    let list = getProducts();
    var allProducts = getProducts();
    var totalCost = 0;
    var totalRetail = 0;
    var totalQty = 0;
    allProducts.forEach(function (p) {
        var qty = Number(p.quantity) || 0;
        totalQty += qty;
        totalCost += qty * (Number(p.purchasePrice) || 0);
        totalRetail += qty * (Number(p.price) || 0);
    });
    var summaryEl = document.getElementById('products-summary');
    if (summaryEl) {
        summaryEl.innerHTML = '<div class="card"><div class="card-label">Общий остаток (шт)</div><div class="card-value">' + totalQty + '</div></div>' + '<div class="card warn"><div class="card-label">Общая себестоимость</div><div class="card-value">' + fmt(totalCost) + ' \u20B8</div></div>' + '<div class="card ok"><div class="card-label">Общая цена продажи</div><div class="card-value">' + fmt(totalRetail) + ' \u20B8</div></div>' + (totalCost > 0 ? '<div class="card"><div class="card-label">Наценка (суммарная)</div><div class="card-value">' + fmt(totalRetail - totalCost) + ' \u20B8</div></div>' : '');
    }
    if (search) {
        var smartResults = smartMatchProducts(search);
        var smartIds = {};
        smartResults.forEach(function (p) {
            smartIds[p.id] = true;
        });
        list = list.filter(function (p) {
            return smartIds[p.id];
        });
    }
    if (cat)
        list = list.filter(function (p) {
            return (p.category || '') === cat;
        });
    if (!isNaN(minPrice))
        list = list.filter(function (p) {
            return (Number(p.price) || 0) >= minPrice;
        });
    if (!isNaN(maxPrice))
        list = list.filter(function (p) {
            return (Number(p.price) || 0) <= maxPrice;
        });
    if (lowOnly)
        list = list.filter(function (p) {
            return p.quantity <= (p.minStock || 5);
        });
    var skuSearch = (document.getElementById('filter-sku').value || '').toLowerCase().trim();
    if (skuSearch)
        list = list.filter(function (p) {
            return (p.sku || '').toLowerCase().includes(skuSearch);
        });
    var supFilter = (document.getElementById('filter-supplier').value || '').trim();
    if (supFilter)
        list = list.filter(function (p) {
            return (p.supplier || '') === supFilter;
        });
    var dateFrom = document.getElementById('filter-date-from').value;
    var dateTo = document.getElementById('filter-date-to').value;
    if (dateFrom || dateTo) {
        list = list.filter(function (p) {
            var d = p.created_at ? new Date(p.created_at) : null;
            if (!d)
                return false;
            if (dateFrom && d < new Date(dateFrom + 'T00:00:00'))
                return false;
            if (dateTo && d > new Date(dateTo + 'T23:59:59'))
                return false;
            return true;
        });
    }
    list = list.slice().sort(function (a, b) {
        const an = a.name || '';
        const bn = b.name || '';
        const ap = Number(a.price) || 0;
        const bp = Number(b.price) || 0;
        const aq = Number(a.quantity) || 0;
        const bq = Number(b.quantity) || 0;
        switch (sort) {
        case 'price_asc':
            return ap - bp;
        case 'price_desc':
            return bp - ap;
        case 'qty_asc':
            return aq - bq;
        case 'qty_desc':
            return bq - aq;
        case 'name_asc':
        default:
            return an.localeCompare(bn, 'ru', { sensitivity: 'base' });
        }
    });
    document.getElementById('products-count').textContent = 'Всего: ' + getProducts().length + ' товаров';
    const admin = isAdmin();
    const cols = [
        '<input type="checkbox" id="bulk-select-all" onchange="toggleBulkSelectAll(this)" title="Выбрать всё">',
        '\u2605',
        'Категория',
        'Код',
        'Артикул (SKU)',
        'Штрих-код',
        'Название',
        'Поставщик'
    ];
    if (admin)
        cols.push('Закуп');
    cols.push('Цена', 'Скидка', 'Количество');
    if (admin)
        cols.push('Действия');
    const rows = list.map(function (p) {
        const low = p.quantity <= (p.minStock || 5);
        const qty = low ? '<span class="low-stock">' + p.quantity + ' \u26A0</span>' : p.quantity;
        var catName = '\u2014';
        if (p.category) {
            var catObj = getCategories().find(function (c) {
                return c.id === p.category;
            });
            catName = catObj ? '<span class="badge badge-info">' + catObj.name + '</span>' : '\u2014';
        }
        let nameCell = p.name;
        if (p.info)
            nameCell += '<br><span style="font-size:12px;color:var(--muted)">' + p.info + '</span>';
        if (p.compatibility)
            nameCell += '<br><span style="font-size:11px;color:var(--primary);background:var(--primary-light);padding:2px 6px;border-radius:4px;">\uD83D\uDE97 ' + p.compatibility + '</span>';
        var starBtn = p.favorite ? '<span class="star-fav" onclick="toggleFavoriteFromTable(\'' + p.id + '\', event)" title="Убрать из избранного">\u2605</span>' : '<span class="star-no-fav" onclick="toggleFavoriteFromTable(\'' + p.id + '\', event)" title="Добавить в избранное">\u2606</span>';
        const row = [
            '<input type="checkbox" class="bulk-item" data-id="' + p.id + '" onchange="updateBulkBar()">',
            starBtn,
            catName,
            '<span class="code-tag">' + (p.code || '\u2014') + '</span>',
            '<span style="font-size:12px">' + (p.sku || '\u2014') + '</span>',
            '<span class="barcode-tag">' + (p.barcode || '\u2014') + '</span>',
            nameCell,
            '<span style="font-size:12px">' + (p.supplier || '\u2014') + '</span>'
        ];
        if (admin)
            row.push(fmt(p.purchasePrice || 0));
        row.push(fmt(p.price));
        var discount = getProductDiscount(p.id);
        row.push(discount ? '<span class="badge badge-ok">-' + (discount.discountType === 'percent' ? discount.discountValue + '%' : fmt(discount.discountValue) + '\u20B8') + '</span>' : '\u2014');
        row.push(qty);
        var canEdit = checkPermission('editProducts');
        var canDelete = checkPermission('deleteProducts');
        var actions = '<div class="actions">';
        if (canEdit)
            actions += '<button class="icon-btn" onclick="editProduct(\'' + p.id + '\')">\u270F️</button>';
        if (canDelete)
            actions += '<button class="icon-btn del" onclick="deleteProduct(\'' + p.id + '\')">\uD83D\uDDD1</button>';
        actions += '</div>';
        row.push(actions);
        return row;
    });
    document.getElementById('products-table').innerHTML = list.length ? tableHTML(cols, rows) : '<div class="empty">Товары не найдены</div>';
    document.querySelectorAll('.bulk-item').forEach(function (el) {
        if (_bulkSelected.has(el.dataset.id))
            el.checked = true;
    });
    updateBulkBar();
}

function exportProductsToExcel() {
    exportSectionToExcel('products', getProducts().slice().sort(function (a, b) {
        return String(a.name || '').localeCompare(String(b.name || ''), 'ru', { sensitivity: 'base' });
    }), 'SANAQ_Товары_' + todayStr() + '.xlsx');
}

function exportProductsToCSV() {
    var cfg = EXCEL_SECTIONS.products;
    if (!cfg)
        return;
    var data = getProducts().slice().sort(function (a, b) {
        return String(a.name || '').localeCompare(String(b.name || ''), 'ru', { sensitivity: 'base' });
    });
    var rows = data.map(function (item) {
        return cfg.headers.map(function (h, i) {
            return getFieldValue(item, cfg.fields[i]);
        });
    });
    var csvContent = '\uFEFF' + cfg.headers.join(';') + '\n' + rows.map(function (r) {
        return r.join(';');
    }).join('\n');
    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'SANAQ_Товары_' + todayStr() + '.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    toast('CSV файл скачан', 'ok');
}

function openProductModal(id) {
    document.getElementById('product-edit-id').value = id || '';
    document.getElementById('modal-product-title').textContent = id ? 'Редактировать товар' : 'Новый товар';
    const catSel = document.getElementById('product-category');
    catSel.innerHTML = '<option value="">Без категории</option>' + getCategories().map(function (c) {
        return '<option value="' + c.id + '">' + c.name + '</option>';
    }).join('');
    if (id) {
        const p = getProducts().find(function (x) {
            return x.id === id;
        });
        if (p) {
            document.getElementById('product-code').value = p.code || '';
            document.getElementById('product-barcode').value = p.barcode || '';
            document.getElementById('product-name').value = p.name || '';
            document.getElementById('product-category').value = p.category || '';
            document.getElementById('product-qty').value = p.quantity || 0;
            document.getElementById('product-purchase').value = p.purchasePrice || 0;
            document.getElementById('product-price').value = p.price || 0;
            document.getElementById('product-markup').value = p.markup || 0;
            document.getElementById('product-min').value = p.minStock || 5;
            document.getElementById('product-info').value = p.info || '';
            document.getElementById('product-compatibility').value = p.compatibility || '';
            document.getElementById('product-sku').value = p.sku || '';
            document.getElementById('product-supplier').value = p.supplier || '';
            renderBarcodePreview();
            updateMarkup();
        }
    } else {
        document.getElementById('product-code').value = '';
        document.getElementById('product-barcode').value = '';
        document.getElementById('product-name').value = '';
        document.getElementById('product-category').value = '';
        document.getElementById('product-qty').value = 0;
        document.getElementById('product-purchase').value = 0;
        document.getElementById('product-price').value = 0;
        document.getElementById('product-markup').value = 0;
        document.getElementById('product-min').value = 5;
        document.getElementById('product-info').value = '';
        document.getElementById('product-compatibility').value = '';
        document.getElementById('product-sku').value = '';
        document.getElementById('product-supplier').value = '';
        renderBarcodePreview();
        updateMarkup();
    }
    openModal('modal-product');
}

function editProduct(id) {
    openProductModal(id);
}

function saveProduct() {
    const code = normalizeCode(document.getElementById('product-code').value);
    const barcode = normalizeBarcode(document.getElementById('product-barcode').value);
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value;
    const qty = parseFloat(document.getElementById('product-qty').value);
    const purchasePrice = parseFloat(document.getElementById('product-purchase').value) || 0;
    const markup = parseFloat(document.getElementById('product-markup').value) || 0;
    const price = parseFloat(document.getElementById('product-price').value);
    const minStock = parseFloat(document.getElementById('product-min').value) || 5;
    const info = document.getElementById('product-info').value.trim();
    const compatibility = document.getElementById('product-compatibility').value.trim();
    const sku = document.getElementById('product-sku').value.trim();
    const supplier = document.getElementById('product-supplier').value.trim();
    const editId = document.getElementById('product-edit-id').value;
    if (!code) {
        toast('Введите код товара', 'err');
        return;
    }
    if (!name) {
        toast('Введите название товара', 'err');
        return;
    }
    if (isNaN(qty) || qty < 0) {
        toast('Некорректное количество', 'err');
        return;
    }
    if (isNaN(price) || price < 0) {
        toast('Некорректная цена', 'err');
        return;
    }
    if (editId && !checkPermission('editProducts')) {
        toast('Нет прав на редактирование товаров', 'err');
        return;
    }
    if (!editId && !checkPermission('addProducts')) {
        toast('Нет прав на добавление товаров', 'err');
        return;
    }
    let list = getProducts();
    const duplicate = list.find(function (p) {
        return p.code === code && p.id !== editId;
    });
    if (duplicate) {
        toast('Код \xAB' + code + '\xBB уже занят', 'err');
        return;
    }
    if (barcode) {
        const dupBc = list.find(function (p) {
            return p.barcode === barcode && p.id !== editId;
        });
        if (dupBc) {
            toast('Штрих-код \xAB' + barcode + '\xBB уже используется', 'err');
            return;
        }
    }
    if (sku) {
        const dupSku = list.find(function (p) {
            return p.sku === sku && p.id !== editId;
        });
        if (dupSku) {
            toast('Артикул (SKU) \xAB' + sku + '\xBB уже используется', 'err');
            return;
        }
    }
    var data = {
        code: code,
        barcode: barcode || '',
        name: name,
        category: category,
        sku: sku,
        supplier: supplier,
        quantity: qty,
        purchasePrice: purchasePrice,
        markup: markup,
        price: price,
        minStock: minStock,
        info: info,
        compatibility: compatibility
    };
    data.updated_at = new Date().toISOString();
    if (editId) {
        list = list.map(function (p) {
            return p.id === editId ? Object.assign({}, p, data) : p;
        });
        toast('Товар обновлён', 'ok');
        addAuditLog('Изменён товар', 'Товар: ' + data.name, '\u270F️');
    } else {
        if (!data.barcode)
            data.barcode = generateEAN13(list.length + 1);
        data.created_at = data.updated_at;
        list.push(Object.assign({
            id: uid(),
            favorite: false
        }, data));
        toast('Товар добавлен', 'ok');
        addAuditLog('Добавлен товар', 'Товар: ' + data.name + ' (код: ' + data.code + ')', '\uD83D\uDCE6');
    }
    setProducts(list);
    closeModal('modal-product');
    renderProducts();
    renderDashboard();
    refreshAll();
    _schedulePostSaveSync();
}

function deleteProduct(id) {
    if (!checkPermission('deleteProducts')) {
        toast('Нет прав на удаление товаров', 'err');
        return;
    }
    const p = getProducts().find(function (x) {
        return x.id === id;
    });
    confirmAction('Удалить товар?', 'Товар \xAB' + (p ? p.name : '') + '\xBB будет удалён безвозвратно.', function () {
        addAuditLog('Удалён товар', 'Товар: ' + (p ? p.name : ''), '\uD83D\uDDD1');
        setProducts(getProducts().filter(function (x) {
            return x.id !== id;
        }));
        toast('Товар удалён', 'ok');
        renderProducts();
        renderDashboard();
    });
}

function addUniversalProduct() {
    var modal = document.getElementById('modal-universal-product');
    if (!modal) {
        toast('Модальное окно не найдено', 'err');
        return;
    }
    openModal('modal-universal-product');
    var nameEl = document.getElementById('uni-name');
    var priceEl = document.getElementById('uni-price');
    var qtyEl = document.getElementById('uni-qty');
    if (nameEl) {
        nameEl.value = '';
        nameEl.focus();
    }
    if (priceEl)
        priceEl.value = '';
    if (qtyEl)
        qtyEl.value = '1';
}

function confirmUniversalProduct() {
    var name = (document.getElementById('uni-name').value || '').trim();
    var price = parseFloat(document.getElementById('uni-price').value) || 0;
    var qty = parseInt(document.getElementById('uni-qty').value) || 1;
    if (!name) {
        toast('Введите название товара', 'err');
        return;
    }
    if (price <= 0) {
        toast('Введите цену товара', 'err');
        return;
    }
    if (qty < 1)
        qty = 1;
    saleCart.push({
        id: 'uni_' + uid(),
        code: '',
        barcode: '',
        name: name,
        price: price,
        maxQty: 999999,
        qty: qty,
        isUniversal: true
    });
    closeModal('modal-universal-product');
    renderSaleCart();
    toast('Добавлено: ' + name, 'ok');
}

function renderPosBrowserProducts(products, catName) {
}

function renderPosCatProducts(catId) {
    try {
        var list = document.getElementById('pos-cat-modal-list');
        if (!list)
            return;
        var cat = (getCategories() || []).find(function (c) {
            return c.id === catId;
        });
        _posCatModalState.mode = 'products';
        _posCatModalState.catId = catId;
        _posCatModalState.catName = cat ? cat.name : 'Товары';
        var products = (getProducts() || []).filter(function (p) {
            return p.category === catId && p.quantity > 0;
        });
        if (!products.length) {
            list.style.cssText = '';
            list.innerHTML = '<div style="text-align:center;padding:30px;color:#9ca3af;font-size:16px">Нет товаров в этой категории</div>';
            return;
        }
        list.style.cssText = '';
        list.innerHTML = '<div style="margin-bottom:16px;display:flex;align-items:center;gap:12px;padding:4px"><button class="pos-cat-pill" onclick="window.renderPosCatList()">\u2190 Назад</button> <span style="font-size:18px;font-weight:700;color:#374151">' + esc(_posCatModalState.catName) + '</span></div>' + '<div class="pos-modal-grid">' + products.sort(function (a, b) {
            return (b.quantity || 0) - (a.quantity || 0);
        }).map(function (p) {
            return '<div class="pos-quick-item" onclick="closeModal(\'modal-pos-categories\');addToCart(\'' + p.id + '\')">' + '<div class="qp-price">' + fmt(p.price) + '</div>' + '<div style="font-size:14px;color:#6b7280;margin-top:4px">' + esc(p.name) + '</div></div>';
        }).join('') + '</div>';
    } catch (e) {
        toast('Ошибка загрузки товаров', 'err');
    }
}

function startCameraScanner(targetInputId) {
    setStore('scannerTarget', targetInputId);
    if ('BarcodeDetector' in window) {
        setStore('scannerActive', true);
        openModal('modal-scanner');
        var readerEl = document.getElementById('scanner-reader');
        readerEl.innerHTML = '<div style="padding:40px;text-align:center;color:#fff">Загрузка камеры...</div>';
        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        }).then(function (stream) {
            if (!scannerActive) {
                stopTracks(stream);
                return;
            }
            setStore('scannerStream', stream);
            var video = document.createElement('video');
            video.srcObject = stream;
            video.setAttribute('playsinline', 'true');
            video.setAttribute('autoplay', 'true');
            video.style.cssText = 'width:100%;height:auto;border-radius:8px;display:block;';
            readerEl.innerHTML = '';
            readerEl.appendChild(video);
            video.play().then(function () {
                var detector;
                try {
                    detector = new BarcodeDetector({
                        formats: [
                            'ean_13',
                            'ean_8',
                            'code_128',
                            'code_39',
                            'code_93',
                            'upc_a',
                            'upc_e',
                            'codabar',
                            'itf'
                        ]
                    });
                } catch (e) {
                    try {
                        detector = new BarcodeDetector();
                    } catch (e2) {
                        stopCameraScanner();
                        toast('Сканер недоступен', 'err');
                        return;
                    }
                }
                setTimeout(function () {
                    var btn = document.getElementById('btn-scanner-torch');
                    if (btn && scannerStream) {
                        var track = scannerStream.getVideoTracks()[0];
                        if (track && track.getCapabilities) {
                            var caps = track.getCapabilities();
                            if (caps && caps.torch)
                                btn.style.display = 'inline-block';
                        }
                    }
                }, 500);
                var lastScan = 0;
                setStore('_scanLoopFn', function () {
                    if (!scannerActive)
                        return;
                    var now = Date.now();
                    if (now - lastScan < 150) {
                        setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn));
                        return;
                    }
                    lastScan = now;
                    detector.detect(video).then(function (barcodes) {
                        if (!scannerActive)
                            return;
                        if (barcodes.length > 0) {
                            onBarcodeDetected(barcodes[0].rawValue);
                            if (scannerActive) {
                                setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn));
                            }
                            return;
                        }
                        setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn));
                    }).catch(function () {
                        if (scannerActive)
                            setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn));
                    });
                });
                setStore('scannerAnimFrame', requestAnimationFrame(_scanLoopFn));
            }).catch(function () {
                stopCameraScanner();
                toast('Ошибка запуска видео', 'err');
            });
        }).catch(function (err) {
            console.warn('[Scanner] Camera denied:', err);
            readerEl.innerHTML = '<div style="padding:30px;text-align:center;color:#ff6b6b">' + '<div style="font-size:40px;margin-bottom:12px">\uD83D\uDCF7</div>' + '<div>Нет доступа к камере.</div>' + '<div style="font-size:12px;margin-top:8px;color:#999">Разрешите доступ к камере в настройках браузера, или сделайте фото штрих-кода:</div>' + '<button class="btn btn-primary" style="margin-top:16px" onclick="scanFromPhoto()">\uD83D\uDCF8 Сделать фото</button></div>';
        });
    } else {
        scanFromPhoto();
    }
}

function scanFromPhoto() {
    setStore('scannerActive', false);
    cleanupScanner();
    try {
        closeModal('modal-scanner');
    } catch (e) {
        var modal = document.getElementById('modal-scanner');
        if (modal)
            modal.style.display = 'none';
    }
    var input = document.createElement('input');
    input.type = 'file';
var _ex={};
try{_ex['getProducts']=getProducts}catch(e){}
try{_ex['setProducts']=setProducts}catch(e){}
try{_ex['getDocumentItems']=getDocumentItems}catch(e){}
try{_ex['setDocumentItems']=setDocumentItems}catch(e){}
try{_ex['migrateProducts']=migrateProducts}catch(e){}
try{_ex['migrateBarcodes']=migrateBarcodes}catch(e){}
try{_ex['normalizeBarcode']=normalizeBarcode}catch(e){}
try{_ex['findProductByBarcode']=findProductByBarcode}catch(e){}
try{_ex['findProductByCode']=findProductByCode}catch(e){}
try{_ex['findProductByScan']=findProductByScan}catch(e){}
try{_ex['barcodePriceLabel']=barcodePriceLabel}catch(e){}
try{_ex['handleBarcodeScan']=handleBarcodeScan}catch(e){}
try{_ex['syncProductFilterUI']=syncProductFilterUI}catch(e){}
try{_ex['fillSaleProducts']=fillSaleProducts}catch(e){}
try{_ex['_selectedCartItemId']=_selectedCartItemId}catch(e){}
try{_ex['setSelectedCartItemId']=setSelectedCartItemId}catch(e){}
try{_ex['_discountItemId']=_discountItemId}catch(e){}
try{_ex['setDiscountItemId']=setDiscountItemId}catch(e){}
try{_ex['onBarcodeDetected']=onBarcodeDetected}catch(e){}
try{_ex['renderUnsoldProducts']=renderUnsoldProducts}catch(e){}
try{_ex['addDocItemRow']=addDocItemRow}catch(e){}
try{_ex['recalcDocItemRow']=recalcDocItemRow}catch(e){}
try{_ex['getDocItemsFromTable']=getDocItemsFromTable}catch(e){}
try{_ex['getProductDiscount']=getProductDiscount}catch(e){}
try{_ex['_qtyPopupProductId']=_qtyPopupProductId}catch(e){}
try{_ex['setQtyPopupProductId']=setQtyPopupProductId}catch(e){}
try{_ex['smartMatchProducts']=smartMatchProducts}catch(e){}
try{_ex['renderBarcodePreview']=renderBarcodePreview}catch(e){}
try{_ex['generateProductBarcode']=generateProductBarcode}catch(e){}
try{_ex['printProductBarcode']=printProductBarcode}catch(e){}
try{_ex['renderProducts']=renderProducts}catch(e){}
try{_ex['exportProductsToExcel']=exportProductsToExcel}catch(e){}
try{_ex['exportProductsToCSV']=exportProductsToCSV}catch(e){}
try{_ex['openProductModal']=openProductModal}catch(e){}
try{_ex['editProduct']=editProduct}catch(e){}
try{_ex['saveProduct']=saveProduct}catch(e){}
try{_ex['deleteProduct']=deleteProduct}catch(e){}
try{_ex['addUniversalProduct']=addUniversalProduct}catch(e){}
try{_ex['confirmUniversalProduct']=confirmUniversalProduct}catch(e){}
try{_ex['renderPosBrowserProducts']=renderPosBrowserProducts}catch(e){}
try{_ex['renderPosCatProducts']=renderPosCatProducts}catch(e){}
try{_ex['startCameraScanner']=startCameraScanner}catch(e){}
try{_ex['scanFromPhoto']=scanFromPhoto}catch(e){}
try{_ex['cleanupScanner']=cleanupScanner}catch(e){}
try{_ex['stopCameraScanner']=stopCameraScanner}catch(e){}
try{_ex['renderProductAnalysis']=renderProductAnalysis}catch(e){}
try{_ex['selectWoProduct']=selectWoProduct}catch(e){}
try{_ex['debtBarcodeLookup']=debtBarcodeLookup}catch(e){}
return _ex;})();

// promotions
__mod['promotions']=(function(){
var getProducts=__mf('products','getProducts');
var toast=__mf('notifications','toast');
var uid=__mf('ui','uid');
var closeModal=__mf('utils','closeModal');
var confirmAction=__mf('utils','confirmAction');
var fmt=__mf('utils','fmt');
var currentStoreId=__mv('store','currentStoreId');
var esc=__mf('utils','esc');
var openModal=__mf('ui','openModal');


function getPromotions() {
    var v = window.ApDb && window.ApDb.getAppData ? window.ApDb.getAppData('promotions') : null;
    if (v !== null && v !== undefined)
        return Array.isArray(v) ? v : [];
    try {
        return JSON.parse(localStorage.getItem('sanaq_promotions_' + (currentStoreId || '')) || '[]');
    } catch (e) {
        return [];
    }
}

function setPromotions(arr) {
    if (window.ApDb && window.ApDb.setAppData)
        window.ApDb.setAppData('promotions', arr);
    try {
        localStorage.setItem('sanaq_promotions_' + (currentStoreId || ''), JSON.stringify(arr));
    } catch (e) {
    }
}

function getActivePromotions() {
    var now = new Date();
    return getPromotions().filter(function (p) {
        var start = new Date(p.startDate + 'T' + (p.startTime || '00:00'));
        var end = new Date(p.endDate + 'T' + (p.endTime || '23:59'));
        return now >= start && now <= end && p.active !== false;
    });
}

function renderPromotionsPage() {
    var container = document.getElementById('promotions-page-content');
    var list = getPromotions();
    if (!list.length) {
        container.innerHTML = '<div class="empty">Нет активных акций. Создайте новую акцию.</div>';
        return;
    }
    list.sort(function (a, b) {
        return b.startDate.localeCompare(a.startDate);
    });
    var now = new Date();
    var html = '<div style="display:flex;flex-direction:column;gap:12px">';
    list.forEach(function (p) {
        var start = new Date(p.startDate + 'T' + (p.startTime || '00:00'));
        var end = new Date(p.endDate + 'T' + (p.endTime || '23:59'));
        var isActive = now >= start && now <= end && p.active !== false;
        var products = getProducts();
        var product = products.find(function (x) {
            return x.id === p.productId;
        });
        var pName = product ? product.name : 'Товар удалён';
        html += '<div class="card" style="' + (isActive ? 'border-left:3px solid var(--success)' : 'border-left:3px solid var(--text-muted);opacity:0.7') + '">' + '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' + '<span style="flex:1;font-weight:600">' + esc(pName) + '</span>' + '<span class="badge ' + (isActive ? 'badge-ok' : 'badge') + '">' + (isActive ? 'Активна' : 'Завершена') + '</span>' + '<span style="font-weight:700;color:var(--err)">-' + (p.discountType === 'percent' ? p.discountValue + '%' : fmt(p.discountValue) + ' \u20B8') + '</span>' + '<span style="font-size:12px;color:var(--text-secondary)">' + p.startDate + ' \u2192 ' + p.endDate + '</span>' + '<div style="display:flex;gap:4px">' + '<button class="icon-btn" onclick="editPromotion(\'' + p.id + '\')">\u270F️</button>' + '<button class="icon-btn del" onclick="deletePromotion(\'' + p.id + '\')">\uD83D\uDDD1</button>' + '</div></div></div>';
    });
    html += '</div>';
    container.innerHTML = html;
}

function openPromotionEditor(id) {
    var products = getProducts();
    var sel = document.getElementById('promo-product');
    sel.innerHTML = '<option value="">-- Выберите товар --</option>' + products.map(function (p) {
        return '<option value="' + p.id + '">' + esc(p.code || '') + ' \u2014 ' + esc(p.name) + '</option>';
    }).join('');
    if (id) {
        var list = getPromotions();
        var p = list.find(function (x) {
            return x.id === id;
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
        var today = new Date().toISOString().slice(0, 10);
        document.getElementById('promo-start-date').value = today;
        var future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
        document.getElementById('promo-end-date').value = future;
        document.getElementById('promo-start-time').value = '00:00';
        document.getElementById('promo-end-time').value = '23:59';
    }
    openModal('modal-promotion-edit');
}

function savePromotion() {
    var id = document.getElementById('promo-edit-id').value;
    var productId = document.getElementById('promo-product').value;
    var discountType = document.getElementById('promo-discount-type').value;
    var discountValue = parseFloat(document.getElementById('promo-discount-value').value) || 0;
    var startDate = document.getElementById('promo-start-date').value;
    var endDate = document.getElementById('promo-end-date').value;
    var startTime = document.getElementById('promo-start-time').value || '00:00';
    var endTime = document.getElementById('promo-end-time').value || '23:59';
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
    var data = {
        productId: productId,
        discountType: discountType,
        discountValue: discountValue,
        startDate: startDate,
        endDate: endDate,
        startTime: startTime,
        endTime: endTime
    };
    var list = getPromotions();
    if (id) {
        list = list.map(function (p) {
            return p.id === id ? Object.assign({}, p, data) : p;
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
        var list = getPromotions().filter(function (p) {
            return p.id !== id;
        });
        setPromotions(list);
        renderPromotionsPage();
        toast('Акция удалена', 'ok');
    });
}




var _ex={};
try{_ex['getPromotions']=getPromotions}catch(e){}
try{_ex['setPromotions']=setPromotions}catch(e){}
try{_ex['getActivePromotions']=getActivePromotions}catch(e){}
try{_ex['renderPromotionsPage']=renderPromotionsPage}catch(e){}
try{_ex['openPromotionEditor']=openPromotionEditor}catch(e){}
try{_ex['savePromotion']=savePromotion}catch(e){}
try{_ex['editPromotion']=editPromotion}catch(e){}
try{_ex['deletePromotion']=deletePromotion}catch(e){}
return _ex;})();

// api-bridge
__mod['api-bridge']=(function(){
function _db() { return window.ApDb || null; }
function _ds() { return window.DataService || null; }

function getCategories() { var d = _db(); return d ? d.getCategories() : []; }
function getCustomers() { var d = _db(); return d ? d.getCustomers() : []; }
function setCustomers(arr) { var d = _db(); if (d) d.setCustomers(arr); }
function getDebtors() { var d = _db(); return d ? d.getDebtors() : []; }
function getExpenses() { var d = _db(); return d ? d.getExpenses() : []; }
function setExpenses(arr) { var d = _db(); if (d) d.setExpenses(arr); }
function getProducts() { var d = _ds(); return d ? d.get('products') : []; }
function setProducts(arr) { var d = _ds(); if (d) d.set('products', arr); }
function getSales() { var d = _db(); return d ? d.getSales() : []; }

var _ex={};
return _ex;})();

// utils
__mod['utils']=(function(){
var setPromotions=__mf('promotions','setPromotions');
var get=__mf('app-context','get');
var getSales=__mf('api-bridge','getSales');
var EAN_PARITY=__mv('constants','EAN_PARITY');
var getDebtors=__mf('api-bridge','getDebtors');
var setCustomers=__mf('api-bridge','setCustomers');
var setStore=__mf('store','setStore');
var getCustomerTier=__mf('customers','getCustomerTier');
var _qtyPopupProductId=__mv('products','_qtyPopupProductId');
var EAN_L=__mv('constants','EAN_L');
var _pendingPerms=__mv('store','_pendingPerms');
var EAN_G=__mv('constants','EAN_G');
var setProducts=__mf('api-bridge','setProducts');
var DEFAULT_PERMISSIONS=__mv('constants','DEFAULT_PERMISSIONS');
var _pendingSwitchUserId=__mv('users','_pendingSwitchUserId');
var setQtyPopupProductId=__mf('products','setQtyPopupProductId');
var applyUISettings=__mf('settings','applyUISettings');
var CODE39=__mv('constants','CODE39');
var scannerStream=__mv('store','scannerStream');
var currentStoreId=__mv('store','currentStoreId');
var currentPayment=__mv('sales','currentPayment');
var setExpenses=__mf('api-bridge','setExpenses');
var confirmCallback=__mv('store','confirmCallback');
var getCustomers=__mf('api-bridge','getCustomers');
var _scannerAutoClose=__mv('store','_scannerAutoClose');
var _bulkSelected=__mv('store','_bulkSelected');
var EXCEL_SECTIONS=__mv('constants','EXCEL_SECTIONS');
var getProducts=__mf('api-bridge','getProducts');
var currentUser=__mv('users','currentUser');
var setCurrentPayment=__mf('sales','setCurrentPayment');
var EAN_R=__mv('constants','EAN_R');
var saveUISettings=__mf('settings','saveUISettings');
var saleCart=__mv('cart','saleCart');
var _auditSession=__mv('auth','_auditSession');
var getExpenses=__mf('api-bridge','getExpenses');
var getPromotions=__mf('promotions','getPromotions');
var _importState=__mv('statistics','_importState');
var getCategories=__mf('api-bridge','getCategories');
var getUISettings=__mf('settings','getUISettings');
var _uiSettings=__mv('settings','_uiSettings');
var PAY_LABELS=__mv('sales','PAY_LABELS');
var PERMISSION_GROUPS=__mv('constants','PERMISSION_GROUPS');
var setImportState=__mf('statistics','setImportState');

function wrap(n, fb) { return function () { var s = ctx(n); return s ? s.apply(null, arguments) : (typeof fb === 'function' ? fb.apply(null, arguments) : undefined); }; }

var toast = wrap('toast');
var openModal = wrap('openModal');
var refreshAll = wrap('refreshAll');
var _reopenParentModal = wrap('_reopenParentModal');
var goPage = wrap('goPage');
var renderNotifications = wrap('renderNotifications');
var renderDashboard = wrap('renderDashboard');
var isSaleActive = wrap('isSaleActive');
var togglePaymentSection = wrap('togglePaymentSection');
var calcMixedRemainder = wrap('calcMixedRemainder');
var addAuditLog = wrap('addAuditLog');
var renderAuditSessionTable = wrap('renderAuditSessionTable');
var isExpenseActive = wrap('isExpenseActive');
var renderProducts = wrap('renderProducts');
var renderUnsoldProducts = wrap('renderUnsoldProducts');
var getOpenShiftForCashier = wrap('getOpenShiftForCashier');
var checkPermission = wrap('checkPermission');
var requireAdminPin = wrap('requireAdminPin');
var isAdmin = wrap('isAdmin');
var getUserMaxDiscount = wrap('getUserMaxDiscount');
var _permUserId = wrap('_permUserId');
var getUserData = wrap('getUserData');
var setUserPermissions = wrap('setUserPermissions');
var renderPermissionsEditor = wrap('renderPermissionsEditor');
var doSwitchUser = wrap('doSwitchUser');
var _findUserAnywhere = wrap('_findUserAnywhere');
var getSelectedCartItem = wrap('getSelectedCartItem');
var updateCartQty = wrap('updateCartQty');
var removeFromCart = wrap('removeFromCart');
var renderSaleCart = wrap('renderSaleCart');
var saveUserPin = wrap('saveUserPin');
var getUserPin = wrap('getUserPin');

function getCurrentStoreName() {
    var m = window.ApAuth && window.ApAuth.getCurrentStore();
    return m ? m.storeName : 'Магазин';
}

function normalizeCode(str) {
    return (str || '').trim().toUpperCase();
}

function levenshtein(a, b) {
    var m = [], i, j;
    for (i = 0; i <= b.length; i++)
        m[i] = [i];
    for (j = 0; j <= a.length; j++)
        m[0][j] = j;
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            m[i][j] = b[i - 1] === a[j - 1] ? m[i - 1][j - 1] : Math.min(m[i - 1][j - 1] + 1, Math.min(m[i][j - 1] + 1, m[i - 1][j] + 1));
        }
    }
    return m[b.length][a.length];
}

function generateSearchVariations(term) {
    var t = term.trim().toLowerCase();
    var results = [t];
    var ruToEn = {
        'й': 'q',
        'ц': 'w',
        'у': 'e',
        'к': 'r',
        'е': 't',
        'н': 'y',
        'г': 'u',
        'ш': 'i',
        'щ': 'o',
        'з': 'p',
        'х': '[',
        'ъ': ']',
        'ф': 'a',
        'ы': 's',
        'в': 'd',
        'а': 'f',
        'п': 'g',
        'р': 'h',
        'о': 'j',
        'л': 'k',
        'д': 'l',
        'ж': ';',
        'э': '\'',
        'я': 'z',
        'ч': 'x',
        'с': 'c',
        'м': 'v',
        'и': 'b',
        'т': 'n',
        'ь': 'm',
        'б': ',',
        'ю': '.',
        'ё': '`',
        ' ': ' '
    };
    var enToRu = {
        'q': 'й',
        'w': 'ц',
        'e': 'у',
        'r': 'к',
        't': 'е',
        'y': 'н',
        'u': 'г',
        'i': 'ш',
        'o': 'щ',
        'p': 'з',
        '[': 'х',
        ']': 'ъ',
        'a': 'ф',
        's': 'ы',
        'd': 'в',
        'f': 'а',
        'g': 'п',
        'h': 'р',
        'j': 'о',
        'k': 'л',
        'l': 'д',
        ';': 'ж',
        '\'': 'э',
        'z': 'я',
        'x': 'ч',
        'c': 'с',
        'v': 'м',
        'b': 'и',
        'n': 'т',
        'm': 'ь',
        ',': 'б',
        '.': 'ю',
        '`': 'ё',
        ' ': ' '
    };
    var hasEnglish = /[a-zA-Z]/.test(t);
    var hasRussian = /[а-яА-ЯёЁ]/.test(t);
    if (hasEnglish && !hasRussian) {
        var translit = '';
        for (var i = 0; i < t.length; i++) {
            translit += enToRu[t[i]] || t[i];
        }
        if (translit !== t)
            results.push(translit);
    }
    if (hasRussian && !hasEnglish) {
        var translit2 = '';
        for (var j = 0; j < t.length; j++) {
            translit2 += ruToEn[t[j]] || t[j];
        }
        if (translit2 !== t)
            results.push(translit2);
    }
    var mixed = '';
    var mixedMap = {
        'c': 'к',
        'e': 'е',
        'o': 'о',
        'a': 'а',
        'k': 'к',
        'm': 'м',
        't': 'т'
    };
    for (var k = 0; k < t.length; k++) {
        mixed += mixedMap[t[k]] || t[k];
    }
    if (mixed !== t)
        results.push(mixed);
    return results;
}

function generateEAN13(seed) {
    var s = String(200000000000 + seed % 99999999999);
    while (s.length < 12)
        s = '0' + s;
    var sum = 0;
    for (var i = 0; i < 12; i++) {
        sum += parseInt(s[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    var check = (10 - sum % 10) % 10;
    return s + check;
}

function drawEan13Svg(text, modW, barH) {
    modW = modW || 2;
    barH = barH || 60;
    var guardH = barH + Math.round(barH * 0.1);
    var digits = String(text).replace(/\D/g, '');
    while (digits.length < 13)
        digits = '0' + digits;
    digits = digits.substring(0, 13);
    var bits = '101';
    var firstDigit = parseInt(digits[0]);
    var parity = EAN_PARITY[firstDigit];
    for (var i = 0; i < 6; i++) {
        var d = parseInt(digits[i + 1]);
        bits += parity[i] === 'L' ? EAN_L[d] : EAN_G[d];
    }
    bits += '01010';
    for (var i = 0; i < 6; i++) {
        var d = parseInt(digits[i + 7]);
        bits += EAN_R[d];
    }
    bits += '101';
    var totalW = bits.length * modW;
    var quiet = modW * 10;
    var svgW = totalW + quiet * 2;
    var svgH = barH + 18;
    var rects = [];
    for (var i = 0; i < bits.length; i++) {
        if (bits[i] === '1') {
            var isGuard = i < 3 || i >= 45 && i < 50 || i >= 92;
            var h = isGuard ? guardH : barH;
            rects.push('<rect x="' + (quiet + i * modW) + '" y="0" width="' + modW + '" height="' + h + '" fill="#000"/>');
        }
    }
    var textY = barH + 10;
    var fontSize = Math.max(8, modW * 6);
    var smallFontSize = Math.max(6, modW * 5);
    var x1 = quiet - modW * 2;
    var leftStart = quiet + 3 * modW;
    var leftSpan = 42 * modW;
    var rightStart = quiet + 50 * modW;
    var rightSpan = 42 * modW;
    var textHtml = '';
    textHtml += '<text x="' + x1 + '" y="' + textY + '" font-size="' + fontSize + '" font-family="Arial,sans-serif" text-anchor="end">' + digits[0] + '</text>';
    for (var i = 0; i < 6; i++) {
        var cx = leftStart + (i * 7 + 3.5) * modW;
        textHtml += '<text x="' + cx + '" y="' + textY + '" font-size="' + smallFontSize + '" font-family="Arial,sans-serif" text-anchor="middle">' + digits[i + 1] + '</text>';
    }
    for (var i = 0; i < 6; i++) {
        var cx = rightStart + (i * 7 + 3.5) * modW;
        textHtml += '<text x="' + cx + '" y="' + textY + '" font-size="' + smallFontSize + '" font-family="Arial,sans-serif" text-anchor="middle">' + digits[i + 7] + '</text>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgW + '" height="' + svgH + '" viewBox="0 0 ' + svgW + ' ' + svgH + '" shape-rendering="crispEdges">' + '<rect x="0" y="0" width="' + svgW + '" height="' + svgH + '" fill="#fff"/>' + rects.join('') + textHtml + '</svg>';
}

function drawCode39Svg(text, scale, heightScale) {
    scale = scale || 1;
    heightScale = heightScale || scale;
    var enc = '*' + String(text).toUpperCase().replace(/[^0-9A-Z\-\.\ \$\/\+\%]/g, '') + '*';
    var narrow = 2 * scale, wide = 6 * scale, height = 40 * heightScale, x = 2 * scale, rects = [];
    for (var i = 0; i < enc.length; i++) {
        var pat = CODE39[enc[i]];
        if (!pat)
            continue;
        for (var j = 0; j < 9; j++) {
            var w = pat[j] === 'w' ? wide : narrow;
            if (j % 2 === 0)
                rects.push('<rect x="' + x + '" y="' + 1 * heightScale + '" width="' + w + '" height="' + (height - 2 * heightScale) + '" fill="#000"/>');
            x += w;
        }
        x += narrow;
    }
    var totalW = x + 2 * scale;
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + totalW + '" height="' + height + '" viewBox="0 0 ' + totalW + ' ' + height + '" shape-rendering="crispEdges">' + rects.join('') + '</svg>';
}

function updateMarkup() {
    var purchase = parseFloat(document.getElementById('product-purchase').value) || 0;
    var price = parseFloat(document.getElementById('product-price').value) || 0;
    var el = document.getElementById('markup-display');
    if (!el)
        return;
    if (purchase <= 0) {
        el.textContent = price > 0 ? 'Наценка: \u221E' : 'Наценка: \u2014';
        el.style.color = 'var(--muted)';
        return;
    }
    var pct = ((price - purchase) / purchase * 100).toFixed(1);
    var isNeg = pct < 0;
    el.textContent = 'Наценка: ' + (isNeg ? '' : '+') + pct + '%';
    el.style.color = isNeg ? 'var(--err)' : 'var(--ok)';
    el.style.background = isNeg ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.1)';
}

function fmt(n) {
    return (Number(n) || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtShort(n) {
    return (Number(n) || 0).toLocaleString('ru-RU');
}

function fmtDate(d) {
    if (!d) return '';
    var dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDateTime(d) {
    if (!d) return '';
    var dt = new Date(d);
    if (isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function esc(s) {
    return escapeHtml(s);
}

function todayStr() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
}

function getFieldValue(obj, field) {
    if (!obj || field == null)
        return '';
    if (field === '_categoryName') {
        var cat = getCategories().find(function (c) {
            return c.id === obj.category;
        });
        return cat ? cat.name : '';
    }
    if (field === '_status')
        return obj.status === 'cancelled' || obj.status === 'returned' ? 'Отменён' : 'Активен';
    if (field === '_saleStatus')
        return isSaleActive(obj) ? 'Завершена' : 'Отменена';
    if (field === '_expenseStatus')
        return isExpenseActive(obj) ? 'Активен' : 'Отменён';
    if (field === '_docNum')
        return (obj.receiptId || obj.id || '').slice(-6);
    if (field === '_customerName') {
        if (obj.customerName)
            return obj.customerName;
        if (obj.customerId) {
            var c = getCustomers().find(function (x) {
                return x.id === obj.customerId;
            });
            return c ? c.name : '';
        }
        return '';
    }
    if (field === '_paymentLabel')
        return PAY_LABELS[obj.payment] || obj.payment || '';
    if (field === '_docType')
        return obj.docType === 'invoice' ? 'Счёт' : obj.docType === 'z2' ? 'З-2' : obj.docType || '';
    if (field === '_docStatus')
        return obj.status === 'pending' ? 'Ожидает' : obj.status === 'paid' ? 'Оплачено' : obj.status === 'issued' ? 'Выписано' : 'Отменено';
    if (field === '_createdByName')
        return obj.createdByName || obj.userName || '';
    if (field === '_tierName') {
        var t = getCustomerTier(Number(obj.spent) || 0);
        return t ? t.name : '';
    }
    if (field === '_lastPurchase') {
        if (!obj.id)
            return '';
        var lastSale = getSales().filter(isSaleActive).filter(function (s) {
            return s.customerId === obj.id;
        }).sort(function (a, b) {
            return (b.date || '').localeCompare(a.date || '');
        });
        return lastSale.length ? lastSale[0].date : '';
    }
    if (field === '_debtorPhone' || field === '_debtorRating') {
        var debtors = window.getDebtors ? getDebtors() : [];
        var debtor = debtors.find(function (d) {
            return d.id === obj.debtorId;
        });
        if (field === '_debtorPhone')
            return debtor ? debtor.phone : '';
        return debtor ? debtor.rating : '';
    }
    if (field === '_profit')
        return Number(obj.revenue || 0) - Number(obj.cogs || 0);
    if (field === '_share') {
        var share = window._cashierShare || 5;
        return (Number(obj.revenue || 0) * share / 100).toFixed(0);
    }
    if (field === 'supplier')
        return obj.supplier || '';
    var val = obj[field];
    return val !== null && val !== undefined ? val : '';
}

async function createExcelWorkbook(headers, rows, widths, sheetName, numFmts) {
    if (typeof ExcelJS !== 'undefined') {
        var wb = new ExcelJS.Workbook();
        wb.creator = 'SANAQ';
        wb.created = new Date();
        var ws = wb.addWorksheet(sheetName || 'Данные', { views: [{ showGridLines: false }] });
        ws.properties.defaultRowHeight = 20;
        var headerStyle = {
            font: {
                name: 'Arial',
                size: 10,
                bold: true,
                color: { argb: 'FFFFFFFF' }
            },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1F2937' }
            },
            alignment: {
                horizontal: 'center',
                vertical: 'middle',
                wrapText: true
            },
            border: {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            }
        };
        var headerRow = ws.addRow(headers);
        headerRow.height = 28;
        headerRow.eachCell(function (cell) {
            styleExcelCell(cell, headerStyle);
        });
        var alt = false;
        rows.forEach(function (rowData) {
            var row = ws.addRow(rowData);
            row.eachCell(function (cell, colIdx) {
                var fmt = numFmts && numFmts[colIdx - 1];
                var isNum = fmt === '#,##0' || fmt === '#,##0.00' || fmt === '#,##0.0';
                styleExcelCell(cell, {
                    font: {
                        name: 'Arial',
                        size: 10
                    },
                    alignment: {
                        vertical: 'middle',
                        wrapText: true,
                        horizontal: isNum ? 'right' : 'left'
                    },
                    fill: alt ? {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF9FAFB' }
                    } : {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFFFF' }
                    },
                    border: {
                        top: {
                            style: 'thin',
                            color: { argb: 'FFE5E7EB' }
                        },
                        left: {
                            style: 'thin',
                            color: { argb: 'FFE5E7EB' }
                        },
                        bottom: {
                            style: 'thin',
                            color: { argb: 'FFE5E7EB' }
                        },
                        right: {
                            style: 'thin',
                            color: { argb: 'FFE5E7EB' }
                        }
                    }
                });
                if (fmt && fmt.indexOf('dd.') !== 0 && fmt !== 's') {
                    cell.numFmt = fmt;
                }
            });
            alt = !alt;
        });
        widths.forEach(function (w, i) {
            ws.getColumn(i + 1).width = w;
        });
        var buffer;
        try { buffer = await wb.xlsx.writeBuffer(); } catch (e) { throw new Error('Excel write failed: ' + e.message); }
        return buffer;
    }
    if (typeof XLSX !== 'undefined') {
        var data = [headers].concat(rows);
        var ws2 = XLSX.utils.aoa_to_sheet(data);
        ws2['!cols'] = widths.map(function (w) {
            return { wch: w };
        });
        var wb2 = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb2, ws2, sheetName || 'Данные');
        var out = XLSX.write(wb2, {
            bookType: 'xlsx',
            type: 'buffer'
        });
        return out;
    }
    throw new Error('Excel библиотеки не загружены');
}

function styleExcelCell(cell, opts) {
    if (opts.font)
        cell.font = opts.font;
    if (opts.fill)
        cell.fill = opts.fill;
    if (opts.alignment)
        cell.alignment = opts.alignment;
    if (opts.border)
        cell.border = opts.border;
    if (opts.numFmt)
        cell.numFmt = opts.numFmt;
}

function saveExcelBuffer(buffer, filename) {
    var blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

async function downloadExcelTemplate(section) {
    var cfg = EXCEL_SECTIONS[section];
    if (!cfg) {
        toast('Неизвестный раздел', 'err');
        return;
    }
    var emptyRow = cfg.fields.map(function () {
        return '';
    });
    try {
        var buffer = await createExcelWorkbook(cfg.headers, [emptyRow], cfg.widths, cfg.label);
        saveExcelBuffer(buffer, 'Шаблон_' + cfg.label + '_' + todayStr() + '.xlsx');
        toast('Шаблон скачан', 'ok');
    } catch (e) { toast('Ошибка скачивания шаблона: ' + e.message, 'err'); }
}

function readExcelFile(file, section) {
    if (!file)
        return;
    if (_importState && _importState.section) {
        toast('Импорт уже выполняется. Дождитесь завершения.', 'err');
        return;
    }
    var cfg = EXCEL_SECTIONS[section];
    if (!cfg) {
        toast('Неизвестный раздел', 'err');
        return;
    }
    setImportState({ section: section, rawData: null, colMap: null, rows: null, fileName: file.name });
    var reader = new FileReader();
    reader.onload = function (e) {
        try {
            var opts = { type: 'array' };
            var name = file.name.toLowerCase();
            if (name.endsWith('.csv')) {
                var text = new TextDecoder('utf-8').decode(e.target.result);
                var wb = XLSX.read(text, {
                    type: 'string',
                    raw: true
                });
            } else {
                var wb = XLSX.read(e.target.result, opts);
            }
            var ws = wb.Sheets[wb.SheetNames[0]];
            if (!ws) {
                toast('Файл не содержит листов', 'err');
                _importState.section = null;
                return;
            }
            var raw = XLSX.utils.sheet_to_json(ws, {
                header: 1,
                defval: ''
            });
            if (raw.length < 2) {
                toast('Файл не содержит данных', 'err');
                _importState.section = null;
                return;
            }
            showImportPreview(section, raw, file.name);
        } catch (err) {
            toast('Ошибка чтения файла: ' + (err.message || err), 'err');
            _importState.section = null;
        }
    };
    if (file.name.toLowerCase().endsWith('.csv')) {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function showImportPreview(section, rawData, fileName) {
    var cfg = EXCEL_SECTIONS[section];
    if (!cfg) {
        _importState.section = null;
        return;
    }
    var headers = rawData[0] || [];
    var dataRows = rawData.slice(1).filter(function (r) {
        return r.some(function (c) {
            return c !== '';
        });
    });
    if (dataRows.length === 0) {
        toast('Нет данных для импорта', 'err');
        _importState.section = null;
        return;
    }
    var colMap = {};
    var missing = [];
    cfg.fields.forEach(function (field) {
        var fieldIdx = cfg.fields.indexOf(field);
        if (fieldIdx < 0)
            return;
        var expected = cfg.headers[fieldIdx] || '';
        var hdrIdx = -1;
        headers.forEach(function (h, i) {
            if (String(h).toLowerCase().trim() === expected.toLowerCase().trim())
                hdrIdx = i;
        });
        if (hdrIdx < 0) {
            headers.forEach(function (h, i) {
                if (hdrIdx >= 0)
                    return;
                if (String(h).toLowerCase().indexOf(expected.toLowerCase().slice(0, 4)) >= 0)
                    hdrIdx = i;
            });
        }
        if (hdrIdx >= 0)
            colMap[field] = hdrIdx;
    });
    cfg.required.forEach(function (field) {
        if (colMap[field] === undefined)
            missing.push(cfg.headers[cfg.fields.indexOf(field)] || field);
    });
    if (missing.length) {
        toast('Не найдены обязательные колонки: ' + missing.join(', '), 'err');
        return;
    }
    setImportState({
        section: section,
        rawData: rawData,
        colMap: colMap,
        headers: headers,
        rows: dataRows,
        fileName: fileName
    });
    var previewHtml = '<div style="max-height:400px;overflow-y:auto">';
    previewHtml += '<table><thead><tr>';
    cfg.headers.forEach(function (h) {
        previewHtml += '<th>' + escapeHtml(h) + '</th>';
    });
    previewHtml += '</tr></thead><tbody>';
    var maxPreview = Math.min(dataRows.length, 20);
    for (var i = 0; i < maxPreview; i++) {
        previewHtml += '<tr>';
        cfg.fields.forEach(function (field) {
            var colIdx = colMap[field];
            previewHtml += '<td>' + escapeHtml(colIdx >= 0 ? dataRows[i][colIdx] : '') + '</td>';
        });
        previewHtml += '</tr>';
    }
    if (dataRows.length > maxPreview)
        previewHtml += '<tr><td colspan="' + cfg.headers.length + '" style="text-align:center;color:var(--muted)">... и ещё ' + (dataRows.length - maxPreview) + ' строк</td></tr>';
    previewHtml += '</tbody></table></div>';
    document.getElementById('import-preview-title').textContent = 'Импорт: ' + cfg.label;
    document.getElementById('import-preview-info').textContent = 'Файл: ' + fileName + ' | Найдено строк: ' + dataRows.length;
    document.getElementById('import-preview-table').innerHTML = previewHtml;
    document.getElementById('import-preview-confirm').onclick = function () {
        confirmImport();
    };
    openModal('modal-import-preview');
}

function confirmImport() {
    var state = _importState;
    if (!state || !state.section) {
        toast('Нет данных для импорта', 'err');
        return;
    }
    var cfg = EXCEL_SECTIONS[state.section];
    if (!cfg)
        return;
    var colMap = state.colMap;
    var dataRows = state.rows;
    var success = 0, errors = 0;
    dataRows.forEach(function (row) {
        try {
            var item = {};
            Object.keys(colMap).forEach(function (field) {
                var colIdx = colMap[field];
                if (colIdx >= 0)
                    item[field] = row[colIdx] !== undefined && row[colIdx] !== null ? String(row[colIdx]).trim() : '';
            });
            if (state.section === 'products') {
                if (!item.barcode && !item.code && !item.name) {
                    errors++;
                    return;
                }
                var existing = getProducts();
                var dup = null;
                if (item.barcode)
                    dup = existing.find(function (p) {
                        return p.barcode === item.barcode;
                    });
                if (!dup && item.code)
                    dup = existing.find(function (p) {
                        return p.code === item.code;
                    });
                if (dup) {
                    if (item.name)
                        dup.name = item.name;
                    if (item.category)
                        dup.category = item.category;
                    if (item.unit)
                        dup.unit = item.unit;
                    if (item.quantity !== '')
                        dup.quantity = Number(item.quantity) || 0;
                    if (item.price !== '')
                        dup.price = Number(item.price) || 0;
                    if (item.purchasePrice !== '')
                        dup.purchasePrice = Number(item.purchasePrice) || 0;
                    if (item.minStock !== '')
                        dup.minStock = Number(item.minStock) || 0;
                    if (item.supplier)
                        dup.supplier = item.supplier;
                    if (item.description)
                        dup.description = item.description;
                    if (item.barcode)
                        dup.barcode = item.barcode;
                    if (item.code)
                        dup.code = item.code;
                    setProducts(existing);
                } else {
                    existing.push({
                        id: uid(),
                        barcode: item.barcode || '',
                        code: item.code || '',
                        name: item.name || '',
                        category: item.category || '',
                        unit: item.unit || 'шт',
                        quantity: Number(item.quantity) || 0,
                        minStock: Number(item.minStock) || 0,
                        purchasePrice: Number(item.purchasePrice) || 0,
                        price: Number(item.price) || 0,
                        supplier: item.supplier || '',
                        description: item.description || '',
                        favorite: false
                    });
                    setProducts(existing);
                }
                success++;
            } else if (state.section === 'customers') {
                if (!item.phone) {
                    errors++;
                    return;
                }
                var customers = getCustomers();
                var dupC = customers.find(function (c) {
                    return (c.phone || '').replace(/\D/g, '') === item.phone.replace(/\D/g, '');
                });
                if (!dupC) {
                    customers.push({
                        id: uid(),
                        name: item.name || '',
                        phone: item.phone,
                        spent: 0,
                        bonusBalance: 0
                    });
                    setCustomers(customers);
                }
                success++;
            } else if (state.section === 'expenses') {
                if (!item.category || !item.amount) {
                    errors++;
                    return;
                }
                var expenses = getExpenses();
                expenses.push({
                    id: uid(),
                    category: item.category,
                    amount: Number(item.amount),
                    date: new Date().toISOString(),
                    description: item.description || '',
                    userName: currentUser ? currentUser.name : '',
                    status: 'active'
                });
                setExpenses(expenses);
                success++;
            } else {
                toast('Импорт для раздела "' + cfg.label + '" в разработке', 'warn');
                return;
            }
        } catch (e) {
            errors++;
        }
    });
    closeModal('modal-import-preview');
    toast('Импорт завершён: ' + success + ' успешно' + (errors ? ', ' + errors + ' ошибок' : ''), errors ? 'warn' : 'ok');
    refreshAll();
    setImportState({
        section: null,
        rawData: null,
        rows: null
    });
}

function isToday(iso) {
    return iso && iso.slice(0, 10) === todayStr();
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
    if (id === 'modal-confirm') {
        document.getElementById('confirm-ok').textContent = 'Удалить';
        document.getElementById('confirm-ok').className = 'btn btn-danger';
    }
    if (id === 'modal-doc-templates' && typeof _reopenParentModal === 'function') {
        _reopenParentModal();
    }
}

function toggleSidebar() {
    var s = document.querySelector('.sidebar');
    var btn = document.getElementById('sidebar-collapse-btn');
    if (!s)
        return;
    s.classList.toggle('collapsed');
    var collapsed = s.classList.contains('collapsed');
    if (btn)
        btn.innerHTML = collapsed ? '<i data-lucide="panel-left"></i>' : '<i data-lucide="panel-left-close"></i>';
    if (typeof lucide !== 'undefined')
        lucide.createIcons();
    if (window.ApDb)
        window.ApDb.set('sidebarCollapsed', collapsed);
}

function toggleDashLowStock() {
    var el = document.getElementById('dash-lowstock');
    var btn = document.querySelector('#panel-dash-lowstock .collapse-btn');
    if (!el)
        return;
    var hidden = el.style.display === 'none';
    el.style.display = hidden ? '' : 'none';
    if (btn)
        btn.innerHTML = hidden ? '\u25B2' : '\u25BC';
    if (window.ApDb)
        window.ApDb.set('dashLowStockHidden', !hidden);
}

function confirmAction(title, msg, onOk) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').textContent = msg;
    setStore('confirmCallback', onOk);
    openModal('modal-confirm');
}

function showSupabaseLogin() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('auth-screen').style.display = 'flex';
    window.ApScreens.showScreen('auth-login');
}

function getPeriodDateRange(period) {
    var now = new Date();
    var start;
    if (period === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
        var d = now.getDay();
        var diff = d === 0 ? 6 : d - 1;
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
    } else if (period === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
        start = new Date(0);
    }
    return {
        start: start,
        end: now
    };
}

function filterByPeriod(arr, dateField, period) {
    if (period === 'all')
        return arr;
    var range = getPeriodDateRange(period);
    return (arr || []).filter(function (x) {
        var d = new Date(x[dateField] || x.date || 0);
        return d >= range.start && d <= range.end;
    });
}

function card(label, value, cls) {
    return '<div class="card ' + cls + '"><div class="card-label">' + label + '</div><div class="card-value">' + value + '</div></div>';
}

function finCard(label, value, cls) {
    return '<div class="card ' + cls + '" style="text-align:center"><div class="card-label">' + label + '</div><div style="font-size:20px;font-weight:700;margin-top:8px">' + value + '</div></div>';
}

function setPayment(btn) {
    document.querySelectorAll('.pay-btn, .pos-pay-btn, .pos-pay-strip button').forEach(function (b) {
        b.classList.remove('active');
    });
    btn.classList.add('active');
    setCurrentPayment(btn.dataset.pay);
    togglePaymentSection('cash-change-wrap', currentPayment === 'cash');
    togglePaymentSection('mixed-payment-wrap', currentPayment === 'mixed');
    togglePaymentSection('debt-payment-wrap', currentPayment === 'debt');
    var totalEl = document.getElementById('sale-total');
    var finalTotal = totalEl ? parseFloat(totalEl.dataset.value || totalEl.value || 0) : 0;
    if (currentPayment === 'cash') {
        var cg = document.getElementById('cash-given');
        if (cg)
            cg.value = '';
        var cc = document.getElementById('cash-change');
        if (cc)
            cc.value = '';
    }
    if (currentPayment === 'mixed') {
        var mc = document.getElementById('mixed-cash');
        var mk = document.getElementById('mixed-kaspi');
        var mt = document.getElementById('mixed-transfer');
        var mcg = document.getElementById('mixed-cash-given');
        var mcc = document.getElementById('mixed-cash-change');
        if (mc)
            mc.value = finalTotal;
        if (mk)
            mk.value = 0;
        if (mt)
            mt.value = 0;
        if (mcg)
            mcg.value = '';
        if (mcc)
            mcc.value = '';
        calcMixedRemainder();
    }
}

function adjustSelectedQty(delta) {
    var item = getSelectedCartItem();
    if (!item) {
        toast('Выберите товар в таблице', 'warn');
        return;
    }
    updateCartQty(item.id, delta);
}

function removeSelectedItem() {
    var item = getSelectedCartItem();
    if (!item) {
        toast('Выберите товар в таблице', 'warn');
        return;
    }
    if (!confirm('Удалить "' + item.name + '" из чека?'))
        return;
    removeFromCart(item.id);
}

function checkSelectedPrice() {
    var item = getSelectedCartItem();
    if (!item) {
        toast('Выберите товар в таблице', 'warn');
        return;
    }
    toast('\uD83D\uDCB0 ' + item.name + ': ' + fmt(item.price) + ' \u20B8 \xD7 ' + item.qty + ' = ' + fmt(item.price * item.qty) + ' \u20B8', 'ok');
}

function focusSearch() {
    var el = document.getElementById('sale-search');
    if (el) {
        el.focus();
        el.select();
    }
}

function toggleFavoriteFromTable(productId, e) {
    if (e)
        e.stopPropagation();
    var products = getProducts();
    var p = products.find(function (x) {
        return x.id === productId;
    });
    if (!p)
        return;
    p.favorite = !p.favorite;
    setProducts(products);
    renderProducts();
    posRefreshFavorites();
}

function posRefreshFavorites() {
    var container = document.getElementById('pos-cat-strip');
    if (!container) return;
    var favBtn = container.querySelector('button[data-cat-id="__favorites__"]');
    renderPosCatBrowser();
    if (favBtn && favBtn.classList.contains('active')) {
        filterCategory('__favorites__');
    }
}

function openPaymentModal() {
    if (!saleCart.length) {
        toast('Корзина пуста', 'err');
        return;
    }
    var shift = getOpenShiftForCashier(currentUser.id) || getOpenShiftForCashier(currentUser.username);
    if (!shift) {
        toast('Смена (касса) не открыта. Сначала откройте смену.', 'err');
        goPage('myshift');
        return;
    }
    var totalEl = document.getElementById('sale-total');
    var total = totalEl ? parseFloat(totalEl.dataset.value || totalEl.value || 0) : 0;
    if (total <= 0) {
        toast('Сумма чека 0', 'err');
        return;
    }
    var payBtns = document.querySelectorAll('#modal-pos-payment .pos-pay-strip button');
    if (payBtns.length) {
        setPayment(payBtns[0]);
    }
    openModal('modal-pos-payment');
    setTimeout(function () {
        var cg = document.getElementById('cash-given');
        if (cg)
            cg.focus();
    }, 200);
}

function toggleItemDiscountValue() {
    var type = document.getElementById('item-discount-type').value;
    var input = document.getElementById('item-discount-value');
    if (type === 'percent') {
        input.max = 100;
        input.placeholder = 'Например: 10';
    } else {
        input.max = 999999;
        input.placeholder = 'Например: 500';
    }
}

function stopTracks(stream) {
    try {
        stream.getTracks().forEach(function (t) {
            t.stop();
        });
    } catch (e) {
    }
}

function switchUnsoldPeriod(days) {
    document.querySelectorAll('[data-unsold]').forEach(function (b) {
        b.classList.toggle('active', parseInt(b.dataset.unsold) === days);
    });
    renderUnsoldProducts(days);
}

function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
}

function switchAuditsTab(tab) {
    document.querySelectorAll('#page-audits .tabs .tab').forEach(function (b) {
        b.classList.toggle('active', b.dataset.atab === tab);
    });
    var wo = document.getElementById('atab-writeoffs');
    var rec = document.getElementById('atab-reconciliation');
    if (wo)
        wo.classList.toggle('hidden', tab !== 'writeoffs');
    if (rec)
        rec.classList.toggle('hidden', tab !== 'reconciliation');
}

function onWoSearch() {
    var q = document.getElementById('wo-product-search').value.trim().toLowerCase();
    var results = document.getElementById('wo-search-results');
    if (!q || q.length < 1) {
        results.classList.add('hidden');
        return;
    }
    var products = getProducts().filter(function (p) {
        return p.name.toLowerCase().indexOf(q) >= 0 || (p.code || '').toLowerCase().indexOf(q) >= 0 || (p.barcode || '').indexOf(q) >= 0;
    }).slice(0, 10);
    if (!products.length) {
        results.innerHTML = '<div class="sale-result-item" style="color:var(--muted)">Ничего не найдено</div>';
        results.classList.remove('hidden');
        return;
    }
    results.innerHTML = products.map(function (p) {
        return '<div class="sale-result-item" onclick="selectWoProduct(\'' + p.id + '\')">' + '<span class="code-tag">' + (p.code || '') + '</span> ' + p.name + ' <span style="color:var(--muted);font-size:12px">(ост: ' + p.quantity + ')</span></div>';
    }).join('');
    results.classList.remove('hidden');
}

function updateAuditQty(idx, val) {
    if (!_auditSession)
        return;
    _auditSession.items[idx].qtyFact = parseFloat(val) || 0;
    renderAuditSessionTable();
}

function tableHTML(headers, rows) {
    let h = '<table><thead><tr>';
    headers.forEach(function (c) {
        h += '<th>' + c + '</th>';
    });
    h += '</tr></thead><tbody>';
    rows.forEach(function (row) {
        h += '<tr>';
        row.forEach(function (c) {
            h += '<td>' + c + '</td>';
        });
        h += '</tr>';
    });
    return h + '</tbody></table>';
}

function showPaymentMethodModal(callback) {
    var existing = document.getElementById('payment-method-modal');
    if (existing)
        existing.remove();
    var overlay = document.createElement('div');
    overlay.id = 'payment-method-modal';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = '<div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:24px 32px;box-shadow:0 8px 30px rgba(0,0,0,0.3);max-width:400px;width:90%">' + '<div style="font-size:16px;font-weight:600;margin-bottom:16px">Выберите способ оплаты</div>' + '<div style="display:flex;flex-direction:column;gap:8px">' + '<button class="btn btn-success btn-lg" onclick="window.selectPaymentMethod(\'cash\')" style="padding:14px;font-size:16px">\uD83D\uDCB5 Наличные</button>' + '<button class="btn btn-lg" onclick="window.selectPaymentMethod(\'kaspi\')" style="padding:14px;font-size:16px;background:#E53935;color:#fff">\uD83D\uDCF1 Kaspi QR</button>' + '<button class="btn btn-primary btn-lg" onclick="window.selectPaymentMethod(\'transfer\')" style="padding:14px;font-size:16px">\uD83C\uDFE6 Банк</button>' + '</div>' + '<button class="btn btn-secondary" style="width:100%;margin-top:12px" onclick="document.getElementById(\'payment-method-modal\').remove()">Отмена</button>' + '</div>';
    document.body.appendChild(overlay);
    window.selectPaymentMethod = function (method) {
        document.getElementById('payment-method-modal').remove();
        delete window.selectPaymentMethod;
        callback(method);
    };
}

function classicAmountWords(n) {
    var w = Math.floor(Math.abs(n || 0));
    var units = [
        '',
        'один',
        'два',
        'три',
        'четыре',
        'пять',
        'шесть',
        'семь',
        'восемь',
        'девять'
    ];
    var teens = [
        'десять',
        'одиннадцать',
        'двенадцать',
        'тринадцать',
        'четырнадцать',
        'пятнадцать',
        'шестнадцать',
        'семнадцать',
        'восемнадцать',
        'девятнадцать'
    ];
    var tens = [
        '',
        '',
        'двадцать',
        'тридцать',
        'сорок',
        'пятьдесят',
        'шестьдесят',
        'семьдесят',
        'восемьдесят',
        'девяносто'
    ];
    var hundreds = [
        '',
        'сто',
        'двести',
        'триста',
        'четыреста',
        'пятьсот',
        'шестьсот',
        'семьсот',
        'восемьсот',
        'девятьсот'
    ];
    function numWords(num) {
        if (num === 0)
            return '';
        var res = '';
        if (num >= 1000) {
            res += numWords(Math.floor(num / 1000)) + ' тысяча ';
            num %= 1000;
        }
        if (num >= 100) {
            res += hundreds[Math.floor(num / 100)] + ' ';
            num %= 100;
        }
        if (num >= 20) {
            res += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        } else if (num >= 10) {
            res += teens[num - 10] + ' ';
            return res;
        }
        if (num > 0)
            res += units[num] + ' ';
        return res;
    }
    var t = w % 100, f = t >= 11 && t <= 14 ? 'тенге' : w % 10 === 1 ? 'тенге' : w % 10 >= 2 && w % 10 <= 4 ? 'тенге' : 'тенге';
    var text = (w === 0 ? 'ноль ' : numWords(w)) + f;
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function _setPerm(permName, val) {
    var uid = _permUserId();
    if (!uid) {
        if (!_pendingPerms)
            setStore('_pendingPerms', Object.assign({}, DEFAULT_PERMISSIONS));
        _pendingPerms[permName] = val;
        return;
    }
    var data = getUserData(uid);
    data.permissions[permName] = val;
    setUserPermissions(uid, data);
}

function selectAllInGroup(group, on) {
    var keys = PERMISSION_GROUPS[group] || [];
    keys.forEach(function (k) {
        _setPerm(k, on);
    });
    renderPermissionsEditor(_permUserId());
}

function applyTemplateIndex(idx) {
    closeModal('modal-custom');
    try {
        var templates = (window.ApDb && window.ApDb.getAppData && window.ApDb.getAppData('perm_templates')) || JSON.parse(localStorage.getItem('sanaq_perm_templates_' + (currentStoreId || '')) || '[]');
        var tpl = templates[idx];
        if (!tpl)
            return;
        var targetId = _permUserId();
        if (!targetId) {
            setStore('_pendingPerms', Object.assign({}, tpl.permissions));
            renderPermissionsEditor(null);
            toast('Шаблон "' + tpl.name + '" применён (будет при создании)', 'ok');
            return;
        }
        var data = getUserData(targetId);
        data.permissions = Object.assign({}, tpl.permissions);
        setUserPermissions(targetId, data);
        renderPermissionsEditor(targetId);
        toast('Шаблон "' + tpl.name + '" применён', 'ok');
    } catch (e) {
        toast('Ошибка применения шаблона', 'err');
    }
}

function togglePromoDiscountType() {
}

function toggleNotifCenter() {
    var panel = document.getElementById('notif-panel');
    if (panel.style.display === 'flex') {
        panel.style.display = 'none';
        return;
    }
    panel.style.display = 'flex';
    renderNotifications();
}

function restoreSidebar() {
    getUISettings();
    if (!_uiSettings.visibility)
        _uiSettings.visibility = {};
    _uiSettings.visibility.sidebar = true;
    saveUISettings();
    applyUISettings();
    toast('Боковое меню восстановлено', 'ok');
}

function toggleBulkSelectAll(cb) {
    document.querySelectorAll('.bulk-item').forEach(function (el) {
        el.checked = cb.checked;
        if (cb.checked)
            _bulkSelected.add(el.dataset.id);
        else
            _bulkSelected.delete(el.dataset.id);
    });
    updateBulkBar();
}

function updateBulkBar() {
    var count = _bulkSelected.size;
    var bar = document.getElementById('bulk-bar');
    var counter = document.getElementById('bulk-count');
    if (counter)
        counter.textContent = count;
    if (bar)
        bar.style.display = count > 0 ? 'flex' : 'none';
}

function clearBulkSelection() {
    _bulkSelected.clear();
    document.querySelectorAll('.bulk-item').forEach(function (el) {
        el.checked = false;
    });
    var selAll = document.getElementById('bulk-select-all');
    if (selAll)
        selAll.checked = false;
    updateBulkBar();
}

function bulkChangePrice() {
    if (_bulkSelected.size === 0) {
        toast('Нет выбранных товаров', 'err');
        return;
    }
    document.getElementById('bulk-price-count').textContent = _bulkSelected.size;
    document.getElementById('bulk-price-value').value = '';
    openModal('modal-bulk-price');
}

function applyBulkPrice() {
    var type = document.getElementById('bulk-price-type').value;
    var value = parseFloat(document.getElementById('bulk-price-value').value);
    if (isNaN(value) || value < 0) {
        toast('Введите корректное значение', 'err');
        return;
    }
    var list = getProducts();
    var changed = 0;
    list = list.map(function (p) {
        if (_bulkSelected.has(p.id)) {
            var oldPrice = Number(p.price) || 0;
            switch (type) {
            case 'set':
                p.price = value;
                break;
            case 'percent':
                p.price = oldPrice * (1 + value / 100);
                break;
            case 'increase':
                p.price = oldPrice + value;
                break;
            case 'decrease':
                p.price = Math.max(0, oldPrice - value);
                break;
            }
            p.price = Math.round(p.price * 100) / 100;
            changed++;
        }
        return p;
    });
    setProducts(list);
    closeModal('modal-bulk-price');
    clearBulkSelection();
    renderProducts();
    toast('Цена обновлена у ' + changed + ' товаров', 'ok');
}

function bulkDelete() {
    if (_bulkSelected.size === 0) {
        toast('Нет выбранных товаров', 'err');
        return;
    }
    confirmAction('Массовое удаление', 'Удалить ' + _bulkSelected.size + ' товаров?', function () {
        var list = getProducts();
        var deleted = 0;
        list = list.filter(function (p) {
            if (_bulkSelected.has(p.id)) {
                deleted++;
                return false;
            }
            return true;
        });
        setProducts(list);
        clearBulkSelection();
        renderProducts();
        renderDashboard();
        toast('Удалено ' + deleted + ' товаров', 'ok');
    });
}

function bulkApplyDiscount() {
    if (_bulkSelected.size === 0) {
        toast('Нет выбранных товаров', 'err');
        return;
    }
    document.getElementById('bulk-discount-count').textContent = _bulkSelected.size;
    document.getElementById('bulk-discount-value').value = '';
    openModal('modal-bulk-discount');
}

function applyBulkDiscount() {
    var value = parseFloat(document.getElementById('bulk-discount-value').value);
    if (isNaN(value) || value <= 0 || value > 100) {
        toast('Введите скидку от 1 до 100%', 'err');
        return;
    }
    var type = document.getElementById('bulk-discount-type').value;
    var promos = getPromotions();
    var now = new Date();
    var endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    var endStr = endOfMonth.toISOString().slice(0, 10);
    var added = 0;
    getProducts().forEach(function (p) {
        if (_bulkSelected.has(p.id)) {
            var existing = promos.findIndex(function (pr) {
                return pr.productId === p.id && pr.active !== false;
            });
            if (existing >= 0) {
                promos[existing].discountType = type;
                promos[existing].discountValue = value;
                promos[existing].endDate = endStr;
            } else {
                promos.push({
                    id: uid(),
                    productId: p.id,
                    productName: p.name,
                    discountType: type,
                    discountValue: value,
                    startDate: now.toISOString().slice(0, 10),
                    startTime: '00:00',
                    endDate: endStr,
                    endTime: '23:59',
                    active: true
                });
            }
            added++;
        }
    });
    setPromotions(promos);
    closeModal('modal-bulk-discount');
    clearBulkSelection();
    renderProducts();
    toast('Скидка применена к ' + added + ' товарам', 'ok');
}

function bulkRemoveDiscount() {
    if (_bulkSelected.size === 0) {
        toast('Нет выбранных товаров', 'err');
        return;
    }
    confirmAction('Удаление скидок', 'Удалить скидки для ' + _bulkSelected.size + ' товаров?', function () {
        var promos = getPromotions();
        var selectedIds = new Set();
        _bulkSelected.forEach(function (id) {
            selectedIds.add(id);
        });
        var before = promos.length;
        promos = promos.filter(function (pr) {
            return !selectedIds.has(pr.productId);
        });
        setPromotions(promos);
        clearBulkSelection();
        renderProducts();
        toast('Скидки удалены у ' + (before - promos.length) + ' товаров', 'ok');
    });
}

function openPinSetup() {
    document.getElementById('pin-setup-code').value = '';
    document.getElementById('pin-setup-confirm').value = '';
    openModal('modal-pin-setup');
}

async function savePinCode() {
    var pin = document.getElementById('pin-setup-code').value;
    var confirm = document.getElementById('pin-setup-confirm').value;
    if (pin.length < 4 || pin.length > 6) {
        toast('PIN должен быть 4\u20136 цифр', 'err');
        return;
    }
    if (pin !== confirm) {
        toast('PIN-коды не совпадают', 'err');
        return;
    }
    await saveUserPin(currentUser.id, pin);
    closeModal('modal-pin-setup');
    toast('PIN-код сохранён', 'ok');
    addAuditLog('PIN-код установлен', 'Пользователь: ' + currentUser.name, '\uD83D\uDD10');
}

async function checkPinLogin() {
    var entered = document.getElementById('pin-login-code').value;
    var userId = _pendingSwitchUserId;
    if (!userId) return;
    var has = getUserPin(userId);
    if (!has) {
        closeModal('modal-pin-login');
        doSwitchUser(_findUserAnywhere(userId));
        return;
    }
    var target = _findUserAnywhere(userId);
    if (!target) return;
    if (_isLegacyPlain(has)) {
        if (entered === has) {
            closeModal('modal-pin-login');
            await saveUserPin(userId, entered);
            doSwitchUser(target);
        } else if (entered.length >= has.length) {
            document.getElementById('pin-login-error').style.display = 'block';
            document.getElementById('pin-login-code').value = '';
        }
    } else {
        if (entered.length >= 4 && (await hashPin(entered)) === has) {
            closeModal('modal-pin-login');
            doSwitchUser(target);
        } else if (entered.length >= 4) {
            document.getElementById('pin-login-error').style.display = 'block';
            document.getElementById('pin-login-code').value = '';
        }
    }
}

function toggleScannerAutoClose(cb) {
    setStore('_scannerAutoClose', cb.checked);
}

function toggleScannerTorch() {
    if (!scannerStream)
        return;
    var track = scannerStream.getVideoTracks()[0];
    if (!track)
        return;
    var capabilities = track.getCapabilities && track.getCapabilities();
    if (capabilities && capabilities.torch) {
        var currentlyOn = track.getConstraints && track.getConstraints().torch;
        track.applyConstraints({ advanced: [{ torch: !currentlyOn }] }).catch(function (e) {
            console.warn('[Scanner] Torch error:', e);
        });
    }
}

function openQtyPopup(productId) {
    var item = saleCart.find(function (c) {
        return c.id === productId;
    });
    if (!item)
        return;
    setQtyPopupProductId(productId);
    document.getElementById('qty-popup-product').textContent = item.name;
    document.getElementById('qty-popup-input').value = item.qty;
    document.getElementById('qty-popup-input').max = item.maxQty || 9999;
    openModal('modal-qty-popup');
    setTimeout(function () {
        var inp = document.getElementById('qty-popup-input');
        inp.focus();
        inp.select();
    }, 150);
}

function confirmQtyPopup() {
    var qty = parseInt(document.getElementById('qty-popup-input').value) || 1;
    var item = saleCart.find(function (c) {
        return c.id === _qtyPopupProductId;
    });
    if (!item) {
        closeModal('modal-qty-popup');
        return;
    }
    var maxQty = item.maxQty || 9999;
    if (qty > maxQty) {
        toast('На складе всего ' + maxQty + ' шт.', 'err');
        return;
    }
    if (qty < 1)
        qty = 1;
    item.qty = qty;
    renderSaleCart();
    closeModal('modal-qty-popup');
}




var _ex={};
try{_ex['getCurrentStoreName']=getCurrentStoreName}catch(e){}
try{_ex['normalizeCode']=normalizeCode}catch(e){}
try{_ex['levenshtein']=levenshtein}catch(e){}
try{_ex['generateSearchVariations']=generateSearchVariations}catch(e){}
try{_ex['generateEAN13']=generateEAN13}catch(e){}
try{_ex['drawEan13Svg']=drawEan13Svg}catch(e){}
try{_ex['drawCode39Svg']=drawCode39Svg}catch(e){}
try{_ex['updateMarkup']=updateMarkup}catch(e){}
try{_ex['fmt']=fmt}catch(e){}
try{_ex['fmtShort']=fmtShort}catch(e){}
try{_ex['fmtDate']=fmtDate}catch(e){}
try{_ex['fmtDateTime']=fmtDateTime}catch(e){}
try{_ex['escapeHtml']=escapeHtml}catch(e){}
try{_ex['esc']=esc}catch(e){}
try{_ex['todayStr']=todayStr}catch(e){}
try{_ex['getFieldValue']=getFieldValue}catch(e){}
try{_ex['createExcelWorkbook']=createExcelWorkbook}catch(e){}
try{_ex['styleExcelCell']=styleExcelCell}catch(e){}
try{_ex['saveExcelBuffer']=saveExcelBuffer}catch(e){}
try{_ex['downloadExcelTemplate']=downloadExcelTemplate}catch(e){}
try{_ex['readExcelFile']=readExcelFile}catch(e){}
try{_ex['showImportPreview']=showImportPreview}catch(e){}
try{_ex['confirmImport']=confirmImport}catch(e){}
try{_ex['isToday']=isToday}catch(e){}
try{_ex['closeModal']=closeModal}catch(e){}
try{_ex['toggleSidebar']=toggleSidebar}catch(e){}
try{_ex['toggleDashLowStock']=toggleDashLowStock}catch(e){}
try{_ex['confirmAction']=confirmAction}catch(e){}
try{_ex['showSupabaseLogin']=showSupabaseLogin}catch(e){}
try{_ex['getPeriodDateRange']=getPeriodDateRange}catch(e){}
try{_ex['filterByPeriod']=filterByPeriod}catch(e){}
try{_ex['card']=card}catch(e){}
try{_ex['finCard']=finCard}catch(e){}
try{_ex['setPayment']=setPayment}catch(e){}
try{_ex['adjustSelectedQty']=adjustSelectedQty}catch(e){}
try{_ex['removeSelectedItem']=removeSelectedItem}catch(e){}
try{_ex['checkSelectedPrice']=checkSelectedPrice}catch(e){}
try{_ex['focusSearch']=focusSearch}catch(e){}
try{_ex['toggleFavoriteFromTable']=toggleFavoriteFromTable}catch(e){}
try{_ex['posRefreshFavorites']=posRefreshFavorites}catch(e){}
try{_ex['openPaymentModal']=openPaymentModal}catch(e){}
try{_ex['toggleItemDiscountValue']=toggleItemDiscountValue}catch(e){}
try{_ex['stopTracks']=stopTracks}catch(e){}
try{_ex['switchUnsoldPeriod']=switchUnsoldPeriod}catch(e){}
try{_ex['downloadFile']=downloadFile}catch(e){}
try{_ex['switchAuditsTab']=switchAuditsTab}catch(e){}
try{_ex['onWoSearch']=onWoSearch}catch(e){}
try{_ex['updateAuditQty']=updateAuditQty}catch(e){}
try{_ex['tableHTML']=tableHTML}catch(e){}
try{_ex['showPaymentMethodModal']=showPaymentMethodModal}catch(e){}
try{_ex['classicAmountWords']=classicAmountWords}catch(e){}
try{_ex['_setPerm']=_setPerm}catch(e){}
try{_ex['selectAllInGroup']=selectAllInGroup}catch(e){}
try{_ex['applyTemplateIndex']=applyTemplateIndex}catch(e){}
try{_ex['togglePromoDiscountType']=togglePromoDiscountType}catch(e){}
try{_ex['toggleNotifCenter']=toggleNotifCenter}catch(e){}
try{_ex['restoreSidebar']=restoreSidebar}catch(e){}
try{_ex['toggleBulkSelectAll']=toggleBulkSelectAll}catch(e){}
try{_ex['updateBulkBar']=updateBulkBar}catch(e){}
try{_ex['clearBulkSelection']=clearBulkSelection}catch(e){}
try{_ex['bulkChangePrice']=bulkChangePrice}catch(e){}
try{_ex['applyBulkPrice']=applyBulkPrice}catch(e){}
try{_ex['bulkDelete']=bulkDelete}catch(e){}
try{_ex['bulkApplyDiscount']=bulkApplyDiscount}catch(e){}
try{_ex['applyBulkDiscount']=applyBulkDiscount}catch(e){}
try{_ex['bulkRemoveDiscount']=bulkRemoveDiscount}catch(e){}
try{_ex['openPinSetup']=openPinSetup}catch(e){}
try{_ex['savePinCode']=savePinCode}catch(e){}
try{_ex['checkPinLogin']=checkPinLogin}catch(e){}
try{_ex['toggleScannerAutoClose']=toggleScannerAutoClose}catch(e){}
try{_ex['toggleScannerTorch']=toggleScannerTorch}catch(e){}
try{_ex['openQtyPopup']=openQtyPopup}catch(e){}
try{_ex['confirmQtyPopup']=confirmQtyPopup}catch(e){}
return _ex;})();

// documents
__mod['documents']=(function(){
var styleExcelCell=__mf('utils','styleExcelCell');
var getSales=__mf('sales','getSales');
var renderPosCatBrowser=__mf('ui','renderPosCatBrowser');
var toast=__mf('notifications','toast');
var tableHTML=__mf('utils','tableHTML');
var fmt=__mf('utils','fmt');
var closeModal=__mf('utils','closeModal');
var openModal=__mf('ui','openModal');
var buildInvoiceHTML=__mf('ui','buildInvoiceHTML');
var isSaleActive=__mf('sales','isSaleActive');
var exportAoAToExcel=__mf('statistics','exportAoAToExcel');
var fmtShort=__mf('utils','fmtShort');
var uid=__mf('ui','uid');
var getDocItemsFromTable=__mf('products','getDocItemsFromTable');
var fmtDate=__mf('utils','fmtDate');
var clearSaleSelection=__mf('sales','clearSaleSelection');
var confirmAction=__mf('utils','confirmAction');
var setDocumentItems=__mf('products','setDocumentItems');
var buildSalePKOHTML=__mf('sales','buildSalePKOHTML');
var PAY_LABELS=__mv('sales','PAY_LABELS');
var _reopenParentModal=__mf('ui','_reopenParentModal');
var setDeferred=__mf('sales','setDeferred');
var getDocumentItems=__mf('products','getDocumentItems');
var escapeHtml=__mf('utils','escapeHtml');
var addDocItemRow=__mf('products','addDocItemRow');
var saveExcelBuffer=__mf('utils','saveExcelBuffer');
var _closeParentModals=__mf('ui','_closeParentModals');
var getDeferred=__mf('sales','getDeferred');
var esc=__mf('utils','esc');


function getDocuments() {
    return window.ApDb ? window.ApDb.getDocuments() : [];
}

function setDocuments(arr) {
    if (window.ApDb)
        window.ApDb.setDocuments(arr);
}

function getDocTemplates() {
    var fromDb = window.DataService && window.DataService.getAppData && window.DataService.getAppData('doc_templates');
    if (fromDb && Array.isArray(fromDb)) return fromDb;
    try {
        return JSON.parse(localStorage.getItem('ap_doc_templates') || '[]');
    } catch (e) {
        return [];
    }
}

function setDocTemplates(arr) {
    if (window.DataService && window.DataService.setAppData) window.DataService.setAppData('doc_templates', arr);
    try {
        localStorage.setItem('ap_doc_templates', JSON.stringify(arr));
    } catch (e) {
    }
}

function openDocTemplateManager() {
    _closeParentModals();
    openModal('modal-doc-templates');
    renderDocTemplates();
}

function renderDocTemplates() {
    var list = document.getElementById('doc-templates-list');
    if (!list)
        return;
    var templates = getDocTemplates();
    if (!templates.length) {
        list.innerHTML = '<div class="empty">Нет сохранённых шаблонов</div>';
        return;
    }
    list.innerHTML = templates.map(function (t, i) {
        return '<div class="doc-template-card" style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;cursor:pointer" onclick="loadDocTemplate(' + i + ')">' + '<div style="display:flex;justify-content:space-between;align-items:center">' + '<div><strong>' + esc(t.name || 'Шаблон ' + (i + 1)) + '</strong><br><span style="font-size:12px;color:var(--muted)">' + esc(t.storeName || '') + (t.bin ? ' \xB7 ' + esc(t.bin) : '') + '</span></div>' + '<div style="display:flex;gap:4px">' + '<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();editDocTemplate(' + i + ')">\u270F️</button>' + '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteDocTemplate(' + i + ')">\u2715</button>' + '</div></div></div>';
    }).join('');
}

function editDocTemplate(idx) {
    var templates = getDocTemplates();
    var t = templates[idx] || {};
    var f = function (id) {
        return document.getElementById(id);
    };
    f('tpl-name').value = t.name || '';
    f('tpl-storeName').value = t.storeName || '';
    f('tpl-bin').value = t.bin || '';
    f('tpl-iik').value = t.iik || '';
    f('tpl-bik').value = t.bik || '';
    f('tpl-bankName').value = t.bankName || '';
    f('tpl-kbe').value = t.kbe || '';
    f('tpl-paymentCode').value = t.paymentCode || '';
    f('tpl-beneficiary').value = t.beneficiary || '';
    f('tpl-address').value = t.address || '';
    f('tpl-phone').value = t.phone || '';
    f('tpl-directorName').value = t.directorName || '';
    f('tpl-directorPosition').value = t.directorPosition || '';
    f('tpl-extra').value = t.extra || '';
    window._editingDocTemplateIdx = idx;
    f('tpl-modal-title').textContent = 'Редактировать шаблон';
    document.getElementById('tpl-save-btn').onclick = function () {
        saveDocTemplate(idx);
    };
    document.getElementById('tpl-save-as-new-btn').style.display = '';
    openModal('modal-doc-template-edit');
}

function deleteDocTemplate(idx) {
    if (!confirm('Удалить шаблон?'))
        return;
    var templates = getDocTemplates();
    templates.splice(idx, 1);
    setDocTemplates(templates);
    renderDocTemplates();
    toast('Шаблон удалён', 'ok');
}

function addDocTemplate() {
    window._editingDocTemplateIdx = -1;
    var f = function (id) {
        return document.getElementById(id);
    };
    f('tpl-name').value = '';
    f('tpl-storeName').value = '';
    f('tpl-bin').value = '';
    f('tpl-iik').value = '';
    f('tpl-bik').value = '';
    f('tpl-bankName').value = '';
    f('tpl-kbe').value = '';
    f('tpl-paymentCode').value = '';
    f('tpl-beneficiary').value = '';
    f('tpl-address').value = '';
    f('tpl-phone').value = '';
    f('tpl-directorName').value = '';
    f('tpl-directorPosition').value = '';
    f('tpl-extra').value = '';
    f('tpl-modal-title').textContent = 'Новый шаблон';
    document.getElementById('tpl-save-btn').onclick = function () {
        saveDocTemplate(-1);
    };
    document.getElementById('tpl-save-as-new-btn').style.display = 'none';
    openModal('modal-doc-template-edit');
}

function saveDocTemplate(idx) {
    var f = function (id) {
        return document.getElementById(id);
    };
    var t = {
        name: f('tpl-name').value.trim() || 'Шаблон',
        storeName: f('tpl-storeName').value.trim(),
        bin: f('tpl-bin').value.trim(),
        iik: f('tpl-iik').value.trim(),
        bik: f('tpl-bik').value.trim(),
        bankName: f('tpl-bankName').value.trim(),
        kbe: f('tpl-kbe').value.trim(),
        paymentCode: f('tpl-paymentCode').value.trim(),
        beneficiary: f('tpl-beneficiary').value.trim(),
        address: f('tpl-address').value.trim(),
        phone: f('tpl-phone').value.trim(),
        directorName: f('tpl-directorName').value.trim(),
        directorPosition: f('tpl-directorPosition').value.trim(),
        extra: f('tpl-extra').value.trim()
    };
    var templates = getDocTemplates();
    if (idx >= 0 && idx < templates.length) {
        templates[idx] = t;
    } else {
        templates.push(t);
    }
    setDocTemplates(templates);
    closeModal('modal-doc-template-edit');
    renderDocTemplates();
    toast('Шаблон сохранён', 'ok');
}

function loadDocTemplate(idx) {
    window.loadDocTemplateNewDoc(idx);
    var templates = getDocTemplates();
    var t = templates[idx];
    if (!t)
        return;
    var si = {
        storeName: t.storeName,
        bin: t.bin,
        iik: t.iik,
        bik: t.bik,
        bankName: t.bankName,
        kbe: t.kbe,
        paymentCode: t.paymentCode,
        beneficiary: t.beneficiary,
        address: t.address,
        phone: t.phone,
        directorName: t.directorName,
        directorPosition: t.directorPosition,
        extra: t.extra
    };
    var fields = [
        [
            'edit-storeName',
            'storeName'
        ],
        [
            'edit-storeBIN',
            'bin'
        ],
        [
            'edit-iik',
            'iik'
        ],
        [
            'edit-bik',
            'bik'
        ],
        [
            'edit-bankName',
            'bankName'
        ],
        [
            'edit-kbe',
            'kbe'
        ],
        [
            'edit-paymentCode',
            'paymentCode'
        ],
        [
            'edit-beneficiary',
            'beneficiary'
        ],
        [
            'edit-storeAddress',
            'address'
        ],
        [
            'edit-storePhone',
            'phone'
        ],
        [
            'edit-directorName',
            'directorName'
        ],
        [
            'edit-directorPosition',
            'directorPosition'
        ],
        [
            'edit-storeExtra',
            'extra'
        ]
    ];
    fields.forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        if (el)
            el.value = si[pair[1]] || '';
    });
    closeModal('modal-doc-templates');
    _reopenParentModal();
    toast('Шаблон загружен: ' + t.name, 'ok');
}

function loadDocTemplateNewDoc(idx) {
    var templates = getDocTemplates();
    var t = templates[idx];
    if (!t)
        return;
    try {
        if (window.DataService && window.DataService.setAppData) window.DataService.setAppData('receipt_template', t);
        localStorage.setItem('ap_selected_template', JSON.stringify(t));
    } catch (e) {
    }
}

function selectDocTemplateForDoc() {
    _closeParentModals();
    openModal('modal-doc-templates');
    renderDocTemplates();
}

function printInvoice(receiptId) {
    try {
        if (!receiptId) {
            toast('Не указан ID накладной', 'err');
            return;
        }
        var html = buildInvoiceHTML(receiptId);
        if (!html && typeof receiptId !== 'string')
            html = buildInvoiceHTML(String(receiptId));
        if (!html) {
            toast('Накладная не найдена', 'err');
            return;
        }
        window._currentPrintReceiptId = receiptId;
        showInvoiceOverlay(html);
    } catch (e) {
        toast('Ошибка: ' + (e && e.message ? e.message : String(e)), 'err');
    }
}

function showInvoiceOverlay(html) {
    var existing = document.getElementById('invoice-overlay');
    if (existing)
        existing.remove();
    var printCSS = '@media print{body>*:not(#invoice-overlay){display:none!important}#invoice-overlay{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:auto!important;background:#fff!important;z-index:999999!important;display:block!important;align-items:initial!important;justify-content:initial!important;padding:0!important}#invoice-overlay .no-print{display:none!important}}';
    var overlay = document.createElement('div');
    overlay.id = 'invoice-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:rgba(0,0,0,0.6);display:flex;align-items:flex-start;justify-content:center;padding:20px';
    overlay.innerHTML = '<style>' + printCSS + '</style><div id="invoice-print-area" style="background:#fff;max-width:800px;width:100%;max-height:95vh;overflow-y:auto;border-radius:8px;box-shadow:0 8px 40px rgba(0,0,0,0.3);padding:30px;position:relative">' + '<div class="no-print" style="position:sticky;top:0;float:right;display:flex;gap:8px;align-items:center;z-index:1;margin-bottom:10px">' + '<button onclick="window.print()" style="padding:8px 20px;font-size:14px;background:#1e40af;color:#fff;border:none;border-radius:6px;cursor:pointer">\uD83D\uDDA8 Печать</button>' + '<button onclick="downloadInvoiceExcel(window._currentPrintReceiptId)" style="padding:8px 20px;font-size:14px;background:#16a34a;color:#fff;border:none;border-radius:6px;cursor:pointer">\uD83D\uDCE5 Excel</button>' + '<button onclick="document.getElementById(\'invoice-overlay\').remove()" style="padding:8px 20px;font-size:14px;background:#888;color:#fff;border:none;border-radius:6px;cursor:pointer">\u2715 Закрыть</button>' + '</div>' + html + '</div>';
    document.body.appendChild(overlay);
}

function printSalePKO(receiptId) {
    try {
        if (!receiptId) {
            toast('Не указан ID чека', 'err');
            return;
        }
        var allSales = getSales().filter(isSaleActive);
        var sales = allSales.filter(function (s) {
            return s.receiptId === receiptId;
        });
        if (!sales.length)
            sales = allSales.filter(function (s) {
                return s.id === receiptId;
            });
        if (!sales.length)
            sales = allSales.filter(function (s) {
                return String(s.receiptId) === String(receiptId) || String(s.id) === String(receiptId);
            });
        if (!sales.length) {
            toast('Продажа не найдена', 'err');
            return;
        }
        var first = sales[0];
        var store = window.ApAuth && window.ApAuth.getCurrentStore();
        var storeName = store ? store.storeName : 'SANAQ';
        var total = sales.reduce(function (sum, s) {
            return sum + (Number(s.total) || 0);
        }, 0);
        var html = buildSalePKOHTML(first, receiptId, storeName, total);
        window._currentPrintReceiptId = receiptId;
        showInvoiceOverlay(html);
    } catch (e) {
        toast('Ошибка: ' + (e && e.message ? e.message : String(e)), 'err');
    }
}

async function downloadInvoiceExcel(receiptId) {
    if (!receiptId) {
        toast('ID накладной не указан', 'err');
        return;
    }
    var allSales = getSales().filter(isSaleActive);
    var sales = allSales.filter(function (s) {
        return s.receiptId === receiptId;
    });
    if (!sales.length)
        sales = allSales.filter(function (s) {
            return s.id === receiptId;
        });
    if (!sales.length)
        sales = allSales.filter(function (s) {
            return String(s.receiptId) === String(receiptId) || String(s.id) === String(receiptId);
        });
    if (!sales.length) {
        toast('Нет данных для экспорта', 'err');
        return;
    }
    var first = sales[0];
    var store = window.ApAuth && window.ApAuth.getCurrentStore();
    var storeName = store ? store.storeName : 'SANAQ';
    var bin = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_bin')) || localStorage.getItem('ap_store_bin') || '';
    var total = sales.reduce(function (sum, s) {
        return sum + (Number(s.total) || 0);
    }, 0);
    var pay = PAY_LABELS[first.payment] || first.payment || '';
    if (first.payment === 'mixed') {
        var pts = [];
        if (Number(first.cashAmount) > 0)
            pts.push('нал:' + fmtShort(first.cashAmount));
        if (Number(first.kaspiAmount) > 0)
            pts.push('kaspiqr:' + fmtShort(first.kaspiAmount));
        if (Number(first.transferAmount) > 0)
            pts.push('банк:' + fmtShort(first.transferAmount));
        if (pts.length)
            pay = pts.join(' ');
    }
    var headers = [
        '\u2116',
        'Код товара',
        'Наименование',
        'Кол-во',
        'Цена',
        'Сумма'
    ];
    var widths = [
        6,
        18,
        42,
        12,
        14,
        16
    ];
    var rows = sales.map(function (s, i) {
        return [
            i + 1,
            s.productCode || '',
            s.productName || '',
            Number(s.quantity) || 0,
            Number(s.unitPrice) || 0,
            Number(s.total) || 0
        ];
    });
    var hdrRow = [
        storeName + ' \u2014 Накладная \u2116 ' + receiptId.slice(-6),
        '',
        '',
        '',
        '',
        ''
    ];
    var infoRow1 = [
        'Дата: ' + fmtDate(first.date),
        '',
        'Кассир: ' + (first.userName || '\u2014'),
        '',
        '',
        ''
    ];
    var infoRow2 = [
        bin ? 'БИН/ИИН: ' + bin : '',
        '',
        'Оплата: ' + pay,
        '',
        '',
        ''
    ];
    var totalRow = [
        '',
        '',
        '',
        '',
        'Итого:',
        total
    ];
    if (typeof ExcelJS !== 'undefined') {
        var wb = new ExcelJS.Workbook();
        wb.creator = 'SANAQ';
        wb.created = new Date();
        var ws = wb.addWorksheet('Накладная', { views: [{ showGridLines: false }] });
        ws.properties.defaultRowHeight = 20;
        var t = ws.addRow(hdrRow);
        t.height = 30;
        ws.mergeCells(1, 1, 1, 6);
        styleExcelCell(t.getCell(1), {
            font: {
                name: 'Arial',
                size: 14,
                bold: true,
                color: { argb: 'FF1F2937' }
            },
            alignment: {
                horizontal: 'center',
                vertical: 'middle'
            }
        });
        var i1 = ws.addRow(infoRow1);
        ws.mergeCells(2, 1, 2, 2);
        ws.mergeCells(2, 3, 2, 4);
        i1.height = 20;
        i1.eachCell(function (c) {
            styleExcelCell(c, {
                font: {
                    name: 'Arial',
                    size: 10
                },
                alignment: { vertical: 'middle' }
            });
        });
        var i2 = ws.addRow(infoRow2);
        ws.mergeCells(3, 1, 3, 2);
        ws.mergeCells(3, 3, 3, 4);
        i2.height = 20;
        i2.eachCell(function (c) {
            styleExcelCell(c, {
                font: {
                    name: 'Arial',
                    size: 10
                },
                alignment: { vertical: 'middle' }
            });
        });
        ws.addRow([]);
        var th = ws.addRow(headers);
        th.height = 24;
        th.eachCell(function (c, ci) {
            styleExcelCell(c, {
                font: {
                    name: 'Arial',
                    size: 10,
                    bold: true,
                    color: { argb: 'FFFFFFFF' }
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF1F2937' }
                },
                alignment: {
                    horizontal: ci === 1 || ci >= 4 ? 'center' : 'left',
                    vertical: 'middle',
                    wrapText: true
                },
                border: {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            });
        });
        var alt = false;
        rows.forEach(function (rd) {
            var rw = ws.addRow(rd);
            rw.eachCell(function (c, ci) {
                styleExcelCell(c, {
                    font: {
                        name: 'Arial',
                        size: 10
                    },
                    alignment: {
                        vertical: 'middle',
                        horizontal: ci >= 4 ? 'right' : ci === 1 ? 'center' : 'left',
                        wrapText: true
                    },
                    fill: alt ? {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF9FAFB' }
                    } : {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFFFFF' }
                    },
                    border: {
                        top: {
                            style: 'thin',
                            color: { argb: 'FFE5E7EB' }
                        },
                        left: {
                            style: 'thin',
                            color: { argb: 'FFE5E7EB' }
                        },
                        bottom: {
                            style: 'thin',
                            color: { argb: 'FFE5E7EB' }
                        },
                        right: {
                            style: 'thin',
                            color: { argb: 'FFE5E7EB' }
                        }
                    }
                });
                if (ci >= 5)
                    c.numFmt = '#,##0';
            });
            alt = !alt;
        });
        ws.addRow([]);
        var totRow = ws.addRow(totalRow);
        ws.mergeCells(totRow.number, 1, totRow.number, 5);
        totRow.eachCell(function (c, ci) {
            styleExcelCell(c, {
                font: {
                    name: 'Arial',
                    size: 11,
                    bold: true
                },
                fill: {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE5E7EB' }
                },
                alignment: {
                    vertical: 'middle',
                    horizontal: ci < 5 ? 'right' : 'right'
                },
                border: {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                }
            });
            if (ci === 6)
                c.numFmt = '#,##0';
        });
        widths.forEach(function (w, i) {
            ws.getColumn(i + 1).width = w;
        });
        var buffer;
        try { buffer = await wb.xlsx.writeBuffer(); } catch (e) { toast('Ошибка создания Excel: ' + e.message, 'err'); return; }
        saveExcelBuffer(buffer, 'Nakladnaya_' + receiptId.slice(-6) + '.xlsx');
        toast('Excel файл скачан', 'ok');
    } else {
        exportAoAToExcel(rows, 'Nakladnaya_' + receiptId.slice(-6), 'Накладная', widths);
    }
}

function renderDocuments() {
    var docs = getDocuments();
    var search = (document.getElementById('doc-search') || {}).value || '';
    var typeFilter = (document.getElementById('doc-type-filter') || {}).value || 'all';
    var statusFilter = (document.getElementById('doc-status-filter') || {}).value || 'all';
    var filtered = docs.filter(function (d) {
        var dt = d.type || d.docType || '';
        if (typeFilter !== 'all' && dt !== typeFilter)
            return false;
        if (statusFilter !== 'all' && d.status !== statusFilter)
            return false;
        if (search) {
            var s = search.toLowerCase();
            var numMatch = (d.number || d.docNumber || '').toLowerCase().indexOf(s) >= 0;
            var clientMatch = (d.clientName || d.recipientName || d.customerName || '').toLowerCase().indexOf(s) >= 0;
            if (!numMatch && !clientMatch)
                return false;
        }
        return true;
    });
    var el = document.getElementById('documents-table');
    if (!el)
        return;
    if (!filtered.length) {
        el.innerHTML = '<div class="empty">Документов не найдено</div>';
        return;
    }
    el.innerHTML = tableHTML([
        'Номер',
        'Тип',
        'Клиент/Получатель',
        'Сумма',
        'Статус',
        'Дата',
        'Действия'
    ], filtered.map(function (d) {
        var dt = d.type || d.docType || '';
        var typeLabel = dt === 'invoice' ? 'Счет на оплату' : dt === 'z2' ? 'Накладная З-2' : dt === 'invoice_sf' ? '\uD83D\uDCC4 Счёт-фактура' : dt === 'deferred' ? '\uD83D\uDCCB Отложенный' : dt || '\u2014';
        var statusLabel = d.status === 'pending' ? '<span class="badge badge-warn">Ожидает</span>' : d.status === 'paid' ? '<span class="badge badge-ok">Оплачено</span>' : d.status === 'issued' ? '<span class="badge badge-info">Выписано</span>' : d.status === 'cancelled' ? '<span class="badge badge-danger">Отменено</span>' : d.status;
        var client = d.clientName || d.recipientName || d.customerName || '\u2014';
        var docNum = d.number || d.docNumber || '\u2116' + d.id.slice(0, 6);
        var actions = '<div style="display:flex;gap:4px;flex-wrap:nowrap">' + '<button class="btn btn-secondary btn-sm" onclick="openDocumentView(\'' + d.id + '\')" title="Открыть">\uD83D\uDC41</button>' + '<button class="btn btn-warning btn-sm" onclick="openDocumentEditById(\'' + d.id + '\')" title="Редактировать">\u270F️</button>' + '<button class="btn btn-info btn-sm" onclick="duplicateDocument(\'' + d.id + '\')" title="Дублировать">\uD83D\uDCCB</button>' + '<button class="btn btn-info btn-sm" onclick="downloadDocumentPdf(\'' + d.id + '\')" title="Скачать PDF">\uD83D\uDCC4</button>' + '<button class="btn btn-success btn-sm" onclick="downloadDocumentExcelById(\'' + d.id + '\')" title="Скачать Excel">\uD83D\uDCCA</button>' + '<button class="btn btn-secondary btn-sm" onclick="printDocumentById(\'' + d.id + '\')" title="Печать">\uD83D\uDDA8️</button>' + '<button class="btn btn-danger btn-sm" onclick="deleteDocument(\'' + d.id + '\')" title="Удалить">\u274C</button>' + '</div>';
        return [
            '<a href="#" onclick="openDocumentView(\'' + d.id + '\');return false">' + docNum + '</a>',
            typeLabel,
            client,
            fmt(d.total || 0),
            statusLabel,
            fmtDate(d.date || d.documentDate),
            actions
        ];
    }));
}

function openDocumentEditById(docId) {
    window._currentDocId = docId;
    openModal('modal-view-document');
    openDocumentEdit();
}

function deleteDocument(docId) {
    if (!docId) {
        toast('ID документа не указан', 'err');
        return;
    }
    confirmAction('Удалить документ?', 'Документ будет удалён безвозвратно.', function () {
        if (window.ApDb && typeof window.ApDb.deleteDocument === 'function') {
            window.ApDb.deleteDocument(docId);
        } else {
            var docs = getDocuments();
            var idx = docs.findIndex(function (d) {
                return d.id === docId;
            });
            if (idx >= 0) {
                docs.splice(idx, 1);
                setDocuments(docs);
            }
        }
        window._currentDocId = null;
        closeModal('modal-view-document');
        renderDocuments();
        toast('Документ удалён', 'ok');
    });
}

function duplicateDocument(docId) {
    if (!docId) {
        toast('ID документа не указан', 'err');
        return;
    }
    var docs = getDocuments();
    var src = docs.find(function (d) {
        return d.id === docId;
    });
    if (!src) {
        toast('Документ не найден', 'err');
        return;
    }
    var copy = JSON.parse(JSON.stringify(src));
    copy.id = uid();
    copy.number = '';
    copy.status = 'pending';
    copy.date = new Date().toISOString();
    docs.unshift(copy);
    setDocuments(docs);
    renderDocuments();
    toast('Документ дублирован', 'ok');
    openDocumentView(copy.id);
}

function downloadDocumentPdf(docId) {
    window._currentDocId = docId;
    openDocumentView(docId);
    setTimeout(function () {
        printDocument();
    }, 300);
}

function printDocumentById(docId) {
    window._currentDocId = docId;
    openDocumentView(docId);
    setTimeout(function () {
        printDocument();
    }, 300);
}

function downloadDocumentExcelById(docId) {
    window._currentDocId = docId;
    downloadDocumentExcel();
}

function openCreateInvoiceModal() {
    openModal('modal-create-invoice');
    document.getElementById('invoice-items-tbody').innerHTML = '';
    addInvoiceItemRow();
    var deferred = getDeferred().filter(function (d) {
        return d.status === 'pending';
    });
    var container = document.getElementById('deferred-checkboxes');
    if (container) {
        if (!deferred.length) {
            container.innerHTML = '<div style="color:var(--text-muted);padding:8px">Нет отложенных товаров</div>';
        } else {
            container.innerHTML = deferred.map(function (d) {
                var detail = (d.items || []).map(function (it) {
                    return '<div style="padding:2px 0 2px 24px;font-size:0.9em;color:var(--text-muted)">' + esc(it.productName) + ' \xD7 ' + it.quantity + ' = ' + fmt(it.total) + '</div>';
                }).join('');
                return '<div style="padding:6px 0;border-bottom:1px solid var(--border)">' + '<label style="display:flex;align-items:center;gap:8px;cursor:pointer">' + '<input type="checkbox" value="' + d.id + '" onchange="updateInvoiceTypeUI()"> ' + '<strong>' + esc(d.customerName || 'Без клиента') + '</strong> \u2014 ' + fmt(d.total) + ' (' + (d.items ? d.items.length : 0) + ' поз.)</label>' + detail + '</div>';
            }).join('');
        }
    }
    document.getElementById('invoice-type').value = 'manual';
    updateInvoiceTypeUI();
}

function openCreateZ2Modal() {
    openModal('modal-create-z2');
    document.getElementById('z2-items-tbody').innerHTML = '';
    addZ2ItemRow();
    var deferred = getDeferred().filter(function (d) {
        return d.status === 'pending';
    });
    var container = document.getElementById('z2-checkboxes');
    if (container) {
        if (!deferred.length) {
            container.innerHTML = '<div style="color:var(--text-muted);padding:8px">Нет отложенных товаров</div>';
        } else {
            container.innerHTML = deferred.map(function (d) {
                var detail = (d.items || []).map(function (it) {
                    return '<div style="padding:2px 0 2px 24px;font-size:0.9em;color:var(--text-muted)">' + esc(it.productName) + ' \xD7 ' + it.quantity + ' = ' + fmt(it.total) + '</div>';
                }).join('');
                return '<div style="padding:6px 0;border-bottom:1px solid var(--border)">' + '<label style="display:flex;align-items:center;gap:8px;cursor:pointer">' + '<input type="checkbox" value="' + d.id + '" onchange="updateZ2TypeUI()"> ' + '<strong>' + esc(d.customerName || 'Без клиента') + '</strong> \u2014 ' + fmt(d.total) + ' (' + (d.items ? d.items.length : 0) + ' поз.)</label>' + detail + '</div>';
            }).join('');
        }
    }
    document.getElementById('z2-type').value = 'manual';
    updateZ2TypeUI();
}

function updateInvoiceTypeUI() {
    var type = document.getElementById('invoice-type').value;
    var manual = document.getElementById('invoice-manual-input');
    var deferredSel = document.getElementById('invoice-deferred-select');
    if (manual)
        manual.style.display = type === 'manual' ? '' : 'none';
    if (deferredSel)
        deferredSel.style.display = type === 'deferred' ? '' : 'none';
}

function updateZ2TypeUI() {
    var type = document.getElementById('z2-type').value;
    var manual = document.getElementById('z2-manual-input');
    var deferredSel = document.getElementById('z2-deferred-select');
    if (manual)
        manual.style.display = type === 'manual' ? '' : 'none';
    if (deferredSel)
        deferredSel.style.display = type === 'deferred' ? '' : 'none';
}

function addInvoiceItemRow() {
    addDocItemRow('invoice-items-tbody');
}

function addZ2ItemRow() {
    addDocItemRow('z2-items-tbody');
}

function addSFItemRow() {
    addDocItemRow('sf-items-tbody');
}

function saveNewInvoice() {
    var type = document.getElementById('invoice-type').value;
    var items = [];
    var idsToRemove = [];
    if (type === 'deferred') {
        var checks = document.querySelectorAll('#deferred-checkboxes input:checked');
        if (!checks.length) {
            toast('Выберите отложенные товары', 'err');
            return;
        }
        var deferred = getDeferred();
        var checkedIds = [];
        checks.forEach(function (cb) {
            checkedIds.push(cb.value);
        });
        deferred.forEach(function (d) {
            if (checkedIds.indexOf(d.id) >= 0) {
                (d.items || []).forEach(function (it) {
                    items.push({
                        productCode: it.productCode,
                        productName: it.productName,
                        quantity: it.quantity,
                        unitPrice: it.unitPrice,
                        total: it.total
                    });
                });
                idsToRemove.push(d.id);
            }
        });
    } else {
        items = getDocItemsFromTable('invoice-items-tbody');
        if (!items.length) {
            toast('Добавьте товары в таблицу', 'err');
            return;
        }
    }
    var customerName = document.getElementById('invoice-customer-name').value.trim();
    var customerPhone = document.getElementById('invoice-customer-phone').value.trim();
    var docs = getDocuments();
    var docItems = getDocumentItems();
    var templateMeta = {};
    try {
        var tpl = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('receipt_template')) || JSON.parse(localStorage.getItem('ap_selected_template') || 'null');
        if (tpl) {
            templateMeta = {
                storeName: tpl.storeName,
                bin: tpl.bin,
                iik: tpl.iik,
                bik: tpl.bik,
                bankName: tpl.bankName,
                kbe: tpl.kbe,
                paymentCode: tpl.paymentCode,
                beneficiary: tpl.beneficiary,
                address: tpl.address,
                phone: tpl.phone,
                directorName: tpl.directorName,
                directorPosition: tpl.directorPosition,
                extra: tpl.extra
            };
        }
    } catch (e) {
    }
    var docId = uid();
    if (type === 'deferred' && idsToRemove.length === 1) {
        docId = idsToRemove[0];
        docs = docs.map(function (d) {
            if (d.id !== docId)
                return d;
            return Object.assign({}, d, {
                type: 'invoice',
                docType: 'invoice',
                items: items,
                clientName: customerName,
                clientPhone: customerPhone,
                total: items.reduce(function (s, it) {
                    return s + (it.total || it.unitPrice * it.quantity);
                }, 0),
                status: 'pending',
                date: new Date().toISOString(),
                documentDate: new Date().toISOString(),
                meta: { storeInfo: templateMeta }
            });
        });
    } else if (type === 'deferred' && idsToRemove.length > 1) {
        docId = uid();
        docs = docs.map(function (d) {
            if (idsToRemove.indexOf(d.id) >= 0) {
                return Object.assign({}, d, { status: 'completed' });
            }
            return d;
        });
        docs.unshift({
            id: docId,
            type: 'invoice',
            docType: 'invoice',
            number: '',
            docNumber: '',
            items: items,
            clientName: customerName,
            clientPhone: customerPhone,
            total: items.reduce(function (s, it) {
                return s + (it.total || it.unitPrice * it.quantity);
            }, 0),
            status: 'pending',
            date: new Date().toISOString(),
            documentDate: new Date().toISOString(),
            meta: { storeInfo: templateMeta }
        });
    } else {
        var doc = {
            id: docId,
            type: 'invoice',
            docType: 'invoice',
            number: '',
            docNumber: '',
            items: items,
            clientName: customerName,
            clientPhone: customerPhone,
            total: items.reduce(function (s, it) {
                return s + (it.total || it.unitPrice * it.quantity);
            }, 0),
            status: 'pending',
            date: new Date().toISOString(),
            documentDate: new Date().toISOString(),
            meta: { storeInfo: templateMeta }
        };
        docs.unshift(doc);
    }
    setDocuments(docs);
    items.forEach(function (it) {
        docItems.push({
            id: uid(),
            documentId: docId,
            storeId: null,
            productId: null,
            productCode: it.productCode || '',
            productName: it.productName || '',
            unit: 'шт',
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
            createdAt: new Date().toISOString()
        });
    });
    setDocumentItems(docItems);
    if (idsToRemove.length) {
        var allDef = getDeferred();
        allDef.forEach(function (d) {
            if (idsToRemove.indexOf(d.id) >= 0) {
                d.status = 'completed';
                d.completedAt = new Date().toISOString();
            }
        });
        setDeferred(allDef);
    }
    if (type === 'deferred') {
        clearSaleSelection(true);
        renderPosCatBrowser();
    }
    toast('Счет на оплату создан', 'ok');
    closeModal('modal-create-invoice');
    renderDocuments();
}

function saveNewZ2() {
    var type = document.getElementById('z2-type').value;
    var items = [];
    var idsToRemove = [];
    if (type === 'deferred') {
        var checks = document.querySelectorAll('#z2-checkboxes input:checked');
        if (!checks.length) {
            toast('Выберите отложенные товары', 'err');
            return;
        }
        var deferred = getDeferred();
        var checkedIds = [];
        checks.forEach(function (cb) {
            checkedIds.push(cb.value);
        });
        deferred.forEach(function (d) {
            if (checkedIds.indexOf(d.id) >= 0) {
                (d.items || []).forEach(function (it) {
                    items.push({
                        productCode: it.productCode,
                        productName: it.productName,
                        quantity: it.quantity,
                        unitPrice: it.unitPrice,
                        total: it.total
                    });
                });
                idsToRemove.push(d.id);
            }
        });
    } else {
        items = getDocItemsFromTable('z2-items-tbody');
        if (!items.length) {
            toast('Добавьте товары в таблицу', 'err');
            return;
        }
    }
    var recipientName = document.getElementById('z2-recipient-name').value.trim();
    var docs = getDocuments();
    var docItems = getDocumentItems();
    var templateMeta = {};
    try {
        var tpl = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('receipt_template')) || JSON.parse(localStorage.getItem('ap_selected_template') || 'null');
        if (tpl) {
            templateMeta = {
                storeName: tpl.storeName,
                bin: tpl.bin,
                iik: tpl.iik,
                bik: tpl.bik,
                bankName: tpl.bankName,
                kbe: tpl.kbe,
                paymentCode: tpl.paymentCode,
                beneficiary: tpl.beneficiary,
                address: tpl.address,
                phone: tpl.phone,
                directorName: tpl.directorName,
                directorPosition: tpl.directorPosition,
                extra: tpl.extra
            };
        }
    } catch (e) {
    }
    var docId = uid();
    if (type === 'deferred' && idsToRemove.length === 1) {
        docId = idsToRemove[0];
        docs = docs.map(function (d) {
            if (d.id !== docId)
                return d;
            return Object.assign({}, d, {
                type: 'z2',
                docType: 'z2',
                items: items,
                recipientName: recipientName,
                total: items.reduce(function (s, it) {
                    return s + (it.total || it.unitPrice * it.quantity);
                }, 0),
                status: 'pending',
                date: new Date().toISOString(),
                documentDate: new Date().toISOString(),
                meta: { storeInfo: templateMeta }
            });
        });
    } else if (type === 'deferred' && idsToRemove.length > 1) {
        docId = uid();
        docs = docs.map(function (d) {
            if (idsToRemove.indexOf(d.id) >= 0) {
                return Object.assign({}, d, { status: 'completed' });
            }
            return d;
        });
        docs.unshift({
            id: docId,
            type: 'z2',
            docType: 'z2',
            number: '',
            docNumber: '',
            items: items,
            recipientName: recipientName,
            total: items.reduce(function (s, it) {
                return s + (it.total || it.unitPrice * it.quantity);
            }, 0),
            status: 'pending',
            date: new Date().toISOString(),
            documentDate: new Date().toISOString(),
            meta: { storeInfo: templateMeta }
        });
    } else {
        var doc = {
            id: docId,
            type: 'z2',
            docType: 'z2',
            number: '',
            docNumber: '',
            items: items,
            recipientName: recipientName,
            total: items.reduce(function (s, it) {
                return s + (it.total || it.unitPrice * it.quantity);
            }, 0),
            status: 'pending',
            date: new Date().toISOString(),
            documentDate: new Date().toISOString(),
            meta: { storeInfo: templateMeta }
        };
        docs.unshift(doc);
    }
    setDocuments(docs);
    items.forEach(function (it) {
        docItems.push({
            id: uid(),
            documentId: docId,
            storeId: null,
            productId: null,
            productCode: it.productCode || '',
            productName: it.productName || '',
            unit: 'шт',
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
            createdAt: new Date().toISOString()
        });
    });
    setDocumentItems(docItems);
    if (idsToRemove.length) {
        var allDef = getDeferred();
        allDef.forEach(function (d) {
            if (idsToRemove.indexOf(d.id) >= 0) {
                d.status = 'completed';
                d.completedAt = new Date().toISOString();
            }
        });
        setDeferred(allDef);
    }
    if (type === 'deferred') {
        clearSaleSelection(true);
        renderPosCatBrowser();
    }
    toast('Накладная З-2 создана', 'ok');
    closeModal('modal-create-z2');
    renderDocuments();
}

function openCreateSFFModal() {
    openModal('modal-create-sf');
    document.getElementById('sf-customer-iin').value = '';
    document.getElementById('sf-customer-address').value = '';
    document.getElementById('sf-items-tbody').innerHTML = '';
    addSFItemRow();
}

function saveNewSFF() {
    var customerName = document.getElementById('sf-customer-name').value.trim();
    var customerIIN = document.getElementById('sf-customer-iin').value.trim();
    var customerAddress = document.getElementById('sf-customer-address').value.trim();
    var items = getDocItemsFromTable('sf-items-tbody');
    if (!customerName) {
        toast('Введите покупателя', 'err');
        return;
    }
    if (!items.length) {
        toast('Добавьте товары', 'err');
        return;
    }
    var templateMeta = {};
    try {
        var tpl = (window.DataService && window.DataService.getAppData && window.DataService.getAppData('receipt_template')) || JSON.parse(localStorage.getItem('ap_selected_template') || 'null');
        if (tpl) {
            templateMeta = {
                storeName: tpl.storeName,
                bin: tpl.bin,
                iik: tpl.iik,
                bik: tpl.bik,
                bankName: tpl.bankName,
                kbe: tpl.kbe,
                paymentCode: tpl.paymentCode,
                beneficiary: tpl.beneficiary,
                address: tpl.address,
                phone: tpl.phone,
                directorName: tpl.directorName,
                directorPosition: tpl.directorPosition,
                extra: tpl.extra
            };
        }
    } catch (e) {
    }
    var docId = uid();
    var docs = getDocuments();
    var docItems = getDocumentItems();
    var total = items.reduce(function (s, it) {
        return s + (it.total || it.unitPrice * it.quantity);
    }, 0);
    var doc = {
        id: docId,
        type: 'invoice_sf',
        docType: 'invoice_sf',
        number: '',
        docNumber: '',
        items: items,
        customerName: customerName,
        customerIIN: customerIIN,
        customerAddress: customerAddress,
        total: total,
        status: 'pending',
        date: new Date().toISOString(),
        documentDate: new Date().toISOString(),
        meta: {
            customerIIN: customerIIN,
            customerAddress: customerAddress,
            storeInfo: templateMeta
        }
    };
    docs.unshift(doc);
    setDocuments(docs);
    items.forEach(function (it) {
        docItems.push({
            id: uid(),
            documentId: docId,
            storeId: null,
            productId: null,
            productCode: it.productCode || '',
            productName: it.productName || '',
            unit: 'шт',
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total,
            createdAt: new Date().toISOString()
        });
    });
    setDocumentItems(docItems);
    toast('Счёт-фактура создан', 'ok');
    closeModal('modal-create-sf');
    renderDocuments();
}

function openCreatePKOModal() {
    document.getElementById('pko-payer').value = '';
    document.getElementById('pko-basis').value = '';
    document.getElementById('pko-amount').value = 0;
    openModal('modal-create-pko');
}

function saveNewPKO() {
    var payer = document.getElementById('pko-payer').value.trim();
    var basis = document.getElementById('pko-basis').value.trim();
    var amount = parseFloat(document.getElementById('pko-amount').value) || 0;
    if (!payer) {
        toast('Введите от кого получено', 'err');
        return;
    }
    if (!basis) {
        toast('Введите основание', 'err');
        return;
    }
    if (amount <= 0) {
        toast('Введите сумму', 'err');
        return;
    }
    var docId = uid();
    var docs = getDocuments();
    var doc = {
        id: docId,
        type: 'pko',
        docType: 'pko',
        number: '',
        docNumber: '',
        customerName: payer,
        basis: basis,
        total: amount,
        status: 'issued',
        date: new Date().toISOString(),
        documentDate: new Date().toISOString(),
        meta: {}
    };
    docs.unshift(doc);
    setDocuments(docs);
    toast('ПКО создан: ' + fmt(amount) + ' \u20B8 от ' + payer, 'ok');
    closeModal('modal-create-pko');
    renderDocuments();
}

function buildClassicInvoiceHTML(doc) {
    var si = doc.meta && doc.meta.storeInfo || {};
    var storeName = si.storeName || 'Организация';
    var bin = si.bin || '\u2014';
    var iik = si.iik || '\u2014';
    var bik = si.bik || '\u2014';
    var bankName = si.bankName || '\u2014';
    var kbe = si.kbe || '\u2014';
    var beneficiary = si.beneficiary || storeName;
    var paymentCode = si.paymentCode || '';
    var address = si.address || '';
    var phone = si.phone || '';
    var directorName = si.directorName || '';
    var directorPosition = si.directorPosition || 'Директор';
    var extraInfo = si.extra || '';
    var logoData = si.logo || '';
    var contractText = doc.meta && doc.meta.contract || 'Без договора';
    var amountWords = window.classicAmountWords(doc.total);
    var totalQty = 0;
    (doc.items || []).forEach(function (it) {
        totalQty += Number(it.quantity || 0);
    });
    var h = '<div style="font-family:\'Times New Roman\',Times,serif;color:#000;max-width:980px;margin:0 auto;padding:24px 20px;font-size:13px;line-height:1.4">';
    h += '<div style="font-size:11px;line-height:1.4;padding:8px 12px;border:1px solid #000;background:#fafafa;margin-bottom:16px">' + 'Внимание! Оплата данного счета означает согласие с условиями поставки товара. Уведомление об оплате обязательно, в противном случае не гарантируется наличие товара на складе. Товар отпускается по факту прихода денег на р/с Поставщика, самовывозом, при наличии доверенности и документов, удостоверяющих личность.' + '</div>';
    h += '<div style="text-align:center;margin-bottom:20px"><div style="font-weight:700;font-size:20px;letter-spacing:1px">Счет на оплату \u2116 ' + escapeHtml(doc.docNumber || '') + '</div>' + '<div style="margin-top:4px;font-size:13px">от ' + fmtDate(doc.documentDate) + '</div></div>';
    h += '<div style="margin-bottom:12px">';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;border:1px solid #000;padding:8px;font-size:12px">' + '<div><strong>Бенефициар:</strong><br>' + escapeHtml(beneficiary) + '</div>' + '<div><strong>ИИК:</strong><br>' + escapeHtml(iik) + '</div>' + '<div><strong>КБЕ:</strong><br>' + escapeHtml(kbe || '\u2014') + '</div>' + '</div>';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;border:1px solid #000;border-top:none;padding:8px;font-size:12px">' + '<div><strong>ИИН:</strong> ' + escapeHtml(bin) + '</div>' + '<div></div><div></div>' + '</div>';
    h += '<div style="display:grid;grid-template-columns:2fr 1fr 2fr;gap:8px;border:1px solid #000;border-top:none;padding:8px;font-size:12px">' + '<div><strong>Банк бенефициара:</strong></div>' + '<div><strong>БИК:</strong></div>' + '<div><strong>Код назначения платежа:</strong></div>' + '</div>';
    h += '<div style="display:grid;grid-template-columns:2fr 1fr 2fr;gap:8px;border:1px solid #000;border-top:none;padding:8px;font-size:12px">' + '<div>' + escapeHtml(bankName) + '</div>' + '<div>' + escapeHtml(bik) + '</div>' + '<div>' + (paymentCode ? escapeHtml(paymentCode) : '') + '</div>' + '</div>';
    h += '</div>';
    h += '<div style="margin-bottom:12px;font-size:12px">';
    h += '<div><strong>Поставщик:</strong> БИН / ИИН ' + escapeHtml(bin) + ', ' + escapeHtml(storeName) + '</div>';
    var custIIN = si.customerIIN || '';
    var custAddr = si.customerAddress || '';
    var buyerStr = escapeHtml(doc.customerName || '\u2014');
    if (custIIN)
        buyerStr = 'БИН / ИИН ' + escapeHtml(custIIN) + ',' + buyerStr;
    if (custAddr)
        buyerStr += ' ' + escapeHtml(custAddr);
    h += '<div><strong>Покупатель:</strong> ' + buyerStr + '</div>';
    h += '<div><strong>Договор:</strong> ' + escapeHtml(contractText) + '</div>';
    h += '</div>';
    h += '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:14px">';
    h += '<thead><tr>' + '<th style="padding:8px;border:1px solid #000;text-align:center;width:36px">\u2116</th>' + '<th style="padding:8px;border:1px solid #000;text-align:left">Наименование</th>' + '<th style="padding:8px;border:1px solid #000;text-align:center;width:60px">Кол-во</th>' + '<th style="padding:8px;border:1px solid #000;text-align:center;width:50px">Ед.</th>' + '<th style="padding:8px;border:1px solid #000;text-align:right;width:100px">Цена</th>' + '<th style="padding:8px;border:1px solid #000;text-align:right;width:120px">Сумма</th>' + '</tr></thead><tbody>';
    (doc.items || []).forEach(function (it, i) {
        h += '<tr>' + '<td style="padding:8px;border:1px solid #000;text-align:center">' + (i + 1) + '</td>' + '<td style="padding:8px;border:1px solid #000">' + escapeHtml(it.productName || it.productCode || '') + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:center">' + (it.quantity || 0) + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:center">' + escapeHtml(it.unit || 'шт') + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:right">' + fmt(it.unitPrice) + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:right">' + fmt(it.total) + '</td>' + '</tr>';
    });
    h += '</tbody></table>';
    h += '<div style="text-align:right;margin-bottom:6px;font-size:15px;font-weight:700">Итого: ' + fmt(doc.total) + '</div>';
    h += '<div style="margin-bottom:14px;font-size:12px">';
    h += '<div>Всего наименований ' + (doc.items || []).length + ', на сумму ' + Number(doc.total || 0).toLocaleString('ru-RU', { minimumFractionDigits: 2 }) + ' KZT</div>';
    h += '<div><strong>Всего к оплате:</strong> ' + escapeHtml(amountWords) + '</div>';
    h += '</div>';
    h += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-top:20px">';
    h += '<div style="text-align:left">Исполнитель</div>';
    h += '<div style="text-align:right">/' + escapeHtml(directorName || '________') + '/</div>';
    h += '</div>';
    h += '</div>';
    return h;
}

function buildClassicZ2HTML(doc) {
    var si = doc.meta && doc.meta.storeInfo || {};
    var storeName = si.storeName || 'Организация';
    var bin = si.bin || '\u2014';
    var address = si.address || '';
    var phone = si.phone || '';
    var directorName = si.directorName || '';
    var directorPosition = si.directorPosition || 'Директор';
    var extraInfo = si.extra || '';
    var totalQty = 0;
    (doc.items || []).forEach(function (it) {
        totalQty += Number(it.quantity || 0);
    });
    var h = '<div style="font-family:\'Times New Roman\',Times,serif;color:#000;max-width:980px;margin:0 auto;padding:24px 20px;font-size:13px;line-height:1.4">';
    h += '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">' + '<div style="font-size:12px;line-height:1.4">Приложение 26<br>к приказу Министра финансов<br>Республики Казахстан<br>от 20 декабря 2012 года \u2116 562</div>' + '<div style="font-size:16px;font-weight:700">Форма 3-2</div></div>';
    h += '<div style="text-align:center;font-size:18px;font-weight:700;margin-bottom:14px">НАКЛАДНАЯ НА ОТПУСК ЗАПАСОВ НА СТОРОНУ</div>';
    var senderLines = '<strong>Организация (индивидуальный предприниматель) - отправитель:</strong> ' + escapeHtml(storeName) + '<br><strong>БИН/ИИН:</strong> ' + escapeHtml(bin);
    if (address)
        senderLines += '<br><strong>Адрес:</strong> ' + escapeHtml(address);
    if (phone)
        senderLines += '<br><strong>Тел:</strong> ' + escapeHtml(phone);
    if (directorName)
        senderLines += '<br><strong>' + escapeHtml(directorPosition) + ':</strong> ' + escapeHtml(directorName);
    if (extraInfo)
        senderLines += '<br><em>' + escapeHtml(extraInfo) + '</em>';
    h += '<div style="margin-bottom:14px">' + senderLines + '</div>';
    var custIIN = si.customerIIN || '';
    var custAddr = si.customerAddress || '';
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:16px">';
    var recHtml = '<strong>Организация (ИП) - получатель:</strong><br>' + escapeHtml(doc.customerName || '\u2014');
    if (custIIN)
        recHtml += '<br><strong>БИН/ИИН:</strong> ' + escapeHtml(custIIN);
    if (custAddr)
        recHtml += '<br>' + escapeHtml(custAddr);
    h += '<div>' + recHtml + '</div>';
    h += '<div><strong>Номер документа:</strong> ' + escapeHtml(doc.docNumber || '') + '<br><strong>Дата составления:</strong> ' + fmtDate(doc.documentDate) + '</div>';
    h += '</div>';
    h += '<table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:16px">';
    h += '<thead><tr>' + '<th style="padding:8px;border:1px solid #000;text-align:center;width:36px">\u2116 п/п</th>' + '<th style="padding:8px;border:1px solid #000;text-align:center;width:100px">Номенклатурный номер</th>' + '<th style="padding:8px;border:1px solid #000;text-align:left">Наименование, характеристика</th>' + '<th style="padding:8px;border:1px solid #000;text-align:center;width:50px">Ед.изм.</th>' + '<th style="padding:8px;border:1px solid #000;text-align:right;width:70px">Количество</th>' + '<th style="padding:8px;border:1px solid #000;text-align:right;width:100px">Цена за единицу, KZT</th>' + '<th style="padding:8px;border:1px solid #000;text-align:right;width:120px">Сумма с НДС, KZT</th>' + '</tr></thead><tbody>';
    (doc.items || []).forEach(function (it, i) {
        h += '<tr>' + '<td style="padding:8px;border:1px solid #000;text-align:center">' + (i + 1) + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:center">' + escapeHtml(it.productCode || '') + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:left">' + escapeHtml(it.productName || '') + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:center">' + escapeHtml(it.unit || 'шт') + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:right">' + (it.quantity || 0) + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:right">' + fmt(it.unitPrice) + '</td>' + '<td style="padding:8px;border:1px solid #000;text-align:right">' + fmt(it.total) + '</td>' + '</tr>';
    });
    h += '</tbody></table>';
    h += '<div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:13px">' + '<div><strong>Итого наименований:</strong> ' + (doc.items || []).length + ', <strong>на сумму:</strong> ' + fmt(doc.total) + '</div>' + '<div><strong>Всего отпущено количество:</strong> ' + totalQty + '</div>' + '</div>';
    h += '<div style="display:flex;justify-content:space-between;gap:14px;font-size:12px">';
    h += '<div style="flex:1;min-width:300px">';
    h += '<div style="border:1px solid #000;padding:10px;margin-bottom:8px">' + '<div style="margin-bottom:6px"><strong>Отпуск разрешил:</strong></div>' + '<div style="display:flex;justify-content:space-between;margin-bottom:4px">' + '<span style="font-size:11px">' + escapeHtml(directorPosition) + '</span>' + '<span style="font-size:11px">_______________</span>' + '<span style="font-size:11px">_______________</span>' + '</div>' + '<div style="font-size:10px;text-align:right">должность&nbsp;&nbsp;&nbsp;подпись&nbsp;&nbsp;&nbsp;расшифровка подписи</div>' + '</div>';
    h += '<div style="border:1px solid #000;padding:10px;margin-bottom:8px">' + '<div style="margin-bottom:6px"><strong>Главный бухгалтер:</strong></div>' + '<div style="display:flex;justify-content:flex-end;gap:20px;margin-bottom:4px">' + '<span style="font-size:11px">_______________</span>' + '<span style="font-size:11px">_______________</span>' + '</div>' + '<div style="font-size:10px;text-align:right">подпись&nbsp;&nbsp;&nbsp;расшифровка подписи</div>' + '</div>';
    h += '<div style="border:1px solid #000;padding:10px">' + '<div style="margin-bottom:6px"><strong>Отпустил:</strong></div>' + '<div style="display:flex;justify-content:flex-end;gap:20px;margin-bottom:4px">' + '<span style="font-size:11px">_______________</span>' + '<span style="font-size:11px">_______________</span>' + '</div>' + '<div style="font-size:10px;text-align:right">подпись&nbsp;&nbsp;&nbsp;расшифровка подписи</div>' + '</div>';
    h += '</div>';
    h += '<div style="flex:1;min-width:300px">';
    h += '<div style="border:1px solid #000;padding:10px">' + '<div style="margin-bottom:6px"><strong>Запасы получил:</strong></div>' + '<div style="display:flex;justify-content:flex-end;gap:20px;margin-bottom:4px">' + '<span style="font-size:11px">_______________</span>' + '<span style="font-size:11px">_______________</span>' + '</div>' + '<div style="font-size:10px;text-align:right;margin-bottom:8px">подпись&nbsp;&nbsp;&nbsp;расшифровка подписи</div>' + '<div style="font-size:11px;border-top:1px solid #ccc;padding-top:6px">' + 'по доверенности \u2116 ________________ от ___ _________ 20__ года<br>выданной __________________________________________________' + '</div>' + '</div>';
    h += '</div>';
    h += '</div>';
    h += '</div>';
    return h;
}

function buildClassicSFHTML(doc) {
    var store = window.ApAuth && window.ApAuth.getCurrentStore();
    var si = doc.meta && doc.meta.storeInfo || {};
    var storeName = si.storeName || (store ? store.storeName : 'SANAQ');
    var storeBin = si.bin || (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_bin')) || localStorage.getItem('ap_store_bin') || '';
    var storeNdscert = si.ndsCert || (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_nds_cert')) || localStorage.getItem('ap_store_nds_cert') || '';
    var storeAddr = si.address || (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_address')) || localStorage.getItem('ap_store_address') || '';
    var bankName = si.bankName || (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_bank_name')) || localStorage.getItem('ap_store_bank_name') || '';
    var iik = si.iik || (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_iik')) || localStorage.getItem('ap_store_iik') || '';
    var bik = si.bik || (window.DataService && window.DataService.getAppData && window.DataService.getAppData('store_bik')) || localStorage.getItem('ap_store_bik') || '';
    var items = doc.items || [];
    var total = doc.total || 0;
    var ndsRate = 12;
    var totalNoNds = 0, totalNds = 0;
    function ndsRow(v) {
        return v * ndsRate / (100 + ndsRate);
    }
    function ndsOnly(v) {
        return v - ndsRow(v);
    }
    var h = '<div style="font-family:\'Times New Roman\',Times,serif;color:#000;max-width:960px;margin:0 auto;padding:24px 20px;font-size:12px;line-height:1.4">';
    h += '<div style="font-size:10px;color:#555;text-align:right;margin-bottom:4px">Форма по ОКУД 0710002</div>';
    h += '<div style="text-align:center;font-size:18px;font-weight:700;margin-bottom:4px">СЧЁТ-ФАКТУРА</div>';
    h += '<div style="text-align:center;font-size:12px;color:#333;margin-bottom:16px">Счёт-фактура \u2116 ' + (doc.docNumber || doc.number || doc.id.slice(0, 6)) + ' от "' + fmtDate(doc.documentDate).replace(/(\d+)\.(\d+)\.(\d+).*/, '$1 $2 $3') + '"</div>';
    h += '<div style="text-align:center;font-size:11px;color:#666;margin-bottom:16px">Дата совершения оборота: "' + fmtDate(doc.documentDate).replace(/(\d+)\.(\d+)\.(\d+).*/, '$1 $2 $3') + '"</div>';
    h += '<div style="margin-bottom:12px">';
    h += '<div style="font-weight:700;font-size:13px;margin-bottom:4px">Продавец:</div>';
    h += '<table style="width:100%;border-collapse:collapse;font-size:11px">';
    h += '<tr><td style="padding:2px 4px;width:160px"><strong>Наименование:</strong></td><td style="padding:2px 4px">' + escapeHtml(storeName) + '</td></tr>';
    h += '<tr><td style="padding:2px 4px"><strong>БИН:</strong></td><td style="padding:2px 4px">' + escapeHtml(storeBin) + '</td></tr>';
    h += '<tr><td style="padding:2px 4px"><strong>Адрес:</strong></td><td style="padding:2px 4px">' + escapeHtml(storeAddr || '\u2014') + '</td></tr>';
    h += '<tr><td style="padding:2px 4px"><strong>Свидетельство НДС:</strong></td><td style="padding:2px 4px">' + escapeHtml(storeNdscert || '\u2014') + '</td></tr>';
    h += '</table>';
    if (iik || bik || bankName) {
        h += '<div style="font-size:11px;margin-top:4px;padding:4px;background:#f5f5f5">' + '<strong>Банковские реквизиты:</strong> ' + (iik ? 'ИИК ' + escapeHtml(iik) + '; ' : '') + (bik ? 'БИК ' + escapeHtml(bik) + '; ' : '') + (bankName ? escapeHtml(bankName) : '') + '</div>';
    }
    h += '</div>';
    var custIIN = doc.customerIIN || doc.meta && doc.meta.customerIIN || '';
    var custAddr = doc.customerAddress || doc.meta && doc.meta.customerAddress || '';
    h += '<div style="margin-bottom:12px">';
    h += '<div style="font-weight:700;font-size:13px;margin-bottom:4px">Покупатель:</div>';
    h += '<table style="width:100%;border-collapse:collapse;font-size:11px">';
    h += '<tr><td style="padding:2px 4px;width:160px"><strong>Наименование:</strong></td><td style="padding:2px 4px">' + escapeHtml(doc.customerName || '\u2014') + '</td></tr>';
    h += '<tr><td style="padding:2px 4px"><strong>БИН/ИИН:</strong></td><td style="padding:2px 4px">' + escapeHtml(custIIN || '\u2014') + '</td></tr>';
    h += '<tr><td style="padding:2px 4px"><strong>Адрес:</strong></td><td style="padding:2px 4px">' + escapeHtml(custAddr || '\u2014') + '</td></tr>';
    h += '</table>';
    h += '</div>';
    h += '<table style="width:100%;border-collapse:collapse;margin-bottom:12px;font-size:11px">';
    h += '<thead><tr>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:center;width:30px">\u2116</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:left">Наименование товара</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:center;width:40px">Ед.</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:center;width:60px">Кол-во</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:right;width:90px">Цена, \u20B8</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:right;width:100px">Стоимость, \u20B8</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:center;width:45px">НДС%</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:right;width:100px">Сумма НДС, \u20B8</th>' + '<th style="padding:5px 4px;border:1.5px solid #000;text-align:right;width:110px">Итого с НДС, \u20B8</th>' + '</tr></thead><tbody>';
    if (!items.length) {
        h += '<tr><td colspan="9" style="padding:12px;border:1.5px solid #000;text-align:center;color:#888">Нет товаров</td></tr>';
    } else {
        items.forEach(function (it, i) {
            var cost = it.total || it.unitPrice * it.quantity;
            var priceNoNds = ndsOnly(it.unitPrice || 0);
            var ndsAmt = ndsRow(cost);
            var incNds = cost;
            totalNoNds += ndsOnly(cost);
            totalNds += ndsAmt;
            h += '<tr>' + '<td style="padding:4px;border:1.5px solid #000;text-align:center">' + (i + 1) + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:left">' + escapeHtml(it.productName || '') + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:center">' + (it.unit || 'шт') + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:center">' + (it.quantity || 0) + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:right">' + fmt(priceNoNds) + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:right">' + fmt(ndsOnly(cost)) + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:center">' + ndsRate + '%</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:right">' + fmt(ndsAmt) + '</td>' + '<td style="padding:4px;border:1.5px solid #000;text-align:right;font-weight:600">' + fmt(incNds) + '</td>' + '</tr>';
        });
    }
    h += '</tbody></table>';
    h += '<div style="display:flex;justify-content:flex-end;gap:24px;margin-bottom:16px;font-size:12px">';
    h += '<div><strong>Итого без НДС:</strong> ' + fmt(totalNoNds) + ' \u20B8</div>';
    h += '<div><strong>Сумма НДС (' + ndsRate + '%):</strong> ' + fmt(totalNds) + ' \u20B8</div>';
    h += '<div style="font-size:14px;font-weight:700"><strong>Итого с НДС:</strong> ' + fmt(totalNoNds + totalNds) + ' \u20B8</div>';
    h += '</div>';
    h += '<div style="font-size:11px;color:#555;text-align:right;margin-bottom:16px">Всего наименований: ' + items.length + '</div>';
    h += '<div style="margin-top:24px;border-top:1.5px solid #000;padding-top:12px;font-size:11px">';
    h += '<div style="display:flex;justify-content:space-between;max-width:600px;margin-bottom:4px">' + '<span><strong>Руководитель / ИП:</strong> ______________________</span>' + '<span><strong>Главный бухгалтер:</strong> ______________________</span>' + '</div>';
    h += '<div style="font-size:10px;color:#555;text-align:right;margin-top:2px">Дата подписания: "' + fmtDate(doc.documentDate).replace(/(\d+)\.(\d+)\.(\d+).*/, '$1 $2 $3') + '"</div>';
    h += '</div>';
    h += '</div>';
    return h;
}

function buildClassicPKOHTML(doc) {
    var h = '<div style="font-family:\'Times New Roman\',Times,serif;color:#000;max-width:700px;margin:0 auto;padding:24px 20px;font-size:13px;line-height:1.4">';
    h += '<div style="text-align:center;font-size:16px;font-weight:700;margin-bottom:8px">ПРИХОДНЫЙ КАССОВЫЙ ОРДЕР</div>';
    h += '<div style="display:flex;justify-content:space-between;margin-bottom:16px">' + '<span><strong>\u2116:</strong> ' + (doc.docNumber || doc.number || doc.id.slice(0, 6)) + '</span>' + '<span><strong>Дата:</strong> ' + fmtDate(doc.documentDate) + '</span>' + '</div>';
    h += '<div style="border:1px solid #000;padding:16px;margin-bottom:16px">';
    h += '<p><strong>Принято от:</strong> ' + escapeHtml(doc.customerName || doc.payer || '\u2014') + '</p>';
    h += '<p><strong>Основание:</strong> ' + escapeHtml(doc.basis || '\u2014') + '</p>';
    h += '<p style="font-size:16px;font-weight:700;text-align:right">Сумма: ' + fmt(doc.total || 0) + ' \u20B8</p>';
    h += '</div>';
    h += '<div style="font-size:12px;margin-top:16px">' + '<div style="display:flex;justify-content:space-between;max-width:500px">' + '<span>Главный бухгалтер: _______________</span>' + '<span>Кассир: _______________</span>' + '</div></div>';
    h += '</div>';
    return h;
}

function openDocumentView(docId) {
    var docs = getDocuments();
    var doc = docs.find(function (d) {
        return d.id === docId;
    });
    if (!doc) {
        toast('Документ не найден', 'err');
        return;
    }
    window._currentDocId = docId;
    var content = document.getElementById('document-view-content');
    var title = document.getElementById('modal-doc-title');
    var dt = doc.type || doc.docType || '';
    var adapted = Object.assign({}, doc, {
        docNumber: doc.number || doc.docNumber || '',
        documentDate: doc.date || doc.documentDate || new Date().toISOString(),
        customerName: doc.clientName || doc.customerName || doc.recipientName || '',
        customerPhone: doc.clientPhone || doc.customerPhone || ''
    });
    if (dt === 'invoice') {
        if (content)
            content.innerHTML = window.buildClassicInvoiceHTML(adapted);
        if (title)
            title.textContent = 'Счет на оплату \u2116' + (doc.number || doc.docNumber || doc.id.slice(0, 6));
    } else if (dt === 'z2') {
        if (content)
            content.innerHTML = window.buildClassicZ2HTML(adapted);
        if (title)
            title.textContent = 'Накладная З-2 \u2116' + (doc.number || doc.docNumber || doc.id.slice(0, 6));
    } else if (dt === 'invoice_sf') {
        if (content)
            content.innerHTML = window.buildClassicSFHTML(adapted);
        if (title)
            title.textContent = 'Счёт-фактура \u2116' + (doc.number || doc.docNumber || doc.id.slice(0, 6));
    } else if (dt === 'pko') {
        if (content)
            content.innerHTML = window.buildClassicPKOHTML(adapted);
        if (title)
            title.textContent = 'ПКО \u2116' + (doc.number || doc.docNumber || doc.id.slice(0, 6));
    } else {
        if (title)
            title.textContent = (dt === 'invoice' ? 'Счет на оплату' : 'Накладная З-2') + ' \u2116' + (doc.number || doc.docNumber || doc.id.slice(0, 6));
        if (content) {
            var clientInfo = dt === 'invoice' ? '<p><strong>Клиент:</strong> ' + esc(doc.clientName || doc.customerName || '\u2014') + (doc.clientPhone || doc.customerPhone ? ' (' + esc(doc.clientPhone || doc.customerPhone) + ')' : '') + '</p>' : '<p><strong>Получатель:</strong> ' + esc(doc.recipientName || '\u2014') + '</p>';
            var itemsHtml = '<table><thead><tr><th>Код</th><th>Товар</th><th>Кол-во</th><th>Цена</th><th>Сумма</th></tr></thead><tbody>';
            (doc.items || []).forEach(function (it) {
                itemsHtml += '<tr><td>' + esc(it.productCode || '') + '</td><td>' + esc(it.productName || '') + '</td><td>' + it.quantity + '</td><td>' + fmt(it.unitPrice) + '</td><td>' + fmt(it.total || it.unitPrice * it.quantity) + '</td></tr>';
            });
            itemsHtml += '</tbody></table>';
            var statusLabel = doc.status === 'pending' ? 'Ожидает' : doc.status === 'paid' ? 'Оплачено' : doc.status === 'issued' ? 'Выписано' : 'Отменено';
            content.innerHTML = '<div style="margin-bottom:16px">' + clientInfo + '<p><strong>Дата:</strong> ' + fmtDate(doc.date || doc.documentDate) + '</p>' + '<p><strong>Статус:</strong> <span class="badge badge-' + (doc.status === 'paid' || doc.status === 'issued' ? 'ok' : doc.status === 'cancelled' ? 'danger' : 'warn') + '">' + statusLabel + '</span></p>' + '<p><strong>Итого:</strong> ' + fmt(doc.total || 0) + ' \u20B8</p></div>' + '<div class="panel"><div class="panel-title">Товары</div>' + itemsHtml + '</div>';
        }
    }
    var statusBtn = document.getElementById('btn-doc-status');
    if (statusBtn) {
        if (dt === 'invoice' || dt === 'invoice_sf') {
            statusBtn.style.display = doc.status === 'pending' ? '' : 'none';
            statusBtn.textContent = '\u2713 Отметить оплаченным';
            statusBtn.onclick = function () {
                changeDocumentStatus(docId, 'paid');
            };
        } else if (dt === 'pko') {
            statusBtn.style.display = 'none';
        } else {
            statusBtn.style.display = doc.status === 'pending' ? '' : 'none';
            statusBtn.textContent = '\uD83D\uDCE6 Отметить выписанным';
            statusBtn.onclick = function () {
                changeDocumentStatus(docId, 'issued');
            };
        }
    }
    openModal('modal-view-document');
}

function changeDocumentStatus(docId, status) {
    var docs = getDocuments();
    var idx = docs.findIndex(function (d) {
        return d.id === docId;
    });
    if (idx < 0) {
        toast('Документ не найден', 'err');
        return;
    }
    docs[idx].status = status;
    setDocuments(docs);
    toast('Статус обновлен', 'ok');
    renderDocuments();
    if (window._currentDocId === docId)
        openDocumentView(docId);
}

function printDocument() {
    var content = document.getElementById('document-view-content');
    if (!content)
        return;
    var w = window.open('', '', 'width=800,height=600');
    if (!w) {
        toast('Разрешите всплывающие окна', 'err');
        return;
    }
    w.document.write('<html><head><title>Печать</title></head><body>' + content.innerHTML + '</body></html>');
    w.document.close();
    w.print();
}

function downloadDocumentExcel() {
    var docId = window._currentDocId;
    if (!docId) {
        toast('Нет открытого документа', 'err');
        return;
    }
    var docs = getDocuments();
    var doc = docs.find(function (d) {
        return d.id === docId;
    });
    if (!doc) {
        toast('Документ не найден', 'err');
        return;
    }
    try {
        var si = doc.meta && doc.meta.storeInfo || {};
        var storeName = si.storeName || 'Организация';
        var bin = si.bin || '\u2014';
        var iik = si.iik || '\u2014';
        var bik = si.bik || '\u2014';
        var bankName = si.bankName || '\u2014';
        var kbe = si.kbe || '\u2014';
        var beneficiary = si.beneficiary || storeName;
        var paymentCode = si.paymentCode || '';
        var address = si.address || '';
        var phone = si.phone || '';
        var directorName = si.directorName || '';
        var directorPosition = si.directorPosition || 'Директор';
        var custIIN = si.customerIIN || '';
        var custAddr = si.customerAddress || '';
        var contractText = doc.meta && doc.meta.contract || 'Без договора';
        var comment = doc.comment || '';
        var isInvoice = (doc.type || doc.docType || '') === 'invoice';
        var customerName = doc.clientName || doc.customerName || doc.recipientName || '\u2014';
        var customerPhone = doc.clientPhone || doc.customerPhone || '';
        var docNumber = doc.number || doc.docNumber || doc.id.slice(0, 6);
        var docDate = doc.date || doc.documentDate ? new Date(doc.date || doc.documentDate).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }) : '\u2014';
        var totalRaw = doc.total || 0;
        var items = doc.items || [];
        var totalQty = items.reduce(function (s, it) {
            return s + Number(it.quantity || 0);
        }, 0);
        var wb = XLSX.utils.book_new();
        var data = [], merges = [];
        function M(r1, c1, r2, c2) {
            merges.push({
                s: {
                    r: r1,
                    c: c1
                },
                e: {
                    r: r2,
                    c: c2
                }
            });
        }
        function cellAt(arr, r, c, val) {
            if (!arr[r])
                arr[r] = [];
            arr[r][c] = val;
        }
        function fmtCell(v, opts) {
            return {
                v: v,
                s: opts || {}
            };
        }
        function fnt(sz, b, i, n) {
            return {
                font: {
                    sz: sz || 10,
                    bold: b || false,
                    italic: i || false,
                    name: 'Arial'
                },
                alignment: {
                    horizontal: n && n.h || 'left',
                    vertical: n && n.v || 'center',
                    wrapText: n && n.w || false
                }
            };
        }
        function tin(s) {
            return { style: s || 'thin' };
        }
        function med() {
            return { style: 'medium' };
        }
        function buildSheetFromData(data, merges) {
            var ws = {};
            var maxR = -1, maxC = -1;
            for (var r = 0; r < data.length; r++) {
                if (!data[r])
                    continue;
                for (var c = 0; c < data[r].length; c++) {
                    var cell = data[r][c];
                    if (cell === undefined || cell === null)
                        continue;
                    if (!cell.t) {
                        if (typeof cell.v === 'number')
                            cell.t = 'n';
                        else if (typeof cell.v === 'boolean')
                            cell.t = 'b';
                        else
                            cell.t = 's';
                    }
                    ws[XLSX.utils.encode_cell({
                        r: r,
                        c: c
                    })] = cell;
                    if (r > maxR)
                        maxR = r;
                    if (c > maxC)
                        maxC = c;
                }
            }
            var refEnd = XLSX.utils.encode_cell({
                r: Math.max(maxR, 0),
                c: Math.max(maxC, 0)
            });
            ws['!ref'] = 'A1:' + refEnd;
            if (merges && merges.length)
                ws['!merges'] = merges;
            return ws;
        }
        function bdr(t, r, b, l) {
            return {
                top: t || {},
                bottom: b || {},
                left: l || {},
                right: r || {}
            };
        }
        if (isInvoice) {
            var C = {
                B: 1,
                D: 3,
                E: 4,
                F: 5,
                G: 6,
                S: 18,
                T: 19,
                U: 20,
                V: 21,
                W: 22,
                X: 23,
                Y: 24,
                Z: 25,
                AA: 26,
                AB: 27,
                AC: 28,
                AD: 29,
                AE: 30,
                AF: 31,
                AG: 32,
                AH: 33,
                AI: 34,
                AJ: 35,
                AK: 36,
                AL: 37,
                AM: 38
            };
            cellAt(data, 0, C.G, {
                v: 'Внимание! Оплата данного счета означает согласие с условиями поставки товара. Уведомление об оплате обязательно, в противном случае не гарантируется наличие товара на складе. Товар отпускается по факту прихода денег на р/с Поставщика, самовывозом, при наличии доверенности и документов удостоверяющих личность.',
                s: {
                    font: fnt(8, false, false, {
                        h: 'center',
                        v: 'center',
                        w: true
                    }).font,
                    alignment: fnt(8, false, false, {
                        h: 'center',
                        v: 'center',
                        w: true
                    }).alignment,
                    border: {
                        top: med(),
                        bottom: med(),
                        left: med(),
                        right: med()
                    }
                }
            });
            M(0, C.G, 5, C.AM);
            cellAt(data, 7, C.B, fmtCell('Образец платежного поручения', fnt(10, true, false, {
                h: 'left',
                v: 'center'
            })));
            function bb(top, right, bottom, left) {
                var b = {};
                if (top)
                    b.top = tin();
                if (right)
                    b.right = tin();
                if (bottom)
                    b.bottom = tin();
                if (left)
                    b.left = tin();
                return b;
            }
            cellAt(data, 8, C.B, {
                v: 'Бенефициар:',
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'left',
                        v: 'top'
                    }).alignment,
                    border: bb(1, 0, 0, 1)
                }
            });
            M(8, C.B, 8, C.U);
            cellAt(data, 8, C.V, {
                v: 'ИИК',
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'top'
                    }).alignment,
                    border: bb(1, 0, 0, 1)
                }
            });
            M(8, C.V, 8, C.AE);
            cellAt(data, 8, C.AF, {
                v: 'Кбе',
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'top'
                    }).alignment,
                    border: bb(1, 1, 0, 1)
                }
            });
            M(8, C.AF, 8, C.AM);
            cellAt(data, 9, C.B, {
                v: beneficiary,
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'left',
                        v: 'top',
                        w: true
                    }).alignment,
                    border: bb(0, 0, 0, 1)
                }
            });
            M(9, C.B, 9, C.U);
            cellAt(data, 9, C.V, {
                v: iik,
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'center',
                        w: true
                    }).alignment,
                    border: bb(0, 0, 0, 1)
                }
            });
            M(9, C.V, 9, C.AC);
            cellAt(data, 9, C.AF, {
                v: kbe,
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'center',
                        w: true
                    }).alignment,
                    border: bb(0, 1, 0, 1)
                }
            });
            M(9, C.AF, 10, C.AM);
            cellAt(data, 10, C.B, {
                v: 'ИИН: ' + bin,
                s: {
                    font: fnt(9, false).font,
                    alignment: fnt(9, false, false, {
                        h: 'left',
                        v: 'top'
                    }).alignment,
                    border: bb(0, 0, 0, 1)
                }
            });
            M(10, C.B, 10, C.U);
            cellAt(data, 11, C.B, {
                v: 'Банк бенефициара:',
                s: {
                    font: fnt(9, false).font,
                    alignment: fnt(9, false, false, {
                        h: 'left',
                        v: 'top'
                    }).alignment,
                    border: bb(1, 0, 0, 1)
                }
            });
            M(11, C.B, 11, C.U);
            cellAt(data, 11, C.V, {
                v: 'БИК',
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'top'
                    }).alignment,
                    border: bb(1, 0, 0, 1)
                }
            });
            M(11, C.V, 11, C.AC);
            cellAt(data, 11, C.AD, {
                v: 'Код назначения платежа',
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'top'
                    }).alignment,
                    border: bb(1, 1, 0, 1)
                }
            });
            M(11, C.AD, 11, C.AM);
            cellAt(data, 12, C.B, {
                v: bankName,
                s: {
                    font: fnt(9, false).font,
                    alignment: fnt(9, false, false, {
                        h: 'left',
                        v: 'top',
                        w: true
                    }).alignment,
                    border: bb(0, 0, 1, 1)
                }
            });
            M(12, C.B, 12, C.U);
            cellAt(data, 12, C.V, {
                v: bik,
                s: {
                    font: fnt(9, true).font,
                    alignment: fnt(9, true, false, {
                        h: 'center',
                        v: 'top',
                        w: true
                    }).alignment,
                    border: bb(0, 0, 1, 1)
                }
            });
            M(12, C.V, 12, C.AC);
            var titles = ['Счет на оплату \u2116 ' + docNumber + ' от ' + docDate];
            var d = doc.date ? new Date(doc.date) : new Date();
            var ms = [
                'января',
                'февраля',
                'марта',
                'апреля',
                'мая',
                'июня',
                'июля',
                'августа',
                'сентября',
                'октября',
                'ноября',
                'декабря'
            ];
            cellAt(data, 15, C.B, fmtCell('Счет на оплату \u2116 ' + docNumber + ' от ' + d.getDate() + ' ' + ms[d.getMonth()] + ' ' + d.getFullYear() + ' г.', fnt(14, true, false, {
                h: 'left',
                v: 'center'
            })));
            M(15, C.B, 16, C.AM);
            cellAt(data, 17, C.B, fmtCell('', fnt(9)));
            M(17, C.B, 17, C.AM);
            cellAt(data, 19, C.B, fmtCell('Поставщик:', fnt(9, false, false, {
                h: 'left',
                v: 'top'
            })));
            M(19, C.B, 19, C.E);
            cellAt(data, 19, C.F, fmtCell('БИН / ИИН ' + bin + ', ' + storeName, fnt(9, true, false, {
                h: 'left',
                v: 'top',
                w: true
            })));
            M(19, C.F, 19, C.AM);
            cellAt(data, 21, C.B, fmtCell('Покупатель:', fnt(9, false, false, {
                h: 'left',
                v: 'top'
            })));
            M(21, C.B, 21, C.E);
            var bStr = customerName;
            if (custIIN)
                bStr = 'БИН / ИИН ' + custIIN + ', ' + bStr;
            if (custAddr)
                bStr += ' ' + custAddr;
            cellAt(data, 21, C.F, fmtCell(bStr, fnt(9, true, false, {
                h: 'left',
                v: 'top',
                w: true
            })));
            M(21, C.F, 21, C.AM);
            cellAt(data, 23, C.B, fmtCell('Договор:', fnt(10, false, false, {
                h: 'left',
                v: 'top'
            })));
            M(23, C.B, 23, C.E);
            cellAt(data, 23, C.F, fmtCell(contractText, fnt(10, true, false, {
                h: 'left',
                v: 'top',
                w: true
            })));
            M(23, C.F, 23, C.AM);
            function thdr(rr, txt, c1, c2, leftB, rightB) {
                var b = {
                    top: med(),
                    bottom: tin('thin')
                };
                if (leftB)
                    b.left = med();
                else
                    b.left = tin();
                if (rightB)
                    b.right = med();
                else
                    b.right = tin();
                cellAt(data, rr, c1, {
                    v: txt,
                    s: {
                        font: fnt(9, true).font,
                        alignment: fnt(9, true, false, {
                            h: 'center',
                            v: 'center'
                        }).alignment,
                        border: b
                    }
                });
                if (c2 > c1)
                    M(rr, c1, rr, c2);
            }
            thdr(25, '\u2116', C.B, C.C, true, false);
            thdr(25, 'Наименование', C.D, C.S, false, false);
            thdr(25, 'Кол-во', C.T, C.W, false, false);
            thdr(25, 'Ед.', C.X, C.Z, false, false);
            thdr(25, 'Цена', C.AA, C.AF, false, false);
            thdr(25, 'Сумма', C.AG, C.AL, false, true);
            var rowN = 26;
            items.forEach(function (it, idx) {
                var price = it.unitPrice || 0;
                var sum = it.total || price * (it.quantity || 0);
                function tcell(rrr, c1, c2, txt, al, leftM, rightM) {
                    var b = {
                        top: tin(),
                        bottom: tin()
                    };
                    if (leftM)
                        b.left = med();
                    else
                        b.left = tin();
                    if (rightM)
                        b.right = med();
                    else
                        b.right = tin();
                    cellAt(data, rrr, c1, {
                        v: txt,
                        s: {
                            font: fnt(8, false).font,
                            alignment: {
                                horizontal: al || 'left',
                                vertical: 'top',
                                wrapText: true
                            },
                            border: b
                        }
                    });
                    if (c2 > c1)
                        M(rrr, c1, rrr, c2);
                }
                tcell(rowN, C.B, C.C, String(idx + 1), 'center', true, false);
                tcell(rowN, C.D, C.S, it.productName || it.productCode || '', 'left', false, false);
                tcell(rowN, C.T, C.W, it.quantity || 0, 'right', false, false);
                tcell(rowN, C.X, C.Z, it.unit || 'шт', 'left', false, false);
                tcell(rowN, C.AA, C.AF, price, 'right', false, false);
                tcell(rowN, C.AG, C.AL, sum, 'right', false, true);
                rowN++;
            });
            var rr = rowN;
            function totCell(rrr, c1, c2, txt, leftM, rightM) {
                var b = {
                    top: med(),
                    bottom: med()
                };
                if (leftM)
                    b.left = med();
                else
                    b.left = tin();
                if (rightM)
                    b.right = med();
                else
                    b.right = tin();
                cellAt(data, rrr, c1, {
                    v: txt,
                    s: {
                        font: fnt(9, true).font,
                        alignment: {
                            horizontal: 'right',
                            vertical: 'top'
                        },
                        border: b
                    }
                });
                if (c2 > c1)
                    M(rrr, c1, rrr, c2);
            }
            totCell(rr, C.AF, C.AF, 'Итого:', true, false);
            totCell(rr, C.AG, C.AL, totalRaw, false, true);
            rr += 3;
            cellAt(data, rr, C.B, fmtCell('Всего наименований ' + items.length + ', на сумму ' + Number(totalRaw).toLocaleString('ru-RU', { minimumFractionDigits: 2 }) + ' KZT', fnt(9, false, false, {
                h: 'left',
                v: 'top'
            })));
            M(rr, C.B, rr, C.AM);
            rr++;
            cellAt(data, rr, C.B, fmtCell('Всего к оплате: ' + window.classicAmountWords(totalRaw), fnt(9, true, false, {
                h: 'left',
                v: 'top',
                w: true
            })));
            M(rr, C.B, rr, C.AK);
            rr += 2;
            cellAt(data, rr, C.B, fmtCell('Исполнитель', fnt(9, true, false, {
                h: 'left',
                v: 'center'
            })));
            cellAt(data, rr, C.G, fmtCell('', fnt(8)));
            M(rr, C.G, rr, C.V);
            cellAt(data, rr, C.W, fmtCell('/' + (directorName || '________') + '/', fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(rr, C.W, rr, C.AM);
            var ws = buildSheetFromData(data, merges);
            ws['!cols'] = [
                { wch: 2 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 },
                { wch: 3 }
            ];
            ws['!print'] = {
                paperSize: 9,
                orientation: 'portrait'
            };
            XLSX.utils.book_append_sheet(wb, ws, 'Лист_1');
        } else {
            var C = {};
            for (var ci = 0; ci <= 48; ci++) {
                if (ci < 26)
                    C[String.fromCharCode(65 + ci)] = ci;
                else
                    C['A' + String.fromCharCode(65 + ci - 26)] = ci;
            }
            var appLines = [
                'Приложение 26',
                'к приказу Министра финансов',
                'Республики Казахстан',
                'от 20 декабря 2012 года \u2116 562'
            ];
            appLines.forEach(function (l, i) {
                cellAt(data, i, C.AN, fmtCell(l, fnt(8, false, true, {
                    h: 'center',
                    v: 'center'
                })));
                M(i, C.AN, i, C.AW);
            });
            cellAt(data, 4, C.AQ, fmtCell('Форма З-2', fnt(9, false, false, {
                h: 'center',
                v: 'center'
            })));
            M(4, C.AQ, 4, C.AW);
            cellAt(data, 8, C.A, fmtCell('Организация (индивидуальный предприниматель)', fnt(8, false, false, {
                h: 'left',
                v: 'bottom',
                w: true
            })));
            M(8, C.A, 8, C.M);
            cellAt(data, 8, C.N, fmtCell(storeName, fnt(9, true, false, {
                h: 'center',
                v: 'top',
                w: true
            })));
            M(8, C.N, 8, C.AJ);
            cellAt(data, 8, C.AQ, fmtCell(bin, fnt(9, true, false, {
                h: 'center',
                v: 'center'
            })));
            cellAt(data, 11, C.AP, fmtCell('Номер документа', fnt(8, false, false, {
                h: 'center',
                v: 'center',
                w: true
            })));
            cellAt(data, 11, C.AT, fmtCell('Дата составления', fnt(8, false, false, {
                h: 'center',
                v: 'center',
                w: true
            })));
            cellAt(data, 12, C.AP, fmtCell(docNumber, fnt(8, true, false, {
                h: 'center',
                v: 'center',
                w: true
            })));
            cellAt(data, 12, C.AT, fmtCell(docDate, fnt(8, true, false, {
                h: 'center',
                v: 'center',
                w: true
            })));
            cellAt(data, 14, C.A, fmtCell('НАКЛАДНАЯ НА ОТПУСК ЗАПАСОВ НА СТОРОНУ', fnt(10, true, false, {
                h: 'center',
                v: 'center'
            })));
            M(14, C.A, 14, C.AW);
            function z2HdrBdr(leftM, rightM) {
                var b = {
                    top: med(),
                    bottom: tin('thin')
                };
                if (leftM)
                    b.left = med();
                else
                    b.left = tin();
                if (rightM)
                    b.right = med();
                else
                    b.right = tin();
                return b;
            }
            function z2ValBdr(leftM, rightM) {
                var b = {
                    top: tin('thin'),
                    bottom: tin('thin')
                };
                if (leftM)
                    b.left = med();
                else
                    b.left = tin();
                if (rightM)
                    b.right = med();
                else
                    b.right = tin();
                return b;
            }
            var hdrs18 = [
                {
                    t: 'Организация (ИП) - отправитель',
                    c1: C.A,
                    c2: C.K,
                    l: true,
                    r: false
                },
                {
                    t: 'Организация (ИП) - получатель',
                    c1: C.L,
                    c2: C.V,
                    l: false,
                    r: false
                },
                {
                    t: 'Ответственный за поставку (Ф.И.О.)',
                    c1: C.W,
                    c2: C.AE,
                    l: false,
                    r: false
                },
                {
                    t: 'Транспортная организация',
                    c1: C.AF,
                    c2: C.AN,
                    l: false,
                    r: false
                },
                {
                    t: 'Товарно-транспортная накладная (номер, дата)',
                    c1: C.AO,
                    c2: C.AW,
                    l: false,
                    r: true
                }
            ];
            hdrs18.forEach(function (h) {
                cellAt(data, 17, h.c1, {
                    v: h.t,
                    s: {
                        font: fnt(8, false).font,
                        alignment: fnt(8, false, false, {
                            h: 'center',
                            v: 'center',
                            w: true
                        }).alignment,
                        border: z2HdrBdr(h.l, h.r)
                    }
                });
                M(17, h.c1, 17, h.c2);
            });
            var vals19 = [
                {
                    t: storeName,
                    c1: C.A,
                    c2: C.K,
                    l: true,
                    r: false
                },
                {
                    t: customerName,
                    c1: C.L,
                    c2: C.V,
                    l: false,
                    r: false
                },
                {
                    t: directorName,
                    c1: C.W,
                    c2: C.AE,
                    l: false,
                    r: false
                },
                {
                    t: '',
                    c1: C.AF,
                    c2: C.AN,
                    l: false,
                    r: false
                },
                {
                    t: '',
                    c1: C.AO,
                    c2: C.AW,
                    l: false,
                    r: true
                }
            ];
            vals19.forEach(function (h) {
                cellAt(data, 18, h.c1, {
                    v: h.t,
                    s: {
                        font: fnt(8, false).font,
                        alignment: fnt(8, false, false, {
                            h: 'center',
                            v: 'center',
                            w: true
                        }).alignment,
                        border: z2ValBdr(h.l, h.r)
                    }
                });
                M(18, h.c1, 18, h.c2);
            });
            function z2TblHdrBdr(leftM, rightM, isTop) {
                var b = {
                    top: isTop ? med() : tin('thin'),
                    bottom: tin('thin')
                };
                if (leftM)
                    b.left = med();
                else
                    b.left = tin();
                if (rightM)
                    b.right = med();
                else
                    b.right = tin();
                return b;
            }
            var tblH = [
                {
                    t: 'Номер по порядку',
                    r1: 20,
                    r2: 21,
                    c1: C.A,
                    c2: C.B,
                    l: true,
                    r: false
                },
                {
                    t: 'Наименование, характеристика',
                    r1: 20,
                    r2: 21,
                    c1: C.C,
                    c2: C.N,
                    l: false,
                    r: false
                },
                {
                    t: 'Номенкла-турный номер',
                    r1: 20,
                    r2: 21,
                    c1: C.O,
                    c2: C.S,
                    l: false,
                    r: false
                },
                {
                    t: 'Единица измерения',
                    r1: 20,
                    r2: 21,
                    c1: C.T,
                    c2: C.V,
                    l: false,
                    r: false
                },
                {
                    t: 'Количество',
                    r1: 20,
                    r2: 20,
                    c1: C.W,
                    c2: C.AE,
                    l: false,
                    r: false
                },
                {
                    t: 'подлежит отпуску',
                    r1: 21,
                    r2: 21,
                    c1: C.W,
                    c2: C.AA,
                    l: false,
                    r: false
                },
                {
                    t: 'отпущено',
                    r1: 21,
                    r2: 21,
                    c1: C.AB,
                    c2: C.AE,
                    l: false,
                    r: false
                },
                {
                    t: 'Цена за единицу, в KZT',
                    r1: 20,
                    r2: 21,
                    c1: C.AF,
                    c2: C.AK,
                    l: false,
                    r: false
                },
                {
                    t: 'Сумма с НДС, в KZT',
                    r1: 20,
                    r2: 21,
                    c1: C.AL,
                    c2: C.AQ,
                    l: false,
                    r: false
                },
                {
                    t: 'Сумма НДС, в KZT',
                    r1: 20,
                    r2: 21,
                    c1: C.AR,
                    c2: C.AW,
                    l: false,
                    r: true
                }
            ];
            tblH.forEach(function (h) {
                for (var rr = h.r1; rr <= h.r2; rr++) {
                    cellAt(data, rr, h.c1, {
                        v: h.t,
                        s: {
                            font: fnt(8, false).font,
                            alignment: fnt(8, false, false, {
                                h: 'center',
                                v: 'center',
                                w: true
                            }).alignment,
                            border: z2TblHdrBdr(h.l, h.r, rr === h.r1)
                        }
                    });
                    M(h.r1, h.c1, h.r2, h.c2);
                }
            });
            var colNums = [
                1,
                2,
                3,
                4,
                5,
                6,
                7,
                8,
                9
            ];
            var colRanges = [
                [
                    C.A,
                    C.B,
                    true
                ],
                [
                    C.C,
                    C.N,
                    false
                ],
                [
                    C.O,
                    C.S,
                    false
                ],
                [
                    C.T,
                    C.V,
                    false
                ],
                [
                    C.W,
                    C.AA,
                    false
                ],
                [
                    C.AB,
                    C.AE,
                    false
                ],
                [
                    C.AF,
                    C.AK,
                    false
                ],
                [
                    C.AL,
                    C.AQ,
                    false
                ],
                [
                    C.AR,
                    C.AW,
                    false,
                    true
                ]
            ];
            colNums.forEach(function (n, i) {
                var b = {
                    top: tin(),
                    bottom: tin('thin')
                };
                b.left = colRanges[i][2] ? med() : tin();
                b.right = colRanges[i][3] ? med() : tin();
                cellAt(data, 22, colRanges[i][0], {
                    v: String(n),
                    s: {
                        font: fnt(8, false).font,
                        alignment: fnt(8, false, false, {
                            h: 'center',
                            v: 'center'
                        }).alignment,
                        border: b
                    }
                });
                M(22, colRanges[i][0], 22, colRanges[i][1]);
            });
            var dr = 23;
            items.forEach(function (it, idx) {
                var price = it.unitPrice || 0;
                var sum = it.total || price * (it.quantity || 0);
                function z2dc(c1, c2, txt, al, leftM, rightM) {
                    var b = {
                        top: tin(),
                        bottom: tin()
                    };
                    if (leftM)
                        b.left = med();
                    else
                        b.left = tin();
                    if (rightM)
                        b.right = med();
                    else
                        b.right = tin();
                    cellAt(data, dr, c1, {
                        v: txt,
                        s: {
                            font: fnt(8, false).font,
                            alignment: {
                                horizontal: al || 'left',
                                vertical: 'center',
                                wrapText: true
                            },
                            border: b
                        }
                    });
                    if (c2 > c1)
                        M(dr, c1, dr, c2);
                }
                z2dc(C.A, C.B, String(idx + 1), 'center', true, false);
                z2dc(C.C, C.N, it.productName || '', 'left', false, false);
                z2dc(C.O, C.S, it.productCode || '', 'center', false, false);
                z2dc(C.T, C.V, it.unit || 'шт', 'center', false, false);
                z2dc(C.W, C.AA, it.quantity || 0, 'right', false, false);
                z2dc(C.AB, C.AE, it.quantity || 0, 'right', false, false);
                z2dc(C.AF, C.AK, price, 'right', false, false);
                z2dc(C.AL, C.AQ, sum, 'right', false, false);
                z2dc(C.AR, C.AW, '', 'right', false, true);
                dr++;
            });
            function z2tc(c1, c2, txt, al, leftM, rightM) {
                var b = {
                    top: med(),
                    bottom: med()
                };
                if (leftM)
                    b.left = med();
                else
                    b.left = tin();
                if (rightM)
                    b.right = med();
                else
                    b.right = tin();
                cellAt(data, dr, c1, {
                    v: txt,
                    s: {
                        font: fnt(9, true).font,
                        alignment: {
                            horizontal: al || 'left',
                            vertical: 'center'
                        },
                        border: b
                    }
                });
                if (c2 > c1)
                    M(dr, c1, dr, c2);
            }
            z2tc(C.W, C.AE, 'Итого', 'right', false, false);
            z2tc(C.AF, C.AK, totalQty, 'right', false, false);
            z2tc(C.AL, C.AQ, totalRaw, 'right', false, true);
            dr += 2;
            cellAt(data, dr, C.A, fmtCell('Всего отпущено количество запасов (прописью): ' + totalQty, fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(dr, C.A, dr, C.AW);
            dr++;
            cellAt(data, dr, C.A, fmtCell('на сумму (прописью): ' + window.classicAmountWords(totalRaw), fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(dr, C.A, dr, C.AW);
            dr++;
            dr++;
            var sigLeft = [
                {
                    title: 'Отпуск разрешил:',
                    pos: directorPosition
                },
                {
                    title: 'Главный бухгалтер:',
                    pos: ''
                },
                {
                    title: 'Отпустил:',
                    pos: ''
                }
            ];
            sigLeft.forEach(function (s) {
                var posTxt = s.pos ? s.pos + ' ' : '';
                cellAt(data, dr, C.A, fmtCell(s.title, fnt(8, false, false, {
                    h: 'left',
                    v: 'center'
                })));
                M(dr, C.A, dr, C.D);
                cellAt(data, dr, C.E, fmtCell('/_______________/_______________/', fnt(8, false, false, {
                    h: 'left',
                    v: 'center'
                })));
                M(dr, C.E, dr, C.M);
                dr++;
            });
            dr++;
            cellAt(data, dr, C.AE, fmtCell('Запасы получил:', fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(dr, C.AE, dr, C.AJ);
            dr++;
            cellAt(data, dr, C.AE, fmtCell('/_______________/_______________/', fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(dr, C.AE, dr, C.AJ);
            dr++;
            cellAt(data, dr, C.AE, fmtCell('по доверенности \u2116 ________________ от ___ _________ 20__ года', fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(dr, C.AE, dr, C.AW);
            dr++;
            cellAt(data, dr, C.AE, fmtCell('выданной __________________________________________________', fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            M(dr, C.AE, dr, C.AW);
            dr++;
            dr++;
            cellAt(data, dr, C.A, fmtCell('М.П.', fnt(8, false, false, {
                h: 'left',
                v: 'center'
            })));
            var ws = buildSheetFromData(data, merges);
            var colW = [];
            for (var ci = 0; ci < 49; ci++)
                colW.push({ wch: 3 });
            ws['!cols'] = colW;
            ws['!rows'] = [];
            for (var ri = 0; ri <= 4; ri++)
                ws['!rows'][ri] = { hpt: 11 };
            ws['!rows'][8] = { hpt: 12 };
            ws['!rows'][17] = { hpt: 23 };
            ws['!rows'][18] = { hpt: 47 };
            ws['!rows'][20] = { hpt: 17 };
            ws['!rows'][21] = { hpt: 17 };
            for (var ri = dr; ri < data.length; ri++) {
                if (!ws['!rows'][ri])
                    ws['!rows'][ri] = { hpt: 23 };
            }
            ws['!print'] = {
                paperSize: 9,
                orientation: 'landscape'
            };
            XLSX.utils.book_append_sheet(wb, ws, 'Лист_1');
        }
        var filename = (isInvoice ? 'Счет_' : 'Накладная_') + docNumber + '.xlsx';
        XLSX.writeFile(wb, filename);
        toast('Excel файл скачан', 'ok');
    } catch (err) {
        toast('Ошибка Excel: ' + err.message, 'err');
    }
}

function downloadDocumentHTML() {
    var content = document.getElementById('document-view-content');
    if (!content)
        return;
    var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Документ</title></head><body>' + content.innerHTML + '</body></html>';
    var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
}




var _ex={};
try{_ex['getDocuments']=getDocuments}catch(e){}
try{_ex['setDocuments']=setDocuments}catch(e){}
try{_ex['getDocTemplates']=getDocTemplates}catch(e){}
try{_ex['setDocTemplates']=setDocTemplates}catch(e){}
try{_ex['openDocTemplateManager']=openDocTemplateManager}catch(e){}
try{_ex['renderDocTemplates']=renderDocTemplates}catch(e){}
try{_ex['editDocTemplate']=editDocTemplate}catch(e){}
try{_ex['deleteDocTemplate']=deleteDocTemplate}catch(e){}
try{_ex['addDocTemplate']=addDocTemplate}catch(e){}
try{_ex['saveDocTemplate']=saveDocTemplate}catch(e){}
try{_ex['loadDocTemplate']=loadDocTemplate}catch(e){}
try{_ex['loadDocTemplateNewDoc']=loadDocTemplateNewDoc}catch(e){}
try{_ex['selectDocTemplateForDoc']=selectDocTemplateForDoc}catch(e){}
try{_ex['printInvoice']=printInvoice}catch(e){}
try{_ex['showInvoiceOverlay']=showInvoiceOverlay}catch(e){}
try{_ex['printSalePKO']=printSalePKO}catch(e){}
try{_ex['downloadInvoiceExcel']=downloadInvoiceExcel}catch(e){}
try{_ex['renderDocuments']=renderDocuments}catch(e){}
try{_ex['openDocumentEditById']=openDocumentEditById}catch(e){}
try{_ex['deleteDocument']=deleteDocument}catch(e){}
try{_ex['duplicateDocument']=duplicateDocument}catch(e){}
try{_ex['downloadDocumentPdf']=downloadDocumentPdf}catch(e){}
try{_ex['printDocumentById']=printDocumentById}catch(e){}
try{_ex['downloadDocumentExcelById']=downloadDocumentExcelById}catch(e){}
try{_ex['openCreateInvoiceModal']=openCreateInvoiceModal}catch(e){}
try{_ex['openCreateZ2Modal']=openCreateZ2Modal}catch(e){}
try{_ex['updateInvoiceTypeUI']=updateInvoiceTypeUI}catch(e){}
try{_ex['updateZ2TypeUI']=updateZ2TypeUI}catch(e){}
try{_ex['addInvoiceItemRow']=addInvoiceItemRow}catch(e){}
try{_ex['addZ2ItemRow']=addZ2ItemRow}catch(e){}
try{_ex['addSFItemRow']=addSFItemRow}catch(e){}
try{_ex['saveNewInvoice']=saveNewInvoice}catch(e){}
try{_ex['saveNewZ2']=saveNewZ2}catch(e){}
try{_ex['openCreateSFFModal']=openCreateSFFModal}catch(e){}
try{_ex['saveNewSFF']=saveNewSFF}catch(e){}
try{_ex['openCreatePKOModal']=openCreatePKOModal}catch(e){}
try{_ex['saveNewPKO']=saveNewPKO}catch(e){}
try{_ex['buildClassicInvoiceHTML']=buildClassicInvoiceHTML}catch(e){}
try{_ex['buildClassicZ2HTML']=buildClassicZ2HTML}catch(e){}
try{_ex['buildClassicSFHTML']=buildClassicSFHTML}catch(e){}
try{_ex['buildClassicPKOHTML']=buildClassicPKOHTML}catch(e){}
try{_ex['openDocumentView']=openDocumentView}catch(e){}
try{_ex['changeDocumentStatus']=changeDocumentStatus}catch(e){}
try{_ex['printDocument']=printDocument}catch(e){}
try{_ex['downloadDocumentExcel']=downloadDocumentExcel}catch(e){}
try{_ex['downloadDocumentHTML']=downloadDocumentHTML}catch(e){}
return _ex;})();

if(__mod['constants'])Object.assign(window,__mod['constants']);
if(__mod['store'])Object.assign(window,__mod['store']);
if(__mod['auth'])Object.assign(window,__mod['auth']);
if(__mod['notifications'])Object.assign(window,__mod['notifications']);
if(__mod['statistics'])Object.assign(window,__mod['statistics']);
if(__mod['helpers'])Object.assign(window,__mod['helpers']);
if(__mod['reports'])Object.assign(window,__mod['reports']);
if(__mod['expenses'])Object.assign(window,__mod['expenses']);
if(__mod['cart'])Object.assign(window,__mod['cart']);
if(__mod['customers'])Object.assign(window,__mod['customers']);
if(__mod['shifts'])Object.assign(window,__mod['shifts']);
if(__mod['users'])Object.assign(window,__mod['users']);
if(__mod['settings'])Object.assign(window,__mod['settings']);
if(__mod['debts'])Object.assign(window,__mod['debts']);
if(__mod['categories'])Object.assign(window,__mod['categories']);
if(__mod['sync'])Object.assign(window,__mod['sync']);
if(__mod['returns'])Object.assign(window,__mod['returns']);
if(__mod['offline'])Object.assign(window,__mod['offline']);
if(__mod['ui'])Object.assign(window,__mod['ui']);
if(__mod['sales'])Object.assign(window,__mod['sales']);
if(__mod['products'])Object.assign(window,__mod['products']);
if(__mod['promotions'])Object.assign(window,__mod['promotions']);
if(__mod['utils'])Object.assign(window,__mod['utils']);
if(__mod['documents'])Object.assign(window,__mod['documents']);
if(__mod['ui']&&typeof __mod['ui'].boot==='function'){__mod['ui'].boot();}
})();