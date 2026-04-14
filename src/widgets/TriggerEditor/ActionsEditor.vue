<script setup lang="ts">
import { ref } from 'vue'
import { TriggerEventOptions } from '../../shared/lib/stores/config'
import { BaseButton, BaseInput, BaseSelect, BaseLabel } from '../../shared/ui/base'
import InputActionEditor from './InputActionEditor.vue'

interface ActionItem {
  on: string
  command?: string
  input?: any[]
  shortcut?: string
  time?: number
}

interface Props {
  selectedDevice: string | null
  selectedTriggerId: string | null
  actions: ActionItem[]
}

defineProps<Props>()

const emit = defineEmits<{
  'update-action': [index: number, updates: any]
  'delete-action': [index: number]
  'add-action': [action: any]
}>()

const showNewActionForm = ref(false)
const newActionType = ref('command')
const newActionOn = ref('begin')

const addNewAction = () => {
  const action: Record<string, unknown> = { on: newActionOn.value }
  
  if (newActionType.value === 'command') {
    action.command = 'echo'
  } else if (newActionType.value === 'input') {
    action.input = [{ keyboard: [] }]
  } else if (newActionType.value === 'plasma-shortcut') {
    action.shortcut = 'Alt+F4'
  } else if (newActionType.value === 'sleep') {
    action.time = 100
  }
  
  emit('add-action', action)
  showNewActionForm.value = false
  newActionType.value = 'command'
  newActionOn.value = 'begin'
}
</script>

<template>
  <BaseCard title="Actions">
    <div class="flex flex-col gap-4">
      <div v-for="(action, index) in actions" :key="index" class="p-3 bg-gray-50 rounded-md border border-gray-200">
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-gray-700">Action #{{ index + 1 }}</span>
          <button
            class="text-red-400 hover:text-red-600 text-sm"
            @click="emit('delete-action', index)"
          >
            Delete
          </button>
        </div>
        
        <div class="grid grid-cols-2 gap-3">
          <BaseSelect
            :model-value="action.on"
            :options="TriggerEventOptions"
            label="On"
            @update:model-value="emit('update-action', index, { on: $event })"
          />
          <BaseSelect
            :model-value="action.command !== undefined ? 'command' : action.input !== undefined ? 'input' : action.shortcut !== undefined ? 'plasma-shortcut' : action.time !== undefined ? 'sleep' : 'command'"
            :options="[{value:'command', label:'Command'},{value:'input', label:'Input'},{value:'plasma-shortcut', label:'Plasma Shortcut'},{value:'sleep', label:'Sleep'}]"
            label="Type"
          />
          
          <div class="col-span-2">
            <InputActionEditor
              v-if="action.input"
              :action-item="action.input[0]"
              @update="(item) => emit('update-action', index, { input: [item] })"
            />
            <BaseLabel v-if="action.command !== undefined">Command</BaseLabel>
            <BaseInput
              v-if="action.command !== undefined"
              :model-value="action.command"
              @update:model-value="emit('update-action', index, { command: $event })"
            />
            
            <BaseLabel v-if="action.shortcut !== undefined">Shortcut</BaseLabel>
            <BaseInput
              v-if="action.shortcut !== undefined"
              :model-value="action.shortcut"
              placeholder="Alt+F4"
              @update:model-value="emit('update-action', index, { shortcut: $event })"
            />
            
            <BaseLabel v-if="action.time !== undefined">Time (ms)</BaseLabel>
            <BaseInput
              v-if="action.time !== undefined"
              :model-value="String(action.time)"
              type="number"
              @update:model-value="emit('update-action', index, { time: Number($event) })"
            />
          </div>
        </div>
      </div>
      
      <BaseButton
        variant="secondary"
        @click="showNewActionForm = true"
      >
        + Add Action
      </BaseButton>
      
      <!-- New Action Form -->
      <div v-if="showNewActionForm" class="p-3 bg-gray-100 rounded-md">
        <div class="flex flex-col gap-2">
          <BaseSelect
            v-model="newActionOn"
            :options="TriggerEventOptions"
            label="On Event"
          />
          <BaseSelect
            v-model="newActionType"
            :options="[{value:'command', label:'Command'},{value:'input', label:'Input'},{value:'plasma-shortcut', label:'Plasma Shortcut'},{value:'sleep', label:'Sleep'}]"
            label="Action Type"
          />
          <div class="flex gap-2">
            <BaseButton size="sm" @click="addNewAction">Add</BaseButton>
            <BaseButton size="sm" variant="ghost" @click="showNewActionForm = false">Cancel</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </BaseCard>
</template>
