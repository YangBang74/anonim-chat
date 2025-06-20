<template>
  <div class="h-screen flex items-center justify-center">
    <div class="space-y-4 text-center">
      <input
        v-model="roomId"
        type="text"
        placeholder="ID комнаты"
        class="border rounded p-2 w-64"
      />
      
      <button @click="join" class="bg-green-500 text-white px-4 py-2 rounded">
        Войти в комнату
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const roomId = ref('')
const router = useRouter()

let isTyping = ref(false)
let notifyTyping = () => {}

function joinRoom() {
  if (!roomId.value.trim()) return
  const socket = useSocket(roomId.value.trim())
  messages = socket.messages
  sendMessage = socket.sendMessage
  isTyping = socket.isTyping
  notifyTyping = socket.notifyTyping
  joined.value = true
}

function join() {
  if (roomId.value.trim()) {
    router.push({ name: 'Room', params: { id: roomId.value.trim() } })
  }
}
</script>
