<script setup lang="ts">
const isShow = ref(false)
</script>

<template>
  <Teleport to="body">
    <BaseBottomSheet3
      v-if="isShow"
      :isShow="isShow"
      drugClassesCustom="h-[50vh] bg-item-3"
      @closed="() => isShow = false"
    >
      <template #handler="{ close }">
        <BaseBottomSheetHandler />
        <BaseBottomSheetClose @onClick="close" />
      </template>
    </BaseBottomSheet3>
  </Teleport>

  <!-- <div class="fixed left-0 top-0 inset-0 size-full" @click.prevent="isShow = !isShow">
    isShow
  </div> -->
</template>
