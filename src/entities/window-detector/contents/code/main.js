const { KWin } = require('kwin');

let lastFocus = null;

function onFocusChanged() {
    const window = workspace.activeWindow;
    
    if (!window || window === lastFocus) {
        return;
    }
    
    lastFocus = window;
    
    const windowInfo = {
        pid: window.pid.toString(),
        name: window.resource,
        class: window.resource,
        caption: window.caption
    };
    
    // Отправляем уведомление через D-Bus
    const dbus = new DBus();
    const sender = dbus.session;
    sender.emit(
        '/org/inputactions/FocusNotifier',
        'org.inputactions.FocusNotifier',
        'WindowChanged',
        ['s', JSON.stringify(windowInfo)]
    );
    
    log('Focus changed: ' + window.resource);
}

function init() {
    workspace.connect('windowActivated', onFocusChanged);
    log('FocusNotifier initialized');
}

function teardown() {
    workspace.disconnect('windowActivated', onFocusChanged);
}

init();
