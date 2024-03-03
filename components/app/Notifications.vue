<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()
</script>

<template lang="pug">
//- Notifications(
//-   :max="2"
//-   :position="width <= 1024 ? 'top center' : 'top left'"
//-   :width="width <= 1024 ? '94%' : '380px'"
//-   classes="notifications"
//- )
</template>
