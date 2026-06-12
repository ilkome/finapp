# Миграция Firebase → Supabase + PowerSync: остаток

Ветка `feat/supabase-powersync`. Сделаны и **закоммичены**: миграция, клиентский data-layer, сторы, auth, cold-start блоб-кеш, фикс login→onboarding-флеша, auto-reconcile, стор/e2e-тесты, docs/README. Ниже - только открытые задачи и операционные заметки.

## Заметки по верификации

- **Тесты:** из `app/` - `cd app && pnpm exec vitest run` (или корневой `pnpm test`). Из корня моно vitest даёт ложные fail (нет конфига и алиаса `~/`).
- **Lint:** `pnpm lint` (`eslint .`). В ignores: `.understand-anything/**`, `graphify-out/**`, `.claude/**`, `app/powersync/**`, `app/supabase/config.toml`. `.gitignore` flat-config НЕ читает; точечно - `pnpm exec eslint <файлы>`.

## Открытые задачи

### Перф: стоимость стартовой загрузки trns

Одна связанная цепочка **1 → 2 → 3**, всё про стоимость полного набора trns. Порядок обязателен: замеры (1) питают решение (2), решение определяет, нужен ли вообще (3). **Не брать 3 раньше 2, не решать 2 без замеров 1.**

- [ ] **1. Замеры cold-start** (investigation-first, делать первым). `startWatches()` (`useInitApp.ts:60`) поднимает **5** `db.watch('SELECT * FROM ...')` (user / rates / categories / wallets / trns) - ~250ms из ~607ms cold-start (trns ~148ms), сериализованы на одном PowerSync-соединении/воркере. Блоб-кеш это уже **прячет** для вернувшегося юзера (первый кадр из снапшота до завершения запросов) → выигрыш в основном для свежего логина / cache-miss и для скорости reconcile (truth поверх прайма). Выяснить: (1) сериализует ли `@powersync/web` чтения на единственном WASM-соединении или их реально можно гнать параллельно; (2) можно ли сократить/слить 5 select'ов; (3) что дороже - скан таблицы или per-row materialize+transform (`transforms.ts`). Результат замеров → вход для пункта 2.

- [ ] **2. Решение по архитектуре: два слоя локального хранения** (развилка, после замеров). Блоб-кеш (`useStoreCache.ts`) + PowerSync SQLite - легитимный read-кеш поверх единственного источника правды (инвариант «блоб = кеш, SQLite = правда» через reconcile + uid-ключ), НЕ костыль. Платит: дублирование в IndexedDB (SQLite-страницы + JSON-блоб) и write-amplification. Основной выигрыш блоба - пропуск per-row transform, не пропуск SQLite. Развилка (зависит от замеров пункта 1):
  - (а) **один слой + shell-first** (уже частично - `showShell` по hint) + скелет цифр - убирает слой и риск утечки между юзерами;
  - (б) **оставить кеш** → тогда подпункт 3.

- [ ] **3. Блоб-кеш: инкрементальная запись** (low, только если в пункте 2 выбрана ветка «б»). Сейчас на каждую мутацию переписывается весь снапшот (`useStoreCache.ts` `persistStoreCache`, RMW целого блоба, write-amplification). При 30-50к+ переписать на запись по слайсам. **Не брать до решения пункта 2.**

### Прочий перф

- [ ] **(low) `saveTrn` O(N)-клон** - `useTrnsStore.saveTrn` на каждую запись клонирует ~8к-объект (`{ ...items.value, [id]: ... }`) ради иммутабельной реактивности. При 8к - единицы мс, растёт линейно → боль на 30-50к+. Идея: `shallowRef<Map>` + `map.set` + `triggerRef`. Не одна строка: объектная форма `items` читается из стора, других сторов (`recentWalletIds`/`walletTotals`/`usedCategoryIds`) и компонентов/`reconcileTrns` - Map ломает все эти места. Сначала микробенч (8к/50к), потом решать. _Касается той же стоимости полного набора trns, но независим: про реактивность записи, не про слои хранения._

> Рассмотрено и отклонено: **date-windowed watch** (`WHERE date >= ?` вместо `SELECT *`) ломает тоталы - `walletTotals`/`recentWalletIds`/`usedCategoryIds` считаются по всей истории; индексы (`AppSchema.ts` `trns.userDate`) уже есть. **manualChunks разнести вендоры** - рискованно: дробление reka-ui ломает `inject`/createContext в проде.

### Прочее

- [ ] **WASM precache glob-сужение** - в precache все 8 wasm-вариантов (~14 MB), в рантайме грузится только `wa-sqlite-async` (`IDBBatchAtomicVFS`). Сузить glob - **после** ручного офлайн-теста в браузере, подтвердив грузимый вариант. Текущее безопасно, цена +14 MB при установке SW.

- [ ] **Auto-reconcile edge: каскад ревёрта wallet/category** - `powersync.client.ts` при фатальном отклонении INSERT кошелька/категории сносит только эту строку (`deleteRow`), а оптимистично добавленные локальные trns с её `walletId`/`categoryId` остаются осиротевшими (FK нет; в UI - trns на несуществующий кошелёк). Редко, низкий приоритет. Фикс: каскадить локальные trns при ревёрте (как сторовые `deleteWallet`/`deleteCategory`).

### Документация

- [x] **Доки про удалённый offline-queue** (done, commit `34e2a4f4`) - контент `04.*` (en+ru) уже описывал offline-first через PowerSync; устаревшими были slug/имя файла. Переименовано `04.offline-queue.md` → `04.offline-first.md` (URL `/reference/offline-first`), кросс-линки в `03.sync.md`/`01.architecture.md` (en+ru) обновлены, секция «No Manual Queue» очищена от мёртвых идентификаторов (`replay.ts`/`mergeOfflineOps()`/`local_` и т.п.). `replayOfflineQueue` в прозе архитектуры уже не было - заметка была частично устаревшей. `graphify update .` прогнан (Removed-узлы удалённого кода ушли при ре-экстракции; `graphify-out/` gitignored). Историческое `local_`-обоснование в `05.tech-decisions.md` тоже удалено (commit `8769c888`) - решение про клиентские UUID теперь обосновано офлайн-циклом PowerSync, без сравнения с удалённой схемой прежнего бэкенда. В трекаемых файлах не осталось ни `local_`, ни `convex`.
- [x] **Док-рассинхрон: Google sign-in** (done, uncommitted) - вместо «согласовать на словах» добавлен реальный Google OAuth **рядом** с email/password: `useSupabase.ts` (`detectSessionInUrl: true` + `signInWithGoogle`), `login.vue` (кнопка + обмен `?code=` на возврате), i18n `login.signInWithGoogle`, `config.toml` (`[auth.external.google]` + redirect-allowlist на `:3050`), `.env.example` (Google-переменные для локального Supabase). Доки приведены в соответствие: `03.auth.md`, `01.architecture.md` (строка «email/password only» + устаревшие cookie-ссылки на `hasPersistedSession()`), `01.installation.md`/`05.deployment.md` (локальная и прод-настройка), `README.md`, `CLAUDE.md`. Прод-провайдер - в дашборде Supabase. e2e остаётся на email/password (Google-consent в CI не автоматизируется).
- [x] **CLAUDE.md stale auth-gate** (done, uncommitted) - строка про `powersync.client.ts` переписана: eager SQLite-init для залогиненного юзера + connect/disconnect по `uid`; синхронный gate = `hasPersistedSession()` (`useAuthSession.ts`), куки нет.
- [x] **(low) graphify: шум в графе** (done, uncommitted) - добавлен `.graphifyignore` (суперсет `.gitignore` + трекаемый конфиг-шум: `.claude/`, `.vscode/`, `.mcp.json`, `.fallowrc.json`, `eslint.config.js`). `graphify update . --force` срезал 31 конфиг-god-ноду (2826→2800, 0 шума в graph.json). Два устаревших кэш-лейбла коммьюнити переименованы по фактическому содержимому: `.fallowrc`→«Claude Skills», `eslint.config`→«Review Severity» (правка в GRAPH_REPORT.md + graph.html + `.graphify_labels.json`; `graphify-out/` gitignored). На будущее: `update` не регенерит отчёт при no-op топологии - правка только лейблов требует ручного патча или реального code-change.

## Сделано (закоммичено)

- **Миграция → Supabase + PowerSync:** бэкенд (Postgres + RLS + PowerSync sync-rules), клиентский data-layer (`app/services/powersync/`), сторы на `db.watch` + `upsertRow`/`deleteRow`, Supabase email/password auth.
- **Cold-start блоб-кеш** (`useStoreCache.ts`, single-object `finapp.cache.<uid>`, `primeFromCache` в сторах): первый кадр ~298ms против ~699ms.
  - OPFS-VFS замерян и **отклонён** (флэт vs `IDBBatchAtomicVFS`; cold-start упирается в `db.init` ~210ms + сериализацию запросов + per-row transform, не в page-I/O). `db.ts` на дефолтном `IDBBatchAtomicVFS` (мульти-таб, без COOP/COEP).
  - Грабли на будущее: стор `user` - глубокий `ref`-proxy, IndexedDB его не клонирует (`DataCloneError`) → persist через `toRaw()` (в тестах `vi.stubGlobal('toRaw', toRaw)`).
- **Login→onboarding флеш убран:** синхронный auth-gate из persisted Supabase-сессии (`useAuthSession.ts`, `auth.global.ts` → `hasPersistedSession()`, явный `auth.storageKey`); кука `finapp.localAuthUid` удалена. Hydration-aware готовность: module-level `isDbLoading`/`isHydrated` (`useInitApp.ts`), `isLoaded` в сторах на первой эмиссии watch, решение `dashboard.vue`/`default.vue` через `isOnboardedHint` + `isHydrated`.
- **Auto-reconcile фатальных upload-ошибок:** `uploadReconcile.ts` (`planDivergence`), `connector.ts` (срез `divergedOps` от точки фейла), `db.ts` (`forceResync` = wipe+reconnect), `powersync.client.ts` (rejected UPDATE/DELETE → тост «Reload» → `forceResync`; rejected INSERT → `deleteRow`). Ревью проведено - реализация звучная.
- **Reference-доки очищены от упоминаний прежнего бэкенда** (2026-06-04): `07.firebase-migration.md` (en+ru) переписан, `04.migration.md` схлопнут в одну миграцию, `08.loans-optimization.md` удалён, заметка в `CLAUDE.md` снята.
- **Тесты:** e2e под Supabase (сид `seed-e2e-user.mjs`, `auth.setup.ts`, real-спеки categories-children 8/8), стор-юниты, docs/README под Supabase+PowerSync.
