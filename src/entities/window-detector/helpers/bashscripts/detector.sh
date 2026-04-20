#!/bin/bash
# Получение информации об активном окне

# Используем qdbus для получения данных из KWin
ACTIVE_WINDOW=$(qdbus org.kde.KWin /KWin activeWindow)

if [ -z "$ACTIVE_WINDOW" ]; then
    echo '{"pid":"","name":"","class":"","caption":""}'
    exit 0
fi

# Получаем свойства окна
PID=$(qdbus "$ACTIVE_WINDOW" org.kde.KWin.Window.pid 2>/dev/null || echo "")
CLASS=$(qdbus "$ACTIVE_WINDOW" org.kde.KWin.Window.resource 2>/dev/null || echo "")
NAME=$(qdbus "$ACTIVE_WINDOW" org.kde.KWin.Window.resource 2>/dev/null || echo "")
CAPTION=$(qdbus "$ACTIVE_WINDOW" org.kde.KWin.Window.caption 2>/dev/null || echo "")

echo "{\"pid\":\"$PID\",\"name\":\"$NAME\",\"class\":\"$CLASS\",\"caption\":\"$CAPTION\"}"
