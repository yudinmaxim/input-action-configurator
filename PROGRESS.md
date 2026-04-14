# Input Action Configurator - Статус Проекта

## Текущий Этап: MVP Интерфейс (в разработке)

### ✅ Выполнено

**1. Инфраструктура проекта:**
- Git репозиторий инициализирован
- Vue 3.5 + Vite настроен
- Tauri 2.x конфигурация для Linux desktop
- FSD (Feature-Sliced Design) структура папок
- UnoCSS для утилитарных стилей

**2. Типы данных (полные):**
- `src/shared/lib/types/index.ts` - основные типы InputActions
  - Enums: DeviceType, TriggerType, SwipeDirection, MouseButton и др.
  - Интерфейсы устройств, триггеров, действий
  - InputActionsConfig - корневая структура конфига
- `src/shared/lib/types/device-rule.ts` - типы для device rules
- ~1600 строк документации типов с JSDoc

**3. UI Компоненты (базовые):**
- `BaseButton.vue` - кнопки (primary/secondary/danger/ghost)
- `BaseInput.vue` - текстовые input
- `BaseSelect.vue` - выпадающие списки
- `BaseCard.vue` - карточки с заголовком
- `BaseCheckbox.vue` - чекбоксы
- `BaseLabel.vue` - лейблы

**4. Хранилище (mock data):**
- `src/shared/lib/stores/config.ts`
- Тестовые данные: 4 swipe-триггера на touchpad, 1 на mouse
- CRUD операции для триггеров и действий

**5. Основной интерфейс:**
- Трёхпанельный layout:
  - Левая: список устройств
  - Средняя: список триггеров
  - Правая: редактор свойств триггера
- Формы для редактирования:
  - Basic Properties (id, type, threshold, speed)
  - Direction & Movement (direction, fingers, mouse_buttons)
  - Actions (command, input, plasma-shortcut, sleep)
  - Options (block_events, clear_modifiers, accelerated)

---

### ⚠️ Известные Проблемы

1. **При смене триггера в списке форма не обновляется**
   - Debug показывает `selectedTriggerId` меняется
   - Debug показывает `selectedTrigger` имеет правильные данные
   - Но форма не перерисовывается
   - Временно исправлено через `:key` - помогает перерендерить форму

---

### 📋 TODO: Следующие Шаги

**Приоритет 1 - Исправления:**
1. Исследовать и исправить реактивность при смене триггера
2. Убрать debug output из кода

**Приоритет 2 - Базовая функциональность:**
3. Добавить сохранение/загрузку конфига из файла `~/.config/inputactions/config.yaml`
4. Добавить валидацию YAML
5. Добавить watching файла конфига

**Приоритет 3 - UI/UX:**
6. Улучшить отображение списка триггеров (добавить иконки, цвета)
7. Добавить drag-n-drop для reorder триггеров
8. Сделать превью YAML конфига
9. Добавить undo/redo

**Приоритет 4 - Расширение функциональности:**
10. Поддержка всех типов действий (input actions - keyboard/mouse simulation)
11. Поддержка условий (conditions)
12. Поддержка device rules
13. Поддержка переменных и динамических значений

**Приоритет 5 - Tauri:**
14. Интеграция с Tauri для чтения/записи файлов
15. Добавить системное tray
16. Обработка ошибок и уведомления

---

### 🚀 Как Запустить

```bash
# Установка зависимостей
npm install

# Dev режим (frontend only)
npm run dev

# Production build
npm run build

# Tauri dev (с desktop окном)
npm run tauri:dev

# Tauri build
npm run tauri:build
```

---

### 📁 Структура Проекта

```
input-action-confidurator/
├── src/
│   ├── app/
│   │   └── App.vue              # Главный компонент
│   ├── main.js                  # Точка входа
│   └── shared/
│       ├── lib/
│       │   ├── stores/
│       │   │   └── config.ts    # Vue store с mock данными
│       │   └── types/
│       │       ├── index.ts     # Основные типы InputActions
│       │       └── device-rule.ts
│       └── ui/
│           └── base/            # Базовые UI компоненты
├── src-tauri/                   # Tauri backend (Rust)
├── uno.config.ts               # UnoCSS конфиг
├── vite.config.js              # Vite конфиг
├── package.json
├── SPEC.md                     # ТЗ проекта
└── README.md
```

---

### 🔗 Ресурсы

- InputActions Wiki: https://github.com/InputActions/wiki
- InputActions KWin: https://github.com/InputActions/kwin
- UnoCSS: https://unocss.dev/
- Tauri: https://tauri.app/