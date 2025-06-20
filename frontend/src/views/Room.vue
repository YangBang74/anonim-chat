<template>
  <div class="h-screen flex flex-col">
    <MessageList :messages="messages" :userProfiles="userProfiles" :myId="myId" />

    <p v-if="isTyping" class="text-xs text-gray-400 px-4 pb-1">печатает…</p>
    <MessageInput @send="sendMessage" :onTyping="notifyTyping" />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useSocket } from '@/composables/useSocket'
import MessageList from '@/components/MessageList.vue'
import MessageInput from '@/components/MessageInput.vue'

const roomId = useRoute().params.id as string

const { messages, sendMessage, notifyTyping, isTyping, myId } = useSocket(roomId)
</script>
