<template>
  <div class="flex flex-col h-screen">
    <!-- сообщения -->
    <MessageList :messages="messages" :myId="myId" />

    <div class="p-2 flex items-center justify-between">
      <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600" @click="endChat">
        Завершить чат
      </button>
      <p v-if="isTyping" class="text-sm text-gray-400">печатает…</p>
    </div>

    <MessageInput @send="sendMessage" :onTyping="notifyTyping" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSocket } from '@/composables/useSocket'
import { ref, watch } from 'vue'
import MessageList from '@/components/MessageList.vue'
import MessageInput from '@/components/MessageInput.vue'
import { useRoute } from 'vue-router'

const router = useRouter()
const roomId = useRoute().params.id as string
const roomIdRef = ref(roomId)

const { messages, sendMessage, markAsRead, myId, notifyTyping, isTyping } = useSocket(roomIdRef)

watch(
  () => messages[messages.length - 1],
  (last) => {
    if (!last || last.id === myId.value || last.status === 'read') return
    markAsRead(last.timestamp)
  },
  { immediate: true },
)

function endChat() {
  localStorage.removeItem('user-id')
  router.push('/') // можно направить обратно на главную
}
</script>
