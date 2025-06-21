<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSocket } from '@/composables/useSocket'
import MessageList from '@/components/MessageList.vue'
import MessageInput from '@/components/MessageInput.vue'

const props = defineProps<{
  id: string
}>()
const route = useRoute()
const roomIdRef = ref(route.params.id as string)

const {
  messages,
  sendMessage,
  markAsRead,
  myId,
  notifyTyping,
  isTyping,
  socket,
  endChat,
  onlineUsers,
} = useSocket(roomIdRef)

const isChatEnded = ref(false)

socket.on('chat-ended', () => {
  isChatEnded.value = true
})

function handleEndChat() {
  endChat()
}

watch(
  () => messages[messages.length - 1],
  (last) => {
    if (!last || last.id === myId.value || last.status === 'read') return
    markAsRead(last.timestamp)
  },
  { immediate: true },
)

const otherUserId = computed(() => {
  return [...onlineUsers.value].find((id) => id !== myId.value)
})

const isOtherUserOnline = computed(() => {
  return [...onlineUsers.value].some((id) => id !== myId.value)
})
</script>
<template>
  <div class="shadow-xl py-1 my-auto">
    <div class="container">
      <div class="flex items-center justify-between gap-5">
        <div class="p-2 w-full flex items-center justify-between">
          <div class="flex items-center my-2 gap-4">
            <p
              :class="{
                'text-green-600': isOtherUserOnline,
                'text-gray-400': !isOtherUserOnline,
              }"
              class="text-sm font-medium"
            >
              {{ isOtherUserOnline ? 'В сети' : 'Вне сети' }}
            </p>

            <p v-if="isTyping" class="text-sm text-gray-400">печатает…</p>
          </div>
          <div>
            <p v-if="isChatEnded" class="text-red-600 font-semibold py-2">Чат завершён</p>
            <button
              v-if="!isChatEnded"
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              @click="handleEndChat"
            >
              Завершить чат
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="flex flex-col h-screen container">
    <MessageList :messages="messages" :myId="myId" />
    <Transition>
      <MessageInput :chatIsActive="isChatEnded" @send="sendMessage" :onTyping="notifyTyping" />
    </Transition>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  transform: scale(0.5);
  opacity: 0;
}
</style>
