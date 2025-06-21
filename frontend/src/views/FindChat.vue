<template>
  <div class="flex items-center justify-center h-screen">
    <div class="text-center space-y-6">
      <h1 class="text-3xl font-bold">Анонимный чат</h1>
      <p class="text-gray-500">Нажмите, чтобы найти собеседника</p>

      <button
        @click="startSearch"
        :disabled="isSearching"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {{ isSearching ? 'Поиск...' : 'Найти собеседника' }}
      </button>

      <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { SocketService } from '@/composables/findRoom'

const isSearching = ref(false)
const errorMessage = ref('')
const router = useRouter()
const socket = new SocketService()

function onRoomFound(roomId: string) {
  isSearching.value = false
  router.push(`/room/${roomId}`)
}

function onWaiting() {
  isSearching.value = true
}

function onError(msg: string) {
  isSearching.value = false
  errorMessage.value = msg
}

onMounted(() => {
  socket.on('room-found', onRoomFound)
  socket.on('waiting', onWaiting)
  socket.on('error', onError)
})

onBeforeUnmount(() => {
  socket.off('room-found', onRoomFound)
  socket.off('waiting', onWaiting)
  socket.off('error', onError)
  socket.disconnect()
})

function startSearch() {
  errorMessage.value = ''
  isSearching.value = true
  socket.startSearch()
}
</script>
