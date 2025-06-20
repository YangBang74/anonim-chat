<template>
  <div class="w-full flex-1 overflow-auto p-4 space-y-2 flex flex-col">
    <div
      v-for="msg in messages"
      :key="msg.timestamp + msg.id"
      :class="[
        'max-w-xs p-2 rounded flex flex-col',
        msg.id === myId
          ? 'bg-blue-500 text-white self-end'
          : 'bg-gray-200 text-gray-900 self-start',
      ]"
      class="flex"
    >
      <div class="text-xs text-gray-300 mb-1 w-full" v-if="msg.id === myId">
        {{ formatTime(msg.timestamp) }}
      </div>
      <div class="text-xs text-gray-500 mb-1 w-full" v-else>{{ formatTime(msg.timestamp) }}</div>
      <div class="w-full">{{ msg.text }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import type { ChatMessage } from '@/stores/chat'

const props = defineProps<{
  messages: ChatMessage[]
  myId: string | number
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
