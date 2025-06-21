<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSocket } from '@/composables/useSocket'
import MessageList from '@/components/MessageList.vue'
import MessageInput from '@/components/MessageInput.vue'

const route = useRoute()
const roomIdRef = ref(route.params.id as string)

const { messages, sendMessage, markAsRead, myId, notifyTyping, isTyping, socket } =
  useSocket(roomIdRef)
console.log(socket)

const isChatEnded = ref(false)

socket.on('chat-ended', () => {
  isChatEnded.value = true
})

function endChat() {
  console.log('Нажали завершить чат')
  socket.emit('end-chat', roomIdRef.value)
}

watch(
  () => messages[messages.length - 1],
  (last) => {
    if (!last || last.id === myId.value || last.status === 'read') return
    markAsRead(last.timestamp)
  },
  { immediate: true },
)
</script>
<template>
  <div class="flex flex-col h-screen">
    <MessageList :messages="messages" :myId="myId" />

    <div class="p-2 flex items-center justify-between">
      <button
        v-if="!isChatEnded"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        @click="endChat"
      >
        Завершить чат
      </button>

      <p v-if="isChatEnded" class="text-red-600 font-semibold">Чат завершён</p>
      <p v-else-if="isTyping" class="text-sm text-gray-400">печатает…</p>
    </div>

    <MessageInput v-if="!isChatEnded" @send="sendMessage" :onTyping="notifyTyping" />
  </div>
</template>
