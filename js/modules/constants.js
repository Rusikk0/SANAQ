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
    importProducts: false,
    exportProducts: false,
    massChangePrices: false,
    massChangeCategories: false,
    massDelete: false,
    viewPurchasePrice: false,
    viewCostPrice: false,
    viewProductProfit: false,
    viewCategories: true,
    addCategory: false,
    editCategory: false,
    deleteCategory: false,
    viewCustomers: true,
    addCustomer: true,
    editCustomer: true,
    deleteCustomer: false,
    manageBonuses: false,
    viewPurchaseHistory: true,
    exportCustomers: false,
    viewWarehouse: true,
    receiveStock: false,
    writeOffStock: false,
    inventory: false,
    transferStock: false,
    viewPurchasePrices: false,
    viewStatistics: false,
    viewProfit: false,
    viewExpenses: false,
    viewRevenue: false,
    viewProductAnalytics: false,
    viewCashierAnalytics: false,
    viewCustomerAnalytics: false,
    viewDebts: true,
    createDebt: true,
    editDebt: true,
    closeDebt: true,
    deleteDebt: false,
    changeSettings: false,
    manageUsers: false,
    manageRoles: false,
    managePermissions: false,
    exportData: true,
    importData: false,
    backupData: false,
    restoreData: false,
    clearData: false
};

var PERMISSION_GROUPS = {
    'Продажи': [
        'viewSales',
        'viewReceiptHistory',
        'searchReceipts',
        'printReceipt',
        'reprintReceipt',
        'openCashDrawer',
        'openShift',
        'closeShift',
        'cashIn',
        'cashOut',
        'viewCashOps',
        'saleWithoutCustomer',
        'saleOnCredit',
        'refundMoney',
        'useCustomerBonuses',
        'accrueBonuses',
        'canChangeQty',
        'canChangePriceInSale',
        'canAddUniversal',
        'canManualItemDiscount',
        'canManualCartDiscount',
        'createSale',
        'canReturn',
        'canCancelReceipt',
        'canDeferSale',
        'canChangePayment',
        'canMixedPayment'
    ],
    'Товары': [
        'viewProducts',
        'addProducts',
        'editProducts',
        'deleteProducts',
        'changePrices',
        'changeStock',
        'importProducts',
        'exportProducts',
        'massChangePrices',
        'massChangeCategories',
        'massDelete',
        'viewPurchasePrice',
        'viewCostPrice',
        'viewProductProfit'
    ],
    'Категории': [
        'viewCategories',
        'addCategory',
        'editCategory',
        'deleteCategory'
    ],
    'Клиенты': [
        'viewCustomers',
        'addCustomer',
        'editCustomer',
        'deleteCustomer',
        'manageBonuses',
        'viewPurchaseHistory',
        'exportCustomers'
    ],
    'Склад': [
        'viewWarehouse',
        'receiveStock',
        'writeOffStock',
        'inventory',
        'transferStock',
        'viewPurchasePrices'
    ],
    'Статистика': [
        'viewStatistics',
        'viewProfit',
        'viewExpenses',
        'viewRevenue',
        'viewProductAnalytics',
        'viewCashierAnalytics',
        'viewCustomerAnalytics'
    ],
    'Долги': [
        'viewDebts',
        'createDebt',
        'editDebt',
        'closeDebt',
        'deleteDebt'
    ],
    'Настройки': [
        'changeSettings',
        'manageUsers',
        'manageRoles',
        'managePermissions',
        'exportData',
        'importData',
        'backupData',
        'restoreData',
        'clearData'
    ]
};

var PERMISSION_LABELS = {
    viewSales: 'Просмотр продаж',
    viewReceiptHistory: 'Просмотр истории чеков',
    searchReceipts: 'Поиск чеков',
    printReceipt: 'Печать чека',
    reprintReceipt: 'Повторная печать чека',
    openCashDrawer: 'Открытие денежного ящика',
    openShift: 'Открытие смены',
    closeShift: 'Закрытие смены',
    cashIn: 'Внесение денег',
    cashOut: 'Изъятие денег',
    viewCashOps: 'Просмотр кассовых операций',
    saleWithoutCustomer: 'Продажа без клиента',
    saleOnCredit: 'Продажа в долг',
    refundMoney: 'Возврат денег',
    useCustomerBonuses: 'Использование бонусов',
    accrueBonuses: 'Начисление бонусов',
    canChangeQty: 'Изменение кол-ва',
    canChangePriceInSale: 'Изменение цены при продаже',
    canAddUniversal: 'Универсальный товар',
    canManualItemDiscount: 'Ручная скидка на товар',
    canManualCartDiscount: 'Ручная скидка на корзину',
    createSale: 'Создание продажи',
    canReturn: 'Возврат товара',
    canCancelReceipt: 'Отмена чека',
    canDeferSale: 'Отложенная продажа',
    canChangePayment: 'Изменить способ оплаты',
    canMixedPayment: 'Смешанная оплата',
    viewProducts: 'Просмотр товаров',
    addProducts: 'Добавление товаров',
    editProducts: 'Редактирование товаров',
    deleteProducts: 'Удаление товаров',
    changePrices: 'Изменение цен',
    changeStock: 'Изменение остатков',
    importProducts: 'Импорт товаров',
    exportProducts: 'Экспорт товаров',
    massChangePrices: 'Массовое изменение цен',
    massChangeCategories: 'Массовое изменение категорий',
    massDelete: 'Массовое удаление',
    viewPurchasePrice: 'Просмотр закупочной цены',
    viewCostPrice: 'Просмотр себестоимости',
    viewProductProfit: 'Просмотр прибыли по товару',
    viewCategories: 'Просмотр категорий',
    addCategory: 'Добавление категорий',
    editCategory: 'Редактирование категорий',
    deleteCategory: 'Удаление категорий',
    viewCustomers: 'Просмотр клиентов',
    addCustomer: 'Добавление клиентов',
    editCustomer: 'Редактирование клиентов',
    deleteCustomer: 'Удаление клиентов',
    manageBonuses: 'Управление бонусами',
    viewPurchaseHistory: 'История покупок',
    exportCustomers: 'Экспорт клиентов',
    viewWarehouse: 'Просмотр склада',
    receiveStock: 'Приход товара',
    writeOffStock: 'Списание товара',
    inventory: 'Инвентаризация',
    transferStock: 'Перемещение товаров',
    viewPurchasePrices: 'Просмотр закупочных цен',
    viewStatistics: 'Просмотр статистики',
    viewProfit: 'Просмотр прибыли',
    viewExpenses: 'Просмотр расходов',
    viewRevenue: 'Просмотр выручки',
    viewProductAnalytics: 'Аналитика по товарам',
    viewCashierAnalytics: 'Аналитика по кассирам',
    viewCustomerAnalytics: 'Аналитика по клиентам',
    viewDebts: 'Просмотр долгов',
    createDebt: 'Создание долга',
    editDebt: 'Редактирование долга',
    closeDebt: 'Закрытие долга',
    deleteDebt: 'Удаление долга',
    changeSettings: 'Изменение настроек',
    manageUsers: 'Управление пользователями',
    manageRoles: 'Управление ролями',
    managePermissions: 'Управление правами',
    exportData: 'Экспорт данных',
    importData: 'Импорт данных',
    backupData: 'Резервное копирование',
    restoreData: 'Восстановление базы',
    clearData: 'Очистка базы'
};

export { ROLE_LABELS, CODE39, EAN_L, EAN_R, EAN_G, EAN_PARITY, SCAN_MAX_GAP, EXCEL_SECTIONS, PAGE_PERMISSION_GROUP, DEFAULT_PERMISSIONS, PERMISSION_GROUPS, PERMISSION_LABELS };
