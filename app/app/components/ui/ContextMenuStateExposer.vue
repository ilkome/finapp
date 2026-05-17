<script setup lang="ts">
import { injectContextMenuRootContext } from 'reka-ui'

const ctx = injectContextMenuRootContext()

defineExpose({
  close: () => ctx.onOpenChange(false),
})
</script>

<template>
  <div hidden />
</template>
