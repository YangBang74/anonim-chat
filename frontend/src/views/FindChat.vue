<template>
  <div class="flex items-center justify-center flex-col-reverse gap-10 h-screen">
    <div class="p-4 border rounded shadow max-w-md mx-auto text-left">
      <h2 class="text-xl font-bold mb-2">Состояние пользователей</h2>
      <p>👥 Онлайн: {{ allUsers.length }}</p>
      <p>💬 В чатах: {{ chattingUsers.length }}</p>
      <p>⌛ В поиске: {{ searchingUsers.length }}</p>

      <div class="mt-3 text-sm text-gray-600">
        <p><b>Онлайн:</b> {{ allUsers.join(', ') }}</p>
        <p><b>В чатах:</b> {{ chattingUsers.join(', ') }}</p>
        <p><b>Ищут:</b> {{ searchingUsers.join(', ') }}</p>
      </div>
    </div>
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
import { useSocket } from '@/composables/useSocket'
import { useRoute } from 'vue-router'

const route = useRoute()
const roomIdRef = ref(route.params.id as string)
const { allUsers, chattingUsers, searchingUsers } = useSocket(roomIdRef)

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
