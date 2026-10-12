<script setup lang="ts">
defineEmits<{
  closed: []
}>()
</script>

<template>
  <Teleport to="body">
    <Drawer
      isShow
      contentClass="bottom-sheet-drag-classes-custom min-h-[50dvh]"
      @closed="$emit('closed')"
    >
      <template #handler>
        <BottomSheetHandler />
      </template>

      <template #default="{ close }">
        <div class="drawer-content">
          <slot :close="close" />
        </div>
      </template>
    </Drawer>
  </Teleport>
</template>
