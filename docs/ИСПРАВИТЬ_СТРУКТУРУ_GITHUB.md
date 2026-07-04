# Исправить 404 и ошибки на GitHub (репозиторий 095_AVTOMARKET)

## В чём ошибка

Сейчас на GitHub файлы лежат **в корне**:

```text
095_AVTOMARKET/
  index.html
  config.js          ← неправильно (должно быть в js/)
  ap-db.js
  ap auth.js         ← пробел в имени — браузер не найдёт ap-auth.js
  ...
```

А сайт ищет:

```text
/js/config.js
/js/ap-db.js
/js/ap-auth.js
```

Поэтому **404** и ошибки в приложении.

---

## Как должно быть

```text
095_AVTOMARKET/
  index.html
  .nojekyll
  js/
    config.js
    supabase-init.js
    ap-auth.js
    ap-db.js
    ap-screens.js
    config.example.js
```

---

## Пошагово (15 минут)

### Шаг 1. Удалить лишние файлы из корня на GitHub

Репозиторий → каждый файл в корне (кроме `index.html` и `README.md`):

1. Откройте файл (например `ap-db.js`)
2. Справа **⋯** → **Delete file** → подтвердите

Удалите из **корня**:

- `ap-db.js`
- `ap-screens.js`
- `config.js`
- `config.example.js`
- `supabase-init.js`
- `ap auth.js` (с пробелом)

**Оставьте в корне:** `index.html`, `README.md` (и позже `.nojekyll`).

### Шаг 2. Загрузить папку `js` правильно

На компьютере: `c:\Users\acer\Desktop\095`

1. **Add file** → **Upload files**
2. Откройте в проводнике папку **`095`** (не заходя внутрь `js`)
3. Перетащите в браузер **папку `js` целиком** (иконка папки)  
   — в списке должно быть: `js/config.js`, `js/ap-db.js` и т.д.
4. **Commit changes**

Проверка: на вкладке **Code** нажмите папку **`js`** — внутри 6 файлов, имя **`ap-auth.js`** (с дефисом, без пробела).

### Шаг 3. Обновить `index.html`

С компьютера загрузите свежий **`index.html`** из `c:\Users\acer\Desktop\095` (перезаписать на GitHub).

### Шаг 4. Файл `.nojekyll`

**Add file** → имя файла: `.nojekyll` → содержимое пустое → **Commit**.

### Шаг 5. Подождать и проверить

Через 2–5 минут откройте:

| Должно открыться (код, не 404) |
|--------------------------------|
| https://rusikk0.github.io/095_AVTOMARKET/ |
| https://rusikk0.github.io/095_AVTOMARKET/js/config.js |

---

## Supabase

**Authentication** → **URL Configuration**:

- Site URL: `https://rusikk0.github.io/095_AVTOMARKET/`
- Redirect URLs: та же ссылка

---

## Если главная всё ещё 404

1. **Settings** → **Pages** → **Save** ещё раз (ветка `main`, `/ (root)`).
2. Убедитесь, что файл называется именно **`index.html`** (маленькими буквами).
3. Подождите 10 минут, **Ctrl+F5**.
