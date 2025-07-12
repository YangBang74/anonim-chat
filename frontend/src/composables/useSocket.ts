import { ref, onBeforeUnmount, watch, onMounted } from 'vue'
import type { Ref } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { useChatStore } from '@/stores/chat'
import router from '@/router'

export function useSocket(roomIdRef: Ref<string>) {
  const chat = useChatStore()

  function getOrCreateUserId(): string {
    const existingId = localStorage.getItem('user-id')
    if (existingId) return existingId
    const newId = crypto.randomUUID()
    localStorage.setItem('user-id', newId)
    return newId
  }

  const myId = ref(getOrCreateUserId())

  const socket: Socket = io(undefined, {
    auth: { userId: myId.value },
  })

  const isTyping = ref(false)
  const isChatEnded = ref(false)
  const onlineUsersInRoom = ref(new Set<string>())

  const allOnlineUsers = ref<string[]>([])
  const chattingUsers = ref<string[]>([])
  const searchingUsers = ref<string[]>([])

  let typingTimer: ReturnType<typeof setTimeout> | null = null

  function cleanup() {
    if (typingTimer) clearTimeout(typingTimer)
    socket.disconnect()
    chat.clearMessages()
  }

  watch(
    roomIdRef,
    (newRoomId, oldRoomId) => {
      if (oldRoomId) {
        socket.emit('leave-room', oldRoomId)
        chat.clearMessages()
        onlineUsersInRoom.value.clear()
      }
      if (newRoomId) {
        isChatEnded.value = false
        socket.emit('join-room', newRoomId)
        chat.setRoom(newRoomId)
      }
    },
    { immediate: true },
  )

  function sendMessage(text: string) {
    const messageId = Date.now()
    socket.emit('send-message', {
      roomId: roomIdRef.value,
      message: text,
      messageId,
      senderId: myId.value,
    })
  }

  function markAsRead(messageId: number) {
    socket.emit('read-message', {
      roomId: roomIdRef.value,
      messageId,
    })
  }

  function notifyTyping() {
    socket.emit('typing', roomIdRef.value)
  }

  function endChat() {
    socket.emit('end-chat', roomIdRef.value)
  }

  onMounted(() => {
    socket.on('chat-ended', () => {
      isChatEnded.value = true
      chat.clearMessages()
      setTimeout(() => {
        router.push('/find')
      }, 3000)
    })

    socket.on('receive-message', (msg) => {
      if (!chat.messages.find((m) => m.timestamp === msg.timestamp)) {
        chat.addMessage(msg)
      }
    })

    socket.on('user-typing', () => {
      isTyping.value = true
      if (typingTimer) clearTimeout(typingTimer)
      typingTimer = setTimeout(() => {
        isTyping.value = false
      }, 5000)
    })

    socket.on('system-message', (msg) => {
      chat.addMessage({
        id: 'system',
        text: msg.text,
        timestamp: msg.timestamp,
      })
    })

    socket.on('message-read', ({ messageId }) => {
      const index = chat.messages.findIndex((m) => m.timestamp === messageId)
      if (index !== -1) {
        chat.messages[index] = {
          ...chat.messages[index],
          status: 'read',
        }
      }
    })

    socket.on('online-users-in-room', (users: string[]) => {
      onlineUsersInRoom.value = new Set(users)
    })

    socket.on('user-online', ({ userId }) => {
      onlineUsersInRoom.value.add(userId)
    })

    socket.on('user-offline', ({ userId }) => {
      onlineUsersInRoom.value.delete(userId)
    })

    socket.on('status-update', ({ onlineUsers, chattingUsers: c, searchingUsers: s }) => {
      allOnlineUsers.value = onlineUsers
      chattingUsers.value = c
      searchingUsers.value = s
    })
  })

  onBeforeUnmount(() => {
    cleanup()
  })

  return {
    messages: chat.messages,
    myId,
    isTyping,
    isChatEnded,
    onlineUsersInRoom,
    allOnlineUsers,
    chattingUsers,
    searchingUsers,
    socket,
    sendMessage,
    markAsRead,
    endChat,
    notifyTyping,
  }
}
