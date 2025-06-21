import { ref, onBeforeUnmount, watch } from 'vue'
import type { Ref } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { useChatStore } from '@/stores/chat'

export function useSocket(roomIdRef: Ref<string>) {
  const chat = useChatStore()
  const socket: Socket = io('http://localhost:3000')

  const myId = ref(socket.id)
  const isTyping = ref(false)
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
      }
    },
    { immediate: true },
  )

  socket.on('connect', () => {
    myId.value = socket.id
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
    }, 1500)
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
      // создаём новый объект, копируем поля + меняем статус
      chat.messages[index] = {
        ...chat.messages[index],
        status: 'read',
      }
    }
  })

  function sendMessage(text) {
    const timestamp = Date.now()
    chat.addMessage({ id: socket.id, text, timestamp, status: 'sent' })
    socket.emit('send-message', { roomId: roomIdRef.value, message: text, messageId: timestamp })
  }

  function markAsRead(messageId: number) {
    console.log('🔥 [CLIENT] Emitting read-message for', messageId)
    socket.emit('read-message', {
      roomId: roomIdRef.value,
      messageId,
    })
  }

  function notifyTyping() {
    socket.emit('typing', roomIdRef.value)
  }

  onBeforeUnmount(() => {
    socket.disconnect()
    chat.clearMessages()
  })

  return {
    messages: chat.messages,
    sendMessage,
    markAsRead,
    myId,
    someId: myId.value,
    notifyTyping,
    isTyping,
    socket,
  }
}
