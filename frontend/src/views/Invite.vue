<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { onMounted, ref } from 'vue'
import { useSocket } from '@/composables/useSocket'

const roomIdRef = ref<string>('')
const isError = ref<boolean>(false)
const route = useRoute()
const router = useRouter()
const code = route.params.code as string

const { socket } = useSocket(roomIdRef)

onMounted(() => {
  socket.on('room-found', ({ roomId }) => {
    router.push(`/room/${roomId}`)
  })

  socket.on('invite-error', () => {
    isError.value = true
  })

  socket.emit('join-invite', code)
})
</script>

<template>
  <div class="fixed inset-0 flex items-center justify-center bg-gray-200 bg-opacity-50 z-50">
    <Teleport to="body" v-if="isError">
      <div
        class="fixed inset-0 flex items-center text-center max-w-100 mx-auto justify-center bg-opacity-50 z-50"
      >
        <div class="bg-white p-5 rounded-lg shadow-lg">
          <h2 class="text-lg font-bold mb-3">Ошибка</h2>
          <p>Не удалось присоединиться к чату. Пожалуйста, проверьте ссылку и попробуйте снова.</p>
          <button @click="router.push('/')" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
            Вернуться на главную
          </button>
        </div>
      </div>
    </Teleport>
    <div v-else class="bg-white p-5 rounded-lg shadow-lg">
      <h2 class="text-lg font-bold mb-3">Присоединение к чату...</h2>
      <p>Пожалуйста, подождите, пока мы подключим вас к приватной комнате.</p>
    </div>
  </div>
</template>
