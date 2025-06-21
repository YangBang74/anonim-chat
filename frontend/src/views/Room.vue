<template>
  <div class="h-screen flex flex-col">
    <MessageList :messages="messages" :myId="myId" />

    <p v-if="isTyping" class="text-xs text-gray-400 px-4 pb-1">печатает…</p>
    <MessageInput @send="sendMessage" :onTyping="notifyTyping" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useSocket } from '@/composables/useSocket'
import MessageList from '@/components/MessageList.vue'
import MessageInput from '@/components/MessageInput.vue'

const roomId = useRoute().params.id as string
const roomIdRef = ref(roomId)

const { messages, sendMessage, notifyTyping, isTyping, myId, markAsRead, someId } =
  useSocket(roomIdRef)
console.log('messages:', messages)

watch(
  () => {
    const msgs = messages // без .value
    return msgs.length > 0 ? msgs[msgs.length - 1] : null
  },
  (last) => {
    if (!last) return
    if (last.id === someId || last.status === 'read') return
    markAsRead(last.timestamp)
  },
  { immediate: true },
)
</script>
