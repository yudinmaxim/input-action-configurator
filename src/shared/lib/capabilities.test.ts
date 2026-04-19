import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const CAPABILITIES_PATH = path.join(process.cwd(), 'src-tauri/capabilities/default.json')
const CARGO_TOML_PATH = path.join(process.cwd(), 'src-tauri/Cargo.toml')

describe('Tauri capabilities', () => {
  it('должен содержать permissions для dialog плагина', () => {
    const content = fs.readFileSync(CAPABILITIES_PATH, 'utf-8')
    const capabilities = JSON.parse(content)
    
    expect(capabilities.permissions).toContain('dialog:default')
    expect(capabilities.permissions).toContain('dialog:allow-open')
  })

  it('должен содержать permissions для clipboard-manager плагина', () => {
    const content = fs.readFileSync(CAPABILITIES_PATH, 'utf-8')
    const capabilities = JSON.parse(content)
    
    expect(capabilities.permissions).toContain('clipboard-manager:default')
    expect(capabilities.permissions).toContain('clipboard-manager:allow-write-text')
  })

  it('должен содержать permissions для shell плагина', () => {
    const content = fs.readFileSync(CAPABILITIES_PATH, 'utf-8')
    const capabilities = JSON.parse(content)
    
    expect(capabilities.permissions).toContain('shell:default')
    expect(capabilities.permissions).toContain('shell:allow-open')
  })

  it('должен иметь валидную структуру', () => {
    const content = fs.readFileSync(CAPABILITIES_PATH, 'utf-8')
    const capabilities = JSON.parse(content)
    
    expect(capabilities.$schema).toBeDefined()
    expect(capabilities.identifier).toBe('default')
    expect(capabilities.windows).toContain('main')
    expect(Array.isArray(capabilities.permissions)).toBe(true)
    expect(capabilities.permissions.length).toBeGreaterThan(0)
  })
})

describe('Tauri cargo dependencies', () => {
  it('должен содержать tauri-plugin-dialog', () => {
    const content = fs.readFileSync(CARGO_TOML_PATH, 'utf-8')
    expect(content).toContain('tauri-plugin-dialog')
  })

  it('должен содержать tauri-plugin-clipboard-manager', () => {
    const content = fs.readFileSync(CARGO_TOML_PATH, 'utf-8')
    expect(content).toContain('tauri-plugin-clipboard-manager')
  })

  it('должен содержать tauri-plugin-shell', () => {
    const content = fs.readFileSync(CARGO_TOML_PATH, 'utf-8')
    expect(content).toContain('tauri-plugin-shell')
  })
})