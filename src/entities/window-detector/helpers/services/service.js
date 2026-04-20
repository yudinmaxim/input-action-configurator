// Сервис для работы с окнами (заглушка)
// Этот файл может быть расширен в будущем

export const windowService = {
    getActiveWindow() {
        // TODO: Реализовать через D-Bus или qdbus
        return Promise.resolve({
            pid: '',
            name: '',
            class: '',
            caption: ''
        });
    }
};
