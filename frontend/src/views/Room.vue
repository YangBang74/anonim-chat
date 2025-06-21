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
  <div class="shadow-xl py-1 my-auto">
    <div class="container">
      <div class="flex items-center justify-between gap-5">
        <div class="p-2 w-full flex items-center justify-between">
          <div class="flex items-center my-2">
            <p v-if="isChatEnded" class="text-red-600 font-semibold">Чат завершён</p>
            <p v-else-if="isTyping" class="text-sm text-gray-400">печатает…</p>
          </div>
          <button
            v-if="!isChatEnded"
            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            @click="endChat"
          >
            Завершить чат
          </button>
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
