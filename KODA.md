# Input Action Configurator - Контекст Проекта

## 📋 Обзор Проекта

**Название:** Input Action Configurator  
**Тип:** Desktop приложение (Tauri + Vue 3)  
**Назначение:** Визуальный редактор конфигурационных файлов для InputActions плагинов (KWin/standalone)  
**Целевая платформа:** Linux desktop (KDE Plasma с KWin)

### Основная Цель

Приложение позволяет графически редактировать конфигурационный файл `~/.config/inputactions/config.yaml`, который используется для настройки жестов и комбинаций клавиш на устройствах ввода (тачпад, мышь, клавиатура, сенсорный экран).

### Ключевые Технологии

- **Frontend:** Vue 3.5 (Composition API, **TypeScript**)
- **Build:** Vite 6.x
- **Styling:** UnoCSS (утилитарный CSS-фреймворк)
- **Desktop:** Tauri 2.x (Rust backend)
- **Архитектура:** FSD (Feature-Sliced Design)
- **Язык:** Полный TypeScript (все `.js` файлы переведены в `.ts`)

---

## 🏗️ Структура Проекта

```
input-action-confidurator/
├── src/
│   ├── main.js                     # Точка входа Vue приложения
│   ├── app/
│   │   └── App.vue                 # Главный компонент (трёхпанельный layout)
│   ├── shared/
│   │   ├── api/                    # Tauri API (заглушки для будущего)
│   │   ├── lib/
│   │   │   ├── stores/
│   │   │   │   └── config.ts       # Vue reactive store с mock данными
│   │   │   └── types/
│   │   │       ├── index.ts        # Полная система типов InputActions (~1600 строк)
│   │   │       └── device-rule.ts  # Типы для device rules
│   │   └── ui/
│   │       ├── base/               # Базовые UI компоненты
│   │       │   ├── BaseButton.vue
│   │       │   ├── BaseInput.vue
│   │       │   ├── BaseSelect.vue
│   │       │   ├── BaseCard.vue
│   │       │   ├── BaseCheckbox.vue
│   │       │   └── BaseLabel.vue
│   │       └── form/               # Формы (в разработке)
│   ├── entities/                   # Сущности (FSD)
│   ├── features/                   # Фичи (FSD)
│   ├── pages/                      # Страницы (FSD)
│   └── widgets/                    # Виджеты (FSD)
├── src-tauri/                      # Tauri backend (Rust)
│   ├── src/
│   │   ├── lib.rs                  # Rust API для Tauri
│   │   └── main.rs                 # Точка входа
│   ├── tauri.conf.json             # Конфиг Tauri
│   └── Cargo.toml                  # Rust зависимости
├── index.html                      # HTML шаблон
├── vite.config.js                  # Конфиг Vite
├── uno.config.ts                   # Конфиг UnoCSS
├── package.json                    # NPM зависимости
├── SPEC.md                         # Техническое задание (полное ТЗ)
├── PROGRESS.md                     # Статус разработки
└── KODA.md                         # Этот файл
```

---

## 🚀 Сборка и Запуск

### Установка Зависимостей

```bash
npm install
```

### Команды Разработки

```bash
# Запуск dev-сервера (frontend only) на порту 1420
npm run dev

# Проверка типов TypeScript
npm run type-check

# Production build frontend
npm run build

# Предпросмотр production сборки
npm run preview
```

### Tauri Commands

```bash
# Tauri dev (desktop приложение)
npm run tauri:dev

# Tauri production build
npm run tauri:build
```

### Тестирование

```bash
# TODO: Настроить тесты проекта
# На данный момент тестовая инфраструктура не настроена
```

---

## 📦 Поддерживаемые Устройства и Триггеры

### Устройства

| Устройство | Эмодзи | Типы Триггеров |
|------------|--------|----------------|
| keyboard | ⌨️ | shortcut |
| mouse | 🖱️ | circle, press, stroke, swipe, wheel |
| touchpad | 👆 | circle, click, hold, pinch, rotate, stroke, swipe, tap |
| touchscreen | 📱 | circle, hold, pinch, rotate, stroke, swipe, tap |

### Типы Действий

- **input** - симуляция ввода (клавиатура/мышь)
- **command** - выполнение shell-команды
- **plasma-shortcut** - Plasma горячая клавиша
- **replace-text** - замена текста
- **sleep** - задержка

---

## 🎨 Стиль Кодирования

### Vue 3 Практики

1. **Composition API с `<script setup>`** - используется во всех компонентах
2. **TypeScript** - полная типизация через `lang="ts"`
3. **Reactive state** - через `reactive()` и `computed()` из Vue
4. **Props/Emits** - через деструктуризацию `defineProps` (Vue 3.5+):

```vue
<script setup lang="ts">
interface IProps {
  modelValue?: string
  disabled?: boolean
}

const {
  modelValue = '',
  disabled = false
} = defineProps<IProps>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
```

### Именование

- **Файлы компонентов:** PascalCase (`BaseButton.vue`)
- **Экспорты типов:** PascalCase (`DeviceType`, `TriggerType`)
- **Экспорты функций:** camelCase (`useConfigStore`, `setSelectedDevice`)
- **Переменные состояний:** camelCase (`selectedTriggerId`, `isDirty`)

### Структура Компонентов

```vue
<script setup lang='ts'>
// 1. Imports
import { ref, computed } from 'vue'
import { store } from '...'

// 2. State
const state = ref(...)

// 3. Computed
const computedValue = computed(...)

// 4. Methods
const method = () => {}

// 5. Expose (если нужно)
defineExpose({ ... })
</script>

<template>
  <!-- Template с UnoCSS классами -->
</template>

<style scoped>
<!-- Локальные стили при необходимости -->
</style>
```

### UnoCSS Стилизация

- Используются утилитарные классы из preset-uno
- Цвета темы: `primary`, `gray-*`, `blue-*`, `red-*`
- Flexbox/Grid для layout
- Реактивные состояния через `:class`

Пример:
```vue
<div class='flex items-center gap-2 px-3 py-2 rounded-md'
     :class='isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"'>
```

---

## 🧪 Текущее Состояние

### ✅ Реализовано

1. **Полная система типов** (`src/shared/lib/types/index.ts`)
   - Все enums: `DeviceType`, `TriggerType`, `SwipeDirection`, `MouseButton` и др.
   - Интерфейсы для всех устройств, триггеров, действий, условий
   - `InputActionsConfig` - корневая структура конфига
   - ~1600 строк документации JSDoc

2. **Базовые UI компоненты**
   - `BaseButton`, `BaseInput`, `BaseSelect`, `BaseCard`, `BaseCheckbox`, `BaseLabel`
   - Поддержка размеров, вариантов (primary/secondary/danger/ghost)

3. **Vue Store с mock данными** (`src/shared/lib/stores/config.ts`)
   - Reactive state с Vue 3 `reactive()`
   - CRUD операции для триггеров и действий
   - Тестовые данные: 4 swipe-триггера на touchpad, 1 на mouse

4. **Трёхпанельный интерфейс** (`App.vue`)
   - Левая панель: список устройств
   - Средняя панель: список триггеров выбранного устройства
   - Правая панель: редактор свойств триггера
   - Формы для редактирования: Basic Properties, Direction, Actions, Options

### ⚠️ Известные Проблемы

1. **Реактивность при смене триггера**
   - При выборе другого триггера форма не обновляется автоматически
   - Временно исправлено через `:key` на контейнере формы
   - Требуется исследование реактивности Vue с вложенными объектами

2. **Debug output в продакшене**
   - В `App.vue` оставлен debug-блок с `console.log`
   - Нужно убрать перед релизом

### 📋 Планы (из PROGRESS.md)

**Приоритет 1 - Исправления:**
- Исследовать и исправить реактивность при смене триггера
- Убрать debug output из кода

**Приоритет 2 - Базовая функциональность:**
- Добавить сохранение/загрузку конфига из `~/.config/inputactions/config.yaml`
- Добавить валидацию YAML
- Добавить file watching

**Приоритет 3 - UI/UX:**
- Улучшить отображение списка триггеров (иконки, цвета)
- Добавить drag-n-drop для reorder
- Сделать превью YAML конфига
- Добавить undo/redo

**Приоритет 4 - Расширение:**
- Поддержка всех типов действий (input actions - keyboard/mouse simulation)
- Поддержка условий (conditions)
- Поддержка device rules
- Поддержка переменных и динамических значений

**Приоритет 5 - Tauri:**
- Интеграция с Tauri для чтения/записи файлов
- Добавить системный tray
- Обработка ошибок и уведомления

---

## 🔧 Конфигурационные Файлы

### `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
}
```

### `vite.config.js`

- Порт dev-сервера: `1420`
- Целевые браузеры: `es2021`, `chrome100`, `safari13`
- Минификация через `esbuild` (в production)
- Source maps только в Tauri debug режиме

### `uno.config.ts`

- Presets: `presetUno()`, `presetIcons()`
- Кастомная тема: `primary` цвет (`#3b82f6`)

---

## 📚 Ресурсы и Документация

### Внешние Ресурсы

- **InputActions Wiki:** https://github.com/InputActions/wiki
- **InputActions KWin:** https://github.com/InputActions/kwin
- **UnoCSS:** https://unocss.dev/
- **Tauri:** https://tauri.app/

### Внутренняя Документация

- `SPEC.md` - Полное техническое задание
- `PROGRESS.md` - Текущий статус разработки
- `src/shared/lib/types/index.ts` - Документация типов через JSDoc

---

## 🐛 Полезные Команды для Отладки

```bash
# Запуск с source maps
TAURI_DEBUG=1 npm run tauri:dev

# Проверка TypeScript
npx tsc --noEmit

# Проверка lint (если настроен)
npm run lint

# Чистая сборка
npm run clean && npm run build
```

---

## 📝 Примечания для Koda CLI

### Флаги Git

При использовании команд git всегда добавлять `--no-pager` или устанавливать `GIT_PAGER=cat`:

```bash
git --no-pager diff HEAD
git --no-pager status
git --no-pager log -n 3
```

### Ключевые Файлы для Чтения

При работе с кодом приоритетные файлы:
1. `src/shared/lib/types/index.ts` - полная спецификация типов
2. `src/shared/lib/stores/config.ts` - реактивное состояние и логика
3. `src/app/App.vue` - основной интерфейс
4. `SPEC.md` - требования и спецификация

### Зависимости Между Файлами

```
App.vue → useConfigStore (stores/config.ts) → типы (types/index.ts)
BaseButton, BaseInput и др. → UnoCSS (uno.config.ts)
Tauri API (api/) → Rust backend (src-tauri/src/)
```

---

**Дата создания:** 14 апреля 2026 г.  
**Версия контекста:** 1.0
