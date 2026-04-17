# Input Action Configurator

Графический конфигуратор для [InputActions](https://github.com/InputActions/kwin).

## Установка KWin скрипта FocusNotifier

Для работы функции **выбора активного окна** (кнопка 🎛️ в условиях триггеров) 
необходимо установить KWin скрипт FocusNotifier.

### Быстрая установка

```bash
# 1. KWin скрипт (симлинк)
mkdir -p ~/.local/share/kwin/scripts
ln -sf ~/Projects/personal-projects/input-action-confidurator/src/entities/window-detector ~/.local/share/kwin/scripts/FocusNotifier

# 2. Listener
cp ~/Projects/personal-projects/input-action-confidurator/src/entities/window-detector/helpers/bashscripts/FocusNotifierListener.sh ~/.local/bin/
chmod +x ~/.local/bin/FocusNotifierListener.sh

# 3. DBus service
mkdir -p ~/.local/share/dbus-1/services
cat > ~/.local/share/dbus-1/services/scot.massie.FocusNotifier.service << 'EOF'
[D-BUS Service]
Name=scot.massie.FocusNotifier
Exec=/home/maxim/.local/bin/FocusNotifierListener.sh
EOF

# 4. Запуск listener
~/.local/bin/FocusNotifierListener.sh &

# 5. Включить в System Settings → Window Management → KWin Scripts
```

> **Важно:** Замените `/home/maxim` на ваш домашний путь.

### Ручная установка через UI

1. Откройте **System Settings** → **Window Management** → **KWin Scripts**
2. Нажмите **Get New Scripts** или **Import Script**
3. Установите FocusNotifier из каталога `~/.local/share/kwin/scripts/FocusNotifier`
4. Включите галочку рядом с FocusNotifier
5. Нажмите **Apply**

### Проверка работы

После установки в файле `/tmp/FocusNotifier/` должны появиться файлы:
- `pid.txt` - Process ID
- `wclass.txt` - Window class
- `wname.txt` - Window name
- `wcaption.txt` - Window title

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
