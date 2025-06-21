<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSocket } from '@/composables/useSocket'
import MessageList from '@/components/MessageList.vue'
import MessageInput from '@/components/MessageInput.vue'

const roomIdRef = ref(useRoute().params.id as string)
const { messages, sendMessage, notifyTyping, isTyping, myId, markAsRead } = useSocket(roomIdRef)

// 1. Отбираем только "чужие" сообщения, без системных
const incomingMessages = computed(() =>
  messages.filter((m) => m.id !== myId.value && m.id !== 'system'),
)

// 2. Наблюдаем за последним из incomingMessages
watch(
  () => incomingMessages.value[incomingMessages.value.length - 1],
  (last) => {
    if (!last || last.status === 'read') return
    console.log('🔥 markAsRead for', last.timestamp)
    markAsRead(last.timestamp)
  },
  { immediate: true },
)
</script>

<template>
  <div class="h-screen flex flex-col">
    <MessageList :messages="messages" :myId="myId" />
    <p v-if="isTyping" class="text-xs text-gray-400 px-4 pb-1">печатает…</p>
    <MessageInput @send="sendMessage" :onTyping="notifyTyping" />
  </div>
</template>
