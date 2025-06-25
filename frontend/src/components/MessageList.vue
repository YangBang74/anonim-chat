<script setup lang="ts">
import { defineProps, onMounted, ref, watch, nextTick } from 'vue'
import type { ChatMessage } from '@/stores/chat'
import { Check, CheckCheck } from 'lucide-vue-next'

const props = defineProps<{
  messages: ChatMessage[]
  myId: string
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
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div
    ref="scrollContainer"
    class="w-full flex-1 overflow-auto p-4 space-y-2 flex flex-col scrollbar-custom"
  >
    <template v-for="msg in messages" :key="msg.timestamp + msg.id">
      <div
        v-if="msg.id != 'system'"
        :class="[
          'max-w-[75%] px-4 py-2 rounded-2xl flex flex-col relative',
          msg.id === myId
            ? 'bg-blue-500 text-white self-end rounded-br-none'
            : 'bg-gray-200 text-gray-900 self-start rounded-bl-none',
        ]"
      >
        <div class="whitespace-pre-wrap break-words">{{ msg.text }}</div>

        <div
          class="relative flex items-center justify-end gap-1 text-[0.6875rem]"
          :class="msg.id === myId ? 'right-[-10px]' : 'right-[-5px]'"
        >
          <span :class="msg.id === myId ? 'text-gray-200' : 'text-gray-500'">
            {{ formatTime(msg.timestamp) }}
          </span>

          <span v-if="msg.id === myId" class="inline-flex items-center">
            <Check v-if="msg.status !== 'read'" class="w-4 h-4 text-gray-200" />
            <CheckCheck v-else class="w-4 h-4 text-white" />
          </span>
        </div>
      </div>
    </template>
  </div>
</template>
<style>
.scrollbar-custom {
  scrollbar-width: thin;
  scrollbar-color: rgba(56, 56, 56, 0.4) transparent;
}

/* Chrome, Edge, Safari */
.scrollbar-custom::-webkit-scrollbar {
  width: 0.3125rem;
  height: 1.25rem;
}

.scrollbar-custom::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-custom::-webkit-scrollbar-thumb {
  background-color: rgba(100, 116, 139, 0.4);
  border-radius: 1.25rem;
  transition: background-color 0.3s ease;
}

.scrollbar-custom:hover::-webkit-scrollbar-thumb {
  transition: 0.2s;
  background-color: rgba(0, 0, 0, 0.6);
}
</style>
