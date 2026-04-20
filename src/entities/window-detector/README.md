# Window Detector (FocusNotifier)

KWin script для отслеживания активного окна и уведомления об изменениях.

## Структура

```
window-detector/
├── contents/
│   └── code/
│       └── main.js      # Основной скрипт KWin
├── helpers/
│   ├── bashscripts/
│   │   └── detector.sh  # Bash скрипт для получения информации об окне
│   └── services/
│       └── service.js   # Сервис для работы с окнами
├── index.ts             # TypeScript API для Vue приложения
├── metadata.json        # Метаданные KWin скрипта
└── README.md
```

## Установка

```bash
# Ссылка на скрипт в директории KWin
ln -sf /path/to/window-detector ~/.local/share/kwin/scripts/FocusNotifier
```

## Использование

Скрипт автоматически отслеживает активное окно и отправляет уведомления через D-Bus.
