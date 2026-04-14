import { defineConfig, presetUno, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons(),
  ],
  theme: {
    colors: {
      primary: {
        DEFAULT: '#3b82f6',
        hover: '#2563eb',
        active: '#1d4ed8',
      },
    },
  },
})