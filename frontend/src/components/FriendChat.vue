<script setup lang="ts">
import { ref } from 'vue'
import { useSocket } from '@/composables/useSocket'
import { Copy, CopyCheck } from 'lucide-vue-next'

const roomIdRef = ref<string>('')
const { socket } = useSocket(roomIdRef)

const isCreatingInvite = ref(false)
const inviteLink = ref('')
const inviteError = ref('')
const copied = ref(false)

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

socket.on('invite-created', (code: string) => {
  inviteLink.value = `${window.location.origin}/invite/${code}`
  isCreatingInvite.value = false
})

socket.on('invite-error', (msg: string) => {
  inviteError.value = msg
  isCreatingInvite.value = false
})
</script>
<template>
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
            <a
              :href="inviteLink"
              target="_blank"
              class="underline hover:text-green-800 line-clamp-1 overflow-hidden"
            >
              {{ inviteLink }}
            </a>
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
</template>
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
