<template>
  <div ref="scrollContainer" class="w-full flex-1 overflow-auto p-4 space-y-2 flex flex-col">
    <template v-for="msg in messages" :key="msg.timestamp + msg.id">
      <div v-if="msg.id === 'system'" class="text-center text-sm text-gray-400 italic">
        {{ msg.text }}
      </div>
      <div
        v-else
        :class="[
          'max-w-xs p-2 pb-6 px-4 rounded-2xl flex flex-col relative',
          msg.id === myId
            ? 'bg-blue-500 text-white self-end rounded-br-none'
            : 'bg-gray-200 text-gray-900 self-start rounded-bl-none',
        ]"
      >
        <div class="w-full">{{ msg.text }}</div>
        <div
          class="text-xs mb-1 absolute inline-block"
          :class="
            msg.id === myId ? 'text-gray-300 right-3 bottom-1' : 'text-gray-500 left-3 bottom-1'
          "
        >
          {{ formatTime(msg.timestamp) }}
        </div>
        <div v-if="msg.id === myId" class="text-[10px] text-right mt-1">
          {{ msg.status === 'read' ? 'Прочитано' : 'Отправлено' }}
          {{ msg.status }}
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref, watch, nextTick } from 'vue'
import type { ChatMessage } from '@/stores/chat'

const props = defineProps<{
  messages: ChatMessage[]
  myId: unknown
}>()

const scrollContainer = ref<HTMLElement | null>(null)

function scrollToBottom() {
  nextTick(() => {
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = scrollContainer.value.scrollHeight
    }
  })
}

onMounted(scrollToBottom)
watch(() => props.messages.length, scrollToBottom)

function formatTime(timestamp: number): string {
  const now = Date.now()

  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>
