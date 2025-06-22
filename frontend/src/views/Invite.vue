<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useSocket } from '@/composables/useSocket'

const roomIdRef = ref<string>('')
const route = useRoute()
const router = useRouter()
const code = route.params.code as string
// const socket = new SocketService()
const { socket } = useSocket(roomIdRef)

onMounted(() => {
  socket.on('room-found', ({ roomId }) => {
    router.push(`/room/${roomId}`)
  })

  socket.on('invite-error', (msg: string) => {
    alert(msg)
    router.push('/')
  })

  socket.emit('join-invite', code)
})
</script>

<template>
  <div class="text-center p-10">
    <h1 class="text-xl">Подключение к приватному чату...</h1>
  </div>
</template>
