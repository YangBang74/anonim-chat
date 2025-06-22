<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import Default from './layouts/default.vue'

const route = useRoute()

const layouts = {
  Default,
}

const layout = computed(() => {
  return layouts[route.meta.layout] || Default
})
</script>

<template>
  <component :is="layout">
    <router-view />
  </component>
</template>
