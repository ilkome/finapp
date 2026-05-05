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
      <template #handler="{ close }">
        <BottomSheetHandler />
        <BottomSheetClose @click="close" />
      </template>

      <template #default="{ close }">
        <div class="bottomSheetContent">
          <slot :close="close" />
        </div>
      </template>
    </BottomSheet>
  </Teleport>
</template>
