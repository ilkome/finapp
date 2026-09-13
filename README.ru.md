<p align="center">
  <img src="https://finapp.ilko.me/logo.png" alt="Finapp Logo" width="320" />
</p>

# Finapp - финансовое приложение с открытым исходным кодом

[English](./README.md) | **Русский**

> Ваши деньги, ваш контроль - где угодно и когда угодно.

**Finapp** помогает легко отслеживать личные финансы и управлять ими. Репозиторий представляет собой pnpm-монорепозиторий с Nuxt-приложением и сайтом документации.

## Демо

[finapp.ilko.me](https://finapp.ilko.me/)

## Документация

[finapp-docs.ilko.me](https://finapp-docs.ilko.me/)

## Почему Finapp?

- **Просто**: ничего лишнего - только ваши транзакции и балансы.
- **Быстро**: работает офлайн и мгновенно синхронизируется между устройствами.
- **Приватно**: данные принадлежат вам - сначала хранятся локально и синхронизируются через ваш собственный бэкенд Supabase.
- **Гибко**: поддержка нескольких валют с автоматическими курсами обмена.
- **Удобно**: оптимизировано для мобильных и десктопных устройств, устанавливается как PWA.

## Возможности

### Финансы

- **Кошельки**: 6 типов - наличные, банковские счета, кредитные карты, депозиты, криптовалюта, долги.
- **Транзакции**: расход, доход, перевод, корректировка со встроенным калькулятором.
- **Категории**: иерархические родительские и дочерние категории с произвольными иконками и цветами.
- **Мультивалютность**: более 180 фиатных и криптовалют с ежедневным автоматическим обновлением курсов.

### Аналитика

- Настраиваемый дашборд: переставляемые блоки, сохранённые виды с правилами автоактивации.
- Столбчатые, линейные и круговые графики со средней линией, по категориям или по доходам и тратам.
- Гибкие диапазоны дат: день, неделя, месяц, год или произвольный период.
- Разбивка по категориям с разными режимами отображения.
- Множественные фильтры по кошелькам и категориям.

### Офлайн и синхронизация

- Offline-first PWA, работает без интернета.
- Локальное хранилище SQLite с автоматической фоновой синхронизацией при подключении.
- Синхронизация между устройствами в реальном времени через PowerSync.

### Кастомизация

- Светлая, тёмная и системная темы.
- Более 20 основных цветов и 5 нейтральных палитр.
- Настраиваемый радиус скругления.
- Конфигурация виджетов дашборда для каждой вкладки.
- Английский и русский интерфейс.

## Технологии

- Vue 3
- Nuxt 4
- Pinia
- @nuxt/ui v4 и Tailwind CSS v4
- Supabase (Postgres)
- PowerSync
- Supabase Auth
- Docus
- pnpm workspaces

## Структура репозитория

```text
finapp/
  app/    # Nuxt-приложение, конфигурация Supabase + PowerSync, тесты, ассеты
  docs/   # Сайт документации на Docus
```

Корневой пакет содержит только workspace-скрипты. Зависимости приложения и документации хранятся в своих манифестах.

## Начало работы

### Требования

- Node.js `>=24.12.0`
- pnpm `11.x`
- Docker и [Supabase CLI](https://supabase.com/docs/guides/cli) для локального бэкенда

### Установка

```bash
git clone https://github.com/ilkome/finapp.git finapp
cd finapp
pnpm install
```

### Настройка приложения

Скопируйте пример env-файла для локального Nuxt-клиента и заполните значениями Supabase и PowerSync:

```bash
cp app/.env.example app/.env.local
```

Обязательные переменные окружения:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_POWERSYNC_URL=your_powersync_url
```

Для локальной разработки они указывают на локальный стек, запускаемый ниже: Supabase на `http://localhost:54321` и PowerSync на `http://localhost:8080`.

### Локальный бэкенд

Бэкенд - это локальный self-hosted Supabase (Postgres + Auth) плюс self-hosted сервис PowerSync. Выполните один раз из workspace `app/`:

```bash
cd app

# 1. Запустить Supabase (Postgres + Auth на :54321)
supabase start

# 2. Применить настройку репликации PowerSync (роль + публикация)
docker exec -i supabase_db_app psql -U postgres -d postgres < supabase/powersync_setup.sql

# 3. Запустить сервис PowerSync (:8080)
docker compose -f powersync/docker-compose.yaml up -d
```

На экране входа - **Вход через Google** и **Демо-режим**. Email/password остаётся включённым в бэкенде Supabase (его использует тестовый пользователь из сида для E2E), но в UI не выводится.

### Seed-данные (локальный тестовый пользователь)

`supabase db reset` применяет `app/supabase/seed.sql`, который создаёт фиксированного email/password тестового пользователя (`e2e@finapp.local`) и набор данных на основе демо (8 кошельков, 32 категории, ~860 транзакций). Так агенты и Playwright входят в настоящий режим PowerSync без Google OAuth. Применить к работающей БД без сброса:

```bash
docker exec -i supabase_db_app psql -U postgres -d postgres < app/supabase/seed.sql
```

Вход под тестовым пользователем (`app/scripts/dev-login.mjs`) и регенерация сида описаны в разделе [Тестирование](docs/content/ru/2.development/06.testing.md).

### Вход через Google (опционально, локально)

На экране входа есть кнопка **Войти через Google**. Чтобы она работала с локальным стеком:

1. В [Google Cloud Console](https://console.cloud.google.com/apis/credentials) создайте **OAuth 2.0 Client ID** (Web application) и добавьте локальный callback Supabase в разрешённые redirect URI:

   ```text
   http://127.0.0.1:54321/auth/v1/callback
   ```

2. Положите client id/secret в `app/.env` (Supabase CLI читает `.env` из каталога, где запущен; значения подставляются через `env()` в `app/supabase/config.toml` и **не** попадают на клиент):

   ```bash
   SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
   SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
   ```

3. Перезапустите Supabase, чтобы он перечитал конфиг и env (`supabase stop && supabase start`).

Провайдер Google уже включён в `app/supabase/config.toml` (`[auth.external.google]`, `skip_nonce_check = true` для локального стека). Пустые env-переменные просто оставляют кнопку нерабочей - демо-режим и seed-пользователь продолжают работать. Для **продакшена** настройте Google в дашборде hosted Supabase (см. [Деплой](docs/content/ru/2.development/05.deployment.md)).

### Env-файлы

Workspace приложения использует несколько `.env` файлов (все в gitignore, кроме `.env.example`):

| Файл | Назначение |
| --- | --- |
| `app/.env` | Секреты локального Supabase CLI, Nuxt-скрипты его не читают |
| `app/.env.local` | Локальный Nuxt-клиент, используется `pnpm dev:local` |
| `app/.env.cloud` | Облачные dev-сервисы, используются `pnpm dev` и `pnpm dev:cloud` |
| `app/.env.production` | Production-сервисы, используются `pnpm dev:production` |

## Разработка

Обычная команда использует облачные dev-сервисы:

```bash
pnpm dev
```

Для запущенного локального бэкенда выберите его явно:

```bash
pnpm dev:local
```

Приложение доступно на `http://localhost:3050`.

Запустите сайт документации:

```bash
pnpm dev:docs
```

Документация доступна на `http://localhost:3051`.

Запуск dev-серверов приложения и документации одновременно:

```bash
pnpm dev:all
```

## Скрипты

| Команда | Описание |
| --- | --- |
| `pnpm dev` | Запуск приложения с облачными dev-сервисами |
| `pnpm dev:cloud` | Явный алиас для облачных dev-сервисов |
| `pnpm dev:local` | Запуск приложения с локальным бэкендом |
| `pnpm dev:production` | Запуск dev-сервера с production-сервисами |
| `pnpm dev:docs` | Запуск dev-сервера документации |
| `pnpm dev:all` | Параллельный запуск dev-серверов приложения и документации |
| `pnpm build` | Сборка всех workspace-пакетов с командой `build` |
| `pnpm build:app` | Сборка приложения для статического хостинга |
| `pnpm build:docs` | Сборка сайта документации |
| `pnpm lint` | Линтинг монорепозитория |
| `pnpm lint:app` | Линтинг пакета приложения |
| `pnpm lint:docs` | Линтинг пакета документации |
| `pnpm lint:fix` | Линтинг с автоисправлением |
| `pnpm test` | Одноразовый запуск unit-тестов в workspace-пакетах |
| `pnpm test:watch` | Запуск unit-тестов приложения в watch-режиме |
| `pnpm test:e2e` | Запуск demo E2E-тестов |
| `pnpm test:e2e:prod` | Запуск E2E smoke-теста production-сборки |
| `pnpm typecheck` | Проверка типов в workspace-пакетах |
| `pnpm verify` | Запуск немутирующего набора проверок |

## Документация

Руководства пользователя, заметки по разработке и техническая справка находятся в [`docs/content`](docs/content).
Запустите сайт документации командой `pnpm dev:docs`.

## Предыдущая версия

Предыдущая версия Finapp на Firebase доступна в ветке [`firebase`](https://github.com/ilkome/finapp/tree/firebase).

## Контакты

- Telegram: [@ilkome](https://t.me/ilkome)
