<script setup lang="ts">
import { computed } from 'vue'
import { useConfigStore } from '../../shared/lib/stores/config'

const store = useConfigStore()

const config = computed(() => store.state.config)

const yamlOutput = computed(() => {
  return dumpYaml(config.value)
})

function dumpYaml(obj: any, indent = 0): string {
  if (obj === null || obj === undefined) return ''
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return String(obj)
  }
  
  if (Array.isArray(obj)) {
    if (obj.length === 0) return ''
    return obj.map(item => {
      const dumped = dumpYaml(item, indent + 1)
      const prefix = '  '.repeat(indent)
      return dumped.includes('\n') 
        ? `${prefix}- ${dumped.replace(/\n/g, `\n${prefix}  `)}`
        : `${prefix}- ${dumped}`
    }).join('\n')
  }
  
  if (typeof obj === 'object') {
    const lines: string[] = []
    
    for (const key of Object.keys(obj)) {
      const value = obj[key]
      if (value === undefined || value === null) continue
      
      const prefix = '  '.repeat(indent)
      
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          if (value.length === 0) continue
          lines.push(`${prefix}${key}:`)
          for (const item of value) {
            if (typeof item === 'object' && item !== null) {
              const itemLines = dumpYaml(item, indent + 2).trim().split('\n')
              if (itemLines.length === 1 && !itemLines[0].includes(':')) {
                lines.push(`${prefix}  - ${itemLines[0]}`)
              } else {
                lines.push(`${prefix}  - ${itemLines[0]}`)
                for (let i = 1; i < itemLines.length; i++) {
                  lines.push(`    ${itemLines[i]}`)
                }
              }
            } else {
              lines.push(`${prefix}  - ${item}`)
            }
          }
        } else {
          const inner = dumpYaml(value, indent + 1)
          if (inner.trim()) {
            lines.push(`${prefix}${key}:`)
            lines.push(inner)
          }
        }
      } else {
        lines.push(`${prefix}${key}: ${value}`)
      }
    }
    return lines.join('\n')
  }
  
  return String(obj)
}
</script>

<template>
  <div class="w-80 border-l border-gray-200 bg-slate-900 flex flex-col h-full">
    <div class="p-4 border-b border-gray-700">
      <h2 class="text-lg font-semibold text-gray-200">YAML Preview</h2>
    </div>
    <pre class="flex-1 overflow-auto p-4 text-sm font-mono text-green-400 whitespace-pre">{{ yamlOutput }}</pre>
  </div>
</template>