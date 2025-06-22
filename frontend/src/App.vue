<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import LayoutDefault from '@/layouts/default.vue'
import LayoutWithout from '@/layouts/without.vue'

const route = useRoute()

const layout = computed(() => {
  return route.meta.layout === 'without' ? LayoutWithout : LayoutDefault
})
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
