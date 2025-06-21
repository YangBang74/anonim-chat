import { ref, onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { useChatStore } from '@/stores/chat'

export function useSocket(roomIdRef: Ref<string>) {
  const chat = useChatStore()

  // Получаем или создаём userId
  function getOrCreateUserId(): string {
    const existingId = localStorage.getItem('user-id')
    if (existingId) return existingId
    const newId = crypto.randomUUID()
    localStorage.setItem('user-id', newId)
    return newId
  }

  const myId = ref(getOrCreateUserId())

  const socket: Socket = io('http://localhost:3000', {
    auth: {
      userId: myId.value,
    },
  })

  const isTyping = ref(false)
  const isChatEnded = ref(false)
  const onlineUsers = ref<Set<string>>(new Set())

  let typingTimer: ReturnType<typeof setTimeout> | null = null

  watch(
    roomIdRef,
    (newRoomId, oldRoomId) => {
      if (oldRoomId) {
        socket.emit('leave-room', oldRoomId)
        chat.clearMessages()
      }
      if (newRoomId) {
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
    localStorage.removeItem('user-id')
    socket.emit('end-chat', roomIdRef.value)
  }

  socket.on('chat-ended', () => {
    isChatEnded.value = true
    chat.clearMessages()
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

  socket.on('user-online', ({ userId }) => {
    onlineUsers.value.add(userId)
    console.log('Пользователь онлайн:', userId)
  })

  socket.on('user-offline', ({ userId }) => {
    onlineUsers.value.delete(userId)
    console.log('Пользователь оффлайн:', userId)
  })

  socket.on('online-users', (users: string[]) => {
    onlineUsers.value = new Set(users)
    console.log('Список онлайн пользователей:', users)
  })

  onBeforeUnmount(() => {
    socket.disconnect()
    chat.clearMessages()
  })

  return {
    messages: chat.messages,
    sendMessage,
    markAsRead,
    myId,
    endChat,
    notifyTyping,
    isTyping,
    isChatEnded,
    socket,
    onlineUsers,
  }
}
