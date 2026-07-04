# Примеры CRUD (товары и продажи)

Данные магазина доступны через `ApDb` после выбора магазина и `ApDb.initForStore()`.

## Товары

### Чтение

```javascript
const products = ApDb.getProducts();
```

### Создание / обновление (один товар)

```javascript
await ApDb.upsertProduct({
  id: crypto.randomUUID(), // или существующий id для обновления
  code: 'BRK-001',
  barcode: '2000000000011',
  name: 'Тормозные колодки',
  category: categoryUuidOrEmpty,
  quantity: 24,
  purchasePrice: 5000,
  price: 7500,
  minStock: 5,
  info: ''
});
```

В интерфейсе то же делает `saveProduct()` в `index.html` через `setProducts()`.

### Удаление

```javascript
await ApDb.deleteProduct(productId);
```

## Продажи

### Чтение (плоский список строк, как в legacy)

```javascript
const lines = ApDb.getSales();
// Группировка в чеки: groupSalesIntoReceipts(lines) в index.html
```

### Оформление продажи (транзакция)

```javascript
await ApDb.createSaleTransaction({
  receiptId: crypto.randomUUID(),
  shiftId: openShiftId,
  customerId: customerIdOrNull,
  userId: currentUser.id,
  userName: currentUser.name,
  payment: 'cash',
  total: 15000,
  discountAmount: 0,
  bonusSpend: 0,
  earnedBonus: 150,
  date: new Date().toISOString(),
  items: [
    {
      productId: '...',
      productCode: 'BRK-001',
      productName: 'Колодки',
      quantity: 2,
      unitPrice: 7500,
      purchasePrice: 5000,
      lineTotal: 15000
    }
  ],
  productUpdates: [{ id: productId, quantity: newQty }],
  customerUpdate: { id, phone, name, spent, bonusBalance }
});
```

В UI используется `completeSale()` → `setSales()` → синхронизация в `sale_items` + `sales`.

### Отмена продажи

```javascript
// В приложении: cancelSale(saleId) меняет status на cancelled и setSales()
```

## Прямые запросы Supabase (опционально)

```javascript
const { data, error } = await ApAuth.client()
  .from('products')
  .select('*')
  .eq('store_id', ApAuth.getCurrentStore().storeId);
```

Предпочтительно использовать `ApDb`, чтобы кэш и UI оставались согласованными.
