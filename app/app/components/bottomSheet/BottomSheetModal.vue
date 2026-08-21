<script setup lang="ts">
defineEmits<{
  closed: []
}>()
</script>

<template>
  <Teleport to="body">
    <BottomSheet
      isShow
      dragClassesCustom="bottom-sheet-drag-classes-custom min-h-[50dvh]"
      @closed="$emit('closed')"
    >
      <template #handler>
        <BottomSheetHandler />
      </template>

      <template #default="{ close }">
        <div class="bottom-sheet-content">
          <slot :close="close" />
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
