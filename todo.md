# Миграция Firebase → Supabase + PowerSync: остаток

Ветка `feat/supabase-powersync`. Сделаны и **закоммичены**: миграция, клиентский data-layer, сторы, auth, cold-start блоб-кеш, фикс login→onboarding-флеша, auto-reconcile, стор/e2e-тесты, docs/README. Ниже - только открытые задачи и операционные заметки.

## Заметки по верификации

- **Тесты:** из `app/` - `cd app && pnpm exec vitest run` (или корневой `pnpm test`). Из корня моно vitest даёт ложные fail (нет конфига и алиаса `~/`).
- **Lint:** `pnpm lint` (`eslint .`). В ignores: `.understand-anything/**`, `graphify-out/**`, `.claude/**`, `app/powersync/**`, `app/supabase/config.toml`. `.gitignore` flat-config НЕ читает; точечно - `pnpm exec eslint <файлы>`.

## Открытые задачи

### Перф: стоимость стартовой загрузки trns

Одна связанная цепочка **1 → 2 → 3**. Пункты 1 и 2 закрыты 2026-06-12 (замеры на проде, аккаунт 8.2k trns / 200 категорий / 28 кошельков, perf-марки `ps:watch:*` / `cache:prime` / `trns:first-transform` оставлены в коде).

- [x] **1. Замеры cold-start** (done 2026-06-12). Результаты (prod-билд, warm SQLite, reload):
  - Чтения **сериализованы** на одном воркер-соединении: 5 watch'ей армируются одновременно (~352ms), первые эмиссии лесенкой - user_settings 506 → rates 539 → categories 557 → wallets 561 → **trns 731ms**.
  - Доминирует скан+передача trns (~170ms чистых после мелких запросов + ~150ms общий старт), мелкие 4 запроса вместе ~50ms сверху - сливать их почти нечего.
  - **Per-row transform пренебрежим**: `trns:first-transform` = **2.6ms** на 8.2k строк. Дорог скан/сериализация из воркера, не JS-преобразование.
  - Блоб-кеш праймит сторы за **72ms** (старт 212ms → данные в сторах ~284ms) против первой эмиссии trns в 731ms → выигрыш ~450ms на данных на экране.
- [x] **2. Решение: оставить два слоя (ветка «б»)** (done 2026-06-12). Блоб-кеш даёт данные на экране на ~450ms раньше, чем SQLite-watch, и его польза - именно ранний прайм (не пропуск transform, как предполагалось). Цена (дублирование в IndexedDB + write-amplification) принимается; инкрементальная запись - пункт 3.
- [x] **3. Блоб-кеш: инкрементальная запись** - отклонено 2026-06-12 (YAGNI). `persistStoreCache` уже дебаунсится (400ms) с RMW-merge слайсов, т.е. пишется не чаще раза в 400ms после последней мутации; на 8.2k trns перезапись блоба не заметна. Вернуться только при реальной деградации записи на 30-50к+.

### Прочий перф

> Рассмотрено и отклонено: **date-windowed watch** (`WHERE date >= ?` вместо `SELECT *`) ломает тоталы - `walletTotals`/`recentWalletIds`/`usedCategoryIds` считаются по всей истории; индексы (`AppSchema.ts` `trns.userDate`) уже есть. **manualChunks разнести вендоры** - рискованно: дробление reka-ui ломает `inject`/createContext в проде. **`saveTrn` O(N)-клон → Map-рефакторинг** - отклонено 2026-06-12 (YAGNI): единицы мс на 8к, а Map ломает всех читателей объектной формы `items`; вернуться по микробенчу только при реальной боли на 30-50к+.

- [x] **Остаточный CLS** (done 2026-06-12) - причиной были НЕ сайдбар/transition, а **иконки, догружаемые с api.iconify.design в рантайме** (атрибуция layout-shift: `i-lucide:folder`/`i-lucide:network` + hugeicons-меню; коллекции hugeicons не было ни в бандле, ни в `collections`). Фикс: `@iconify-json/hugeicons` + явный список статических имён в `icon.clientBundle.icons` (`nuxt.config.ts`) - scan не видит имена в динамических тернарниках. Иконки из пользовательских данных (категории) остаются на рантайм-фетче за SW CacheFirst. Итог: авторизованный reload 0.18, вход в демо ~0.20 (было 1.10); остаток - двухфазная отрисовка данных поверх шелла (sums/списки во втором patch), принято как цена cache-first.

### Сделано: финализация cache-first (2026-06-12)

- TEMP-скаффолдинг убран: guard пустой эмиссии в сторах сужен до **первой** эмиссии (пустая ПЕРВАЯ = синк ещё не доехал → держим кэш; пустая ПОСЛЕДУЮЩАЯ = настоящий wipe → применяется; прежний вариант навсегда прятал удаление всех данных с другого устройства). `bootState` без мёртвого `'loading'` (сплэша нет, кэш/скелетон сразу), закомментированный await-вариант `awaitInitialSync` удалён. Тесты сторов покрывают оба поведения.

### Сделано: бандл/загрузка (2026-06-12)

- **@powersync/web лениво** (`db.ts` `getPowerSyncDb()` - dynamic import либы+схемы+коннектора; `uploadErrorHandler.ts` выделен, чтобы статический импорт плагина не тянул либу; `UpdateType` в `uploadReconcile.ts` заменён строковым литералом). Entry: 1066 → **845 KB** (-25%, у main 752 KB). Авторизованный reload (8.2k trns): LCP 544 → **406ms**.
- **swiper лениво** (`default.vue`: `LazyTrnFormBottom/Sidebar` монтируются после первого открытия формы, idle-prefetch чанка) - ушёл из критического пути загрузки.
- **echarts после idle** (`useIdleMount.ts`, `stat/chart/Wrap.vue` - плейсхолдер той же высоты) - не конкурирует с LCP.
- **Скелетон dashboard** (`stat/PageSkeleton.vue`, `dashboard.vue` по `hasAnyData`).
- **WASM precache сужен** (`nuxt.config.ts` workbox: только `wa-sqlite-async.<hash>.wasm`, вместо 8 вариантов ~14MB → ~2.5MB; mc-сборки нужны только при `encryptionKey`, проверено по dist). Офлайн-загрузка авторизованного приложения проверена в браузере - работает.

### Прочее

- [x] **WASM precache glob-сужение** (done 2026-06-12) - см. «Сделано: бандл/загрузка»: precache сужен до `wa-sqlite-async.<hash>.wasm`, офлайн-загрузка проверена в браузере.

- [x] **Auto-reconcile edge: каскад ревёрта wallet/category** (done 2026-06-12) - `deleteTrnsReferencing()` в `mutations.ts`: ревёрт отклонённого INSERT кошелька/категории каскадно удаляет локальные trns по `walletId`/`expenseWalletId`/`incomeWalletId` / `categoryId` (удаления уходят и в upload-очередь - сервер сходится, если часть trns успела доехать).

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
