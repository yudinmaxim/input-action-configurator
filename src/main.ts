import { createApp } from 'vue'
import 'virtual:uno.css'
import App from './app/App.vue'
import { i18n } from './shared/i18n'
import { useGuiStore } from './shared/lib/stores/gui'
import { watch } from 'vue'

const app = createApp(App)
app.use(i18n)

const guiStore = useGuiStore()
// Function to get valid language string
const getLanguage = async () => {
  await guiStore.loadFromFile()
  console.log('Settings from load :', guiStore.settings)
  const lang = guiStore.settings.value.language
  return typeof lang === 'string' && lang ? lang : 'ru'
}
// Set initial locale from gui store
getLanguage()
  .then(result => {
    console.log('Lang from load :', result)
    i18n.global.locale.value = result as 'ru' | 'en'
  })
// Watch for changes
watch(() => guiStore.settings.value.language, (newLang) => {
  console.log('New lang: ', newLang)
  i18n.global.locale.value = (typeof newLang === 'string' && newLang ? newLang : 'ru') as 'ru' | 'en'
})

app.mount('#app')
