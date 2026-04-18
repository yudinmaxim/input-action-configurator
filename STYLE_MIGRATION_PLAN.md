# План миграции на UnoCSS

## 📊 Общая статистика

| Категория | Количество |
|-----------|------------|
| Vue файлов со `<style scoped>` | 23 |
| Уникальных кастомных классов | ~70 |
| Состояний (hover/active/disabled) | ~50 |
| Анимаций переходов | ~10 |

---

## 🎯 Критические кастомные стили для миграции

### 1. **App.vue** - Заголовок окна и кнопки управления

```css
/* ❌ Current */
.titlebar { height: 40px; cursor: default; }
.icon-btn {
  width: 32px; height: 32px;
  border-radius: 6px;
  background: #f3f4f6;
  color: #374151;
}
.control-btn {
  width: 46px; height: 40px;
}
```

```css
/* ✅ UnoCSS equivalent */
.titlebar → h-10 cursor-default
.icon-btn → w-8 h-8 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 disabled:opacity-40
.control-btn → w-[46px] h-10 hover:bg-gray-100
```

**Проблема:** `-webkit-app-region` не поддерживается UnoCSS (требуется CSS)

---

### 2. **BaseModal.vue, ConfigPreviewModal.vue, AppSelectorModal.vue**

```css
/* ❌ Current - повторяется в 3+ файлах */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.close-btn {
  width: 28px; height: 28px;
  border-radius: 50%;
  color: #9ca3af;
  transition: all 0.15s ease;
}
```

```css
/* ✅ UnoCSS */
.modal-enter-active → transition-opacity duration-200 ease
.close-btn → w-7 h-7 rounded-full text-gray-400 hover:bg-gray-100 active:scale-90
```

---

### 3. **BaseResizablePanel.vue, BaseThreeColumnPanel.vue** - Слайдеры

```css
/* ❌ Current - повторяется в 2 файлах */
.resizer {
  width: 8px; cursor: col-resize;
  background: transparent;
}
.resizer:hover { background: rgba(59, 130, 246, 0.1); }
.resizer-line {
  width: 1px; height: 100%;
  background: #d1d5db;
}
```

```css
/* ✅ UnoCSS */
.resizer → w-2 cursor-col-resize hover:bg-blue-500/10
.resizer-line → w-0.5 h-full bg-gray-300 hover:bg-blue-500
```

---

### 4. **BaseTab.vue** - Удаление таба

```css
/* ❌ Current */
.delete-btn {
  width: 20px; height: 20px;
  border-radius: 50%;
  color: #9ca3af;
  transition: all 0.15s ease;
}
.delete-btn:hover { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
```

```css
/* ✅ UnoCSS */
.delete-btn → w-5 h-5 rounded-full text-gray-400 hover:bg-red-500/15 hover:text-red-500 active:scale-90
```

---

### 5. **FieldHelp.vue** - Тултип

```css
/* ❌ Current */
.help-btn {
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  font-size: 12px; font-weight: 600;
}
.help-tooltip {
  position: fixed; z-index: 9999;
  width: 240px; padding: 10px 12px;
  background: #1f2937; color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

```css
/* ✅ UnoCSS */
.help-btn → w-4.5 h-4.5 rounded-full bg-gray-200 text-gray-600 text-xs font-semibold
.help-tooltip → fixed z-[9999] w-60 p-2.5 bg-gray-800 text-white rounded-lg shadow-lg
```

---

### 6. **ActionsEditor.vue** - Кнопки добавления (многоразовые цвета)

```css
/* ❌ Current - 7 разных цветов повторяются */
.add-btn-blue { background: #dbeafe; color: #2563eb; }
.add-btn-green { background: #dcfce7; color: #16a34a; }
.add-btn-amber { background: #fef3c7; color: #d97706; }
.add-btn-red { background: #fee2e2; color: #dc2626; }
.add-btn-purple { background: #f3e8ff; color: #9333ea; }
.add-btn-orange { background: #ffedd5; color: #ea580c; }
.add-btn-gray { background: #f3f4f6; color: #4b5563; }
```

```css
/* ✅ UnoCSS */
.add-btn-blue → bg-blue-100 text-blue-600 hover:bg-blue-200
.add-btn-green → bg-green-100 text-green-600 hover:bg-green-200
.add-btn-amber → bg-amber-100 text-amber-600 hover:bg-amber-200
.add-btn-red → bg-red-100 text-red-600 hover:bg-red-200
.add-btn-purple → bg-purple-100 text-purple-600 hover:bg-purple-200
.add-btn-orange → bg-orange-100 text-orange-600 hover:bg-orange-200
.add-btn-gray → bg-gray-100 text-gray-600 hover:bg-gray-200
```

---

### 7. **MouseButtonsSelector.vue, KeyboardModifierToggles.vue**

```css
/* ❌ Current - повторяется в 2 файлах */
.mod-btn {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px; font-weight: 500;
  border: 1px solid #d1d5db;
  background: #f9fafb; color: #6b7280;
}
.mod-btn-selected { background: #3b82f6; border-color: #3b82f6; color: white; }
```

```css
/* ✅ UnoCSS */
.mod-btn → px-2.5 py-1 rounded-md text-xs font-medium border border-gray-300 bg-gray-50 text-gray-600
.mod-btn-selected → bg-blue-500 border-blue-500 text-white
```

---

### 8. **ConditionGroup.vue, DeviceRulesEditor.vue, DeviceRulesModal.vue**

```css
/* ❌ Current - повторяется в 3+ файлах */
.delete-btn {
  width: 24px; height: 24px;
  border-radius: 50%;
  color: #9ca3af;
  transition: all 0.15s ease;
}
.delete-btn:hover { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
```

```css
/* ✅ UnoCSS */
.delete-btn → w-6 h-6 rounded-full text-gray-400 hover:bg-red-500/15 hover:text-red-500 active:scale-90 transition-all duration-150
```

---

## 📋 Приоритеты миграции

### 🔴 Высокий приоритет (повторяющиеся стили)

| Класс | Файлы | Статус |
|-------|-------|--------|
| `.delete-btn` | 10+ файлов | **Мигрировать** |
| `.icon-btn` | App.vue, TriggerCard.vue | **Мигрировать** |
| `.close-btn` | 5+ модальных окон | **Мигрировать** |
| `.mod-btn` | 2 файла | **Мигрировать** |
| `.resizer` | 2 файла | **Мигрировать** |

### 🟡 Средний приоритет (уникальные стили)

| Класс | Файлы | Статус |
|-------|-------|--------|
| `.help-btn, .help-tooltip` | FieldHelp.vue | Можно оставить |
| `.add-btn-*` | ActionsEditor.vue, ConditionsEditor.vue | **Мигрировать** |
| `.titlebar` | App.vue | Оставить (нужен `-webkit-app-region`) |
| Анимации переходов | Модалки, Dropdown | Можно оставить в `<style>` |

### 🟢 Низкий приоритет

| Класс | Файлы | Статус |
|-------|-------|--------|
| Стили колонок | BaseThreeColumnPanel.vue | Оставить |
| Стили для `.tab-item` | BaseTab.vue | Оставить (сложные состояния) |

---

## 🛠️ Рекомендации по реализации

### 1. Создать глобальные утилиты в `uno.config.ts`

```typescript
// uno.config.ts
export default defineConfig({
  theme: {
    colors: {
      // Цвета для кнопок удаления
      delete: {
        DEFAULT: '#ef4444',
        hover: 'rgba(239, 68, 68, 0.15)'
      },
      // Цвета для кнопок добавления
      add: {
        blue: { bg: '#dbeafe', text: '#2563eb' },
        green: { bg: '#dcfce7', text: '#16a34a' },
        // ...
      }
    }
  }
})
```

### 2. Вынести повторяющиеся стили в отдельные компоненты

```vue
<!-- src/shared/ui/base/BaseIconButton.vue -->
<script setup lang="ts">
defineProps<{ variant?: 'default' | 'danger' | 'close' }>()
</script>

<template>
  <button 
    class="w-6 h-6 rounded-full transition-all duration-150 active:scale-90"
    :class="{
      'text-gray-400 hover:bg-gray-100': variant === 'default',
      'text-gray-400 hover:bg-red-500/15 hover:text-red-500': variant === 'danger',
      'w-7 h-7 text-gray-400 hover:bg-gray-100': variant === 'close'
    }"
  >
    <slot />
  </button>
</template>
```

### 3. Создать Composition API для модальных анимаций

```typescript
// src/shared/lib/stores/modal-animations.ts
export const modalTransitions = {
  enterActive: 'transition-opacity duration-200 ease',
  enterFrom: 'opacity-0',
  leaveTo: 'opacity-0'
}
```

---

## 📝 Итоговые рекомендации

### Не мигрировать:
- `-webkit-app-region` (не поддерживается UnoCSS)
- Сложные анимации переходов Vue (`<Transition>`)
- Стили с `:deep()` и вложенными селекторами

### Обязательно мигрировать:
- `.delete-btn` (10+ файлов)
- `.icon-btn` (2 файла)
- `.close-btn` (5+ файлов)
- `.mod-btn` (2 файла)
- `.resizer` (2 файла)

### Создать глобальные компоненты:
- `BaseIconButton` (заменит `.delete-btn`, `.icon-btn`, `.close-btn`)
- `BaseAddButton` (заменит `.add-btn-*`)
- `BaseResizer` (заменит `.resizer`)

**Оценка экономии:** ~400 строк CSS кода → ~50 строк классов UnoCSS

---

## 📅 Этапы работы

### Этап 1: Подготовка (1 день)
- [ ] Добавить кастомные темы в `uno.config.ts`
- [ ] Создать `BaseIconButton` компонент
- [ ] Протестировать в одном компоненте

### Этап 2: Миграция повторяющихся стилей (2-3 дня)
- [ ] Заменить `.delete-btn` во всех файлах
- [ ] Заменить `.icon-btn` и `.close-btn`
- [ ] Заменить `.mod-btn`
- [ ] Заменить `.resizer`

### Этап 3: Миграция уникальных стилей (1-2 дня)
- [ ] Заменить `.add-btn-*`
- [ ] Оптимизировать оставшиеся стили
- [ ] Удалить пустые `<style>` секции

### Этап 4: Финализация (1 день)
- [ ] Проверка всех компонентов
- [ ] Исправление багов
- [ ] Обновление документации

**Итого:** 5-7 рабочих дней

---

**Дата создания:** 18 апреля 2026 г.  
**Версия плана:** 1.0
