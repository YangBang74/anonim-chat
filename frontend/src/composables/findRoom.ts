// src/composables/findRoom.ts
import { io, Socket } from 'socket.io-client'

type EventCallback = (...args: any[]) => void

export class SocketService {
  private socket: Socket
  private listeners: Map<string, EventCallback[]> = new Map()

  constructor() {
    const userId = this.getOrCreateUserId()

    this.socket = io('http://localhost:3000', {
      auth: { userId },
      transports: ['websocket'],
    })

    this.socket.on('room-found', (payload: { roomId: string }) => {
      this.emitLocal('room-found', payload.roomId)
    })
    this.socket.on('waiting', () => this.emitLocal('waiting'))
    this.socket.on('error', (msg: string) => this.emitLocal('error', msg))
  }

  private getOrCreateUserId(): string {
    const existing = localStorage.getItem('user-id')
    if (existing) return existing
    const newId = crypto.randomUUID()
    localStorage.setItem('user-id', newId)
    return newId
  }

  startSearch() {
    this.socket.emit('find-room')
  }

  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) this.listeners.set(event, [])
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) return
    const callbacks = this.listeners.get(event)!
    this.listeners.set(
      event,
      callbacks.filter((cb) => cb !== callback),
    )
  }

  private emitLocal(event: string, ...args: any[]) {
    if (!this.listeners.has(event)) return
    for (const cb of this.listeners.get(event)!) {
      cb(...args)
    }
  }

  disconnect() {
    this.socket.disconnect()
    this.listeners.clear()
  }
}
