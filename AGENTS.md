# AGENTS.md - Input Action Configurator

Используй русский язык как приоритетный

## Commands

```bash
npm run dev          # Frontend dev server (port 1420)
npm run type-check   # TypeScript validation
npm run build        # Frontend production build
npm run tauri:dev    # Desktop app (Tauri)
npm run tauri:build # Desktop production build
```

## Important Notes

- **Entry point:** `src/main.ts` (not main.js)
- **Config location:** `~/.config/inputactions/config.yaml`
- **Reactivity quirk:** When switching triggers in list, use `:key` on TriggerEditor container to force re-render (known Vue reactivity issue with nested objects)

## Tech Stack

- Vue 3.5 + Vite 6.x + TypeScript (full TS, no .js)
- Tauri 2.x (Rust backend)
- UnoCSS (preset-uno, preset-icons)
- FSD architecture

## Key Files for Context

- `src/shared/lib/types/index.ts` - Full InputActions type definitions (~1600 lines)
- `src/shared/lib/stores/config.ts` - Reactive state and CRUD operations
- `src/app/App.vue` - Three-panel layout
- `src-tauri/tauri.conf.json` - Desktop app config

## input-actions wiki

https://wiki.inputactions.org/v0.9.0/conditions/group.html
https://github.com/InputActions/wiki

### input actions source kwin

https://github.com/InputActions/kwin

