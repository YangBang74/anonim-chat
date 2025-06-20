<template>
  <div class="w-full flex-1 overflow-auto p-4 space-y-2 flex flex-col">
    <template v-for="msg in messages" :key="msg.timestamp + msg.id">
      <div v-if="msg.id === 'system'" class="text-center text-sm text-gray-400 italic">
        {{ msg.text }}
      </div>
      <div
        v-else
        :class="[
          'max-w-xs p-2 rounded flex flex-col',
          msg.id === myId
            ? 'bg-blue-500 text-white self-end'
            : 'bg-gray-200 text-gray-900 self-start',
        ]"
      >
        <div
          class="text-xs mb-1 w-full"
          :class="msg.id === myId ? 'text-gray-300' : 'text-gray-500'"
        >
          {{ formatTime(msg.timestamp) }}
        </div>
        <div class="w-full">{{ msg.text }}</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { ChatMessage } from '@/stores/chat'

const props = defineProps<{
  messages: ChatMessage[]
  myId: string
}>()

function formatTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const diffSeconds = Math.floor(diff / 1000)
  const diffMinutes = Math.floor(diff / 60000)
  const diffHours = Math.floor(diff / 3600000)

  if (diffSeconds < 10) return 'Только что'
  if (diffSeconds < 60) return `${diffSeconds} сек назад`
  if (diffMinutes < 60) return `${diffMinutes} мин назад`
  if (diffHours < 24) return `${diffHours} ч назад`

  const date = new Date(timestamp)
  return date.toLocaleString([], {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
