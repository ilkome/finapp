<script setup lang="ts">
defineEmits<{
  closed: []
}>()
</script>

<template>
  <Teleport to="body">
    <BottomSheet
      isShow
      dragClassesCustom="bottomSheetDragClassesCustom min-h-[50dvh]"
      @closed="$emit('closed')"
    >
      <template #handler>
        <BottomSheetHandler />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <slot :close="close" />
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
