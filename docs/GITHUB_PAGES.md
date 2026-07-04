# Деплой на GitHub Pages

Приложение — **только статические файлы**, без Node.js на сервере. GitHub Pages подходит полностью.

## 1. Репозиторий

```bash
cd путь/к/проекту
git init
git add .
git commit -m "АвтоЗапчасти: Supabase + GitHub Pages"
```

> Файл `js/config.js` в `.gitignore`. Для Pages добавьте ключи одним из способов ниже.

### Вариант A: config.js в репозитории (проще)

Удалите `js/config.js` из `.gitignore` и закоммитьте **только anon key** (публичный ключ Supabase допустим для клиента; **не** коммитьте `service_role`).

### Вариант B: Secrets + Actions (без ключей в git)

Создайте workflow, который подставляет `config.js` при деплое из GitHub Secrets (`SUPABASE_URL`, `SUPABASE_ANON_KEY`).

## 2. Публикация

1. Создайте репозиторий на GitHub.
2. `git remote add origin https://github.com/USER/REPO.git`
3. `git push -u origin main`

## 3. Включение GitHub Pages

1. Репозиторий → **Settings** → **Pages**.
2. **Source**: Deploy from a branch.
3. **Branch**: `main` → папка **`/ (root)`** (в корне лежит `index.html`).
4. Сохраните. Через 1–3 минуты сайт: `https://USER.github.io/REPO/`

## 4. Supabase Redirect URLs

В Supabase **Authentication** → **URL Configuration** добавьте:

```
https://USER.github.io/REPO/
https://USER.github.io/REPO/index.html
```

**Site URL** укажите основной адрес Pages.

## 5. Локальная проверка перед деплоем

Статический сервер (нужен для корректной работы модулей и CORS Supabase):

```bash
# Python
python -m http.server 5500

# или npx
npx serve -p 5500
```

Откройте `http://localhost:5500` — не открывайте `file://` напрямую.

## 6. Структура на Pages

Обязательные пути относительно корня сайта:

```
/index.html
/js/config.js
/js/supabase-init.js
/js/ap-auth.js
/js/ap-db.js
/js/ap-screens.js
```

CDN Supabase (`@supabase/supabase-js@2`) подключается из `index.html`.

## 7. Обновление сайта

```bash
git add -A
git commit -m "Обновление"
git push
```

Pages пересоберётся автоматически.

## 8. Кастомный домен (опционально)

Settings → Pages → Custom domain → добавьте домен в DNS и в Redirect URLs Supabase.
