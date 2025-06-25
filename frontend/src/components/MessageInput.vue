<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  onTyping?: () => undefined
  chatIsActive: boolean
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
  <div class="px-5 bg-white border border-gray-200 flex sticky bottom-0 w-full mx-auto">
    <input
      v-model="text"
      :disabled="chatIsActive"
      @keyup.enter="submit"
      type="text"
      placeholder="Сообщение…"
      class="flex-1 rounded- py-2 my-2 focus:outline-none"
    />
    <Transition>
      <button
        @click="submit"
        :disabled="chatIsActive"
        v-if="text.length"
        class="bg-blue-500 hover:bg-blue-600 text-white px-4 my-2 rounded-lg disabled:bg-gray-400"
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
