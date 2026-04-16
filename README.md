# Input Action Configurator

Графический конфигуратор для [InputActions](https://github.com/InputActions/kwin).

## Установка зависимостей

Для работы приложения необходимо установить:

```bash
# Для получения списка открытых окон (выбор приложений в условиях)
sudo apt install wmctrl

**Примечание:** На Wayland+KDE нативные приложения (Flatpak, Electron и т.д.) 
не видны через wmctrl. В этом случае можно ввести window class вручную 
(например: firefox, vivaldi, code, dolphin).
```

## Команды разработки

```bash
npm run dev          # Frontend dev server (port 1420)
npm run type-check   # TypeScript validation
npm run build        # Frontend production build
npm run tauri:dev    # Desktop app (Tauri)
npm run tauri:build  # Desktop production build
```

## Формат конфигурации

Конфигурация сохраняется в `~/.config/inputactions/config.yaml`.

См. [wiki.inputactions.org](https://wiki.inputactions.org/) для документации по формату триггеров и экшенов.
