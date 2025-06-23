<template>
  <div class="flex items-center justify-center flex-col-reverse gap-10 h-screen bg-gray-50">
    <div class="p-4 border rounded shadow-md max-w-md mx-auto text-left bg-white">
      <h2 class="text-lg font-semibold mb-2">Статистика</h2>
      <p>Онлайн: {{ allOnlineUsers.length }}</p>
      <p>В чатах: {{ chattingUsers.length }}</p>
      <p>В поиске: {{ searchingUsers.length }}</p>
    </div>

    <div class="flex flex-col md:flex-row items-stretch justify-center gap-10">
      <!-- Поиск собеседника -->
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

      <!-- Приглашение друга -->
      <div
        class="text-center flex flex-col justify-between w-full md:max-w-xs space-y-6 shadow-2xl bg-white shadow-gray-500/15 border border-black/10 p-10 rounded-lg"
      >
        <div class="space-y-3">
          <h1 class="text-3xl font-bold">Чат с друзьями</h1>
          <p class="text-gray-500">Создайте приватную комнату и отправьте ссылку другу</p>
        </div>

        <Transition name="fade" mode="out-in">
          <div v-if="inviteLink" class="flex flex-col gap-2 w-full">
            <div class="flex items-stretch justify-between bg-gray-100 rounded-md">
              <p class="text-sm text-green-700 break-all mr-2 px-2 py-2">
                <RouterLink
                  :to="inviteLink"
                  target="_blank"
                  class="underline hover:text-green-800 line-clamp-1 overflow-hidden"
                >
                  {{ inviteLink }}
                </RouterLink>
              </p>
              <button
                @click="copyInviteLink"
                class="bg-gray-300 hover:bg-gray-400 aspect-[1/1] h-full text-gray-800 font-bold py-2 px-2 rounded text-sm"
              >
                <Copy v-if="!copied" />
                <CopyCheck v-else />
              </button>
            </div>

            <button
              @click="clearInvite"
              class="text-sm text-red-600 underline hover:text-red-800 transition"
            >
              Удалить ссылку
            </button>

            <p v-if="inviteError" class="text-red-500">{{ inviteError }}</p>
          </div>

          <button
            v-else
            @click="createInvite"
            :disabled="isCreatingInvite"
            class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all w-full"
          >
            {{ isCreatingInvite ? 'Создание...' : 'Создать ссылку' }}
          </button>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSocket } from '@/composables/useSocket'
import { Copy, CopyCheck } from 'lucide-vue-next'
import SearchOptions from '@/components/SearchOptions.vue'

const roomIdRef = ref<string>('')
const { socket, allOnlineUsers, chattingUsers, searchingUsers, myId } = useSocket(roomIdRef)

const isSearching = ref(false)
const isCreatingInvite = ref(false)
const inviteLink = ref('')
const errorMessage = ref('')
const inviteError = ref('')
const router = useRouter()
const copied = ref(false)

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

function createInvite() {
  inviteError.value = ''
  inviteLink.value = ''
  isCreatingInvite.value = true
  copied.value = false
  socket.emit('create-invite')
}

function clearInvite() {
  if (inviteLink.value) {
    const code = inviteLink.value.split('/').pop()
    if (code) socket.emit('remove-invite', code)
  }
  inviteLink.value = ''
  inviteError.value = ''
  copied.value = false
}

function copyInviteLink() {
  navigator.clipboard.writeText(inviteLink.value).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
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

socket.on('invite-created', (code: string) => {
  inviteLink.value = `${window.location.origin}/invite/${code}`
  isCreatingInvite.value = false
})

socket.on('invite-error', (msg: string) => {
  inviteError.value = msg
  isCreatingInvite.value = false
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
