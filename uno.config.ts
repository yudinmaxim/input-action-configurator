import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
  ],
  preflights: [
    {
      getCSS: () => `
        *:focus {
          outline: none !important;
        }
        *:focus-visible {
          outline: none !important;
        }
        button {
          border: none;
          background: transparent;
          cursor: pointer;
        }
        select {
          background: transparent;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
        input {
          border: solid;
        }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `
    }
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: '#3b82f6',
        hover: '#2563eb',
        active: '#1d4ed8',
      },
      // Цвета для кнопок удаления
      delete: {
        DEFAULT: '#ef4444',
        hover: 'rgba(239, 68, 68, 0.15)',
      },
      // Цвета для кнопок добавления (похожие на текущие)
      add: {
        blue: {
          bg: '#dbeafe',
          text: '#2563eb',
          hover: '#bfdbfe',
        },
        green: {
          bg: '#dcfce7',
          text: '#16a34a',
          hover: '#bbf7d0',
        },
        amber: {
          bg: '#fef3c7',
          text: '#d97706',
          hover: '#fde68a',
        },
        red: {
          bg: '#fee2e2',
          text: '#dc2626',
          hover: '#fecaca',
        },
        purple: {
          bg: '#f3e8ff',
          text: '#9333ea',
          hover: '#e9d5ff',
        },
        orange: {
          bg: '#ffedd5',
          text: '#ea580c',
          hover: '#fed7aa',
        },
        gray: {
          bg: '#f3f4f6',
          text: '#4b5563',
          hover: '#e5e7eb',
        },
      },
    },
  },
  shortcuts: {
    // Кнопка удаления (повторяется в 10+ файлах)
    'btn-delete': 'w-6 h-6 rounded-full text-gray-400 hover:bg-red-500/15 hover:text-red-500 active:scale-90 transition-all duration-150 flex items-center justify-center',
    
    // Кнопка иконки (App.vue, TriggerCard.vue)
    'btn-icon': 'w-8 h-8 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all',
    'btn-icon-delete': 'w-6 h-6 rounded-full bg-transparent text-gray-400 hover:bg-red-500/15 hover:text-red-500 active:scale-90 transition-all',
    
    // Кнопка закрытия модального окна
    'btn-close': 'w-7 h-7 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:scale-90 transition-all flex items-center justify-center',
    
    // Кнопки модификаторов/кнопок мыши
    'btn-mod': 'px-2.5 py-1 rounded-md text-xs font-medium border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-400 active:scale-95 transition-all',
    'btn-mod-selected': 'px-2.5 py-1 rounded-md text-xs font-medium border border-blue-500 bg-blue-500 text-white hover:bg-blue-600 active:scale-95 transition-all',
    
    // Слайдер для изменения размера панелей
    'resizer': 'w-2 cursor-col-resize flex items-center justify-center bg-transparent hover:bg-blue-500/10 active:bg-blue-500/20 transition-all z-10',
    'resizer-line': 'w-0.5 h-full bg-gray-300 hover:bg-blue-500 transition-colors',
    
    // Кнопки добавления с разными цветами
    'btn-add': 'px-3 py-1.5 rounded-md text-sm font-medium border-none cursor-pointer active:scale-95 transition-all inline-flex items-center gap-1',
    'btn-add-blue': 'btn-add bg-blue-100 text-blue-600 hover:bg-blue-200',
    'btn-add-green': 'btn-add bg-green-100 text-green-600 hover:bg-green-200',
    'btn-add-amber': 'btn-add bg-amber-100 text-amber-600 hover:bg-amber-200',
    'btn-add-red': 'btn-add bg-red-100 text-red-600 hover:bg-red-200',
    'btn-add-purple': 'btn-add bg-purple-100 text-purple-600 hover:bg-purple-200',
    'btn-add-orange': 'btn-add bg-orange-100 text-orange-600 hover:bg-orange-200',
    'btn-add-gray': 'btn-add bg-gray-100 text-gray-600 hover:bg-gray-200',
    
    // Маленькая кнопка добавления
    'btn-add-small': 'px-2 py-1 rounded-md text-xs font-medium border-none bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200 active:scale-95 transition-all',
    
    // Кнопка выбора приложения
    'btn-app-select': 'w-6 h-6 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 active:scale-90 transition-all flex items-center justify-center',
    
    // Тултип
    'tooltip': 'fixed z-[9999] w-60 p-2.5 bg-gray-800 text-white text-sm rounded-lg shadow-lg',
    'tooltip-title': 'font-semibold text-sm mb-1',
    
    // Заголовок окна Tauri
    'titlebar': 'h-10 cursor-default',
    
    // Анимации переходов для модалок
    'modal-enter-active': 'transition-opacity duration-200 ease',
    'modal-leave-active': 'transition-opacity duration-200 ease',
    'modal-enter-from': 'opacity-0',
    'modal-leave-to': 'opacity-0',
  },
})