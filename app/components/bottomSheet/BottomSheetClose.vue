<template>
  <div
    class="bg-item-5 hover:bg-item-6 absolute right-1 top-1 z-[3] flex size-8 items-center justify-center rounded-full transition ease-in-out"
    @click="$emit('onClick')"
  >
    <Icon
      name="lucide:x"
      color="text-2"
      size="22"
    />
  </div>
</template>
