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
- **Type checking:** Uses `vue-tsc --noEmit` (not tsc directly)

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
- `src/shared/yaml-converter.ts` - YAML parsing/serialization utils
- `uno.config.ts` - UnoCSS configuration

## Development Workflow

1. For UI changes: `npm run dev`
2. For type safety: `npm run type-check`
3. For desktop testing: `npm run tauri:dev`
4. For production: `npm run tauri:build`

## Configuration Format

- Uses YAML format for config persistence
- Uses js-yaml library for parsing
- Custom type validation in `yaml-converter.ts`
- Default config stored in store until saved to file

## Data Model

- Config structure: `{ device: { [DeviceType]: TriggerConfig[] }, device_rules: [], settings: {} }`
- Device types: KEYBOARD, MOUSE, TOUCHPAD, TOUCHSCREEN
- Trigger types: SWIPE, CIRCLE, HOLD, TAP, CLICK, STROKE, PINCH, ROTATE, WHEEL, PRESS, SHORTCUT
- Trigger events: BEGIN, UPDATE, TICK, END, CANCEL, END_CANCEL