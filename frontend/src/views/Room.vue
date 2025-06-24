<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSocket } from '@/composables/useSocket'
import MessageList from '@/components/MessageList.vue'
import MessageInput from '@/components/MessageInput.vue'
import without from '@/layouts/without.vue'

const route = useRoute()
const roomIdRef = ref((route.params.id as string) || '')

const {
  messages,
  sendMessage,
  markAsRead,
  myId,
  notifyTyping,
  isTyping,
  endChat,
  isChatEnded,
  onlineUsersInRoom,
} = useSocket(roomIdRef)

function handleEndChat() {
  endChat()
}

watch(
  () => (messages.length > 0 ? messages[messages.length - 1] : null),
  (lastMessage) => {
    if (!lastMessage || lastMessage.id === myId.value || lastMessage.status === 'read') {
      return
    }
    markAsRead(lastMessage.timestamp)
  },
  { immediate: true, deep: true }, 
)

const otherUserId = computed(() => {
  return [...onlineUsersInRoom.value].find((id) => id !== myId.value)
})

const isOtherUserOnline = computed(() => {
  return [...onlineUsersInRoom.value].some((id) => id !== myId.value)
})
</script>

<template>
  <without>
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
                class="text-sm font-medium transition-colors duration-300"
              >
                {{ isOtherUserOnline ? 'В сети' : 'Вне сети' }}
              </p>
              <p v-if="isTyping && isOtherUserOnline" class="text-sm text-gray-400 animate-pulse">
                печатает…
              </p>
            </div>
            <div>
              <p v-if="isChatEnded" class="text-red-600 font-semibold py-2">Чат завершён</p>
              <button
                v-if="!isChatEnded"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                @click="handleEndChat"
              >
                Завершить чат
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col h-full container">
      <MessageList :messages="messages" :myId="myId" />

      <Transition name="fade">
        <MessageInput v-if="!isChatEnded" @send="sendMessage" :onTyping="notifyTyping" />
      </Transition>
    </div>
  </without>
</template>

<style scoped>
.hero {
  background-image: url('@/assets/images/hero-bg.webp');
  background-size: cover;
  background-position: center;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
