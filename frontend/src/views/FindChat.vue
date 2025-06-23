<template>
  <div class="flex items-center justify-center flex-col-reverse gap-10 h-screen bg-gray-50">
    <div class="p-4 border rounded shadow-md max-w-md mx-auto text-left bg-white">
      <h2 class="text-lg font-semibold mb-2">Статистика</h2>
      <p>Онлайн: {{ allOnlineUsers.length }}</p>
      <p>В чатах: {{ chattingUsers.length }}</p>
      <p>В поиске: {{ searchingUsers.length }}</p>
    </div>

    <div class="flex flex-col md:flex-row items-stretch justify-center gap-10">
      <div
        class="text-center flex flex-col justify-between w-full md:max-w-xs space-y-6 shadow-2xl bg-white shadow-gray-500/15 border border-black/10 p-10 rounded-lg"
      >
        <div class="space-y-3">
          <h1 class="text-3xl font-bold">Анонимный чат</h1>
          <p class="text-gray-500">Нажмите, чтобы найти случайного собеседника</p>
        </div>

        <div class="flex flex-col gap-2 items-center">
          <button
            @click="startSearch"
            :disabled="isSearching"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all w-full"
          >
            {{ isSearching ? 'Поиск...' : 'Найти собеседника' }}
          </button>

          <button
            v-if="isSearching"
            @click="cancelSearch"
            class="text-sm text-blue-600 underline hover:text-blue-800 transition"
          >
            Отмена
          </button>
        </div>

        <p v-if="errorMessage" class="text-red-500 h-5">{{ errorMessage }}</p>
      </div>
      <FriendChat />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSocket } from '@/composables/useSocket'
import FriendChat from '@/components/FriendChat.vue'

const roomIdRef = ref<string>('')
const { socket, allOnlineUsers, chattingUsers, searchingUsers, myId } = useSocket(roomIdRef)

const isSearching = ref(false)
const errorMessage = ref('')
const router = useRouter()

function startSearch() {
  errorMessage.value = ''
  isSearching.value = true
  socket.emit('find-room')
}

function cancelSearch() {
  isSearching.value = false
  errorMessage.value = ''
  socket.emit('cancel-search', { userId: myId.value })
}

socket.on('room-found', ({ roomId }) => {
  isSearching.value = false
  router.push(`/room/${roomId}`)
})

socket.on('waiting', () => {
  isSearching.value = true
})

socket.on('error', (msg: string) => {
  errorMessage.value = msg
  isSearching.value = false
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
