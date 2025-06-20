<template>
  <div class="h-screen flex flex-col">
    <MessageList :messages="messages" :myId="myId" />
    <p v-if="isTyping" class="text-xs text-gray-400 px-4 pb-1">Пользователь печатает…</p>
    <MessageInput @send="sendMessage" :onTyping="notifyTyping" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useSocket } from '@/composables/useSocket'
import MessageList from '@/components/MessageList.vue'
import MessageInput from '@/components/MessageInput.vue'

const route = useRoute()
const roomId = route.params.id as string

const { messages, sendMessage, myId, notifyTyping, isTyping } = useSocket(roomId)
</script>
