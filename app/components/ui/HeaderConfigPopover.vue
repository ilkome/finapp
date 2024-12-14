<template>
  <UPopover
    :popper="{ placement: 'bottom-end' }"
    class="ml-auto"
  >
    <UiItem3>
      <Icon name="lucide:settings-2" size="20" />
    </UiItem3>

    <template #panel="{ close }">
      <div class="grid gap-6 p-3">
        <BottomSheetClose @click="close" />
        <slot />
      </div>
    </template>
  </UPopover>
</template>
