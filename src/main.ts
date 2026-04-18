import { createApp } from 'vue'
import 'virtual:uno.css'
import App from './app/App.vue'
import { i18n } from './shared/i18n'

createApp(App).use(i18n).mount('#app')
