<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  onTyping?: () => void
}>()

const emit = defineEmits<{
  (e: 'send', message: string): void
}>()

const text = ref('')

watch(text, () => {
  if (props.onTyping) props.onTyping()
})

function submit() {
  if (text.value.trim()) {
    emit('send', text.value.trim())
    text.value = ''
  }
}
</script>
<template>
  <div class="p-2 border-t border-gray-300 flex shadow">
    <input
      v-model="text"
      @keyup.enter="submit"
      type="text"
      placeholder="Сообщение…"
      class="flex-1 rounded- px-3 py-2 focus:outline-none"
    />
    <Transition>
      <button
        @click="submit"
        v-if="text.length"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-lg"
      >
        Отправить
      </button>
    </Transition>
  </div>
</template>
<style scoped>
.v-enter-active,
.v-leave-active {
  transition: 0.1s ease;
}

.v-enter-from,
.v-leave-to {
  transform: scale(0.5);
  opacity: 0;
}
</style>
