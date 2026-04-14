<script setup lang='ts'>
import { useConfigStore, DeviceTypeOptions, DeviceType, TriggerType, SwipeDirectionOptions, CircleDirectionOptions, TriggerEventOptions, MouseButtonOptions } from '../shared/lib/stores/config'
import { BaseButton, BaseInput, BaseSelect, BaseCard, BaseCheckbox, BaseLabel } from '../shared/ui/base'
import { ref, computed } from 'vue'

const store = useConfigStore()

const deviceTypeOptions = computed(() => DeviceTypeOptions.map(d => ({
  value: d.value,
  label: `${d.label} (${store.state.config.device?.[d.value]?.length || 0})`
})))

const getDeviceIcon = (type: string) => {
  const icons: Record<string, string> = {
    keyboard: '⌨️',
    mouse: '🖱️',
    touchpad: '👆',
    touchscreen: '📱'
  }
  return icons[type] || '📦'
}

const showNewTriggerForm = ref(false)
const newTriggerType = ref('')
const newTriggerId = ref('')

const createNewTrigger = () => {
  if (!store.state.selectedDevice || !newTriggerType.value || !newTriggerId.value) return
  
  const trigger = {
    type: newTriggerType.value,
    id: newTriggerId.value,
    actions: []
  }
  
  store.addTrigger(store.state.selectedDevice, trigger)
  showNewTriggerForm.value = false
  newTriggerType.value = ''
  newTriggerId.value = ''
}

const updateTriggerField = (field: string, value: unknown) => {
  if (!store.state.selectedDevice || !store.state.selectedTriggerId) return
  store.updateTrigger(store.state.selectedDevice, store.state.selectedTriggerId, { [field]: value })
}

const deleteCurrentTrigger = () => {
  if (!store.state.selectedDevice || !store.state.selectedTriggerId) return
  store.deleteTrigger(store.state.selectedDevice, store.state.selectedTriggerId)
}

const showNewActionForm = ref(false)
const newActionType = ref('command')
const newActionOn = ref('begin')

const addNewAction = () => {
  if (!store.state.selectedDevice || !store.state.selectedTriggerId) return
  
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
  
  store.addAction(store.state.selectedDevice, store.state.selectedTriggerId, action as any)
  showNewActionForm.value = false
  newActionType.value = 'command'
  newActionOn.value = 'begin'
}

const currentActions = computed(() => {
  const trigger = store.selectedTrigger
  return trigger?.actions || []
})

const selectedTriggerTriggers = computed(() => {
  if (!store.state.selectedDevice) return []
  return store.state.config.device?.[store.state.selectedDevice] || []
})

const availableTriggerTypes = computed(() => {
  if (!store.state.selectedDevice) return []
  
  const typeMap: Record<string, string> = {
    swipe: 'Swipe',
    circle: 'Circle',
    hold: 'Hold',
    tap: 'Tap',
    click: 'Click',
    stroke: 'Stroke',
    pinch: 'Pinch',
    rotate: 'Rotate',
    wheel: 'Wheel',
    press: 'Press',
    shortcut: 'Shortcut'
  }
  
  return Object.keys(typeMap).map(k => ({ value: k, label: typeMap[k] }))
})
</script>

<template>
  <div class='flex h-screen bg-gray-50'>
    <!-- Left Panel: Device List -->
    <div class='w-64 border-r border-gray-200 bg-white flex flex-col'>
      <div class='p-4 border-b border-gray-200'>
        <h2 class='text-lg font-semibold text-gray-800'>Devices</h2>
      </div>
      <div class='flex-1 overflow-y-auto p-2'>
        <div
          v-for='device in store.devices.value'
          :key='device.type'
          class='mb-2'
        >
          <div
            class='flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors'
            :class='store.state.selectedDevice === device.type ? &quot;bg-blue-100 text-blue-700&quot; : &quot;hover:bg-gray-100 text-gray-700&quot;'
            @click='store.setSelectedDevice(device.type)'
          >
            <span>{{ getDeviceIcon(device.type) }}</span>
            <span class='flex-1 font-medium'>{{ device.type }}</span>
            <span class='text-xs text-gray-400'>({{ device.triggers.length }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Middle Panel: Trigger List -->
    <div class='w-80 border-r border-gray-200 bg-white flex flex-col'>
      <div class='p-4 border-b border-gray-200 flex justify-between items-center'>
        <h2 class='text-lg font-semibold text-gray-800'>Triggers</h2>
        <BaseButton
          v-if='store.state.selectedDevice'
          size='sm'
          @click='showNewTriggerForm = true'
        >
          + Add
        </BaseButton>
      </div>
      
      <!-- New Trigger Form -->
      <div v-if='showNewTriggerForm && store.state.selectedDevice' class='p-4 border-b border-gray-200 bg-gray-50'>
        <div class='flex flex-col gap-2'>
          <BaseSelect
            v-model='newTriggerType'
            :options='availableTriggerTypes'
            placeholder='Select trigger type'
            label='Type'
          />
          <BaseInput
            v-model='newTriggerId'
            label='ID'
            placeholder='unique-trigger-id'
          />
          <div class='flex gap-2'>
            <BaseButton size='sm' @click='createNewTrigger'>Create</BaseButton>
            <BaseButton size='sm' variant='ghost' @click='showNewTriggerForm = false'>Cancel</BaseButton>
          </div>
        </div>
      </div>
      
      <div class='flex-1 overflow-y-auto p-2'>
        <div v-if='!store.state.selectedDevice' class='p-4 text-center text-gray-500'>
          Select a device to see triggers
        </div>
        <div v-else>
          <div
            v-for='trigger in selectedTriggerTriggers'
            :key='trigger.id'
            class='mb-2 px-3 py-2 rounded-md cursor-pointer transition-colors border'
            :class='store.state.selectedTriggerId === trigger.id ? &quot;bg-blue-50 border-blue-300&quot; : &quot;hover:bg-gray-50 border-transparent&quot;'
            @click='store.setSelectedTrigger(trigger.id)'
          >
            <div class='flex justify-between items-start'>
              <div>
                <span class='font-medium text-gray-800'>{{ trigger.type }}</span>
                <span v-if='trigger.fingers' class='text-gray-500 ml-1'>{{ trigger.fingers }}f</span>
              </div>
              <button
                class='text-red-400 hover:text-red-600 text-sm'
                @click.stop='store.deleteTrigger(store.state.selectedDevice, trigger.id)'
              >
                ✕
              </button>
            </div>
            <div class='text-xs text-gray-500 mt-1'>
              {{ trigger.direction || trigger.mouse_buttons?.join(', ') || trigger.keys?.join('+') || '—' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel: Trigger Editor -->
    <div class='flex-1 flex flex-col overflow-hidden'>
      <div class='p-4 border-b border-gray-200 bg-white'>
        <h2 class='text-lg font-semibold text-gray-800'>Trigger Editor</h2>
      </div>
      
      <div class='flex-1 overflow-y-auto p-4'>
        <!-- DEBUG -->
        <div class='mb-2 p-2 bg-yellow-100 text-xs font-mono'>
          DEBUG: id={{ store.state.selectedTriggerId }} | has={{ !!store.selectedTrigger }} | type={{ store.selectedTrigger?.type }} | actionsLen={{ store.selectedTrigger?.actions?.length }}
        </div>
        
        <div v-if='!store.selectedTrigger' class='text-center text-gray-500 py-8'>
          Select a trigger to edit
        </div>
        
        <div v-else class='flex flex-col gap-6' :key='store.state.selectedTriggerId'>
          <!-- Basic Properties -->
          <BaseCard title='Basic Properties'>
            <div class='grid grid-cols-2 gap-4'>
              <BaseInput
                :model-value='store.selectedTrigger.id'
                label='ID'
                @update:model-value='updateTriggerField(&quot;id&quot;, $event)'
              />
              <BaseSelect
                :model-value='store.selectedTrigger.type'
                :options='availableTriggerTypes'
                label='Type'
                disabled
              />
              <BaseInput
                :model-value='store.selectedTrigger.threshold'
                label='Threshold'
                placeholder='optional'
                @update:model-value='updateTriggerField(&quot;threshold&quot;, $event)'
              />
              <BaseSelect
                :model-value='store.selectedTrigger.speed'
                :options='[{value:&quot;&quot;, label:&quot;Default&quot;},{value:&quot;fast&quot;, label:&quot;Fast&quot;},{value:&quot;slow&quot;, label:&quot;Slow&quot;}]'
                label='Speed'
                @update:model-value='updateTriggerField(&quot;speed&quot;, $event || undefined)'
              />
            </div>
          </BaseCard>

          <!-- Direction/Settings -->
          <BaseCard title='Direction & Movement'>
            <div class='grid grid-cols-2 gap-4'>
              <BaseSelect
                v-if='store.selectedTrigger.type === &quot;swipe&quot;'
                :model-value='store.selectedTrigger.direction'
                :options='SwipeDirectionOptions'
                label='Direction'
                @update:model-value='updateTriggerField(&quot;direction&quot;, $event)'
              />
              <BaseSelect
                v-if='store.selectedTrigger.type === &quot;circle&quot;'
                :model-value='store.selectedTrigger.direction'
                :options='CircleDirectionOptions'
                label='Direction'
                @update:model-value='updateTriggerField(&quot;direction&quot;, $event)'
              />
              <BaseSelect
                v-if='[&quot;touchpad&quot;, &quot;touchscreen&quot;].includes(store.state.selectedDevice as string)'
                :model-value='store.selectedTrigger.fingers'
                :options='[{value:1, label:&quot;1 finger&quot;},{value:2, label:&quot;2 fingers&quot;},{value:3, label:&quot;3 fingers&quot;},{value:4, label:&quot;4 fingers&quot;}]'
                label='Fingers'
                @update:model-value='updateTriggerField(&quot;fingers&quot;, Number($event))'
              />
              <BaseSelect
                v-if='store.state.selectedDevice === &quot;mouse&quot;'
                :model-value='store.selectedTrigger.mouse_buttons?.[0]'
                :options='MouseButtonOptions'
                label='Mouse Button'
                placeholder='Any'
                @update:model-value='updateTriggerField(&quot;mouse_buttons&quot;, $event ? [$event] : undefined)'
              />
              <BaseCheckbox
                :model-value='store.selectedTrigger.lock_pointer'
                label='Lock Pointer'
                @update:model-value='updateTriggerField(&quot;lock_pointer&quot;, $event)'
              />
              <BaseCheckbox
                :model-value='store.selectedTrigger.bidirectional'
                label='Bidirectional'
                @update:model-value='updateTriggerField(&quot;bidirectional&quot;, $event)'
              />
            </div>
          </BaseCard>

          <!-- Actions -->
          <BaseCard title='Actions'>
            <div class='flex flex-col gap-4'>
              <div v-for='(action, index) in currentActions' :key='index' class='p-3 bg-gray-50 rounded-md border border-gray-200'>
                <div class='flex justify-between items-center mb-2'>
                  <span class='font-medium text-gray-700'>Action #{{ index + 1 }}</span>
                  <button
                    class='text-red-400 hover:text-red-600 text-sm'
                    @click='store.deleteAction(store.state.selectedDevice, store.state.selectedTriggerId, index)'
                  >
                    Delete
                  </button>
                </div>
                
                <div class='grid grid-cols-2 gap-3'>
                  <BaseSelect
                    :model-value='action.on'
                    :options='TriggerEventOptions'
                    label='On'
                    @update:model-value='store.updateAction(store.state.selectedDevice, store.state.selectedTriggerId, index, { on: $event })'
                  />
                  <BaseSelect
                    :model-value='action.command !== undefined ? &quot;command&quot; : action.input !== undefined ? &quot;input&quot; : action.shortcut !== undefined ? &quot;plasma-shortcut&quot; : action.time !== undefined ? &quot;sleep&quot; : &quot;command&quot;'
                    :options='[{value:&quot;command&quot;, label:&quot;Command&quot;},{value:&quot;input&quot;, label:&quot;Input&quot;},{value:&quot;plasma-shortcut&quot;, label:&quot;Plasma Shortcut&quot;},{value:&quot;sleep&quot;, label:&quot;Sleep&quot;}]'
                    label='Type'
                  />
                  
                  <div class='col-span-2'>
                    <BaseLabel v-if='action.command !== undefined'>Command</BaseLabel>
                    <BaseInput
                      v-if='action.command !== undefined'
                      :model-value='action.command'
                      @update:model-value='store.updateAction(store.state.selectedDevice, store.state.selectedTriggerId, index, { command: $event })'
                    />
                    
                    <BaseLabel v-if='action.shortcut !== undefined'>Shortcut</BaseLabel>
                    <BaseInput
                      v-if='action.shortcut !== undefined'
                      :model-value='action.shortcut'
                      placeholder='Alt+F4'
                      @update:model-value='store.updateAction(store.state.selectedDevice, store.state.selectedTriggerId, index, { shortcut: $event })'
                    />
                    
                    <BaseLabel v-if='action.time !== undefined'>Time (ms)</BaseLabel>
                    <BaseInput
                      v-if='action.time !== undefined'
                      :model-value='action.time'
                      type='number'
                      @update:model-value='store.updateAction(store.state.selectedDevice, store.state.selectedTriggerId, index, { time: Number($event) })'
                    />
                  </div>
                </div>
              </div>
              
              <BaseButton
                variant='secondary'
                @click='showNewActionForm = true'
              >
                + Add Action
              </BaseButton>
              
              <!-- New Action Form -->
              <div v-if='showNewActionForm' class='p-3 bg-gray-100 rounded-md'>
                <div class='flex flex-col gap-2'>
                  <BaseSelect
                    v-model='newActionOn'
                    :options='TriggerEventOptions'
                    label='On Event'
                  />
                  <BaseSelect
                    v-model='newActionType'
                    :options='[{value:&quot;command&quot;, label:&quot;Command&quot;},{value:&quot;input&quot;, label:&quot;Input&quot;},{value:&quot;plasma-shortcut&quot;, label:&quot;Plasma Shortcut&quot;},{value:&quot;sleep&quot;, label:&quot;Sleep&quot;}]'
                    label='Action Type'
                  />
                  <div class='flex gap-2'>
                    <BaseButton size='sm' @click='addNewAction'>Add</BaseButton>
                    <BaseButton size='sm' variant='ghost' @click='showNewActionForm = false'>Cancel</BaseButton>
                  </div>
                </div>
              </div>
            </div>
          </BaseCard>

          <!-- Options -->
          <BaseCard title='Options'>
            <div class='grid grid-cols-2 gap-4'>
              <BaseCheckbox
                :model-value='store.selectedTrigger.block_events'
                label='Block Events'
                @update:model-value='updateTriggerField(&quot;block_events&quot;, $event)'
              />
              <BaseCheckbox
                :model-value='store.selectedTrigger.clear_modifiers'
                label='Clear Modifiers'
                @update:model-value='updateTriggerField(&quot;clear_modifiers&quot;, $event)'
              />
              <BaseCheckbox
                :model-value='store.selectedTrigger.accelerated'
                label='Accelerated Delta'
                @update:model-value='updateTriggerField(&quot;accelerated&quot;, $event)'
              />
              <BaseCheckbox
                :model-value='store.selectedTrigger.set_last_trigger'
                label='Set Last Trigger'
                @update:model-value='updateTriggerField(&quot;set_last_trigger&quot;, $event)'
              />
            </div>
          </BaseCard>

          <!-- Delete Button -->
          <div class='flex justify-end'>
            <BaseButton variant='danger' @click='deleteCurrentTrigger'>
              Delete Trigger
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>