# Supabase Backend Documentation

В этом документе описана связь между SQL-файлами в папке `supabase/migrations/` и функциональностью приложения FamStory.

## Карта соответствия: SQL -> Функционал

### 1. `01_auth_profiles.sql` (Пользователи и Тарифы)
*   **За что отвечает:** Учетные записи, профили пользователей, информация о подписке (Basic, Guardian, Legacy).
*   **Когда вызывается:**
    *   **Регистрация:** При создании аккаунта срабатывает Postgres-триггер `on_auth_user_created`, который автоматически создает запись в таблице `profiles`.
    *   **Вход в систему:** `authStore.initialize()` запрашивает данные сессии.
    *   **Проверка подписки:** `subscriptionStore.fetchSubscription()` делает SELECT запрос к таблице `profiles`.
    *   **Оплата/Апгрейд:** `subscriptionStore.upgradeTier()` выполняет UPDATE запрос.

### 2. `02_core_archive.sql` (Ядро: Архивы и Древо)
*   **За что отвечает:** Хранение семейных имен, списков людей, их биографий и связей в графе.
*   **Когда вызывается:**
    *   **Загрузка списка архивов:** `FamilyRepository.getAllByUser()` запрашивает таблицу `families`.
    *   **Открытие конкретной семьи:** `FamilyRepository.getBySlug()` запрашивает `families` + `members` + `family_relations`.
    *   **Сохранение правок:** `FamilyRepository.save()` выполняет пакетный UPSERT в `members` и `family_relations`.
    *   **Удаление:** Методы `deleteMember` или `deleteArchive` выполняют DELETE запросы.

### 3. `03_analytics.sql` (Аналитика)
*   **За что отвечает:** Сбор статистики использования (клики, переходы, ошибки).
*   **Когда вызывается:**
    *   **Любое действие:** Композит `useAnalytics` через `AnalyticsRepository.logEvent()` выполняет INSERT в таблицу `analytics_events`.
    *   **Админка:** На странице `/admin` выполняются агрегирующие запросы для графиков.

### 4. `04_rls_security.sql` (Безопасность данных)
*   **За что отвечает:** Row Level Security (RLS). Это "невидимый" слой, который гарантирует приватность.
*   **Когда вызывается:**
    *   **Автоматически при каждом запросе:** На каждый SELECT/UPDATE/INSERT база проверяет, совпадает ли `auth.uid()` (ID текущего залогиненного юзера) с полем `user_id` в строке таблицы.
    *   **Публичный доступ:** Позволяет любому человеку (даже без логина) смотреть архив, если у него есть прямая ссылка (через правило `Public can view`).

### 5. `05_storage_and_performance.sql` (Файлы и Скорость)
*   **За что отвечает:** Бакет `photos` в Storage и индексы для ускорения поиска.
*   **Когда вызывается:**
    *   **Загрузка фото:** `FamilyRepository.uploadFile()` отправляет файл в бакет `photos`.
    *   **Отрисовка списка:** Индексы `idx_families_slug` и `idx_members_family` срабатывают автоматически при поиске, чтобы архив открывался за миллисекунды даже при большом количестве данных.

---

## Сводная таблица запросов

| Действие в UI | Repository Метод | SQL Таблица |
| :--- | :--- | :--- |
| Создать аккаунт | `authStore.signUp` | `auth.users` -> `profiles` (триггер) |
| Создать семью | `store.createArchive` | `families` (INSERT) |
| Добавить родственника | `store.addMember` | `members` (UPSERT) |
| Связать людей на древе | `store.addRelation` | `family_relations` (UPSERT) |
| Загрузить фото | `FamilyRepository.uploadFile` | `storage.objects` (INSERT) |
| Переключить тариф | `subStore.upgradeTier` | `profiles` (UPDATE) |
